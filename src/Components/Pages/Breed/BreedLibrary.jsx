'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreedCard from './BreedCard';
import BreedFilterSelect from './BreedFilterSelect';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { sanitizeSeoKeyword } from '../../../utils/seoKeyword';

// Shown before the home API's categories have loaded — same static-fallback
// pattern as Footer.jsx's productRanges/category lists.
const SPECIES_KEYS = ['dogs', 'cats'];
const SPECIES_SINGULAR = { dogs: 'dog', cats: 'cat' };
const toSpeciesWord = (key) => SPECIES_SINGULAR[key] || (key || '').replace(/s$/, '');

// Strips accents/punctuation down to a plain a-z0-9 slug — used as the tab
// key for whichever API categories aren't dogs/cats (see resolveSpeciesKey).
const slugify = (name) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Maps an API category to the key breed cards are grouped under. Dogs/Cats
// are special-cased by substring match (so "Dogs" or "Dogs & Puppies" both
// land on the same 'dogs' key) — every other category (Horses, Small
// Mammals, …) gets its own slug key, which /breed/list just won't have any
// results for yet.
const resolveSpeciesKey = (cat) => {
  const name = (cat?.name || '').toLowerCase();
  if (name.includes('dog')) return 'dogs';
  if (name.includes('cat')) return 'cats';
  return slugify(cat?.name) || `category-${cat?.id}`;
};

// Shimmer tile — same box shape as the real BreedCard (aspect-[1.08/1]
// image + p-5 pb-6 min-h-[158px] text block) so the grid doesn't reflow
// once real cards replace it.
function BreedCardShimmer() {
  return (
    <div className="min-w-0 bg-white border-r border-b border-[#d8d8d4] flex flex-col">
      <div className="aspect-[1.08/1] bg-[#efefee] animate-pulse" />
      <div className="p-5 pb-6 min-h-[158px] flex flex-col">
        <div className="h-2 w-16 bg-[#e7e6e1] rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-[#e7e6e1] rounded animate-pulse mt-3.5 mb-2" />
        <div className="h-3 w-1/3 bg-[#e7e6e1] rounded animate-pulse mb-5" />
        <div className="mt-auto flex gap-[7px]">
          <div className="h-6 w-16 bg-[#e7e6e1] rounded animate-pulse" />
          <div className="h-6 w-24 bg-[#e7e6e1] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
const SHIMMER_COUNT = 12;

// Line-art search glyph for the "no breeds" empty state — same
// stroke-current/fill-none/stroke-[1.4] convention as BreedCard.jsx's
// DogIcon/CatIcon so it reads as part of the same icon family.
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-none stroke-current stroke-[1.4]">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15 15" strokeLinecap="round" />
    </svg>
  );
}

// Turns one raw /breed/list item into the shape BreedCard.jsx expects.
// `size`/`apartment` come straight off each categories[] entry's own nested
// `category` object (the API embeds the full category, not just its id):
// `size` is shown as the real category name/french_name as-is, and
// `apartment` stays the raw 'Oui'/'Non' via french_name so BreedCard.jsx's
// apartment chip keeps working regardless of language. `description`/`tags`
// come straight off the item — BreedCard.jsx shows description under the
// name and normalizes tags there (this API gives an array of {name}).
function mapListItem(item, speciesWord, isFrench) {
  const cats = item.categories || [];
  const typeEntry = cats.find((c) => c.type === 'type')?.category;
  const apartmentEntry = cats.find((c) => c.type === 'suitable-for-apartment')?.category;
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
    image: item.media ? `${MEDIA_URL}${item.media}` : '',
    description: (isFrench && item.french_description) || item.description,
    tags: (item.tags || []).map((t) => t.name).filter(Boolean),
    size: typeEntry ? (isFrench && typeEntry.french_name) || typeEntry.name : undefined,
    apartment: apartmentEntry ? apartmentEntry.french_name : undefined,
  };
}

// Breed library — search, species tabs, filters (dogs only), paginated grid
// ("Load more") — ported from .library / #library. Breed cards come from
// POST {BASE_URL}/breed/list (collection_ids/type_categories/
// hygiene_level_categories/suitable_for_apartment_categories/keyword) —
// species tabs and the filter dropdowns' real category ids come from the
// same splashData every other landing/nav component reads.
export default function BreedLibrary({ onOpenBreed }) {
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
  const apiCategories = splashData?.categories;

  // Each tab carries the real category id splashData gives it — that id is
  // exactly what gets sent as `collection_ids` below (same
  // categories-list-provides-the-id convention ExpertAdvices.jsx's
  // collection_id and Footer.jsx's category filtering already use).
  const speciesTabs = useMemo(() => {
    if (apiCategories?.length) {
      return apiCategories.map((cat) => ({
        key: resolveSpeciesKey(cat),
        id: cat.id,
        label: (isFrench && cat.french_name ? cat.french_name : cat.name) || '',
      }));
    }
    // Falls back to the static Dogs/Cats pair (no real id yet) until the API
    // categories load.
    return SPECIES_KEYS.map((key) => ({
      key,
      id: null,
      label: key === 'dogs' ? t('library.dogsFallback') : t('library.catsFallback'),
    }));
  }, [apiCategories, isFrench, t]);

  // Size dropdown — dog-only entries from breed_type. Value is the entry's
  // real id, sent straight through as `type_categories`. Kept in whatever
  // order the API returns them.
  const sizeOptions = useMemo(() => {
    const dynamic = (splashData?.breed_type || [])
      .filter((s) => /dog/i.test(s?.name || ''))
      .map((s) => ({ value: String(s.id), label: (isFrench && s.french_name) || s.name }));
    return [{ value: '', label: t('library.allSizes') }, ...dynamic];
  }, [splashData, isFrench, t]);

  // Grooming dropdown — breed_hygiene_level's `name`/`french_name` are
  // literally a star string ("⭐⭐⭐"); the *label* is reformatted as "N / 5"
  // instead of showing the raw emoji, but the *value* sent as
  // `hygiene_level_categories` is still the entry's real id. Kept in
  // whatever order the API returns them.
  const groomingOptions = useMemo(() => {
    const dynamic = (splashData?.breed_hygiene_level || [])
      .map((s) => {
        const raw = (isFrench && s.french_name) || s.name || '';
        const count = [...raw].filter((ch) => ch === '⭐').length;
        return count ? { value: String(s.id), label: `${count} / 5` } : null;
      })
      .filter(Boolean);
    return [{ value: '', label: t('library.allLevels') }, ...dynamic];
  }, [splashData, isFrench, t]);

  // Apartment dropdown — value is the entry's real id, sent as
  // `suitable_for_apartment_categories`.
  const apartmentOptions = useMemo(() => {
    const dynamic = (splashData?.breed_suitable_for_apartment || []).map((s) => ({
      value: String(s.id),
      label: (isFrench && s.french_name) || s.name,
    }));
    return [{ value: '', label: t('library.all') }, ...dynamic];
  }, [splashData, isFrench, t]);

  // Energy dropdown — same star-string shape as breed_hygiene_level above
  // ("⭐⭐⭐"), reformatted to "N / 5"; value sent as `energy_level_categories`.
  const energyOptions = useMemo(() => {
    const dynamic = (splashData?.breed_energy_level || [])
      .map((s) => {
        const raw = (isFrench && s.french_name) || s.name || '';
        const count = [...raw].filter((ch) => ch === '⭐').length;
        return count ? { value: String(s.id), label: `${count} / 5` } : null;
      })
      .filter(Boolean);
    return [{ value: '', label: t('library.allLevels') }, ...dynamic];
  }, [splashData, isFrench, t]);

  const [species, setSpecies] = useState('dogs');
  const currentSpeciesId = useMemo(
    () => speciesTabs.find((t) => t.key === species)?.id ?? null,
    [speciesTabs, species],
  );

  const [size, setSize] = useState('');
  const [grooming, setGrooming] = useState('');
  const [apartment, setApartment] = useState('');
  const [energy, setEnergy] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  // While the accordion is animating open/closed it needs overflow-hidden
  // (that's what makes the grid-template-rows height trick clip smoothly);
  // once it's fully open, overflow flips to visible so the custom dropdowns'
  // option lists can pop outside the panel instead of being clipped by it.
  const [panelSettled, setPanelSettled] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchPending, setIsSearchPending] = useState(false);
  const searchTimerRef = useRef(null);

  // Raw /breed/list items, kept exactly as the API returned them — language
  // is applied separately (see `breeds` useMemo below) so switching the site
  // language never re-triggers this fetch, it just re-derives the display
  // fields (name/description/…) from data already in hand.
  const [rawBreeds, setRawBreeds] = useState([]);
  const [rawSpeciesWord, setRawSpeciesWord] = useState('dog');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchTokenRef = useRef(0);
  // Signature of the last params page-1 was actually fetched with — guards
  // the effect below against firing again when nothing real changed. Needed
  // because PageLoader.jsx re-fetches splashData (and re-dispatches
  // 'splashDataReady') on *every click* anywhere in the app, including a
  // click on the language switcher — that gives `speciesTabs`/
  // `currentSpeciesId` a new reference/recompute each time even though the
  // resolved id is the same value, so this is a second, explicit line of
  // defense on top of that (belt-and-braces, same spirit as fetchTokenRef
  // above ignoring stale responses instead of stale requests).
  const lastFetchKeyRef = useRef(null);

  const fetchBreeds = useCallback(
    async (pageNum, append, params) => {
      const token = ++fetchTokenRef.current;
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const body = { page: pageNum, collection_ids: params.speciesId };
        if (params.sizeId) body.type_categories = params.sizeId;
        if (params.groomingId) body.hygiene_level_categories = params.groomingId;
        if (params.apartmentId) body.suitable_for_apartment_categories = params.apartmentId;
        if (params.energyId) body.energy_level_categories = params.energyId;
        if (params.keyword.trim()) body.keyword = params.keyword.trim();

        const res = await axios.post(`${BASE_URL}/breed/list`, body);
        if (token !== fetchTokenRef.current) return; // superseded by a newer request

        if (!res.data.status) {
          // i18n.t (not the memoized `t` above) so this stays correct for
          // whatever language is active *when the error happens*, without
          // needing `t` in fetchBreeds' deps — adding it there would give
          // fetchBreeds a new identity on every language switch, which is
          // exactly the refetch-on-language-switch bug the `breeds` memo
          // above exists to avoid.
          toast.error(res.data.action || i18n.t('library.genericError', { ns: 'breed' }));
          return;
        }

        const d = res.data.data;
        const items = d?.data ?? [];
        setRawBreeds((prev) => (append ? [...prev, ...items] : items));
        setRawSpeciesWord(params.speciesWord);
        setTotal(d?.total ?? items.length);
        setHasMore((d?.current_page ?? pageNum) < (d?.last_page ?? pageNum));
      } catch {
        if (token === fetchTokenRef.current) toast.error(i18n.t('library.genericErrorRetry', { ns: 'breed' }));
      } finally {
        if (token === fetchTokenRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setIsSearchPending(false);
        }
      }
    },
    // `i18n` is a stable singleton reference (never changes identity), so
    // including it here doesn't give fetchBreeds a new identity on
    // language switch — unlike `t`, which would (see the toast.error
    // comment above for why that matters).
    [i18n],
  );

  // French/English mapping happens here, entirely from data already fetched
  // — changing the language re-runs this memo, not fetchBreeds, so the
  // library never re-hits the API just because the language switched.
  const breeds = useMemo(
    () => rawBreeds.map((item) => mapListItem(item, rawSpeciesWord, isFrench)),
    [rawBreeds, rawSpeciesWord, isFrench],
  );

  // Fetches page 1 whenever the species/filters/search settle — waits for a
  // real collection id (currentSpeciesId) so it never fires with the wrong
  // (or no) species scoped in, e.g. before splashData has loaded.
  useEffect(() => {
    if (!currentSpeciesId) return;
    // String-normalized so a splash-triggered re-render that hands
    // currentSpeciesId back as (say) a number one time and a numeric string
    // another time still reads as "nothing changed" — see lastFetchKeyRef's
    // comment above for why that churn happens at all.
    const fetchKey = [currentSpeciesId, size, grooming, apartment, energy, debouncedSearch]
      .map(String)
      .join('|');
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;
    setPage(1);
    fetchBreeds(1, false, {
      speciesId: currentSpeciesId,
      speciesWord: toSpeciesWord(species),
      sizeId: size,
      groomingId: grooming,
      apartmentId: apartment,
      energyId: energy,
      keyword: debouncedSearch,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSpeciesId, size, grooming, apartment, energy, debouncedSearch, fetchBreeds]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchBreeds(next, true, {
      speciesId: currentSpeciesId,
      speciesWord: toSpeciesWord(species),
      sizeId: size,
      groomingId: grooming,
      apartmentId: apartment,
      energyId: energy,
      keyword: debouncedSearch,
    });
  };

  // Debounced search — shimmer starts the instant the user types
  // (isSearchPending), the actual API call (with `keyword`) only fires 1s
  // after they stop typing — same pattern as OurIngredients.jsx.
  const handleSearchChange = (val) => {
    setSearchInput(val);
    setIsSearchPending(true);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 1000);
  };

  function switchSpecies(next) {
    setSpecies(next);
    setSearchInput('');
    setDebouncedSearch('');
    setSize('');
    setGrooming('');
    setApartment('');
    setEnergy('');
    setFiltersOpen(false);
    setPanelSettled(false);
  }

  // Whether any dropdown (not search) is active — drives the "Clear
  // filters" button below, shown only once there's something to clear.
  const hasActiveFilters = Boolean(size || grooming || energy || apartment);
  function clearFilters() {
    setSize('');
    setGrooming('');
    setEnergy('');
    setApartment('');
  }

  // Also clears the search box — used by the empty-state's reset CTA below,
  // which needs to undo *everything* that could be narrowing the grid to
  // zero results, not just the dropdown filters.
  const hasNarrowedResults = hasActiveFilters || Boolean(debouncedSearch);
  function resetSearchAndFilters() {
    setSearchInput('');
    setDebouncedSearch('');
    clearFilters();
  }

  const showShimmer = loading || isSearchPending;

  return (
    <section className="bg-[#f6f6f4] border-b border-[#d8d8d4] pt-[clamp(76px,8vw,118px)]" id="library">
      {/* No max-w-[1840px]/mx-auto on this section's rows — same zoom/
          viewport-width fix as BreedHero.jsx/IngredientsHero.jsx's siblings:
          that cap only centers past 1840px, leaving equal margins on both
          sides instead of staying flush left/right once the viewport
          (zooming out effectively widens it) crosses that width. */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[.82fr_1.18fr] gap-[clamp(34px,4vw,64px)] items-end mb-[42px]">
        <div>
          <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
            {t('library.eyebrow')}
          </span>
          <h2 className="mt-[18px] text-[clamp(48px,6vw,94px)] leading-[.90] tracking-[-.065em] uppercase font-[100]">
            {t('library.titleLine1')}
            <br />
            {t('library.titleLine2')}
          </h2>
        </div>
        <div className="border-b border-[#777772] flex items-center">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('library.searchPlaceholder')}
            className="w-full border-0 bg-transparent outline-none py-4 text-[15px]"
          />
          <span className="text-[9px] tracking-[.15em] uppercase shrink-0">{t('library.search')}</span>
        </div>
      </div>

      
      <div className="sticky top-16 lg:top-[104px] z-[35] bg-[#f6f6f4]/95 backdrop-blur-md border-t border-b border-[#d8d8d4]">
        <div className="px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] flex items-stretch justify-between gap-5">
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
            {t('library.breedCount', { count: total })}
          </div>
          {species === 'dogs' && (
            <div className="flex items-stretch ml-auto min-[761px]:ml-0">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="border-0 border-l border-[#d8d8d4] px-[18px] uppercase text-[10px] tracking-[.14em] text-[#777] bg-transparent hover:text-black cursor-pointer"
                >
                  {t('library.clearFilters')}
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setFiltersOpen((v) => {
                    const next = !v;
                    if (!next) setPanelSettled(false); // closing: re-clip immediately
                    return next;
                  })
                }
                className={`border-0 border-l border-[#d8d8d4] px-[22px] uppercase text-[10px] tracking-[.14em] cursor-pointer ${
                  filtersOpen ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'
                }`}
              >
                {t('library.filters')}
              </button>
            </div>
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
              <div className="px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[761px]:grid-cols-2 min-[1051px]:grid-cols-4 border-b border-[#d8d8d4]">
                <div className="p-5 border-l border-[#d8d8d4] min-[761px]:border-r">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">{t('library.sizeLabel')}</span>
                  <BreedFilterSelect label={t('library.sizeLabel')} value={size} options={sizeOptions} onChange={setSize} />
                </div>
                <div className="p-5 border-l border-[#d8d8d4] min-[1051px]:border-r">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">{t('library.groomingLabel')}</span>
                  <BreedFilterSelect label={t('library.groomingLabel')} value={grooming} options={groomingOptions} onChange={setGrooming} />
                </div>
                <div className="p-5 border-l border-[#d8d8d4] min-[761px]:border-r">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">{t('library.energyLabel')}</span>
                  <BreedFilterSelect label={t('library.energyLabel')} value={energy} options={energyOptions} onChange={setEnergy} />
                </div>
                <div className="p-5 border-l border-r border-[#d8d8d4]">
                  <span className="block text-[9px] tracking-[.15em] uppercase mb-[11px] text-[#777]">{t('library.apartmentLabel')}</span>
                  <BreedFilterSelect label={t('library.apartmentLabel')} value={apartment} options={apartmentOptions} onChange={setApartment} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 min-[481px]:grid-cols-2 min-[761px]:grid-cols-3 min-[1181px]:grid-cols-4 border-l border-[#d8d8d4]">
        {showShimmer ? (
          Array.from({ length: SHIMMER_COUNT }).map((_, i) => <BreedCardShimmer key={i} />)
        ) : breeds.length ? (
          breeds.map((b) => <BreedCard key={b.id} breed={b} onClick={() => onOpenBreed(b)} />)
        ) : (
          <div className="col-span-full py-[100px] px-4 flex flex-col items-center text-center gap-5">
            <span className="w-16 h-16 rounded-full border border-[#d8d8d4] flex items-center justify-center text-[#454541]">
              <SearchIcon />
            </span>
            <div>
              <h3 className="text-2xl leading-[1.05] tracking-[-.02em] font-medium mb-2">{t('library.noBreedsTitle')}</h3>
              <p className="text-sm leading-relaxed text-[#777] max-w-[380px] mx-auto">{t('library.noBreedsBody')}</p>
            </div>
            {hasNarrowedResults && (
              <button
                type="button"
                onClick={resetSearchAndFilters}
                className="min-h-[44px] px-6 border border-black bg-transparent uppercase text-[9px] tracking-[.15em] font-bold inline-flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                {t('library.resetSearch')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="py-[34px] px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] pb-[70px] text-center">
        {!showShimmer && hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-h-[48px] px-7 border border-black bg-black text-white uppercase text-[9px] tracking-[.15em] font-bold inline-flex items-center justify-center hover:bg-transparent hover:text-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? t('library.loading') : t('library.loadMore')}
          </button>
        )}
      </div>
    </section>
  );
}
