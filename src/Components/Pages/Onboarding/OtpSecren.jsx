"use client"

import { useState, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

export default function VerificationCodeModal() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // Move to next input if value is entered
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    console.log('Resend OTP clicked');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setIsExpired(false);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    
    // Check if all fields are filled
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    
    // Simulate incorrect OTP validation
    // In real scenario, you would verify with backend
    const correctOTP = '123456'; // Example correct OTP
    if (otpString !== correctOTP) {
      setError('The code you entered is incorrect. Please try again.');
      return;
    }
    
    // Simulate expired OTP check
    // In real scenario, backend would handle this
    if (isExpired) {
      setError('Your verification code has expired. Please request a new one.');
      return;
    }
    
    console.log('OTP submitted successfully:', otpString);
    setError('');
  };

  const handleClose = () => {
    console.log('Close button clicked');
  };

  // Simulate code expiry (for demo purposes)
  const simulateExpiry = () => {
    setIsExpired(true);
    setError('Your verification code has expired. Please request a new one.');
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 cursor-pointer right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <AiOutlineClose className="w-6 h-6"/>
        </button>

        {/* Title */}
        <h1 className="text-xl font-semibold text-center mb-4 text-black">
          Enter Verification Code
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-center text-sm leading-relaxed mb-2">
          Please enter the 6-digit OTP we sent to your registered email address to continue.
        </p>
        <p className="text-gray-700 text-center text-sm leading-relaxed mb-8">
          This code will expire in 10 minutes for your security.
        </p>

        {/* OTP Input Fields */}
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

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-xs text-center mb-4 mt-2">{error}</p>
        )}

        {/* Resend OTP */}
        <p className="text-center text-sm text-gray-700 mb-6 mt-4">
          Didn't get it?{' '}
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-black font-semibold underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            Resend OTP
          </button>
          .
        </p>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-base cursor-pointer"
        >
          Create New Password
        </button>

        
      </div>
    </div>
  );
}