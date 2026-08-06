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

  // Real average rating from the API reviews, in place of html's hardcoded "4.9".
  const averageRating = total > 0
    ? (apiReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total).toFixed(1)
    : null;

  return (
    <section className="bg-[#e7e7e5] border border-gray-300 py-[76px] min-[721px]:py-[clamp(78px,9vw,138px)]">
      {/* Padding lives on this max-w-1840 div (not the outer section) — same
          structure as the other sections' headers, so widths line up. */}
      <div className="w-full max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1101px]:grid-cols-[0.75fr_1.25fr] gap-[42px] min-[721px]:gap-[70px] items-start">

        {/* Left column (.eyebrow / .score / .stars / .review-add) */}
        <div>
          <div className="flex items-center gap-3 text-black">
            <span className="w-[34px] h-px bg-current"></span>
            <span className="text-[10px] tracking-[0.22em] uppercase">{t('reviews.title')}</span>
          </div>

          {isLoading ? (
            <div className="mt-[18px] h-[0.8em] w-[3ch] bg-black/10 rounded animate-pulse text-[clamp(72px,9vw,145px)] leading-[0.8]" />
          ) : averageRating && (
            <div className="mt-[18px] text-[clamp(72px,9vw,145px)] leading-[0.8] tracking-[-0.075em] text-black">
              {averageRating}
            </div>
          )}

          <div className="mt-[22px] tracking-[0.18em] text-black" aria-hidden="true">★★★★★</div>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center justify-center min-h-[44px] mt-[28px] px-5 border border-black bg-transparent text-black text-[9px] font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-200 hover:bg-black hover:text-white"
          >
            {t('reviews.addReview')}
          </button>
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
          console.log('Review submitted:', { rating, feedback });
        }}
      />
    </section>
  );
}
