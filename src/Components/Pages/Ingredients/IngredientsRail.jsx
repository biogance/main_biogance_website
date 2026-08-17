'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function ChipShimmer() {
  return <div className="shrink-0 w-24 h-[38px] bg-[#f0efe9] animate-pulse" />;
}

// Ported from .ing-rail — sticky "Change ingredient" horizontal chip
// scroller. Sticks under the real Navbar (top-16/lg:top-[104px], same
// offset convention as BreedLibrary.jsx's sticky toolbar) instead of the
// reference's own 76px/64px mockup header height. Chips mirror whatever
// `ingredients` OurIngredients.jsx currently has loaded (same list/search
// results as IngredientsIndex.jsx) instead of a separate hardcoded name list.
export default function IngredientsRail({ ingredients, loading, selectedId, onSelect, isFrench }) {
  const { t } = useTranslation('ingredients');
  const trackRef = useRef(null);
  // Only scroll the chip row when `selectedId` actually changes from what it
  // was last time we scrolled to it (comparing against a ref, not a one-shot
  // "skip the first run" boolean, so this also stays correct across React 18
  // Strict Mode's dev-only mount→cleanup→mount replay).
  const lastScrolledRef = useRef(selectedId);

  useEffect(() => {
    if (lastScrolledRef.current === selectedId) return;
    lastScrolledRef.current = selectedId;
    const track = trackRef.current;
    const active = track?.querySelector('[data-active="true"]');
    if (!track || !active) return;
   
    const activeCenter = active.offsetLeft + active.offsetWidth / 2;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const target = Math.max(0, Math.min(activeCenter - track.clientWidth / 2, maxScrollLeft));
    track.scrollTo({ left: target, behavior: 'smooth' });
  }, [selectedId]);

  return (
    <div
      data-ingredient-rail
      className="sticky top-16 lg:top-[104px] z-30 border-b border-[#d9d8d1] bg-white"
    >
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          IngredientsHero.jsx. */}
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] py-3 flex items-center gap-4">
        <span className="hidden min-[641px]:inline text-[10px] tracking-[.14em] uppercase text-[#77766f] whitespace-nowrap">
          {t('rail.changeIngredient')}
        </span>
        <div
          ref={trackRef}
          className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ChipShimmer key={i} />)
            : ingredients.map((ing) => {
                const name = (isFrench && ing.french_name) || ing.name;
                const isActive = ing.id === selectedId;
                return (
                  <button
                    key={ing.id}
                    type="button"
                    data-active={isActive}
                    onClick={() => onSelect(ing.id)}
                    className={`shrink-0 whitespace-nowrap tracking-[.06em] uppercase cursor-pointer px-3.5 py-2.5 text-[11px] border transition-all duration-150 ${
                      isActive ? 'bg-black text-white border-black' : 'bg-transparent border-[#d9d8d1] hover:border-black'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
        </div>
      </div>
    </div>
  );
}
