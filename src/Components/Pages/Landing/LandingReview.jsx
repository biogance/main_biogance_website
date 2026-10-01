import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductModalAddReview from '../ProductDetail/ProductModalAddReview';

const formatCounter = (n) => String(n).padStart(2, '0');

// "What pet parents are saying" — same editorial design as .reviews /
// .review-shell / .review-carousel in HOMEPAGE V2.html: a left column with
// an aggregate score + static 5 stars + "Add a review", and a right column
// single-slide auto-rotating quote carousel with arrows/dots/counter.
export default function LandingReview({ data }) {
  const { t } = useTranslation('home');
  const apiReviews = data?.reviews || [];
  const isLoading = !data;
  const total = apiReviews.length;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [index, setIndex] = useState(0);
  // True for exactly one render right after a last→first (or first→last)
  // wrap, so that single step renders with no transition — otherwise the
  // track would visibly slide backward through every review to get there.
  const [noTransition, setNoTransition] = useState(false);
  const timerRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Advances by exactly one step (±1). Only this — not the absolute dot
  // jumps — can cross the wrap boundary, so only this needs the instant-jump handling.
  const step = (direction) => {
    if (total === 0) return;
    const next = indexRef.current + direction;
    if (next >= total) {
      setNoTransition(true);
      setIndex(0);
    } else if (next < 0) {
      setNoTransition(true);
      setIndex(total - 1);
    } else {
      setNoTransition(false);
      setIndex(next);
    }
  };

  const goToIndex = (i) => {
    if (total === 0) return;
    setNoTransition(false);
    setIndex(((i % total) + total) % total);
  };

  // Once the instant jump has painted, re-enable the transition so the
  // *next* step (in either direction) animates normally again.
  useEffect(() => {
    if (!noTransition) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setNoTransition(false));
    });
    return () => cancelAnimationFrame(frame);
  }, [noTransition]);

  const restart = () => {
    clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => step(1), 5500);
    }
  };

  useEffect(() => {
    setIndex(0);
    restart();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Desktop: shrink the subtitle box to its widest rendered line so the
  // text sits flush with the right padding (same as LandingCategories).
  const { i18n } = useTranslation('home');
  const subtitleRef = useRef(null);
  useEffect(() => {
    const el = subtitleRef.current;
    if (!el) return undefined;
    const fit = () => {
      el.style.width = '';
      if (window.innerWidth < 900) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const widest = Math.max(0, ...[...range.getClientRects()].map((r) => r.width));
      if (widest) el.style.width = `${Math.ceil(widest)}px`;
    };
    fit();
    document.fonts?.ready?.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [i18n.language]);

  // Real average rating from the API reviews, in place of html's hardcoded "4.9".
  const averageRating = total > 0
    ? (apiReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total).toFixed(1)
    : null;

  return (
    <section className="bg-[#e7e7e5] border border-gray-300 py-[76px] min-[721px]:py-[clamp(78px,9vw,138px)]">
      {/* Padding lives on this div (not the outer section) — same
          structure as the other sections' headers, so widths line up.
          No max-w-[1840px]/mx-auto — that cap only centers once the
          viewport passes 1840px, which made this sit flush left up to
          that width then visibly slide inward on wider monitors as the
          centered cap opened up. Dropping the cap keeps it pinned to
          the same left inset at every viewport width — same fix as
          MainVideo.jsx's hero wrap. */}
      {/* Header — hairline + eyebrow, two-line title. The subtitle sits on
          the first title line and "Add a review" on the second, both flush
          with the right padding (same as the other landing sections). */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] mb-10 min-[721px]:mb-14">
        <div className="w-full border-b border-black/15 pb-6 sm:pb-8">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <span className="h-px w-8 shrink-0 bg-black/30 sm:w-12" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#666] sm:text-[10px]">
              {t('reviews.eyebrow')}
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6">
            {/* display:contents lets the two title lines sit in the grid rows */}
            <h2 className="contents">
              <span className="col-start-1 row-start-1 block text-[clamp(26px,4.5vw,56px)] font-light uppercase leading-[1.04] tracking-[-0.035em] text-[#444]">
                {t('reviews.headingLine1')}
              </span>
              <span className="col-start-1 row-start-2 block text-[clamp(26px,4.5vw,56px)] font-extrabold uppercase leading-[1.04] tracking-[-0.035em] text-[#0c0c0c]">
                {t('reviews.headingLine2')}
              </span>
            </h2>

            <p
              ref={subtitleRef}
              className="col-span-2 row-start-3 mt-4 max-w-[480px] text-[13px] leading-[1.7] text-[#555] sm:text-[14px] min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:mt-0 min-[900px]:justify-self-end min-[900px]:self-center"
            >
              {t('reviews.subtitle')}
            </p>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="group col-start-2 row-start-2 self-center justify-self-end inline-flex items-center gap-2 cursor-pointer border border-black/30 px-4 h-8 sm:h-9 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-bold text-black whitespace-nowrap rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95 shadow-sm"
            >
              <span className="text-[13px] leading-none font-normal">+</span>
              {t('reviews.addReview')}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1101px]:grid-cols-[0.75fr_1.25fr] gap-[42px] min-[721px]:gap-[70px] items-start">

        {/* Left column (.eyebrow / .score / .stars / .review-add) */}
        <div>
          {isLoading ? (
            <div className="h-[0.8em] w-[3ch] bg-black/10 rounded animate-pulse text-[clamp(72px,9vw,145px)] leading-[0.8]" />
          ) : averageRating && (
            <div className="text-[clamp(72px,9vw,145px)] leading-[0.8] tracking-[-0.075em] text-black">
              {averageRating}
            </div>
          )}

          <div className="mt-[22px] tracking-[0.18em] text-black" aria-hidden="true">★★★★★</div>
        </div>

        {/* Right column — quote carousel (.review-carousel) */}
        <div
          className="relative overflow-hidden min-w-0"
          onMouseEnter={() => clearInterval(timerRef.current)}
          onMouseLeave={restart}
        >
          {isLoading || total === 0 ? (
            <div className="animate-pulse">
              <div className="h-[1em] md:h-[1.2em] bg-black/10 rounded w-full mb-4" />
              <div className="h-3 w-40 bg-black/10 rounded" />
            </div>
          ) : (
            <>
              <div
                className={`flex ${noTransition ? '' : 'transition-transform duration-500 ease-out'}`}
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {apiReviews.map((review, i) => (
                  <article key={review.id ?? i} className="w-full shrink-0 grow-0 basis-full pr-0 md:pr-[clamp(8px,2vw,30px)]">
                    <blockquote className="m-0 text-[clamp(30px,4vw,62px)] leading-[1.02] tracking-[-0.043em] font-medium text-black">
                      “{review.message}”
                    </blockquote>
                    <div className="mt-[30px] uppercase text-[9px] tracking-[0.14em] text-black">
                      {[review.name, review.date].filter(Boolean).join(' · ')}
                    </div>
                  </article>
                ))}
              </div>

              {/* Controls (.review-controls) */}
              <div className="mt-[28px] md:mt-[38px] pt-[18px] border-t border-black/[0.18] flex items-center justify-between gap-[14px] md:gap-[24px]">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { step(-1); restart(); }}
                    aria-label="Previous review"
                    className="w-10 h-10 md:w-11 md:h-11 border border-black/30 bg-transparent grid place-items-center cursor-pointer text-lg leading-none transition-colors duration-200 hover:bg-black hover:text-white"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => { step(1); restart(); }}
                    aria-label="Next review"
                    className="w-10 h-10 md:w-11 md:h-11 border border-black/30 bg-transparent grid place-items-center cursor-pointer text-lg leading-none transition-colors duration-200 hover:bg-black hover:text-white"
                  >
                    →
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {apiReviews.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { goToIndex(i); restart(); }}
                      aria-label={`Go to review ${i + 1}`}
                      aria-current={i === index}
                      className={`h-[2px] border-0 p-0 cursor-pointer transition-all duration-200 ${
                        i === index ? 'w-[30px] md:w-[44px] bg-black' : 'w-[18px] md:w-[28px] bg-black/[0.22]'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-[9px] tracking-[0.14em] uppercase text-[#6f6f6a] whitespace-nowrap">
                  {formatCounter(index + 1)} / {formatCounter(total)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ProductModalAddReview
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={({ rating, feedback }) => {
        
        }}
      />
    </section>
  );
}
