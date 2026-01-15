"use client"

import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { LuBadgeCheck } from 'react-icons/lu';

export default function PasswordResetModal() {
  const handleResendOTP = () => {
    console.log('Resend OTP clicked');
  };

  const handleClose = () => {
    console.log('Close button clicked - redirect to previous page');
    // Add your navigation logic here, e.g., router.back() or navigate(-1)
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
          <AiOutlineClose className="w-4 h-4"/>
        </button>
        {/* Check Icon */}
        <div className="flex justify-center mb-6">
         <LuBadgeCheck className='text-black w-14 h-14' />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-center mb-4 text-black">
          Password Reset Email Sent
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-center text-sm leading-relaxed mb-6">
          We've sent a 6-digit verification code to your email. Please enter the code below to verify your identity and reset your password.
        </p>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-gray-300 mb-6 "></div>

        {/* Footer Text */}
        <div className="text-center">
          <p className="text-gray-700 text-sm mb-1">
            Didn't receive the code?
          </p>
          <p className="text-gray-700 text-sm">
            Check your spam folder or{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-black font-semibold underline hover:text-gray-700 transition-colors cursor-pointer"
            >
              Resend OTP
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}