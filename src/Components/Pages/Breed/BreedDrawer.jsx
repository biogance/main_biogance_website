'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { BASE_URL } from '../../API/API';
import { sanitizeSeoKeyword } from '../../../utils/seoKeyword';

// Same line-art glyph as BreedLibrary.jsx's empty state (stroke-current/
// fill-none/stroke-[1.4], matching BreedCard.jsx's DogIcon/CatIcon family).
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-none stroke-current stroke-[1.4]">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15 15" strokeLinecap="round" />
    </svg>
  );
}

// One skeleton row — same py-4/border-b shape as a real result row so the
// list doesn't reflow once the fetch resolves.
function DrawerRowShimmer() {
  return (
    <div className="border-0 border-b border-[#d8d8d4] py-4 flex justify-between gap-5">
      <div className="h-4 w-2/5 bg-[#e7e6e1] rounded animate-pulse" />
      <div className="h-3 w-1/5 bg-[#e7e6e1] rounded animate-pulse mt-0.5" />
    </div>
  );
}
const SHIMMER_ROWS = 8;

// Same species-tab derivation as BreedLibrary.jsx's speciesTabs/
// resolveSpeciesKey — Dogs/Cats are special-cased by substring match (so
// "Dogs" or "Dogs & Puppies" both land on 'dogs'), every other category
// gets its own slug key.
const slugify = (name) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const resolveSpeciesKey = (cat) => {
  const name = (cat?.name || '').toLowerCase();
  if (name.includes('dog')) return 'dogs';
  if (name.includes('cat')) return 'cats';
  return slugify(cat?.name) || `category-${cat?.id}`;
};

const SPECIES_SINGULAR = { dogs: 'dog', cats: 'cat' };
const toSpeciesWord = (key) => SPECIES_SINGULAR[key] || (key || '').replace(/s$/, '');

// Turns one raw /breed/list item into what this drawer renders/routes with
// — same field picks as BreedLibrary.jsx's mapListItem, minus the card-only
// fields (image/size/apartment) this drawer doesn't render.
function mapItem(item, speciesWord, isFrench) {
  const keyword = sanitizeSeoKeyword(
    (isFrench && (item.french_seo_keyword || item.english_seo_keyboard)) ||
      item.english_seo_keyboard ||
      item.french_seo_keyword ||
      '',
  );
  return {
    id: item.id,
    species: speciesWord,
    slug: keyword,
    name: (isFrench && item.french_name) || item.name,
    frenchName: item.french_name,
    tags: (item.tags || []).map((tg) => tg.name).filter(Boolean),
  };
}

// Floating "Change breed" button + slide-over drawer, shown only while a
// breed article is open — ported from #changeBreedBtn / #breedDrawer.
// Species tabs come from the same splashData every other Breed component
// reads (BreedLibrary.jsx's speciesTabs). The list itself is its own live
// POST {BASE_URL}/breed/list — fired whenever the drawer opens, the species
// tab changes, or the search box settles (same page/keyword/collection_ids
// shape as BreedLibrary.jsx's fetchBreeds) — with a shimmer while that's in
// flight, same pattern as the main library grid.
export default function BreedDrawer({ current, onSelect }) {
  const { t, i18n } = useTranslation('breed');
  const isFrench = i18n.language?.startsWith('fr');

  const [splashData, setSplashData] = useState(null);
  useEffect(() => {
    const readSplashData = () => {
      try {
        const cached = JSON.parse(localStorage.getItem('splashData') || 'null');
        if (cached) setSplashData(cached);
      } catch {
        /* ignore */
      }
    };
    readSplashData();
    window.addEventListener('splashDataReady', readSplashData);
    return () => window.removeEventListener('splashDataReady', readSplashData);
  }, []);

  const speciesTabs = useMemo(() => {
    const apiCategories = splashData?.categories;
    if (apiCategories?.length) {
      return apiCategories.map((cat) => ({
        key: resolveSpeciesKey(cat),
        id: cat.id,
        label: (isFrench && cat.french_name ? cat.french_name : cat.name) || '',
      }));
    }
    // Falls back to the static Dogs/Cats pair until the API categories load
    // — same convention as BreedLibrary.jsx.
    return [
      { key: 'dogs', id: null, label: t('drawer.dogsFallback') },
      { key: 'cats', id: null, label: t('drawer.catsFallback') },
    ];
  }, [splashData, isFrench, t]);

  const [open, setOpen] = useState(false);
  const [species, setSpecies] = useState(current?.species === 'cat' ? 'cats' : 'dogs');

  const [queryInput, setQueryInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchPending, setIsSearchPending] = useState(false);
  const searchTimerRef = useRef(null);

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const fetchTokenRef = useRef(0);

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

  // Fetches one page of POST {BASE_URL}/breed/list, appending when paging
  // ("Load more") or replacing when it's a fresh species/search.
  async function fetchDrawerBreeds(pageNum, append, speciesId, keyword) {
    const token = ++fetchTokenRef.current;
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const body = { page: pageNum, collection_ids: speciesId };
      if (keyword.trim()) body.keyword = keyword.trim();

      const res = await axios.post(`${BASE_URL}/breed/list`, body);
      if (token !== fetchTokenRef.current) return; // superseded by a newer request
      if (!res.data?.status) return;

      // Same fix as BreedLibrary.jsx's fetchBreeds — the paginated list is
      // now nested under `breeds` (alongside the new `header_breeds`)
      // instead of sitting directly on res.data.data.
      const d = res.data.data;
      const pageData = d?.breeds ?? d;
      const newItems = pageData?.data ?? [];
      setRawItems((prev) => (append ? [...prev, ...newItems] : newItems));
      setHasMore((pageData?.current_page ?? pageNum) < (pageData?.last_page ?? pageNum));
    } catch {
      /* keeps whatever was already showing rather than blanking the drawer */
    } finally {
      if (token === fetchTokenRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setIsSearchPending(false);
      }
    }
  }

  // A primitive id, not the `speciesTabs` array itself — PageLoader.jsx
  // re-fetches splashData (and re-dispatches 'splashDataReady') on *every
  // click* anywhere on the page, which gives `speciesTabs` a brand-new
  // array reference each time even though its contents haven't changed.
  // Depending on that array directly in the fetch effect below would
  // re-run it (and re-hit the API) on every single click while the drawer
  // is open — same fix BreedLibrary.jsx's `currentSpeciesId` already uses.
  const currentSpeciesId = useMemo(
    () => speciesTabs.find((s) => s.key === species)?.id ?? null,
    [speciesTabs, species],
  );

  // Fires page 1 whenever the drawer is open and the species tab or settled
  // search changes — waits for a real collection id so it never fires
  // before splashData (and so the tab's real id) has loaded.
  useEffect(() => {
    if (!open || !currentSpeciesId) return;
    setPage(1);
    fetchDrawerBreeds(1, false, currentSpeciesId, debouncedQuery);
  }, [open, currentSpeciesId, debouncedQuery]);

  const items = useMemo(
    () => rawItems.map((item) => mapItem(item, toSpeciesWord(species), isFrench)),
    [rawItems, species, isFrench],
  );

  function handleLoadMore() {
    if (!currentSpeciesId) return;
    const next = page + 1;
    setPage(next);
    fetchDrawerBreeds(next, true, currentSpeciesId, debouncedQuery);
  }

  function handleQueryChange(val) {
    setQueryInput(val);
    setIsSearchPending(true);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedQuery(val), 700);
  }

  function openDrawer() {
    setSpecies(current?.species === 'cat' ? 'cats' : 'dogs');
    setQueryInput('');
    setDebouncedQuery('');
    setOpen(true);
  }

  function selectSpeciesTab(key) {
    setSpecies(key);
    setQueryInput('');
    setDebouncedQuery('');
  }

  const showShimmer = loading || isSearchPending;

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="fixed right-4 min-[721px]:right-[clamp(24px,2.4vw,46px)] bottom-7 z-[44] border border-black bg-black cursor-pointer text-white px-[18px] py-[14px] text-[9px] tracking-[.14em] uppercase hover:bg-white hover:text-black"
      >
        {t('drawer.changeBreed')}
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
                {t('drawer.eyebrow')}
              </span>
              <h3 className="mt-[14px] text-[clamp(38px,5vw,68px)] leading-[.90] tracking-[-.06em] uppercase font-[100]">
                {t('drawer.titleLine1')}
                <br />
                {t('drawer.titleLine2')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('drawer.close')}
              className="w-[42px] h-[42px] shrink-0 cursor-pointer border border-[#d8d8d4] bg-transparent text-xl"
            >
              ×
            </button>
          </div>

          <div className="flex overflow-x-auto border-b border-[#d8d8d4] mb-[18px]">
            {speciesTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => selectSpeciesTab(tab.key)}
                className={`shrink-0 border-0 bg-transparent cursor-pointer py-[13px] pl-0 pr-[18px] mr-[22px] uppercase text-[9px] tracking-[.14em] ${
                  species === tab.key ? 'font-bold' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="border-b border-[#888780] mb-[18px]">
            <input
              type="search"
              value={queryInput}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t('drawer.searchPlaceholder')}
              className="w-full border-0 bg-transparent outline-none py-[14px]"
            />
          </div>

          <div className="overflow-auto border-t border-[#d8d8d4]">
            {showShimmer ? (
              Array.from({ length: SHIMMER_ROWS }).map((_, i) => <DrawerRowShimmer key={i} />)
            ) : items.length ? (
              <>
                {items.map((b) => {
                  const active = current?.slug === b.slug && current?.species === b.species;
                  return (
                    <button
                      key={`${b.species}-${b.id}`}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onSelect(b);
                      }}
                      className={`w-full cursor-pointer border-0 border-b border-[#d8d8d4] bg-transparent py-4 text-left flex justify-between gap-5 ${
                        active ? 'font-bold' : ''
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[11px] font-normal text-[#888]">{b.frenchName || ''}</span>
                    </button>
                  );
                })}
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full min-h-[48px] mt-4 border border-black bg-transparent uppercase text-[9px] tracking-[.15em] font-bold inline-flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? t('library.loading') : t('library.loadMore')}
                  </button>
                )}
              </>
            ) : (
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <span className="w-14 h-14 rounded-full border border-[#d8d8d4] flex items-center justify-center text-[#454541]">
                  <SearchIcon />
                </span>
                <div>
                  <p className="font-medium mb-1">
                    {debouncedQuery ? t('drawer.emptySearchTitle') : t('library.noBreedsTitle')}
                  </p>
                  <p className="text-sm text-[#888] max-w-[280px]">
                    {debouncedQuery ? t('drawer.emptySearchBody') : t('library.noBreedsBody')}
                  </p>
                </div>
                {debouncedQuery && (
                  <button
                    type="button"
                    onClick={() => handleQueryChange('')}
                    className="min-h-[42px] px-5 border border-black bg-transparent uppercase text-[9px] tracking-[.15em] font-bold inline-flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    {t('drawer.clearSearch')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
