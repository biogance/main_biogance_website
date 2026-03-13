"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function WhoWeJourneyLife() {
  const { t } = useTranslation('whowe');
  const [activeYears, setActiveYears] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef(null);
  const yearRefs = useRef([]);

  const timelineData = t('journey.timeline', { returnObjects: true, defaultValue: [] });
  const timelineArray = Array.isArray(timelineData) ? timelineData : [];

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const timeline = timelineRef.current;
      const timelineRect = timeline.getBoundingClientRect();
      const timelineTop = timelineRect.top;
      const timelineHeight = timelineRect.height;
      const viewportHeight = window.innerHeight;
      
      const startOffset = viewportHeight * 0.5;
      const scrolled = startOffset - timelineTop;
      const progress = Math.max(0, Math.min(1, scrolled / timelineHeight));
      setScrollProgress(progress);

      const newActiveYears = new Set();
      yearRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const itemTop = rect.top;
          const itemCenter = itemTop + 20;
          
          if (itemCenter <= viewportHeight / 2) {
            newActiveYears.add(index);
          }
        }
      });
      
      setActiveYears(newActiveYears);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 lg:mb-24">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-medium">
            {t('journey.subtitle')}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 leading-tight">
            {t('journey.heading.line1')}<br />
            {t('journey.heading.line2')}
          </h1>
        </div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative">
          {/* Center Vertical Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-300 transform -translate-x-1/2">
            <div 
              className="absolute top-0 left-0 w-full bg-gray-900"
              style={{ height: `${scrollProgress * 100}%`, transition: 'height 0.1s linear' }}
            />
          </div>

          {/* Mobile Vertical Line */}
          <div className="lg:hidden absolute left-[46px] top-0 bottom-0 w-[2px] bg-gray-300">
            <div 
              className="absolute top-0 left-0 w-full bg-gray-900"
              style={{ height: `${scrollProgress * 100}%`, transition: 'height 0.1s linear' }}
            />
          </div>

          {/* Timeline Items */}
          <div className="space-y-16 lg:space-y-20">
            {timelineArray.map((item, index) => (
              <div key={index} className="relative" ref={el => yearRefs.current[index] = el}>
                
                {/* Mobile Layout */}
                <div className="lg:hidden flex gap-6 relative z-10">
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className={`text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-300 ${
                      activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                    }`}>
                      {item.year}
                    </div>
                    <div className={`w-3 h-3 rounded-full my-3 border-[3px] transition-all duration-300 ${
                      activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                    }`}></div>
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="w-24 h-24 flex items-center justify-center mb-4 border border-gray-200 bg-white p-2">
                      <img src={item.logo} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block">
                  {item.position === "right" ? (
                    <div className="grid grid-cols-2 gap-12 items-start">
                      <div className="flex justify-end pr-12">
                        <div className="text-right">
                          <div className={`inline-block text-white text-sm font-bold px-5 py-2 rounded-full transition-colors duration-300 ${
                            activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                          }`}>
                            {item.year}
                          </div>
                        </div>
                      </div>

                      <div className="absolute left-1/2 top-3 transform -translate-x-1/2 z-10">
                        <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                          activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                        }`}></div>
                      </div>

                      <div className="p-8 bg-white">
                        <div className="w-28 h-28 flex items-center justify-center mb-5 bg-white p-3">
                          <img src={item.logo} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-12 items-start">
                      <div className="pr-12 flex flex-col items-start bg-white p-8">
                        <div className="w-28 h-28 flex items-center justify-center mb-5">
                          <img src={item.logo} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="absolute left-1/2 top-3 transform -translate-x-1/2 z-10">
                        <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                          activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                        }`}></div>
                      </div>

                      <div className="pl-12">
                        <div className={`inline-block text-white text-sm font-bold px-5 py-2 rounded-full transition-colors duration-300 ${
                          activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                        }`}>
                          {item.year}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}