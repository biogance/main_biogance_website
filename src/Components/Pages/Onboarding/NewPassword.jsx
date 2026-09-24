"use client"

import { useState, useEffect, useRef } from 'react';
import { IoClose, IoEyeOutline, IoEyeOffOutline, IoLockClosedOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';
import AuthInput from './AuthInput';

export default function CreateNewPasswordModal({ isOpen, onClose, email, onAllClose }) {
  const { t } = useTranslation('onboarding');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalCardRef = useRef(null);

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  const validatePassword = (password) => {
    if (!password) return t('newPassword.errors.passwordRequired');
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return t('newPassword.errors.confirmRequired');
    if (confirmPassword !== password) return 'Passwords do not match.';
    return '';
  };

  const handleBlur = (field) => {
    if (!submitAttempted) return;

    let error = '';
    if (field === 'password') {
      error = validatePassword(formData.password);
    } else if (field === 'confirmPassword') {
      error = validateConfirmPassword(formData.confirmPassword, formData.password);
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setApiError('');

    const newErrors = {
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/user/auth/new/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.title;
        setApiError(msg);
      } else {
        onAllClose?.();
      }
    } catch (err) {
      console.error('New password error:', err);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); if (onClose) onClose(); }, 250);
  };

  const eyeToggle = (visible, onToggle) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle password visibility"
      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8880] hover:text-[#0b0b0a] transition-colors cursor-pointer"
    >
      {visible ? <IoEyeOutline className="w-[18px] h-[18px]" /> : <IoEyeOffOutline className="w-[18px] h-[18px]" />}
    </button>
  );

  const fieldError = (msg) => (
    <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
      <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </span>
  );

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-80 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div className={`w-full max-w-md ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
        <div
          ref={modalCardRef}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white w-full max-h-[92vh] overflow-y-auto shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)]"
        >
          {/* Dark editorial header band */}
          <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 sm:px-8 py-6 sm:py-7 overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '14px 14px', maskImage: 'linear-gradient(to left, black, transparent 75%)', WebkitMaskImage: 'linear-gradient(to left, black, transparent 75%)' }}
            />
            <span aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-20 bg-[#DFB400]" />
            <IoLockClosedOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-5 right-5 z-10 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
            >
              <IoClose size={18} />
            </button>
            <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
              <IoLockClosedOutline className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
              <span className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-white/40">Biogance</span>
            </div>
            <h1 className="relative text-[22px] sm:text-[24px] font-extrabold leading-[1.05] tracking-tight text-white pr-12">
              {t('newPassword.title')}
            </h1>
            <p className="relative mt-2 text-[13px] text-white/50 leading-relaxed">
              {t('newPassword.description')}
            </p>
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7 sm:pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                  {t('newPassword.passwordLabel')}
                </label>
                <AuthInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('newPassword.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  hasError={submitAttempted && !!errors.password}
                  rightSlot={eyeToggle(showPassword, () => setShowPassword(!showPassword))}
                />
                {submitAttempted && errors.password && fieldError(errors.password)}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                  {t('newPassword.confirmPasswordLabel')}
                </label>
                <AuthInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('newPassword.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  hasError={submitAttempted && !!errors.confirmPassword}
                  rightSlot={eyeToggle(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
                />
                {submitAttempted && errors.confirmPassword && fieldError(errors.confirmPassword)}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
              >
                {isLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? 'Saving...' : t('newPassword.submitButton')}
              </button>
              {apiError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[13px]">
                  <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" />
                  <span>{apiError}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
