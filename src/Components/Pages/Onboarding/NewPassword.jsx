"use client"

import { useState, useEffect, useRef } from 'react';
import { AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';

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
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });
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
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    if (field === 'password') {
      error = validatePassword(formData.password);
    } else if (field === 'confirmPassword') {
      error = validateConfirmPassword(formData.confirmPassword, formData.password);
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (touched[field]) {
      let error = '';
      if (field === 'password') {
        error = validatePassword(value);
        if (touched.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          setErrors({ ...errors, password: error, confirmPassword: confirmError });
          return;
        }
      } else if (field === 'confirmPassword') {
        error = validateConfirmPassword(value, formData.password);
      }
      setErrors({ ...errors, [field]: error });
    }
  };

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    };
    
    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });
    
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
        toast.error(msg);
      } else {
        onAllClose?.();
      }
    } catch (err) {
      console.error('New password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); if (onClose) onClose(); }, 250);
  };

  return (
    <div
      className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-80 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div className={`w-full max-w-lg ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
        <div
          ref={modalCardRef}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white shadow-lg w-full p-8 overflow-y-auto"
        >
        <button
          type="button"
          onClick={handleClose}
             className="absolute top-4 right-4 text-black hover:text-gray-600 z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
        >
          <AiOutlineClose size={20}/>
        </button>

        <h1 className="text-xl mt-6 font-semibold text-center mb-4 text-black">
          {t('newPassword.title')}
        </h1>

        <p className="text-gray-700 text-center text-sm leading-relaxed mb-6">
          {t('newPassword.description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-black font-semibold">
              {t('newPassword.passwordLabel')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('newPassword.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-3 py-2.5 border  focus:outline-none text-black text-sm pr-10 ${
                  touched.password && errors.password
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <AiOutlineEye className="w-5 h-5 cursor-pointer" />
                ) : (
                  <AiOutlineEyeInvisible className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm mb-2 text-black font-semibold">
              {t('newPassword.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('newPassword.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-3 py-2.5 border focus:outline-none text-black text-sm pr-10 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <AiOutlineEye className="w-5 h-5" />
                ) : (
                  <AiOutlineEyeInvisible className="w-5 h-5" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* <p className="text-gray-700 text-center text-xs leading-relaxed mt-5 mb-6">
            {t('newPassword.requirements')}
          </p> */}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : t('newPassword.submitButton')}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}