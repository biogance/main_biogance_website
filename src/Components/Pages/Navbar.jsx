"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiUser, FiHeart, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { SearchModal } from './Modal/SearchModal';
import OurProducts from './Products/OurProducts';
import LoginModal from './Onboarding/Login';
import { useTranslation } from 'react-i18next';

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

export default function Navbar() {
  const { t, i18n } = useTranslation('navbar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/who-are-we', text: t('ourLaboratory') },
    { href: '#', text: t('ourExpertAdvice') },
    { href: '/navPro', text: 'Pro' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '/UkFlag.svg', shortLabel: 'EN' },
    { code: 'fr', label: 'Français', flag: '/franceFlag.svg', shortLabel: 'FR' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleMobileMenuToggle = () => {
    if (isMobileMenuOpen) {
      setIsProductsOpen(false);
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProductsModal = () => {
    setIsProductsModalOpen(!isProductsModalOpen);
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleMobileMenuToggle}
      />

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
        <div className="w-full mx-auto px-4 sm:px-6 h-full">
          <div className="relative flex items-center justify-between h-full">
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={handleMobileMenuToggle}
                className="p-2 text-gray-600 hover:text-gray-900 transition-transform active:scale-90 duration-200"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-6 h-6 cursor-pointer" />
                ) : (
                  <FiMenu className="w-6 h-6 cursor-pointer" />
                )}
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center lg:items-stretch lg:justify-start">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0 cursor-pointer flex items-center">
                <ImageWithFallback
                  src={logoImage}
                  alt="Biogance Logo"
                  className="h-10 sm:h-10"
                />
              </Link>

              {/* Center Navigation Links - Desktop Only */}
              <div className="hidden lg:flex flex-1 items-center justify-center gap-4">
                <button
                  onClick={toggleProductsModal}
                  className="flex items-center gap-2 hover:text-gray-600 transition-colors p-2 cursor-pointer"
                >
                  <img src="/Menu.svg" className="w-6 h-6" alt="Menu" />
                  <div className="text-left">
                    <div className="text-sm font-normal text-[#1C1C1C]">{t('ourProducts')}</div>
                    <div className="text-xs text-gray-500">
                      <img src="/france.svg" alt="France" />
                    </div>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                    isProductsModalOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                </button>

                {navLinks.map((link, index) => (
                  <React.Fragment key={link.text}>
                    <span className="text-gray-300">|</span>
                    <Link href={link.href} className="text-sm font-normal text-[#1C1C1C] hover:text-gray-600 px-2 py-1">
                      {link.text}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Language Dropdown - Desktop */}
              <div className="hidden lg:block relative">
                <button 
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1 p-2 cursor-pointer text-[14px] rounded-xl border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50"
                >
                  <img src={currentLanguage.flag} alt={currentLanguage.label} className="w-5 h-4 object-cover" />
                  <span>{currentLanguage.shortLabel}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                </button>
                
                {/* Language Dropdown Menu */}
                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px] cursor-pointer">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center  gap-3 px-4 py-3 text-sm hover:text-white hover:bg-black transition-colors cursor-pointer ${
                          i18n.language === lang.code ? 'text-black' : ''
                        }`}
                      >
                        <img src={lang.flag} alt={lang.label} className="w-6 h-5 object-cover" />
                        <span className="font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="hidden lg:block p-2 text-[10px] rounded-xl cursor-pointer border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              
              {/* User Icon with LoginModal */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2 text-[10px] rounded-xl cursor-pointer border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50"
              >
                <FiUser className="w-5 h-5" />
              </button>

              <Link href="/wishlist">
                <button className="hidden lg:block p-2 text-[10px] font-[400] cursor-pointer rounded-xl border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50">
                  <FiHeart className="w-5 h-5" />
                </button>
              </Link>

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
          className={`lg:hidden bg-white border-t border-gray-200 overflow-hidden transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div
            className={`px-4 py-4 space-y-4 transform transition-all duration-500 ease-in-out ${
              isMobileMenuOpen ? 'translate-y-0' : '-translate-y-6'
            }`}
          >
            <div>
              <button
                onClick={toggleProductsModal}
                className="flex items-center justify-between w-full py-2 text-[#1C1C1C] font-[400] hover:bg-gray-50 rounded-lg px-2 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <img src="/Menu.svg" className="w-5 h-5" alt="Menu" />
                  <span>{t('ourProducts')}</span>
                </div>
                <FiChevronDown
                  className={`w-4 h-4 transition-transform duration-400 ease-in-out ${
                    isProductsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${
                  isProductsOpen ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div
                  className={`pl-7 pt-2 space-y-2 transform transition-all duration-400 ease-in-out ${
                    isProductsOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                  }`}
                >
                  <img src="/france.svg" alt="France" className="w-8 h-6" />
                </div>
              </div>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                className="block py-2 text-[#1C1C1C] font-[400] hover:text-gray-600 hover:bg-gray-50 rounded-lg px-2 transition-all duration-200"
              >
                {link.text}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
              {/* Language Dropdown - Mobile */}
              <div className="relative">
                <button 
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1 p-2 cursor-pointer text-[14px] rounded-xl border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
                >
                  <img src={currentLanguage.flag} alt={currentLanguage.label} className="w-5 h-4 object-cover" />
                  <span>{currentLanguage.shortLabel}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-black rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors cursor-pointer ${
                          i18n.language === lang.code ? 'bg-gray-800' : ''
                        }`}
                      >
                        <img src={lang.flag} alt={lang.label} className="w-6 h-5 object-cover" />
                        <span className="font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 rounded-xl border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              
              {/* User Icon with LoginModal - Mobile */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2 rounded-xl border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
              >
                <FiUser className="w-5 h-5" />
              </button>

              <Link href="/wishlist" className="p-2 rounded-xl border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200">
                <FiHeart className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <OurProducts
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}