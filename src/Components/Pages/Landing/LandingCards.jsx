'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoChevronBack, IoChevronForward, IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
 

// Loading Card Component
const LoadingCard = () => (
  <div className="w-full">
    <div
      className="rounded-2xl border border-gray-200 p-3 relative mb-3 aspect-[3/4]"
      style={{
        backgroundColor: '#f9fafb',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    >
      <div className="absolute top-3 left-3 w-14 h-6 rounded-md bg-gray-300 animate-pulse" />
      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-gray-300 animate-pulse" />
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

const LandingCards = ({ product, showNav }) => {
  const { t } = useTranslation('home');
 
  const [isLiked, setIsLiked] = useState(product.liked || false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex === 0) return;
    setCurrentImageIndex((prev) => prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex === product.images.length - 1) return;
    setCurrentImageIndex((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-50 rounded-2xl border border-gray-200  relative mb-3 aspect-[3/4] flex flex-col">
        {product.discount && (
          <div className="absolute top-3 left-3 bg-green-50 text-black border border-green-200 text-xs font-semibold px-2 py-1 rounded-md z-10">
            {product.discount}
          </div>
        )}

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 cursor-pointer w-8 h-8 bg-white rounded-xl border border-gray-200 flex items-center justify-center z-10 hover:bg-gray-50 transition-colors"
        >
          {isLiked ? (
            <FaHeart className="w-4 h-4 text-black" />
          ) : (
            <FaRegHeart className="w-4 h-4 text-gray-700" />
          )}
        </button>

        <div className="flex-1 flex items-center justify-center relative px-8 py-4">
          {showNav && product.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                className={`absolute left-0 w-7 h-7  bg-transparent flex items-center justify-center z-20 transition-all 
                  ${currentImageIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'opacity-70 hover:opacity-100 cursor-pointer'
                  }`}
              >
                <IoChevronBack className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={handleNextImage}
                disabled={currentImageIndex === product.images.length - 1}
                className={`absolute right-0 w-7 h-7 bg-transparent flex items-center justify-center z-20 transition-all
                  ${currentImageIndex === product.images.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'opacity-70 hover:opacity-100 cursor-pointer'
                  }`}
              >
                <IoChevronForward className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          <img
            src={product.images[currentImageIndex] || product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </div>

        {product.images.length > 1 && (
          <div className="flex justify-center mb-2 gap-1 pb-1">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentImageIndex ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-gray-900">
            €{product.price}
          </span>
          <button className="bg-black text-white cursor-pointer text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
            {t('products.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PopularProducts({ 
  title = 'Popular Products', 
  isWishlist = false, 
  isFavourite = false, 
  isHorizontal = false 
}) {
  const { t } = useTranslation('home');
 
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorite');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const products = [
    {
      id: 1,
      name: 'Natural sunscreen for dogs and cats - Sun Protection',
      price: '15.90',
      discount: '20% Off',
      image: "/product1.svg",
      images: ["/product1.svg", "/product2.svg", "/product3.svg"],
      liked: false
    },
    {
      id: 2,
      name: 'Refreshing mist for dogs and cats - Fresh',
      price: '12.60',
      discount: '20% Off',
      image: "/product1.svg",
      images: ["/product2.svg", "/product1.svg", "/product3.svg"],
      liked: true
    },
    {
      id: 3,
      name: 'Universal shampoo 2 in 1 Biogance',
      price: '11.25',
      originalPrice: '35.30',
      image: "/product1.svg",
      images: ["/product1.svg", "/product3.svg", "/product2.svg"],
      liked: false
    },
    {
      id: 4,
      name: 'Also Repair Repair Spray',
      price: '12.60',
      discount: '20% Off',
      image: "/product1.svg",
      images: ["/product3.svg", "/product2.svg", "/product1.svg"],
      liked: false
    },
    {
      id: 5,
      name: 'Premium Pet Conditioner',
      price: '18.90',
      originalPrice: '24.90',
      discount: '20% Off',
      image: "/product1.svg",
      images: ["/product2.svg", "/product1.svg", "/product3.svg"],
      liked: false
    },
    {
      id: 6,
      name: 'Natural Pet Cologne',
      price: '14.50',
      image: "/product1.svg",
      images: ["/product3.svg", "/product1.svg", "/product2.svg"],
      liked: false
    }
  ];

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const imageUrls = products.flatMap(product => product.images);
    const imagePromises = imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = url;
      });
    });

    Promise.all([
      Promise.all(imagePromises), 
      new Promise(resolve => setTimeout(resolve, 2000))
    ]).then(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 100);
    });

    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 100);
    }, 5000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [isLoading]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer { 
          0% { background-position: -200px 0; } 
          100% { background-position: 200px 0; } 
        }
        .hide-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
        .hide-scrollbar::-webkit-scrollbar { 
          display: none; 
        }
      `}} />

      <div className={
        isFavourite ? "px-4 py-6" : 
        isWishlist ? "px-4 py-6" : 
        "px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10"
      }>
        {isFavourite ? null : isWishlist ? (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t('products.wishlistTitle')}
 
              </h1>
              <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black transition-colors self-start cursor-pointer">
                <IoClose className="w-5 h-5" />
                <span>{t('products.removeAll')}</span>
              </button>
            </div>

            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('favorite')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                  activeTab === 'favorite'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                 {t('products.favoriteProducts')}
 
              </button>
              <button
                onClick={() => setActiveTab('advice')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                  activeTab === 'advice'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                 {t('products.favoriteAdvices')}
 
              </button>
            </div>
          </div>
        ) : isHorizontal ? (
          <div className="flex justify-end mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('prev')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-400 cursor-not-allowed'
                }`}
              >
                <IoChevronBack className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={() => scroll('next')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-400 cursor-not-allowed'
                }`}
              >
                <IoChevronForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title} ›</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('prev')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-300 text-gray-300   cursor-not-allowed'
                }`}
              >
                <IoChevronBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scroll('next')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-300 text-gray-300  cursor-not-allowed'
                }`}
              >
                <IoChevronForward className="w-5 h-5 " />
              </button>
            </div>
          </div>
        )}

        <div 
          ref={scrollContainerRef} 
          className={
            isFavourite || isWishlist
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              : isHorizontal
              ? "flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
              : "flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
          }
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className={
                  isFavourite || isWishlist
                    ? "w-full"
                    : "flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                }
              >
                <LoadingCard />
              </div>
            ))
            : products.map((product) => (
              <div 
                key={product.id} 
                className={
                  isFavourite || isWishlist
                    ? "w-full"
                    : "flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                }
              >
                <LandingCards product={product} showNav={!isFavourite} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}