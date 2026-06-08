"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { BiChevronRight } from "react-icons/bi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MEDIA_URL, BASE_URL } from "@/Components/API/API";
import axios from 'axios';
import toast from 'react-hot-toast';
import { getDeviceId } from '../../../utils/deviceId';


const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1572296374832-8737db0d011b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
];

const ShimmerCard = () => (
  <div className="article-card bg-[#F7F7F7] rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 flex-shrink-0 snap-start w-[85vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-16px)] flex flex-col">
    <div className="h-[180px] md:h-[240px] bg-gray-200 animate-pulse" />
    <div className="p-4 md:p-6 lg:p-7 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="h-5 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
      <div className="h-10 bg-gray-200 rounded-xl animate-pulse mt-2" />
    </div>
  </div>
);

export default function LandingExpertAdvice({ data, hideHeader = false }) {
  const { t, i18n } = useTranslation('home');
  const isFrench = i18n.language === 'fr';
  const scrollContainerRef = useRef(null);

  const apiAdvice = data?.expert_advice || [];
  const isLoading = !data;

  const [favorites, setFavorites] = useState(() =>
    Object.fromEntries((data?.expert_advice || []).map(a => [a.id, a.favorites_exists ?? false]))
  );
  const [loadingFav, setLoadingFav] = useState({});
  const [expanded, setExpanded] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      setTimeout(checkScrollPosition, 100);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [isLoading]);

  const toggleFavorite = async (id) => {
    if (loadingFav[id]) return;
    setLoadingFav((prev) => ({ ...prev, [id]: true }));
    try {
      const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
      const payload = {};
      if (loginData?.data?.token) {
        payload.token = loginData.data.token;
      } else {
        payload.device_id = getDeviceId();
      }
      const res = await axios.post(`${BASE_URL}/user/add/favorite/blog/${id}`, payload);
      if (res.data.status === false) {
        const msg = res.data.errors?.length > 0 ? res.data.errors[0].message : res.data.action;
        toast.error(msg);
      } else {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingFav((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.querySelector('.article-card');
      if (!card) return;
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? card.offsetWidth + 24 : -(card.offsetWidth + 24),
        behavior: 'smooth',
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    } catch { return dateStr; }
  };

  return (
    <section className="bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-10xl mx-auto">
        {!hideHeader && (
          <div className="flex flex-col lg:flex-row items-start justify-between mb-8 md:mb-12 gap-6 md:gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
                {t('expertAdvice.heading')}
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 max-w-2xl">
                {t('expertAdvice.description')}
              </p>
              <a href="#" className="text-xs md:text-sm font-semibold text-black hover:underline inline-flex items-center gap-1">
                {t('expertAdvice.discoverMore')}
                <BiChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </a>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('prev')}
                disabled={!canScrollLeft}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
              >
                <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </button>
              <button
                onClick={() => scroll('next')}
                disabled={!canScrollRight}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
              >
                <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden">
          <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
          <div ref={scrollContainerRef} className="overflow-x-auto hide-scrollbar snap-x snap-mandatory">
            <div className="flex gap-3 md:gap-6 pb-4 items-start">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => <ShimmerCard key={i} />)
                : apiAdvice.map((article, index) => {
                    const apiImagePath = article.images?.[0]?.media;
                    const imageUrl = apiImagePath ? `${MEDIA_URL}${apiImagePath}` : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                    const tags = (article.tags || []).slice(0, 3).map((tag) => tag.name);
                    const isFav = favorites[article.id] ?? article.favorites_exists ?? false;
                    const isExp = expanded[article.id] || false;

                    const displayName = isFrench && article.french_name ? article.french_name : article.name;
                    const displayDesc = isFrench && article.short_french_description ? article.short_french_description : article.short_description;

                    return (
                      <article key={article.id} className="article-card bg-[#F7F7F7] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-md transition-all duration-300 group flex-shrink-0 snap-start w-[85vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-16px)] flex flex-col">
                        <div className="relative h-[180px] md:h-[240px] overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]; }}
                          />
                          <button
                            onClick={() => toggleFavorite(article.id)}
                            className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-9 md:h-9 cursor-pointer bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            {isFav
                              ? <FaHeart className="w-4 h-4 md:w-5 md:h-5 text-black" />
                              : <FaRegHeart className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                            }
                          </button>
                        </div>

                        <div className="p-4 md:p-6 lg:p-7 flex flex-col flex-grow">
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 font-medium overflow-hidden">
                            <span className="text-black border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white whitespace-nowrap">
                              {t('expertAdvice.expertLabel', { defaultValue: 'Expert Advice' })}
                            </span>
                            <span className="text-black border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white whitespace-nowrap">
                              {formatDate(article.created_at)}
                            </span>
                            {tags.length > 0 && (
                              <span className="text-gray-600 border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white truncate min-w-0">
                                {tags.join(' • ')}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 text-gray-900 line-clamp-1">
                            {displayName}
                          </h3>

                          <div className="flex-grow mb-4 md:mb-6">
                            <p className={`text-xs md:text-sm text-gray-600 leading-relaxed ${isExp ? '' : 'line-clamp-2'}`}>
                              {displayDesc}
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