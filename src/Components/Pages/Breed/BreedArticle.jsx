'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import BreedCard from './BreedCard';
import ShareModal from '../Modal/ShareModal';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { sanitizeSeoKeyword } from '../../../utils/seoKeyword';

function Rating({ n = 0 }) {
  return (
    <div className="flex items-center gap-[3px] mt-[10px]" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={`not-italic text-sm leading-none ${i <= n ? 'text-black' : 'text-[#c7c6c0]'}`}>
          ★
        </i>
      ))}
    </div>
  );
}


function BreedArticleShimmer() {
  return (
    <main className="bg-white">
      <div className="border-b border-[#d8d8d4] py-6 bg-[#f6f6f4] mt-26">
        <div className="px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] flex justify-between items-center gap-5">
          <div className="h-3 w-36 bg-[#e2e1dc] rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-[42px] w-[132px] bg-[#e2e1dc] animate-pulse" />
            <div className="h-[42px] w-[92px] bg-[#e2e1dc] animate-pulse" />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 min-[1181px]:grid-cols-[1.05fr_.95fr] min-h-[400px] min-[761px]:min-h-[560px] min-[1181px]:min-h-[720px] border-b border-[#d8d8d4]">
        <div className="bg-[#efefee] min-h-[400px] min-[761px]:min-h-[560px] min-[1181px]:min-h-[720px] animate-pulse" />
        <div className="flex flex-col justify-center px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] py-[clamp(60px,7vw,110px)]">
          <div className="h-[10px] w-40 bg-[#e7e6e1] rounded animate-pulse" />
          <div className="mt-[18px] mb-3 flex flex-col gap-3">
            <div className="h-[clamp(44px,13vw,64px)] w-[80%] bg-[#e7e6e1] rounded animate-pulse" />
            <div className="h-[clamp(44px,13vw,64px)] w-[50%] bg-[#e7e6e1] rounded animate-pulse" />
          </div>
          <div className="h-4 w-52 bg-[#e7e6e1] rounded animate-pulse mb-[34px]" />
          <div className="max-w-[590px] flex flex-col gap-2">
            <div className="h-[14px] w-full bg-[#e7e6e1] rounded animate-pulse" />
            <div className="h-[14px] w-full bg-[#e7e6e1] rounded animate-pulse" />
            <div className="h-[14px] w-2/3 bg-[#e7e6e1] rounded animate-pulse" />
          </div>
        </div>
      </section>

      <section className="bg-[#f6f6f4] border-b border-[#d8d8d4]">
      
        <div className="min-[761px]:px-[clamp(24px,2.4vw,46px)] flex overflow-x-auto min-[761px]:grid min-[761px]:grid-cols-3 min-[761px]:overflow-visible min-[1181px]:grid-cols-6 border-l border-[#d8d8d4]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[160px] min-[761px]:w-auto min-h-[125px] min-[761px]:min-h-[155px] p-[22px_18px] border-r border-[#d8d8d4] flex flex-col justify-between">
              <div className="h-2 w-14 bg-[#e2e1dc] rounded animate-pulse" />
              <div className="h-[17px] w-20 bg-[#e2e1dc] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-b border-[#d8d8d4] py-[clamp(80px,9vw,140px)]">
        <div className="px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[.72fr_1.28fr] gap-[clamp(50px,8vw,150px)]">
          <div>
            <div className="h-[10px] w-32 bg-[#e7e6e1] rounded animate-pulse" />
            <div className="mt-[18px] flex flex-col gap-3">
              <div className="h-[clamp(38px,5vw,58px)] w-[70%] bg-[#e7e6e1] rounded animate-pulse" />
              <div className="h-[clamp(38px,5vw,58px)] w-[45%] bg-[#e7e6e1] rounded animate-pulse" />
            </div>
          </div>
          <div className="max-w-[830px] flex flex-col gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-[14px] bg-[#e7e6e1] rounded animate-pulse ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f6f4] py-[clamp(78px,8vw,120px)]">
        <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
          <div className="flex justify-between items-end gap-5 mb-9">
            <div>
              <div className="h-[10px] w-32 bg-[#d8d8d4] rounded animate-pulse" />
              <div className="mt-4 h-[clamp(44px,5vw,80px)] w-56 bg-[#d8d8d4] rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 min-[761px]:grid-cols-3 border-l border-[#d8d8d4]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-0 bg-white border-r border-b border-[#d8d8d4] flex flex-col">
              {/* aspect-[1.6/1] + p-4/mt-2.5 mirror BreedCard.jsx's
                  compact prop (used for the real cards below) so the
                  shimmer doesn't taller/shorter-jump once data lands. */}
              <div className="aspect-[1.6/1] bg-[#efefee] animate-pulse" />
              <div className="p-4 pb-5 min-h-[112px] flex flex-col">
                <div className="h-2 w-16 bg-[#e7e6e1] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[#e7e6e1] rounded animate-pulse mt-2.5 mb-1.5" />
                <div className="h-3 w-1/3 bg-[#e7e6e1] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function firstSentences(text, count = 2) {
  const parts = (text || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return parts.slice(0, count).join(' ').trim();
}

function proseParagraphs(text) {
  const sentences = (text || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  if (sentences.length <= 3) return [text];
  const paras = [];
  for (let i = 0; i < sentences.length; i += 3) paras.push(sentences.slice(i, i + 3).join(' ').trim());
  return paras;
}

function starCount(str = '') {
  return [...str].filter((ch) => ch === '⭐').length;
}

// `v` is the raw category value the API sends ('Oui'/'Non'). Text comes
// from src/locales/{en,fr}/breed.json via the `breed` namespace's `t()`.
function apartmentText(v, t) {
  const key = v === 'Oui' ? 'suitable' : v === 'Non' ? 'notSuitable' : null;
  return key ? t(`apartment.short.${key}`) : t('apartment.unknown');
}


function resolveCategory(cats, type, lookupMap) {
  const entry = cats.find((c) => c.type === type);
  if (!entry) return null;
  return entry.category || lookupMap?.get(entry.category_id) || null;
}

// Turns one raw /breed/detail item (the main `breed`, or one of its
// `related_breeds`) into the flat shape this page renders.
function mapBreed(item, isFrench, lookups = {}) {
  const cats = item.categories || [];
  const typeEntry = resolveCategory(cats, 'type', lookups.type);
  const groupEntry = resolveCategory(cats, 'breed-group', lookups.group);
  const energyEntry = resolveCategory(cats, 'energy-level', lookups.energy);
  const groomingEntry = resolveCategory(cats, 'hygiene-level', lookups.grooming);
  const apartmentEntry = resolveCategory(cats, 'suitable-for-apartment', lookups.apartment);
  const collectionEntry = resolveCategory(cats, 'collection', lookups.collection);

  const seoKeyword =
    (isFrench && (item.french_seo_keyword || item.english_seo_keyboard)) ||
    item.english_seo_keyboard ||
    item.french_seo_keyword ||
    '';

  return {
    id: item.id,
    species: /cat|chat/i.test(collectionEntry?.name || '') ? 'cat' : 'dog',
    slug: sanitizeSeoKeyword(seoKeyword),
    name: (isFrench && item.french_name) || item.name || '',
    frenchName: item.french_name || '',
    image: item.media ? `${MEDIA_URL}${item.media}` : '',
    description: (isFrench && item.french_description) || item.description || '',
    tags: (item.tags || []).map((tg) => tg.name).filter(Boolean),
    size: typeEntry ? (isFrench && typeEntry.french_name) || typeEntry.name : '',
    group: groupEntry ? (isFrench && groupEntry.french_name) || groupEntry.name : '',
    energy: energyEntry ? starCount((isFrench && energyEntry.french_name) || energyEntry.name) : 0,
    grooming: groomingEntry ? starCount((isFrench && groomingEntry.french_name) || groomingEntry.name) : 0,
    apartment: apartmentEntry ? apartmentEntry.french_name : '',
  };
}


export default function BreedArticle({ slug, onLoaded }) {
  const { t, i18n } = useTranslation('breed');
  const isFrench = i18n.language?.startsWith('fr');
  const router = useRouter();

  // "Back to all breeds" / "View all breeds" / the not-found state's back
  // button all land on /breed-guide — this flag tells that page (Breed.jsx)
  // to scroll itself down past the hero/intro straight to BreedLibrary.jsx
  // (id="library") once it mounts, instead of leaving the user at the very
  // top of the page they'd have to scroll past those sections again to get
  // back to the grid they came from.
  const goToBreedGuide = () => {
    try {
      sessionStorage.setItem('breedGuideScrollTo', 'library');
    } catch {
      /* ignore */
    }
    router.push('/breed-guide');
  };

  
  const goToBreed = (b) => {
    router.push(`/breed-guide/${b.slug}`);
  };

  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  
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

  const lookups = useMemo(() => {
    const toMap = (list) => new Map((list || []).map((c) => [c.id, c]));
    return {
      collection: toMap(splashData?.categories),
      type: toMap(splashData?.breed_type),
      group: toMap(splashData?.breed_group),
      energy: toMap(splashData?.breed_energy_level),
      grooming: toMap(splashData?.breed_hygiene_level),
      apartment: toMap(splashData?.breed_suitable_for_apartment),
    };
  }, [splashData]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    axios
      .post(`${BASE_URL}/breed/detail`, { seo_keyword: slug })
      .then((res) => {
        if (cancelled) return;
        if (res.data?.status && res.data.data?.breed) setRaw(res.data.data);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const breed = raw?.breed ? mapBreed(raw.breed, isFrench, lookups) : null;
  const related = (raw?.related_breeds || []).map((item) => mapBreed(item, isFrench, lookups));

 
  useEffect(() => {
    if (!breed?.slug || typeof window === 'undefined') return;
    const newPath = `/breed-guide/${encodeURIComponent(breed.slug)}`;
    if (window.location.pathname === newPath) return;
    window.history.replaceState(window.history.state, '', newPath);
  }, [breed?.slug]);

 
  useEffect(() => {
    if (!breed) return;
    onLoaded?.(breed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breed?.slug]);

  useEffect(() => {
    if (!breed) return;
    onLoaded?.(breed);
    setImgFailed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const likedList = JSON.parse(localStorage.getItem('bioganceBreedLikes') || '[]');
      setLiked(likedList.includes(`${breed.species}:${breed.slug}`));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breed?.id]);

  function toggleLike() {
    if (!breed) return;
    const key = `${breed.species}:${breed.slug}`;
    let likedList = [];
    try {
      likedList = JSON.parse(localStorage.getItem('bioganceBreedLikes') || '[]');
    } catch {
      /* ignore */
    }
    likedList = likedList.includes(key) ? likedList.filter((x) => x !== key) : [...likedList, key];
    localStorage.setItem('bioganceBreedLikes', JSON.stringify(likedList));
    setLiked(likedList.includes(key));
  }

  if (loading) {
    return <BreedArticleShimmer />;
  }

  if (failed || !breed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white text-center px-4">
        <p className="text-lg">{t('article.notFound')}</p>
        <button
          type="button"
          onClick={goToBreedGuide}
          className="border border-black px-5 py-3 uppercase text-[10px] tracking-[.15em] cursor-pointer hover:bg-black hover:text-white"
        >
          {t('article.back')}
        </button>
      </div>
    );
  }

  const facts =
    breed.species === 'dog'
      ? [
          { label: t('article.facts.size'), value: breed.size || '—' },
          { label: t('article.facts.group'), value: breed.group.replace(/^(GROUP|GROUPE)\s*\d+\s*:\s*/i, '') || '—' },
          { label: t('article.facts.energy'), value: `${breed.energy || '—'} / 5`, rating: breed.energy },
          { label: t('article.facts.grooming'), value: `${breed.grooming || '—'} / 5`, rating: breed.grooming },
          { label: t('article.facts.apartment'), value: apartmentText(breed.apartment, t) },
          { label: t('article.facts.coat'), value: '—' },
        ]
      : [
          { label: t('article.facts.species'), value: t('article.facts.catValue') },
          { label: t('article.facts.frenchName'), value: breed.frenchName || breed.name },
          { label: t('article.facts.energy'), value: `${breed.energy || '—'} / 5`, rating: breed.energy },
          { label: t('article.facts.grooming'), value: `${breed.grooming || '—'} / 5`, rating: breed.grooming },
          { label: t('article.facts.apartment'), value: apartmentText(breed.apartment, t) },
          { label: t('article.facts.guide'), value: t('article.facts.guideValue') },
        ];

  const paragraphs = proseParagraphs(breed.description);

  return (
    <main className="bg-white">
     
      <div className="border-b border-[#d8d8d4] py-6 bg-[#f6f6f4] mt-26 ">
       
        <div className="px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] flex flex-wrap justify-between items-center gap-x-5 gap-y-3">
          <button type="button" onClick={goToBreedGuide} className="border-0 bg-transparent p-0 cursor-pointer uppercase text-[10px] tracking-[.15em] hover:opacity-55">
            {t('article.back')}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleLike}
              className={`min-h-[42px] cursor-pointer border border-[#171717] px-4 inline-flex items-center gap-2 uppercase text-[9px] tracking-[.13em] ${
                liked ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{liked ? '♥' : '♡'}</span>
              <span>{liked ? t('article.liked') : t('article.likeArticle')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="min-h-[42px] cursor-pointer border border-[#171717] bg-transparent px-4 inline-flex items-center gap-2 uppercase text-[9px] tracking-[.13em] hover:bg-black hover:text-white"
            >
              {t('article.share')}
            </button>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 min-[1181px]:grid-cols-[1.05fr_.95fr] min-h-[400px] min-[761px]:min-h-[560px] min-[1181px]:min-h-[720px] border-b border-[#d8d8d4]">
        <div className="bg-[#efefee] grid place-items-center overflow-hidden min-h-[400px] min-[761px]:min-h-[560px] min-[1181px]:min-h-[720px]">
          {breed.image && !imgFailed ? (
            <img src={breed.image} alt={breed.name} className="max-w-full max-h-full object-contain p-[34px]" onError={() => setImgFailed(true)} />
          ) : (
            <div className="w-full h-full grid place-items-center bg-[#efefee] text-[#171717]" />
          )}
        </div>
        <div className="flex flex-col justify-center px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] py-[clamp(60px,7vw,110px)]">
          <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
            {breed.species === 'dog' ? t('article.dogGuide') : t('article.catGuide')}
          </span>
          <h1 className="mt-[18px] mb-3 text-[clamp(52px,16vw,78px)] min-[761px]:text-[clamp(58px,7.5vw,92px)] leading-[.97] tracking-[-.075em] uppercase font-[100] [overflow-wrap:anywhere]">
            {breed.name}
          </h1>
          {breed.frenchName && breed.frenchName !== breed.name && (
            <div className="text-base text-[#777] mb-[34px]">
              {t('article.frenchNamePrefix')} {breed.frenchName}
            </div>
          )}
          <div className="max-w-[590px] text-[17px] leading-[1.7] text-[#50504b]">{firstSentences(breed.description, 2)}</div>
        </div>
      </section>

      <section className="bg-[#f6f6f4] border-b border-[#d8d8d4]">
      
        <div className="min-[761px]:px-[clamp(24px,2.4vw,46px)] flex overflow-x-auto min-[761px]:grid min-[761px]:grid-cols-3 min-[761px]:overflow-visible min-[1181px]:grid-cols-6 border-l border-[#d8d8d4]">
          {facts.map((f) => (
           
            <div key={f.label} className="shrink-0 w-[160px] min-[761px]:w-auto min-h-[125px] min-[761px]:min-h-[155px] p-[22px_18px] border-r border-[#d8d8d4] flex flex-col justify-between">
              <small className="text-[8px] tracking-[.15em] uppercase text-[#858580]">{f.label}</small>
              <div>
                <strong className="block text-[17px] leading-[1.25] font-medium">{f.value}</strong>
                {'rating' in f && <Rating n={Number(f.rating) || 0} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-b border-[#d8d8d4] py-[clamp(80px,9vw,140px)]">
        <div className="px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[.72fr_1.28fr] gap-[clamp(50px,8vw,150px)]">
          <div className="min-[1181px]:sticky min-[1181px]:top-[130px] min-[1181px]:self-start">
            <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
              {t('article.profileEyebrow')}
            </span>
            <h2 className="mt-[18px] text-[clamp(48px,6vw,92px)] leading-[.97] tracking-[-.065em] uppercase font-[100]">
              {t('article.aboutTitleLine1')}
              <br />
              {t('article.aboutTitleLine2')}
            </h2>
          </div>
          <div className="max-w-[830px]">
            {paragraphs.map((p, i) => (
              <p key={i} className={`mb-6 ${i === 0 ? 'text-xl leading-[1.68] text-[#222]' : 'text-[17px] leading-[1.85] text-[#454541]'}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#f6f6f4] py-[clamp(78px,8vw,120px)]">
          
          <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
           
            <div className="flex flex-wrap justify-between items-end gap-x-5 gap-y-3 mb-9">
              <div>
                <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
                  {t('article.relatedEyebrow')}
                </span>
                <h2 className="mt-4 text-[clamp(44px,5vw,80px)] leading-[.9] tracking-[-.06em] uppercase font-[100]">{t('article.relatedTitle')}</h2>
              </div>
              <button type="button" onClick={goToBreedGuide} className="border-0 bg-transparent p-0 cursor-pointer uppercase text-[9px] tracking-[.15em] hover:opacity-55 shrink-0">
                {t('article.viewAll')}
              </button>
            </div>
          </div>
         
          <div className="grid grid-cols-1 min-[761px]:grid-cols-3 border-l border-[#d8d8d4]">
            {related.map((b) => (
              <BreedCard key={`${b.species}-${b.slug}`} breed={b} onClick={() => goToBreed(b)} compact />
            ))}
          </div>
        </section>
      )}

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={`${breed.name} — ${t('article.shareTitleSuffix')}`}
      />
    </main>
  );
}