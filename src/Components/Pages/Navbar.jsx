"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiSearch, FiUser, FiHeart, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { SearchModal } from './Modal/SearchModal';
import OurProducts from './Products/OurProducts';
import LoginModal from './Onboarding/Login';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';

import { getDeviceId } from '../../utils/deviceId';
import { BASE_URL } from '../API/API';

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

export default function Navbar({ transparent = false, announcementVisible = false, isVideoVisible = true }) {
  const { t, i18n } = useTranslation('navbar');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [homeCategories, setHomeCategories] = useState([]);
  const [cartCount, setCartCount] = useState(2);

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
    const payload = loginData?.data?.token
      ? { token: loginData.data.token }
      : { device_id: getDeviceId() };
    fetch(`${BASE_URL}/web/home`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => { if (data.status) setHomeCategories(data.data.categories || []); })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowAnnouncement(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktop = desktopLangRef.current && desktopLangRef.current.contains(event.target);
      const clickedMobile = mobileLangRef.current && mobileLangRef.current.contains(event.target);
      if (!clickedDesktop && !clickedMobile) {
        setIsLanguageDropdownOpen(false);
      }
    };
    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  const navLinks = [
    { href: '/who-are-we', text: t('ourLaboratory'), key: 'laboratory' },
    { href: '#', text: t('ourExpertAdvice'), key: 'advice' },
    { href: '/navPro', text: 'PRO', key: 'pro' },
  ];

  const languages = [
    { code: 'en', label: 'English', shortLabel: 'EN', currency: '€' },
    { code: 'fr', label: 'Français', shortLabel: 'FR', currency: '€' },
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

  // ✅ FIX: navHoverProps — sirf nav items ke hover par bg-white ho
  // Empty space, logo, ya nav ke bahar hover karne par transparent rahe
  const navHoverProps = {
    onMouseEnter: () => setIsNavHovered(true),
    onMouseLeave: () => setIsNavHovered(false),
  };

  // Shared dot indicator class
  const dotClass = (key) =>
    `absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full transition-opacity duration-200 ${
      hoveredLink === key ? 'opacity-100' : 'opacity-0'
    }`;

  // Shared nav item base class
  const navItemBase =
    'relative flex flex-col items-center justify-center px-2 py-1 pb-3 text-sm font-[600] text-[#1C1C1C] cursor-pointer bg-transparent border-none';

  return (
    <>
      {/* Announcement Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] w-full bg-[#111] text-white overflow-hidden transition-all duration-700 ${showAnnouncement ? 'h-[40px]' : 'h-0'}`}
      >
        <p className="flex items-center justify-center h-[40px] cursor-pointer font-normal tracking-wide text-[11px] lg:text-[13px] text-center px-10">
          Enjoy complimentary standard delivery across France on all orders over €39.{" "}
          <FaPlus className="inline mb-0.5 ml-1 shrink-0" />
        </p>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleMobileMenuToggle}
      />

      <nav
        className={`z-50 h-16 fixed left-0 right-0 transition-all duration-300 ${
          showAnnouncement ? "top-[40px]" : "top-0"
        } ${
          isNavHovered || isProductsModalOpen || isMobileMenuOpen || !isVideoVisible
            ? "bg-white shadow-sm border-b border-gray-100"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full mx-auto px-4 sm:px-6 h-full">
          {/* 
            ✅ FIX: onMouseEnter/Leave grid se HATA diye.
            Ab sirf nav items apna hover report karte hain navHoverProps ke zariye.
            Logo ya empty space pe hover karne se bg-white NAHI hogi.
          */}
          <div
            className="h-full grid items-center"
            style={{ gridTemplateColumns: '1fr auto 1fr' }}
          >

            {/* LEFT: Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-stretch gap-1">

              {/* Our Products Button */}
              <button
                onClick={toggleProductsModal}
                onMouseEnter={() => { setHoveredLink('products'); setIsNavHovered(true); }}
                onMouseLeave={() => { setHoveredLink(null); setIsNavHovered(false); }}
                className={navItemBase}
              >
                <span className="text-sm font-[600] text-[#1C1C1C]">{t('ourProducts')}</span>
                <span className={dotClass('products')} />
              </button>

              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onMouseEnter={() => { setHoveredLink(link.key); setIsNavHovered(true); }}
                  onMouseLeave={() => { setHoveredLink(null); setIsNavHovered(false); }}
                  className={navItemBase}
                >
                  {link.text}
                  <span className={dotClass(link.key)} />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button — sits in left cell on mobile */}
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

            {/* CENTER: Logo — intentionally NO navHoverProps, logo hover pe bg transparent rahe */}
            <div className="flex items-center justify-center">
              <Link href="/" className="flex-shrink-0 cursor-pointer flex items-center">
                <ImageWithFallback
                  src={logoImage}
                  alt="Biogance Logo"
                  className="h-10 sm:h-10"
                />
              </Link>
            </div>

            {/* RIGHT: Icons */}
            <div className="hidden lg:flex items-stretch justify-end gap-1">

              {/* Search */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                onMouseEnter={() => { setHoveredLink('search'); setIsNavHovered(true); }}
                onMouseLeave={() => { setHoveredLink(null); setIsNavHovered(false); }}
                className={navItemBase}
              >
                <FiSearch className="w-5 h-5" />
                <span className={dotClass('search')} />
              </button>

              {/* Language Dropdown */}
              <div className="relative" ref={desktopLangRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  onMouseEnter={() => { setHoveredLink('lang'); setIsNavHovered(true); }}
                  onMouseLeave={() => { setHoveredLink(null); setIsNavHovered(false); }}
                  className={`${navItemBase} flex-row gap-1`}
                >
                  <span className="text-[14px]">{currentLanguage.shortLabel}/{currentLanguage.currency}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                  <span className={dotClass('lang')} />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white text-black rounded-xl shadow-lg overflow-hidden min-w-[140px] cursor-pointer z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:text-white hover:bg-black transition-colors cursor-pointer ${
                          i18n.language === lang.code ? 'font-semibold' : ''
                        }`}
                      >
                        <span className="font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Login */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                onMouseEnter={() => { setHoveredLink('login'); setIsNavHovered(true); }}
                onMouseLeave={() => { setHoveredLink(null); setIsNavHovered(false); }}
                className={navItemBase}
              >
                <span>LOGIN</span>
                <span className={dotClass('login')} />
              </button>

              {/* Cart */}
              <button
                onMouseEnter={() => { setHoveredLink('cart'); setIsNavHovered(true); }}
                onMouseLeave={() => { setHoveredLink(null); setIsNavHovered(false); }}
                className={`${navItemBase} flex-row gap-1`}
              >
                <span className="uppercase">{t('cart') || 'Cart'}</span>
                {cartCount > 0 ? (
                  <span className="bg-black border border-gray-100 font-[600] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                ) : (
                  <span className="bg-black w-2 h-2 rounded-full" />
                )}
                <span className={dotClass('cart')} />
              </button>
            </div>

            {/* Mobile right icons (cart only visible on mobile) */}
            <div className="flex lg:hidden items-center justify-end">
              <button className="relative flex items-center gap-2 p-2 text-sm font-normal text-[#1C1C1C] cursor-pointer">
                <span className="uppercase">{t('cart') || 'Cart'}</span>
                {cartCount > 0 ? (
                  <span className="bg-black  border border-gray-100 font-[600] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                ) : (
                  <span className="bg-black w-2 h-2 rounded-full" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden bg-white border-t border-gray-200 transition-all duration-500 ease-in-out ${
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
                key={link.key}
                href={link.href}
                className="block py-2 text-[#1C1C1C] font-[400] hover:text-gray-600 hover:bg-gray-50 rounded-lg px-2 transition-all duration-200"
              >
                {link.text}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
              {/* Language Dropdown - Mobile */}
              <div className="relative" ref={mobileLangRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1 p-2 cursor-pointer text-[14px] rounded-xl border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
                >
                  <span>{currentLanguage.shortLabel}/{currentLanguage.currency}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-black hover:text-white transition-colors cursor-pointer ${
                          i18n.language === lang.code ? 'font-semibold' : ''
                        }`}
                      >
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
        categories={homeCategories}
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