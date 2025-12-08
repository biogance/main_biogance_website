'use client';

import React, { useState, useRef } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const LandingCards = ({ product, onNext, onPrev, showNav }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      (prev + 1) % product.images.length
    );
  };

  return (
  <div className="group">
  {/* Main Card Container */}
  <div className="bg-gray-50 rounded-2xl border border-[#E3E3E3] p-3 relative mb-3">
    {/* Discount Badge */}
    {product.discount && (
      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#1FC16B1A] text-black border border-[#84EBB4] text-xs font-semibold px-2 py-1 md:px-3 rounded-md z-10">
        {product.discount}
      </div>
    )}

    {/* Like Button */}
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

    {/* Product Image Container */}
    <div className="relative h-48 md:h-64 flex items-center justify-center mb-3 md:mb-4 mt-3 md:mt-4">
      {/* Navigation Arrows */}
      {showNav && product.images.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-[-15] md:left-[-10] cursor-pointer w-7 h-7 md:w-8 md:h-8 bg-transparent rounded-full flex items-center justify-center"
          >
            <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-[-15] md:right-[-10] cursor-pointer w-7 h-7 md:w-8 md:h-8 bg-transparent  rounded-full flex items-center justify-center"
          >
            <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Product Image */}
      <img
        src={product.images[currentImageIndex] || product.image}
        alt={product.name}
        className="h-36 md:h-48 object-contain cursor-pointer hover:scale-110 transition-transform duration-500"
      />
    </div>

    {/* Dots Indicator */}
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

  {/* Product Info - Outside the gray card */}
  <div>
    {/* Product Name */}
    <h3 className="text-xs md:text-sm text-gray-800 mb-2 md:mb-3 line-clamp-2 md:line-clamp-1">
      {product.name}
    </h3>

    {/* Price and Add to Cart */}
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

export default function PopularProducts({ title = 'Popular Products' }) {
  const scrollContainerRef = useRef(null);

  const products = [
    {
      id: 1,
      name: 'Natural sunscreen for dogs and cats - Sun Protection',
      price: '15.90',
      originalPrice: null,
      discount: '20% Off',
      image:"truck.svg",
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
      image:"truck.svg",
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
      image:"truck.svg",
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
      image:"truck.svg",
      images: [
        "truck.svg",
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
      image:"truck.svg",
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
      image:"truck.svg",
      images: [
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=400&fit=crop",
        "earth.svg",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop"
      ],
      liked: false
    }
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.product-card').offsetWidth;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full mx-auto bg-white">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title} ›</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('prev')}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Previous products"
            >
              <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scroll('next')}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Next products"
            >
              <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Products Grid - Responsive */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 md:gap-4 pb-4 hide-scrollbar snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="product-card flex-shrink-0 snap-start w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"
            >
              <LandingCards
                product={product}
                showNav={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}