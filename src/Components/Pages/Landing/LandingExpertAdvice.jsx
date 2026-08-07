"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoChevronForward } from 'react-icons/io5';
import { MEDIA_URL, BASE_URL } from "@/Components/API/API";
import axios from 'axios';
import toast from 'react-hot-toast';
import { getDeviceId } from '../../../utils/deviceId';
import { startTopLoader } from "../TopLoader";
import { BsArrowUpRight } from "react-icons/bs";
import { HiArrowTrendingUp } from "react-icons/hi2";


const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1572296374832-8737db0d011b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
];

// Shimmer for one card — `featured` gets the tall image used by the left,
// full-height slot; the other 4 (right-side 2x2 grid) get the shorter one.
const ShimmerCard = ({ featured = false }) => (
  <div className={`bg-white border border-[#d8d8d4] overflow-hidden flex flex-col ${featured ? 'h-full' : ''}`}>
    <div className={`${featured ? 'h-[300px] md:h-[480px]' : 'h-[160px] md:h-[220px]'} bg-gray-200 animate-pulse`} />
    <div className="p-4 md:p-[22px] flex flex-col gap-3">
      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
    </div>
  </div>
);

export default function LandingExpertAdvice({ data, hideHeader = false }) {
  const { t, i18n } = useTranslation('home');
  const isFrench = i18n.language === 'fr';
  const router = useRouter();

  const apiAdvice = data?.expert_advice || [];
  const isLoading = !data;

  // Bento layout only ever shows 5 articles: one large "featured" card on the
  // left, and the next 4 as a 2x2 grid on the right — same card design as
  // .article/.article-image/.article-copy in HOMEPAGE V2.html, just a custom
  // 1 + 4 arrangement instead of html's plain 3-card row.
  const shownAdvice = apiAdvice.slice(0, 5);
  const featuredArticle = shownAdvice[0];
  const gridArticles = shownAdvice.slice(1, 5);

  const [favorites, setFavorites] = useState(() =>
    Object.fromEntries((data?.expert_advice || []).map(a => [a.id, a.favorites_exists ?? false]))
  );
  const [loadingFav, setLoadingFav] = useState({});

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

  const navigateToDetail = (article) => {
    const keyword = isFrench
      ? article.french_seo_keyword || article.english_seo_keyboard
      : article.english_seo_keyboard || article.french_seo_keyword;
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    } catch { return dateStr; }
  };

  // Renders one article card — `featured` makes the image taller and the
  // headline bigger, matching .article.featured in HOMEPAGE V2.html.
  const renderCard = (article, index, featured) => {
    const apiImagePath = article.images?.[0]?.media;
    const imageUrl = apiImagePath ? `${MEDIA_URL}${apiImagePath}` : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    const tagNames = (article.tags || []).map((tag) => tag.name).filter(Boolean);
    const tagLabel = tagNames.slice(0, 2).join(' · ');
    const isFav = favorites[article.id] ?? article.favorites_exists ?? false;
    const displayName = isFrench && article.french_name ? article.french_name : article.name;
    const displayDesc = isFrench && article.short_french_description ? article.short_french_description : article.short_description;

    return (
      <article
        key={article.id}
        onClick={() => navigateToDetail(article)}
        className={`bg-white border border-[#d8d8d4] overflow-hidden cursor-pointer group flex flex-col ${featured ? 'h-full' : ''}`}
      >
        <div className={`relative overflow-hidden bg-gray-100 flex-shrink-0 ${featured ? 'h-[300px] md:h-[480px]' : 'h-[160px] md:h-[220px]'}`}>
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-[1.025] group-hover:grayscale-0"
            onError={(e) => { e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]; }}
          />
          {/* <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(article.id); }}
            className="absolute top-3 left-3 w-8 h-8 md:w-9 md:h-9 cursor-pointer bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {isFav
              ? <FaHeart className="w-4 h-4 text-black" />
              : <FaRegHeart className="w-4 h-4 text-gray-700" />
            }
          </button> */}
        </div>

        <div className={`flex flex-col flex-grow ${featured ? 'p-5 md:p-[22px]' : 'p-4 md:p-[18px]'}`}>
          <small className="text-[9px] tracking-[0.15em] uppercase text-[#858580]">
            {tagLabel || t('expertAdvice.expertLabel', { defaultValue: 'Expert Advice' })}
            {/* {' · '}{formatDate(article.created_at)} */}
          </small>

          <h3 className={`mt-[11px] font-medium mb-3 leading-[1.12] text-gray-900 ${featured ? 'text-xl md:text-[28px] line-clamp-2' : 'text-base md:text-[21px] line-clamp-2'}`}>
            {displayName}
          </h3>

          {featured && displayDesc && (
            <p className="mb-3 text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3">
              {displayDesc}
            </p>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); navigateToDetail(article); }}
            className={`cursor-pointer bg-black text-white font-semibold hover:bg-gray-800 transition mt-auto self-start ${featured ? 'mt-5 px-4 py-2.5 text-xs md:text-sm' : 'mt-4 px-3 py-2 text-[11px]'}`}
          >
            {t('expertAdvice.continueReading')}
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="bg-[#f6f6f4] mt-40 border-t border-gray-300 py-[76px] min-[721px]:py-[clamp(78px,9vw,138px)]">
   
      <div className="w-full max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
        {!hideHeader && (
          <div className="mb-[34px] min-[721px]:mb-[52px]">
           
            <div className="grid grid-cols-1 min-[1101px]:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-[28px] min-[721px]:gap-[clamp(34px,4vw,64px)] items-end">
              <div>
                <div className="flex items-center gap-3 text-black">
                  <span className="w-[34px] h-px bg-current"></span>
                  <span className="text-[10px] tracking-[0.22em] uppercase">{t('expertAdvice.sectionEyebrow')}</span>
                </div>
                <h2 className="mt-[18px] mb-0 text-[50px] min-[721px]:text-[clamp(48px,7vw,108px)] leading-[0.9] tracking-[-0.072em] uppercase font-medium text-black">
                  {t('expertAdvice.sectionHeadingLine1')}<br />{t('expertAdvice.sectionHeadingLine2')}
                </h2>
              </div>
              <p className="mb-2 max-w-[600px] text-[#595955] text-[15px] leading-[1.75]">
                {t('expertAdvice.sectionSubtitle')}
              </p>
            </div>

            {/* Below the whole header row, right-aligned under the right column */}
            <div className="flex justify-end mt-4 md:mt-5 -mb-6">
              <button
                type="button"
                onClick={() => { startTopLoader(); router.push('/advices'); }}
                className="inline-flex items-center gap-2 cursor-pointer text-[12px] tracking-[0.15em] uppercase font-bold text-black hover:opacity-70 transition-opacity"
              >
                {t('expertAdvice.seeAll')}
            <HiArrowTrendingUp className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bento layout: 1 big card (left) + 2x2 grid of 4 cards (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-stretch">
          {isLoading ? (
            <>
              <ShimmerCard featured />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)}
              </div>
            </>
          ) : (
            <>
              {featuredArticle && renderCard(featuredArticle, 0, true)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {gridArticles.map((article, i) => renderCard(article, i + 1, false))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
