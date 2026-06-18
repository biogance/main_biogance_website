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

// Preloading removed to avoid connection throttling/range request issues in Firefox
const preloadHeroVideos = () => {
  // Disabled
};

export default function HeroSection() {
  const { t } = useTranslation('home');
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const videoSectionRef = useRef(null);
  const videoRef = useRef(null);

  const slides = heroSlides;
  const currentSlideData = slides[currentSlide] || slides[0];
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
  }, [currentSlide, isCurrentVideo]);

  useEffect(() => {
    const handleScroll = () => {
      if (!videoSectionRef.current) return;
      const rect = videoSectionRef.current.getBoundingClientRect();
      // jab video section ka bottom navbar (64px) ko touch kare tab white ho
      setIsVideoVisible(rect.bottom > 88);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { preloadHeroVideos(); }, []);
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem('homePageData');
    if (cached) {
      try {
        setApiData(JSON.parse(cached));
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to parse cached homePageData:", e);
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
        }
      })
      .catch(err => console.error('API Error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const heroContent = {
    tagline: t('hero.tagline'),
    heading: t('hero.heading'),
    description: t('hero.description'),
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

  const currentImageUrl = currentSlideData?.url;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Fixed Navbar at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar isVideoVisible={isVideoVisible} />
      </div>

      {/* Main content with viewport height */}
      <main className="relative bg-white">
        <div ref={videoSectionRef} className="relative w-full bg-[#f3f3f3] h-screen min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image or Video */}
          {isCurrentVideo ? (
            <video
              ref={videoRef}
              key={currentSlideData.url}
              src={currentSlideData.url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              onError={(e) => console.error('Video error:', e)}
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
          
          {/* Dark Overlay */}
          {/* <div className="absolute inset-0 bg-black/40"></div> */}

          {/* Content Container */}
          <div className="relative z-10 w-full h-full flex items-center ">
            <div className="w-full px-4 sm:px-6">
              <div className="max-w-3xl mt-20">
                {/* Tagline */}
                <p className="text-xs sm:text-sm md:text-base font-light mb-3 md:mb-4 tracking-wide text-black/90">
                  {heroContent.tagline}
                </p>

                {/* Main Heading */}
                <h1 className="text-7xl sm:text-2xl md:text-7xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-4 md:mb-6 text-black">
                  {heroContent.heading}
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl leading-relaxed text-black/90">
                  {heroContent.description}
                </p>

                {/* CTA Buttons */}
                {/* <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button onClick={() => router.push('/shop')} className="bg-black cursor-pointer text-white px-6 md:px-8 py-2.5 md:py-3  font-medium hover:bg-gray-800 transition-colors text-sm md:text-base">
                    {t('hero.shopNow')}
                  </button>
                  <button onClick={() => router.push('/shop')} className="bg-transparent cursor-pointer border-2 border-black text-black px-6 md:px-8 py-2.5 md:py-3 font-medium hover:bg-black/10 transition-colors text-sm md:text-base">
                    {t('hero.discover')}
                  </button>
                </div> */}
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
      <LandingCategories data={apiData} />
      <LandingCards data={apiData} apiData={apiData} />
      <LandingFeatures data={apiData} />
      <LandingProductFinder data={apiData} />
      <LandingCards title="Best Selling" isBestSeller={true} data={apiData} apiData={apiData} />
      <LandingExpertAdvice data={apiData} />
      <LandingReview data={apiData} />
      <LandingBanner data={apiData} />
      <Footer />
    </>
  );
}