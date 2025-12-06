import React from 'react';
import { FaCheck } from 'react-icons/fa';

export default function WhoWeBioganceHero() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-10xl w-full bg-white">
        {/* Main Content Container */}
        <div className="p-6 sm:p-8 lg:p-2 ">
          {/* Header Text */}
          <div className="text-[13px] sm:text-sm uppercase tracking-widest text-gray-500 mb-3 sm:mb-4 font-medium">
            ABOUT OUR COMPANY
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Right Column - Image Section (Shows first on mobile) */}
            <div className="relative order-1 lg:order-2">
              {/* Stats Badge - Consistent positioning */}
              <div className="absolute rounded-2xl top-[-70] right-[-20] bg-black text-white p-4 sm:p-5 lg:p-6 z-10 w-[280px] sm:w-[300px] lg:w-[400px] shadow-lg">
                <div className="text-[9px] sm:text-[10px] uppercase mb-1 sm:mb-2 tracking-wider text-gray-300 font-medium">
                  Trusted By Pet Lovers
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                  1,200,000+
                </div>
                <div className="text-[10px] sm:text-xs leading-relaxed text-gray-200">
                  Biogance delivers safe, natural, and eco-certified 
                  care trusted in over 70 countries, ensuring healthier, 
                  happier pets every day.
                </div>
              </div>
              
              {/* Image Container */}
              <div className="relative  overflow-hidden rounded-2xl">
                <img src="DG.svg" alt="" className='w-full h-full object-cover' />
              </div>
            </div>

            {/* Left Column (Shows second on mobile) */}
            <div className="flex flex-col order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-4xl font-medium mb-4 sm:mb-6 leading-[1.1] text-gray-900">
                Biogance – Pioneers in Natural Pet Care Since 2008
              </h1>
              
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Biogance was founded in France with a simple mission: create safe, 
                eco-friendly, and effective care for pets. By combining science, nature, and 
                a deep respect for animals, we've developed formulas that respect both pets' well-being 
                and the environment.
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
                <div className="flex items-start gap-3">
                  <img src="tick.svg" alt="" className="w-6 h-6" />
                  <span className="text-sm sm:text-base text-gray-700">Over 15 Years of Expertise</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <img src="tick.svg" alt="" className="w-6 h-6" />
                  <span className="text-sm sm:text-base text-gray-700">98% Natural & Organic Formulas</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <img src="tick.svg" alt="" className="w-6 h-6" />
                  <span className="text-sm sm:text-base text-gray-700">100% Made in France</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <img src="tick.svg" alt="" className="w-6 h-6" />
                  <span className="text-sm sm:text-base text-gray-700">Award-Winning & Globally Trusted</span>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="bg-black text-white rounded-[18px] px-8 py-3.5 text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors duration-200 w-full sm:w-auto">
                  Shop Now
                </button>
                <button className="bg-white text-black rounded-[18px] px-8 py-3.5 text-sm sm:text-base font-semibold border-2 border-black hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto">
                  Discover
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}