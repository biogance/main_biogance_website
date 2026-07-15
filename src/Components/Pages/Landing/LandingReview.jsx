import React, { useState, useRef, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Render a single star (filled or empty)
const StarRating = ({ rating = 5 }) => (
  <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 md:w-5 md:h-5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ name, date, message, rating, readMore, showLess, googleAlt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef(null);

  // Format date — API format is "03/06/2026" which is already readable
  const displayDate = date || '';

  // Only show the Read More/Show Less toggle when the message actually
  // overflows the 3-line clamp. Measured while collapsed (clamped) —
  // skipped while expanded since the element isn't clamped then.
  useEffect(() => {
    const checkTruncation = () => {
      const el = textRef.current;
      if (!el || isExpanded) return;
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    };
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [message, isExpanded]);

  return (
    <div className="bg-white p-4 md:p-6 shadow-sm border border-[#E3E3E380] flex flex-col hover:shadow-md transition-shadow duration-300 flex-shrink-0 w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] review-card snap-start">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-800 bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md flex-shrink-0">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{name}</h3>
            <p className="text-xs md:text-sm text-gray-500">{displayDate}</p>
          </div>
        </div>
        <img src="google.svg" alt={googleAlt} className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
      </div>

      <StarRating rating={rating} />

      <div className="flex-grow">
        <p
          ref={textRef}
          className={`text-sm md:text-base text-gray-700 leading-relaxed transition-all duration-300 ${isExpanded ? 'mb-2 md:mb-3' : 'line-clamp-3 mb-2'}`}
        >
          {message}
        </p>
        {isTruncated && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs md:text-sm cursor-pointer font-medium text-gray-600 underline hover:text-gray-800 transition-colors"
          >
            {isExpanded ? showLess : readMore}
          </button>
        )}
      </div>
    </div>
  );
};

export default function LandingReview({ data }) {
  const { t } = useTranslation('home');
  const scrollContainerRef = useRef(null);

  const apiReviews = data?.reviews || [];
  const showShimmer = apiReviews.length === 0 && !data;

  const readMore = t('reviews.readMore');
  const showLess = t('reviews.showLess');
  const googleAlt = t('reviews.googleAlt');

  return (
    <section className="py-6 md:py-8 px-4 md:px-6 bg-white">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-10xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
            {t('reviews.title')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {t('reviews.subtitle')}
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          >
            <div className="flex gap-3 md:gap-4 lg:gap-6 pb-4 items-start">
              {apiReviews.length > 0
                ? apiReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      name={review.name}
                      date={review.date}
                      message={review.message}
                      rating={review.rating}
                      readMore={readMore}
                      showLess={showLess}
                      googleAlt={googleAlt}
                    />
                  ))
                : showShimmer && Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 flex-shrink-0 w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5" />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}