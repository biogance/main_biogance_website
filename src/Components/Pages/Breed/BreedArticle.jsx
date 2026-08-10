'use client';

import React, { useEffect, useState } from 'react';
import BreedCard from './BreedCard';
import ShareModal from '../Modal/ShareModal';
import { dogFacts, catFacts, firstSentences, proseParagraphs, relatedBreeds } from './breedHelpers';

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

// Breed detail view — ported from #articleView (article-top / article-hero /
// quickfacts / article-body / related).
export default function BreedArticle({ breed, allBreeds, onOpenBreed, onClose }) {
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    setImgFailed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const likedList = JSON.parse(localStorage.getItem('bioganceBreedLikes') || '[]');
      setLiked(likedList.includes(`${breed.species}:${breed.slug}`));
    } catch {
      /* ignore */
    }
  }, [breed]);

  function toggleLike() {
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

  const facts = breed.species === 'dog' ? dogFacts(breed) : catFacts(breed);
  const paragraphs = proseParagraphs(breed.description);
  const related = relatedBreeds(breed, allBreeds);

  return (
    <main className="bg-white">
      <div className="border-b border-[#d8d8d4] py-6 bg-[#f6f6f4] mt-26 ">
        <div className="max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] flex justify-between items-center gap-5">
          <button type="button" onClick={onClose} className="border-0 bg-transparent p-0 cursor-pointer uppercase text-[10px] tracking-[.15em] hover:opacity-55">
            ← Back to all breeds
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
              <span>{liked ? 'Liked' : 'Like article'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="min-h-[42px] cursor-pointer border border-[#171717] bg-transparent px-4 inline-flex items-center gap-2 uppercase text-[9px] tracking-[.13em] hover:bg-black hover:text-white"
            >
              Share
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
            {breed.species === 'dog' ? 'Dog breed guide' : 'Cat breed guide'}
          </span>
          <h1 className="mt-[18px] mb-3 text-[clamp(52px,16vw,78px)] min-[761px]:text-[clamp(58px,7.5vw,130px)] leading-[.82] tracking-[-.075em] uppercase font-[100] [overflow-wrap:anywhere]">
            {breed.name}
          </h1>
          {breed.frenchName && breed.frenchName !== breed.name && (
            <div className="text-base text-[#777] mb-[34px]">French name · {breed.frenchName}</div>
          )}
          <div className="max-w-[590px] text-[17px] leading-[1.7] text-[#50504b]">{firstSentences(breed.description, 2)}</div>
        </div>
      </section>

      <section className="bg-[#f6f6f4] border-b border-[#d8d8d4]">
        <div className="max-w-[1840px] mx-auto min-[761px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-2 min-[761px]:grid-cols-3 min-[1181px]:grid-cols-6 border-l border-[#d8d8d4]">
          {facts.map((f) => (
            <div key={f.label} className="min-h-[155px] p-[22px_18px] border-r border-[#d8d8d4] flex flex-col justify-between">
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
        <div className="max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[.72fr_1.28fr] gap-[clamp(50px,8vw,150px)]">
          {/* Pinned while the description (right column) scrolls past it —
              native position:sticky bound by this row's own height (driven
              by the description's length), same top offset convention as
              ExpertAdvicesDetail.jsx's sticky sidebar. self-start is what
              lets it move at all: the grid row otherwise stretches this
              column to match the taller description column, leaving no
              room to stick within. Once the description (and so the row)
              ends, it un-pins and the rest of the page scrolls normally. */}
          <div className="min-[1181px]:sticky min-[1181px]:top-[130px] min-[1181px]:self-start">
            <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
              Breed profile
            </span>
            <h2 className="mt-[18px] text-[clamp(48px,6vw,92px)] leading-[.89] tracking-[-.065em] uppercase font-[100]">
              About the
              <br />
              breed.
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
          <div className="w-full max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
            <div className="flex justify-between items-end gap-5 mb-9">
              <div>
                <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
                  Keep exploring
                </span>
                <h2 className="mt-4 text-[clamp(44px,5vw,80px)] leading-[.9] tracking-[-.06em] uppercase font-[100]">Related breeds.</h2>
              </div>
              <button type="button" onClick={onClose} className="border-0 bg-transparent p-0 cursor-pointer uppercase text-[9px] tracking-[.15em] hover:opacity-55 shrink-0">
                View all breeds →
              </button>
            </div>
            <div className="grid grid-cols-1 min-[761px]:grid-cols-3 border-l border-[#d8d8d4]">
              {related.map((b) => (
                <BreedCard key={`${b.species}-${b.slug}`} breed={b} onClick={() => onOpenBreed(b)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={`${breed.name} — Biogance Breed Guide`}
      />
    </main>
  );
}
