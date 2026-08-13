'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// `breed.apartment` is the raw 'Oui'/'Non' the API sends (see
// BreedLibrary.jsx's mapListItem) — text comes from
// src/locales/{en,fr}/breed.json via the `breed` namespace's `t()`.
function apartmentChip(v, t) {
  const key = v === 'Oui' ? 'suitable' : v === 'Non' ? 'notSuitable' : null;
  return key ? t(`apartment.chip.${key}`) : '';
}

// Up to 3 small chips under the description — size + apartment suitability,
// whichever the breed actually has (falsy entries drop out on their own).
function cardMeta(breed, t) {
  return [breed.size, breed.apartment ? apartmentChip(breed.apartment, t) : ''].filter(Boolean).slice(0, 3);
}

// "Dog breed"/"Cat breed"/… — dog/cat get proper translated copy
// (src/locales/{en,fr}/breed.json); any other species key (e.g. a future
// "horse") falls back to the generic "{{species}} breed" / "Race de
// {{species}}" pattern instead of going untranslated.
function speciesLabel(species, t) {
  if (!species) return '';
  const known = t(`card.speciesLabel.${species}`, { defaultValue: '' });
  if (known) return known;
  const capitalized = species.charAt(0).toUpperCase() + species.slice(1);
  return t('card.speciesLabel.generic', { species: capitalized });
}

// Simple line-art placeholder icons — ported from the mockup's inline
// dogIcon/catIcon <svg> strings, used whenever a breed has no `image`.
function DogIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="w-[78px] h-[78px] fill-none stroke-current stroke-[1.4]">
      <path d="M18 23c-5-7-5-13-2-16 5 1 10 5 13 10 2-1 5-1 7 0 3-5 8-9 13-10 3 3 3 9-2 16 2 4 3 8 3 13 0 12-8 20-18 20S14 48 14 36c0-5 1-9 4-13Z" />
      <path d="M25 34h.1M39 34h.1M28 43c3 3 5 3 8 0" />
    </svg>
  );
}

function CatIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="w-[78px] h-[78px] fill-none stroke-current stroke-[1.4]">
      <path d="M17 25 13 9l14 8c3-1 7-1 10 0l14-8-4 16c3 4 5 9 5 14 0 11-9 18-20 18S12 50 12 39c0-5 2-10 5-14Z" />
      <path d="M24 35h.1M40 35h.1M29 43h6M18 41h9M37 41h9" />
    </svg>
  );
}

// One card in the breed-grid / related-grid — hover inverts to black/white,
// same as `.breed-card:hover` in the mockup, done here with group-hover.
export default function BreedCard({ breed, onClick }) {
  const { t } = useTranslation('breed');
  const meta = cardMeta(breed, t);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(breed.image) && !failed;

  // Built from whatever species this card actually belongs to
  // (BreedLibrary.jsx sets it from the active species tab), so a species
  // like Horses reads "Horse breed" once breed data exists for it.
  const speciesText = speciesLabel(breed.species, t);

  // tags always comes as an array now (BreedLibrary.jsx/BreedArticle.jsx's
  // API mapping) — kept as a defensive normalize here in case a caller ever
  // hands this a comma-separated string instead.
  const tagList = Array.isArray(breed.tags)
    ? breed.tags
    : (breed.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

  return (
    <article
      onClick={onClick}
      className="group min-w-0 bg-white border-r border-b border-[#d8d8d4] flex flex-col cursor-pointer transition-colors duration-[250ms] hover:bg-black hover:text-white"
    >
      <div className="aspect-[1.08/1] bg-[#efefee] overflow-hidden relative">
        {showImage && (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-7 h-7 rounded-full border-2 border-black/15 border-t-black animate-spin" />
              </div>
            )}
            {/* Hover zoom matches ExpertAdvices.jsx's cards exactly:
                transition-transform alone (no other property sharing the
                transition-* utility, which is what was making it jerky —
                see BreedFilterSelect's bg-black/bg-transparent bug above for
                the same class of issue) so both directions animate smoothly. */}
            <img
              src={breed.image}
              alt={breed.name}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`relative z-10 w-full h-full object-contain grayscale p-[22px] group-hover:scale-105 transition-transform duration-700 ${
                loaded ? '' : 'opacity-0'
              } hover:grayscale-0`}
            />
          </>
        )}
        {!showImage && (
          <div className="grid w-full h-full place-items-center bg-[#efefee] text-[#171717] group-hover:text-white">
            <span className="w-[104px] h-[104px] rounded-full border border-[#d8d8d4] group-hover:border-white/25 flex items-center justify-center transition-colors duration-[250ms]">
              {breed.species === 'dog' ? <DogIcon /> : <CatIcon />}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 pb-6 flex flex-col">
        <span className="text-[8px] tracking-[.15em] uppercase text-[#858580] group-hover:text-[#aaa]">
          {speciesText}
        </span>
        <h3 className="text-2xl leading-[1.02] tracking-[-.04em] font-medium mt-3.5 mb-2">{breed.name}</h3>
       
        {breed.description && (
          <p className="text-xs leading-relaxed text-[#666] group-hover:text-[#ccc] line-clamp-3 mb-4">
            {breed.description}
          </p>
        )}
        {meta.length > 0 && (
          <div className="flex gap-[7px] flex-wrap mb-3">
            {meta.map((m) => (
              <span
                key={m}
                className="border border-[#d8d8d4] group-hover:border-[#454545] px-[9px] py-[7px] text-[8px] tracking-[.08em] uppercase"
              >
                {m}
              </span>
            ))}
          </div>
        )}
        
      </div>
    </article>
  );
}
