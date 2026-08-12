'use client';

import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { MEDIA_URL } from '../../API/API';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85';

const TABS = [
  { id: 'origin', label: 'Origin' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'care', label: 'Care' },
];

// scroll-mt on #ingredient-detail (both the skeleton and the real content
// below share this) reserves room for the stuck Navbar (64px mobile/104px
// desktop) + IngredientsRail (~62px) stack that sits directly above this
// section — so any *native* browser scroll into this section (a URL
// fragment jump, keyboard-focus scrolling, etc.) also lands below both
// instead of the rail's sticky box covering the top of this content.
// OurIngredients.jsx's own click-driven scroll (handleSelect) computes its
// target manually instead of relying on this + scrollIntoView, since that
// combination didn't reliably account for the sticky rail sitting between
// the viewport and the target.

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
            {TABS.map((tab) => (
              <div key={tab.id} className="h-3 w-14 bg-[#eee] rounded animate-pulse" />
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

// Shown once loading has actually finished and there's still no ingredient
// to show (e.g. a search with zero results, so OurIngredients.jsx never got
// an id to select) — without this, IngredientsDetail fell back to
// DetailSkeleton for that case too, which kept the shimmer spinning forever
// since nothing was ever going to arrive to replace it.
function DetailEmpty() {
  return (
    <section id="ingredient-detail" className="scroll-mt-[126px] lg:scroll-mt-[166px] py-[clamp(86px,9vw,145px)]">
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] flex flex-col items-center justify-center gap-4 text-center min-h-[390px] min-[641px]:min-h-[520px] min-[1001px]:min-h-[420px] mx-auto max-w-[440px]">
        <div className="w-16 h-16 rounded-full border border-[#d9d8d1] flex items-center justify-center text-[#a9a89f]">
          <FiSearch className="w-6 h-6" />
        </div>
        <h2 className="text-2xl uppercase tracking-[-.03em] font-medium text-black">No ingredient to show</h2>
        <p className="text-[15px] leading-[1.6] text-[#77766f]">
          Try a different search term above, or pick an ingredient from the list to see its full details here.
        </p>
      </div>
    </section>
  );
}

// The actual content, split out from the default export and mounted with
// `key={ingredient.id}` below — remounting on ingredient change resets
// `activeTab`/`imgFailed` back to their initial values for free, instead of
// an effect calling setState to reset them (which fires an extra render on
// every selection change).
function DetailContent({ ingredient, isFrench }) {
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
  const tags = (ingredient.tags || []).map((t) => t.name).filter(Boolean);

  return (
    <section id="ingredient-detail" className="scroll-mt-[126px] lg:scroll-mt-[166px] py-[clamp(86px,9vw,145px)]">
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          IngredientsHero.jsx. */}
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] grid grid-cols-1 min-[1001px]:grid-cols-[1.05fr_.95fr] items-start gap-[clamp(40px,5vw,90px)]">
        {/* min-[1001px]:h-[calc(100vh-206px)] (clamped 420–680px) instead of
            a flat 680px — that used to make the image taller than shorter
            viewports could show, so it never fit entirely below the stuck
            Navbar+Rail (top-[166px], matching their combined 104/64+~62px
            height) and looked like it wasn't "staying in place" as you
            scrolled the text beside it. Sized to the viewport, it's always
            fully visible while pinned, and the (usually much longer) text
            column keeps scrolling past it underneath. */}
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
          <span className="text-[10px] tracking-[.16em] uppercase text-[#77766f]">Biogance ingredient library</span>
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
          <div className="min-h-[165px] text-[15px] leading-[1.8] text-[#4e4e49]">{content[activeTab]}</div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[7px] mt-[34px]">
              {tags.map((tag, i) => (
                <span key={`${tag}-${i}`} className="border border-[#d9d8d1] tracking-[.1em] uppercase px-3 py-2.5 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Ported from .detail-section/.detail-shell/.tabs — the selected
// ingredient's media + copy + Origin/Benefits/Care tabs + tag list. Backed
// by OurIngredients.jsx's GET {BASE_URL}/ingredient/detail/{id} call
// (fired whenever the selected id changes), localized to each field's
// french_* counterpart when the site is in French.
export default function IngredientsDetail({ ingredient, loading, isFrench }) {
  if (loading) return <DetailSkeleton />;
  if (!ingredient) return <DetailEmpty />;
  return <DetailContent key={ingredient.id} ingredient={ingredient} isFrench={isFrench} />;
}
