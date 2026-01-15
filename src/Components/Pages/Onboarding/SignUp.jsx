"use client"

import Link from 'next/link';
import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from 'react-icons/ai';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import DeleteAccountModal from '../MyAccount/ModalBox/DeleteMyAccount';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phoneNumber: false,
    password: false
  });

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

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.length < 10) {
      return 'Please enter your phone number.';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!/\d/.test(password)) {
      return 'Password must include at least 1 number.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must include at least 1 special character.';
    }
    return '';
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    switch (field) {
      case 'fullName':
        error = validateFullName(formData.fullName);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(formData.phoneNumber);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (touched[field]) {
      let error = '';
      switch (field) {
        case 'fullName':
          error = validateFullName(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'phoneNumber':
          error = validatePhoneNumber(value);
          break;
        case 'password':
          error = validatePassword(value);
          break;
      }
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleSubmit = () => {
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      password: validatePassword(formData.password)
    };
    
    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true
    });
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      console.log('Form submitted successfully:', formData);
    } else {
      console.log('Form has errors, cannot submit');
    }
  };

  const handleClose = () => {
    console.log('Close button clicked');
  };

  const phoneInputStyles = `
    .react-international-phone-input-container {
      background-color: #F9FAFB !important;
      border: 1px solid #E5E7EB !important;
      border-radius: 8px !important;
      height: 42px !important;
      display: flex !important;
      align-items: center !important;
    }
    .react-international-phone-input-container.error-border {
      background-color: #FEF2F2 !important;
      border: 1px solid #FCA5A5 !important;
    }
    .react-international-phone-input-container .react-international-phone-country-selector-button {
      border: none !important;
      background-color: transparent !important;
      padding: 0 8px 0 12px !important;
      height: 100% !important;
    }
    .react-international-phone-input-container .react-international-phone-country-selector-button__button-content {
      gap: 6px !important;
    }
    .react-international-phone-input-container input {
      border: none !important;
      background-color: transparent !important;
      height: 100% !important;
      padding: 0 16px !important;
      border-radius: 0 !important;
    }
    .react-international-phone-input-container input:focus {
      outline: none !important;
      box-shadow: none !important;
    }
    .react-international-phone-input-container:focus-within {
      ring: 2px !important;
      ring-color: #9CA3AF !important;
    }
  `;

  return (
    <>
      <style>{phoneInputStyles}</style>
      <div className="bg-transparent flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <AiOutlineClose className="w-6 h-6"/>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl mb-2 text-black font-semibold">Create Your Biogance Account</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Discover products crafted for your pet's health and well-being. Earn loyalty points with every purchase and enjoy member-only benefits.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name and Email Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className="block text-sm mb-2 text-black font-medium">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none text-sm ${
                    touched.fullName && errors.fullName
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-2 text-black font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john_doe@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none text-sm ${
                    touched.email && errors.email
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm mb-2 text-black font-medium">
                Phone Number
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
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-black font-medium">
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
                  className={`w-full text-black px-3 py-2.5 border rounded-lg focus:outline-none text-sm pr-10 ${
                    touched.password && errors.password
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
                    <AiOutlineEyeInvisible className="w-5 h-5 cursor-pointer" />
                  ) : (
                    <AiOutlineEye className="w-5 h-5 cursor-pointer" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              {!errors.password && (
                <p className="text-gray-600 text-xs mt-1">
                  Password must be at least 8 characters and include a number & special character.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors mt-6 font-medium cursor-pointer"
            >
              Create My Account
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-600 mt-4">
              By signing up, you agree to our{' '}
              <a href="#" className="text-black underline">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-black underline">
                Privacy Policy
              </a>
            </p>
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
            Already have an account?{' '}
            <Link href="/login" className="text-black underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>

    </>
  );
}