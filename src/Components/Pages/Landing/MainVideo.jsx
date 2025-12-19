'use client';

import React, { useState } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import Navbar from '../Navbar';

import LandingCards from './LandingCards';
import { LandingFeatures } from './LandingFeatures';
import { LandingProductFinder } from './LandingProductFinder';
import LandingExpertAdvice from './LandingExpertAdvice';
import LandingReview from './LandingReview';
import LandingBanner from './LandingBanner';
import Footer from '../Footer';
import LandingCategories from './LandingCategories';

const heroSlides = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=1920&q=80',
  },
  {
    type: 'video',
    url: '/LandingVideo.mp4', // Apni video ka naam yahan daalein
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80',
  },
  {
    type: 'video',
    url: '/LandingVideo.mp4', // Apni doosri video ka naam yahan daalein
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1920&q=80',
  },
];

const heroContent = {
  tagline: 'Because pets deserve the best',
  heading: (
    <>
      Organic Care,
      <br />
      Inspired by Nature
    </>
  ),
  description: 'Since 2008, Biogance creates pet care products made in France with natural and organic ingredients for healthier, happier pets.',
};

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasMultipleSlides = heroSlides.length > 1;

  const currentSlideData = heroSlides[currentSlide];
  const isCurrentVideo = currentSlideData.type === 'video';

  // Auto-scroll functionality for both images and videos
  React.useEffect(() => {
    if (!hasMultipleSlides) return;

    // For images: 2.5 seconds, for videos: approximately video duration (30 seconds as estimate)
    const duration = isCurrentVideo ? 49000 : 2500;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, duration);

    return () => clearInterval(interval);
  }, [hasMultipleSlides, isCurrentVideo, currentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const currentImageUrl = heroSlides[currentSlide].url;

  return (
    <>
      {/* Fixed Navbar at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main content with viewport height */}
      <main className="relative bg-white">
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image or Video */}
          {isCurrentVideo ? (
            <video
              key={currentSlideData.url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              onError={(e) => console.error('Video error:', e)}
              onLoadedData={() => console.log('Video loaded successfully')}
            >
              <source src={currentSlideData.url} type="video/mp4" />
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
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Content Container - Fixed responsive structure */}
          <div className="relative z-10 w-full h-full flex items-center">
            <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24">
              <div className="max-w-3xl">
                {/* Tagline */}
                <p className="text-xs sm:text-sm md:text-base font-light mb-3 md:mb-4 tracking-wide text-white/90">
                  {heroContent.tagline}
                </p>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 md:mb-6 text-white">
                  {heroContent.heading}
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl leading-relaxed text-white/90">
                  {heroContent.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button className="bg-white cursor-pointer text-black px-6 md:px-8 py-2.5 md:py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm md:text-base">
                    Shop Now
                  </button>
                  <button className="bg-transparent cursor-pointer border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-medium hover:bg-white/10 transition-colors text-sm md:text-base">
                    Discover
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls - Responsive positioning */}
          {hasMultipleSlides && (
            <>
              {/* Desktop Navigation - Bottom Right */}
              <div className="hidden md:flex absolute bottom-8 lg:bottom-10 right-8 lg:right-10 flex-col items-center gap-4 lg:gap-6 z-20">
                {/* Arrows */}
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

                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, index) => (
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
              </div>

              {/* Mobile Navigation - Bottom Center */}
              <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <div className="flex flex-col items-center gap-4">
                  {/* Dots Indicator */}
                  <div className="flex items-center gap-2">
                    {heroSlides.map((_, index) => (
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

                  {/* Arrows */}
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
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Categories Section */}
      <LandingCategories/>
      <LandingCards />
      <LandingFeatures/>
      <LandingProductFinder/>
      <LandingCards title="Best Selling" />
      <LandingExpertAdvice/>
      <LandingReview/>
      <LandingBanner/>
      <Footer/>
    </>
  );
}