"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import forest from "../../../../public/forest.svg"
import Image from 'next/image';

export default function WhoWeBioganceNatural() {
  const { t } = useTranslation('whowe');

  const features = [
    {
      icon: "b1.svg",
      title: t('natural.features.organic.title'),
      description: t('natural.features.organic.description')
    },
    {
      icon: "b2.svg",
      title: t('natural.features.frenchMade.title'),
      description: t('natural.features.frenchMade.description')
    },
    {
      icon: "b3.svg",
      title: t('natural.features.excellence.title'),
      description: t('natural.features.excellence.description')
    },
    {
      icon: "b4.svg",
      title: t('natural.features.certified.title'),
      description: t('natural.features.certified.description')
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center">
        <Image
          src={forest}
          alt={t('natural.imageAlt')}
          fill
          className="object-cover object-center"
          priority               
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-white/10"></div>
        
        {/* Optional: Add a blur effect to simulate the background */}
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {/* Glass Card */}
        <div className="w-full max-w-10xl bg-white/10 backdrop-blur-xs rounded-3xl border border-white/20 p-6 sm:p-8 lg:p-8">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              {t('natural.heading')}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-10xl mx-auto px-2">
              {t('natural.description.part1')}{' '}
              <span className="font-semibold">{t('natural.description.biogance')}</span>{' '}
              {t('natural.description.part2')}{' '}
              <span className="font-semibold">{t('natural.description.products')}</span>.{' '}
              {t('natural.description.part3')}{' '}
              <span className="font-semibold">{t('natural.description.solutions')}</span>.{' '}
              {t('natural.description.part4')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8 sm:mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-4 sm:mb-6">
                  <img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" 
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-md sm:text-base text-white/90 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full cursor-pointer sm:w-auto bg-white text-gray-900 px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg">
              {t('natural.buttons.shopNow')}
            </button>
            <button className="w-full cursor-pointer sm:w-auto bg-transparent text-white px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-semibold border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200">
              {t('natural.buttons.discover')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}