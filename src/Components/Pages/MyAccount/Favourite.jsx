"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { LandingCards, LoadingCard } from "../Landing/LandingCards";
import BreedCard from "../Breed/BreedCard";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { useRouter } from "next/navigation";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { startTopLoader } from "../TopLoader";
import { sanitizeSeoKeyword } from "../../../utils/seoKeyword";

const MEDIA_BASE = "https://d18f57oyxifcsh.cloudfront.net/";

// ─── Screen-based per_page (same approach as ExpertAdvices.jsx: per_page is
// derived from how many grid columns are currently visible, not hardcoded) ──
const ROWS_PER_PAGE = 2;
const BUNDLE_MOBILE_PER_PAGE = 8;
const BLOG_MOBILE_PER_PAGE = 6;
// Same values as BreedLibrary.jsx's own ROWS_PER_PAGE/MOBILE_PER_PAGE —
// kept as separate constants (not shared) since that file's own per_page
// cadence isn't exported, same "duplicate the small stuff" convention this
// file already uses for its blog/bundle constants above.
const BREED_ROWS_PER_PAGE = 3;
const BREED_MOBILE_PER_PAGE = 15;

// Matches the Tailwind breakpoints used by each grid's className below.
const BUNDLE_BREAKPOINTS = [
  { min: 0, cols: 1 },
  { min: 640, cols: 2 }, // sm
  { min: 768, cols: 3 }, // md
  { min: 1024, cols: 4 }, // lg
];
// Matches ExpertAdvices.jsx's CARD_GRID/COLUMN_BREAKPOINTS — the saved-blogs
// grid below now uses that same grid, so per_page has to scale with it too.
const BLOG_BREAKPOINTS = [
  { min: 0, cols: 1 },
  { min: 640, cols: 2 }, // sm
  { min: 1024, cols: 3 }, // lg
  { min: 1280, cols: 4 }, // xl
  { min: 1536, cols: 5 }, // 2xl
];
// Matches BreedLibrary.jsx's BREED_COLUMN_BREAKPOINTS.
const BREED_BREAKPOINTS = [
  { min: 0, cols: 1 },
  { min: 481, cols: 2 },
  { min: 761, cols: 3 },
  { min: 1181, cols: 4 },
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


function resolveBreedCategoryEntry(cats, type, lookupMap) {
  const entry = cats.find((c) => c.type === type);
  if (!entry) return null;
  return entry.category || lookupMap?.get(entry.category_id) || null;
}


function mapFavoriteBreed(item, isFrench, lookups = {}) {
  const cats = item.categories || [];
  const typeEntry = resolveBreedCategoryEntry(cats, 'type', lookups.type);
  const apartmentEntry = resolveBreedCategoryEntry(cats, 'suitable-for-apartment', lookups.apartment);
  const collectionEntry = resolveBreedCategoryEntry(cats, 'collection', lookups.collection);
  const seoKeyword =
    (isFrench && (item.french_seo_keyword || item.english_seo_keyboard)) ||
    item.english_seo_keyboard ||
    item.french_seo_keyword ||
    '';
  return {
    id: item.id,
    species: /cat|chat/i.test(collectionEntry?.name || '') ? 'cat' : 'dog',
    slug: sanitizeSeoKeyword(seoKeyword),
    name: (isFrench && item.french_name) || item.name || '',
    frenchName: item.french_name || '',
    image: item.media ? `${MEDIA_URL}${item.media}` : '',
    description: (isFrench && item.french_description) || item.description || '',
    tags: (item.tags || []).map((tg) => tg.name).filter(Boolean),
    size: typeEntry ? (isFrench && typeEntry.french_name) || typeEntry.name : '',
    apartment: apartmentEntry ? apartmentEntry.french_name : '',
  };
}

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


function useInfiniteScroll(hasMore, onLoadMore) {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(onLoadMore);

  // Refs can't be mutated during render — keep it fresh in an effect
  // (runs after every render, no deps array) instead.
  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  return sentinelRef;
}

// The sentinel itself doubles as the "loading more" spinner once triggered
// — empty (just padding, so it has a real box to intersect) while idle.
function LoadMoreSentinel({ sentinelRef, loading }) {
  return (
    <div ref={sentinelRef} className="flex items-center justify-center py-10">
      {loading && <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />}
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

// ─── Empty state — shared by the Products and Saved Blogs tabs ───────────
function EmptyState({ image, alt, title, description, ctaLabel, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] text-center py-6">
      <img src={image} alt={alt} className="w-64 md:w-80 h-64 md:h-80 object-contain mb-8" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">{description}</p>
      {ctaLabel && (
        <button
          type="button"
          onClick={onCta}
          className="bg-gray-900 text-white px-8 py-3.5 font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

// Mirrors BreedLibrary.jsx's own BreedCardShimmer exactly.
function BreedCardShimmer() {
  return (
    <div className="min-w-0 bg-white border-r border-b border-[#d8d8d4] flex flex-col">
      <div className="aspect-[1.08/1] bg-[#efefee] animate-pulse" />
      <div className="p-5 pb-6 min-h-[158px] flex flex-col">
        <div className="h-2 w-16 bg-[#e7e6e1] rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-[#e7e6e1] rounded animate-pulse mt-3.5 mb-2" />
        <div className="h-3 w-1/3 bg-[#e7e6e1] rounded animate-pulse mb-5" />
        <div className="mt-auto flex gap-[7px]">
          <div className="h-6 w-16 bg-[#e7e6e1] rounded animate-pulse" />
          <div className="h-6 w-24 bg-[#e7e6e1] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}


function SavedBreedsTab({ breeds, isLoading, loadingMore, hasMore, onLoadMore, onBrowse }) {
  const router = useRouter();
  const { t } = useTranslation('myaccount');
  const sentinelRef = useInfiniteScroll(hasMore, onLoadMore);

  const goToBreed = (breed) => {
    startTopLoader();
    router.push(`/breed-guide/${breed.slug}`);
  };

  if (!isLoading && breeds.length === 0) {
    return (
      <EmptyState
        image="/empty.svg"
        alt="No saved breeds"
        title={t('savedBreeds.empty.title')}
        description={t('savedBreeds.empty.description')}
        ctaLabel={t('savedBreeds.empty.browseBreeds')}
        onCta={onBrowse}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 min-[481px]:grid-cols-2 min-[761px]:grid-cols-3 min-[1181px]:grid-cols-4 border-l border-[#d8d8d4]">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <BreedCardShimmer key={i} />)
          : breeds.map((breed) => (
              <BreedCard key={`${breed.species}-${breed.slug}`} breed={breed} onClick={() => goToBreed(breed)} />
            ))}
      </div>

      {!isLoading && breeds.length > 0 && <LoadMoreSentinel sentinelRef={sentinelRef} loading={loadingMore} />}
    </>
  );
}


function SavedBlogsTab({ isFr, blogs, isLoading, loadingMore, hasMore, onLoadMore, onBrowse }) {
  const router = useRouter();
  const { t } = useTranslation('myaccount');
  const sentinelRef = useInfiniteScroll(hasMore, onLoadMore);

  const navigateTo = (blog) => {
    const keyword = isFr
      ? blog.french_seo_keyword || blog.english_seo_keyboard
      : blog.english_seo_keyboard || blog.french_seo_keyword;
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  if (!isLoading && blogs.length === 0) {
    return (
      <EmptyState
        image="/empty.svg"
        alt="No saved articles"
        title={t('savedBlogs.empty.title')}
        description={t('savedBlogs.empty.description')}
        ctaLabel={t('savedBlogs.empty.browseArticles')}
        onCta={onBrowse}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
               
                <div className="md:hidden border border-gray-200 overflow-hidden flex flex-col">
                  <div className="w-full h-60 bg-gray-200 animate-pulse rounded-none" />
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 w-2/3 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="w-4 h-4 shrink-0 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-full aspect-[5/6] mb-3 bg-gray-200 animate-pulse rounded-none" />
                  <div className="h-2.5 w-1/3 mb-1 bg-gray-200 animate-pulse rounded" />
                  <div className="space-y-1.5 mb-2">
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
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
              {/* Mobile: same horizontal card as ArticleRow, image spinner then fade-in */}
              <div className="md:hidden border border-gray-200 cursor-pointer group overflow-hidden flex flex-col">
                <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                  <img
                    src={imgSrc}
                    onLoad={(e) => {
                      if (e.currentTarget.previousSibling) {
                        e.currentTarget.previousSibling.style.display = "none";
                      }
                      e.currentTarget.classList.remove("opacity-0");
                    }}
                    className="relative z-10 w-full h-full grayscale object-cover group-hover:scale-105 group-hover:grayscale-0 transition-[transform,opacity] duration-700 opacity-0"
                  />
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3 flex-1">
                  <p className="text-xs font-bold uppercase text-gray-900 leading-normal line-clamp-2 flex-1 group-hover:underline underline-offset-2">
                    {getBlogField(blog, "name", isFr)}
                  </p>
                  <HiOutlineArrowUpRight className="shrink-0 mt-0.5 -mr-0.5 text-gray-700 w-4 h-4" />
                </div>
              </div>

              {/* Desktop: same as ExpertAdvices All Articles card, image spinner then fade-in */}
              <div className="hidden md:block cursor-pointer group">
                <div className="relative w-full aspect-[5/6] overflow-hidden mb-3 bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                  <img
                    src={imgSrc}
                    onLoad={(e) => {
                      if (e.currentTarget.previousSibling) {
                        e.currentTarget.previousSibling.style.display = "none";
                      }
                      e.currentTarget.classList.remove("opacity-0");
                    }}
                    className="relative z-10 w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-transform duration-700 cursor-pointer opacity-0"
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

      {!isLoading && blogs.length > 0 && <LoadMoreSentinel sentinelRef={sentinelRef} loading={loadingMore} />}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Favourite() {
  const { t, i18n } = useTranslation('myaccount');
  const isFr = i18n.language?.startsWith('fr');
  const router = useRouter();

  
  const [activeTab, setActiveTab] = useState('products');

  
  const tabRefs = useRef({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  const goToShop = () => {
    startTopLoader();
    router.push('/shop');
  };
  const goToAdvices = () => {
    startTopLoader();
    router.push('/advices');
  };
  const goToBreedGuide = () => {
    startTopLoader();
    router.push('/breed-guide');
  };

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
  const [bundlesLoadingMore, setBundlesLoadingMore] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [bundlesPage, setBundlesPage] = useState(1);
  const [bundlesLastPage, setBundlesLastPage] = useState(1);
  const [bundlesTotal, setBundlesTotal] = useState(0);
  const bundlesHasMore = bundlesPage < bundlesLastPage;

  const bundleColumns = useGridColumns(BUNDLE_BREAKPOINTS);
  const bundlesPerPage = bundleColumns
    ? bundleColumns === 1
      ? BUNDLE_MOBILE_PER_PAGE
      : bundleColumns * ROWS_PER_PAGE
    : 0;

  
  const fetchBundles = async (page, perPage, append = false) => {
    if (append) setBundlesLoadingMore(true);
    else setIsLoading(true);
    try {
      const data = await getFavorites('bundle', page, perPage);
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        if (!append) setFavourites([]);
      } else if (data?.status) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        const mapped = list.map(mapFavoriteProduct);
        setFavourites((prev) => (append ? [...prev, ...mapped] : mapped));
        setBundlesPage(raw?.current_page || page);
        setBundlesLastPage(raw?.last_page || 1);
        setBundlesTotal(raw?.total ?? list.length);
      } else if (!append) {
        setFavourites([]);
      }
    } catch (err) {
      console.error('Fetch favorite bundles error:', err);
      if (!append) setFavourites([]);
    } finally {
      if (append) setBundlesLoadingMore(false);
      else setIsLoading(false);
    }
  };

  // Fetches page 1 once the responsive column count (and so per_page)
  // resolves, and again whenever it changes on resize.
  useEffect(() => {
    if (!bundlesPerPage) return;
    fetchBundles(1, bundlesPerPage);
  }, [bundlesPerPage]);

  const loadMoreBundles = () => {
    if (!bundlesHasMore || bundlesLoadingMore || !bundlesPerPage) return;
    fetchBundles(bundlesPage + 1, bundlesPerPage, true);
  };

  // ─── Saved blogs ────────────────────────────────────────
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsLoadingMore, setBlogsLoadingMore] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsPage, setBlogsPage] = useState(1);
  const [blogsLastPage, setBlogsLastPage] = useState(1);
  const [blogsTotal, setBlogsTotal] = useState(0);
  const blogsHasMore = blogsPage < blogsLastPage;

  const blogColumns = useGridColumns(BLOG_BREAKPOINTS);
  const blogsPerPage = blogColumns
    ? blogColumns === 1
      ? BLOG_MOBILE_PER_PAGE
      : blogColumns * ROWS_PER_PAGE
    : 0;

  const fetchBlogs = async (page, perPage, append = false) => {
    if (append) setBlogsLoadingMore(true);
    else setBlogsLoading(true);
    try {
      const data = await getFavorites('blog', page, perPage);
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        if (!append) setBlogs([]);
      } else if (data?.status) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setBlogs((prev) => (append ? [...prev, ...list] : list));
        setBlogsPage(raw?.current_page || page);
        setBlogsLastPage(raw?.last_page || 1);
        setBlogsTotal(raw?.total ?? list.length);
      } else if (!append) {
        setBlogs([]);
      }
    } catch (err) {
      console.error('Fetch saved blogs error:', err);
      if (!append) setBlogs([]);
    } finally {
      if (append) setBlogsLoadingMore(false);
      else setBlogsLoading(false);
    }
  };

  useEffect(() => {
    if (!blogsPerPage) return;
    fetchBlogs(1, blogsPerPage);
  }, [blogsPerPage]);

  const loadMoreBlogs = () => {
    if (!blogsHasMore || blogsLoadingMore || !blogsPerPage) return;
    fetchBlogs(blogsPage + 1, blogsPerPage, true);
  };

  // ─── Saved breeds
  const [splashData, setSplashData] = useState(null);
  useEffect(() => {
    const readSplashData = () => {
      try {
        const cached = JSON.parse(localStorage.getItem('splashData') || 'null');
        if (cached) setSplashData(cached);
      } catch {
        /* ignore */
      }
    };
    readSplashData();
    window.addEventListener('splashDataReady', readSplashData);
    return () => window.removeEventListener('splashDataReady', readSplashData);
  }, []);

  const breedLookups = useMemo(() => {
    const toMap = (list) => new Map((list || []).map((c) => [c.id, c]));
    return {
      collection: toMap(splashData?.categories),
      type: toMap(splashData?.breed_type),
      apartment: toMap(splashData?.breed_suitable_for_apartment),
    };
  }, [splashData]);

  const [breedsLoading, setBreedsLoading] = useState(true);
  const [breedsLoadingMore, setBreedsLoadingMore] = useState(false);
  const [rawBreedFavorites, setRawBreedFavorites] = useState([]);
  const [breedsPage, setBreedsPage] = useState(1);
  const [breedsLastPage, setBreedsLastPage] = useState(1);
  const [breedsTotal, setBreedsTotal] = useState(0);
  const breedsHasMore = breedsPage < breedsLastPage;

  const breedColumns = useGridColumns(BREED_BREAKPOINTS);
  const breedsPerPage = breedColumns
    ? breedColumns === 1
      ? BREED_MOBILE_PER_PAGE
      : breedColumns * BREED_ROWS_PER_PAGE
    : 0;

  const fetchBreedFavorites = async (page, perPage, append = false) => {
    if (append) setBreedsLoadingMore(true);
    else setBreedsLoading(true);
    try {
      const data = await getFavorites('breed', page, perPage);
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        if (!append) setRawBreedFavorites([]);
      } else if (data?.status) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setRawBreedFavorites((prev) => (append ? [...prev, ...list] : list));
        setBreedsPage(raw?.current_page || page);
        setBreedsLastPage(raw?.last_page || 1);
        setBreedsTotal(raw?.total ?? list.length);
      } else if (!append) {
        setRawBreedFavorites([]);
      }
    } catch (err) {
      console.error('Fetch favorite breeds error:', err);
      if (!append) setRawBreedFavorites([]);
    } finally {
      if (append) setBreedsLoadingMore(false);
      else setBreedsLoading(false);
    }
  };

  useEffect(() => {
    if (!breedsPerPage) return;
    fetchBreedFavorites(1, breedsPerPage);
  }, [breedsPerPage]);

  const loadMoreBreeds = () => {
    if (!breedsHasMore || breedsLoadingMore || !breedsPerPage) return;
    fetchBreedFavorites(breedsPage + 1, breedsPerPage, true);
  };

  const breedFavorites = useMemo(
    () => rawBreedFavorites.map((item) => mapFavoriteBreed(item, isFr, breedLookups)),
    [rawBreedFavorites, isFr, breedLookups],
  );

  const hasFavourites = isLoading || favourites.length > 0;
  
  const bundlesSentinelRef = useInfiniteScroll(bundlesHasMore, loadMoreBundles);

  const measureTabIndicator = () => {
    const el = tabRefs.current[activeTab];
    if (el) setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  };

  useLayoutEffect(measureTabIndicator, [
    activeTab,
    bundlesTotal,
    blogsTotal,
    breedsTotal,
    isLoading,
    blogsLoading,
    breedsLoading,
  ]);

  useEffect(() => {
    window.addEventListener('resize', measureTabIndicator);
    return () => window.removeEventListener('resize', measureTabIndicator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const TAB_COUNTS = { products: bundlesTotal, blogs: blogsTotal, breeds: breedsTotal };
  const TAB_READY = { products: !isLoading, blogs: !blogsLoading, breeds: !breedsLoading };
  const tabCount = (tab) => TAB_COUNTS[tab];
  const tabCountReady = (tab) => TAB_READY[tab];

  
  const tabBtnClass = (tab) =>
    `relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 min-[400px]:px-3 sm:px-5 py-2 sm:py-2.5 text-xs min-[400px]:text-sm font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
      activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-900'
    }`;
  const tabPillClass = (tab) =>
    `text-[10px] sm:text-[11px] font-semibold px-1 sm:px-1.5 py-0.5 rounded-full leading-none transition-colors duration-200 ${
      activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
    }`;

  return (
    <div>
      <div className="max-w-10xl -mt-1 md:mt-9 mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('favourite.title')}</h1>
            <p className="text-sm text-gray-500 mt-1.5">{t('favourite.subtitle')}</p>
          </div>

          <div className="relative inline-flex w-full sm:w-auto items-center gap-1 bg-gray-100 p-1 mb-6 md:mb-8">
            <div
              className="absolute top-1 bottom-1 bg-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-[left,width] duration-300 ease-out"
              style={{ left: tabIndicator.left, width: tabIndicator.width }}
            />
            <button
              ref={(el) => (tabRefs.current.products = el)}
              type="button"
              onClick={() => setActiveTab('products')}
              className={tabBtnClass('products')}
            >
              {t('favourite.tabs.products')}
              {tabCountReady('products') && <span className={tabPillClass('products')}>{tabCount('products')}</span>}
            </button>
            <button
              ref={(el) => (tabRefs.current.blogs = el)}
              type="button"
              onClick={() => setActiveTab('blogs')}
              className={tabBtnClass('blogs')}
            >
              {t('favourite.tabs.blogs')}
              {tabCountReady('blogs') && <span className={tabPillClass('blogs')}>{tabCount('blogs')}</span>}
            </button>
            <button
              ref={(el) => (tabRefs.current.breeds = el)}
              type="button"
              onClick={() => setActiveTab('breeds')}
              className={tabBtnClass('breeds')}
            >
              {t('favourite.tabs.breeds')}
              {tabCountReady('breeds') && <span className={tabPillClass('breeds')}>{tabCount('breeds')}</span>}
            </button>
          </div>

          {activeTab === 'products' && (
            hasFavourites ? (
              <>
                <FavouritesGrid isLoading={isLoading} products={favourites} />
                {!isLoading && favourites.length > 0 && (
                  <LoadMoreSentinel sentinelRef={bundlesSentinelRef} loading={bundlesLoadingMore} />
                )}
              </>
            ) : (
              <EmptyState
                image="/favacc.svg"
                alt="Empty wishlist"
                title={t('favourite.empty.title')}
                description={t('favourite.empty.description')}
                ctaLabel={t('favourite.empty.browseProducts')}
                onCta={goToShop}
              />
            )
          )}

          {activeTab === 'blogs' && (
            <SavedBlogsTab
              isFr={isFr}
              blogs={blogs}
              isLoading={blogsLoading}
              loadingMore={blogsLoadingMore}
              hasMore={blogsHasMore}
              onLoadMore={loadMoreBlogs}
              onBrowse={goToAdvices}
            />
          )}

          {activeTab === 'breeds' && (
            <SavedBreedsTab
              breeds={breedFavorites}
              isLoading={breedsLoading}
              loadingMore={breedsLoadingMore}
              hasMore={breedsHasMore}
              onLoadMore={loadMoreBreeds}
              onBrowse={goToBreedGuide}
            />
          )}
        </div>

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
