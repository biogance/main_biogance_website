'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BreedCard from './BreedCard';
import BreedFilterSelect from './BreedFilterSelect';
import { normalize, searchText } from './breedHelpers';

// Shown before the home API's categories have loaded — same static-fallback
// pattern as Footer.jsx's productRanges/category lists.
const SPECIES_KEYS = ['dogs', 'cats'];
const FALLBACK_SPECIES_LABELS = { dogs: 'Dogs', cats: 'Cats' };

// Strips accents/punctuation down to a plain a-z0-9 slug — used as the tab
// key for whichever API categories aren't dogs/cats (see resolveSpeciesKey).
const slugify = (name) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Maps an API category to the key allBreeds is indexed by. Dogs/Cats are
// special-cased by substring match (so "Dogs" or "Dogs & Puppies" both land
// on the same 'dogs' key data/breeds.json actually has breed profiles
// under) — every other category (Horses, Small Mammals, …) gets its own
// slug key, which just won't have a matching allBreeds entry yet.
const resolveSpeciesKey = (cat) => {
  const name = (cat?.name || '').toLowerCase();
  if (name.includes('dog')) return 'dogs';
  if (name.includes('cat')) return 'cats';
  return slugify(cat?.name) || `category-${cat?.id}`;
};

const SIZE_OPTIONS = [
  { value: '', label: 'All sizes' },
  { value: 'Petit', label: 'Small' },
  { value: 'Moyen', label: 'Medium' },
  { value: 'Grand', label: 'Large' },
  { value: 'Tres Grand', label: 'Very large' },
];
const ENERGY_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: '2', label: '2 / 5' },
  { value: '3', label: '3 / 5' },
  { value: '4', label: '4 / 5' },
  { value: '5', label: '5 / 5' },
];
const GROOMING_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: '1', label: '1 / 5' },
  { value: '2', label: '2 / 5' },
  { value: '3', label: '3 / 5' },
  { value: '4', label: '4 / 5' },
  { value: '5', label: '5 / 5' },
];
const APARTMENT_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Oui', label: 'Suitable' },
  { value: 'Non', label: 'Not recommended' },
];

// Breed library — search, species tabs, filters (dogs only), A-Z jump,
// paginated grid ("Load more") — ported from .library / #library.
export default function BreedLibrary({ allBreeds, onOpenBreed }) {
  const { i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');

  // Species tabs: same home-API categories OurProducts.jsx/Footer.jsx/
  // MainVideo.jsx all read (splashData.categories in localStorage, kept
  // fresh via the 'splashDataReady' event PageLoader fires) — every
  // category the API returns becomes a tab here instead of a hardcoded
  // Dogs/Cats pair. Species without breed data yet in data/breeds.json
  // (currently only 'dogs'/'cats' have profiles) still get a tab, just an
  // empty grid (see the `allBreeds[species] || []` guards below).
  const [apiCategories, setApiCategories] = useState(null);
  useEffect(() => {
    const readCategories = () => {
      try {
        const cached = JSON.parse(localStorage.getItem('splashData') || 'null');
        if (cached?.categories) setApiCategories(cached.categories);
      } catch {
        /* ignore */
      }
    };
    readCategories();
    window.addEventListener('splashDataReady', readCategories);
    return () => window.removeEventListener('splashDataReady', readCategories);
  }, []);

  const speciesTabs = useMemo(() => {
    if (apiCategories?.length) {
      return apiCategories.map((cat) => ({
        key: resolveSpeciesKey(cat),
        label: (isFrench && cat.french_name ? cat.french_name : cat.name) || '',
      }));
    }
    // Falls back to the static Dogs/Cats pair until the API categories load.
    return SPECIES_KEYS.map((key) => ({ key, label: FALLBACK_SPECIES_LABELS[key] }));
  }, [apiCategories, isFrench]);

  const [species, setSpecies] = useState('dogs');
  const [letter, setLetter] = useState('All');
  const [query, setQuery] = useState('');
  const [size, setSize] = useState('');
  const [energy, setEnergy] = useState('');
  const [grooming, setGrooming] = useState('');
  const [apartment, setApartment] = useState('');
  const [visible, setVisible] = useState(24);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // While the accordion is animating open/closed it needs overflow-hidden
  // (that's what makes the grid-template-rows height trick clip smoothly);
  // once it's fully open, overflow flips to visible so the custom dropdowns'
  // option lists can pop outside the panel instead of being clipped by it.
  const [panelSettled, setPanelSettled] = useState(false);

  const letters = useMemo(() => {
    const set = new Set((allBreeds[species] || []).map((b) => b.name.charAt(0).toUpperCase()));
    return ['All', ...set].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b, 'en')));
  }, [allBreeds, species]);

  const filtered = useMemo(() => {
    // Species the API returns but data/breeds.json has no profiles for yet
    // (e.g. Horses) fall through to an empty grid instead of crashing here.
    let items = allBreeds[species] || [];
    const q = normalize(query);
    if (q) items = items.filter((b) => searchText(b).includes(q));
    if (letter !== 'All') items = items.filter((b) => normalize(b.name).startsWith(normalize(letter)));
    if (species === 'dogs') {
      if (size) items = items.filter((b) => b.size === size);
      if (energy) items = items.filter((b) => String(b.energy) === energy);
      if (grooming) items = items.filter((b) => String(b.grooming) === grooming);
      if (apartment) items = items.filter((b) => b.apartment === apartment);
    }
    return items;
  }, [allBreeds, species, query, letter, size, energy, grooming, apartment]);

  const visibleItems = filtered.slice(0, visible);

  function switchSpecies(next) {
    setSpecies(next);
    setLetter('All');
    setQuery('');
    setSize('');
    setEnergy('');
    setGrooming('');
    setApartment('');
    setVisible(24);
    setFiltersOpen(false);
    setPanelSettled(false);
  }

  return (
    <section className="bg-[#f6f6f4] border-b border-[#d8d8d4] pt-[clamp(76px,8vw,118px)]" id="library">
      <div className="w-full max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[.82fr_1.18fr] gap-[clamp(34px,4vw,64px)] items-end mb-[42px]">
        <div>
          <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
            Breed library
          </span>
          <h2 className="mt-[18px] text-[clamp(48px,6vw,94px)] leading-[.90] tracking-[-.065em] uppercase font-[100]">
            Find their
            <br />
            breed.
          </h2>
        </div>
        <div className="border-b border-[#777772] flex items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(24);
            }}
            placeholder="Search a breed, temperament or care need…"
            className="w-full border-0 bg-transparent outline-none py-4 text-[15px]"
          />
          <span className="text-[9px] tracking-[.15em] uppercase shrink-0">Search</span>
        </div>
      </div>

      {/* Navbar's fixed header is 40px announcement + 64px nav = 104px on
          desktop (lg: 1024px+, pinned permanently there — see Navbar.jsx's
          headerWrapperRef). Below that it slides the announcement bar away
          on scroll, leaving just the 64px nav pinned, so this only needs to
          clear the nav itself once scrolled past. */}
      <div className="sticky top-16 lg:top-[104px] z-[35] bg-[#f6f6f4]/95 backdrop-blur-md border-t border-b border-[#d8d8d4]">
        <div className="max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] flex items-stretch justify-between gap-5">
          <div className="flex overflow-x-auto">
            {speciesTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchSpecies(tab.key)}
                className={`shrink-0 min-h-[62px] px-7 border-0 border-r first:border-l border-[#d8d8d4] uppercase text-[10px] tracking-[.14em] cursor-pointer ${
                  species === tab.key ? 'bg-black text-white' : 'bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="hidden min-[761px]:flex items-center text-[10px] tracking-[.12em] uppercase text-[#777]">
            {filtered.length} breed{filtered.length === 1 ? '' : 's'}
          </div>
          {species === 'dogs' && (
            <button
              type="button"
              onClick={() =>
                setFiltersOpen((v) => {
                  const next = !v;
                  if (!next) setPanelSettled(false); // closing: re-clip immediately
                  return next;
                })
              }
              className={`border-0 border-l border-[#d8d8d4] px-[22px] uppercase text-[10px] tracking-[.14em] ml-auto min-[761px]:ml-0 cursor-pointer ${
                filtersOpen ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'
              }`}
            >
              Filters
            </button>
          )}
        </div>

        {species === 'dogs' && (
         
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
            onTransitionEnd={() => {
              if (filtersOpen) setPanelSettled(true);
            }}
          >
            <div className={panelSettled ? 'overflow-visible' : 'overflow-hidden'}>
              <div className="max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[761px]:grid-cols-2 min-[1181px]:grid-cols-4 border-b border-[#d8d8d4]">
                <div className="p-5 border-l border-[#d8d8d4] min-[761px]:border-r">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">Size</span>
                  <BreedFilterSelect
                    label="Size"
                    value={size}
                    options={SIZE_OPTIONS}
                    onChange={(v) => {
                      setSize(v);
                      setVisible(24);
                    }}
                  />
                </div>
                <div className="p-5 border-l border-[#d8d8d4] min-[761px]:border-r">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">Energy</span>
                  <BreedFilterSelect
                    label="Energy"
                    value={energy}
                    options={ENERGY_OPTIONS}
                    onChange={(v) => {
                      setEnergy(v);
                      setVisible(24);
                    }}
                  />
                </div>
                <div className="p-5 border-l border-[#d8d8d4] min-[761px]:border-r">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">Grooming</span>
                  <BreedFilterSelect
                    label="Grooming"
                    value={grooming}
                    options={GROOMING_OPTIONS}
                    onChange={(v) => {
                      setGrooming(v);
                      setVisible(24);
                    }}
                  />
                </div>
                <div className="p-5 border-l border-r border-[#d8d8d4]">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">Apartment life</span>
                  <BreedFilterSelect
                    label="Apartment life"
                    value={apartment}
                    options={APARTMENT_OPTIONS}
                    onChange={(v) => {
                      setApartment(v);
                      setVisible(24);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* <div className="max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] py-6 flex flex-wrap gap-[7px] border-b border-[#d8d8d4]">
        {letters.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLetter(l);
              setVisible(24);
            }}
            className={`border-0 px-[9px] py-[7px] text-[9px] tracking-[.12em] uppercase cursor-pointer ${
              letter === l ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div> */}

      <div className="grid grid-cols-1 min-[481px]:grid-cols-2 min-[761px]:grid-cols-3 min-[1181px]:grid-cols-4 border-l border-[#d8d8d4] max-w-[1840px] mx-auto">
        {visibleItems.length ? (
          visibleItems.map((b) => (
            <BreedCard key={`${b.species}-${b.slug}`} breed={b} onClick={() => onOpenBreed(b)} />
          ))
        ) : (
          <div className="col-span-full py-[90px] px-4 text-center text-base">
            {allBreeds[species]?.length
              ? 'No breed matches these filters.'
              : 'Breed profiles for this species are coming soon.'}
          </div>
        )}
      </div>

      <div className="py-[34px] px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] pb-[70px] text-center max-w-[1840px] mx-auto">
        {visible < filtered.length && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + 24)}
            className="min-h-[48px] px-7 border border-black bg-black text-white uppercase text-[9px] tracking-[.15em] font-bold inline-flex items-center justify-center hover:bg-transparent hover:text-black transition-colors cursor-pointer"
          >
            Load more breeds
          </button>
        )}
      </div>
    </section>
  );
}
