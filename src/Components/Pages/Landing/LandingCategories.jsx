import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { MEDIA_URL } from '../../API/API';

// A row shows 6 cards at a time, no gap between them (same as the html's
// border-collapsed grid) — width is simply 1/6th of the scroll container.
const CARD_WIDTH = 'w-[calc(100%/6)]';

// Shimmer tile — mirrors the real card box (same size, border, gaps as HOMEPAGE V2.html's .collection-tile)
const ShimmerCard = () => (
  <div className={`relative bg-white border-r border-b border-[#d8d8d4] min-h-[205px] ${CARD_WIDTH} flex-shrink-0 px-[18px] pt-[22px] pb-[20px] flex flex-col items-center justify-center gap-[22px]`}>
    <div
      className="w-[52px] h-[52px]"
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
    <div
      className="w-[70%] h-[14px] rounded"
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  </div>
);

// Loading tile with spinner
const LoadingCard = () => (
  <div className={`relative bg-white border-r border-b border-[#d8d8d4] min-h-[205px] ${CARD_WIDTH} flex-shrink-0 px-[18px] pt-[22px] pb-[20px] flex flex-col items-center justify-center gap-[22px]`}>
    <div className="w-[52px] h-[52px] flex items-center justify-center">
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
    <div
      className="w-[70%] h-[14px] rounded"
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  </div>
);

export default function LandingCategories({ data }) {
  const { t, i18n } = useTranslation('home');
  const router = useRouter();
  const isFrench = i18n.language === 'fr';
  const [loadingState, setLoadingState] = useState('shimmer');

  const categories = data?.categories || [];

  useEffect(() => {
    if (categories.length > 0) {
      setLoadingState('loaded');
      return;
    }
    const shimmerTimer = setTimeout(() => setLoadingState('spinner'), 1500);
    const spinnerTimer = setTimeout(() => setLoadingState('loaded'), 3000);
    return () => {
      clearTimeout(shimmerTimer);
      clearTimeout(spinnerTimer);
    };
  }, [categories.length]);

  return (
    // "Explore our collections" section — same editorial/monochrome design as
    // HOMEPAGE V2.html's .collections section, kept as a horizontal scroller
    // (6 cards visible at a time, same width/height as the html tiles),
    // with card data coming from the API.
    <section className="bg-[#f6f6f4] py-[clamp(82px,9vw,138px)]">
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />

      <div className="w-full max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">

        {/* Editorial head — matches .collections-editorial-head */}
        <div className="grid grid-cols-1 min-[1101px]:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-[26px] min-[721px]:gap-[clamp(34px,4vw,64px)] items-end mb-[34px] min-[721px]:mb-[52px]">
          <div>
            <div className="flex items-center gap-3 text-black">
              <span className="w-[34px] h-px bg-current"></span>
              <span className="text-[10px] tracking-[0.22em] uppercase">{t('categories.eyebrow')}</span>
            </div>
            <h2 className="mt-[18px] mb-0 text-[50px] min-[721px]:text-[clamp(48px,7vw,108px)] leading-[0.87] tracking-[-0.072em] uppercase font-[100] text-black">
              {t('categories.headingLine1')}<br />{t('categories.headingLine2')}
            </h2>
          </div>
          <p className="mb-2 max-w-[600px] text-[#595955] text-[15px] leading-[1.75]">
            {t('categories.subtitle')}
          </p>
        </div>

        {/* Horizontal scrollable tiles — 6 visible at a time, no gap, same card design as .collection-tile */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex border-t border-l border-[#d8d8d4]">
            {loadingState === 'shimmer'
              ? Array.from({ length: 6 }).map((_, index) => (
                  <ShimmerCard key={index} />
                ))
              : loadingState === 'spinner'
              ? Array.from({ length: 6 }).map((_, index) => (
                  <LoadingCard key={index} />
                ))
              : categories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => router.push(`/shop?category_id=${category.id}&category_name=${encodeURIComponent(isFrench && category.french_name ? category.french_name : category.name)}`)}
                    className={`group relative bg-white border-r border-b border-[#d8d8d4] min-h-[205px] ${CARD_WIDTH} flex-shrink-0 px-[18px] pt-[22px] pb-[20px] flex flex-col items-center justify-center gap-[22px] overflow-hidden text-black cursor-pointer transition-colors duration-[250ms] hover:bg-black hover:border-black`}
                  >
                    <div className="relative w-full min-h-[72px] flex items-center justify-center">
                      <span className="absolute top-0 left-0 text-[9px] tracking-[0.16em] uppercase text-[#757571] transition-colors duration-[250ms] group-hover:text-white/60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {/* Icon only — no background box. Forced black by default,
                          inverted to white on hover, same as .collection-icon in the html. */}
                      <img
                        src={`${MEDIA_URL}${category.media}`}
                        alt={category.name}
                        className="w-[52px] h-[52px] object-contain brightness-0 transition-all duration-[250ms] group-hover:invert"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex items-center justify-center w-full text-center">
                      <span className="max-w-[160px] text-[15px] font-medium leading-[1.2] text-inherit group-hover:text-white transition-colors duration-[250ms]">
                        {isFrench && category.french_name ? category.french_name : category.name}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
