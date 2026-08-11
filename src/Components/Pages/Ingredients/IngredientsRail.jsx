'use client';

import React, { useEffect, useRef } from 'react';
import { INGREDIENT_NAMES } from './ingredientsData';

// Ported from .ing-rail — sticky "Change ingredient" horizontal chip
// scroller. Sticks under the real Navbar (top-16/lg:top-[104px], same
// offset convention as BreedLibrary.jsx's sticky toolbar) instead of the
// reference's own 76px/64px mockup header height.
export default function IngredientsRail({ selected, onSelect }) {
  const trackRef = useRef(null);
  // Only scroll the chip row when `selected` actually changes from what it
  // was last time we scrolled to it — comparing against a ref (instead of a
  // one-shot "skip the first run" boolean) so this stays correct even when
  // React runs the effect an extra time on mount (React 18 Strict Mode's
  // dev-only mount→cleanup→mount replay would otherwise flip a boolean flag
  // and let the scroll fire anyway on that replay). At mount the ref starts
  // equal to `selected`, so every mount-time invocation is a no-op; the
  // rail sits below the full-viewport Hero + Editorial + Index sections, so
  // scrolling to it on load was dragging the whole page down as soon as
  // /ingredients opened.
  const lastScrolledRef = useRef(selected);

  useEffect(() => {
    if (lastScrolledRef.current === selected) return;
    lastScrolledRef.current = selected;
    const active = trackRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selected]);

  return (
    <div className="sticky top-16 lg:top-[104px] z-30 border-b border-[#d9d8d1] bg-white">
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          IngredientsHero.jsx. */}
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] py-3 flex items-center gap-4">
        <span className="hidden min-[641px]:inline text-[10px] tracking-[.14em] uppercase text-[#77766f] whitespace-nowrap">
          Change ingredient
        </span>
        <div
          ref={trackRef}
          className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {INGREDIENT_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              data-active={name === selected}
              onClick={() => onSelect(name)}
              className={`shrink-0 whitespace-nowrap tracking-[.06em] uppercase cursor-pointer px-3.5 py-2.5 text-[11px] border transition-all duration-150 ${
                name === selected ? 'bg-black text-white border-black' : 'bg-transparent border-[#d9d8d1] hover:border-black'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
