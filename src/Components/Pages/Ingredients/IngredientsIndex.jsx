'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';

// Shimmer tile — same size/border rhythm as the real grid button below, so
// the grid doesn't reflow once real ingredients replace it.
function TileShimmer() {
  return (
    <div className="flex items-center justify-between border-0 border-r border-b border-[#d9d8d1] min-h-[72px] px-5 py-[18px]">
      <div className="h-3.5 w-2/3 bg-[#e7e6e1] rounded animate-pulse" />
      <div className="w-[7px] h-[7px] bg-[#e7e6e1] rounded-full animate-pulse" />
    </div>
  );
}

// Ported from .index-section/.search-wrap/.ingredient-grid — search + full
// ingredient grid, id="ingredient-index" for the rail/detail's
// scrollIntoView targets. The list itself comes from OurIngredients.jsx's
// POST {BASE_URL}/ingredient/list call (search included, via `keyword`) —
// OurIngredients.jsx walks every page of that response itself, so
// `ingredients` here is always the complete matching set, no "load more".
// `onSelect` also owns scrolling the page to the detail section (see
// OurIngredients.jsx's handleSelect) so it lands consistently below the
// stuck rail whether the pick came from here or from IngredientsRail.jsx.
export default function IngredientsIndex({
  query,
  onQueryChange,
  onClearSearch,
  ingredients,
  loading,
  isSearchPending,
  selectedId,
  onSelect,
  isFrench,
}) {
  const showShimmer = loading || isSearchPending;

  return (
    <section id="ingredient-index" className="bg-[#f5f4ef] border-y border-[#d9d8d1] py-[clamp(74px,8vw,120px)]">
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          IngredientsHero.jsx. */}
      <div className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)]">
        <div className="grid grid-cols-1 min-[1001px]:grid-cols-[.8fr_1.2fr] items-end gap-[60px] mb-[46px]">
          <div>
            <span className="flex items-center gap-3 text-[10px] tracking-[.18em] uppercase before:content-[''] before:w-[38px] before:h-px before:bg-current">
              Ingredient library
            </span>
            <h2 className="mt-[18px] text-[48px] min-[641px]:text-[clamp(46px,5.5vw,86px)] leading-[.87] tracking-[-.07em] uppercase font-medium">
              Find an
              <br />
              ingredient.
            </h2>
          </div>
          <div className="flex items-center border-b border-[#8c8b85]">
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search hyaluronic acid, aloe vera, chamomile…"
              className="w-full border-0 bg-transparent outline-none py-[17px] text-[15px]"
            />
            <span className="text-[11px] tracking-[.14em] uppercase text-[#6f6e68] shrink-0">Search</span>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[641px]:grid-cols-2 min-[1001px]:grid-cols-4 border-t border-l border-[#d9d8d1]">
          {showShimmer ? (
            Array.from({ length: 16 }).map((_, i) => <TileShimmer key={i} />)
          ) : ingredients.length ? (
            ingredients.map((ing) => {
              const name = (isFrench && ing.french_name) || ing.name;
              return (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => onSelect(ing.id)}
                  className={`group flex items-center justify-between border-0 border-r border-b border-[#d9d8d1] min-h-[72px] px-5 py-[18px] text-left text-sm transition-colors duration-200 cursor-pointer ${
                    ing.id === selectedId ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'
                  }`}
                >
                  <span>{name}</span>
                  <span className="w-[7px] h-[7px] border-b border-r border-current opacity-40 -rotate-45" />
                </button>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-24 px-4 text-center border-r border-b border-[#d9d8d1]">
              <div className="w-14 h-14 rounded-full border border-[#d9d8d1] flex items-center justify-center text-[#a9a89f]">
                <FiSearch className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-medium text-black mb-1.5">No ingredients found</p>
                <p className="max-w-[360px] text-[13px] leading-relaxed text-[#77766f]">
                  {query
                    ? <>No results for &ldquo;{query}&rdquo;. Try a different spelling or a shorter keyword.</>
                    : 'No ingredients to show right now.'}
                </p>
              </div>
              {/* {query && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="mt-1 text-[10px] tracking-[.14em] uppercase font-semibold text-black border-b border-black pb-0.5 cursor-pointer hover:opacity-60 transition-opacity"
                >
                  Clear search
                </button>
              )} */}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
