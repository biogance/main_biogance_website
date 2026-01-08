'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
// import { RxCross2 } from "react-icons/rx";

// Loading Card Component (unchanged)
const LoadingCard = () => (
  <div className="group">
    <div 
      className="rounded-2xl border border-[#E3E3E3] p-3 relative mb-3" 
      style={{ 
        backgroundColor: '#f9fafb',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    >
      <div style={{ position: 'absolute', top: '12px', left: '12px', width: '60px', height: '24px', borderRadius: '6px', zIndex: 10, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '12px', zIndex: 10, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="relative h-40 md:h-64 flex items-center justify-center mb-3 md:mb-4 mt-3 md:mt-4">
        <div style={{ border: '2px solid #f3f3f3', borderTop: '2px solid #000000', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <div className="flex justify-center gap-1">
        {[1, 2, 3].map((idx) => (
          <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    </div>
    <div>
      <div style={{ width: '100%', height: '14px', marginBottom: '8px', borderRadius: '4px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '70%', height: '14px', marginBottom: '12px', borderRadius: '4px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="flex items-center justify-between gap-2">
        <div style={{ width: '60px', height: '24px', borderRadius: '4px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: '100px', height: '40px', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200px 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  </div>
);

const LandingCards = ({ product, showNav }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex === 0) return; // Do nothing if already at first
    setCurrentImageIndex((prev) => prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex === product.images.length - 1) return; // Do nothing if already at last
    setCurrentImageIndex((prev) => prev + 1);
  };

  return (
    <div className="group">
      <div className="bg-gray-50 rounded-2xl border border-[#E3E3E3] p-3 relative mb-3">
        {product.discount && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#1FC16B1A] text-black border border-[#84EBB4] text-xs font-semibold px-2 py-1 md:px-3 rounded-md z-10">
            {product.discount}
          </div>
        )}

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 md:top-4 md:right-4 cursor-pointer w-7 h-7 md:w-8 md:h-8 bg-white rounded-xl border border-[#E3E3E3] flex items-center justify-center z-10"
        >
          {isLiked ? (
            <FaHeart className="w-3.5 h-3.5 md:w-4 md:h-4 text-black" />
          ) : (
            <FaRegHeart className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
          )}
        </button>

        <div className="relative h-40 md:h-64 flex items-center justify-center mb-3 md:mb-4 mt-3 md:mt-4">
          {/* Navigation Arrows - Always visible (if multiple images), but disabled at ends */}
          {showNav && product.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                className={`absolute left-[-15px] md:left-[-18px] w-7 h-7 md:w-8 md:h-8 bg-transparent rounded-full flex items-center justify-center z-20 transition-all
                  ${currentImageIndex === 0 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'opacity-70 hover:opacity-100 cursor-pointer'
                  }`}
              >
                <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </button>

              <button
                onClick={handleNextImage}
                disabled={currentImageIndex === product.images.length - 1}
                className={`absolute right-[-15px] md:right-[-18px] w-7 h-7 md:w-8 md:h-8 bg-transparent rounded-full flex items-center justify-center z-20 transition-all
                  ${currentImageIndex === product.images.length - 1 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'opacity-70 hover:opacity-100 cursor-pointer'
                  }`}
              >
                <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </button>
            </>
          )}

          <img
            src={product.images[currentImageIndex] || product.image}
            alt={product.name}
            className="h-28 w-28 md:h-48 md:w-48 object-contain cursor-pointer hover:scale-110 transition-transform duration-500"
          />
        </div>

        {product.images.length > 1 && (
          <div className="flex justify-center gap-1">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                  idx === currentImageIndex ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs md:text-sm text-gray-800 mb-2 md:mb-3 line-clamp-2 md:line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg md:text-xl font-bold text-gray-900">
            €{product.price}
          </span>
          <button className="bg-black text-white cursor-pointer text-xs md:text-sm font-medium px-3 py-2 md:px-5 md:py-2.5 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PopularProducts({ title = 'Popular Products', isWishlist = false }) {
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorite');

  const handleRemoveAll = () => {
    console.log('Remove all clicked');
  };

  const products = [
    // ... (your products array remains exactly the same)
    {
      id: 1,
      name: 'Natural sunscreen for dogs and cats - Sun Protection',
      price: '15.90',
      originalPrice: null,
      discount: '20% Off',
      image:"https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop"
      ],
      liked: false
    },
    {
      id: 2,
      name: 'Refreshing mist for dogs and cats - Fresh',
      price: '12.60',
      originalPrice: null,
      discount: '20% Off',
      image:"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop"
      ],
      liked: true
    },
    {
      id: 3,
      name: 'Universal shampoo 2 in 1 Biogance',
      price: '11.25',
      originalPrice: '35.30',
      discount: null,
      image:"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400&h=400&fit=crop"
      ],
      liked: false
    },
    {
      id: 4,
      name: 'Also Repair Repair Spray',
      price: '12.60',
      originalPrice: null,
      discount: '20% Off',
      image:"https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400&h=400&fit=crop"
      ],
      liked: false
    },
    {
      id: 5,
      name: 'Premium Pet Conditioner',
      price: '18.90',
      originalPrice: '24.90',
      discount: '20% Off',
      image:"https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop"
      ],
      liked: false
    },
    {
      id: 6,
      name: 'Natural Pet Cologne',
      price: '14.50',
      originalPrice: null,
      discount: null,
      image:"https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop"
      ],
      liked: false
    }
  ];

  useEffect(() => {
    const imageUrls = products.flatMap(product => product.images);
    const imagePromises = imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = url;
      });
    });

    Promise.all([Promise.all(imagePromises), new Promise(resolve => setTimeout(resolve, 2000))]).then(() => {
      setIsLoading(false);
    });

    const fallbackTimer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.product-card')?.offsetWidth || 0;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full bg-white">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      <div className={isWishlist ? "px-4" : "px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10"}>
        {isWishlist ? (
          <div className="max-w-7xl mx-auto bg-white py-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Your Products Wishlist</h1>
              <button onClick={handleRemoveAll} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                {/* <X className="w-4 h-4" /> */}
                {/* <RxCross2 /> */}
                Remove All
              </button>
            </div>
            <div className="flex gap-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('favorite')}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === 'favorite' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Favorite Products
              </button>
              <button
                onClick={() => setActiveTab('advice')}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === 'advice' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Favorite Expert Advices
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title} ›</h2>
            <div className="flex gap-2">
              <button onClick={() => scroll('prev')} className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </button>
              <button onClick={() => scroll('next')} className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}

        <div ref={scrollContainerRef} className={isWishlist ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-4" : "flex overflow-x-auto gap-3 md:gap-4 pb-4 hide-scrollbar snap-x snap-mandatory"}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={isWishlist ? "product-card" : "product-card flex-shrink-0 snap-start w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"}>
                  <LoadingCard />
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className={isWishlist ? "product-card" : "product-card flex-shrink-0 snap-start w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"}>
                  <LandingCards product={product} showNav={true} />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}