import React from 'react';
import { FaLeaf, FaTrophy, FaCertificate } from 'react-icons/fa';
import { GiTowerFlag } from 'react-icons/gi';

export default function WhoWeBioganceNatural() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/forest.svg')",
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-white/10"></div>
        
        {/* Optional: Add a blur effect to simulate the background */}
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {/* Glass Card */}
        <div className="w-full max-w-10xl bg-white/10 backdrop-blur-xs rounded-3xl border border-white/20  p-6 sm:p-8 lg:p-8">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Biogance – Care the Natural Way
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-10xl mx-auto px-2">
              Founded in 2008 in the heart of France, <span className="font-semibold">Biogance</span> is a pioneering laboratory dedicated to creating{' '}
              <span className="font-semibold">organic and natural hygiene & care products for pets</span>. With 
              a team of experts in biochemistry, pharmacy, and animal breeding, our mission is simple: prioritize animal well-being while{' '}
              <span className="font-semibold">innovating with eco-responsible solutions</span>. Present in more than 40 countries, Biogance continues to grow as a trusted name in pet care.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8 sm:mb-12">
            
            {/* Feature 1 - Organic */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 sm:mb-6">
                <img src="b1.svg" alt=""className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Organic
              </h3>
              <p className="text-md sm:text-base text-white/90 leading-relaxed">
                Formulas enriched with organic & natural ingredients.
              </p>
            </div>

            {/* Feature 2 - French-Made */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 sm:mb-6">
                <img src="b2.svg" alt=""className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                French-Made
              </h3>
              <p className="text-md sm:text-base text-white/90 leading-relaxed">
                Proudly developed and produced in France.
              </p>
            </div>

            {/* Feature 3 - Recognized Excellence */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 sm:mb-6">
                <img src="b3.svg" alt=""className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Recognized Excellence
              </h3>
              <p className="text-md sm:text-base text-white/90 leading-relaxed">
                Global awards for innovation and growth.
              </p>
            </div>

            {/* Feature 4 - Certified Care */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 sm:mb-6">
                <img src="b4.svg" alt=""className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Certified Care
              </h3>
              <p className="text-md sm:text-base text-white/90 leading-relaxed">
                ECOCERT & ISO certified for safety and trust.
              </p>
            </div>

          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full cursor-pointer sm:w-auto bg-white text-gray-900 px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg">
              Shop Now
            </button>
            <button className="w-full cursor-pointer sm:w-auto bg-transparent text-white px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-semibold border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200">
              Discover
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}