"use client"

import { useState, useEffect, useRef } from 'react';
import { IoClose, IoChevronDown, IoChatbubbleEllipsesOutline, IoAlertCircleOutline } from 'react-icons/io5';
import AuthInput from './AuthInput';
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

// Textarea with the same focus treatment as AuthInput — the black gradient
// bar grows in along the bottom edge.
function MessageBox({ hasError, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <textarea
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-4 py-3.5 border text-[14px] text-[#0b0b0a] outline-none resize-none placeholder:text-[#8a8880] transition-colors duration-200 ${
          hasError ? 'border-red-400' : focused ? 'border-black/40' : 'border-black/10'
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
          focused ? 'w-full' : 'w-0'
        }`}
      />
    </div>
  );
}

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
        className={`relative flex items-stretch bg-white border transition-colors duration-200 ${
          error ? 'border-red-400' : focused ? 'border-black/40' : 'border-black/10'
        }`}
      >
        {/* Flag + dial code */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-[48px] border-r border-black/10 bg-black/[0.02] shrink-0 cursor-pointer hover:bg-black/[0.04] transition-colors focus:outline-none"
        >
          <FlagImage iso2={iso2 || 'fr'} size="20px" />
          <span className="text-[13.5px] text-[#0b0b0a]">{dialCode}</span>
          <IoChevronDown
            className={`text-[#8a8880] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            size={14}
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
            className="w-full h-[48px] px-4 bg-transparent focus:outline-none text-[#0b0b0a] text-[14px]"
          />
        </div>

        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
            focused ? 'w-full' : 'w-0'
          }`}
        />

        {open && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)] z-20">
            <div className="p-2 border-b border-black/10">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country"
                className="w-full px-3 py-2 text-[13.5px] bg-white border border-black/10 text-[#0b0b0a] placeholder:text-[#8a8880] focus:outline-none focus:border-black/30"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <p className="px-3 py-4 text-[13px] text-[#8a8880] text-center">No country found</p>
              ) : (
                filteredCountries.map((p) => (
                  <button
                    key={p.iso2}
                    type="button"
                    onClick={() => { onCountryChange(p.iso2); setOpen(false); setSearch(''); }}
                    className={`group w-full flex items-center gap-2 px-3 py-2.5 text-[13.5px] text-left hover:bg-[#0b0b0a] hover:text-white transition-colors cursor-pointer ${p.iso2 === iso2 ? 'bg-black/[0.04] font-semibold text-[#0b0b0a]' : 'text-[#5c5a54]'}`}
                  >
                    <FlagImage iso2={p.iso2} size="18px" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-[#8a8880] group-hover:text-white/60">+{p.dialCode}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
          <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
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
        toast.error(res.data.action_message || res.data.action || 'Something went wrong. Please try again.');
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

  const labelCls = 'block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2';
  const fieldError = (msg) => (
    <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
      <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </span>
  );

  // Dark editorial header band — same family as the Login/SignUp modals.
  const headerBand = (
    <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 sm:px-8 py-6 sm:py-7 overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '14px 14px', maskImage: 'linear-gradient(to left, black, transparent 75%)', WebkitMaskImage: 'linear-gradient(to left, black, transparent 75%)' }}
      />
      <span aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-20 bg-[#DFB400]" />
      <IoChatbubbleEllipsesOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />
      {isModal && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
        >
          <IoClose size={18} />
        </button>
      )}
      <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
        <IoChatbubbleEllipsesOutline className="w-5 h-5 text-white" />
      </div>
      <div className="relative flex items-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
        <span className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-white/40">Biogance</span>
      </div>
      <h1 className="relative text-[22px] sm:text-[24px] font-extrabold leading-[1.05] tracking-tight text-white pr-12">
        {t('contactUs.title')}
      </h1>
      <p className="relative mt-2 text-[13px] text-white/50 leading-relaxed">
        {t('contactUs.description')}
      </p>
    </div>
  );

  const formBody = (
    <div className="px-6 sm:px-8 pt-6 pb-7 sm:pb-8">
      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Full Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="fullName" className={labelCls}>
              {t('contactUs.form.fullName')}
            </label>
            <AuthInput
              id="fullName"
              type="text"
              placeholder={t('contactUs.form.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              hasError={!!errors.fullName}
            />
            {errors.fullName && fieldError(errors.fullName)}
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>
              {t('contactUs.form.email')}
            </label>
            <AuthInput
              id="email"
              type="email"
              placeholder={t('contactUs.form.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              hasError={!!errors.email}
            />
            {errors.email && fieldError(errors.email)}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className={labelCls}>
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
          <label htmlFor="message" className={labelCls}>
            {t('contactUs.form.message')}
          </label>
          <MessageBox
            id="message"
            placeholder={t('contactUs.form.messagePlaceholder')}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            rows={5}
            hasError={!!errors.message}
          />
          {errors.message && fieldError(errors.message)}
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {t('contactUs.buttons.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting ? 'Submitting...' : t('contactUs.buttons.submit')}
          </button>
        </div>
      </form>
    </div>
  );

  // Standalone /contact page — plain card, no backdrop/animation/close button.
  if (!isModal) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-lg overflow-hidden shadow-[0_30px_70px_-30px_rgba(0,0,0,.35)] border border-black/10">
          {headerBand}
          {formBody}
        </div>
      </div>
    );
  }

  // Modal usage (Footer.jsx) — same backdrop/pop/shake animation as Login.jsx.
  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-[1200] ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div className={`w-full max-w-lg ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
        <div
          ref={modalCardRef}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white w-full max-h-[92vh] overflow-y-auto shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)]"
        >
          {headerBand}
          {formBody}
        </div>
      </div>
    </div>
  );
}
