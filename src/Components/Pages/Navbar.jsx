'use client';

import React from 'react';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
const logoImage = '/logo.svg';
const ImageWithFallback = ({ src, alt, className, fallback = '/fallback-logo.png' }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
};

export const Navbar = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer">
              <ImageWithFallback
                src={logoImage}
                alt="Biogance Logo"
                className="h-15 ml-[-100]"
              />
            </div>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Our Products + Dropdown */}
              <button className="flex items-center space-x-1 hover:text-gray-600 transition-colors">
                <div className="flex items-center space-x-2">
                  {/* 3x3 dots icon */}
                  <div className='cursor-pointer' >
                   <img src="/Menu.svg" className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-[400] cursor-pointer text-[#1C1C1C]">Our Products</div>
                    <div className="text-xs cursor-pointer text-gray-500"><img src="/france.svg" alt="" /></div>
                  </div>
                </div>
                <FiChevronDown className="w-4 h-4 cursor-pointer text-gray-600 ml-1" />
              </button>

              {/* Divider */}
               <span className="text-black text-2xl">|</span>

              <a href="#" className="text-[14px] font-[400]  text-[#1C1C1C]">
                Our Laboratory
              </a>

              {/* Divider */}
               <span className="text-black text-2xl">|</span>

              <a href="#" className="text-[14px] font-[400]  text-[#1C1C1C]">
                Our Expert Advice
              </a>

              {/* Divider */}
              <span className="text-black text-2xl">|</span>

              <a href="#" className="text-[14px] font-[400]  text-[#1C1C1C]">
                Pro
              </a>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-3 mr-[-100]">
              {/* Language Selector */}
              <button className="flex items-center p-2 cursor-pointer text-[14px] rounded-xl border border-[#E8E8E8] font-[400]  text-[#1C1C1C]">
                <span>EN</span>
                <FiChevronDown className="w-4 h-4" />
              </button>

              {/* Search */}
              <button className="p-2 text-[10px] rounded-xl cursor-pointer border border-[#E8E8E8] font-[400]  text-[#1C1C1C]">
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Account */}
              <button className="p-2 text-[10px] rounded-xl cursor-pointer border border-[#E8E8E8] font-[400]  text-[#1C1C1C]">
                <FiUser className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button className="p-2 text-[10px] font-[400] cursor-pointer rounded-xl border border-[#E8E8E8] text-[#1C1C1C]">
                <FiHeart className="w-5 h-5" />
              </button>

              {/* Cart with badge */}
              <button className="relative p-2 bg-gray-900 cursor-pointer hover:bg-gray-800 rounded-xl transition-colors">
                <FiShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};