"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function WhoWeBioganceHero() {
  const { t } = useTranslation('whowe');

  // Features ko component ke andar define karein with fallback
  const features = t('hero.features', { returnObjects: true, defaultValue: [] });
  const featuresArray = Array.isArray(features) ? features : [];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-10xl w-full bg-white">
        {/* Main Content Container */}
        <div className="p-6 sm:p-8 lg:p-2">
          {/* Header Text */}
          <div className="text-[13px] sm:text-sm uppercase tracking-widest text-gray-500 mb-3 sm:mb-4 font-medium">
            {t('hero.aboutCompany')}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Right Column - Image Section */}
            <div className="relative order-1 lg:order-2">
              {/* Stats Badge */}
              <div className="absolute rounded-2xl top-[-70] right-[-20] bg-black text-white p-4 sm:p-5 lg:p-6 z-10 w-[280px] sm:w-[300px] lg:w-[400px] shadow-lg">
                <div className="text-[9px] sm:text-[10px] uppercase mb-1 sm:mb-2 tracking-wider text-gray-300 font-medium">
                  {t('hero.badge.trustedBy')}
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                  {t('hero.badge.count')}
                </div>
                <div className="text-[10px] sm:text-xs leading-relaxed text-gray-200">
                  {t('hero.badge.description')}
                </div>
              </div>
              
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl">
                <img src="DG.svg" alt="Biogance" className='w-full h-full object-cover' />
              </div>
            </div>

            {/* Left Column */}
            <div className="flex flex-col order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-4xl font-medium mb-4 sm:mb-6 leading-[1.1] text-gray-900">
                {t('hero.heading')}
              </h1>
              
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                {t('hero.description')}
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
                {featuresArray.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <img src="tick.svg" alt="" className="w-6 h-6" />
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="bg-black cursor-pointer text-white rounded-[18px] px-8 py-3.5 text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors duration-200 w-full sm:w-auto">
                  {t('hero.buttons.shopNow')}
                </button>
                <button className="bg-white cursor-pointer text-black rounded-[18px] px-8 py-3.5 text-sm sm:text-base font-semibold border-2 border-black hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto">
                  {t('hero.buttons.discover')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}