'use client';

import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { MEDIA_URL } from '../../API/API';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85';

// Ids only — labels come from the `ingredients` namespace's detail.tabs.*
// keys (see TABS.map below) so they're never hardcoded English.
const TAB_IDS = ['origin', 'benefits', 'care'];



function DetailSkeleton() {
  return (
    <section id="ingredient-detail" className="scroll-mt-[126px] lg:scroll-mt-[166px] py-[clamp(86px,9vw,145px)]">
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] grid grid-cols-1 min-[1001px]:grid-cols-[1.05fr_.95fr] items-start gap-[clamp(40px,5vw,90px)]">
        <div className="bg-[#eee] animate-pulse min-h-[390px] min-[641px]:min-h-[520px] min-[1001px]:h-[calc(100vh-206px)] min-[1001px]:min-h-[420px] min-[1001px]:max-h-[680px]" />
        <div>
          <div className="h-3 w-40 bg-[#eee] rounded animate-pulse mb-5" />
          <div className="h-16 w-3/4 bg-[#eee] rounded animate-pulse mb-4" />
          <div className="h-5 w-1/3 bg-[#eee] rounded animate-pulse mb-6.5" />
          <div className="space-y-2 mb-[42px]">
            <div className="h-5 w-full bg-[#eee] rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-[#eee] rounded animate-pulse" />
          </div>
          <div className="flex gap-6 border-b border-[#d9d8d1] mb-7 pb-3.5">
            {TAB_IDS.map((id) => (
              <div key={id} className="h-3 w-14 bg-[#eee] rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-[#eee] rounded animate-pulse" />
            <div className="h-4 w-full bg-[#eee] rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-[#eee] rounded animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}


function DetailEmpty() {
  const { t } = useTranslation('ingredients');
  return (
    <section id="ingredient-detail" className="scroll-mt-[126px] lg:scroll-mt-[166px] py-[clamp(86px,9vw,145px)]">
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] flex flex-col items-center justify-center gap-4 text-center min-h-[390px] min-[641px]:min-h-[520px] min-[1001px]:min-h-[420px] mx-auto max-w-[440px]">
        <div className="w-16 h-16 rounded-full border border-[#d9d8d1] flex items-center justify-center text-[#a9a89f]">
          <FiSearch className="w-6 h-6" />
        </div>
        <h2 className="text-2xl uppercase tracking-[-.03em] font-medium text-black">{t('detail.emptyTitle')}</h2>
        <p className="text-[15px] leading-[1.6] text-[#77766f]">{t('detail.emptyBody')}</p>
      </div>
    </section>
  );
}


function DetailContent({ ingredient, isFrench }) {
  const { t } = useTranslation('ingredients');
  const [activeTab, setActiveTab] = useState('origin');
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const name = (isFrench && ingredient.french_name) || ingredient.name;
  const latin = (isFrench && ingredient.french_sub_name) || ingredient.sub_name;
  const intro = (isFrench && ingredient.french_description) || ingredient.description;
  const content = {
    origin: (isFrench && ingredient.french_origin) || ingredient.origin,
    benefits: (isFrench && ingredient.french_benefit) || ingredient.benefit,
    care: (isFrench && ingredient.french_care) || ingredient.care,
  };
  const imageUrl = ingredient.media ? `${MEDIA_URL}${ingredient.media}` : FALLBACK_IMAGE;
  const tags = (ingredient.tags || []).map((tg) => tg.name).filter(Boolean);

  return (
    <section id="ingredient-detail" className="scroll-mt-[126px] lg:scroll-mt-[166px] py-10">
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          IngredientsHero.jsx. */}
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] grid grid-cols-1 min-[1001px]:grid-cols-[1.05fr_.95fr] items-start gap-[clamp(40px,5vw,90px)]">
      
        <div className="relative min-[1001px]:sticky min-[1001px]:top-[166px] bg-[#eee] overflow-hidden min-h-[390px] min-[641px]:min-h-[520px] min-[1001px]:h-[calc(100vh-206px)] min-[1001px]:min-h-[420px] min-[1001px]:max-h-[680px]">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-9 h-9 border-2 border-black/15 border-t-black rounded-full animate-spin" />
            </div>
          )}
          <img
            src={imgFailed ? FALLBACK_IMAGE : imageUrl}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgFailed(true);
              setImgLoaded(false); // keep the loader up through the fallback image's own load
            }}
            className={`relative z-10 w-full h-[390px] min-[641px]:h-[520px] min-[1001px]:h-full object-cover block transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        <div>
          <span className="text-[10px] tracking-[.16em] uppercase text-[#77766f]">{t('detail.eyebrow')}</span>
          <h2 className="mt-5 mb-2.5 text-[48px] min-[641px]:text-[clamp(52px,6vw,102px)] leading-[.87] tracking-[-.065em] uppercase font-medium">
            {name}
          </h2>
          {latin && (
            <div className="italic text-xl leading-[1.4] text-[#62615c] mb-6.5" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {latin}
            </div>
          )}
          {intro && <p className="max-w-[650px] mb-[42px] text-xl leading-[1.55]">{intro}</p>}

          <div className="flex border-b border-[#d9d8d1] mb-7">
            {TAB_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`cursor-pointer tracking-[.14em] uppercase mr-6 pt-3.5 pb-3.5 pr-5 text-[10px] border-0 border-b-2 -mb-px ${
                  activeTab === id ? 'text-black border-black' : 'text-[#777] border-transparent'
                }`}
              >
                {t(`detail.tabs.${id}`)}
              </button>
            ))}
          </div>
          <div className="min-h-[165px] text-[15px] leading-[1.8] text-[#4e4e49]">{content[activeTab]}</div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[7px] mt-[34px]">
              {tags.map((tag, i) => (
                <span key={`${tag}-${i}`} className="border border-[#d9d8d1] tracking-[.1em] uppercase px-3 py-2.5 text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


export default function IngredientsDetail({ ingredient, loading, isFrench }) {
  if (loading) return <DetailSkeleton />;
  if (!ingredient) return <DetailEmpty />;
  return <DetailContent key={ingredient.id} ingredient={ingredient} isFrench={isFrench} />;
}
