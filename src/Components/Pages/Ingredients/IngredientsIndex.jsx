'use client';

import React, { useMemo, useState } from 'react';
import { INGREDIENT_NAMES } from './ingredientsData';

// Ported from .index-section/.search-wrap/.az/.ingredient-grid — search +
// A-Z jump + full-name grid, id="ingredient-index" for the rail/detail's
// scrollIntoView targets.
export default function IngredientsIndex({ selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('All');

  const letters = useMemo(() => {
    const set = new Set(INGREDIENT_NAMES.map((n) => n[0].toUpperCase()));
    return ['All', ...set].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b, 'en')));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INGREDIENT_NAMES.filter(
      (name) => (!q || name.toLowerCase().includes(q)) && (activeLetter === 'All' || name[0].toUpperCase() === activeLetter),
    );
  }, [query, activeLetter]);

  const handleSelect = (name) => {
    onSelect(name);
    document.getElementById('ingredient-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hyaluronic acid, aloe vera, chamomile…"
              className="w-full border-0 bg-transparent outline-none py-[17px] text-[15px]"
            />
            <span className="text-[11px] tracking-[.14em] uppercase text-[#6f6e68] shrink-0">Search</span>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2 mb-7">
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setActiveLetter(letter)}
              className={`cursor-pointer tracking-[.12em] uppercase px-2 py-1.5 text-[10px] ${
                letter === activeLetter ? 'bg-black text-white' : 'bg-transparent text-[#777] hover:bg-black hover:text-white'
              }`}
            >
              {letter}
            </button>
          ))}
        </div> */}

        <div className="grid grid-cols-1 min-[641px]:grid-cols-2 min-[1001px]:grid-cols-4 border-t border-l border-[#d9d8d1]">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className={`group flex items-center justify-between border-0 border-r border-b border-[#d9d8d1] min-h-[72px] px-5 py-[18px] text-left text-sm transition-colors duration-200 cursor-pointer ${
                name === selected ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'
              }`}
            >
              <span>{name}</span>
              <span className="w-[7px] h-[7px] border-b border-r border-current opacity-40 -rotate-45" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
