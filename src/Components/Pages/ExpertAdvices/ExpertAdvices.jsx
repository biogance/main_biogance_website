"use client";

import { Fragment, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  FiSearch,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { GoArrowUpRight, GoFlame, GoClock } from "react-icons/go";
import { FaRegStar, FaRegUserCircle } from "react-icons/fa";
import { FaRegHourglassHalf, FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineUpdate, MdUpdate } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { startTopLoader } from "../TopLoader";
import { IoHourglassOutline } from "react-icons/io5";

const CARD_GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-10";
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

// In-memory cache (module scope, not sessionStorage) so filters + results
// survive a soft navigation to ExpertAdvicesSeeAll/ExpertAdvicesDetail and
// back, but reset on a real browser refresh — a true reload re-evaluates
// this module from scratch.
let expertAdvicesStateCache = null;

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
  return isFr && item[frField] ? item[frField] : (item[field] ?? "");
}

// Reads the first category attached to the blog item (item.categories[0].category)
// and returns its name (french_name if language is French, else name).
function getCategoryName(item, isFr) {
  const cat = item?.categories?.[0]?.category;
  if (!cat) return "";
  return isFr && cat.french_name ? cat.french_name : (cat.name ?? "");
}

// Stores both language variants of a species/topic name so the "Back to X"
// label on ExpertAdvicesDetail can re-render in whichever language is active
// at read time, instead of freezing the label in the language captured here.
function getBackPart(item) {
  return { name: item?.name ?? "", frenchName: item?.french_name ?? "" };
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
          {/* meta row - gap-5 sm:gap-8 mb-8, three icon+label items (gap-1.5 each) */}
          <div className="flex items-center gap-5 sm:gap-8 flex-wrap mb-8">
            <div className="flex items-center gap-1.5">
              <Shimmer className="w-4 h-4 rounded-full" />
              <Shimmer className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-1.5">
              <Shimmer className="w-4 h-4 rounded-full" />
              <Shimmer className="h-3 w-14" />
            </div>
            <div className="flex items-center gap-1.5">
              <Shimmer className="w-4 h-4 rounded-full" />
              <Shimmer className="h-3 w-32" />
            </div>
          </div>
          {/* button - px-5 py-3 */}
          <Shimmer className="h-11 w-40" />
        </div>
        <div className="hidden lg:block relative lg:w-1/2 h-[420px]">
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
    <div className="sticky top-[95px] scroll-mt-[104px] z-30 bg-white">
      <div className="px-6 sm:px-10 lg:px-16 pt-6 pb-3 md:pb-6">
        {/* Mobile (below md): species chip row, then topics chip row, gap-2 each, mt-2 between */}
        <div className="md:hidden flex items-center gap-2 overflow-hidden py-0.5">
          {Array.from({ length: Math.min(speciesCount, 4) }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-20 shrink-0" />
          ))}
        </div>
        <div className="md:hidden mt-2 flex items-center gap-2 overflow-hidden py-0.5">
          {Array.from({ length: Math.min(topicsCount, 4) }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-16 shrink-0" />
          ))}
        </div>

        {/* Desktop (md and up): species tabs + search - gap-4 mb-2, then topics row */}
        <div className="hidden md:block">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <div className="flex flex-wrap items-center gap-2 md:flex-1 md:min-w-0">
              {Array.from({ length: speciesCount }).map((_, i) => (
                <Shimmer key={i} className="h-9 w-24" />
              ))}
            </div>
            <Shimmer className="h-11 w-full md:w-72 shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: topicsCount }).map((_, i) => (
              <Shimmer key={i} className="h-9 w-20 shrink-0" />
            ))}
          </div>
        </div>

        <div className="mt-3 md:mt-6 h-px bg-gray-200" />
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
        <div className="flex items-center gap-1">
          <Shimmer className="h-3 w-12" />
          <Shimmer className="w-3.5 h-3.5 rounded-full" />
        </div>
      </div>

      <div className="flex gap-3 sm:gap-6 overflow-hidden">
        {Array.from({ length: visibleCount }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 shrink-0 overflow-hidden flex flex-col"
            style={{
              flexBasis: `calc((100% - ${(visibleCount - 1) * 24}px) / ${visibleCount})`,
            }}
          >
            <Shimmer className="w-full h-60 rounded-none" />
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-2/3" />
              </div>
              <Shimmer className="w-4 h-4 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Mirrors the "All Articles" grid card: below md it's the same border/h-60/
   title+arrow card as ArticleRow's cards; md and up it's image aspect-[5/6],
   category line, title (2 lines), meta row (company / reading time) */
function AllArticlesCardSkeleton() {
  return (
    <>
      <div className="md:hidden border border-gray-200 overflow-hidden flex flex-col">
        <Shimmer className="w-full h-60 rounded-none" />
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-2/3" />
          </div>
          <Shimmer className="w-4 h-4 shrink-0" />
        </div>
      </div>

      <div className="hidden md:block">
        <Shimmer className="w-full aspect-[5/6] mb-3 rounded-none" />
        <Shimmer className="h-2.5 w-1/3 mb-1" />
        <div className="space-y-1.5 mb-2">
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <Shimmer className="h-2.5 w-16" />
          <div className="flex items-center gap-1">
            <Shimmer className="w-3 h-3 rounded-full" />
            <Shimmer className="h-2.5 w-8" />
          </div>
        </div>
      </div>
    </>
  );
}

function ArticleRow({ label, type, icon: Icon, items, isFr, activeSpecies, activeTopic }) {
  const router = useRouter();
  const { t: tr } = useTranslation("expertadvice");

  const navigateToDetail = (item) => {
    const keyword = isFr
      ? item.french_seo_keyword || item.english_seo_keyboard
      : item.english_seo_keyboard || item.french_seo_keyword;
    const parts = [];
    if (activeSpecies) parts.push(getBackPart(activeSpecies));
    if (activeTopic?.length) activeTopic.forEach((t) => parts.push(getBackPart(t)));
    try { sessionStorage.setItem("adviceBack", JSON.stringify({ parts, url: "/advices" })); } catch {}
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };
  const scrollRef = useRef(null);
  const visibleCount = useResponsiveColumns() || 1;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const gap = visibleCount === 1 ? 12 : 24;

  const updateScrollState = () => {
    const track = scrollRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    );
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
          onClick={() => {
            startTopLoader();
            router.push(`/advices/${type}`);
          }}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-500 transition-colors cursor-pointer"
        >
          {tr("seeAll")}
          <GoArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative isolate z-0">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label={tr("scrollLeft")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-6 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
              <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
                <img
                  src={
                    getBlogImage(item)
                      ? `${MEDIA_URL}${getBlogImage(item)}`
                      : "/cat.png"
                  }

                  onLoad={(e) => e.currentTarget.previousSibling?.remove()}
                  className="relative z-10 w-full h-full grayscale object-cover group-hover:scale-105 transition-transform duration-300 hover:grayscale-0"
                />
              </div>
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
            aria-label={tr("scrollRight")}
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
  const { t: tr } = useTranslation("expertadvice");
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const track = scrollRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    );
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

    const trackRect = track.getBoundingClientRect();
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction === 1) {
      // Right side jo tab half/cut-off ho raha ha, usko dhoondo
      const next = topics.find((el) => {
        const r = el.getBoundingClientRect();
        return r.right > trackRect.right + 1;
      });
      if (next) {
        const r = next.getBoundingClientRect();
        const delta = r.right - trackRect.right; // kitna scroll karna ha taake ye tab full dikhe
        track.scrollTo({
          left: Math.min(track.scrollLeft + delta, maxScroll),
          behavior: "smooth",
        });
      } else {
        track.scrollTo({ left: maxScroll, behavior: "smooth" });
      }
    } else {
      // Left side jo tab half/cut-off ho raha ha, usko dhoondo
      const prev = [...topics].reverse().find((el) => {
        const r = el.getBoundingClientRect();
        return r.left < trackRect.left - 1;
      });
      if (prev) {
        const r = prev.getBoundingClientRect();
        const delta = r.left - trackRect.left;
        track.scrollTo({
          left: Math.max(track.scrollLeft + delta, 0),
          behavior: "smooth",
        });
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
          aria-label={tr("scrollLeft")}
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
                label={label === "All" ? tr("all") : label}
                active={
                  label === "All"
                    ? activeItem === "All"
                    : activeItems.includes(label)
                }
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
          aria-label={tr("scrollRight")}
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function ScrollableChipRow({ tabs }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scroll-smooth min-w-0 py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <div key={tab.key} data-chip className="shrink-0">
          <TabButton label={tab.label} active={tab.active} onClick={tab.onClick} />
        </div>
      ))}
    </div>
  );
}

function FilterChip({ label }) {
  return (
    <span className="inline-flex items-center text-[11px] font-medium text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

function useResponsiveColumns() {
  const [columns, setColumns] = useState(null);
  useEffect(() => {
    const calc = () =>
      COLUMN_BREAKPOINTS.find((b) => window.innerWidth >= b.minWidth).columns;
    const update = () => setColumns(calc());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return columns;
}

function ExpertAdvices() {
  const { t: tr, i18n } = useTranslation("expertadvice");
  const isFr = i18n.language?.startsWith("fr");
  const router = useRouter();
  const cachedState = useRef(expertAdvicesStateCache).current;
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

  const [activeSpecies, setActiveSpecies] = useState(cachedState?.activeSpecies ?? null);
  const [activeTopic, setActiveTopic] = useState(cachedState?.activeTopic ?? []);

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

  const resetAllFilters = () => {
    setActiveSpecies(null);
    setActiveTopic([]);
  };

  const mobileSpeciesTabs = speciesList.map((cat) => ({
    key: `species-${cat.id}`,
    label: getBlogField(cat, "name", isFr),
    active: activeSpecies?.id === cat.id,
    onClick: () => {
      setActiveSpecies((prev) => (prev?.id === cat.id ? null : cat));
      setActiveTopic([]);
    },
  }));

  const mobileTopicTabs = topicsList.map((t) => ({
    key: `topic-${t.id}`,
    label: getBlogField(t, "name", isFr),
    active: activeTopic.some((x) => x.id === t.id),
    onClick: () => {
      setActiveTopic((prev) =>
        prev.find((x) => x.id === t.id)
          ? prev.filter((x) => x.id !== t.id)
          : [...prev, t],
      );
    },
  }));

  // ── Search (immediate shimmer, 1.5s debounce before the API call) ───────
  const [searchInput, setSearchInput] = useState(cachedState?.searchInput ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(cachedState?.debouncedSearch ?? "");
  const [isSearchPending, setIsSearchPending] = useState(false);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    setIsSearchPending(true);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 1500);
  };
  const clearSearch = () => {
    clearTimeout(searchTimerRef.current);
    setIsSearchPending(true);
    setSearchInput("");
    setDebouncedSearch("");
  };
  // While the user has a search term in play, only the "All Articles" grid
  // shows results for it — the Recommended/Trending/etc. rows above hide.
  const isSearching = searchInput.trim().length > 0;

  // ── Blog home API data ───────────────────────────────────────────────────
  const [heroArticle, setHeroArticle] = useState(
    cachedState?.heroArticle ?? { blog: null, banner: null },
  );
  const [sections, setSections] = useState(
    cachedState?.sections ?? {
      recommended: [],
      trending: [],
      most_liked: [],
      recently_added: [],
      pet: [],
    },
  );
  const [allArticles, setAllArticles] = useState(cachedState?.allArticles ?? []);
  const [totalArticles, setTotalArticles] = useState(cachedState?.totalArticles ?? 0);
  const [loading, setLoading] = useState(!cachedState);

  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(cachedState?.page ?? 1);
  const [hasMore, setHasMore] = useState(cachedState?.hasMore ?? false);

  const columns = useResponsiveColumns();
  const perPage = columns ? columns * ROWS_PER_PAGE : 0;
  const hasLoadedOnceRef = useRef(!!cachedState);
  const skipInitialFetchRef = useRef(!!cachedState);

  const fetchBlogs = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const body = {
          ...getAuthBody(),
          collection_id: activeSpecies?.id,
          per_page: perPage,
          page: pageNum,
        };
        if (activeTopic.length)
          body.topic_id = activeTopic.map((t) => t.id).join(",");
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
          setHasMore(
            (d?.blogs?.current_page ?? 1) < (d?.blogs?.last_page ?? 1),
          );
        } else {
          const newItems = d?.blogs?.data ?? [];
          setAllArticles((prev) =>
            append ? [...prev, ...newItems] : newItems,
          );
          setHasMore(
            (d?.blogs?.current_page ?? pageNum) <
              (d?.blogs?.last_page ?? pageNum),
          );
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsSearchPending(false);
        hasLoadedOnceRef.current = true;
      }
    },
    [activeSpecies, activeTopic, debouncedSearch, perPage],
  );

  // Fires once, the first time `columns` resolves after mount — NOT again
  // when it merely changes later (e.g. resizing the window / DevTools
  // responsive mode toggling the column count), which used to re-trigger a
  // full shimmer + refetch on every breakpoint crossing.
  const columnsResolvedRef = useRef(false);
  useEffect(() => {
    if (!columns || columnsResolvedRef.current) return;
    columnsResolvedRef.current = true;
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    setPage(1);
    fetchBlogs(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // Reset to page 1 when filters/search actually change (columns intentionally excluded).
  const isFirstFilterEffectRef = useRef(true);
  useEffect(() => {
    if (isFirstFilterEffectRef.current) {
      isFirstFilterEffectRef.current = false;
      return;
    }
    if (!columns) return;
    setPage(1);
    fetchBlogs(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpecies, activeTopic, debouncedSearch]);

  // Keep the restore-on-back-navigation cache in sync with the latest filters/results.
  useEffect(() => {
    expertAdvicesStateCache = {
      activeSpecies,
      activeTopic,
      searchInput,
      debouncedSearch,
      heroArticle,
      sections,
      allArticles,
      totalArticles,
      page,
      hasMore,
    };
  }, [
    activeSpecies,
    activeTopic,
    searchInput,
    debouncedSearch,
    heroArticle,
    sections,
    allArticles,
    totalArticles,
    page,
    hasMore,
  ]);

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
      setIsStuck(
        filtersRef.current.getBoundingClientRect().top <= NAVBAR_HEIGHT,
      );
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
    const targetY =
      section.getBoundingClientRect().top +
      window.scrollY -
      NAVBAR_HEIGHT -
      filterHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  /* ── Full-page shimmer (including filters) only on the very first load ── */
  if (loading && !hasLoadedOnceRef.current) {
    return (
      <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
        <Navbar bgWhite={true} />

        <HeroSkeleton />

        <FiltersSkeleton
          speciesCount={Math.max(speciesList.length, 4)}
          topicsCount={6}
        />

        {/* Mobile-only search bar — mirrors the block below the sticky filters */}
        <div className="md:hidden px-6 sm:px-10 lg:px-16 pt-2 pb-6">
          <Shimmer className="h-11 w-full" />
        </div>

        <div className="px-6 sm:px-10 lg:px-16">
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
            <ArticleRowSkeleton key={i} visibleCount={columns || 1} />
          ))}

          {/* All Articles skeleton */}
          <div className="pb-16">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-16" />
            </div>
            <div className={CARD_GRID}>
              {Array.from({ length: perPage || 8 }).map((_, i) => (
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
        {heroArticle.blog ? (
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
                <span className="flex items-center gap-1.5">
                   <FaRegUserCircle  size={16} className="text-gray-700 mb-0.3" />
                  {tr("byAuthor", { name: heroArticle.blog.company_name || "Biogance" })}
                </span>
                <span className="flex items-center gap-1">
                 <IoHourglassOutline size={16} className="text-gray-700 mb-0.4" />
                  {tr("minRead", { time: heroArticle.blog.reading_time || "0" })}
                </span>
                {heroArticle.blog.updated_at && (
                  <span className="flex items-center gap-1">
                    <MdUpdate size={18} className="text-gray-700" />
                    {tr("updatedOn", {
                      date: new Date(heroArticle.blog.updated_at).toLocaleDateString(
                        isFr ? "fr-FR" : "en-GB",
                        { day: "numeric", month: "long", year: "numeric" },
                      ),
                    })}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const keyword = isFr
                    ? heroArticle.blog.french_seo_keyword ||
                      heroArticle.blog.english_seo_keyboard
                    : heroArticle.blog.english_seo_keyboard ||
                      heroArticle.blog.french_seo_keyword;
                  try { sessionStorage.setItem("adviceBack", JSON.stringify({ parts: [], url: "/advices" })); } catch {}
                  startTopLoader();
                  router.push(`/advices/${encodeURIComponent(keyword)}`);
                }}
                className="self-start cursor-pointer bg-transparent border border-gray-900 text-gray-900 text-xs font-semibold px-5 py-3 hover:bg-gray-900 hover:text-white transition-colors"
              >
                {tr("readThisArticle")}
              </button>
            </div>
            <div className="hidden lg:block relative lg:w-1/2 h-[420px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-9 h-9 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
              {(() => {
                const bannerImg =
                  isFr && heroArticle.banner?.french_media
                    ? heroArticle.banner.french_media
                    : heroArticle.banner?.media;
                return (
                  <img
                    src={
                      bannerImg
                        ? `${MEDIA_URL}${bannerImg}`
                        : getBlogImage(heroArticle.blog)
                          ? `${MEDIA_URL}${getBlogImage(heroArticle.blog)}`
                          : "/cat.png"
                    }
                    alt=""
                    onLoad={(e) => {
                      e.currentTarget.parentElement.classList.remove(
                        "bg-gray-200",
                      );
                      e.currentTarget.previousSibling?.remove();
                    }}
                    className="relative z-10 w-full h-full object-contain"
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
      <div
        ref={filtersRef}
        className="sticky top-[95px] scroll-mt-[104px] z-30 bg-white"
      >
        <div
          className={`px-6 sm:px-10 lg:px-16 pt-6 transition-[padding-bottom] duration-300 ease-out ${isStuck ? "pb-0" : "pb-3 md:pb-6"}`}
        >
          {/* ── Mobile filters (below md) — only the tabs stay sticky; search moves below ── */}
          <div className="md:hidden">
            <ScrollableChipRow tabs={mobileSpeciesTabs} />
            <div className="mt-2">
              <ScrollableChipRow tabs={mobileTopicTabs} />
            </div>
          </div>

          {/* ── Desktop filters (md and up) ── */}
          <div className="hidden md:block">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <div className="flex flex-wrap items-center gap-2 md:flex-1 md:min-w-0">
                {speciesList.map((cat) => (
                  <TabButton
                    key={cat.id}
                    label={getBlogField(cat, "name", isFr)}
                    active={activeSpecies?.id === cat.id}
                    onClick={() => {
                      setActiveSpecies((prev) =>
                        prev?.id === cat.id ? null : cat,
                      );
                      setActiveTopic([]);
                    }}
                  />
                ))}
              </div>

              <div className="group relative w-full md:w-72 shrink-0">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={tr("searchPlaceholder")}
                  className="h-11 w-full border border-gray-200 bg-gray-50/60 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label={tr("clearSearch")}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <ScrollableTabsRow
              items={["All", ...topicsList.map((t) => getBlogField(t, "name", isFr))]}
              activeItem={
                activeSpecies && activeTopic.length === 0 ? "All" : null
              }
              activeItems={activeTopic.map((t) => getBlogField(t, "name", isFr))}
              onSelect={(name) => {
                if (name === "All") {
                  setActiveTopic([]);
                  return;
                }
                const found = topicsList.find(
                  (t) => getBlogField(t, "name", isFr) === name,
                );
                if (!found) return;
                setActiveTopic((prev) =>
                  prev.find((t) => t.id === found.id)
                    ? prev.filter((t) => t.id !== found.id)
                    : [...prev, found],
                );
              }}
            />
          </div>

          <hr
            className={`border-t border-gray-200 transition-[margin-top] duration-300 ease-out ${isStuck ? "mt-2" : "mt-3 md:mt-6"}`}
          />
        </div>
      </div>

      {/* Mobile-only: search + selected filters — scrolls normally, not sticky */}
      <div className="md:hidden px-6 sm:px-10 lg:px-16 pt-2 pb-6">
        <div className="group relative w-full">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={tr("searchPlaceholder")}
            className="h-11 w-full border border-gray-200 bg-gray-50/60 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={tr("clearSearch")}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {(activeSpecies || activeTopic.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {activeSpecies && (
              <FilterChip label={getBlogField(activeSpecies, "name", isFr)} />
            )}
            {activeTopic.map((t) => (
              <FilterChip key={t.id} label={getBlogField(t, "name", isFr)} />
            ))}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] font-semibold text-gray-900 underline underline-offset-2 cursor-pointer"
            >
              {tr("resetAll")}
            </button>
          </div>
        )}
      </div>

      <div className="px-6 sm:px-10 lg:px-16">
        {!isSearching &&
          (loading || isSearchPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ArticleRowSkeleton key={i} visibleCount={columns || 1} />
            ))
          ) : (
            <>
              <ArticleRow
                label={tr("sectionLabels.recommended")}
                type="recommended"
                icon={FaRegStar}
                items={sections.recommended}
                isFr={isFr}
                activeSpecies={activeSpecies}
                activeTopic={activeTopic}
              />
              <ArticleRow
                label={tr("sectionLabels.trending")}
                type="trending"
                icon={GoFlame}
                items={sections.trending}
                isFr={isFr}
                activeSpecies={activeSpecies}
                activeTopic={activeTopic}
              />
              <ArticleRow
                label={tr("sectionLabels.mostLiked")}
                type="like"
                icon={CiHeart}
                items={sections.most_liked}
                isFr={isFr}
                activeSpecies={activeSpecies}
                activeTopic={activeTopic}
              />
              <ArticleRow
                label={tr("sectionLabels.recentlyAdded")}
                type="recent"
                icon={GoClock}
                items={sections.recently_added}
                isFr={isFr}
                activeSpecies={activeSpecies}
                activeTopic={activeTopic}
              />
              {/* <ArticleRow label="Pet Blogs" type="pet" icon={FaRegStar} items={sections.pet} isFr={isFr} /> */}
            </>
          ))}

        {/* All Articles */}
        <div id="all-articles-section" className="scroll-mt-28 pb-16">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-gray-900 uppercase">
              {tr("sectionLabels.allArticles")}
            </p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              {tr("entries", { count: String(totalArticles).padStart(2, "0") })}
            </p>
          </div>

          {loading || isSearchPending ? (
            <div className={CARD_GRID}>
              {Array.from({ length: perPage || 8 }).map((_, i) => (
                <AllArticlesCardSkeleton key={i} />
              ))}
            </div>
          ) : allArticles.length === 0 ? (
            <p className="text-sm text-gray-500 py-54 mt-5 text-center">
              {tr("noArticlesMatch")}
            </p>
          ) : (
            <>
              <div className={CARD_GRID}>
                {allArticles.map((a) => {
                  const navigateToArticle = () => {
                    const keyword = isFr
                      ? a.french_seo_keyword || a.english_seo_keyboard
                      : a.english_seo_keyboard || a.french_seo_keyword;
                    const parts = [];
                    if (activeSpecies) parts.push(getBackPart(activeSpecies));
                    if (activeTopic?.length) activeTopic.forEach((t) => parts.push(getBackPart(t)));
                    try { sessionStorage.setItem("adviceBack", JSON.stringify({ parts, url: "/advices" })); } catch {}
                    startTopLoader();
                    router.push(`/advices/${encodeURIComponent(keyword)}`);
                  };
                  const imgSrc = a.image
                    ? `${MEDIA_URL}${a.image}`
                    : getBlogImage(a)
                      ? `${MEDIA_URL}${getBlogImage(a)}`
                      : "/cat.png";

                  return (
                    <Fragment key={a.id}>
                      {/* Mobile (below md): same look as the Trending/Recommended cards */}
                      <div
                        onClick={navigateToArticle}
                        className="md:hidden border border-gray-200 cursor-pointer group overflow-hidden flex flex-col"
                      >
                        <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          </div>
                          <img
                            src={imgSrc}

                            onLoad={(e) => e.currentTarget.previousSibling?.remove()}
                            className="relative z-10 w-full h-full grayscale object-cover group-hover:scale-105 transition-transform duration-300 hover:grayscale-0"
                          />
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between gap-3 flex-1">
                          <p className="text-xs font-bold uppercase text-gray-900 leading-normal line-clamp-2 flex-1">
                            {getBlogField(a, "name", isFr)}
                          </p>
                          <HiOutlineArrowUpRight className="shrink-0 mt-0.5 text-gray-700 w-4 h-4" />
                        </div>
                      </div>

                      {/* Desktop (md and up): unchanged existing look */}
                      <div onClick={navigateToArticle} className="hidden md:block cursor-pointer">
                        <div className="relative w-full aspect-[5/6] overflow-hidden mb-3 bg-gray-200">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          </div>
                          <img
                            src={imgSrc}

                            onLoad={(e) => e.currentTarget.previousSibling?.remove()}
                            className="relative z-10 w-full h-full object-cover grayscale transition-transform duration-300 hover:scale-105 cursor-pointer hover:grayscale-0"
                          />
                        </div>
                        <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
                          {getCategoryName(a, isFr) || tr("pets")}
                        </p>
                        <h3 className="text-sm font-bold uppercase text-gray-900 leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
                          {getBlogField(a, "name", isFr)}
                        </h3>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{a.company_name || "Biogance"}</span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {tr("minShort", { time: a.reading_time || "0" })}
                          </span>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
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
                    {loadingMore ? tr("loading") : tr("loadMore")}
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
