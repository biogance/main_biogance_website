"use client"

import { useState, useEffect } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export default function ContactUs({ onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  // Prevent background scroll when component is mounted
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      message: ''
    });
    if (onClose) onClose();
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
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2 text-black">Contact Us</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Hey there! We'd really like to connect and hear more about you. Just shoot us a message, and we'll get back to you super quick!
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
                  placeholder="eg: John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-black text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-2 text-black font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="eg: john_doe@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-black text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm mb-2 text-black font-medium">
                Phone Number
              </label>
              <PhoneInput
                defaultCountry="fr"
                value={formData.phoneNumber}
                onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm mb-2 text-black font-medium">
                Message
              </label>
              <textarea
                id="message"
                placeholder="eg: Tell us more!"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-black text-sm resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-white text-black py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}