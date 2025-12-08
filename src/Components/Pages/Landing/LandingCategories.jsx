import React from 'react';
import { PiDog } from 'react-icons/pi';

export const LandingCategories = () => {
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

  return (
    <section className="bg-gray-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-semibold text-black mb-12">
          Explore our curated collections
        </h2>

        {/* Horizontal Scrollable Container */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-6 pb-4">
            {categories.map((category, index) => {
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

      {/* Hide Scrollbar - Webkit Browsers */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </section>
  );
};