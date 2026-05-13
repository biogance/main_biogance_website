"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import toast, { Toaster } from 'react-hot-toast';

// ── Journey Image with loader (same pattern as CertImage in Certifications.jsx) ──
const JourneyImage = ({ src, alt, className, wrapperClassName }) => {
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div className={`relative flex items-center justify-center ${wrapperClassName}`}>
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid rgba(0,0,0,.1)',
            borderTopColor: '#555',
            animation: 'journeySpin 1s linear infinite',
          }} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setImgLoading(false)}
        onError={() => setImgLoading(false)}
      />
    </div>
  );
};

export default function WhoWeJourneyLife({ onDataLoaded }) {
  const { t } = useTranslation('whowe');
  const [activeYears, setActiveYears] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timelineArray, setTimelineArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef(null);
  const yearRefs = useRef([]);

  // ─── API se data fetch karo ───────────────────────────────────────────────
  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const res = await fetch(`${BASE_URL}/app/our-journey`);
        const data = await res.json();

        if (data.status === false || data.status === 'false' || !res.ok) {
          const msg =
            data.errors?.length > 0
              ? data.errors[0].message
              : data.action || data.title || 'Something went wrong.';
          toast.error(msg);
          onDataLoaded?.(false);
        } else if (Array.isArray(data.data) && data.data.length > 0) {
          const formatted = data.data.map((item, index) => ({
            id: item.id,
            year: item.year,
            logo: `${MEDIA_URL.replace(/\/$/, '')}/${item.media}`,
            title: item.title,
            description: item.description,
            position: index % 2 === 0 ? 'right' : 'left',
          }));
          setTimelineArray(formatted);
          onDataLoaded?.(true);
        } else {
          onDataLoaded?.(false);
        }
      } catch (err) {
        console.error('Journey fetch error:', err);
        toast.error('Something went wrong. Please try again.');
        onDataLoaded?.(false);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, []);

  // ─── Scroll progress + active years ──────────────────────────────────────
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
          const itemCenter = rect.top + 20;
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

  // ─── Loading / empty guard ────────────────────────────────────────────────
  if (loading || timelineArray.length === 0) return null;

  // ─── Original design — bilkul same JSX ───────────────────────────────────
  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

      {/* Spinner keyframe — same name pattern as certSpin */}
      <style>{`@keyframes journeySpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

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
            <div className="lg:hidden absolute left-[16px] top-0 bottom-0 w-[2px] bg-gray-300">
              <div
                className="absolute top-0 left-0 w-full bg-gray-900"
                style={{ height: `${scrollProgress * 100}%`, transition: 'height 0.1s linear' }}
              />
            </div>

            {/* Timeline Items */}
            <div className="space-y-16 lg:space-y-20">
              {timelineArray.map((item, index) => (
                <div key={item.id} className="relative" ref={el => yearRefs.current[index] = el}>

                  {/* ── Mobile Layout ── */}
                  <div className="lg:hidden relative z-10 pb-8">

                    {/* Year badge — line ke bilkul upar, left side pe */}
                    <div className="mb-1 pl-1">
                      <div className={`inline-block text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-300 ${
                        activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                      }`}>
                        {item.year}
                      </div>
                    </div>

                    <div className="flex gap-6">
                      {/* Dot — line pe centered, left-[16px] se match kare */}
                      <div className="flex-shrink-0 flex justify-center" style={{ width: 34 }}>
                        <div className={`w-3 h-3 rounded-full border-[3px] transition-all duration-300 mt-1.5 ${
                          activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                        }`}></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <JourneyImage
                          src={item.logo}
                          alt={item.title}
                          wrapperClassName="w-24 h-24 mb-4 border border-gray-200 bg-white p-2"
                          className="w-full h-full object-contain"
                        />
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Desktop Layout ── */}
                  <div className="hidden lg:block">
                    {item.position === "right" ? (
                      <div className="grid grid-cols-2 gap-12 items-start">

                        {/* Year — left side */}
                        <div className="flex justify-end pr-12">
                          <div className="text-right">
                            <div className={`inline-block text-white text-sm font-bold px-5 py-2 rounded-full transition-colors duration-300 ${
                              activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                            }`}>
                              {item.year}
                            </div>
                          </div>
                        </div>

                        {/* Dot */}
                        <div className="absolute left-1/2 top-3 transform -translate-x-1/2 z-10">
                          <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                            activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                          }`}></div>
                        </div>

                        {/* Card — right side */}
                        <div className="p-8 bg-white">
                          {/* ↓ JourneyImage with loader */}
                          <JourneyImage
                            src={item.logo}
                            alt={item.title}
                            wrapperClassName="w-28 h-28 mb-5 bg-white p-3"
                            className="w-full h-full object-contain"
                          />
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

                        {/* Card — left side */}
                        <div className="pr-12 flex flex-col items-start bg-white p-8">
                          {/* ↓ JourneyImage with loader */}
                          <JourneyImage
                            src={item.logo}
                            alt={item.title}
                            wrapperClassName="w-28 h-28 mb-5"
                            className="w-full h-full object-contain"
                          />
                          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Dot */}
                        <div className="absolute left-1/2 top-3 transform -translate-x-1/2 z-10">
                          <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                            activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                          }`}></div>
                        </div>

                        {/* Year — right side */}
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
    </>
  );
}