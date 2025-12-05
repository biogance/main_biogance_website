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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E3E3E380] flex flex-col hover:shadow-lg transition-shadow duration-300 flex-shrink-0 w-[calc(33.333%-21px)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {name.charAt(0).toUpperCase()}
          </div>

          {/* Name & Date */}
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>

        {/* Google Icon */}
        <img src="google.svg" alt="Google" className="w-5 h-5 text-gray-600" />
      </div>

      {/* 5 Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Review Text */}
      <div>
        <p className={`text-gray-700 leading-relaxed transition-all duration-300 ${
          isExpanded ? 'mb-3' : 'line-clamp-3 mb-2'
        }`}>
          {review}
        </p>
        
        {/* Read More Button - Always visible */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm cursor-pointer font-medium text-gray-600 underline hover:text-gray-800 transition-colors"
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
    <section className="py-8 px-6 bg-white">
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Pet Parents Are Saying
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read real reviews from happy pet parents who trust our products.
          </p>
        </div>

        {/* Reviews Horizontal Scroll */}
        <div className="relative overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar"
          >
            <div className="flex gap-6 pb-4">
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