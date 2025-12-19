import React, { useState, useRef } from 'react';
import { FaStar } from 'react-icons/fa';

const reviews = [
  {
    name: 'John Doe',
    date: '05/11/2025',
    review: 'I stumbled upon this store while searching online, and I couldn\'t be happier! My son adores the toy; his excitement is contagious! The quality is outstanding and delivery was super fast.',
  },
  {
    name: 'Algistino Lionel',
    date: '04/11/2025',
    review: 'It was great when I happened to come across the store\'s products while browsing the web. My child really loves this toy. He looks so excited and plays with it every single day. The quality exceeded my expectations and the customer service was fantastic. Highly recommended for all pet parents!',
  },
  {
    name: 'Peter',
    date: '04/11/2025',
    review: 'Amazing quality and super fast delivery! My kid hasn\'t stopped playing with it since it arrived. Highly recommend this store to everyone looking for quality pet toys.',
  },
  {
    name: 'Sarah Johnson',
    date: '03/11/2025',
    review: 'Best purchase ever! The toy is durable, safe, and keeps my daughter entertained for hours. Will definitely buy again from this store. Customer support was also very helpful when I had questions.',
  },
  {
    name: 'Michael Chen',
    date: '02/11/2025',
    review: 'Exceptional service and top-notch products. My twins love their new toys and I appreciate the eco-friendly packaging. Five stars! The attention to detail in packaging shows they really care about their customers and the environment.',
  },
];

const ReviewCard = ({ name, date, review }) => {
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
        <img src="google.svg" alt="Google" className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
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
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      </div>
    </div>
  );
};

export default function LandingReview() {
  const scrollContainerRef = useRef(null);

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
            What Pet Parents Are Saying
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Read real reviews from happy pet parents who trust our products.
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
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}