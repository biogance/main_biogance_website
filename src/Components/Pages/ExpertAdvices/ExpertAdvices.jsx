"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FiSearch, FiClock, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { GoArrowUpRight, GoFlame, GoClock } from "react-icons/go";
import { FaRegStar } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { useTranslation } from "react-i18next";

const CARD_GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10";
const COLUMN_BREAKPOINTS = [
  { minWidth: 1536, columns: 5 },
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];
const ROWS_PER_PAGE = 3;
const NAVBAR_HEIGHT = 104;
const SKELETON_ROW_COUNT = 5;

function getAuthHeaders() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    if (loginData?.data?.token) {
      return { Authorization: `Bearer ${loginData.data.token}` };
    }
  } catch {}
  return {};
}

function getAuthBody() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    if (loginData?.data?.token) return {};
  } catch {}
  return { device_id: getDeviceId() };
}

function isLoggedIn() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    return !!loginData?.data?.token;
  } catch {
    return false;
  }
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
        active
          ? "bg-gray-900 border-gray-900 text-white"
          : "bg-white border-gray-300 text-gray-700 hover:border-gray-900"
      }`}
    >
      {label}
    </button>
  );
}

function getBlogImage(item) {
  return item?.images?.[0]?.media ?? item?.image ?? null;
}

function getBlogField(item, field, isFr) {
  if (!item) return "";
  const frField = `french_${field}`;
  return (isFr && item[frField]) ? item[frField] : (item[field] ?? "");
}

// Reads the first category attached to the blog item (item.categories[0].category)
// and returns its name (french_name if language is French, else name).
function getCategoryName(item, isFr) {
  const cat = item?.categories?.[0]?.category;
  if (!cat) return "";
  return (isFr && cat.french_name) ? cat.french_name : (cat.name ?? "");
}

/* ────────────────────────────────────────────────────────────────────────
   Shimmer primitives
   ──────────────────────────────────────────────────────────────────────── */
function Shimmer({ className = "" }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

/* Mirrors the hero section exactly: h1 (2 lines), short_description (2 lines),
   meta row (company / reading time / updated - 3 items), button, image */
function HeroSkeleton() {
  return (
    <section className="bg-[#f3f3f3]">
      <div className="flex flex-col lg:flex-row items-stretch">
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
          {/* h1 - text-[42px] leading-tight mb-6, two lines */}
          <div className="mb-6 space-y-3">
            <Shimmer className="h-9 sm:h-10 lg:h-11 w-full" />
            <Shimmer className="h-9 sm:h-10 lg:h-11 w-2/3" />
          </div>
          {/* short_description - text-sm leading-relaxed max-w-md mb-8, two lines */}
          <div className="max-w-md mb-8 space-y-2">
            <Shimmer className="h-3.5 w-full" />
            <Shimmer className="h-3.5 w-5/6" />
          </div>
          {/* meta row - gap-5 sm:gap-8 mb-8, three items */}
          <div className="flex items-center gap-5 sm:gap-8 flex-wrap mb-8">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-3 w-36" />
          </div>
          {/* button - px-5 py-3 */}
          <Shimmer className="h-11 w-40" />
        </div>
        <div className="relative w-full lg:w-1/2 h-[420px]">
          <Shimmer className="w-full h-full rounded-none" />
        </div>
      </div>
    </section>
  );
}

/* Mirrors the sticky filters block: species TabButtons row, search input,
   topics ScrollableTabsRow, divider */
function FiltersSkeleton({ speciesCount = 4, topicsCount = 6 }) {
  return (
    <div className="sticky top-[104px] z-30 bg-white">
      <div className="px-6 sm:px-10 lg:px-16 py-8">
        {/* species tabs + search - gap-4 mb-4 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 md:flex-1 md:min-w-0">
            {Array.from({ length: speciesCount }).map((_, i) => (
              <Shimmer key={i} className="h-9 w-24" />
            ))}
          </div>
          <Shimmer className="h-11 w-full md:w-72 shrink-0" />
        </div>
        {/* topics row - gap-2 */}
        <div className="flex items-center gap-2">
          {Array.from({ length: topicsCount }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-20 shrink-0" />
          ))}
        </div>
        <div className="mt-6 h-px bg-gray-200" />
      </div>
    </div>
  );
}

/* Mirrors ArticleRow exactly: icon+label / "See All", then a row of cards
   (image h-60, title line, arrow icon) spaced with the same gap-6 / mb-10 */
function ArticleRowSkeleton({ visibleCount }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Shimmer className="w-3.5 h-3.5 rounded-full" />
          <Shimmer className="h-3 w-32" />
        </div>
        <Shimmer className="h-3 w-16" />
      </div>

      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: visibleCount }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 shrink-0 overflow-hidden flex flex-col"
            style={{ flexBasis: `calc((100% - ${(visibleCount - 1) * 24}px) / ${visibleCount})` }}
          >
            <Shimmer className="w-full h-60 rounded-none" />
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <Shimmer className="h-3 w-3/4" />
              <Shimmer className="w-4 h-4 rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Mirrors an "All Articles" grid card exactly: image aspect-[5/6], category
   line, title (2 lines), meta row (company / reading time) */
function AllArticlesCardSkeleton() {
  return (
    <div>
      <Shimmer className="w-full aspect-[5/6] mb-3 rounded-none" />
      <Shimmer className="h-2.5 w-1/3 mb-2" />
      <div className="space-y-1.5 mb-2">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between">
        <Shimmer className="h-2.5 w-16" />
        <Shimmer className="h-2.5 w-12" />
      </div>
    </div>
  );
}

function ArticleRow({ label, type, icon: Icon, items, isFr }) {
  const router = useRouter();

  const navigateToDetail = (item) => {
    const keyword = isFr
      ? (item.french_seo_keyword || item.english_seo_keyboard)
      : (item.english_seo_keyboard || item.french_seo_keyword);
    router.push(`/expert-detail?seo=${encodeURIComponent(keyword)}`);
  };
  const scrollRef = useRef(null);
  const visibleCount = useResponsiveColumns();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const gap = 24;

  const updateScrollState = () => {
    const track = scrollRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const track = scrollRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, visibleCount]);

  const scrollByCard = (direction) => {
    const track = scrollRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const amount = card ? card.offsetWidth + gap : 300;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!items?.length) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </p>
        <button
          type="button"
          onClick={() => router.push(`/expert-advice/see-all?type=${type}`)}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-500 transition-colors cursor-pointer"
        >
          See All
          <GoArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative isolate z-0">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={item.id}
              data-card
              onClick={() => navigateToDetail(item)}
              className="border border-gray-200 shrink-0 snap-start cursor-pointer group overflow-hidden flex flex-col"
              style={{
                flexBasis: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
              }}
            >
              <img
              src={getBlogImage(item) ? `${MEDIA_URL}${getBlogImage(item)}` : "/cat.png"}
                alt={item.title}
                className="w-full h-60 grayscale object-cover group-hover:scale-105 transition-transform duration-300 hover:grayscale-0"
              />
              <div className="px-4 py-3 flex items-center justify-between gap-3 flex-1">
                <p className="text-xs font-bold uppercase text-gray-900 leading-normal line-clamp-2 flex-1">
                  {getBlogField(item, "name", isFr)}
                </p>
                <HiOutlineArrowUpRight className="shrink-0 mt-0.5 text-gray-700 w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ScrollableTabsRow({ items, activeItem, activeItems = [], onSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const track = scrollRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const track = scrollRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const scrollByOne = (direction) => {
    const track = scrollRef.current;
    if (!track) return;
    const topics = Array.from(track.querySelectorAll("[data-topic]"));
    if (!topics.length) return;
    const viewLeft = track.scrollLeft;
    const viewRight = viewLeft + track.clientWidth;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (direction === 1) {
      const next = topics.find((el) => el.offsetLeft + el.offsetWidth > viewRight + 1);
      if (next) {
        track.scrollTo({ left: Math.min(next.offsetLeft + next.offsetWidth - track.clientWidth, maxScroll), behavior: "smooth" });
      } else {
        track.scrollTo({ left: maxScroll, behavior: "smooth" });
      }
    } else {
      const prev = [...topics].reverse().find((el) => el.offsetLeft < viewLeft - 1);
      if (prev) {
        track.scrollTo({ left: Math.max(prev.offsetLeft, 0), behavior: "smooth" });
      } else {
        track.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative flex items-center gap-2 min-w-0">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByOne(-1)}
          aria-label="Scroll left"
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
      )}
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto overflow-y-visible scroll-smooth min-w-0 py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((label) => (
            <div key={label} data-topic className="shrink-0">
              <TabButton
                label={label}
                active={label === "All" ? activeItem === "All" : activeItems.includes(label)}
                onClick={() => onSelect(label)}
              />
            </div>
          ))}
        </div>
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByOne(1)}
          aria-label="Scroll right"
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function useResponsiveColumns() {
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const calc = () => COLUMN_BREAKPOINTS.find((b) => window.innerWidth >= b.minWidth).columns;
    const update = () => setColumns(calc());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return columns;
}

function ExpertAdvices() {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith("fr");
  const router = useRouter();
  const filtersRef = useRef(null);
  const searchTimerRef = useRef(null);

  // ── Splash data ──────────────────────────────────────────────────────────
  const [splashCategories] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      let raw = localStorage.getItem("splashData");
      if (!raw) return [];
      let parsed = JSON.parse(raw);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      return parsed?.data?.categories ?? parsed?.categories ?? [];
    } catch {
      return [];
    }
  });

  const [activeSpecies, setActiveSpecies] = useState(null); // koi category first time select nahi hogi
  const [activeTopic, setActiveTopic] = useState([]); // [] = All

  const speciesList = splashCategories;

  // Jab tak koi category select nahi hoti, saare categories ke topics combine karke dikhao
  // (taake topics row hamesha visible rahe). Category select hone par uske apne topics dikhenge.
  const topicsList = useMemo(() => {
    if (activeSpecies) return activeSpecies?.topics ?? [];
    const map = new Map();
    speciesList.forEach((cat) => {
      (cat.topics ?? []).forEach((t) => {
        if (!map.has(t.id)) map.set(t.id, t);
      });
    });
    return Array.from(map.values());
  }, [activeSpecies, speciesList]);

  // ── Search (debounced 1s) ────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 1000);
  };

  // ── Blog home API data ───────────────────────────────────────────────────
  const [heroArticle, setHeroArticle] = useState({ blog: null, banner: null });
  const [sections, setSections] = useState({ recommended: [], trending: [], most_liked: [], recently_added: [], pet: [] });
  const [allArticles, setAllArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const columns = useResponsiveColumns();
  const perPage = columns * ROWS_PER_PAGE;
  const hasLoadedOnceRef = useRef(false);

  const fetchBlogs = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const body = {
        ...getAuthBody(),
        collection_id: activeSpecies?.id,
        per_page: perPage,
        page: pageNum,
      };
      if (activeTopic.length) body.topic_id = activeTopic.map((t) => t.id).join(",");
      if (debouncedSearch.trim()) body.keyword = debouncedSearch.trim();

      const res = await axios.post(`${BASE_URL}/blog/home`, body, {
        headers: { ...getAuthHeaders() },
      });

      if (!res.data.status) {
        toast.error(res.data.action || "Something went wrong.");
        return;
      }

      const d = res.data.data;

      if (pageNum === 1) {
        const banner = d?.blogHeaderBanner ?? null;
        setHeroArticle({ blog: banner?.blog ?? null, banner });
        setSections({
          recommended: d?.recommendedBlog ?? [],
          trending: d?.trendingBlog ?? [],
          most_liked: d?.likeBlog ?? [],
          recently_added: d?.recentBlog ?? [],
          pet: d?.petBlog ?? [],
        });
        setAllArticles(d?.blogs?.data ?? []);
        setTotalArticles(d?.blogs?.total ?? 0);
        setHasMore((d?.blogs?.current_page ?? 1) < (d?.blogs?.last_page ?? 1));
      } else {
        const newItems = d?.blogs?.data ?? [];
        setAllArticles((prev) => append ? [...prev, ...newItems] : newItems);
        setHasMore((d?.blogs?.current_page ?? pageNum) < (d?.blogs?.last_page ?? pageNum));
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      hasLoadedOnceRef.current = true;
    }
  }, [activeSpecies, activeTopic, debouncedSearch, perPage]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
    fetchBlogs(1, false);
  }, [activeSpecies, activeTopic, debouncedSearch, columns]);

  // Jab user category/topic choose kare ya search kare aur woh page pe neeche
  // scrolled ho, to filters ke "stuck" (navbar ke sath chipke) position tak
  // upar scroll ho jaye — taake naya data (pehli row samet) nazar aa jaye.
  const isFirstSearchRender = useRef(true);
  const scrollToFilters = useCallback(() => {
    const filters = filtersRef.current;
    if (!filters) return;
    const targetY = filters.offsetTop - NAVBAR_HEIGHT;
    if (window.scrollY > targetY) {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }
    scrollToFilters();
  }, [activeSpecies, activeTopic, debouncedSearch, scrollToFilters]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchBlogs(next, true);
  };

  // ── Sticky filter detection ──────────────────────────────────────────────
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const checkStuck = () => {
      if (!filtersRef.current) return;
      setIsStuck(filtersRef.current.getBoundingClientRect().top <= NAVBAR_HEIGHT);
    };
    checkStuck();
    window.addEventListener("scroll", checkStuck, { passive: true });
    window.addEventListener("resize", checkStuck);
    return () => {
      window.removeEventListener("scroll", checkStuck);
      window.removeEventListener("resize", checkStuck);
    };
  }, []);

  const scrollToArticles = () => {
    const section = document.getElementById("all-articles-section");
    if (!section) return;
    const filterHeight = filtersRef.current?.offsetHeight ?? 0;
    const targetY = section.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT - filterHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  /* ── Full-page shimmer (including filters) only on the very first load ── */
  if (loading && !hasLoadedOnceRef.current) {
    return (
      <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
        <Navbar bgWhite={true} />

        <HeroSkeleton />

        <FiltersSkeleton speciesCount={Math.max(speciesList.length, 4)} topicsCount={6} />

        <div className="px-6 sm:px-10 lg:px-16">
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
            <ArticleRowSkeleton key={i} visibleCount={columns} />
          ))}

          {/* All Articles skeleton */}
          <div className="pb-16">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-16" />
            </div>
            <div className={CARD_GRID}>
              {Array.from({ length: perPage }).map((_, i) => (
                <AllArticlesCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Hero */}
      <section
        style={{
          backgroundColor: heroArticle.banner?.background_color
            ? `#${heroArticle.banner.background_color}`
            : "#f3f3f3",
        }}
      >
        {!loading && heroArticle.blog ? (
          <div className="flex flex-col lg:flex-row items-stretch">
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight mb-6">
                {getBlogField(heroArticle.blog, "name", isFr)}
              </h1>
              {getBlogField(heroArticle.blog, "short_description", isFr) && (
                <p className="text-sm text-gray-700 leading-relaxed max-w-md mb-8">
                  {getBlogField(heroArticle.blog, "short_description", isFr)}
                </p>
              )}
              <div className="flex items-center gap-5 sm:gap-8 text-xs text-gray-700 font-medium flex-wrap mb-8">
                <span>by {heroArticle.blog.company_name || "Biogance"}</span>
                <span>{heroArticle.blog.reading_time || "0"} min read</span>
                {heroArticle.blog.updated_at && (
                  <span>Updated {new Date(heroArticle.blog.updated_at).toLocaleDateString(isFr ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                )}
              </div>
              <button
                type="button"
                onClick={scrollToArticles}
                className="self-start cursor-pointer bg-transparent border border-gray-900 text-gray-900 text-xs font-semibold px-5 py-3 hover:bg-gray-900 hover:text-white transition-colors"
              >
                Read this article
              </button>
            </div>
            <div className="relative w-full lg:w-1/2 h-[420px]">
              {(() => {
                const bannerImg = isFr && heroArticle.banner?.french_media
                  ? heroArticle.banner.french_media
                  : heroArticle.banner?.media;
                return (
                  <img
                    src={bannerImg ? `${MEDIA_URL}${bannerImg}` : getBlogImage(heroArticle.blog) ? `${MEDIA_URL}${getBlogImage(heroArticle.blog)}` : "/cat.png"}
                    alt={getBlogField(heroArticle.blog, "name", isFr)}
                    className="w-full h-full object-contain"
                  />
                );
              })()}
            </div>
          </div>
        ) : (
          <HeroSkeleton />
        )}
      </section>

      {/* Sticky Filters */}
      <div ref={filtersRef} className="sticky top-[95px] scroll-mt-[104px] z-30 bg-white">
        <div className="px-6 sm:px-10 lg:px-16 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <div className="flex flex-wrap items-center gap-2 md:flex-1 md:min-w-0">
              {speciesList.map((cat) => (
                <TabButton
                  key={cat.id}
                  label={cat.name}
                  active={activeSpecies?.id === cat.id}
                  onClick={() => { setActiveSpecies(cat); setActiveTopic([]); }}
                />
              ))}
            </div>

            <div className="group relative w-full md:w-72 shrink-0">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search articles..."
                className="h-11 w-full border border-gray-200 bg-gray-50/60 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); setDebouncedSearch(""); }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <ScrollableTabsRow
            items={["All", ...topicsList.map((t) => t.name)]}
            activeItem={activeSpecies && activeTopic.length === 0 ? "All" : null}
            activeItems={activeTopic.map((t) => t.name)}
            onSelect={(name) => {
              if (name === "All") { setActiveTopic([]); return; }
              const found = topicsList.find((t) => t.name === name);
              if (!found) return;
              setActiveTopic((prev) =>
                prev.find((t) => t.id === found.id)
                  ? prev.filter((t) => t.id !== found.id)
                  : [...prev, found]
              );
            }}
          />

          <hr
            className={`border-t border-gray-200 transition-all duration-150 overflow-hidden ${
              isStuck ? "opacity-0 mt-0 h-0 border-t-0" : "opacity-100 mt-6 h-px"
            }`}
          />
        </div>
      </div>

      <div className="px-6 sm:px-10 lg:px-16">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <ArticleRowSkeleton key={i} visibleCount={columns} />
          ))
        ) : (
          <>
            <ArticleRow label="Recommended For Your Pet" type="recommended" icon={FaRegStar} items={sections.recommended} isFr={isFr} />
            <ArticleRow label="Trending" type="trending" icon={GoFlame} items={sections.trending} isFr={isFr} />
            <ArticleRow label="Most Liked" type="like" icon={CiHeart} items={sections.most_liked} isFr={isFr} />
            <ArticleRow label="Recently Added" type="recent" icon={GoClock} items={sections.recently_added} isFr={isFr} />
            {/* <ArticleRow label="Pet Blogs" type="pet" icon={FaRegStar} items={sections.pet} isFr={isFr} /> */}
          </>
        )}

        {/* All Articles */}
        <div id="all-articles-section" className="scroll-mt-28 pb-16">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-gray-900 uppercase">
              All Articles
            </p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              {String(totalArticles).padStart(2, "0")} Entries
            </p>
          </div>

          {loading ? (
            <div className={CARD_GRID}>
              {Array.from({ length: perPage }).map((_, i) => (
                <AllArticlesCardSkeleton key={i} />
              ))}
            </div>
          ) : allArticles.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">
              No articles match these filters yet.
            </p>
          ) : (
            <>
              <div className={CARD_GRID}>
                {allArticles.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      const keyword = isFr
                        ? (a.french_seo_keyword || a.english_seo_keyboard)
                        : (a.english_seo_keyboard || a.french_seo_keyword);
                      router.push(`/expert-detail?seo=${encodeURIComponent(keyword)}`);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="relative w-full aspect-[5/6] overflow-hidden mb-3 bg-gray-100">
                      <img
                        src={a.image ? `${MEDIA_URL}${a.image}` : getBlogImage(a) ? `${MEDIA_URL}${getBlogImage(a)}` : "/cat.png"}
                        alt={a.title ?? a.name}
                        className="w-full h-full object-cover grayscale transition-transform duration-300 hover:scale-105 cursor-pointer hover:grayscale-0"
                      />
                    </div>
                    <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
                      {getCategoryName(a, isFr) || "Pets"}
                    </p>
                    <h3 className="text-sm font-bold uppercase text-gray-900 leading-snug mb-2 line-clamp-2">
                      {getBlogField(a, "name", isFr)}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{a.company_name || ""}</span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {a.reading_time ? `${a.reading_time} min` : "0 min"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 border border-gray-900 text-gray-900 text-xs font-semibold uppercase tracking-wider px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingMore && (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ExpertAdvices;