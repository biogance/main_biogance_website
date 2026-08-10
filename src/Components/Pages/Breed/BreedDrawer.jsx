'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { normalize, searchText } from './breedHelpers';

// Floating "Change breed" button + slide-over drawer, shown only while a
// breed article is open — ported from #changeBreedBtn / #breedDrawer.
export default function BreedDrawer({ allBreeds, current, onSelect }) {
  const [open, setOpen] = useState(false);
  const [species, setSpecies] = useState(current?.species === 'cat' ? 'cats' : 'dogs');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  const items = useMemo(() => {
    const q = normalize(query);
    return allBreeds[species].filter((b) => !q || searchText(b).includes(q));
  }, [allBreeds, species, query]);

  function openDrawer() {
    setSpecies(current?.species === 'cat' ? 'cats' : 'dogs');
    setQuery('');
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="fixed right-4 min-[721px]:right-[clamp(24px,2.4vw,46px)] bottom-7 z-[44] border border-black bg-black cursor-pointer text-white px-[18px] py-[14px] text-[9px] tracking-[.14em] uppercase hover:bg-white hover:text-black"
      >
        Change breed
      </button>

      <div
        className={`fixed inset-0 z-[70] bg-black/[.42] transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div
          className={`absolute right-0 top-0 w-full min-[601px]:w-[min(650px,100%)] h-full bg-[#f6f6f4] p-[clamp(26px,4vw,48px)] flex flex-col transition-transform duration-[320ms] ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-start gap-6 mb-7">
            <div>
              <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
                Breed library
              </span>
              <h3 className="mt-[14px] text-[clamp(38px,5vw,68px)] leading-[.90] tracking-[-.06em] uppercase font-[100]">
                Choose another
                <br />
                breed.
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-[42px] h-[42px] shrink-0 cursor-pointer border border-[#d8d8d4] bg-transparent text-xl"
            >
              ×
            </button>
          </div>

          <div className="flex border-b border-[#d8d8d4] mb-[18px]">
            {['dogs', 'cats'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpecies(s)}
                className={`border-0 bg-transparent py-[13px] pl-0 pr-[18px] mr-[22px] uppercase text-[9px] tracking-[.14em] ${
                  species === s ? 'font-bold' : ''
                }`}
              >
                {s === 'dogs' ? 'Dogs' : 'Cats'}
              </button>
            ))}
          </div>

          <div className="border-b border-[#888780] mb-[18px]">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a breed…"
              className="w-full border-0 bg-transparent outline-none py-[14px]"
            />
          </div>

          <div className="overflow-auto border-t border-[#d8d8d4]">
            {items.map((b) => {
              const active = current?.slug === b.slug && current?.species === b.species;
              return (
                <button
                  key={`${b.species}-${b.slug}`}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSelect(b);
                  }}
                  className={`w-full border-0 border-b border-[#d8d8d4] bg-transparent py-4 text-left flex justify-between gap-5 ${
                    active ? 'font-bold' : ''
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[11px] font-normal text-[#888]">{b.frenchName || ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
