"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

import { LandingCards, LoadingCard } from "../Landing/LandingCards";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { useRouter } from "next/navigation";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { startTopLoader } from "../TopLoader";

const MEDIA_BASE = "https://d18f57oyxifcsh.cloudfront.net/";

// ─── Screen-based per_page (same approach as ExpertAdvices.jsx: per_page is
// derived from how many grid columns are currently visible, not hardcoded) ──
const ROWS_PER_PAGE = 2;
const BUNDLE_MOBILE_PER_PAGE = 8;
const BLOG_MOBILE_PER_PAGE = 6;

// Matches the Tailwind breakpoints used by each grid's className below.
const BUNDLE_BREAKPOINTS = [
  { min: 0, cols: 1 },
  { min: 640, cols: 2 }, // sm
  { min: 768, cols: 3 }, // md
  { min: 1024, cols: 4 }, // lg
];
const BLOG_BREAKPOINTS = [
  { min: 0, cols: 1 },
  { min: 640, cols: 2 }, // sm
  { min: 768, cols: 3 }, // md
];

function useGridColumns(breakpoints) {
  const [columns, setColumns] = useState(null);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      let cols = breakpoints[0].cols;
      for (const bp of breakpoints) if (w >= bp.min) cols = bp.cols;
      setColumns(cols);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [breakpoints]);
  return columns;
}

const mapFavoriteProduct = (item) => ({
  id: item.id,
  name: item.name,
  french_name: item.french_name || "",
  english_seo_keyword: item.english_seo_keyboard || item.english_seo_keyword || "",
  french_seo_keyword: item.french_seo_keyword || "",
  price: item.price || item.products?.[0]?.price || "0",
  discount: item.discount || item.products?.[0]?.off || "",
  image:
    item.image ||
    (item.products?.[0]?.images?.[0]?.media
      ? `${MEDIA_BASE}${item.products[0].images[0].media}`
      : ""),
  images:
    item.images ||
    item.products?.[0]?.images?.map((img) => `${MEDIA_BASE}${img.media}`) || [""],
  videoUrl: item.products?.[0]?.video?.media
    ? `${MEDIA_BASE}${item.products[0].video.media}`
    : null,
  liked: item.liked ?? item.favorites_exists ?? true,
  productsCount: item.products?.length || 1,
  products: item.products || [],
  description: item.description || "",
  french_description: item.french_description || "",
  product_label: item.product_label || "",
  french_product_label: item.french_product_label || "",
  _raw: item,
});

// ─── Favourites Grid ──────────────────────────────────────
function FavouritesGrid({ isLoading, products }) {
  return (
    <div className="w-full">
    
      <style>{`
        @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <LoadingCard />
              </div>
            ))
          : products.map((product, index) => (
              <div key={product.id} className="w-full">
                <LandingCards product={product} index={index} showNav={true} />
              </div>
            ))}
      </div>
    </div>
  );
}

// ─── Pagination bar — shared by the bundles grid and the blogs grid ───────
function PaginationBar({ page, lastPage, onGoTo }) {
  if (!lastPage || lastPage <= 1) return null;
  const atFirst = page <= 1;
  const atLast = page >= lastPage;
  const btnClass = (disabled) =>
    `w-9 h-9 flex items-center justify-center border border-gray-200 transition-colors ${
      disabled
        ? "text-gray-300 cursor-not-allowed"
        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
    }`;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button className={btnClass(atFirst)} disabled={atFirst} onClick={() => onGoTo(1)}>
        <MdOutlineKeyboardDoubleArrowLeft size={22} />
      </button>
      <button className={btnClass(atFirst)} disabled={atFirst} onClick={() => onGoTo(page - 1)}>
        <MdOutlineKeyboardArrowLeft size={22} />
      </button>

      <button className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-gray-900 text-white font-medium">
        {page}
      </button>

      <button className={btnClass(atLast)} disabled={atLast} onClick={() => onGoTo(page + 1)}>
        <MdOutlineKeyboardArrowRight size={22} />
      </button>
      <button className={btnClass(atLast)} disabled={atLast} onClick={() => onGoTo(lastPage)}>
        <MdOutlineKeyboardDoubleArrowRight size={22} />
      </button>
    </div>
  );
}

function getBlogField(item, field, isFr) {
  if (!item) return "";
  const frField = `french_${field}`;
  return isFr && item[frField] ? item[frField] : (item[field] ?? "");
}

function getCategoryName(item, isFr) {
  const topicEntry = item?.categories?.find((c) => c?.type === "topic");
  const cat = topicEntry?.category;
  if (!cat) return "";
  return isFr && cat.french_name ? cat.french_name : (cat.name ?? "");
}

function getBlogImage(item) {
  return item?.images?.[0]?.media ?? item?.image ?? null;
}

// ─── Saved Blogs Section ──────────────────────────────────
function SavedBlogs({ isFr, blogs, isLoading, page, lastPage, onGoTo }) {
  const router = useRouter();
  const { t } = useTranslation('myaccount');

  if (!isLoading && blogs.length === 0) return null;

  const navigateTo = (blog) => {
    const keyword = isFr
      ? blog.french_seo_keyword || blog.english_seo_keyboard
      : blog.english_seo_keyboard || blog.french_seo_keyword;
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="bg-white p-6 md:p-8 mt-6">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">{t('savedBlogs.title')}</h2>
        <p className="text-gray-600 mt-1.5">{t('savedBlogs.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-200">
                <div className="w-full h-60 md:aspect-[5/6] md:h-auto bg-gray-200" />
                <div className="px-4 py-3 md:px-0 md:pt-3">
                  <div className="h-2.5 w-1/3 bg-gray-200 mb-2" />
                  <div className="h-3 w-4/5 bg-gray-200" />
                </div>
              </div>
            ))
          : blogs.map((blog) => {
          const imgSrc = getBlogImage(blog) ? `${MEDIA_URL}${getBlogImage(blog)}` : "/cat.png";
          const href = `/advices/${encodeURIComponent(isFr ? blog.french_seo_keyword || blog.english_seo_keyboard : blog.english_seo_keyboard || blog.french_seo_keyword)}`;
          return (
            <a
              key={blog.id}
              href={href}
              onClick={(e) => { if (e.ctrlKey || e.metaKey || e.shiftKey) return; e.preventDefault(); navigateTo(blog); }}
              className="cursor-pointer group"
            >
              {/* Mobile: same horizontal card as ArticleRow */}
              <div className="md:hidden border border-gray-200 overflow-hidden flex flex-col">
                <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                  <img
                    src={imgSrc}
                    className="w-full h-full grayscale object-cover group-hover:scale-105 group-hover:grayscale-0 transition-transform duration-700"
                  />
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase text-gray-900 leading-normal line-clamp-2 flex-1 group-hover:underline underline-offset-2">
                    {getBlogField(blog, "name", isFr)}
                  </p>
                  <HiOutlineArrowUpRight className="shrink-0 text-gray-700 w-4 h-4" />
                </div>
              </div>

              {/* Desktop: same as ExpertAdvices All Articles card */}
              <div className="hidden md:block">
                <div className="relative w-full aspect-[5/6] overflow-hidden mb-3 bg-gray-200">
                  <img
                    src={imgSrc}
                    className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 z-20 w-8 h-8 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <HiOutlineArrowUpRight className="w-4 h-4 text-gray-900" />
                  </div>
                </div>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
                  {getCategoryName(blog, isFr) || "⸻"}
                </p>
                <h3 className="text-sm font-bold uppercase text-gray-900 leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:underline underline-offset-2">
                  {getBlogField(blog, "name", isFr)}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{blog.company_name || t('savedBlogs.companyFallback')}</span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {blog.reading_time || "0"} {t('savedBlogs.minSuffix')}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <PaginationBar page={page} lastPage={lastPage} onGoTo={onGoTo} />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Favourite() {
  const { t, i18n } = useTranslation('myaccount');
  const isFr = i18n.language?.startsWith('fr');

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  };

 
  const getFavorites = (type, page, perPage) =>
    fetch(
      `${BASE_URL}/web/favorites/${type}?page=${page}&per_page=${perPage}`,
      { headers: { Authorization: `Bearer ${getToken()}` } },
    ).then((res) => res.json());

  // ─── Bundles (wishlist products) ───────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [bundlesPage, setBundlesPage] = useState(1);
  const [bundlesLastPage, setBundlesLastPage] = useState(1);

  const bundleColumns = useGridColumns(BUNDLE_BREAKPOINTS);
  const bundlesPerPage = bundleColumns
    ? bundleColumns === 1
      ? BUNDLE_MOBILE_PER_PAGE
      : bundleColumns * ROWS_PER_PAGE
    : 0;

  const fetchBundles = async (page, perPage) => {
    setIsLoading(true);
    try {
      const data = await getFavorites('bundle', page, perPage);
      if (data?.status === false) {
        toast.error(data?.action || 'Something went wrong.');
        setFavourites([]);
      } else if (data?.status) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setFavourites(list.map(mapFavoriteProduct));
        setBundlesPage(raw?.current_page || page);
        setBundlesLastPage(raw?.last_page || 1);
      } else {
        setFavourites([]);
      }
    } catch (err) {
      console.error('Fetch favorite bundles error:', err);
      setFavourites([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetches page 1 once the responsive column count (and so per_page)
  // resolves, and again whenever it changes on resize.
  useEffect(() => {
    if (!bundlesPerPage) return;
    fetchBundles(1, bundlesPerPage);
  }, [bundlesPerPage]);

  const goToBundlesPage = (page) => {
    if (page < 1 || page > bundlesLastPage || !bundlesPerPage) return;
    fetchBundles(page, bundlesPerPage);
  };

  // ─── Saved blogs ────────────────────────────────────────
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [blogsPage, setBlogsPage] = useState(1);
  const [blogsLastPage, setBlogsLastPage] = useState(1);

  const blogColumns = useGridColumns(BLOG_BREAKPOINTS);
  const blogsPerPage = blogColumns
    ? blogColumns === 1
      ? BLOG_MOBILE_PER_PAGE
      : blogColumns * ROWS_PER_PAGE
    : 0;

  const fetchBlogs = async (page, perPage) => {
    setBlogsLoading(true);
    try {
      const data = await getFavorites('blog', page, perPage);
      if (data?.status === false) {
        toast.error(data?.action || 'Something went wrong.');
        setBlogs([]);
      } else if (data?.status) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setBlogs(list);
        setBlogsPage(raw?.current_page || page);
        setBlogsLastPage(raw?.last_page || 1);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error('Fetch saved blogs error:', err);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    if (!blogsPerPage) return;
    fetchBlogs(1, blogsPerPage);
  }, [blogsPerPage]);

  const goToBlogsPage = (page) => {
    if (page < 1 || page > blogsLastPage || !blogsPerPage) return;
    fetchBlogs(page, blogsPerPage);
  };

  const hasFavourites = isLoading || favourites.length > 0;

  const scrollContainerRefRec = useRef(null);
  const [canScrollLeftRec, setCanScrollLeftRec] = useState(false);
  const [canScrollRightRec, setCanScrollRightRec] = useState(true);

  const checkScrollPositionRec = () => {
    const container = scrollContainerRefRec.current;
    if (!container) return;
    setCanScrollLeftRec(container.scrollLeft > 0);
    setCanScrollRightRec(
      Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeout(checkScrollPositionRec, 150);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = scrollContainerRefRec.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPositionRec);
    window.addEventListener("resize", checkScrollPositionRec);

    const initialCheck = setTimeout(checkScrollPositionRec, 300);

    return () => {
      container.removeEventListener("scroll", checkScrollPositionRec);
      window.removeEventListener("resize", checkScrollPositionRec);
      clearTimeout(initialCheck);
    };
  }, []);

  const scrollRec = (direction) => {
    if (!scrollContainerRefRec.current) return;
    const scrollAmount = 320;
    scrollContainerRefRec.current.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
   
    <div>
      <div className="max-w-10xl -mt-1 md:mt-9 mx-auto px-4 sm:px-6 py-8">
      {/* Wishlist Section */}
        <div className="bg-white  p-6 md:p-8 mb-10">
          <div className="mb-6 md:mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-2xl font-semibold text-gray-900">{t('favourite.title')}</h1>
              <p className="text-gray-600 mt-1.5">{t('favourite.subtitle')}</p>
            </div>

            {!isLoading && favourites.length > 0 && (
              <button className="flex cursor-pointer  items-center gap-1 text-md font-semibold text-gray-700 hover:text-gray-900">
                <span  ><RxCross2 size={20} /></span>
                <span>Remove All</span>
              </button>
            )}
          </div>

          {hasFavourites ? (
            <>
              <FavouritesGrid isLoading={isLoading} products={favourites} />

              {!isLoading && favourites.length > 0 && (
                <PaginationBar
                  page={bundlesPage}
                  lastPage={bundlesLastPage}
                  onGoTo={goToBundlesPage}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
              <img src="/favacc.svg" alt="Empty wishlist" className="w-64 md:w-80 h-64 md:h-80 object-contain mb-8" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('favourite.empty.title')}</h3>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                {t('favourite.empty.description')}
              </p>
              <button className="bg-gray-900 text-white px-8 py-3.5  font-medium hover:bg-gray-800 transition-colors shadow-sm">
                {t('favourite.empty.browseProducts')}
              </button>
            </div>
          )}
        </div>

        <SavedBlogs
          isFr={isFr}
          blogs={blogs}
          isLoading={blogsLoading}
          page={blogsPage}
          lastPage={blogsLastPage}
          onGoTo={goToBlogsPage}
        />

        {/* Recommended Section — hidden for now */}
        {false && (
        <div className="bg-white   p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-2xl font-semibold text-gray-900">
              {t('favourite.recommended.title')}
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => scrollRec("prev")}
                disabled={!canScrollLeftRec}
                className={`w-10 h-10  flex items-center justify-center transition-all duration-200 ${
                  canScrollLeftRec
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-sm"
                    : "bg-white border border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollRec("next")}
                disabled={!canScrollRightRec}
                className={`w-10 h-10  flex items-center justify-center transition-all duration-200 ${
                  canScrollRightRec
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-sm"
                    : "bg-white border border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 -mt-6 ml-1 ">{t('favourite.recommended.subtitle')}</p>

          {/* <PopularProducts
            isHorizontal={true}
            showHeader={false}
            scrollContainerRef={scrollContainerRefRec}
          /> */}
        </div>
        )}
      </div>
    </div>
  );
}
