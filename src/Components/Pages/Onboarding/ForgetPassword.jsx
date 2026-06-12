"use client"

import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import VerificationCodeModal from './OtpSecren';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';

export default function Forgotpassword({ isOpen, onClose, onAllClose }) {
  const { t } = useTranslation('onboarding');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Please enter your email.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "That doesn't look like a valid email.";
    }
    return '';
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateEmail(email);
    setError(validationError);
  };

  const handleChange = (value) => {
    setEmail(value);
    
    if (touched) {
      const validationError = validateEmail(value);
      setError(validationError);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    setError(validationError);
    setTouched(true);

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
        toast.error(msg);
      } else {
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  // Backdrop click -> shake the card instead of closing
  const handleBackdropClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-60"
        onClick={handleBackdropClick}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative bg-white rounded-3xl shadow-lg w-full max-w-lg p-8 overflow-y-auto ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Close Button */}
          <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 text-black right-4 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <AiOutlineClose size={20}/>
            </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl mb-3 font-semibold text-black">{t('forgotPassword.title')}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('forgotPassword.description')}
            </p>
          </div>

          {/* ─── FORM ─── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2 font-semibold text-black">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder= {t('forgotPassword.form.emailPlaceholder')}
                value={email}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-sm text-black ${
                  touched && error
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              />
              {touched && error && (
                <p className="text-red-500 text-xs mt-1">{t('forgotPassword.errors.emailRequired')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : t('forgotPassword.buttons.sendResetLink')}
            </button>
          </form>
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