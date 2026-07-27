"use client";
import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiChevronDown,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronRight as FiArrowRight,
} from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { SearchModal } from "./Modal/SearchModal";
import OurProducts from "./Products/OurProducts";
import LoginModal from "./Onboarding/Login";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";

import { getCartData } from "../../utils/cartStorage";
import ModalAddToCart from "./Modal/ModalAddToCart";
import ModalQuickView from "./Modal/ModalQuickView";

const logoImage = "/logo.svg";

// Client-mount detector for the OurProducts portal below — module-scope so
// the subscribe/snapshot functions are stable across renders (required by
// useSyncExternalStore). Returns false during SSR (document isn't there yet
// to portal into) and true once hydrated on the client; nothing ever changes
// after that, so subscribe is a no-op.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const ImageWithFallback = ({
  src,
  alt,
  className,
  fallback = "/fallback-logo.png",
}) => {
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

export default function Navbar({
  transparent = false,
  announcementVisible = false,
  isVideoVisible = true,
  bgWhite = false,
  scrolledBlur = false,
}) {
  const { t, i18n } = useTranslation("navbar");
  const pathname = usePathname();
  const router = useRouter();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Guards the createPortal(document.body) call below — document doesn't
  // exist during SSR, and this only ever flips true after the client mount.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [homeCategories, setHomeCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [cartProduct, setCartProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const productsRef = useRef(null);
  const productsCloseTimer = useRef(null);

  // Announcement bar height in px — also the max scroll distance it travels.
  const ANNOUNCEMENT_HEIGHT = 40;

  const safeAreaRef = useRef(0);

  useEffect(() => {
    // Read env(safe-area-inset-top) once after mount
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;top:env(safe-area-inset-top);height:0;visibility:hidden";
    document.body.appendChild(el);
    safeAreaRef.current = el.getBoundingClientRect().top;
    document.body.removeChild(el);
  }, []);

  // FIX (iOS Safari white-line flicker on scroll):
  // Previously the announcement bar and the nav were TWO separate
  // `position: fixed` elements, each receiving its own `style.transform`
  // write on every scroll tick. Even though both writes happened in the
  // same JS tick with identical values, iOS Safari (WebKit) composites
  // independent fixed/GPU layers on its own schedule during momentum
  // scrolling — there was no guarantee both layers painted on the exact
  // same frame. A single frame of desync between them opened a hairline
  // gap, and since the page background sits behind both layers, that gap
  // flashed as a white line while scrolling.
  //
  // Fix: announcement bar + nav now live inside ONE shared fixed wrapper,
  // and only the wrapper receives the transform. They're part of the same
  // paint/composite layer, so they physically cannot desync anymore —
  // there's only one element being moved instead of two being kept in
  // sync.
  const headerWrapperRef = useRef(null);
  const isDesktopRef = useRef(true);

  // Scroll-linked position is applied straight to the DOM (no React state),
  // so scrolling never triggers a re-render of the whole navbar tree — doing
  // that every animation frame was competing with native sticky positioning
  // on the main thread and showing up as jitter on content-heavy pages.
  useEffect(() => {
    const lastOffsetRef = { current: -1 };

    const applyOffset = (force = false) => {
      // Math.round() is the key extra fix here: on iOS Safari, window.scrollY
      // returns FRACTIONAL values during momentum scrolling (e.g. 12.694px),
      // not whole pixels like desktop browsers. Feeding that straight into
      // translateY() forces WebKit to sub-pixel-round the transformed layer,
      // and that rounding can land a hair differently for the layer's own
      // paint vs. what's directly behind it — opening a hairline seam that
      // flashes the white body background through. Rounding to a whole
      // pixel before it ever reaches the transform removes the sub-pixel
      // case entirely.
      const scrollOffset = Math.round(
        isDesktopRef.current
          ? 0
          : Math.min(window.scrollY, ANNOUNCEMENT_HEIGHT + safeAreaRef.current),
      );
      if (!force && scrollOffset === lastOffsetRef.current) return;
      lastOffsetRef.current = scrollOffset;

      // Single element, single transform write — see note on
      // headerWrapperRef above for why this replaces the old two-element
      // (announcementBarRef + navElRef) approach.
      if (headerWrapperRef.current) {
        headerWrapperRef.current.style.transform = isDesktopRef.current
          ? ""
          : `translateY(-${scrollOffset}px)`;
      }
    };

    const mq = window.matchMedia("(min-width: 1024px)");
    const updateIsDesktop = () => {
      isDesktopRef.current = mq.matches;
      applyOffset(true);
    };
    updateIsDesktop();
    mq.addEventListener("change", updateIsDesktop);

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        applyOffset();
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const vv = window.visualViewport;
    vv?.addEventListener("resize", handleScroll);
    vv?.addEventListener("scroll", handleScroll);

    return () => {
      mq.removeEventListener("change", updateIsDesktop);
      window.removeEventListener("scroll", handleScroll);
      vv?.removeEventListener("resize", handleScroll);
      vv?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const readCount = () => {
      const data = getCartData();
      setCartCount(data?.cart_count || 0);
      // Also sync from splashData
      const splash = localStorage.getItem("splashData");
      if (splash) {
        try {
          const parsed = JSON.parse(splash);
          if (parsed?.cart_count !== undefined) {
            setCartCount(parsed.cart_count);
          }
        } catch (e) {}
      }
    };
    readCount();
    window.addEventListener("storage", readCount);
    window.addEventListener("splashDataReady", readCount);
    return () => {
      window.removeEventListener("storage", readCount);
      window.removeEventListener("splashDataReady", readCount);
    };
  }, []);

  useEffect(() => {
    const loadFromSplash = () => {
      const cached = localStorage.getItem("splashData");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setHomeCategories(parsed.categories || []);
          setPopularProducts(parsed.popular || []);
          if (parsed.cart_count !== undefined) setCartCount(parsed.cart_count);
        } catch (e) {}
      }
    };
    loadFromSplash();
    window.addEventListener("splashDataReady", loadFromSplash);
    return () => window.removeEventListener("splashDataReady", loadFromSplash);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowAnnouncement(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const loginData = localStorage.getItem("LoginData");
      setIsLoggedIn(!!loginData);
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    window.addEventListener("loginStateChange", checkLogin);
    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("loginStateChange", checkLogin);
    };
  }, [pathname]);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);

  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);
  const langCloseTimer = useRef(null);
  const navLeaveTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktop =
        desktopLangRef.current && desktopLangRef.current.contains(event.target);
      const clickedMobile =
        mobileLangRef.current && mobileLangRef.current.contains(event.target);
      if (!clickedDesktop && !clickedMobile) {
        setIsLanguageDropdownOpen(false);
      }
    };
    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  const navLinks = [
    { href: "/our-laboratory", text: t("ourLaboratory"), key: "laboratory" },
    { href: "/advices", text: t("ourExpertAdvice"), key: "advice" },
    { href: "/professional", text: "PRO", key: "pro" },
  ];

  const languages = [
    { code: "en", label: "English", shortLabel: "EN", currency: "€" },
    { code: "fr", label: "Français", shortLabel: "FR", currency: "€" },
  ];

  const currentLanguage =
    languages.find(
      (lang) => i18n.language && i18n.language.startsWith(lang.code),
    ) || languages[0];

  const [headers, setHeaders] = useState([]);
  const [annIndex, setAnnIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [annPhase, setAnnPhase] = useState("idle");
  const [annPaused, setAnnPaused] = useState(false);
  const [textModal, setTextModal] = useState(null);
  const [textModalOpen, setTextModalOpen] = useState(false);

  const closeTextModal = () => {
    setTextModalOpen(false);
    setTimeout(() => setTextModal(null), 400);
  };

  const handleHeaderClick = (header) => {
    if (header.type === "no_action") return;
    if (header.type === "bundle") {
      const slug =
        header.bundle?.english_seo_keyboard ||
        header.bundle?.english_seo_keyword ||
        "";
      if (slug) {
        router.push(`/product/${slug}`);
      }
    } else if (header.type === "text") {
      const htmlItems = Array.isArray(header.text_contents)
        ? header.text_contents
        : [header.text_contents || ""];
      setTextModal({ title: header.title, htmlItems, activeIndex: 0 });
      setTimeout(() => setTextModalOpen(true), 10);
    }
  };

  // Load headers from splashData
  useEffect(() => {
    const load = () => {
      const cached = localStorage.getItem("splashData");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.headers?.length) setHeaders(parsed.headers);
        } catch (e) {}
      }
    };
    load();
    window.addEventListener("splashDataReady", load);
    return () => window.removeEventListener("splashDataReady", load);
  }, []);

  const activeHeaders = headers;

  useEffect(() => {
    if (annPaused) return;
    const interval = setInterval(() => {
      const next = (annIndex + 1) % activeHeaders.length;
      setNextIndex(next);
      setAnnPhase("exit");
      setTimeout(() => {
        setAnnIndex(next);
        setAnnPhase("idle");
      }, 550);
    }, 4000);
    return () => clearInterval(interval);
  }, [annIndex, annPaused, activeHeaders.length]);

  const currentStyle = {
    transform: annPhase === "exit" ? "translateY(-120%)" : "translateY(0)",
    opacity: annPhase === "exit" ? 0 : 1,
    transition:
      annPhase === "exit"
        ? "transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease-in"
        : "none",
  };

  const nextStyle = {
    transform: annPhase === "exit" ? "translateY(0)" : "translateY(120%)",
    opacity: annPhase === "exit" ? 1 : 0,
    transition:
      annPhase === "exit"
        ? "transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease-out"
        : "none",
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
  useEffect(() => {
    document.body.style.overflow =
      textModalOpen || isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [textModalOpen, isMobileMenuOpen]);
  const handleNavMouseLeave = () => {
    navLeaveTimer.current = setTimeout(() => {
      setIsNavHovered(false);
      setIsProductsOpen(false);
    }, 120);
  };

  const dotClass =
    "block w-1.5 h-1.5 bg-black rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 mt-1";

  const navItemBase =
    "group relative flex flex-col items-center justify-center px-2 h-full text-sm font-[500] text-[#1C1C1C] cursor-pointer bg-transparent border-none self-stretch";

  return (
    <>
      {/* ALWAYS-WHITE iOS STATUS BAR STRIP
          -----------------------------------------------------------------
          This is a completely SEPARATE fixed element, a SIBLING of
          headerWrapperRef below — it is intentionally NOT nested inside it.

          Why: headerWrapperRef gets `transform: translateY(-Npx)` applied
          on every scroll tick (see the scroll effect above) to hide the
          announcement bar as the user scrolls. If this status-bar strip
          lived inside that wrapper, it would move/scroll away too, and
          whatever sits behind it (page background, which can be dark-mode
          aware or themed) would show through the safe-area / notch region
          — breaking the "always white" requirement.

          By keeping it as an independent `position: fixed` element with
          its own top-level stacking context and a z-index HIGHER than the
          header wrapper (z-[70] > z-[60]), it:
            1. Never receives the scroll transform (not a descendant of
               headerWrapperRef), so it never physically moves.
            2. Always paints on top of the announcement bar / nav / any
               modal backdrop that sits under it.
            3. Uses an inline `background: "#ffffff"` (not a Tailwind class
               or CSS variable), so it can never be overridden by a
               `dark:` variant, a body/theme background, or any dark-mode
               class toggled elsewhere in the app.

          `lg:hidden` — this is only relevant on phones with a notch/safe
          area (iOS Safari); desktop browsers don't have this status bar
          concept, so we don't render it there. */}
      <div
        aria-hidden="true"
        className="lg:hidden fixed top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "env(safe-area-inset-top)",
          background: "#ffffff",
          zIndex: 70, // above headerWrapperRef (z-[60]) and its contents
        }}
      />

      {/* Shared fixed wrapper — announcement bar + nav now live in ONE
          transformed layer instead of two independently-transformed fixed
          elements. This is the actual fix for the iOS Safari white-line
          flicker on scroll: with a single element being moved, WebKit
          cannot composite the two pieces on different frames, so the
          hairline desync gap that used to flash white can no longer open. */}
      <div
        ref={headerWrapperRef}
        className="fixed top-0 left-0 right-0 z-[60] w-full transform-gpu [backface-visibility:hidden] [-webkit-backface-visibility:hidden] will-change-transform"
      >
        <div
          className="w-full bg-[#111] text-white"
          style={{ height: "calc(env(safe-area-inset-top) + 40px)" }}
        >
          {/* NOTE: the old in-wrapper white status-bar strip that used to
              live here has been removed. It scrolled/translated together
              with this wrapper, which meant it could move out from behind
              the real status bar during scroll and expose non-white
              content. The always-white strip above (outside this wrapper,
              never transformed) fully replaces it. */}
          <div className="relative h-full overflow-hidden">
            {[annIndex, nextIndex].map((idx, pos) => {
              const h = activeHeaders[idx] || activeHeaders[0];
              if (!h) return null;
              const isNoAction = h.type === "no_action";
              const isClickable = h.type === "bundle" || h.type === "text";
              return (
                <p
                  key={pos}
                  style={pos === 0 ? currentStyle : nextStyle}
                  className="absolute inset-0 flex items-center justify-center font-normal tracking-wide text-[11px] lg:text-[13px] text-center px-10"
                >
                  <span
                    onMouseEnter={() => setAnnPaused(true)}
                    onMouseLeave={() => setAnnPaused(false)}
                    onClick={() => handleHeaderClick(h)}
                    style={{
                      cursor: isClickable ? "pointer" : "default",
                      textDecoration: "none",
                    }}
                    onMouseOver={
                      isClickable
                        ? (e) => {
                            e.currentTarget.style.textDecoration = "underline";
                          }
                        : undefined
                    }
                    onMouseOut={
                      isClickable
                        ? (e) => {
                            e.currentTarget.style.textDecoration = "none";
                          }
                        : undefined
                    }
                  >
                    {h.title}
                  </span>
                  {h.is_icon && (
                    <FaPlus className="inline mb-0.5 ml-1 shrink-0" />
                  )}
                </p>
              );
            })}
          </div>
        </div>

        <nav
          className={`z-50 h-16 w-full transition-[color,background-color,border-color] duration-300 ease-out ${
            isNavHovered || isProductsOpen || isMobileMenuOpen || bgWhite
              ? "bg-white"
              : !isVideoVisible && scrolledBlur
              ? "bg-white"
              : !isVideoVisible
              ? "bg-white"
              : "bg-transparent"
          } ${
            (isNavHovered ||
              isProductsOpen ||
              isMobileMenuOpen ||
              !isVideoVisible ||
              bgWhite) &&
            !isProductsOpen
              ? "border-b border-gray-100"
              : "border-b border-transparent"
          }`}
        >
          <div className="w-full mx-auto px-4 sm:px-6 h-full">
            <div
              className="h-full grid items-center"
              style={{ gridTemplateColumns: "1fr auto 1fr" }}
            >
              {/* LEFT: Navigation Links - Desktop Only */}
              <div className="hidden lg:flex items-stretch gap-3 mt-2.5">
                {/* Our Products - Hover Mega Menu */}
                <div
                  ref={productsRef}
                  className="group relative h-full"
                  onMouseEnter={() => {
                    if (productsCloseTimer.current)
                      clearTimeout(productsCloseTimer.current);
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
                    {t("ourProducts")}
                    <span className={dotClass} />
                  </button>

                  {/* Portaled to document.body: headerWrapperRef (the fixed
                      announcement+nav wrapper above) carries transform-gpu +
                      will-change-transform, which makes it the CSS containing
                      block for any position:fixed descendant. Left in place,
                      OurProducts' "fixed; top:104px" would resolve against
                      that wrapper's own box (whose top sits at -100px) instead
                      of the viewport, landing near the very top of the screen
                      instead of just below the navbar. Rendering it into
                      document.body via a portal keeps it in the React tree
                      (so this div's onMouseEnter/onMouseLeave still fire
                      correctly while the pointer is over the menu) while
                      escaping that transformed ancestor for actual CSS
                      positioning. */}
                  {mounted &&
                    createPortal(
                      <OurProducts
                        isOpen={isProductsOpen}
                        onClose={() => setIsProductsOpen(false)}
                        categories={homeCategories}
                        popular={popularProducts}
                        onCartOpen={(product) => {
                          setCartProduct(product);
                          setIsCartOpen(true);
                        }}
                        onQuickViewOpen={(product) => {
                          setQuickViewProduct(product);
                          setIsQuickViewOpen(true);
                        }}
                      />,
                      document.body,
                    )}
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

              {/* Mobile Menu Button + Search - Mobile Only */}
              <div className="flex items-center gap-1 lg:hidden">
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
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="p-2 text-black hover:text-gray-900 transition-transform active:scale-90 duration-200"
                >
                  <FiSearch
                    className="w-5 h-5 cursor-pointer"
                    strokeWidth={2.0}
                  />
                </button>
              </div>

              {/* CENTER: Logo */}
              <div className="flex items-center justify-center">
                <Link
                  href="/"
                  className="flex-shrink-0 cursor-pointer flex items-center"
                >
                  <ImageWithFallback
                    src={logoImage}
                    alt="Biogance Logo"
                    className="h-7 sm:h-10"
                  />
                </Link>
              </div>

              {/* RIGHT: Icons */}

              <div className="hidden lg:flex items-center justify-end gap-10 h-full">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex items-center justify-center h-full text-[#1C1C1C] cursor-pointer bg-transparent border-none"
                >
                  <FiSearch className="w-5 h-5" strokeWidth={2.0} />
                </button>

                {/* Language Dropdown */}
                <div
                  className="relative flex items-center h-full"
                  ref={desktopLangRef}
                >
                  <button
                    onClick={() =>
                      setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                    }
                    className="flex items-center gap-1 h-full text-sm font-[500] text-[#1C1C1C] cursor-pointer bg-transparent border-none"
                  >
                    <span className="text-[14px]">
                      {currentLanguage.shortLabel}/{currentLanguage.currency}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isLanguageDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  {isLanguageDropdownOpen && (
                    <div className="absolute top-full -mt-3 left-13 -translate-x-1/2 bg-white text-black shadow-lg overflow-hidden min-w-[140px] cursor-pointer z-50">
                      {languages.map((lang) => {
                        const isActive = !!(
                          i18n.language && i18n.language.startsWith(lang.code)
                        );
                        return (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#111";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              if (isActive) {
                                e.currentTarget.style.backgroundColor = "#f3f3f3";
                                e.currentTarget.style.color = "#111";
                              } else {
                                e.currentTarget.style.backgroundColor = "#fff";
                                e.currentTarget.style.color = "#111";
                              }
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "9px 14px",
                              fontSize: "13px",
                              cursor: "pointer",
                              backgroundColor: isActive ? "#f3f3f3" : "#fff",
                              color: "#111",
                              fontWeight: isActive ? 600 : 400,
                              border: "none",
                              transition: "background-color 0.15s, color 0.15s",
                              fontFamily:
                                "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
                  <Link
                    href="/my-account"
                    className="flex items-center h-full text-sm font-[500] text-[#1C1C1C]"
                  >
                    <span>{t("profile")}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center h-full text-sm font-[500] text-[#1C1C1C] cursor-pointer bg-transparent border-none"
                  >
                    <span>{t("login")}</span>
                  </button>
                )}

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-1 h-full text-sm font-[500] text-[#1C1C1C] cursor-pointer bg-transparent border-none"
                >
                  <span className="uppercase">{t("cart") || "Cart"}</span>
                  {cartCount > 0 ? (
                    <div
                      style={{
                        height: "23px",
                        width:
                          cartCount >= 100
                            ? "53px"
                            : cartCount >= 10
                              ? "33px"
                              : "23px",

                        marginLeft: "5px",
                        borderRadius: "999px",
                        backgroundColor: "#111",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: "24px",
                      }}
                    >
                      {cartCount}
                    </div>
                  ) : (
                    <span className="bg-black w-2 h-2 rounded-full" />
                  )}
                </button>
              </div>

              {/* Mobile right icons */}
              <div className="flex lg:hidden items-center justify-end">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center p-2 text-sm font-normal text-[#1C1C1C] cursor-pointer"
                >
                  {cartCount > 0 ? (
                    <div
                      style={{
                        height: "23px",
                        width:
                          cartCount >= 100
                            ? "53px"
                            : cartCount >= 10
                              ? "33px"
                              : "23px",
                        borderRadius: "999px",
                        // paddingTop: "0.7px",
                        // paddingRight: "0.2px",
                        backgroundColor: "#111",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: "23px",
                      }}
                    >
                      {cartCount}
                    </div>
                  ) : (
                    <span className="bg-black w-2 h-2 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Text Modal — left side slide-in */}
      {textModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeTextModal}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              zIndex: 9998,
              opacity: textModalOpen ? 1 : 0,
              pointerEvents: textModalOpen ? "auto" : "none",
              transition: "opacity 0.35s ease",
            }}
          />
          {/* Slide-in panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#111",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              transform: textModalOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                flexShrink: 0,
                height: "68px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {textModal.title}
              </span>
              <button
                onClick={closeTextModal}
                className=" text-white hover: z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IoClose size={22} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div style={{ overflow: "hidden" }}>
                <div
                  key={textModal.activeIndex}
                  className="ann-html-content"
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.7,
                    animation:
                      "slideContent 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
                    willChange: "transform, opacity",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: textModal.htmlItems[textModal.activeIndex],
                  }}
                />
              </div>
              <style>{`
  .ann-html-content * { color: #fff !important; background-color: transparent !important; }
  @keyframes slideContent {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`}</style>
            </div>
            {textModal.htmlItems.length > 1 && (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() =>
                    setTextModal((prev) => ({
                      ...prev,
                      activeIndex:
                        (prev.activeIndex - 1 + prev.htmlItems.length) %
                        prev.htmlItems.length,
                    }))
                  }
                  style={{
                    position: "absolute",
                    left: "16px",
                    background: "none",
                    border: "1px solid #fff",
                    borderRadius: "50%",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                  }}
                >
                  <FiChevronLeft size={16} />
                </button>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {textModal.htmlItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setTextModal((prev) => ({ ...prev, activeIndex: i }))
                      }
                      style={{
                        width: i === textModal.activeIndex ? "20px" : "8px",
                        height: "8px",
                        borderRadius: "9999px",
                        backgroundColor:
                          i === textModal.activeIndex
                            ? "#fff"
                            : "rgba(255,255,255,0.35)",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() =>
                    setTextModal((prev) => ({
                      ...prev,
                      activeIndex:
                        (prev.activeIndex + 1) % prev.htmlItems.length,
                    }))
                  }
                  style={{
                    position: "absolute",
                    right: "16px",
                    background: "none",
                    border: "1px solid #fff",
                    borderRadius: "50%",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                  }}
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Backdrop overlay (desktop products mega-menu only) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleMobileMenuToggle}
      />

      {/* Mobile Menu — full screen left slide-in modal */}
      <>
        {/* Backdrop */}
        <div
          onClick={handleMobileMenuToggle}
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 9998,
            opacity: isMobileMenuOpen ? 1 : 0,
            pointerEvents: isMobileMenuOpen ? "auto" : "none",
            transition: "opacity 0.35s ease",
          }}
        />
        {/* Slide-in panel */}
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "100%",
            backgroundColor: "#fff",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
        {/* Header: Logo centered, close icon top-right */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 20px",
              flexShrink: 0,
              height: "60px",
            }}
          >
            <Link
              href="/"
              onClick={handleMobileMenuToggle}
              className="flex-shrink-0 cursor-pointer flex items-center"
            >
              <ImageWithFallback
                src={logoImage}
                alt="Biogance Logo"
                className="h-9"
              />
            </Link>
            <button
              onClick={handleMobileMenuToggle}
              className="text-[#1C1C1C] cursor-pointer transition-all duration-300 hover:rotate-90"
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IoClose size={26} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Products */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsMobileProductsOpen(true);
              }}
              className="w-full flex items-center justify-between px-5 py-4 text-left border-b border-gray-100 active:bg-gray-50 transition-colors duration-150"
              style={{
                background: "none",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span className="text-[15px] font-semibold text-[#1C1C1C]">
                {t("ourProducts")}
              </span>
              <FiChevronRight className="w-4 h-4 text-[#1C1C1C] flex-shrink-0" />
            </button>

            {/* Laboratory / Advice / PRO */}
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={handleMobileMenuToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left border-b border-gray-100 active:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-[15px] font-semibold text-[#1C1C1C]">
                  {link.text}
                </span>
                <FiChevronRight className="w-4 h-4 text-[#1C1C1C] flex-shrink-0" />
              </Link>
            ))}

            {/* Language Switcher */}
            <div
              className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
              <span className="text-[15px] font-semibold text-[#1C1C1C]">
                {t("language") || "Language"}
              </span>
              <div className="flex items-center gap-2">
                {languages.map((lang) => {
                  const isActive = !!(
                    i18n.language && i18n.language.startsWith(lang.code)
                  );
                  return (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="text-[13px] font-semibold transition-colors duration-150"
                      style={{
                        background: isActive ? "#111" : "#f3f3f3",
                        color: isActive ? "#fff" : "#111",
                        border: "none",

                        padding: "6px 14px",
                        cursor: "pointer",
                      }}
                    >
                      {lang.shortLabel}/{lang.currency}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile / Login */}
            {isLoggedIn ? (
              <Link
                href="/my-account"
                onClick={handleMobileMenuToggle}
                className="w-full flex items-center px-5 py-4 text-left"
              >
                <span className="text-[15px] font-semibold text-[#1C1C1C] uppercase">
                  {t("profile") || "Profile"}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  handleMobileMenuToggle();
                  setIsLoginModalOpen(true);
                }}
                className="w-full flex items-center px-5 py-4 text-left"
                style={{ background: "none", border: "none" }}
              >
                <span className="text-[15px] font-semibold text-[#1C1C1C] uppercase">
                  {t("login") || "Login"}
                </span>
              </button>
            )}
          </div>
        </div>
      </>

      <ModalAddToCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        product={cartProduct || {}}
      />
      <ModalQuickView
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onCartOpen={() => {
          setIsQuickViewOpen(false);
          setIsCartOpen(true);
        }}
        product={quickViewProduct || {}}
        fullProductData={quickViewProduct?._raw || quickViewProduct || {}}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        categories={homeCategories}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Mobile Products Modal — only for small screens */}
      <OurProducts
        isOpen={isMobileProductsOpen}
        onClose={() => setIsMobileProductsOpen(false)}
        categories={homeCategories}
        popular={popularProducts}
        isMobileModal={true}
        onCartOpen={(product) => {
          setCartProduct(product);
          setIsMobileProductsOpen(false);
          setIsCartOpen(true);
        }}
        onQuickViewOpen={(product) => {
          setQuickViewProduct(product);
          setIsMobileProductsOpen(false);
          setIsQuickViewOpen(true);
        }}
      />
    </>
  );
}