"use client"
import React, { useState, useEffect, useRef } from 'react';
import { IoSend } from 'react-icons/io5';
import { FiPlus, FiX } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function SupportChat({ ticket, onClose }) {
  const { t } = useTranslation("myaccount");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    if (previewImage) {
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
  }, [previewImage]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || selectedImage) {
      const newMessage = {
        id: messages.length + 1,
        type: 'customer',
        text: message,
        image: selectedImage,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        avatar: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setSelectedImage(null);
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
                          {msg.image && (
                            <img 
                              src={msg.image} 
                              alt="Uploaded" 
                              className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(msg.image)}
                            />
                          )}
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 bg-gray-100 cursor-pointer border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-black transition-colors"
              >
                <FiPlus size={24} />
              </button>
              <div className="flex-1 relative">
                {/* Image Thumbnail inside Input */}
                {selectedImage && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="relative group">
                      <img 
                        src={selectedImage} 
                        alt="Selected" 
                        className="w-20 h-20 rounded-lg object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage(selectedImage)}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(null);
                        }}
                        className="absolute top-1 right-1 cursor-pointer bg-white text-black rounded-full p-0.5"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  </div>
                )}
               <input
                  type="text"
                  placeholder={t('support.chat.writeMessage')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full ${selectedImage ? 'pl-25 py-10' : 'pl-4 py-3'} pr-4 text-black bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 transition-all`}
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 z-10 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors bg-white rounded-full p-1"
            >
              <FiX size={24} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[500px] max-h-[500px] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}