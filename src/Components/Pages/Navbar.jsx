'use client';

import React, { useState } from 'react';
import { FiSearch, FiUser, FiHeart, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';

const logoImage = '/logo.svg';

const navLinks = [
  { href: '#', text: 'Our Laboratory' },
  { href: '#', text: 'Our Expert Advice' },
  { href: '#', text: 'Pro' },
];

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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
      <div className="w-full mx-auto px-4 sm:px-6 h-full">
        <div className="relative flex items-center justify-between h-full">
          {/* Mobile Menu Button & Logo (for mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center md:items-stretch md:justify-start">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer flex items-center">
              <ImageWithFallback
                src={logoImage}
                alt="Biogance Logo"
                className="h-10 sm:h-10"
              />
            </div>
  
            {/* Center Navigation Links - Desktop Only */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-4">
              <button className="flex items-center gap-2 hover:text-gray-600 transition-colors p-2">
                <img src="/Menu.svg" className="w-6 h-6" alt="Menu" />
                <div className="text-left">
                  <div className="text-sm font-normal text-[#1C1C1C]">Our Products</div>
                  <div className="text-xs text-gray-500">
                    <img src="/france.svg" alt="France" />
                  </div>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-600" />
              </button>
  
              {navLinks.map((link, index) => (
                <React.Fragment key={link.text}>
                  <span className="text-gray-300">|</span>
                  <a href={link.href} className="text-sm font-normal text-[#1C1C1C] hover:text-gray-600 px-2 py-1">
                    {link.text}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="hidden sm:flex items-center p-2 cursor-pointer text-[14px] rounded-xl border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50">
                <span>EN</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
  
              <button className="hidden xs:block p-2 text-[10px] rounded-xl cursor-pointer border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50">
                <FiSearch className="w-5 h-5" />
              </button>
  
              <button className="hidden sm:block p-2 text-[10px] rounded-xl cursor-pointer border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50">
                <FiUser className="w-5 h-5" />
              </button>
  
              <button className="hidden sm:block p-2 text-[10px] font-[400] cursor-pointer rounded-xl border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50">
                <FiHeart className="w-5 h-5" />
              </button>
  
              <button className="relative p-2 bg-gray-900 cursor-pointer hover:bg-gray-800 rounded-xl transition-colors">
                <img src="/q.svg" alt="Cart" className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen border-t border-gray-200' : 'max-h-0'
          }`}
        >
          <div className="px-4 py-4 space-y-4 bg-white">
            <div>
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="flex items-center justify-between w-full py-2 text-[#1C1C1C] font-[400]"
              >
                <div className="flex items-center space-x-2">
                  <img src="/Menu.svg" className="w-5 h-5" alt="Menu" />
                  <span>Our Products</span>
                </div>
                <FiChevronDown
                  className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isProductsOpen && (
                <div className="pl-7 pt-2 space-y-2">
                  <img src="/france.svg" alt="France" className="w-8 h-6" />
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <a key={link.text} href={link.href} className="block py-2 text-[#1C1C1C] font-[400] hover:text-gray-600">
                {link.text}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
              <button className="flex items-center p-2 cursor-pointer text-[14px] rounded-xl border border-[#E8E8E8] font-[400] text-[#1C1C1C]">
                <span>EN</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl border border-[#E8E8E8] text-[#1C1C1C]">
                <FiSearch className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl border border-[#E8E8E8] text-[#1C1C1C]">
                <FiUser className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl border border-[#E8E8E8] text-[#1C1C1C]">
                <FiHeart className="w-5 h-5" />
              </button>
            </div>
          </div>
      </div>
    </nav>
  );
}