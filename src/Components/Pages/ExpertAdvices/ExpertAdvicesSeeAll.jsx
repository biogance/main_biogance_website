"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { startTopLoader } from "../TopLoader";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { FaArrowLeft } from "react-icons/fa";

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

// In-memory cache (module scope, not sessionStorage) so filters + results
// survive a soft navigation to ExpertAdvicesDetail and back, but reset on a
// real browser refresh — a true reload re-evaluates this module from scratch.
const seeAllStateCache = new Map();

// Maps the "type" query param (what blog/list expects) to the section's i18n label key.
const TYPE_LABEL_KEYS = {
  recommended: "sectionLabels.recommended",
  trending: "sectionLabels.trending",
  like: "sectionLabels.mostLiked",
  recent: "sectionLabels.recentlyAdded",
  pet: "sectionLabels.petBlogs",
};

function getAuthHeaders() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    if (loginData?.data?.token)
      return { Authorization: `Bearer ${loginData.data.token}` };
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

function getBlogImage(item) {
  return item?.images?.[0]?.media ?? item?.image ?? null;
}

function getBlogField(item, field, isFr) {
  if (!item) return "";
  const frField = `french_${field}`;
  return isFr && item[frField] ? item[frField] : (item[field] ?? "");
}

function Shimmer({ className = "" }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
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
    const viewLeft = track.scrollLeft;
    const viewRight = viewLeft + track.clientWidth;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (direction === 1) {
      const next = topics.find(
        (el) => el.offsetLeft + el.offsetWidth > viewRight + 1,
      );
      if (next) {
        track.scrollTo({
          left: Math.min(
            next.offsetLeft + next.offsetWidth - track.clientWidth,
            maxScroll,
          ),
          behavior: "smooth",
        });
      } else {
        track.scrollTo({ left: maxScroll, behavior: "smooth" });
      }
    } else {
      const prev = [...topics]
        .reverse()
        .find((el) => el.offsetLeft < viewLeft - 1);
      if (prev) {
        track.scrollTo({
          left: Math.max(prev.offsetLeft, 0),
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
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
      )}
      <div
        className="relative min-w-0 flex-1"
        // style={{
        //   WebkitMaskImage: `linear-gradient(to right, ${canScrollLeft ? "transparent" : "black"} 0, black 24px, black calc(100% - 24px), ${canScrollRight ? "transparent" : "black"} 100%)`,
        //   maskImage: `linear-gradient(to right, ${canScrollLeft ? "transparent" : "black"} 0, black 24px, black calc(100% - 24px), ${canScrollRight ? "transparent" : "black"} 100%)`,
        // }}
      >
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
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-300  flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
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

function AllArticlesCardSkeleton() {
  return (
    <div className="border border-gray-200 overflow-hidden flex flex-col">
      <Shimmer className="w-full h-60 rounded-none" />
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
        <Shimmer className="w-4 h-4 shrink-0" />
      </div>
    </div>
  );
}

function FiltersSkeleton({ speciesCount = 4, topicsCount = 6 }) {
  return (
    <div className="sticky top-[95px] scroll-mt-[104px] z-30 bg-white">
      <div className="px-6 sm:px-10 lg:px-16 pt-3 md:pt-8 pb-3 md:pb-7">
        {/* Mobile (below md): species chip row, then topics chip row */}
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

        {/* Desktop (md and up): species tabs + search, then topics row */}
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

function ExpertAdvicesSeeAll({ type: typeProp }) {
  const { t: tr, i18n } = useTranslation("expertadvice");
  const isFr = i18n.language?.startsWith("fr");
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = typeProp ?? searchParams.get("type") ?? "trending";
  const sectionLabel = TYPE_LABEL_KEYS[type] ? tr(TYPE_LABEL_KEYS[type]) : tr("articles");
  const cachedState = useRef(seeAllStateCache.get(type)).current;

  const filtersRef = useRef(null);
  const searchTimerRef = useRef(null);

  // ── Splash data (same as ExpertAdvices.jsx) ─────────────────────────────
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

  const [activeSpecies, setActiveSpecies] = useState(
    cachedState?.activeSpecies ?? null,
  );
  const [activeTopic, setActiveTopic] = useState(
    cachedState?.activeTopic ?? [],
  );
  const speciesList = splashCategories;

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

  const [searchInput, setSearchInput] = useState(
    cachedState?.searchInput ?? "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    cachedState?.debouncedSearch ?? "",
  );
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

  const [articles, setArticles] = useState(cachedState?.articles ?? []);
  const [totalArticles, setTotalArticles] = useState(
    cachedState?.totalArticles ?? 0,
  );
  const [loading, setLoading] = useState(!cachedState);

  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(cachedState?.page ?? 1);
  const [hasMore, setHasMore] = useState(cachedState?.hasMore ?? false);

  const columns = useResponsiveColumns();
  const perPage = columns ? columns * ROWS_PER_PAGE : 0;
  const hasLoadedOnceRef = useRef(!!cachedState);
  const skipInitialFetchRef = useRef(!!cachedState);

  const fetchArticles = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const body = {
          ...getAuthBody(),
          type,
          collection_id: activeSpecies?.id,
          per_page: perPage,
          page: pageNum,
        };
        if (activeTopic.length)
          body.topic_id = activeTopic.map((t) => t.id).join(",");
        if (debouncedSearch.trim()) body.keyword = debouncedSearch.trim();

        const res = await axios.post(`${BASE_URL}/blog/list`, body, {
          headers: { ...getAuthHeaders() },
        });

        if (!res.data.status) {
          toast.error(res.data.action || "Something went wrong.");
          return;
        }

        const d = res.data.data;
        const items = d?.data ?? [];
        setArticles((prev) =>
          pageNum === 1 ? items : append ? [...prev, ...items] : items,
        );
        setTotalArticles(d?.total ?? 0);
        setHasMore((d?.current_page ?? pageNum) < (d?.last_page ?? pageNum));
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsSearchPending(false);
        hasLoadedOnceRef.current = true;
      }
    },
    [type, activeSpecies, activeTopic, debouncedSearch, perPage],
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
    fetchArticles(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // Reset to page 1 when filters/search/type actually change (columns intentionally excluded).
  const isFirstFilterEffectRef = useRef(true);
  useEffect(() => {
    if (isFirstFilterEffectRef.current) {
      isFirstFilterEffectRef.current = false;
      return;
    }
    if (!columns) return;
    setPage(1);
    fetchArticles(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, activeSpecies, activeTopic, debouncedSearch]);

  // Keep the restore-on-back-navigation cache in sync with the latest filters/results.
  useEffect(() => {
    seeAllStateCache.set(type, {
      activeSpecies,
      activeTopic,
      searchInput,
      debouncedSearch,
      articles,
      totalArticles,
      page,
      hasMore,
    });
  }, [
    type,
    activeSpecies,
    activeTopic,
    searchInput,
    debouncedSearch,
    articles,
    totalArticles,
    page,
    hasMore,
  ]);

  // Jab user category/topic choose kare ya search kare aur woh page pe neeche
  // scrolled ho, to filters ke "stuck" (navbar ke sath chipke) position tak
  // upar scroll ho jaye — taake naya data nazar aa jaye.
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
    fetchArticles(next, true);
  };

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

  const navigateToDetail = (item) => {
    const keyword = isFr
      ? item.french_seo_keyword || item.english_seo_keyboard
      : item.english_seo_keyboard || item.french_seo_keyword;
    const parts = [];
    if (activeSpecies) parts.push(getBlogField(activeSpecies, "name", isFr));
    if (activeTopic?.length)
      activeTopic.forEach((t) => parts.push(getBlogField(t, "name", isFr)));
    const backLabel = parts.length
      ? parts.join(" & ") + " " + tr("advicesSuffix")
      : sectionLabel + " " + tr("advicesSuffix");
    try { sessionStorage.setItem("adviceBack", JSON.stringify({ label: backLabel, url: `/advices/${type}` })); } catch {}
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  if (loading && !hasLoadedOnceRef.current) {
    return (
      <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
        <Navbar bgWhite={true} />

        {/* Back link */}
        <div className="px-6 sm:px-10 lg:px-16 pt-4 pb-2 sm:pt-10 sm:pb-4">
          <div className="inline-flex items-center gap-1.5">
            <Shimmer className="w-3.5 h-3.5 rounded-full" />
            <Shimmer className="h-3 w-24" />
          </div>
        </div>

        {/* Section label (moved above filters) */}
        <div className="px-6 sm:px-10 lg:px-16 pb-3 sm:pb-6">
          <Shimmer className="h-5 sm:h-8 lg:h-10 w-48 sm:w-64 lg:w-80" />
        </div>

        <FiltersSkeleton
          speciesCount={Math.max(speciesList.length, 4)}
          topicsCount={6}
        />

        {/* Mobile-only search bar — mirrors the block below the sticky filters */}
        <div className="md:hidden px-6 sm:px-10 lg:px-16 pt-2 pb-6">
          <Shimmer className="h-11 w-full" />
        </div>

        <div className="px-6 sm:px-10 lg:px-16 ">
          <div className={CARD_GRID}>
            {Array.from({ length: perPage || 6 }).map((_, i) => (
              <AllArticlesCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Back link */}
      <div className="px-6 sm:px-10 lg:px-16 pt-4 pb-2 sm:pt-10 sm:pb-4">
        <Link
          href="/advices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-500 transition-colors"
        >
          <FaArrowLeft className="w-3.5 h-3.5" />
          {tr("backToAdvices")}
        </Link>
      </div>

      {/* Section label — moved above the filters */}
      <div className="px-6 sm:px-10 lg:px-16 pb-3 sm:pb-6">
        <p className="text-lg sm:text-3xl lg:text-[40px] font-bold font-serif tracking-widest text-gray-900 uppercase">
          {sectionLabel}
        </p>
      </div>

      {/* Sticky Filters — moved below the section label */}
      <div
        ref={filtersRef}
        className="sticky top-[95px] scroll-mt-[104px] z-30 bg-white"
      >
        <div
          className={`px-6 sm:px-10 lg:px-16 pt-3 md:pt-8 transition-[padding-bottom] duration-300 ease-out ${isStuck ? "pb-0" : "pb-3 md:pb-7"}`}
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

      {/* Articles grid — same card design as ExpertAdvices.jsx's Recommended/Trending rows (ArticleRow) */}
      <div className="px-6 sm:px-10 lg:px-16 pb-16">
        {loading || isSearchPending ? (
          <div className={CARD_GRID}>
            {Array.from({ length: perPage || 8 }).map((_, i) => (
              <AllArticlesCardSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500 py-54 mt-5 text-center">
            {tr("noArticlesMatch")}
          </p>
        ) : (
          <>
            <div className={CARD_GRID}>
              {articles.map((a) => (
                <div
                  key={a.id}
                  onClick={() => navigateToDetail(a)}
                  className="border border-gray-200 cursor-pointer group overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                    <img
                      src={
                        getBlogImage(a)
                          ? `${MEDIA_URL}${getBlogImage(a)}`
                          : "/cat.png"
                      }
                      alt={getBlogField(a, "name", isFr)}
                      className="w-full h-full grayscale object-cover group-hover:scale-105 transition-transform duration-300 hover:grayscale-0"
                    />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-3 flex-1">
                    <p className="text-xs font-bold uppercase text-gray-900 leading-normal line-clamp-2 flex-1">
                      {getBlogField(a, "name", isFr)}
                    </p>
                    <HiOutlineArrowUpRight className="shrink-0 mt-0.5 text-gray-700 w-4 h-4" />
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
                  {loadingMore ? tr("loading") : tr("loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ExpertAdvicesSeeAll;
