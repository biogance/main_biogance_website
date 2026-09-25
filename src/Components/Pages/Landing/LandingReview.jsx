import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductModalAddReview from '../ProductDetail/ProductModalAddReview';
import { GoPlus } from 'react-icons/go';

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

  // ── Presentation helpers (no data/logic changes) ──────────────────────
  const ratingOf = (r) => Math.max(0, Math.min(5, Number(r?.rating) || 0));
  const ratedReviews = apiReviews.filter((r) => ratingOf(r) > 0);
  // Star breakdown (5 → 1) for the summary card, from the same API reviews.
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratedReviews.filter((r) => Math.round(ratingOf(r)) === star).length,
  }));
  const percentOf = (count) =>
    ratedReviews.length ? Math.round((count / ratedReviews.length) * 100) : 0;
  const avgNum = Number(averageRating) || 0;
  const ratingLabel =
    avgNum >= 4.5
      ? t('reviews.ratingLabel.excellent')
      : avgNum >= 4
        ? t('reviews.ratingLabel.great')
        : avgNum >= 3
          ? t('reviews.ratingLabel.good')
          : t('reviews.ratingLabel.fair');
  const initialsOf = (name) =>
    String(name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || '★';

  // Fractional star row — grey base with a clipped overlay.
  const Stars = ({ value, tone = 'light', className = '' }) => (
    <span
      role="img"
      aria-label={`${value} / 5`}
      className={`relative inline-block whitespace-nowrap leading-none tracking-[0.14em] ${className}`}
    >
      <span className={tone === 'dark' ? 'text-white/25' : 'text-black/20'}>★★★★★</span>
      <span
        className={`absolute inset-y-0 left-0 overflow-hidden ${tone === 'dark' ? 'text-white' : 'text-black'}`}
        style={{ width: `${(value / 5) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );

  return (
    <section className="bg-[#e7e7e5] border border-gray-300 py-[76px] min-[721px]:py-[clamp(78px,9vw,138px)]">
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">

        {/* Section header — index chip + eyebrow, big title, intro copy */}
        <div className="pb-8 md:pb-10 mb-8 md:mb-12 border-b border-black/15 grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] gap-5 md:gap-8 items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-bold tracking-[0.2em] tabular-nums">05</span>
              <span className="h-px w-10 bg-black/30" />
              <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#555]">Reviews</span>
            </div>
            <h2 className="m-0 text-[clamp(30px,5vw,68px)] leading-[1.02] tracking-[-0.04em] uppercase font-light text-black">
              {t('reviews.title')}
            </h2>
          </div>
          <p className="m-0 max-w-[460px] text-[14px] leading-[1.75] text-[#555] min-[900px]:text-right min-[900px]:ml-auto">
            {t('reviews.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 min-[1101px]:grid-cols-[minmax(320px,0.72fr)_1.28fr] gap-4 md:gap-6 items-stretch">

          {/* Summary card — score, stars, breakdown, CTA */}
          <div className="bg-transparent border border-black/10 p-6 md:p-9 flex flex-col gap-8">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-[72px] w-[140px] bg-black/10 mb-5" />
                <div className="h-4 w-32 bg-black/10 mb-3" />
                <div className="h-3 w-40 bg-black/10 mb-8" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-2 w-full bg-black/10 mb-3" />
                ))}
              </div>
            ) : (
              <div>
                {averageRating && (
                  <div className="flex items-center gap-5 md:gap-6">
                    <span className="text-[clamp(64px,7vw,96px)] leading-[0.85] font-light tracking-[-0.06em] text-black tabular-nums">
                      {averageRating}
                    </span>
                    <div className="pl-5 md:pl-6 border-l border-black/20 flex flex-col gap-2">
                      <Stars value={Number(averageRating)} className="text-[17px]" />
                      <span className="text-[12px] font-bold tracking-[0.18em] uppercase text-black">
                        {ratingLabel}
                      </span>
                      <span className="text-[11px] tracking-[0.12em] uppercase text-[#6f6e68]">
                        {t('reviews.basedOn', { count: total })}
                      </span>
                    </div>
                  </div>
                )}

                {ratedReviews.length > 0 && (
                  <div className="mt-8 pt-7 border-t border-black/20 flex flex-col gap-3">
                    {distribution.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-3 text-[11px] tabular-nums text-[#55544e]">
                        <span className="w-6 shrink-0 tracking-[0.08em]">{star} ★</span>
                        <span className="relative h-[6px] flex-1 bg-black/[0.12]">
                          <span
                            className="absolute inset-y-0 left-0 bg-black transition-[width] duration-700"
                            style={{ width: `${percentOf(count)}%` }}
                          />
                        </span>
                        <span className="w-9 shrink-0 text-right">{percentOf(count)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-auto inline-flex items-center justify-between gap-4 w-full min-h-[54px] px-6 border border-black bg-black text-white text-[11px] font-bold tracking-[0.18em] uppercase cursor-pointer transition-colors duration-200 hover:bg-white hover:text-black"
            >
              <span>{t('reviews.addReview')}</span>
              <span aria-hidden="true"><GoPlus size={18} /></span>
            </button>
          </div>

          {/* Featured review carousel — same single-slide logic, black card */}
          <div
            className="relative min-w-0 overflow-hidden bg-[#0c0c0c] text-white p-6 md:p-10 lg:p-12 flex flex-col"
            onMouseEnter={() => clearInterval(timerRef.current)}
            onMouseLeave={restart}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute right-6 top-2 font-serif italic leading-none text-[clamp(120px,14vw,220px)] text-white/[0.06]"
            >
              “
            </span>

            {isLoading || total === 0 ? (
              <div className="animate-pulse relative flex-1">
                <div className="h-4 w-28 bg-white/10 mb-8" />
                <div className="h-7 w-full bg-white/10 mb-3" />
                <div className="h-7 w-11/12 bg-white/10 mb-3" />
                <div className="h-7 w-2/3 bg-white/10 mb-10" />
                <div className="h-10 w-48 bg-white/10" />
              </div>
            ) : (
              <>
                <div className="relative flex-1 overflow-hidden">
                  <div
                    className={`flex h-full ${noTransition ? '' : 'transition-transform duration-700 ease-out'}`}
                    style={{ transform: `translateX(-${index * 100}%)` }}
                  >
                    {apiReviews.map((review, i) => (
                      <article
                        key={review.id ?? i}
                        className="w-full shrink-0 grow-0 basis-full flex flex-col justify-between gap-10 pr-0 md:pr-6"
                      >
                        <div>
                          {ratingOf(review) > 0 && (
                            <Stars value={ratingOf(review)} tone="dark" className="text-[16px]" />
                          )}
                          <blockquote className="m-0 mt-6 text-[clamp(20px,2.3vw,34px)] leading-[1.42] tracking-[-0.015em] font-normal text-white">
                            “{review.message}”
                          </blockquote>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="grid place-items-center w-12 h-12 shrink-0 bg-white text-black text-[13px] font-bold tracking-[0.06em]">
                            {initialsOf(review.name)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold tracking-[0.14em] uppercase truncate">
                              {review.name}
                            </div>
                            {review.date && (
                              <div className="mt-1 text-[11px] tracking-[0.1em] uppercase text-white/55">
                                {review.date}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Controls — segmented progress, counter, arrows */}
                <div className="relative mt-10 pt-6 border-t border-white/15 flex items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                    {apiReviews.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { goToIndex(i); restart(); }}
                        aria-label={`Go to review ${i + 1}`}
                        aria-current={i === index}
                        className="group flex-1 min-w-[6px] max-w-[64px] h-6 flex items-center border-0 bg-transparent p-0 cursor-pointer"
                      >
                        <span
                          className={`block w-full h-[2px] transition-colors duration-300 ${
                            i === index ? 'bg-white' : 'bg-white/25 group-hover:bg-white/60'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] tracking-[0.18em] uppercase text-white/55 whitespace-nowrap tabular-nums">
                    {formatCounter(index + 1)} / {formatCounter(total)}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { step(-1); restart(); }}
                      aria-label="Previous review"
                      className="w-11 h-11 border border-white/35 bg-transparent grid place-items-center cursor-pointer text-lg leading-none transition-colors duration-200 hover:bg-white hover:text-black"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => { step(1); restart(); }}
                      aria-label="Next review"
                      className="w-11 h-11 border border-white/35 bg-transparent grid place-items-center cursor-pointer text-lg leading-none transition-colors duration-200 hover:bg-white hover:text-black"
                    >
                      →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
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
