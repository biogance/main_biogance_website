"use client"

import { useState } from 'react';
import { AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function CreateNewPasswordModal() {
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

  const validatePassword = (password) => {
    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters with a number and special character.';
    }
    if (!/\d/.test(password)) {
      return 'Password must be at least 8 characters with a number and special character.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must be at least 8 characters with a number and special character.';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return 'Please confirm your password.';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match.';
    }
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
        // Also revalidate confirm password if it was already touched
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

  const handleSubmit = () => {
    const newErrors = {
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    };
    
    setErrors(newErrors);
    setTouched({
      password: true,
      confirmPassword: true
    });
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      console.log('Save Password clicked:', formData);
    } else {
      console.log('Form has errors, cannot submit');
    }
  };

  const handleClose = () => {
    console.log('Close button clicked');
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <AiOutlineClose className="w-6 h-6"/>
        </button>

        {/* Title */}
        <h1 className="text-xl font-semibold text-center mb-4 text-black">
          Create a New Password
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-center text-sm leading-relaxed mb-6">
          Enter your new password below to securely update your account. Make sure it meets the security requirements.
        </p>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-black font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="eg: ••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none text-black text-sm pr-10 ${
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
                  <AiOutlineEyeInvisible className="w-5 h-5 cursor-pointer" />
                ) : (
                  <AiOutlineEye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm mb-2 text-black font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="eg: Abc1234"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none text-black text-sm pr-10 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible className="w-5 h-5" />
                ) : (
                  <AiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Password Requirements */}
        <p className="text-gray-700 text-center text-xs leading-relaxed mt-5 mb-6">
          Password must be at least 8 characters, include 1 number, 1 special character, and not repeat old passwords.
        </p>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-base cursor-pointer"
        >
          Save Password
        </button>
      </div>
    </div>
  );
}