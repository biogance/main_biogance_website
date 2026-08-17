"use client"

import { useState, useEffect, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FlagImage, defaultCountries, parseCountry } from 'react-international-phone';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BASE_URL } from '../../API/API';
import { lockBodyScroll, unlockBodyScroll } from './ScrollLock';

const getDialCodeByIso2 = (iso2) => {
  const country = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
  return country ? `+${parseCountry(country).dialCode}` : '';
};

// Flag + dial code box, with a separate number field and a searchable
// country dropdown — same component as UserProfile.jsx's PhoneFieldBox.
function PhoneFieldBox({ iso2, onCountryChange, value, onChange, onBlur, error }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const dialCode = getDialCodeByIso2(iso2 || 'fr');

  const filteredCountries = defaultCountries
    .map((c) => parseCountry(c))
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.dialCode.includes(q);
    });

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      <div
        ref={wrapRef}
        className={`relative flex items-stretch bg-gray-50 border transition-colors ${
          error ? 'border-red-500 ring-2 ring-red-200' : focused ? 'border-gray-400 ring-2 ring-gray-400' : 'border-gray-200'
        }`}
      >
        {/* Flag + dial code */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-[42px] border-r border-gray-200 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <FlagImage iso2={iso2 || 'fr'} size="20px" />
          <span className="text-sm text-gray-700">{dialCode}</span>
          <MdOutlineKeyboardArrowDown
            className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            size={16}
          />
        </button>

        {/* Number */}
        <div className="relative flex-1">
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            className="w-full h-[42px] px-4 bg-transparent focus:outline-none text-gray-900 text-sm"
          />
        </div>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-lg z-20">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">No country found</p>
              ) : (
                filteredCountries.map((p) => (
                  <button
                    key={p.iso2}
                    type="button"
                    onClick={() => { onCountryChange(p.iso2); setOpen(false); setSearch(''); }}
                    className={`group w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-900 hover:bg-black hover:text-white transition-colors cursor-pointer ${p.iso2 === iso2 ? 'bg-gray-100' : ''}`}
                  >
                    <FlagImage iso2={p.iso2} size="18px" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-gray-400 group-hover:text-gray-300">+{p.dialCode}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}


export default function ContactUs({ isOpen, onClose }) {
  const { t } = useTranslation('onboarding');
  const isModal = typeof onClose === 'function';
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [countryIso2, setCountryIso2] = useState('fr');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneCountryEditedRef = useRef(false);
  useEffect(() => {
    let cancelled = false;

    const applyDetectedCountry = (code) => {
      if (cancelled || phoneCountryEditedRef.current) return;
      const matched = defaultCountries.find((c) => parseCountry(c).iso2 === code);
      if (matched) setCountryIso2(code);
    };

    const cached = sessionStorage.getItem('_visitorCountry');
    if (cached) {
      applyDetectedCountry(cached);
      return;
    }

    // Firefox ETP / uBlock can block fetch() to same-origin API routes with
    // geo-related path segments — XHR goes through a different pipeline and
    // isn't caught by the same filter lists (same fallback as CheckOut.jsx).
    const fetchLocaleViaXhr = () =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/visitor-locale', true);
        xhr.timeout = 5000;
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid JSON'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('XHR network error'));
        xhr.ontimeout = () => reject(new Error('XHR timeout'));
        xhr.send();
      });

    (async () => {
      try {
        let data;
        try {
          const res = await fetch('/api/visitor-locale', { credentials: 'same-origin' });
          data = await res.json();
        } catch {
          data = await fetchLocaleViaXhr();
        }
        const code = (data?.countryCode || '').toLowerCase();
        if (!code) return;
        try {
          sessionStorage.setItem('_visitorCountry', code);
        } catch {
          /* ignore */
        }
        applyDetectedCountry(code);
      } catch {
        /* silent — the 'fr' default still applies */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  
  const [isClosing, setIsClosing] = useState(false);
  const modalCardRef = useRef(null);

  useEffect(() => {
    if (isModal && isOpen) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [isModal, isOpen]);

  if (isModal && !isOpen && !isClosing) return null;

  const handleClose = () => {
    if (!isModal) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 250);
  };

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCancel = () => {
    setFormData({ fullName: '', email: '', phoneNumber: '', message: '' });
    setErrors({});
    if (isModal) handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the name.';
    if (!formData.email.trim()) newErrors.email = 'Please enter the email.';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Please enter the phone number.';
    if (!formData.message.trim()) newErrors.message = 'Please enter the message.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/app/contact-us`, {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone_number: `${getDialCodeByIso2(countryIso2)}${formData.phoneNumber.trim()}`,
        message: formData.message.trim(),
      });
      if (res.data.status === false) {
        toast.error(res.data.action || 'Something went wrong. Please try again.');
      } else {
        toast.success('Your message has been sent.');
        setFormData({ fullName: '', email: '', phoneNumber: '', message: '' });
        if (isModal) handleClose();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formBody = (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold mb-2 text-black">{t('contactUs.title')}</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          {t('contactUs.description')}
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name and Email Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="fullName" className="block text-sm mb-2 text-black font-medium">
              {t('contactUs.form.fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              placeholder={t('contactUs.form.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`w-full px-3 py-2.5 bg-gray-50 border focus:outline-none text-black text-sm ${
                errors.fullName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.fullName && <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-black font-medium">
              {t('contactUs.form.email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('contactUs.form.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2.5 bg-gray-50 border focus:outline-none text-black text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm mb-2 text-black font-medium">
            {t('contactUs.form.phoneNumber')}
          </label>
          <PhoneFieldBox
            iso2={countryIso2}
            onCountryChange={(iso2) => {
              phoneCountryEditedRef.current = true;
              setCountryIso2(iso2);
            }}
            value={formData.phoneNumber}
            onChange={(value) => handleChange('phoneNumber', value)}
            error={errors.phoneNumber}
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm mb-2 text-black font-medium">
            {t('contactUs.form.message')}
          </label>
          <textarea
            id="message"
            placeholder={t('contactUs.form.messagePlaceholder')}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            rows={5}
            className={`w-full px-3 py-2.5 bg-gray-50 border focus:outline-none text-black text-sm resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full bg-white text-black py-3 border border-gray-300 hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {t('contactUs.buttons.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : t('contactUs.buttons.submit')}
          </button>
        </div>
      </form>
    </>
  );

  // Standalone /contact page — plain card, no backdrop/animation/close button.
  if (!isModal) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-lg p-8 overflow-y-auto">
          {formBody}
        </div>
      </div>
    );
  }

  // Modal usage (Footer.jsx) — same backdrop/pop/shake animation as Login.jsx.
  return (
    <div
      className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[1200] ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div className={`w-full max-w-lg ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
        <div
          ref={modalCardRef}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white w-full p-8 overflow-y-auto"
        >
          {/* <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-black hover:text-gray-600 z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
          >
            <AiOutlineClose size={20} />
          </button> */}
          {formBody}
        </div>
      </div>
    </div>
  );
}
