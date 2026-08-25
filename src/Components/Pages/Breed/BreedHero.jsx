'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { sanitizeSeoKeyword } from '../../../utils/seoKeyword';
import { startTopLoader } from '../TopLoader';

// Same Dogs/Cats substring-match convention BreedLibrary.jsx's
// resolveSpeciesKey uses, so this asks /breed/list for the same category
// ids that page's species tabs use.
const resolveSpeciesKey = (cat) => {
  const name = (cat?.name || '').toLowerCase();
  if (name.includes('dog')) return 'dogs';
  if (name.includes('cat')) return 'cats';
  return null;
};

// Same black spinner-while-loading pattern as BreedCard.jsx.
function HeroImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  // A new src (once the real header breed's image arrives) needs its own
  // loading spin again — reset whenever it changes.
  useEffect(() => setLoaded(false), [src]);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-7 h-7 rounded-full border-2 border-black/15 border-t-black animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`relative z-10 max-h-full max-w-full object-contain saturate-[.92] p-[5px] min-[761px]:p-5 ${
          loaded ? '' : 'opacity-0'
        }`}
      />
    </>
  );
}

export default function BreedHero() {
  const { t, i18n } = useTranslation('breed');
  const isFrench = i18n.language?.startsWith('fr');
  const router = useRouter();

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

  const dogsId = useMemo(
    () => splashData?.categories?.find((c) => resolveSpeciesKey(c) === 'dogs')?.id ?? null,
    [splashData],
  );
  const catsId = useMemo(
    () => splashData?.categories?.find((c) => resolveSpeciesKey(c) === 'cats')?.id ?? null,
    [splashData],
  );

  // Featured breeds — POST {BASE_URL}/breed/list scoped to a species
  // (collection_ids) returns a `header_breeds` array: every breed admin
  // flagged is_header:true for that collection, which can be more than one
  // (e.g. two different cat breeds both flagged) — not "one per species".
  // So both calls' full arrays get combined into one flat list, deduped by
  // id in case the same breed is ever returned twice, and every entry in
  // it gets its own panel — however many that turns out to be.
  const [headerBreeds, setHeaderBreeds] = useState([]);
  // Starts true so the "Pets" side shows a loader immediately instead of a
  // blank gap while dogsId/catsId are still resolving from splashData and
  // the /breed/list calls are in flight.
  const [headerLoading, setHeaderLoading] = useState(true);

  useEffect(() => {
    if (!dogsId || !catsId) return;
    let cancelled = false;
    setHeaderLoading(true);
    Promise.all([
      axios.post(`${BASE_URL}/breed/list`, { page: 1, per_page: 1, collection_ids: dogsId }),
      axios.post(`${BASE_URL}/breed/list`, { page: 1, per_page: 1, collection_ids: catsId }),
    ])
      .then(([dogRes, catRes]) => {
        if (cancelled) return;
        const combined = [
          ...(dogRes.data?.data?.header_breeds || []),
          ...(catRes.data?.data?.header_breeds || []),
        ];
        const deduped = [...new Map(combined.map((b) => [b.id, b])).values()];
        setHeaderBreeds(deduped);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHeaderLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dogsId, catsId]);

  // Clicking a hero side goes straight to that specific breed's article —
  // same seo_keyword pattern BreedLibrary.jsx's mapListItem/openBreed use.
  const openBreed = (headerBreed) => {
    const keyword = sanitizeSeoKeyword(
      (isFrench && (headerBreed?.french_seo_keyword || headerBreed?.english_seo_keyboard)) ||
        headerBreed?.english_seo_keyboard ||
        headerBreed?.french_seo_keyword ||
        '',
    );
    if (!keyword) return;
    startTopLoader();
    router.push(`/breed-guide/${keyword}`);
  };

  // One panel per header breed, whatever that count actually is — 1 fills
  // the whole "Pets" area, 2 split it evenly, 3+ just keep splitting
  // evenly too (gridTemplateColumns is set from this same length below,
  // not a hardcoded 2-column class, since Tailwind can't generate a
  // grid-cols-N class for an N it doesn't see literally in the source).
  // The two background shades alternate by position so neighbours never
  // look identical, regardless of which species each breed is.
  const heroEntries = headerBreeds.map((breed, i) => ({
    key: breed.id,
    breed,
    bg: i % 2 === 0 ? 'bg-[#efefee]' : 'bg-[#deddd8]',
    name: (isFrench && breed.french_name) || breed.name,
  }));

  return (
    <section className="relative w-full bg-[#f6f6f4] border-b border-[#d8d8d4] min-h-screen min-[1181px]:h-screen overflow-hidden grid grid-rows-[auto_auto] min-[1181px]:grid-rows-1 min-[1181px]:grid-cols-[1.05fr_.95fr]">
      {/* Copy */}
      <div className="flex flex-col justify-center max-w-[1040px] px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] py-[clamp(24px,6vw,60px)] min-[1181px]:py-[clamp(70px,8vw,100px)]">
        <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
          {t('hero.eyebrow')}
        </span>
        <h1 className="mt-[18px] mb-[18px] min-[721px]:mt-[22px] min-[721px]:mb-[26px] text-[clamp(38px,11vw,58px)] min-[721px]:text-[clamp(48px,8vw,72px)] min-[1181px]:text-[clamp(62px,8.4vw,85  px)] leading-[1.02] tracking-[-.05em] min-[1181px]:tracking-[-.08em] uppercase font-medium">
          {t('hero.titleLine1')}
          <br />
          {t('hero.titleLine2')}
        </h1>
        <p className="max-w-[620px] text-sm min-[721px]:text-base leading-[1.65] min-[721px]:leading-[1.72] text-[#595955]">
          {t('hero.intro')}
        </p>
      </div>

      {/* Pets */}
      <div
        className="relative grid h-[260px] min-[481px]:h-[340px] min-[721px]:h-[420px] min-[1181px]:h-full min-[1181px]:min-h-0 overflow-hidden bg-[#efefee]"
        style={{ gridTemplateColumns: `repeat(${headerLoading ? 2 : heroEntries.length || 1}, minmax(0, 1fr))` }}
      >
        {headerLoading ? (
          // Guesses the common 2-breed layout (this section's default shape)
          // while the real count is still unknown — same
          // bg-[#efefee]/animate-pulse shimmer convention as
          // BreedLibrary.jsx's BreedCardShimmer, just two side-by-side
          // panels instead of a spinner.
          <>
            <div className="border-0 border-l border-[#d8d8d4] bg-[#efefee] animate-pulse" />
            <div className="border-0 border-l border-[#d8d8d4] bg-[#deddd8] animate-pulse" />
          </>
        ) : (
          heroEntries.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => openBreed(entry.breed)}
              className={`relative overflow-hidden border-0 border-l border-[#d8d8d4] ${entry.bg} flex items-center justify-center p-0 cursor-pointer`}
            >
              <HeroImage src={`${MEDIA_URL}${entry.breed.media}`} alt={entry.name} />
              <span className="absolute bottom-[14px] left-[14px] min-[761px]:bottom-[22px] min-[761px]:left-[22px] text-[8px] min-[761px]:text-[9px] tracking-[.15em] uppercase">
                {entry.name}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
