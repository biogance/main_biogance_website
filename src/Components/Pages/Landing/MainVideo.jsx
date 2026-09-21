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

// Monochrome (white → silver → white) brushed-metal gradient for the primary
// CTA — stays inside the site's black/white theme.
const CTA_GRADIENT =
  "linear-gradient(115deg, #ffffff 0%, #ececea 32%, #c4c4c0 62%, #ffffff 100%)";

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

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Navbar isVideoVisible={isVideoVisible} />

      {/* Main content with viewport height */}
      <main className="relative bg-white">
        <div
          ref={videoSectionRef}
          className="relative w-full bg-[#0c0c0c] h-[calc(100vh+64px)] min-h-[704px] sm:h-[calc(100vh+92px)] sm:min-h-[732px] lg:h-[calc(100vh+122px)] lg:min-h-[762px] flex overflow-hidden"
        >
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&display=swap"
            precedence="default"
          />

          {/* Background Image or Video */}
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
              style={{
                backgroundImage: `url(${currentImageUrl})`,
              }}
            ></div>
          )}

          {/* Overlay — darker on the left where the text sits so white type
              stays legible at every screen size. */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.3) 45%, rgba(0,0,0,.08) 80%), linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 30%)",
            }}
          ></div>

          {/* Content — pinned to the left, always vertically centered at every
              screen size. The top/bottom padding reserves room for the navbar
              and the bottom rail so the block sits in the true visual middle. */}
          <div
            style={{ fontFamily: HERO_FONT }}
            className="relative z-10 w-full self-start h-screen min-h-[640px] flex items-center justify-start px-5 min-[721px]:px-[clamp(24px,2.4vw,46px)] pt-[104px] pb-[84px] min-[721px]:pt-[120px] min-[721px]:pb-[96px]"
          >
            <div className="w-full max-w-[760px] flex flex-col items-start text-left">
              <div className="flex items-center justify-start gap-3 sm:gap-4 mb-4 md:mb-6 text-white/90">
                <span className="hidden sm:inline text-[10px] font-semibold tracking-[0.24em]">
                  BIOGANCE
                </span>
                <span className="hidden sm:block w-10 h-px bg-white/60"></span>
                <p className="text-[9px] sm:text-[10px] font-medium tracking-[0.22em] sm:tracking-[0.28em] uppercase">
                  {heroContent.tagline}
                </p>
              </div>

              <h1
                className={`${isFrench ? "text-[clamp(26px,7.4vw,34px)] sm:text-[clamp(34px,5.6vw,50px)] md:text-[clamp(40px,4.8vw,62px)]" : "text-[clamp(30px,9vw,40px)] sm:text-[clamp(40px,6.6vw,58px)] md:text-[clamp(46px,5.6vw,74px)]"} uppercase leading-[1.02] tracking-[-0.035em] font-light mb-4 md:mb-6 text-white break-words`}
              >
                {heroContent.heading}
              </h1>

              <p className="text-[13px] sm:text-[14px] md:text-[15px] max-w-[520px] leading-[1.75] font-normal text-white/80 mb-7 md:mb-9">
                {heroContent.description}
              </p>

              {/* CTA Buttons — silver-white gradient primary + frosted-glass ghost,
                  both sharp, stacked full-width on phones, side by side from sm up */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch justify-start gap-2.5 sm:gap-3">
                <button
                  onClick={() => router.push("/shop")}
                  style={{ backgroundImage: CTA_GRADIENT, backgroundSize: "220% 100%" }}
                  className="group min-h-[48px] sm:min-h-[54px] px-6 sm:px-8 border border-white/40 text-[#0c0c0c] inline-flex items-center justify-center gap-4 whitespace-nowrap uppercase text-[10px] sm:text-[11px] tracking-[0.16em] font-bold cursor-pointer shadow-[0_14px_34px_-14px_rgba(255,255,255,0.55)] transition-[background-position,transform,box-shadow] duration-500 [background-position:0%_50%] hover:[background-position:100%_50%] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(255,255,255,0.8)]"
                >
                  {t("hero.shopNow")}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
                <button
                  onClick={scrollToFinder}
                  className="min-h-[48px] sm:min-h-[54px] px-6 sm:px-8 border border-white/45 bg-white/10 backdrop-blur-md text-white inline-flex items-center justify-center whitespace-nowrap uppercase text-[10px] sm:text-[11px] tracking-[0.16em] font-bold cursor-pointer transition-all duration-300 hover:bg-white/95 hover:text-[#0c0c0c] hover:border-white hover:-translate-y-0.5"
                >
                  {t("hero.discover")}
                </button>
              </div>
            </div>
          </div>

          {/* Meta rail — pinned to the bottom edge of the first viewport: hairline, meta line left, scroll cue on the right (sm+) */}
          <div className="absolute inset-x-0 top-0 h-screen min-h-[640px] z-10 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] pointer-events-auto">
            <div
              style={{ fontFamily: HERO_FONT }}
              className="relative flex items-center justify-start py-4 sm:py-5 border-t border-white/25"
            >
              <p className="text-[8px] sm:text-[10px] font-medium tracking-[0.16em] sm:tracking-[0.22em] uppercase text-white/85 text-left pr-10">
                {heroContent.meta}
              </p>
              <span
                aria-hidden="true"
                className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-white/25 overflow-hidden"
              >
                <span
                  className="absolute inset-x-0 top-0 h-1/2 bg-white"
                  style={{ animation: "heroScrollCue 1.8s ease-in-out infinite" }}
                />
              </span>
            </div>
          </div>
          </div>
          {/* Wave edge — sits below the fold (the hero is one viewport + the wave's height tall), so it only comes into view as the user scrolls. Two slowly drifting translucent layers plus a solid
              front wave in the next section's colour (#f5f4f0), so the hero
              melts into the page instead of ending on a flat line. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px z-[15] pointer-events-none leading-[0] overflow-hidden h-[64px] sm:h-[92px] lg:h-[122px]"
          >
            <svg
              className="absolute bottom-0 left-0 h-full w-[200%]"
              viewBox="0 0 2880 120"
              preserveAspectRatio="none"
              style={{ animation: "heroWaveDrift 26s linear infinite" }}
            >
              <path
                d="M0,58 C240,14 480,14 720,58 S1200,102 1440,58 C1680,14 1920,14 2160,58 S2640,102 2880,58 L2880,120 L0,120 Z"
                fill="#f5f4f0"
                fillOpacity="0.35"
              />
            </svg>
            <svg
              className="absolute bottom-0 left-0 h-full w-[200%]"
              viewBox="0 0 2880 120"
              preserveAspectRatio="none"
              style={{ animation: "heroWaveDrift 17s linear infinite" }}
            >
              <path
                d="M0,78 C240,110 480,110 720,78 S1200,46 1440,78 C1680,110 1920,110 2160,78 S2640,46 2880,78 L2880,120 L0,120 Z"
                fill="#f5f4f0"
                fillOpacity="0.6"
              />
            </svg>
            <svg
              className="absolute bottom-0 left-0 h-full w-full"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,84 C260,34 520,34 780,74 S1240,112 1440,66 L1440,120 L0,120 Z"
                fill="#f5f4f0"
              />
            </svg>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `@keyframes heroScrollCue { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } } @keyframes heroWaveDrift { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`,
            }}
          />
        </div>
      </main>

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
