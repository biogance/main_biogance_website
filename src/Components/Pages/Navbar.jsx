"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSearch, FiUser, FiHeart, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { SearchModal } from './Modal/SearchModal';
import OurProducts from './Products/OurProducts';
import LoginModal from './Onboarding/Login';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';

import { getDeviceId } from '../../utils/deviceId';
import { BASE_URL } from '../API/API';
import { getCartData } from '../../utils/cartStorage';
import ModalAddToCart from './Modal/ModalAddToCart';

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
  const pathname = usePathname();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [homeCategories, setHomeCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const productsRef = useRef(null);
  const productsCloseTimer = useRef(null);

  useEffect(() => {
    const readCount = () => {
      const data = getCartData();
      setCartCount(data?.cart_count || 0);
    };
    readCount();
    window.addEventListener('storage', readCount);
    return () => window.removeEventListener('storage', readCount);
  }, []);

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
      .then((data) => {
        if (data.status) {
          setHomeCategories(data.data.categories || []);
          setPopularProducts(data.data.popular || []);
        } else {
          const msg = data.errors?.length > 0
            ? data.errors[0].message
            : data.action || data.action_message;
          if (msg) console.error(msg);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowAnnouncement(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const loginData = localStorage.getItem('LoginData');
      setIsLoggedIn(!!loginData);
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('loginStateChange', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('loginStateChange', checkLogin);
    };
  }, [pathname]);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);

  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);
  const langCloseTimer = useRef(null);
  const navLeaveTimer = useRef(null);

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

  const currentLanguage = languages.find(lang => i18n.language && i18n.language.startsWith(lang.code)) || languages[0];

  const announcements = [
    "Enjoy complimentary standard delivery across France on all orders over €39.",
    "New arrivals just dropped — explore our latest skincare collection.",
    "Earn loyalty points on every order. Join Biogance Rewards today.",
  ];

  const [annIndex, setAnnIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [annPhase, setAnnPhase] = useState('idle');
  const [annPaused, setAnnPaused] = useState(false);

  useEffect(() => {
    if (annPaused) return;
    const interval = setInterval(() => {
      const next = (annIndex + 1) % announcements.length;
      setNextIndex(next);
      setAnnPhase('exit');
      setTimeout(() => {
        setAnnIndex(next);
        setAnnPhase('idle');
      }, 550);
    }, 4000);
    return () => clearInterval(interval);
  }, [annIndex, annPaused]);

  const currentStyle = {
    transform: annPhase === 'exit' ? 'translateY(-120%)' : 'translateY(0)',
    opacity: annPhase === 'exit' ? 0 : 1,
    transition: annPhase === 'exit'
      ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease-in'
      : 'none',
  };

  const nextStyle = {
    transform: annPhase === 'exit' ? 'translateY(0)' : 'translateY(120%)',
    opacity: annPhase === 'exit' ? 1 : 0,
    transition: annPhase === 'exit'
      ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease-out'
      : 'none',
  };

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

  const handleLangMouseEnter = () => {
    if (langCloseTimer.current) clearTimeout(langCloseTimer.current);
    setIsLanguageDropdownOpen(true);
  };

  const handleLangMouseLeave = () => {
    langCloseTimer.current = setTimeout(() => {
      setIsLanguageDropdownOpen(false);
    }, 150);
  };

  // Nav-level hover handlers — single source of truth for bg color
  const handleNavMouseEnter = () => {
    if (navLeaveTimer.current) clearTimeout(navLeaveTimer.current);
    setIsNavHovered(true);
  };

  const handleNavMouseLeave = () => {
    navLeaveTimer.current = setTimeout(() => {
      setIsNavHovered(false);
      setIsProductsOpen(false);
    }, 120);
  };

  const dotClass =
    'block w-1.5 h-1.5 bg-black rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 mt-1';

  const navItemBase =
    'group relative flex flex-col items-center justify-center px-2 h-full text-sm font-[500] text-[#1C1C1C] cursor-pointer bg-transparent border-none self-stretch';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] w-full bg-[#111] text-white overflow-hidden h-[40px]">
        <div className="relative h-full overflow-hidden">
          <p
            style={currentStyle}
            className="absolute inset-0 flex items-center justify-center cursor-pointer font-normal tracking-wide text-[11px] lg:text-[13px] text-center px-10"
          >
            <span className="hover:underline" onMouseEnter={() => setAnnPaused(true)} onMouseLeave={() => setAnnPaused(false)}>{announcements[annIndex]}</span>
            <FaPlus className="inline mb-0.5 ml-1 shrink-0" />
          </p>
          <p
            style={nextStyle}
            className="absolute inset-0 flex items-center justify-center cursor-pointer font-normal tracking-wide text-[11px] lg:text-[13px] text-center px-10"
          >
            <span className="hover:underline" onMouseEnter={() => setAnnPaused(true)} onMouseLeave={() => setAnnPaused(false)}>{announcements[nextIndex]}</span>
            <FaPlus className="inline mb-0.5 ml-1 shrink-0" />
          </p>
        </div>
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
        className={`z-50 h-16 fixed left-0 right-0 top-[40px] transition-colors duration-150 ${
          isNavHovered || isProductsOpen || isMobileMenuOpen || !isVideoVisible
            ? "bg-white shadow-sm"
            : "bg-transparent"
        } ${
          (isNavHovered || isProductsOpen || isMobileMenuOpen || !isVideoVisible) && !isProductsOpen
            ? "border-b border-gray-100"
            : "border-b border-transparent"
                                                              }`}
      >
        <div className="w-full mx-auto px-4 sm:px-6 h-full">
          <div
            className="h-full grid items-center"
            style={{ gridTemplateColumns: '1fr auto 1fr' }}
          >

            {/* LEFT: Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-stretch gap-3 mt-2.5">

              {/* Our Products - Hover Mega Menu */}
              <div
                ref={productsRef}
                className="group relative h-full"
                onMouseEnter={() => {
                  if (productsCloseTimer.current) clearTimeout(productsCloseTimer.current);
                  setIsProductsOpen(true);
                  handleNavMouseEnter();
                }}
                onMouseLeave={() => {
                  productsCloseTimer.current = setTimeout(() => {
                    setIsProductsOpen(false);
                  }, 150);
                  handleNavMouseLeave();
                }}
              >
                <button className={navItemBase}>
                  {t('ourProducts')}
                  <span className={dotClass} />
                </button>

                <OurProducts
                  isOpen={isProductsOpen}
                  onClose={() => setIsProductsOpen(false)}
                  categories={homeCategories}
                  popular={popularProducts}
                />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={navItemBase}
                  onMouseEnter={handleNavMouseEnter}
                  onMouseLeave={handleNavMouseLeave}
                >
                  {link.text}
                  <span className={dotClass} />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
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

            {/* CENTER: Logo */}
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
            <div className="hidden lg:flex items-stretch justify-end gap-5">

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className={navItemBase}
              >
                <FiSearch className="w-5 h-5 mt-0.5" strokeWidth={2.0} />
              </button>

              {/* Language Dropdown */}
              <div className="relative" ref={desktopLangRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className={`${navItemBase} flex-row gap-1`}
                >
                  <span className="text-[14px]">{currentLanguage.shortLabel}/{currentLanguage.currency}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-2 left-13 -translate-x-1/2 bg-white text-black shadow-lg overflow-hidden min-w-[140px] cursor-pointer z-50">
                    {languages.map((lang) => {
                      const isActive = !!(i18n.language && i18n.language.startsWith(lang.code));
                      return (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={(e) => {
                            if (isActive) { e.currentTarget.style.backgroundColor = '#f3f3f3'; e.currentTarget.style.color = '#111'; }
                            else { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#111'; }
                          }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '9px 14px', fontSize: '13px', cursor: 'pointer',
                            backgroundColor: isActive ? '#f3f3f3' : '#fff',
                            color: '#111', fontWeight: isActive ? 600 : 400,
                            border: 'none', transition: 'background-color 0.15s, color 0.15s',
                            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                          }}
                        >
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Login / Profile */}
              {isLoggedIn ? (
                <Link href="/my-account" className={navItemBase}>
                  <span className='mt-0.5'>PROFILE</span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className={navItemBase}
                >
                  <span className='mt-0.5'>LOGIN</span>
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`${navItemBase} flex-row gap-1`}
              >
                <span className="uppercase">{t('cart') || 'Cart'}</span>
                {cartCount > 0 ? (
                  <div style={{ height: '23px', width: cartCount >= 100 ? '53px' : cartCount >= 10 ? '33px' : '23px',  paddingTop:"0.7px", paddingRight:"0.7px", marginLeft: '5px', borderRadius: '999px', backgroundColor: '#111', color: '#fff', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '24px',  }}>
                    {cartCount}
                  </div>
                ) : (
                  <span className="bg-black w-2 h-2 rounded-full" />
                )}
              </button>
            </div>

            {/* Mobile right icons */}
            <div className="flex lg:hidden items-center justify-end">
              <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 p-2 text-sm font-normal text-[#1C1C1C] cursor-pointer">
                <span className="uppercase">{t('cart') || 'Cart'}</span>
                {cartCount > 0 ? (
                  <div style={{ height: '23px', width: cartCount >= 100 ? '53px' : cartCount >= 10 ? '33px' : '23px', borderRadius: '999px',  paddingTop:"0.7px", paddingRight:"0.2px", backgroundColor: '#111', color: '#fff', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '23px', }}>
                    {cartCount}
                  </div>
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
                className="flex items-center justify-between w-full py-2 text-[#1C1C1C] font-[400] hover:bg-gray-50 px-2 transition-all duration-200"
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
                className="block py-2 text-[#1C1C1C] font-[400] hover:text-gray-600 hover:bg-gray-50 px-2 transition-all duration-200"
              >
                {link.text}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
              {/* Language Dropdown - Mobile */}
              <div className="relative" ref={mobileLangRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1 p-2 cursor-pointer text-[14px] border border-[#E8E8E8] font-[400] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
                >
                  <span>{currentLanguage.shortLabel}/{currentLanguage.currency}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-white text-black shadow-lg overflow-hidden z-50 min-w-[140px]">
                    {languages.map((lang) => {
                      const isActive = !!(i18n.language && i18n.language.startsWith(lang.code));
                      return (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={(e) => {
                            if (isActive) { e.currentTarget.style.backgroundColor = '#f3f3f3'; e.currentTarget.style.color = '#111'; }
                            else { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#111'; }
                          }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '9px 14px', fontSize: '13px', cursor: 'pointer',
                            backgroundColor: isActive ? '#f3f3f3' : '#fff',
                            color: '#111', fontWeight: isActive ? 600 : 400,
                            border: 'none', transition: 'background-color 0.15s, color 0.15s',
                            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                          }}
                        >
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
              >
                <FiSearch className="w-5 h-5" strokeWidth={2.5} />
              </button>

              {isLoggedIn ? (
                <Link href="/my-account" className="p-2 border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200">
                  <FiUser className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-2 border border-[#E8E8E8] text-[#1C1C1C] hover:bg-gray-50 transition-all duration-200"
                >
                  <FiUser className="w-5 h-5" />
                </button>
              )}

              <Link href="/wishlist" className="p-2 border border-[#E8E8E8] text-[#1C11C1C] hover:bg-gray-50 transition-all duration-200">
                <FiHeart className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <ModalAddToCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        categories={homeCategories}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}