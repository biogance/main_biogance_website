"use client"
import React, { useState, useEffect } from 'react';
import { IoChevronBack, IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { BsBag } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function SupportChat({ ticket, onClose }) {
  const { t } = useTranslation("myaccount");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'support',
      textKey: 'support.chat.messages.support1',
      time: '10:00 am',
      hasIcon: true
    },
    {
      id: 2,
      type: 'customer',
      textKey: 'support.chat.messages.customer1',
      time: '10:05 am',
      avatar: true
    },
    {
      id: 3,
      type: 'support',
      textKey: 'support.chat.messages.support2',
      time: '10:10 am',
      hasIcon: true
    },
    {
      id: 4,
      type: 'customer',
      textKey: 'support.chat.messages.customer2',
      time: '10:10 am',
      avatar: true
    },
    {
      id: 5,
      type: 'support',
      textKey: 'support.chat.messages.support3',
      time: '10:20 am',
      hasIcon: true
    },
    {
      id: 6,
      type: 'customer',
      textKey: 'support.chat.messages.customer3',
      time: '10:25 am',
      avatar: true
    },
    {
      id: 7,
      type: 'support',
      textKey: 'support.chat.messages.support4',
      time: '10:20 am',
      hasIcon: true
    },
    {
      id: 8,
      type: 'customer',
      textKey: 'support.chat.messages.customer4',
      time: '11:25 am',
      avatar: true
    },
    {
      id: 9,
      type: 'support',
      textKey: 'support.chat.messages.support5',
      time: '10:20 am',
      hasIcon: true
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="bg-white flex flex-col relative min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black "></div>
        </div>
      )}
      {!loading && (
        <>
          {/* Header */}
          <div className="-mx-8 px-1 pl-5 pr-5 pb-4 border-b border-gray-300">
            <div className="max-w-10xl mx-auto flex items-center justify-between">
              <div className="flex items-start gap-4">
                <button onClick={onClose} className="text-gray-700 cursor-pointer mt-2 hover:text-black transition-colors">
                  <FaArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-lg text-black font-medium">{t('support.chat.title')}</h1>
                  <p className="text-sm text-gray-600">{t('support.ticketId')} {ticket?.id || '#3021'}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-sm cursor-pointer text-gray-700 border border-gray-300 rounded-lg p-2 hover:text-black transition-colors" >
                {t('support.chat.closeChat')}
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-8">
            <div className="max-w-10xl mx-auto space-y-6">
              {/* Date Separator */}
              <div className="flex justify-center">
                <span className="text-sm text-gray-500 bg-white px-4 py-1 rounded-full border border-gray-200">
                  {t('support.chat.dateSeparator')}
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
                            <p className="text-sm leading-relaxed">
                              {msg.textKey ? t(msg.textKey) : msg.text}
                            </p>
                          </div>
                        </div>
                        {msg.hasIcon && (
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                                  <img src="sup.svg" alt="Support icon" className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="text-[10px] sm:text-xs text-gray-500 mt-1 whitespace-nowrap">{msg.time}</span>
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
                        <span className="text-[10px] -mb-4 sm:text-xs text-gray-500 mt-1 whitespace-nowrap">{msg.time}</span>
                        </div>
                      )}
                      <div className="max-w-xl">
                        <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-4 inline-block border border-gray-300">
                          <p className="text-sm leading-relaxed text-gray-800">
                            {msg.textKey ? t(msg.textKey) : msg.text}
                          </p>
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
                  placeholder={t('support.chat.writeMessage')}
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
        </>
      )}
    </div>
  );
}