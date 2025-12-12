import React, { useState, useEffect } from 'react';
import { PiDog } from 'react-icons/pi';

// Shimmer Card Component with inline styles
const ShimmerCard = () => (
  <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-gray-200 flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48">
    {/* Icon Shimmer */}
    <div 
      style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '12px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }} 
    />
    {/* Text Shimmer */}
    <div 
      style={{ 
        width: '80%', 
        height: '14px', 
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }} 
    />
  </div>
);

// Loading Card with Spinner
const LoadingCard = () => (
  <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-gray-200 flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48">
    {/* Icon area with spinner */}
    <div className="w-16 h-16 flex items-center justify-center bg-[#F7F7F7] rounded-xl">
      <div 
        style={{
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #000000',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          animation: 'spin 0.8s linear infinite'
        }}
      />
    </div>
    {/* Text Shimmer */}
    <div 
      style={{ 
        width: '80%', 
        height: '14px', 
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }} 
    />
  </div>
);

export default function LandingCategories() {
  const [loadingState, setLoadingState] = useState('shimmer'); // shimmer, spinner, loaded

  const categories = [
    { icon: PiDog, label: 'Dogs & Puppies' },
    { icon: PiDog, label: 'Cats & Kittens' },
    { icon: PiDog, label: 'Birds' },
    { icon: PiDog, label: 'Fish & Aquarium' },
    { icon: PiDog, label: 'Small Pets' },
    { icon: PiDog, label: 'Reptiles' },
    { icon: PiDog, label: 'Farm Animals' },
    { icon: PiDog, label: 'Pet Accessories' },
    { icon: PiDog, label: 'Pet Food' },
    { icon: PiDog, label: 'Pet Services' },
  ];

  useEffect(() => {
    // First show shimmer for 1.5 seconds
    const shimmerTimer = setTimeout(() => {
      setLoadingState('spinner');
    }, 1500);

    // Then show spinner for 1.5 seconds
    const spinnerTimer = setTimeout(() => {
      setLoadingState('loaded');
    }, 3000);

    return () => {
      clearTimeout(shimmerTimer);
      clearTimeout(spinnerTimer);
    };
  }, []);

  return (
    <section className="bg-gray-100 py-16 px-6">
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-semibold text-black mb-12">
          Explore our curated collections
        </h2>

        {/* Horizontal Scrollable Container */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-6 pb-4">
            {loadingState === 'shimmer'
              ? // Show shimmers
                Array.from({ length: categories.length }).map((_, index) => (
                  <ShimmerCard key={index} />
                ))
              : loadingState === 'spinner'
              ? // Show spinner cards
                Array.from({ length: categories.length }).map((_, index) => (
                  <LoadingCard key={index} />
                ))
              : // Show actual categories
                categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48"
                    >
                      <Icon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-700 rounded-xl bg-[#F7F7F7] p-3" />
                      <p className="text-center text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">
                        {category.label}
                      </p>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
}