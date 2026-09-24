"use client"
import { useState, useEffect, useRef } from 'react';
import { IoClose, IoEyeOutline, IoEyeOffOutline, IoLogInOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import SignupModal from './SignUp';
import AuthInput from './AuthInput';
import Forgotpassword from './ForgetPassword';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';
import { callSplashApi } from '../../PageLoader';
import { saveCartData } from '../../../utils/cartStorage';
import { FaApple } from 'react-icons/fa';
import { lockBodyScroll, unlockBodyScroll } from './ScrollLock';
import { getFirebaseAuth, getGoogleProvider, getAppleProvider } from '../../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginModal({ isOpen, onClose }) {
  const { t } = useTranslation('onboarding');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalCardRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rememberMe');
    if (saved) {
      const { email, password } = JSON.parse(saved);
      setFormData({ email, password });
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email) => {
    if (!email.trim()) {
      return t('login.errors.emailRequired');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('login.errors.emailInvalid');
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return t('login.errors.passwordRequired');
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleBlur = (field) => {
    if (!submitAttempted) return;

    let error = '';
    if (field === 'email') {
      error = validateEmail(formData.email);
    } else if (field === 'password') {
      error = validatePassword(formData.password);
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
  if (isOpen) {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }
}, [isOpen]);

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

  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setApiError('');

    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          device: 'web',
          device_id: getDeviceId(),
          fcm_token: 'web123',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.title;
        setApiError(msg);
      } else {
        localStorage.setItem('LoginData', JSON.stringify(data));
        if (rememberMe) {
          localStorage.setItem('rememberMe', JSON.stringify({ email: formData.email, password: formData.password }));
        } else {
          localStorage.removeItem('rememberMe');
        }
        // Cart list fetch karo login ke baad, dono complete hone ke baad close karo
        try {
          const token = data?.data?.token;
          const cartRes = await fetch(`${BASE_URL}/user/cart/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          });
          const cartData = await cartRes.json();
          if (cartData.status) {
            const normalized = {
              ...cartData.data,
              cartItem: (cartData.data.cartItem || cartData.data.cartItems || []).filter(Boolean),
            };
            saveCartData(normalized);
          }
        } catch { /* silent */ }
        callSplashApi();
        window.dispatchEvent(new Event('loginStateChange'));
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      setIsLoading(true);
      setApiError('');
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
          device_id: getDeviceId(),
          fcm_token: 'web123',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();

      if (data.status === true) {
        localStorage.setItem('LoginData', JSON.stringify(data));
        // Social login ke baad bhi cart fetch karo
        try {
          const token = data?.data?.token;
          const cartRes = await fetch(`${BASE_URL}/user/cart/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          });
          const cartData = await cartRes.json();
          if (cartData.status) {
            const normalized = {
              ...cartData.data,
              cartItem: (cartData.data.cartItem || cartData.data.cartItems || []).filter(Boolean),
            };
            saveCartData(normalized);
          }
        } catch { /* silent */ }
        callSplashApi();
        window.dispatchEvent(new Event('loginStateChange'));
        onClose();
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

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleForgotPasswordClose = () => {
    setShowForgotPassword(false);
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-[1200] ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
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
            <IoLogInOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-5 right-5 z-10 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
            >
              <IoClose size={18} />
            </button>
            <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
              <IoLogInOutline className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
              <span className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-white/40">Biogance</span>
            </div>
            <h1 className="relative text-[22px] sm:text-[24px] font-extrabold leading-[1.05] tracking-tight text-white pr-12">
              {t('login.title')}
            </h1>
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7 sm:pb-8">
          {/* ─── FORM ─── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                Email
              </label>
              <AuthInput
                id="email"
                type="email"
                placeholder={t('login.form.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                hasError={submitAttempted && !!errors.email}
              />
              {submitAttempted && errors.email && (
                <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                  <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                {t('login.form.password')}
              </label>
              <AuthInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                hasError={submitAttempted && !!errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8880] hover:text-[#0b0b0a] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <IoEyeOutline className="w-[18px] h-[18px]" />
                    ) : (
                      <IoEyeOffOutline className="w-[18px] h-[18px]" />
                    )}
                  </button>
                }
              />
              {submitAttempted && errors.password && (
                <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                  <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-end -mt-2">
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-[12.5px] font-medium text-[#5c5a54] hover:text-[#0b0b0a] underline underline-offset-2 cursor-pointer transition-colors"
              >
                {t('login.form.forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {isLoading ? 'Logging in...' : t('login.buttons.login')}
            </button>
            {apiError && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[13px]">
                <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" />
                <span>{apiError}</span>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880]">{t('login.divider')}</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
  <button
    type="button"
    onClick={() => handleSocialAuth(getAppleProvider())}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 h-11 bg-white border border-black/10 hover:border-black/30 transition-colors text-[#0b0b0a] cursor-pointer disabled:opacity-60"
  >
    <FaApple className="mb-0.5" size={18} />
    <span className="text-[13px] font-medium">Apple</span>
  </button>

  <button
    type="button"
    onClick={() => handleSocialAuth(getGoogleProvider())}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 h-11 bg-white border border-black/10 hover:border-black/30 transition-colors cursor-pointer disabled:opacity-60"
  >
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span className="text-[13px] font-medium text-[#0b0b0a]">Google</span>
  </button>
</div>

          {/* Footer */}
          <p className="text-center text-[13px] text-[#8a8880]">
             {t('login.footer')}{' '}
            <button
              type="button"
              onClick={handleSignupClick}
              className="text-[#0b0b0a] font-semibold underline underline-offset-2 cursor-pointer"
            >
              {t('login.buttons.signup')}
            </button>
          </p>
          </div>
        </div>
      </div>

        <SignupModal isOpen={showSignup} onClose={handleSignupClose} onLoginSuccess={() => { setShowSignup(false); onClose(); }} />
        <Forgotpassword isOpen={showForgotPassword} onClose={handleForgotPasswordClose} onAllClose={() => setShowForgotPassword(false)} />
      </div>
    </>
  );
}