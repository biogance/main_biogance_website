'use client';

import React, { useState } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import Navbar from './Navbar';
import { LandingCategories } from './LandingCategories';
import LandingCards from './LandingCards';
import { LandingFeatures } from './LandingFeatures';
import { LandingProductFinder } from './LandingProductFinder';
import LandingExpertAdvice from './LandingExpertAdvice';
import LandingReview from './LandingReview';
import LandingBanner from './LandingBanner';
import Footer from './Footer';

const heroSlides = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=1920&q=80',
  },
  {
    type: 'video',
    url: 'https://www.youtube.com/embed/uxwk-YslZf0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=uxwk-YslZf0',
    isYouTube: true,
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80',
  },
  {
    type: 'video',
    url: 'https://www.youtube.com/embed/uxwk-YslZf0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=uxwk-YslZf0',
    isYouTube: true,
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

  // Auto-scroll functionality for images only (YouTube videos loop automatically)
  React.useEffect(() => {
    if (!hasMultipleSlides || isCurrentVideo) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [hasMultipleSlides, isCurrentVideo]);

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
        <div className="relative w-full min-h-screen flex items-center justify-center">
          {/* Background Image or Video */}
          {isCurrentVideo ? (
            currentSlideData.isYouTube ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={currentSlideData.url}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
              />
            ) : (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              >
                <source src={currentSlideData.url} type="video/mp4" />
              </video>
            )
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

          {/* Content Container */}
          <div className="relative mt-12 flex items-center justify-start px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 w-full h-full py-20 sm:py-24 md:py-28 lg:py-32">
            <div className="max-w-2xl text-white">
              {/* Tagline */}
              <p className="text-sm md:text-base font-light mb-4 tracking-wide">
                {heroContent.tagline}
              </p>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                {heroContent.heading}
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg mb-8 max-w-xl leading-relaxed">
                {heroContent.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white cursor-pointer text-black px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
                <button className="bg-transparent cursor-pointer border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition-colors">
                  Discover
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows and Dots - Bottom Right */}
          {hasMultipleSlides && (
            <div className="absolute bottom-10 right-10 flex flex-col items-center gap-6 z-10">
              {/* Arrows */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={goToPrevious}
                  aria-label="Previous slide" 
                  className="w-10 h-10 cursor-pointer rounded-full border-2 border-white text-white bg-transparent backdrop-blur-sm flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <MdKeyboardArrowLeft size={30} />
                </button>
                <button 
                  onClick={goToNext}
                  aria-label="Next slide" 
                  className="w-10 h-10 cursor-pointer rounded-full border-2 border-white text-white bg-transparent backdrop-blur-sm flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <MdKeyboardArrowRight size={30} />
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
                        ? 'w-10 h-2 bg-white'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Categories Section */}
      <LandingCategories />
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