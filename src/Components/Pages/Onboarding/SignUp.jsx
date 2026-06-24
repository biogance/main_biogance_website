"use client"

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from 'react-icons/ai';
// import { PhoneInput } from 'react-international-phone';
// import { parsePhoneNumber } from 'libphonenumber-js';
// import 'react-international-phone/style.css';
import { BASE_URL } from '../../API/API';
import { callSplashApi } from '../../PageLoader';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FaApple } from 'react-icons/fa';
import { lockBodyScroll, unlockBodyScroll } from './ScrollLock';
import { getFirebaseAuth, getGoogleProvider, getAppleProvider } from '../../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function SignupModal({ isOpen, onClose, onLoginSuccess }) {
  const { t } = useTranslation('onboarding');
  const [showPassword, setShowPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalCardRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    // phoneNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    // phoneNumber: '',
    password: ''
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateFullName = (name) => {
    if (!name.trim()) {
      return 'Please enter your full name.';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    return '';
  };

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

  // const validatePhoneNumber = (phone) => {
  //   if (!phone || phone.length < 10) {
  //     return 'Please enter your phone number.';
  //   }
  //   return '';
  // };

  const validatePassword = (password) => {
    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleBlur = (field) => {
    if (!submitAttempted) return;
    
    let error = '';
    switch (field) {
      case 'fullName':
        error = validateFullName(formData.fullName);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      // case 'phoneNumber':
      //   error = validatePhoneNumber(formData.phoneNumber);
      //   break;
      case 'password':
        error = validatePassword(formData.password);
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // useEffect(() => {
  //     if (isOpen) {
  //       setIsClosing(false);
  //       const scrollY = window.scrollY;
  //       document.body.style.overflow = 'hidden';
  //       document.body.style.position = 'fixed';
  //       document.body.style.top = `-${scrollY}px`;
  //       document.body.style.width = '100%';
  //       return () => {
  //         document.body.style.overflow = '';
  //         document.body.style.position = '';
  //         document.body.style.top = '';
  //         document.body.style.width = '';
  //         window.scrollTo(0, scrollY);
  //       };
  //     }
  //   }, [isOpen]);


  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);
  if (!isOpen && !isClosing) return null;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setApiError('');
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      // phoneNumber: validatePhoneNumber(formData.phoneNumber),
      password: validatePassword(formData.password)
    };
    
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) return;

    // let country_code = '';
    // let phone_number = '';
    // try {
    //   const parsed = parsePhoneNumber(formData.phoneNumber);
    //   country_code = `+${parsed.countryCallingCode}`;
    //   phone_number = parsed.nationalNumber;
    // } catch {
    //   country_code = '';
    //   phone_number = formData.phoneNumber;
    // }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      // country_code,
      // phone: phone_number,
      // phone_number: formData.phoneNumber,
      password: formData.password,
      device: 'web',
      device_id: 'web123',
      fcm_token: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/user/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.action;
        setApiError(msg);
      } else {
        localStorage.setItem('LoginData', JSON.stringify(data));
        callSplashApi();
        window.dispatchEvent(new Event('loginStateChange'));
       
        if (onLoginSuccess) onLoginSuccess();
        else onClose();
      }
    } catch (err) {
      console.error('Register error:', err);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const user = result.user;
      const platform = provider.providerId?.includes('google') ? 'google' : 'apple';

      const res = await fetch(`${BASE_URL}/user/auth/social/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName || user.email?.split('@')[0] || '',
          email: user.email || '',
          platform,
          platform_id: user.uid,
          device: 'web',
          device_id: 'web123',
          fcm_token: 'web123',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();

      if (data.status === true) {
        localStorage.setItem('LoginData', JSON.stringify(data));
        callSplashApi();
        window.dispatchEvent(new Event('loginStateChange'));
        if (onLoginSuccess) onLoginSuccess();
        else onClose();
      } else {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.action;
        setApiError(msg || 'Social login failed. Please try again.');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setApiError('Social login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 250);
  };

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  // const phoneInputStyles = `
  //   .react-international-phone-input-container {
  //     background-color: #F9FAFB !important;
  //     border: 1px solid #E5E7EB !important;
  //     border-radius: 8px !important;
  //     height: 42px !important;
  //     display: flex !important;
  //     align-items: center !important;
  //   }
  //   .react-international-phone-input-container.error-border {
  //     background-color: #FEF2F2 !important;
  //     border: 1px solid #FCA5A5 !important;
  //   }
  //   .react-international-phone-input-container .react-international-phone-country-selector-button {
  //     border: none !important;
  //     background-color: transparent !important;
  //     padding: 0 8px 0 12px !important;
  //     height: 100% !important;
  //   }
  //   .react-international-phone-input-container .react-international-phone-country-selector-button__button-content {
  //     gap: 6px !important;
  //   }
  //   .react-international-phone-input-container input {
  //     border: none !important;
  //     background-color: transparent !important;
  //     height: 100% !important;
  //     padding: 0 16px !important;
  //     border-radius: 0 !important;
  //   }
  //   .react-international-phone-input-container input:focus {
  //     outline: none !important;
  //     box-shadow: none !important;
  //   }
  //   .react-international-phone-input-container:focus-within {
  //     ring: 2px !important;
  //     ring-color: #9CA3AF !important;
  //   }
  // `;

  return (
    <>
      <div
        className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-70 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
        onClick={handleBackdropClick}
      >
        <div className={`w-full max-w-lg ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white  w-full p-6 overflow-y-auto"
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
          <div className="text-center mb-8">
            <h1 className="text-2xl mb-2 mt-6 text-black font-semibold">{t('signup.title')}</h1>
           
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name and Email Row */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="fullName" className="block text-sm text-black font-semibold">
                    {t('contactUs.form.fullName')}
                  </label>
                  {submitAttempted && errors.fullName && (
                    <span className="hidden md:inline text-red-500 text-xs font-semibold">{errors.fullName}</span>
                  )}
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder={t('contactUs.form.fullNamePlaceholder')}
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full px-3 py-2.5 border text-black  focus:outline-none text-sm ${
                    submitAttempted && errors.fullName
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                {submitAttempted && errors.fullName && (
                  <p className="text-red-500 text-xs mt-1 md:hidden">{errors.fullName}</p>
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="email" className="block text-sm text-black font-semibold">
                    Email
                  </label>
                  {submitAttempted && errors.email && (
                    <span className="hidden md:inline text-red-500 text-xs font-semibold">{errors.email}</span>
                  )}
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder={t('contactUs.form.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-3 py-2.5 border text-black focus:outline-none text-sm ${
                    submitAttempted && errors.email
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                {submitAttempted && errors.email && (
                  <p className="text-red-500 text-xs mt-1 md:hidden">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            {/* <div>
              <label htmlFor="phoneNumber" className="block text-sm mb-2 text-black font-semibold">
                {t('signup.form.phoneNumber')}
              </label>
              <div className={touched.phoneNumber && errors.phoneNumber ? 'error-border' : ''}>
                <PhoneInput
                  defaultCountry="fr"
                  value={formData.phoneNumber}
                  onChange={(phone) => handleChange('phoneNumber', phone)}
                  onBlur={() => handleBlur('phoneNumber')}
                  className={touched.phoneNumber && errors.phoneNumber ? 'error-border' : ''}
                />
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div> */}

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm text-black font-semibold">
                  {t('signup.form.password')}
                </label>
                {submitAttempted && errors.password && (
                  <span className="hidden md:inline text-red-500 text-xs font-semibold">{errors.password}</span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('signup.form.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full text-black px-3 py-2.5 border  focus:outline-none text-sm pr-10 ${
                    submitAttempted && errors.password
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
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
              {submitAttempted && errors.password && (
                <p className="text-red-500 text-xs mt-1 md:hidden">{errors.password}</p>
              )}
              {/* Terms */}
            <p className="text-center text-xs text-gray-600 mt-4">
              {t('signup.terms')}{' '}
              <Link href="/termsCondition?section=terms" className="text-black underline">
                {t('signup.termsLink')}
              </Link>{' '}
              {t('signup.and')}{' '}
              <Link href="/termsCondition?section=privacy" className="text-black underline">
                {t('signup.privacyLink')}
              </Link>
            </p>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : t('signup.buttons.createAccount')}
            </button>
            {apiError && (
              <p className="text-red-500 text-sm mt-3 text-center font-medium">{apiError}</p>
            )}

            
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-black text-sm">{t('signup.divider')}</span>
            </div>
          </div>

           {/* Social Login */}
                    <div className="flex justify-center gap-4 ">
            <button
              type="button"
              onClick={() => handleSocialAuth(getAppleProvider())}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 h-10 bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-black cursor-pointer disabled:opacity-70"
            >
              <FaApple className="mb-0.5" size={18} />
              <span className="text-sm font-medium -ml-1">Apple</span>
            </button>
          
            <button
              type="button"
              onClick={() => handleSocialAuth(getGoogleProvider())}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 h-10 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-70"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-black -ml-0.5 mt-0.4">Google</span>
            </button>
          </div>

          {/* Footer */}
          {/* <p className="text-center text-sm text-gray-600">
            {t('signup.footer')}{' '}
            <span className="text-black underline font-medium cursor-pointer" onClick={onClose}>
              {t('signup.buttons.login')}
            </span>
          </p> */}
        </div>
      </div>
      </div>

    </>
  );
}