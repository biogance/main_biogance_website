"use client";

import React, { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../../API/API';

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

  if (!isOpen) return null;

  const resetForm = () => {
    setCategory('');
    setOrderId('');
    setMessage('');
    setErrors({});
    setSubmitError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1200] p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalCardRef}
        className="bg-white w-full max-w-[480px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('support.createTicket.title')}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('support.createTicket.subtitle')}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {t('support.createTicket.category')}
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full appearance-none px-3.5 py-3 pr-10 text-sm text-gray-900 bg-white border outline-none cursor-pointer ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('support.createTicket.categoryPlaceholder')}</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <IoIosArrowDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
            {errors.category && (
              <span className="text-red-500 text-xs mt-1 block">{errors.category}</span>
            )}
          </div>

          {/* Order ID */}
          {/* <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {t('support.createTicket.orderId')}
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={t('support.createTicket.orderIdPlaceholder')}
              className={`w-full px-3.5 py-3 text-sm text-gray-900 border outline-none placeholder:text-gray-400 ${
                errors.orderId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.orderId && (
              <span className="text-red-500 text-xs mt-1 block">{errors.orderId}</span>
            )}
          </div> */}

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {t('support.createTicket.message')}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('support.createTicket.messagePlaceholder')}
              className={`w-full px-3.5 py-3 text-sm text-gray-900 border outline-none resize-none placeholder:text-gray-400 ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && (
              <span className="text-red-500 text-xs mt-1 block">{errors.message}</span>
            )}
          </div>

          {submitError && (
            <span className="text-red-500 text-xs -mt-2">{submitError}</span>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleClose}
              className="flex-1 py-3 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t('support.createTicket.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('support.createTicket.submitting') : t('support.createTicket.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
