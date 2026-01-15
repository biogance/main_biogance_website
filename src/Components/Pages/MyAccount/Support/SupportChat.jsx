"use client"
import React, { useState } from 'react';
import { IoChevronBack, IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { BsBag } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';

export default function SupportChat({ ticket, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'support',
      text: "Hi there! 👋 Thanks for contacting Biogance Support. I can see your order has already been dispatched. Please do not receive the package when it arrives. Once it is returned to us, we'll process your refund and credit the amount back to your wallet.",
      time: '10:00 am',
      hasIcon: true
    },
    {
      id: 2,
      type: 'customer',
      text: 'Thank you for the quick response. How long does it usually take for the package to return to you?',
      time: '10:05 am',
      avatar: true
    },
    {
      id: 3,
      type: 'support',
      text: "Great question! 😊 On average, returns take 3–5 business days depending on the courier. As soon as we receive the package at our facility, we'll notify you and begin the refund process immediately.",
      time: '10:10 am',
      hasIcon: true
    },
    {
      id: 4,
      type: 'customer',
      text: "That's clear. Will the refund be transferred directly to my bank account or just to my Biogance wallet?",
      time: '10:10 am',
      avatar: true
    },
    {
      id: 5,
      type: 'support',
      text: "For faster processing, refunds are first credited to your Biogance wallet balance 💳. From there, you can either keep it for your next purchase or request a transfer back to your original payment method.",
      time: '10:20 am',
      hasIcon: true
    },
    {
      id: 6,
      type: 'customer',
      text: 'Okay, that works for me. Will I be notified when the refund is available in my wallet?',
      time: '10:25 am',
      avatar: true
    },
    {
      id: 7,
      type: 'support',
      text: "Absolutely ✅ You'll receive both an email notification and a dashboard update under 'Support & Refunds' once your refund is credited. No need to follow up — we'll keep you updated every step of the way.",
      time: '10:20 am',
      hasIcon: true
    },
    {
      id: 8,
      type: 'customer',
      text: 'Perfect, thank you for the assistance. This feels very clear now.',
      time: '11:25 am',
      avatar: true
    },
    {
      id: 9,
      type: 'support',
      text: "You're most welcome! 😊 Thank you for choosing Biogance. We're committed to ensuring you and your pets always get the best care. If you have any further questions, feel free to reach out anytime.",
      time: '10:20 am',
      hasIcon: true
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'customer',
        text: message,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        avatar: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white  flex flex-col ">
      {/* Header */}
      <div className="-mx-8 px-1 pl-4 pr-4 pb-4 border-b border-gray-300">
        <div className="max-w-10xl mx-auto flex items-center justify-between">
          <div className="flex items-start gap-4">
            <button onClick={onClose} className="text-gray-700 cursor-pointer mt-2 hover:text-black transition-colors">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg text-black font-medium">Support Chat</h1>
              <p className="text-sm text-gray-600">Ticket ID: {ticket?.id || '#3021'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-sm cursor-pointer text-gray-700 border border-gray-300 rounded-lg p-2 hover:text-black transition-colors" >
            Close Chat/Ticket
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-8">
        <div className="max-w-10xl mx-auto space-y-6">
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="text-sm text-gray-500 bg-white px-4 py-1 rounded-full border border-gray-200">
              Tuesday
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id}>
            {msg.type === 'support' ? (
                // Support Message (Right Side)
                <div className="flex justify-end mb-2">
                  <div className="flex items-end  gap-3">
                    <div className="max-w-xl">
                      <div className="text-black border border-gray-300 rounded-2xl rounded-br-sm px-5 py-4 inline-block">
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                    {msg.hasIcon && (
                      <div className="flex flex-col items-center gap-2 ">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img src="sup.svg" alt="Support icon" />
                        </div>
                        <span className="text-xs text-gray-500 -mb-10">{msg.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              
              
             ) : (
                // Customer Message (Left Side)
                <div className="flex items-end gap-3 mb-2">
                  {msg.avatar && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-gray-500 -mb-10">{msg.time}</span>
                    </div>
                  )}
                  <div className="max-w-xl">
                    <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-4 inline-block border border-gray-300">
                      <p className="text-sm leading-relaxed text-gray-800">{msg.text}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div>
        <div className="max-w-10xl mx-auto flex items-center gap-3 mt-10">
          <button className="py-3 px-3 bg-gray-100 cursor-pointer border border-gray-300 rounded-lg lex items-center justify-center text-gray-600 hover:text-black transition-colors">
            <FiPlus size={24} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 text-black py-3 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSendMessage}
            className="py-3 px-3 flex bg-gray-100 cursor-pointer rounded-lg  border border-gray-300  items-center justify-center text-gray-700 hover:text-black transition-colors"
          >
            <IoSend size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}