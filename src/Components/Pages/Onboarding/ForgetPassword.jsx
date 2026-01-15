"use client"

import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

export default function Forgotpassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

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

  const handleSubmit = () => {
    const validationError = validateEmail(email);
    setError(validationError);
    setTouched(true);
    
    if (!validationError) {
      console.log('Reset link sent to:', email);
    } else {
      console.log('Form has errors, cannot submit');
    }
  };

  const handleClose = () => {
    console.log('Close button clicked');
  };

  return (
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
          <h1 className="text-2xl mb-3 text-black">Forgot your Password?</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Enter your registered email address and we'll send you a link to create a new password.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-black">
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
            type="button"
            onClick={handleSubmit}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}