"use client";

import { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { BiChevronRight } from "react-icons/bi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const BASE_MEDIA_URL = 'https://your-cdn.com/'; // replace with your actual CDN base URL

// Fallback images in case API image is missing
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1572296374832-8737db0d011b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
];

export default function LandingExpertAdvice({ data }) {
  const { t } = useTranslation('home');
  const scrollContainerRef = useRef(null);

  // API provides expert_advice array inside data
  // Each item has: id, name (title), short_description, images[], created_at, tags[]
  const apiAdvice = data?.expert_advice || [];

  const [favorites, setFavorites] = useState({});
  const [expanded, setExpanded] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.querySelector('.article-card');
      if (!card) return;
      const gap = 24;
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? card.offsetWidth + gap : -(card.offsetWidth + gap),
        behavior: 'smooth',
      });
    }
  };

  // Format the date string from API (e.g. "2026-02-24T11:14:42.000000Z")
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-10xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 md:mb-12 gap-6 md:gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
              {t('expertAdvice.heading')}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 max-w-2xl">
              {t('expertAdvice.description')}
            </p>
            <a
              href="#"
              className="text-xs md:text-sm font-semibold text-black hover:underline inline-flex items-center gap-1"
            >
              {t('expertAdvice.discoverMore')}
              <BiChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </a>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('prev')}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scroll('next')}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Articles scroll */}
        <div className="relative overflow-hidden">
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          <div
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          >
            <div className="flex gap-3 md:gap-6 pb-4 items-start">
              {apiAdvice.map((article, index) => {
                // Get first image from article.images array
                const apiImagePath = article.images?.[0]?.media;
                const imageUrl = apiImagePath
                  ? `${BASE_MEDIA_URL}${apiImagePath}`
                  : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

                // Tags from article.tags array
                const tags = (article.tags || []).slice(0, 3).map((tag) => tag.name);

                const isFav = favorites[article.id] || false;
                const isExp = expanded[article.id] || false;

                return (
                  <article
                    key={article.id}
                    className="article-card bg-[#F7F7F7] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-md transition-all duration-300 group flex-shrink-0 snap-start w-[85vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-16px)] flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-[180px] md:h-[240px] overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={article.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                        }}
                      />
                      <button
                        onClick={() => toggleFavorite(article.id)}
                        className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-9 md:h-9 cursor-pointer bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        {isFav ? (
                          <FaHeart className="w-4 h-4 md:w-5 md:h-5 text-black" />
                        ) : (
                          <FaRegHeart className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6 lg:p-7 flex flex-col flex-grow">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 font-medium">
                        <span className="text-black border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white">
                          {t('expertAdvice.expertLabel', { defaultValue: 'Expert Advice' })}
                        </span>
                        <span className="text-black border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white">
                          {formatDate(article.created_at)}
                        </span>
                        {tags.length > 0 && (
                          <span className="text-gray-600 border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white">
                            {tags.join(' • ')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 text-gray-900 line-clamp-2 transition">
                        {article.name}
                      </h3>

                      <div className="flex-grow mb-4 md:mb-6">
                        <p className={`text-xs md:text-sm text-gray-600 leading-relaxed transition-all duration-300 ${isExp ? '' : 'line-clamp-3'}`}>
                          {article.short_description}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpanded(article.id)}
                        className="bg-black cursor-pointer text-white px-3.5 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-gray-800 transition w-full sm:w-auto mt-auto"
                      >
                        {isExp ? t('expertAdvice.showLess') : t('expertAdvice.continueReading')}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}