import React, { useState, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ReviewCard = ({ name, date, review, readMore, showLess, googleAlt }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E3E3E380] flex flex-col hover:shadow-md transition-shadow duration-300 flex-shrink-0 w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] review-card snap-start">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-800 bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          {/* Name & Date */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{name}</h3>
            <p className="text-xs md:text-sm text-gray-500">{date}</p>
          </div>
        </div>

        {/* Google Icon */}
        <img src="google.svg" alt={googleAlt} className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
      </div>

      {/* 5 Stars */}
      <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Review Text */}
      <div className="flex-grow">
        <p className={`text-sm md:text-base text-gray-700 leading-relaxed transition-all duration-300 ${
          isExpanded ? 'mb-2 md:mb-3' : 'line-clamp-3 mb-2'
        }`}>
          {review}
        </p>
        
        {/* Read More Button - Always visible */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs md:text-sm cursor-pointer font-medium text-gray-600 underline hover:text-gray-800 transition-colors"
        >
          {isExpanded ? showLess : readMore}
        </button>
      </div>
    </div>
  );
};

export default function LandingReview() {
  const { t } = useTranslation('home');
  const scrollContainerRef = useRef(null);

  // Get reviews data from translation file
  const reviews = t('reviews.reviewsData', { returnObjects: true });
  const readMore = t('reviews.readMore');
  const showLess = t('reviews.showLess');
  const googleAlt = t('reviews.googleAlt');

  return (
    <section className="py-6 md:py-8 px-4 md:px-6 bg-white">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-10xl mx-auto">
        {/* Heading - Centered */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
            {t('reviews.title')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Reviews Horizontal Scroll */}
        <div className="relative overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          >
            <div className="flex gap-3 md:gap-4 lg:gap-6 pb-4 items-start">
              {reviews.map((review, index) => (
                <ReviewCard
                  key={index}
                  name={review.name}
                  date={review.date}
                  review={review.review}
                  readMore={readMore}
                  showLess={showLess}
                  googleAlt={googleAlt}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}