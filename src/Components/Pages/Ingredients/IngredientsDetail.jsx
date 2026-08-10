'use client';

import React, { useEffect, useState } from 'react';
import { FALLBACK_IMAGE } from './ingredientsData';

const TABS = [
  { id: 'origin', label: 'Origin' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'care', label: 'Care' },
];

// Ported from .detail-section/.detail-shell/.tabs — the selected
// ingredient's media + copy + Origin/Benefits/Care tabs + eyebrow tags.
export default function IngredientsDetail({ name, detail }) {
  const [activeTab, setActiveTab] = useState('origin');
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setActiveTab('origin');
    setImgFailed(false);
  }, [name]);

  const tags = detail.eyebrow.split('·').map((t) => t.trim()).filter(Boolean);

  return (
    <section id="ingredient-detail" className="py-[clamp(86px,9vw,145px)]">
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          IngredientsHero.jsx. */}
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] grid grid-cols-1 min-[1001px]:grid-cols-[1.05fr_.95fr] items-start gap-[clamp(40px,5vw,90px)]">
        <div className="relative min-[1001px]:sticky min-[1001px]:top-[164px] bg-[#eee] overflow-hidden min-h-[390px] min-[641px]:min-h-[520px] min-[1001px]:min-h-[680px]">
          <img
            src={imgFailed ? FALLBACK_IMAGE : detail.image || FALLBACK_IMAGE}
            alt={name}
            onError={() => setImgFailed(true)}
            className="w-full h-[390px] min-[641px]:h-[520px] min-[1001px]:h-[680px] object-cover block"
          />
        </div>
        <div>
          <span className="text-[10px] tracking-[.16em] uppercase text-[#77766f]">{detail.eyebrow}</span>
          <h2 className="mt-5 mb-2.5 text-[48px] min-[641px]:text-[clamp(52px,6vw,102px)] leading-[.87] tracking-[-.065em] uppercase font-medium">
            {name}
          </h2>
          <div className="italic text-xl leading-[1.4] text-[#62615c] mb-6.5" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {detail.latin}
          </div>
          <p className="max-w-[650px] mb-[42px] text-xl leading-[1.55]">{detail.intro}</p>

          <div className="flex border-b border-[#d9d8d1] mb-7">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer tracking-[.14em] uppercase mr-6 pt-3.5 pb-3.5 pr-5 text-[10px] border-0 border-b-2 -mb-px ${
                  activeTab === tab.id ? 'text-black border-black' : 'text-[#777] border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-[165px] text-[15px] leading-[1.8] text-[#4e4e49]">{detail[activeTab]}</div>

          <div className="flex flex-wrap gap-[7px] mt-[34px]">
            {tags.map((tag) => (
              <span key={tag} className="border border-[#d9d8d1] tracking-[.1em] uppercase px-3 py-2.5 text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
