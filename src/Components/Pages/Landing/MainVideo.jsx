"use client";

import React, { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../Navbar";
import LandingCards from "./LandingCards";
import { LandingFeatures } from "./LandingFeatures";
import { LandingProductFinder } from "./LandingProductFinder";
import LandingExpertAdvice from "./LandingExpertAdvice";
import LandingReview from "./LandingReview";
import LandingBanner from "./LandingBanner";
import Footer from "../Footer";
import LandingCategories from "./LandingCategories";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

// Only one video slide now - images removed
const heroSlides = [
  {
    type: "video",
    url: "/VIDEO.mp4",
  },
];

// Premium modern UI typeface for the hero copy + buttons
const HERO_FONT = "'Outfit', 'Sora', system-ui, -apple-system, sans-serif";

// Accent voice for the closing headline word.
const FONT_SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";

// Monochrome (white → silver → white) brushed-metal gradient for the primary
// CTA — stays inside the site's black/white theme.
const HERO_BTN_GRADIENT =
  "linear-gradient(115deg, #ffffff 0%, #ececea 32%, #c4c4c0 62%, #ffffff 100%)";

// Fine film-grain texture (inline SVG noise) laid over the footage.
const HERO_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

// Global cache variable to store the video blob URL so it plays instantly on SPA page navigation
let globalVideoBlobUrl = null;

// Initialize cache check immediately on script load (client-side only)
if (typeof window !== "undefined" && "caches" in window) {
  const videoUrl = "/VIDEO.mp4";
  const cacheName = "biogance-video-cache";

  caches.open(cacheName).then(async (cache) => {
    try {
      const cachedResponse = await cache.match(videoUrl);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        globalVideoBlobUrl = URL.createObjectURL(blob);
        window.__bioganceVideoBlobUrl = globalVideoBlobUrl;
        window.dispatchEvent(
          new CustomEvent("biogance-video-blob-ready", {
            detail: globalVideoBlobUrl,
          }),
        );
      } else {
        fetch(videoUrl)
          .then(async (response) => {
            if (response.ok) {
              await cache.put(videoUrl, response.clone());
              const blob = await response.blob();
              globalVideoBlobUrl = URL.createObjectURL(blob);
              window.__bioganceVideoBlobUrl = globalVideoBlobUrl;
              window.dispatchEvent(
                new CustomEvent("biogance-video-blob-ready", {
                  detail: globalVideoBlobUrl,
                }),
              );
            }
          })
          .catch((err) => {
            console.error("[Module Load] Background fetch failed:", err);
          });
      }
    } catch (err) {
      console.error("[Module Load] Cache open/match error:", err);
    }
  });
}

// Preloading removed to avoid connection throttling/range request issues in Firefox
const preloadHeroVideos = () => {
  // Disabled
};

export default function HeroSection() {
  const { t, i18n } = useTranslation("home");
  const isFrench = i18n.language === "fr";
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  // Back-to-top button — appears once the user has scrolled past the hero.
  const [showTop, setShowTop] = useState(false);
  const topProgressRef = useRef(null);
  const videoSectionRef = useRef(null);
  const videoRef = useRef(null);

  // Initialize state with the global blob URL if it is already loaded
  const [videoSrc, setVideoSrc] = useState(globalVideoBlobUrl || "/VIDEO.mp4");

  useEffect(() => {
    if (globalVideoBlobUrl) {
      setVideoSrc(globalVideoBlobUrl);
      return;
    }

    const handleBlobReady = (e) => {
      // If the video is already loaded or playing, do not switch the URL mid-playback to avoid restarts
      if (videoRef.current && videoRef.current.readyState >= 3) {
        return;
      }
      setVideoSrc(e.detail);
    };

    window.addEventListener("biogance-video-blob-ready", handleBlobReady);
    return () => {
      window.removeEventListener("biogance-video-blob-ready", handleBlobReady);
    };
  }, []);

  const slides = heroSlides;
  const currentSlideData = slides[currentSlide] || slides[0];
  const videoDisplaySrc =
    currentSlideData?.url === "/VIDEO.mp4" ? videoSrc : currentSlideData?.url;
  const isCurrentVideo = currentSlideData?.type === "video";
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(
            "Autoplay was prevented, waiting for user interaction:",
            error,
          );
        });
      }
    }
  }, [currentSlide, isCurrentVideo, videoDisplaySrc]);

  useEffect(() => {
    const handleScroll = () => {
      if (!videoSectionRef.current) return;
      const rect = videoSectionRef.current.getBoundingClientRect();
      // jab video section ka bottom navbar (64px) ko touch kare tab white ho
      const videoStillBehindNav = rect.bottom > 88;
      // Small screens: navbar sticks to top:0 once the announcement bar
      // (40px) scrolls fully away — go white immediately at that point
      // instead of waiting for the whole video section to scroll past.
      const isSmallScreen = window.innerWidth < 1024;
      const announcementHidden = window.scrollY >= 40;
      setIsVideoVisible(
        videoStillBehindNav && !(isSmallScreen && announcementHidden),
      );
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Intro gate — the hero mounts while the full-screen page loader is still
  // covering it, so its entrance animation is held (paused on frame one via
  // [data-intro="wait"]) and released the moment the loader reports it's gone.
  // On later visits (loader already gone) it plays immediately.
  useEffect(() => {
    const el = videoSectionRef.current;
    if (!el) return undefined;
    const go = () => el.setAttribute("data-intro", "go");
    if (window.__bgLoaderDone) {
      go();
      return undefined;
    }
    window.addEventListener("biogance-loader-done", go, { once: true });
    const safety = setTimeout(go, 8000);
    return () => {
      window.removeEventListener("biogance-loader-done", go);
      clearTimeout(safety);
    };
  }, []);

  // Back-to-top: shown after scrolling ~60% of a viewport; the button's own
  // bottom line fills with page-scroll progress (written straight to the DOM).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowTop(y > window.innerHeight * 0.6);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (topProgressRef.current && max > 0) {
        topProgressRef.current.style.transform = `scaleX(${Math.min(1, y / max).toFixed(4)})`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    preloadHeroVideos();
  }, []);
  const [apiData, setApiData] = useState(null);
  const [splashCategories, setSplashCategories] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load splash categories from localStorage cache first
  useEffect(() => {
    const cached = localStorage.getItem("splashData");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSplashCategories(parsed.categories || []);
      } catch (e) {}
    }

    // Listen for splashDataReady (fired by PageLoader)
    const onSplashReady = () => {
      const updated = localStorage.getItem("splashData");
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setSplashCategories(parsed.categories || []);
        } catch (e) {}
      }
    };
    window.addEventListener("splashDataReady", onSplashReady);
    return () => window.removeEventListener("splashDataReady", onSplashReady);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("homePageData");
    if (cached) {
      try {
        setApiData(JSON.parse(cached));
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem("homePageData");
      }
    }
  }, []);

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const payload = {};
    if (loginData?.data?.token) {
      payload.token = loginData.data.token;
    } else {
      payload.device_id = getDeviceId();
    }
    axios
      .post(`${BASE_URL}/web/home`, payload)
      .then((res) => {
        if (res.data.status === false) {
          toast.error(res.data.action_message || res.data.action);
        } else {
          // setApiData must run no matter what — this is what actually
          // paints the UI. It used to run AFTER localStorage.setItem below,
          // so on mobile (small quota, or 0 in Safari Private mode) a
          // QuotaExceededError from the payload (blogs/products/reviews
          // images etc. can be a large JSON blob) would throw before this
          // line ever ran: the API call succeeded (visible in the Network
          // tab) but the page stayed on its loading skeleton forever,
          // because React state was never updated. Caching to localStorage
          // is a nice-to-have for instant paint on next visit, not a
          // requirement for showing this response — so it must never be
          // able to block the render.
          setApiData(res.data.data);
          try {
            localStorage.setItem("homePageData", JSON.stringify(res.data.data));
          } catch (e) {
            console.warn("Could not cache homePageData in localStorage:", e);
          }
          // Lets Footer.jsx (rendered on every page, not just this one) pick
          // up the freshly-fetched ranges/etc. without polling — same
          // "fire an event, listeners re-read localStorage" pattern as
          // PageLoader's 'splashDataReady'.
          window.dispatchEvent(new Event("homePageDataReady"));
        }
      })
      .catch((err) => console.error("API Error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const heroContent = {
    tagline: t("hero.tagline"),
    heading: t("hero.heading"),
    description: t("hero.description"),
    meta: t("hero.meta"),
  };

  // Auto-scroll functionality
  React.useEffect(() => {
    if (!hasMultipleSlides) return;

    const duration = isCurrentVideo ? 49000 : 2500;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, duration);

    return () => clearInterval(interval);
  }, [hasMultipleSlides, isCurrentVideo, currentSlide, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // "Find the perfect product" scrolls down to the LandingProductFinder
  // section instead of navigating away — matches html's href="#finder" anchor.
  const scrollToFinder = () => {
    document
      .getElementById("finder")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentImageUrl = currentSlideData?.url;

  // Hero motion — mouse parallax + scroll-linked drift, all driven through CSS
  // custom properties on the hero root (--mx/--my eased pointer position,
  // --sp scroll progress 0→1), so nothing here triggers a React re-render.
  useEffect(() => {
    const el = videoSectionRef.current;
    if (!el) return;

    const canHover =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(hover: hover)").matches
        : true;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const h = Math.min(r.height, window.innerHeight);
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / h - 0.5) * 2;
    };

    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty("--mx", cx.toFixed(4));
      el.style.setProperty("--my", cy.toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      const p = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
      el.style.setProperty("--sp", p.toFixed(4));
    };

    if (canHover) {
      el.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Heading split into words: every word rises out of its own mask, the last
  // one is set in the serif italic accent voice.
  const headingWords = String(heroContent.heading || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // hero.meta ("A · B · C") becomes the ticker items.
  const tickerItems = String(heroContent.meta || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const tickerRow = (key) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {Array.from({ length: Math.max(4, Math.ceil(24 / Math.max(1, tickerItems.length))) })
        .flatMap(() => tickerItems)
        .map((item, i) => (
          <React.Fragment key={i}>
            <span
              className={`whitespace-nowrap px-6 sm:px-10 ${i % 2 ? "italic normal-case font-normal tracking-[0.04em] text-[13px] sm:text-[15px]" : ""}`}
              style={i % 2 ? { fontFamily: FONT_SERIF } : undefined}
            >
              {item}
            </span>
            <span className="w-1.5 h-1.5 shrink-0 bg-white/55" />
          </React.Fragment>
        ))}
    </div>
  );

  // Rotating badge text — the ticker items, fitted around a circle.
  const badgeText = `${tickerItems.join("  ·  ")}  ·  `;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Navbar isVideoVisible={isVideoVisible} />

      {/* Main content with viewport height */}
      <main className="relative bg-white">
        <div
          ref={videoSectionRef}
          data-intro="wait"
          className="relative w-full bg-[#0b0b0a] text-white overflow-hidden h-svh min-h-[600px] max-[374px]:min-h-[660px]"
          style={{ fontFamily: HERO_FONT }}
        >
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
            precedence="default"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes hvCurtainTop { from { transform: translateY(0); } to { transform: translateY(-101%); } }
                @keyframes hvCurtainBottom { from { transform: translateY(0); } to { transform: translateY(101%); } }
                @keyframes hvKen { from { transform: scale(1.14); } to { transform: scale(1); } }
                @keyframes hvWord { from { transform: translateY(115%) rotate(4deg); } to { transform: translateY(0) rotate(0); } }
                @keyframes hvFade { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes hvGrowY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                @keyframes hvPulse { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
                @keyframes hvMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes hvSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes hvFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                @keyframes hvPop { from { opacity: 0; transform: translateY(30px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes hvGrain { 0% { transform: translate(0,0); } 20% { transform: translate(-3%,2%); } 40% { transform: translate(2%,-3%); } 60% { transform: translate(-2%,-1%); } 80% { transform: translate(3%,3%); } 100% { transform: translate(0,0); } }
                .hv-btn-sheen { transform: translateX(-130%) skewX(-18deg); }
                .group:hover .hv-btn-sheen { transform: translateX(260%) skewX(-18deg); }
                @media (prefers-reduced-motion: reduce) {
                  .hv-anim, .hv-anim * { animation: none !important; transition: none !important; }
                }
                /* Hold the whole intro (curtain, headline, ticker…) on its first frame until the page loader has gone. */
                [data-intro="wait"], [data-intro="wait"] * { animation-play-state: paused !important; }
              `,
            }}
          />

          {/* ── 1 · Media — parallaxes with the pointer, drifts on scroll ── */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="hv-anim absolute -inset-[4%] will-change-transform"
              style={{
                transform:
                  "translate3d(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -10px + var(--sp, 0) * 110px), 0)",
              }}
            >
              <div
                className="hv-anim absolute inset-0"
                style={{ animation: "hvKen 2.8s cubic-bezier(.2,.7,.2,1) .2s both" }}
              >
                {isCurrentVideo ? (
                  <video
                    ref={videoRef}
                    key={videoDisplaySrc}
                    src={videoDisplaySrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    onError={(e) => {
                      const err = e.target.error;
                      console.error("Video error:", err?.code, err?.message);
                      // Fallback: if blob URL failed, switch to direct file
                      if (videoSrc !== "/VIDEO.mp4") {
                        setVideoSrc("/VIDEO.mp4");
                      }
                    }}
                    onLoadedData={() => console.log("Video loaded successfully")}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700"
                    style={{ backgroundImage: `url(${currentImageUrl})` }}
                  ></div>
                )}
              </div>
            </div>
          </div>

          {/* ── 2 · Tone + film grain ── */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(11,11,10,.78) 0%, rgba(11,11,10,.42) 42%, rgba(11,11,10,.06) 78%), linear-gradient(0deg, rgba(11,11,10,.72) 0%, rgba(11,11,10,0) 34%), linear-gradient(180deg, rgba(11,11,10,.5) 0%, rgba(11,11,10,0) 20%)",
            }}
          />
          <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
            <div
              className="hv-anim absolute -inset-[10%] opacity-[.1] mix-blend-overlay"
              style={{ backgroundImage: HERO_GRAIN, animation: "hvGrain 1.4s steps(6) infinite" }}
            />
          </div>

          {/* Corner frame marks — viewfinder feel */}
          <div className="hidden sm:block absolute inset-x-0 top-0 h-svh min-h-[600px] max-[374px]:min-h-[660px] z-[2] pointer-events-none">
            <span className="absolute left-[clamp(20px,2.4vw,46px)] top-[112px] w-5 h-5 border-t border-l border-white/50" />
            <span className="absolute right-[clamp(20px,2.4vw,46px)] top-[112px] w-5 h-5 border-t border-r border-white/50" />
          </div>

          {/* Big outlined wordmark — set on the diagonal (bottom-left → top-right), counter-drifting */}
          <div className="absolute inset-x-0 top-0 h-svh min-h-[600px] max-[374px]:min-h-[660px] z-[2] pointer-events-none overflow-hidden grid place-items-center">
            <span
              aria-hidden="true"
              className="hv-anim select-none leading-[0.8] tracking-[-0.05em] font-extralight uppercase text-[clamp(64px,14vw,230px)] whitespace-nowrap"
              style={{
                WebkitTextStroke: "1px rgba(255,255,255,.22)",
                color: "transparent",
                transform: "rotate(-24deg) translate3d(calc(var(--mx, 0) * 26px), calc(var(--sp, 0) * -60px), 0)",
                animation: "hvFade 1.6s cubic-bezier(.2,.7,.2,1) 1.1s both",
              }}
            >
              Biogance
            </span>
          </div>

          {/* ── 3 · Copy — left, vertically centered ── */}
          <div
            className="hv-anim relative z-10 self-start h-svh min-h-[600px] max-[374px]:min-h-[660px] flex items-center px-5 sm:px-8 min-[721px]:px-[clamp(24px,2.4vw,46px)] pt-[100px] pb-[92px] sm:pb-[104px]"
            style={{
              transform: "translate3d(0, calc(var(--sp, 0) * -70px), 0)",
              opacity: "calc(1 - var(--sp, 0) * 1.25)",
            }}
          >
            <div className="w-full max-w-[640px]">
              {/* Tagline chip */}
              <div
                className="hv-anim inline-flex items-center gap-2.5 border border-white/30 px-3.5 py-2 sm:px-3 sm:py-1.5 mb-5 md:mb-6 backdrop-blur-sm bg-white/[0.04]"
                style={{ animation: "hvFade .9s cubic-bezier(.2,.7,.2,1) 1.2s both" }}
              >
                <span className="w-1.5 h-1.5 bg-white" style={{ animation: "hvPulse 2s ease-in-out infinite" }} />
                <p className="m-0 text-[10px] sm:text-[9px] font-medium tracking-[0.24em] sm:tracking-[0.26em] uppercase text-white/90">
                  {heroContent.tagline}
                </p>
              </div>

              {/* Headline — word-by-word mask rise, serif-italic closing word */}
              <h1
                className={`m-0 mb-6 md:mb-7 ${
                  isFrench
                    ? "text-[clamp(30px,9vw,40px)] sm:text-[clamp(32px,4vw,44px)] lg:text-[clamp(36px,3.4vw,56px)]"
                    : "text-[clamp(36px,11vw,48px)] sm:text-[clamp(38px,4.8vw,54px)] lg:text-[clamp(44px,4vw,66px)]"
                } uppercase font-extralight leading-[1] tracking-[-0.035em] text-white`}
              >
                {headingWords.map((word, i) => {
                  const last = i === headingWords.length - 1;
                  return (
                    <span
                      key={`${word}-${i}`}
                      className="inline-block overflow-hidden align-bottom pr-[0.22em] pb-[0.06em] -mb-[0.06em]"
                    >
                      <span
                        className={`hv-anim inline-block will-change-transform ${
                          last ? "normal-case font-normal italic tracking-[-0.02em]" : ""
                        }`}
                        style={{
                          fontFamily: last ? FONT_SERIF : undefined,
                          animation: `hvWord 1.1s cubic-bezier(.2,.7,.2,1) ${1.05 + i * 0.09}s both`,
                        }}
                      >
                        {word}
                      </span>
                    </span>
                  );
                })}
              </h1>

              {/* Description with a drawn hairline */}
              <div
                className="hv-anim flex items-start gap-4 sm:gap-5 mb-7 md:mb-8"
                style={{ animation: "hvFade 1s cubic-bezier(.2,.7,.2,1) 1.7s both" }}
              >
                <span
                  className="hidden sm:block w-px h-[54px] bg-white/45 shrink-0"
                  style={{ animation: "hvGrowY 1.2s cubic-bezier(.2,.7,.2,1) 1.8s both", transformOrigin: "top" }}
                />
                <p className="m-0 max-w-[400px] text-[17px] sm:text-[14px] leading-[1.75] font-light text-white/80 line-clamp-4 sm:line-clamp-none">
                  {heroContent.description}
                </p>
              </div>

              {/* CTAs */}
              <div
                className="hv-anim flex flex-col sm:flex-row sm:items-stretch gap-3"
                style={{ animation: "hvFade 1s cubic-bezier(.2,.7,.2,1) 1.9s both" }}
              >
                <button
                  onClick={() => router.push("/shop")}
                                                      style={{ backgroundImage: HERO_BTN_GRADIENT }}
                  className="group relative overflow-hidden flex items-stretch text-[#0b0b0a] cursor-pointer border border-white/50 shadow-[0_16px_38px_-18px_rgba(255,255,255,.55)] transition-transform duration-300 ease-out"
                >
                  <span className="hv-btn-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/70 transition-transform duration-[900ms] ease-out" />
                  <span className="relative flex-1 px-4 min-[375px]:px-6 sm:px-7 min-h-[54px] sm:min-h-[50px] flex items-center justify-center whitespace-nowrap uppercase text-[10.5px] min-[375px]:text-[11.5px] sm:text-[10px] tracking-[0.16em] min-[375px]:tracking-[0.22em] font-semibold">
                    {t("hero.shopNow")}
                  </span>
                  <span className="relative shrink-0 grid place-items-center w-[54px] sm:w-[50px] bg-[#0b0b0a] text-white text-[17px] sm:text-[14px] transition-colors duration-500 group-hover:bg-[#2a2a28]">
                    <span>→</span>
                  </span>
                </button>

                <button
                  onClick={scrollToFinder}
                                                      className="group relative overflow-hidden min-h-[54px] sm:min-h-[50px] px-6 sm:px-7 border border-white/40 text-white hover:text-[#0b0b0a] inline-flex items-center justify-center gap-3 whitespace-nowrap uppercase text-[10.5px] min-[375px]:text-[11.5px] sm:text-[10px] tracking-[0.16em] min-[375px]:tracking-[0.2em] sm:tracking-[0.22em] font-semibold cursor-pointer transition-[color,transform] duration-300 ease-out"
                >
                  <span className="absolute inset-0 bg-white -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0" />
                  <span className="relative">{t("hero.discover")}</span>
                  <span className="relative">↓</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 4 · Ticker rail + rotating badge, pinned to the first viewport's bottom ── */}
          <div className="absolute inset-x-0 top-0 h-svh min-h-[600px] max-[374px]:min-h-[660px] z-10 pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 border-t border-white/20 bg-[#0b0b0a]/35 backdrop-blur-md">
              <div className="overflow-hidden py-3 sm:py-4 text-[9px] sm:text-[10px] font-light tracking-[0.3em] uppercase text-white/80">
                <div
                  className="hv-anim flex w-max items-center"
                  style={{ animation: "hvMarquee 90s linear infinite" }}
                >
                  {tickerRow("a")}
                  {tickerRow("b")}
                </div>
              </div>
            </div>

            {/* Rotating text badge — click to glide down */}
            <button
              type="button"
              aria-label="Scroll"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
              className="hidden md:grid pointer-events-auto absolute right-[clamp(24px,2.4vw,46px)] bottom-[84px] w-[112px] h-[112px] place-items-center bg-transparent border-0 p-0 cursor-pointer group"
            >
              <svg
                className="hv-anim absolute inset-0 w-full h-full text-white/90"
                viewBox="0 0 132 132"
                style={{ animation: "hvSpin 24s linear infinite" }}
                aria-hidden="true"
              >
                <defs>
                  <path id="hvBadgePath" d="M66,66 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
                </defs>
                <text fill="currentColor" fontSize="8.4" letterSpacing="2.6" fontWeight="500" style={{ textTransform: "uppercase" }}>
                  <textPath href="#hvBadgePath" textLength="322" lengthAdjust="spacing">
                    {badgeText}
                  </textPath>
                </text>
              </svg>
              <span className="relative grid place-items-center w-11 h-11 border border-white/50 text-white transition-colors duration-500 group-hover:bg-white group-hover:text-[#0b0b0a]">
                <span>↓</span>
              </span>
            </button>
          </div>

          {/* ── 5 · Intro curtain — two ink halves that part on load ── */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60]">
            <span
              className="hv-anim absolute inset-x-0 top-0 h-1/2 bg-[#0b0b0a]"
              style={{ animation: "hvCurtainTop 1.25s cubic-bezier(.76,0,.24,1) .25s both" }}
            />
            <span
              className="hv-anim absolute inset-x-0 bottom-0 h-1/2 bg-[#0b0b0a]"
              style={{ animation: "hvCurtainBottom 1.25s cubic-bezier(.76,0,.24,1) .25s both" }}
            />
          </div>
        </div>
      </main>

      {/* Back to top — fades in after the hero, custom tooltip on hover */}
      <button
        type="button"
        aria-label={t("hero.moveToTop")}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`group fixed z-[70] right-4 bottom-4 sm:right-6 sm:bottom-6 w-[52px] h-[52px] grid place-items-center bg-[#0b0b0a] text-white border border-white/30 shadow-[0_18px_40px_-14px_rgba(0,0,0,.7)] hover:bg-white hover:text-[#0b0b0a] hover:border-[#0b0b0a] cursor-pointer transition-[opacity,transform,background-color,color,border-color] duration-500 ${
          showTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
        style={{ fontFamily: HERO_FONT }}
      >
        <span className="text-[18px] leading-none">↑</span>
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-current/20 overflow-hidden">
          <span
            ref={topProgressRef}
            className="absolute inset-0 bg-current origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </span>

        {/* Custom tooltip */}
        <span
          role="tooltip"
          className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 transition-all duration-300 ease-out whitespace-nowrap bg-[#0b0b0a] text-white border border-white/25 px-3.5 py-2 text-[10px] font-medium tracking-[0.22em] uppercase"
        >
          {t("hero.moveToTop")}
          <span className="absolute left-full top-1/2 -translate-y-1/2 -ml-[5px] w-2.5 h-2.5 rotate-45 bg-[#0b0b0a] border-t border-r border-white/25" />
        </span>
      </button>

      {/* Sections */}
      <LandingCategories
        data={splashCategories ? { categories: splashCategories } : apiData}
      />
      <LandingCards data={apiData} apiData={apiData} />
      <LandingFeatures data={apiData} />
      <LandingProductFinder data={apiData} />
      {/* <LandingCards title="Best Selling" isBestSeller={true} data={apiData} apiData={apiData} /> */}
      <LandingExpertAdvice data={apiData} />
      <LandingReview data={apiData} />
      {/* <LandingBanner data={apiData} /> */}
      <Footer />
    </>
  );
}
