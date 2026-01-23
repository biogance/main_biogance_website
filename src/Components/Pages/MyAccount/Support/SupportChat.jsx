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
    }, 1000);
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
    <div className="bg-white flex flex-col relative min-h-[700px]">
      <style jsx>{`
        .capybaraloader {
          width: 14em;
          height: 10em;
          position: relative;
          z-index: 1;
          --color: rgb(0, 0, 0);
          --color2: rgb(255, 255, 255);
          transform: scale(0.75);
        }
        .capybara {
          width: 100%;
          height: 7.5em;
          position: relative;
          z-index: 1;
        }
        .loader {
          width: 100%;
          height: 2.5em;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .capy {
          width: 85%;
          height: 100%;
          background: linear-gradient(var(--color), 90%, var(--color2));
          border-radius: 45%;
          position: relative;
          z-index: 1;
          animation: movebody 1s linear infinite;
        }
        .capyhead {
          width: 7.5em;
          height: 7em;
          bottom: 0em;
          right: 0em;
          position: absolute;
          background-color: var(--color);
          z-index: 3;
          border-radius: 3.5em;
          box-shadow: -1em 0em var(--color2);
          animation: movebody 1s linear infinite;
        }
        .capyear {
          width: 2em;
          height: 2em;
          background: linear-gradient(-45deg, var(--color), 90%, var(--color2));
          top: 0em;
          left: 0em;
          border-radius: 100%;
          position: absolute;
          overflow: hidden;
          z-index: 3;
        }
        .capyear:nth-child(2) {
          left: 5em;
          background: linear-gradient(25deg, var(--color), 90%, var(--color2));
        }
        .capyear2 {
          width: 100%;
          height: 1em;
          background-color: var(--color2);
          bottom: 0em;
          left: 0.5em;
          border-radius: 100%;
          position: absolute;
          transform: rotate(-45deg);
        }
        .capymouth {
          width: 3.5em;
          height: 2em;
          background-color: var(--color2);
          position: absolute;
          bottom: 0em;
          left: 2.5em;
          border-radius: 50%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.5em;
        }
        .capylips {
          width: 0.25em;
          height: 0.75em;
          border-radius: 100%;
          transform: rotate(-45deg);
          background-color: var(--color);
        }
        .capylips:nth-child(2) {
          transform: rotate(45deg);
        }
        .capyeye {
          width: 2em;
          height: 0.5em;
          background-color: var(--color2);
          position: absolute;
          bottom: 3.5em;
          left: 1.5em;
          border-radius: 5em;
          transform: rotate(45deg);
        }
        .capyeye:nth-child(4) {
          transform: rotate(-45deg);
          left: 5.5em;
          width: 1.75em;
        }
        .capyleg {
          width: 6em;
          height: 5em;
          bottom: 0em;
          left: 0em;
          position: absolute;
          background: linear-gradient(var(--color), 95%, var(--color2));
          z-index: 2;
          border-radius: 2em;
          animation: movebody 1s linear infinite;
        }
        .capyleg2 {
          width: 1.75em;
          height: 3em;
          bottom: 0em;
          left: 3.25em;
          position: absolute;
          background: linear-gradient(var(--color), 80%, var(--color2));
          z-index: 2;
          border-radius: 0.75em;
          box-shadow: inset 0em -0.5em var(--color2);
          animation: moveleg 1s linear infinite;
        }
        .capyleg2:nth-child(3) {
          width: 1.25em;
          left: 0.5em;
          height: 2em;
          animation: moveleg2 1s linear infinite 0.075s;
        }
        @keyframes moveleg {
          0% {
            transform: rotate(-45deg) translateX(-5%);
          }
          50% {
            transform: rotate(45deg) translateX(5%);
          }
          100% {
            transform: rotate(-45deg) translateX(-5%);
          }
        }
        @keyframes moveleg2 {
          0% {
            transform: rotate(45deg);
          }
          50% {
            transform: rotate(-45deg);
          }
          100% {
            transform: rotate(45deg);
          }
        }
        @keyframes movebody {
          0% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(2%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .loaderline {
          width: 50em;
          height: 0.5em;
          border-top: 0.5em dashed var(--color);
          animation: moveline 10s linear infinite;
        }
        @keyframes moveline {
          0% {
            transform: translateX(0%);
            opacity: 0%;
          }
          5% {
            opacity: 100%;
          }
          95% {
            opacity: 100%;
          }
          100% {
            opacity: 0%;
            transform: translateX(-70%);
          }
        }
      `}</style>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="capybaraloader">
            <div className="capybara">
              <div className="capyhead">
                <div className="capyear">
                  <div className="capyear2"></div>
                </div>
                <div className="capyear"></div>
                <div className="capymouth">
                  <div className="capylips"></div>
                  <div className="capylips"></div>
                </div>
                <div className="capyeye"></div>
                <div className="capyeye"></div>
              </div>
              <div className="capyleg"></div>
              <div className="capyleg2"></div>
              <div className="capyleg2"></div>
              <div className="capy"></div>
            </div>
            <div className="loader">
              <div className="loaderline"></div>
            </div>
          </div>
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