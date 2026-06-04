"use client"

import { useState, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import CreateNewPasswordModal from './NewPassword';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';

export default function VerificationCodeModal({ isOpen, onClose, email, onAllClose }) {
  const { t } = useTranslation('onboarding');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (error) {
      setError('');
    }

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
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
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    
    if (otpString.length < 6) {
      setError(t('verificationCode.errors.incomplete'));
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/user/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.action;
        toast.error(msg);
      } else {
        setError('');
        setIsNewPasswordOpen(true);
      }
    } catch (err) {
      console.error('OTP verify error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center p-4 z-70">
        <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 text-black right-4 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <AiOutlineClose size={20}/>
          </button>

          <h1 className="text-xl font-semibold text-center mb-4 text-black">
            {t('verificationCode.title')}
          </h1>

          <p className="text-gray-700 text-center text-sm leading-relaxed mb-2">
            {t('verificationCode.description')}
          </p>
          <p className="text-gray-700 text-center text-sm leading-relaxed mb-8">
            {t('verificationCode.expiryNote')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-14 text-center text-2xl font-medium border-2 rounded-lg focus:outline-none text-black ${
                    error
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white focus:border-gray-400'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center mb-4 mt-2">{error}</p>
            )}

            <p className="text-center text-sm text-gray-700 mb-6 mt-4">
              {t('verificationCode.didntGetIt')}{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-black font-semibold underline hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resending...' : t('verificationCode.resendOTP')}
              </button>
              .
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : t('verificationCode.submitButton')}
            </button>
          </form>
        </div>
      </div>

      <CreateNewPasswordModal 
        isOpen={isNewPasswordOpen} 
        onClose={() => setIsNewPasswordOpen(false)}
        email={email}
        onAllClose={onAllClose}
      />
    </>
  );
}