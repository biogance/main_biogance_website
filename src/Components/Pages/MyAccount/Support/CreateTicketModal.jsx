"use client";

import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoChevronDown, IoCheckmark, IoTicketOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../../API/API';

const MESSAGE_LIMIT = 1000;

// Fully custom category picker — a bordered trigger that opens a floating,
// scrollable options panel below it. No native <select> anywhere, so the
// open/closed state, selection check, and hover treatment are all ours to
// style consistently with the rest of the account UI.
function CategoryDropdown({ options, value, onSelect, placeholder, hasError }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border text-left text-[14px] transition-colors duration-200 cursor-pointer ${
          hasError
            ? 'border-red-400'
            : open
            ? 'border-black/30'
            : 'border-black/10 hover:border-black/25'
        }`}
      >
        <span className={`truncate ${selected ? 'text-[#0b0b0a] font-medium' : 'text-[#8a8880]'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <IoChevronDown
          className={`w-4 h-4 shrink-0 text-[#8a8880] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)]">
            {options.length === 0 ? (
              <div className="px-4 py-3.5 text-[13px] text-[#8a8880]">—</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 text-[13.5px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${
                      isSelected ? 'bg-black/[0.04] text-[#0b0b0a] font-semibold' : 'text-[#5c5a54]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <IoCheckmark className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CreateTicketModal({ isOpen, onClose, onCreate }) {
  const { t, i18n } = useTranslation('myaccount');

  const [category, setCategory] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [ticketCategories, setTicketCategories] = useState([]);
  const modalCardRef = useRef(null);
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant
  // isOpen flips.
  const [isClosing, setIsClosing] = useState(false);

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const loadCategories = () => {
      try {
        const splash = JSON.parse(localStorage.getItem('splashData') || '{}');
        setTicketCategories(splash?.ticket_categories || []);
      } catch {
        setTicketCategories([]);
      }
    };
    loadCategories();
    window.addEventListener('splashDataReady', loadCategories);
    return () => window.removeEventListener('splashDataReady', loadCategories);
  }, []);

  const isFrench = i18n.language === 'fr';
  const categoryOptions = ticketCategories.map((c) => ({
    value: c.name,
    label: isFrench ? (c.french_name || c.name) : c.name,
  }));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const resetForm = () => {
    setCategory('');
    setOrderId('');
    setMessage('');
    setErrors({});
    setSubmitError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      resetForm();
      onClose();
    }, 250);
  };

  const validate = () => {
    const tempErrors = {};
    if (!category) tempErrors.category = t('support.createTicket.errorCategoryRequired');
    if (!message.trim()) tempErrors.message = t('support.createTicket.errorMessageRequired');
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`${BASE_URL}/app/ticket/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          category,
          message: message.trim(),
          // order_id: normalizedOrderId, // TODO: enable once order selection is wired up
        }),
      });
      const data = await res.json();

      if (!data?.status) {
        setSubmitError(data?.message || data?.action_message || t('support.createTicket.errorGeneric'));
        setIsSubmitting(false);
        return;
      }

      onCreate?.();
      resetForm();
      onClose();
    } catch (err) {
      console.error('Create ticket error:', err);
      setSubmitError(t('support.createTicket.errorGeneric'));
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[1200] p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalCardRef}
        className={`bg-white w-full max-w-[520px] max-h-[90vh] flex flex-col shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark editorial header band — mirrors the ticket-card spine treatment on Support.jsx */}
        <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 sm:px-8 pt-7 sm:pt-8 pb-6 sm:pb-7 shrink-0">
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
          >
            <IoClose size={18} />
          </button>

          <div className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
            <IoTicketOutline className="w-5 h-5 text-white" />
          </div>

          <h3 className="text-[22px] sm:text-[24px] font-extrabold leading-[1.05] tracking-tight text-white mb-1.5 pr-12">
            {t('support.createTicket.title')}
          </h3>
          <p className="text-[13.5px] text-white/50 max-w-[380px] leading-relaxed">
            {t('support.createTicket.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-7 sm:pb-8 flex flex-col gap-5 overflow-y-auto">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
              {t('support.createTicket.category')}
            </label>
            <CategoryDropdown
              options={categoryOptions}
              value={category}
              onSelect={setCategory}
              placeholder={t('support.createTicket.categoryPlaceholder')}
              hasError={!!errors.category}
            />
            {errors.category && (
              <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                {errors.category}
              </span>
            )}
          </div>

          {/* Order ID */}
          {/* <div>
            <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
              {t('support.createTicket.orderId')}
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={t('support.createTicket.orderIdPlaceholder')}
              className="w-full px-4 py-3.5 text-[14px] text-[#0b0b0a] border border-black/10 outline-none placeholder:text-[#8a8880] focus:border-black/30 transition-colors duration-200"
            />
          </div> */}

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880]">
                {t('support.createTicket.message')}
              </label>
              <span className="text-[11px] text-[#8a8880] tabular-nums">
                {message.length}/{MESSAGE_LIMIT}
              </span>
            </div>
            <textarea
              rows={5}
              value={message}
              maxLength={MESSAGE_LIMIT}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('support.createTicket.messagePlaceholder')}
              className={`w-full px-4 py-3.5 text-[14px] text-[#0b0b0a] border outline-none resize-none placeholder:text-[#8a8880] transition-colors duration-200 ${
                errors.message ? 'border-red-400' : 'border-black/10 focus:border-black/30'
              }`}
            />
            {errors.message && (
              <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                {errors.message}
              </span>
            )}
          </div>

          {submitError && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[13px]">
              <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-1">
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
            >
              {t('support.createTicket.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? t('support.createTicket.submitting') : t('support.createTicket.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
