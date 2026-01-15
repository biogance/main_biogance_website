"use client"
import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from 'react-icons/ai';
import DeleteAccountModal from '../MyAccount/ModalBox/DeleteMyAccount';
import DeleteMyAccount from '../MyAccount/ModalBox/DeleteMyAccount';
import FeedbackForm from '../MyAccount/ModalBox/FeedbackAccount';
import ConfirmDeletionModal from '../MyAccount/ModalBox/ConfirmDeleteAccount';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

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

  const validatePassword = (password) => {
    if (!password) {
      return 'Please enter your password.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    return '';
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
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
    
    if (touched[field]) {
      let error = '';
      if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'password') {
        error = validatePassword(value);
      }
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleSubmit = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    };
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      console.log('Form submitted:', formData);
    } else {
      console.log('Form has errors, cannot submit');
    }
  };

  const handleClose = () => {
    console.log('Close button clicked');
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        {/* Close Button */}
         <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <AiOutlineClose className="w-4 h-4"/>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl mb-2 text-black">Welcome Back to Biogance</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Log in to access your account, track your orders, and enjoy exclusive rewards from our loyalty program.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="eg: john_doe@gmail.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full px-3 py-2.5 border text-black rounded-lg focus:outline-none text-sm ${
                touched.email && errors.email
                  ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-300'
              }`}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-black">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-3 text-black py-2.5 border rounded-lg focus:outline-none text-sm pr-10 ${
                  touched.password && errors.password
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
                  <AiOutlineEyeInvisible className="w-5 h-5" />
                ) : (
                  <AiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-black"
              />
              <span className="text-sm text-gray-700">Remember Me</span>
            </label>
            <a href="#" className="text-sm text-black hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors mt-6 cursor-pointer"
          >
            Login
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-500">OR LOGIN WITH</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-black cursor-pointer"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Don't have account{' '}
          <a href="#" className="text-black underline">
            Signup
          </a>
        </p>
      </div>

    </div>
    </>
  );
}