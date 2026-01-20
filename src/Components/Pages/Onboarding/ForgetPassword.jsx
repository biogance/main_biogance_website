"use client"

import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import VerificationCodeModal from './OtpSecren';

export default function Forgotpassword({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();           // ← Prevents page refresh

    const validationError = validateEmail(email);
    setError(validationError);
    setTouched(true);

    if (!validationError) {
      console.log('Reset link sent to:', email);
      // Here you would normally call your API to send reset email/OTP
      // e.g. await sendResetEmail(email);
      
      setIsOtpModalOpen(true);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-60">
      <div className="relative bg-white rounded-3xl shadow-lg w-full max-w-lg p-8 overflow-y-auto">
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
          <h1 className="text-2xl mb-3 font-semibold text-black">Forgot your Password?</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Enter your registered email address and we'll send you a link to create a new password.
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
              placeholder="eg: john_doe@gmail.com"
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
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"           // ← Changed to submit → Enter key now works
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Send Reset Link
          </button>
        </form>
      </div>

      {/* OTP Modal */}
      <VerificationCodeModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </div>
  );
}