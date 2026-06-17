"use client"

import { useState, useEffect, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import VerificationCodeModal from './OtpSecren';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';
import { lockBodyScroll, unlockBodyScroll } from './ScrollLock';

export default function Forgotpassword({ isOpen, onClose, onAllClose }) {
  const { t } = useTranslation('onboarding');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalCardRef = useRef(null);

  const validateEmail = (email) => {
    if (!email.trim()) {
      return t('forgotPassword.errors.emailRequired');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('forgotPassword.errors.emailInvalid');
    }
    return '';
  };

  const handleBlur = () => {
    if (!submitAttempted) return;
    const validationError = validateEmail(email);
    setError(validationError);
  };

  const handleChange = (value) => {
    setEmail(value);
    
    if (submitAttempted) {
      const validationError = validateEmail(value);
      setError(validationError);
    }
  };

  // useEffect(() => {
  //   if (isOpen) {
  //     setIsClosing(false);
  //     const scrollY = window.scrollY;
  //     document.body.style.overflow = 'hidden';
  //     document.body.style.position = 'fixed';
  //     document.body.style.top = `-${scrollY}px`;
  //     document.body.style.width = '100%';
  //     return () => {
  //       document.body.style.overflow = '';
  //       document.body.style.position = '';
  //       document.body.style.top = '';
  //       document.body.style.width = '';
  //       window.scrollTo(0, scrollY);
  //     };
  //   }
  // }, [isOpen]);


  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);
  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setApiError('');

    const validationError = validateEmail(email);
    setError(validationError);

    if (validationError) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/user/auth/forgot/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.action;
        setApiError(msg);
      } else {
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); if (onClose) onClose(); }, 250);
  };

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-60 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
        onClick={handleBackdropClick}
      >
        <div className={`w-full max-w-lg ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white  shadow-lg w-full p-8 overflow-y-auto"
          >
          {/* Close Button */}
          <button
              type="button"
              onClick={handleClose}
             className="absolute top-4 right-4 text-black hover:text-gray-600 z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
            >
              <AiOutlineClose size={20}/>
            </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl mb-3 mt-6 font-semibold text-black">{t('forgotPassword.title')}</h1>
            <p className="text-gray-600 text-md leading-relaxed">
              {t('forgotPassword.description')}
               <br />
  {t("forgotPassword.description2")}
            </p>
            
          </div>

          {/* ─── FORM ─── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="email" className="block text-sm font-semibold text-black">
                  Email
                </label>
                {submitAttempted && error && (
                  <span className="hidden md:inline text-red-500 text-xs font-semibold">{error}</span>
                )}
              </div>
              <input
                id="email"
                type="email"
                placeholder= {t('forgotPassword.form.emailPlaceholder')}
                value={email}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border  focus:outline-none text-sm text-black ${
                  submitAttempted && error
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              />
              {submitAttempted && error && (
                <p className="text-red-500 text-xs mt-1 md:hidden">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : t('forgotPassword.buttons.sendResetLink')}
            </button>
            {apiError && (
              <p className="text-red-500 text-sm mt-3 text-center font-medium">{apiError}</p>
            )}
          </form>
        </div>
      </div>

        {/* OTP Modal */}
        <VerificationCodeModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          email={email}
          onAllClose={onAllClose}
        />
      </div>
    </>
  );
}