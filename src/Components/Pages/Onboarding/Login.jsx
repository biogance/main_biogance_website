"use client"
import { useState, useEffect, useRef } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SignupModal from './SignUp';
import Forgotpassword from './ForgetPassword';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';
import { FaApple } from 'react-icons/fa';

export default function LoginModal({ isOpen, onClose }) {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
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
    setFormData({ ...formData, [field]: value });

    if (submitAttempted) {
      let error = '';
      if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'password') {
        error = validatePassword(value);
      }
      setErrors({ ...errors, [field]: error });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
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
          fcm_token: null,
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
        router.push('/my-account');
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError('An unexpected error occurred. Please try again.');
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
        className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-70 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
        onClick={handleBackdropClick}
      >
        <div className={`w-full max-w-lg ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white  w-full p-8 overflow-y-auto"
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
            <h1 className="text-2xl mb-2 mt-6 font-semibold text-black">{t('login.title')}</h1>
            {/* <p className="text-black text-sm leading-relaxed">
              {t('login.description')}
            </p> */}
          </div>

          {/* ─── FORM ─── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="email" className="block text-sm font-semibold text-black">
                  Email
                </label>
                {submitAttempted && errors.email && (
                  <span className="hidden md:inline text-red-500 text-xs font-semibold">{errors.email}</span>
                )}
              </div>
              <input
                id="email"
                type="email"
                placeholder={t('login.form.emailPlaceholder')}
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

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-black">
                  {t('login.form.password')}
                </label>
                {submitAttempted && errors.password && (
                  <span className="hidden md:inline text-red-500 text-xs font-semibold">{errors.password}</span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-3 text-black py-2.5 border  focus:outline-none text-sm pr-10 ${
                    submitAttempted && errors.password
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEye className="w-5 h-5" />
                  ) : (
                    <AiOutlineEyeInvisible className="w-5 h-5" />
                  )}
                </button>
              </div>
              {submitAttempted && errors.password && (
                <p className="text-red-500 text-xs mt-1 md:hidden">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-center">
              {/* <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-black"
                />
                <span className="text-sm text-gray-700">{t('login.form.rememberMe')}</span>
              </label> */}
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-sm text-black hover:underline cursor-pointer"
              >
                {t('login.form.forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3  hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : t('login.buttons.login')}
            </button>
            {apiError && (
              <p className="text-red-500 text-sm mt-3 text-center font-medium">{apiError}</p>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-black text-sm">{t('login.divider')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center gap-4 mb-6">
  <button
    type="button"
    className="flex items-center gap-2 px-5 h-10 bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-black cursor-pointer"
  >
    <FaApple className="mb-0.5"   size={18} />
    <span className="text-sm font-medium -ml-1">Apple</span>
  </button>

  <button
    type="button"
    className="flex items-center gap-2 px-5 h-10 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
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
          <p className="text-center text-sm text-black">
             {t('login.footer')}{' '}
            <button
              type="button"
              onClick={handleSignupClick}
              className="text-black font-semibold underline cursor-pointer"
            >
              {t('login.buttons.signup')}
            </button>
          </p>
        </div>
      </div>

        <SignupModal isOpen={showSignup} onClose={handleSignupClose} />
        <Forgotpassword isOpen={showForgotPassword} onClose={handleForgotPasswordClose} onAllClose={() => setShowForgotPassword(false)} />
      </div>
    </>
  );
}