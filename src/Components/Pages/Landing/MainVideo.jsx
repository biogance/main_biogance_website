'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../Navbar';
import LandingCards from './LandingCards';
import { LandingFeatures } from './LandingFeatures';
import { LandingProductFinder } from './LandingProductFinder';
import LandingExpertAdvice from './LandingExpertAdvice';
import LandingReview from './LandingReview';
import LandingBanner from './LandingBanner';
import Footer from '../Footer';
import LandingCategories from './LandingCategories';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';

// Only one video slide now - images removed
const heroSlides = [
  {
    type: 'video',
    url: '/VIDEO.mp4',
  },
];

// Global cache variable to store the video blob URL so it plays instantly on SPA page navigation
let globalVideoBlobUrl = null;

// Initialize cache check immediately on script load (client-side only)
if (typeof window !== 'undefined' && 'caches' in window) {
  const videoUrl = '/VIDEO.mp4';
  const cacheName = 'biogance-video-cache';

  caches.open(cacheName).then(async (cache) => {
    try {
      const cachedResponse = await cache.match(videoUrl);
      if (cachedResponse) {
       
        const blob = await cachedResponse.blob();
        globalVideoBlobUrl = URL.createObjectURL(blob);
        window.__bioganceVideoBlobUrl = globalVideoBlobUrl;
        window.dispatchEvent(new CustomEvent('biogance-video-blob-ready', { detail: globalVideoBlobUrl }));
      } else {
      
        fetch(videoUrl)
          .then(async (response) => {
            if (response.ok) {
              await cache.put(videoUrl, response.clone());
              const blob = await response.blob();
              globalVideoBlobUrl = URL.createObjectURL(blob);
              window.__bioganceVideoBlobUrl = globalVideoBlobUrl;
              window.dispatchEvent(new CustomEvent('biogance-video-blob-ready', { detail: globalVideoBlobUrl }));
             
            }
          })
          .catch((err) => {
            console.error('[Module Load] Background fetch failed:', err);
          });
      }
    } catch (err) {
      console.error('[Module Load] Cache open/match error:', err);
    }
  });
}

// Preloading removed to avoid connection throttling/range request issues in Firefox
const preloadHeroVideos = () => {
  // Disabled
};

export default function HeroSection() {
  const { t, i18n } = useTranslation('home');
  const isFrench = i18n.language === 'fr';
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const videoSectionRef = useRef(null);
  const videoRef = useRef(null);

  // Initialize state with the global blob URL if it is already loaded
  const [videoSrc, setVideoSrc] = useState(globalVideoBlobUrl || '/VIDEO.mp4');

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

    window.addEventListener('biogance-video-blob-ready', handleBlobReady);
    return () => {
      window.removeEventListener('biogance-video-blob-ready', handleBlobReady);
    };
  }, []);

  const slides = heroSlides;
  const currentSlideData = slides[currentSlide] || slides[0];
  const videoDisplaySrc = currentSlideData?.url === '/VIDEO.mp4' ? videoSrc : currentSlideData?.url;
  const isCurrentVideo = currentSlideData?.type === 'video';
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay was prevented, waiting for user interaction:", error);
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
        videoStillBehindNav && !(isSmallScreen && announcementHidden)
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => { preloadHeroVideos(); }, []);
  const [apiData, setApiData] = useState(null);
  const [splashCategories, setSplashCategories] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load splash categories from localStorage cache first
  useEffect(() => {
    const cached = localStorage.getItem('splashData');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSplashCategories(parsed.categories || []);
      } catch (e) {}
    }

    // Listen for splashDataReady (fired by PageLoader)
    const onSplashReady = () => {
      const updated = localStorage.getItem('splashData');
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setSplashCategories(parsed.categories || []);
        } catch (e) {}
      }
    };
    window.addEventListener('splashDataReady', onSplashReady);
    return () => window.removeEventListener('splashDataReady', onSplashReady);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('homePageData');
    if (cached) {
      try {
        setApiData(JSON.parse(cached));
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem('homePageData');
      }
    }
  }, []);

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
    const payload = {};
    if (loginData?.data?.token) {
      payload.token = loginData.data.token;
    } else {
      payload.device_id = getDeviceId();
    }
    axios.post(`${BASE_URL}/web/home`, payload)
      .then(res => {
        if (res.data.status === false) {
          toast.error(res.data.action);
        } else {
          localStorage.setItem('homePageData', JSON.stringify(res.data.data));
          setApiData(res.data.data);
          // Lets Footer.jsx (rendered on every page, not just this one) pick
          // up the freshly-fetched ranges/etc. without polling — same
          // "fire an event, listeners re-read localStorage" pattern as
          // PageLoader's 'splashDataReady'.
          window.dispatchEvent(new Event('homePageDataReady'));
        }
      })
      .catch(err => console.error('API Error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const heroContent = {
    tagline: t('hero.tagline'),
    heading: t('hero.heading'),
    description: t('hero.description'),
    meta: t('hero.meta'),
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
    document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentImageUrl = currentSlideData?.url;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Navbar handles its own fixed positioning internally (both its
          always-white iOS status-bar strip and its header wrapper are
          independently position:fixed) — wrapping it in another
          position:fixed z-50 div here was redundant, and worse, it caps
          the white strip's z-index:70 at this wrapper's z-50 from the
          outside (z-index only ranks within the stacking context that
          contains it), which is what let the status bar go black again
          specifically on this page's transparent/top-of-scroll state. */}
      <Navbar isVideoVisible={isVideoVisible} />

      {/* Main content with viewport height */}
      <main className="relative bg-white">
        <div ref={videoSectionRef} className="relative w-full bg-[#f3f3f3] h-screen min-h-screen flex items-center justify-center overflow-hidden">
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
                console.error('Video error:', err?.code, err?.message);
                // Fallback: if blob URL failed, switch to direct file
                if (videoSrc !== '/VIDEO.mp4') {
                  setVideoSrc('/VIDEO.mp4');
                }
              }}
              onLoadedData={() => console.log('Video loaded successfully')}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700"
              style={{
                backgroundImage: `url(${currentImageUrl})`
              }}
            ></div>
          )}
          
          {/* Dark Overlay — same gradient used behind the hero text in HOMEPAGE V2.html so white text/buttons stay legible over the video */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,.38) 0%, rgba(0,0,0,.18) 35%, rgba(0,0,0,.08) 60%, rgba(0,0,0,.05) 100%), linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.22))',
            }}
          ></div>

       {/* Content Container */}
      <div className="relative z-10 w-full h-full flex items-center">
            {/* Same left padding as LandingProductFinder.jsx's header
                (px-4/clamp page-x) so the hero text lines up with the
                section headings below it on normal screens. Unlike those
                sections this wrap has NO max-w-[1840px]/mx-auto — the
                video behind it is always full-bleed edge-to-edge, and
                capping+centering this wrap made the heading sit flush
                left up to 1840px viewport width, then visibly slide
                inward (toward center) on wider monitors as the centered
                cap opened up. Dropping the cap keeps the heading pinned
                to the same left inset at every viewport width. */}
            <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
              <div className="max-w-3xl mt-0 md:mt-20 lg:mt-10 xl:mt-12 2xl:mt-20 text-center md:text-left mx-auto md:mx-0">

                {/* Tagline */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2 md:mb-4">
                  <span className="w-[34px] h-px bg-white/90"></span>
                  <p className="text-[10px] font-normal tracking-[0.22em] uppercase text-white/90">
                    {heroContent.tagline}
                  </p>
                </div>

                <h1 className={`${isFrench ? 'text-[clamp(30px,9vw,52px)] sm:text-[clamp(52px,8vw,84px)] md:text-[clamp(60px,8vw,84px)]' : 'text-[clamp(60px,8vw,60px)] lg:text-[clamp(58px,5.5vw,72px)] xl:text-[clamp(60px,5vw,76px)] 2xl:text-[clamp(60px,8vw,80px)]'} uppercase leading-[1] tracking-[-0.082em] mb-2 md:mb-6 text-white break-words`}>
                  {heroContent.heading}
                </h1>

                {/* Description */}
                <p className="text-[16px] mb-[28px] max-w-[520px] mx-auto md:mx-0 leading-[1.72] text-[rgba(255,255,255,.88)]">
                  {heroContent.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center md:justify-start">
                  <button onClick={() => router.push('/shop')} className="min-h-[48px] px-[26px] border border-white bg-[#171717] text-white inline-flex items-center justify-center uppercase text-[9px] tracking-[0.15em] font-[700] cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#171717]">
                    {t('hero.shopNow')}
                  </button>
                  <button onClick={scrollToFinder} className="min-h-[48px] px-[26px] border border-white/70 bg-transparent text-white inline-flex items-center justify-center uppercase text-[9px] tracking-[0.15em] font-[700] cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#171717] hover:border-white">
                    {t('hero.discover')}
                  </button>
                </div>

                {/* Meta line — matches html's .hero-meta below the CTA buttons */}
                <p className="mt-5 md:mt-8 text-[9px] tracking-[0.16em] uppercase text-[rgba(255,255,255,.92)]">
                  {heroContent.meta}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {hasMultipleSlides && (
            <>
              {/* Desktop Navigation */}
              {/* <div className="hidden md:flex absolute bottom-8 lg:bottom-10 right-8 lg:right-10 flex-col items-center gap-4 lg:gap-6 z-20">
                <div className="flex items-center gap-3 lg:gap-4">
                  <button 
                    onClick={goToPrevious}
                    aria-label="Previous slide" 
                    className="w-9 h-9 lg:w-10 lg:h-10 cursor-pointer rounded-full border-2 border-white text-white bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <MdKeyboardArrowLeft size={24} className="lg:w-[30px] lg:h-[30px]" />
                  </button>
                  <button 
                    onClick={goToNext}
                    aria-label="Next slide" 
                    className="w-9 h-9 lg:w-10 lg:h-10 cursor-pointer rounded-full border-2 border-white text-white bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <MdKeyboardArrowRight size={24} className="lg:w-[30px] lg:h-[30px]" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`cursor-pointer rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-8 lg:w-10 h-2 bg-white'
                          : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                      }`}
                    ></div>
                  ))}
                </div>
              </div> */}

              {/* Mobile Navigation */}
              {/* <div className="md:hidden absolute bottom-6 right-6 z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={goToPrevious}
                      aria-label="Previous slide" 
                      className="w-10 h-10 cursor-pointer rounded-full border-2 border-white text-white bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <MdKeyboardArrowLeft size={24} />
                    </button>
                    <button 
                      onClick={goToNext}
                      aria-label="Next slide" 
                      className="w-10 h-10 cursor-pointer rounded-full border-2 border-white text-white bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <MdKeyboardArrowRight size={24} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                      <div
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`cursor-pointer rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'w-8 h-2 bg-white'
                            : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div> */}
            </>
          )}
        </div>
      </main>

      {/* Sections */}
      <LandingCategories data={splashCategories ? { categories: splashCategories } : apiData} />
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