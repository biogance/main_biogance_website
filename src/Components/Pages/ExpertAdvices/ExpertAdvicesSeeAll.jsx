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
import { sanitizeSeoKeyword } from "../../../utils/seoKeyword";
import { FaArrowLeft } from "react-icons/fa";

const CARD_GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-8";
const COLUMN_BREAKPOINTS = [
  { minWidth: 1536, columns: 5 },
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];
// Descriptive URL slugs for the "See All" pages — must match the map in
// src/app/advices/[slug]/page.jsx and ExpertAdvices.jsx's SEE_ALL_SLUGS.
const SEE_ALL_SLUGS = {
  recommended: "recommended-pet-care",
  trending: "trending-pet-care",
  like: "most-liked-pet-care",
  recent: "latest-pet-care",
  pet: "pet-care-blogs",
};
const ROWS_PER_PAGE = 3;
// Single-column (mobile) layout loads a flat 15 cards per page instead of
// columns * ROWS_PER_PAGE (which would be just 1 * 3 = 3).
const MOBILE_PER_PAGE = 15;
// Fixed header shrinks from 104px to 64px on small screens once the
// announcement bar scrolls away (see Navbar.jsx) — match whichever is live.
const getNavbarHeight = () =>
  typeof window !== "undefined" && window.innerWidth >= 1024 ? 104 : 64;

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

// Stores both language variants of a species/topic name so the "Back to X"
// label on ExpertAdvicesDetail can re-render in whichever language is active
// at read time, instead of freezing the label in the language captured here.
function getBackPart(item) {
  return { name: item?.name ?? "", frenchName: item?.french_name ?? "" };
}

// Compares a carried-over filter (from a "See All" click) against a cached
// filter snapshot for the same type — species by id, topics by id set
// (order-independent) — so a refetch is only forced when the filter
// actually differs from what's cached.
function isSameFilter(a, b) {
  const aSpeciesId = a?.activeSpecies?.id ?? null;
  const bSpeciesId = b?.activeSpecies?.id ?? null;
  if (aSpeciesId !== bSpeciesId) return false;
  const aTopics = (a?.activeTopic ?? []).map((t) => t.id).sort().join(",");
  const bTopics = (b?.activeTopic ?? []).map((t) => t.id).sort().join(",");
  return aTopics === bTopics;
}

function Shimmer({ className = "" }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
        active
          ? "bg-gray-900 border-gray-900 text-white"
          : "bg-white border-gray-300 text-gray-700 hover:border-gray-900"
      }`}
    >
      {label}
    </button>
  );
}

function ScrollableTabsRow({ items, activeIds = [], onSelect }) {
  const { t: tr } = useTranslation("expertadvice");
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // With multiple topics active, querying "[data-active]" alone always
  // returns the first one in DOM order — not whichever one the user just
  // clicked. Tracking the actual click keeps the just-selected tab (even one
  // near the end) in view instead of jumping back to an earlier active tab.
  const lastClickedIdRef = useRef(null);
  const handleSelect = (id) => {
    lastClickedIdRef.current = id;
    onSelect(id);
  };

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

  // Active topic visible karo on mount (back navigation restore)
  useEffect(() => {
    requestAnimationFrame(() => {
      const track = scrollRef.current;
      if (!track) return;
      const clickedId = lastClickedIdRef.current;
      const activeEl =
        (clickedId != null &&
          track.querySelector(`[data-topic][data-id="${CSS.escape(String(clickedId))}"]`)) ||
        track.querySelector("[data-topic][data-active]");
      if (!activeEl) return;
      // Jab row overflow ho rahi ho, scroll arrow buttons (w-8 + gap-2)
      // is measurement ke baad mount hote hain — unki width pehle se
      // reserve kar lo taake active tab uske peeche half-cut na ho.
      const ARROW_RESERVE = 40;
      const overflowing = track.scrollWidth > track.clientWidth + 4;
      const trackRect = track.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const leftBound = trackRect.left + (overflowing ? ARROW_RESERVE : 0);
      const rightBound = trackRect.right - (overflowing ? ARROW_RESERVE : 0);
      if (elRect.left < leftBound) {
        track.scrollLeft -= leftBound - elRect.left + 8;
      } else if (elRect.right > rightBound) {
        track.scrollLeft += elRect.right - rightBound + 8;
      }
    });
  }, [items]);

  const scrollByOne = (direction) => {
    const track = scrollRef.current;
    if (!track) return;
    const topics = Array.from(track.querySelectorAll("[data-topic]"));
    if (!topics.length) return;
    const viewLeft = track.scrollLeft;
    const viewRight = viewLeft + track.clientWidth;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const visibleTopics = topics.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.right > track.getBoundingClientRect().left && r.left < track.getBoundingClientRect().right;
    });
    const step = Math.max(visibleTopics.length, 4);

    if (direction === 1) {
      const targets = topics.filter((el) => el.offsetLeft + el.offsetWidth > viewRight + 1);
      const target = targets[Math.min(3, targets.length - 1)];
      if (target) {
        track.scrollTo({
          left: Math.min(target.offsetLeft + target.offsetWidth - track.clientWidth, maxScroll),
          behavior: "smooth",
        });
      } else {
        track.scrollTo({ left: maxScroll, behavior: "smooth" });
      }
    } else {
      const targets = [...topics].reverse().filter((el) => el.offsetLeft < viewLeft - 1);
      const target = targets[Math.min(3, targets.length - 1)];
      if (target) {
        track.scrollTo({
          left: Math.max(target.offsetLeft, 0),
          behavior: "smooth",
        });
      } else {
        track.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative flex items-stretch gap-2 min-w-0">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByOne(-1)}
          aria-label={tr("scrollLeft")}
          className="shrink-0 w-6.5 bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
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
          className="flex items-center gap-2 overflow-x-auto overflow-y-visible scroll-smooth min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const isActive = activeIds.includes(item.id);
            return (
              <div
                key={item.id}
                data-topic
                data-id={item.id}
                {...(isActive ? { "data-active": "" } : {})}
                className="shrink-0"
              >
                <TabButton
                  label={item.label}
                  active={isActive}
                  onClick={() => handleSelect(item.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByOne(1)}
          aria-label={tr("scrollRight")}
          className="shrink-0 w-6.5 bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function ScrollableChipRow({ tabs }) {
  const scrollRef = useRef(null);

  // Active chip visible karo on mount (back navigation restore)
  useEffect(() => {
    requestAnimationFrame(() => {
      const track = scrollRef.current;
      if (!track) return;
      const activeEl = track.querySelector("[data-active]");
      if (!activeEl) return;
      const trackRect = track.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      if (elRect.left < trackRect.left) {
        track.scrollLeft -= trackRect.left - elRect.left + 8;
      } else if (elRect.right > trackRect.right) {
        track.scrollLeft += elRect.right - trackRect.right + 8;
      }
    });
  }, [tabs]);

  return (
    <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto overflow-y-visible scroll-smooth min-w-0 py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <div key={tab.key} data-chip {...(tab.active ? { "data-active": "" } : {})} className="shrink-0">
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
  // Real TabButton: px-3.5 py-1.5 text-[9px] → ~h-7; real desktop search input: h-9; real mobile search: h-11
  return (
    <div className="sticky top-[64px] scroll-mt-[64px] lg:top-[104px] lg:scroll-mt-[104px] z-30 bg-white/95 backdrop-blur transform-gpu will-change-transform">
      <div className="px-6 sm:px-10 lg:px-16 pt-3 md:mb-6">
        {/* Mobile (below md): species chip row, then topics chip row */}
        <div className="md:hidden flex items-center gap-2 overflow-hidden py-0.5">
          {Array.from({ length: Math.min(speciesCount, 4) }).map((_, i) => (
            <Shimmer key={i} className="h-7 w-20 shrink-0" />
          ))}
        </div>
        <div className="md:hidden mt-2 flex items-center gap-2 overflow-hidden py-0.5">
          {Array.from({ length: Math.min(topicsCount, 5) }).map((_, i) => (
            <Shimmer key={i} className="h-7 w-16 shrink-0" />
          ))}
        </div>

        {/* Desktop (md and up): species tabs + search input (h-9), then topics row */}
        <div className="hidden md:block">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-1">
            <div className="flex flex-wrap items-center gap-2 md:flex-1 md:min-w-0">
              {Array.from({ length: speciesCount }).map((_, i) => (
                <Shimmer key={i} className="h-7 w-24" />
              ))}
            </div>
            {/* Search input shimmer — same h-9 as the real input */}
            <Shimmer className="h-9 w-full md:w-72 shrink-0 mb-3 md:mb-0" />
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <Shimmer key={i} className="h-7 w-20 shrink-0" />
            ))}
          </div>
        </div>

        <div className="mt-3 h-px bg-gray-200" />
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
  const getSplashCategories = () => {
    try {
      let raw = localStorage.getItem("splashData");
      if (!raw) return [];
      let parsed = JSON.parse(raw);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      return parsed?.data?.categories ?? parsed?.categories ?? [];
    } catch {
      return [];
    }
  };
  const [splashCategories, setSplashCategories] = useState([]);
  useEffect(() => {
    setSplashCategories(getSplashCategories());
    // PageLoader's callSplashApi() writes "splashData" to localStorage
    // asynchronously and only then fires this event — if that write lands
    // after this mount-read, categories/topics would otherwise stay empty
    // for the rest of the page's life since this effect never re-runs.
    const onSplashReady = () => setSplashCategories(getSplashCategories());
    window.addEventListener("splashDataReady", onSplashReady);
    return () => window.removeEventListener("splashDataReady", onSplashReady);
  }, []);

  // One-time carry-over from ExpertAdvices.jsx's "See All" click — consumed
  // (and removed) immediately so it never leaks into an unrelated later
  // navigation. Takes priority over cachedState: cachedState persists for
  // this type across the whole session, so without this a fresh "See All"
  // click with a newly-changed filter would otherwise keep showing whatever
  // filter was cached from an earlier visit to this same type.
  const [carriedFilter] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("seeAllInitialFilter");
      if (stored) {
        sessionStorage.removeItem("seeAllInitialFilter");
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  // carriedFilter's own fields are authoritative once it exists at all — a
  // "??" chained straight through carriedFilter?.activeSpecies would treat a
  // legitimately-cleared (null) species as "not provided" and wrongly fall
  // back to a stale cached species instead of respecting "no filter".
  const [activeSpecies, setActiveSpecies] = useState(
    carriedFilter
      ? (carriedFilter.activeSpecies ?? null)
      : (cachedState?.activeSpecies ?? null),
  );
  const [activeTopic, setActiveTopic] = useState(
    carriedFilter
      ? (carriedFilter.activeTopic ?? [])
      : (cachedState?.activeTopic ?? []),
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

  const mobileTopicTabs = [
    {
      key: "topic-all",
      label: tr("all"),
      active: activeTopic.length === 0,
      onClick: () => setActiveTopic([]),
    },
    ...topicsList.map((t) => ({
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
    })),
  ];

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
  // No cache yet → always fetch. Cache exists → only refetch if a fresh
  // carriedFilter actually differs from what's cached; if it's the same
  // filter (or there's no carriedFilter, e.g. plain back-navigation), reuse
  // the cached articles as-is with no API call.
  const willRefetchOnMount =
    !cachedState ||
    (!!carriedFilter && !isSameFilter(carriedFilter, cachedState));
  const [loading, setLoading] = useState(willRefetchOnMount);

  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(cachedState?.page ?? 1);
  const [hasMore, setHasMore] = useState(cachedState?.hasMore ?? false);

  const columns = useResponsiveColumns();
  const perPage = columns
    ? columns === 1
      ? MOBILE_PER_PAGE
      : columns * ROWS_PER_PAGE
    : 0;
  const hasLoadedOnceRef = useRef(!!cachedState);
  const skipInitialFetchRef = useRef(!willRefetchOnMount);

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

  // Track scroll position continuously (not just read once at unmount) —
  // by the time an unmount cleanup runs after a route change, the browser/
  // Next.js has often already reset window.scrollY to 0, so reading it then
  // would always capture 0 instead of where the user actually was.
  // Snapshot scroll position on every click's capture phase — which runs
  // before React's (bubble-phase) onClick, i.e. before router.push. Deliberately
  // NOT a passive "scroll" listener: router.push resets window.scrollY to 0
  // synchronously as part of starting the navigation, still within the same
  // click, and that reset itself fires a "scroll" event — so a scroll listener
  // sharing this ref would just get overwritten back to 0 by that event right
  // after the correct value was captured, before the component ever unmounts.
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    const captureScroll = () => {
      lastScrollYRef.current = window.scrollY;
    };
    captureScroll();
    document.addEventListener("click", captureScroll, true);
    return () => document.removeEventListener("click", captureScroll, true);
  }, []);

  // Capture that last-known scroll position at the moment we navigate away
  // (article click, back to ExpertAdvices, etc.) so returning via back
  // button lands where the user left off instead of resetting to the top —
  // window.history.scrollRestoration is forced to "manual" (see
  // ExpertAdvicesDetail.jsx) so the browser won't do this on its own.
  useEffect(() => {
    return () => {
      const current = seeAllStateCache.get(type);
      if (current) current.scrollY = lastScrollYRef.current;
    };
  }, [type]);

  // Restore that position only once columns (real grid layout/page height)
  // have resolved, and only when we're reusing cached results rather than
  // fetching a fresh carried-over filter — a fresh filter has no meaningful
  // old scroll position to return to.
  const scrollRestoredRef = useRef(false);
  useEffect(() => {
    if (
      scrollRestoredRef.current ||
      !columns ||
      willRefetchOnMount ||
      cachedState?.scrollY == null
    )
      return;
    scrollRestoredRef.current = true;
    requestAnimationFrame(() => {
      window.scrollTo({ top: cachedState.scrollY });
    });
  }, [columns, cachedState, willRefetchOnMount]);

  // Jab user category/topic choose kare ya search kare aur woh page pe neeche
  // scrolled ho, to filters ke "stuck" (navbar ke sath chipke) position tak
  // upar scroll ho jaye — taake naya data nazar aa jaye.
  const isFirstSearchRender = useRef(true);
  const scrollToFilters = useCallback(() => {
    const filters = filtersRef.current;
    if (!filters) return;
    const targetY = filters.offsetTop - getNavbarHeight();
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



  const getItemHref = (item) => {
    const keyword = sanitizeSeoKeyword(
      isFr
        ? item.french_seo_keyword || item.english_seo_keyboard
        : item.english_seo_keyboard || item.french_seo_keyword,
    );
    return `/advices/${encodeURIComponent(keyword)}`;
  };

  const navigateToDetail = (item) => {
    const species = activeSpecies ? getBackPart(activeSpecies) : null;
    const topics = activeTopic?.length ? activeTopic.map(getBackPart) : [];
    try {
      sessionStorage.setItem(
        "adviceBack",
        JSON.stringify({
          species,
          topics,
          typeKey: type,
          url: `/advices/${SEE_ALL_SLUGS[type] || type}`,
        }),
      );
    } catch {}
    startTopLoader();
    router.push(getItemHref(item));
  };

  if (loading && !hasLoadedOnceRef.current) {
    return (
      <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
        <Navbar bgWhite={true} />

        {/* Back link — arrow icon is square, not circle */}
        <div className="px-6 sm:px-10 lg:px-16 pt-4 pb-2 sm:pt-10 sm:pb-4">
          <div className="inline-flex items-center gap-1.5">
            <Shimmer className="w-3.5 h-3.5" />
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

        {/* Mobile-only search bar — h-11 matches the real mobile input */}
        <div className="md:hidden px-6 sm:px-10 lg:px-16 pt-3 pb-3">
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
          {tr("backTo", { label: tr("advicesSuffix") })}
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
  className="sticky top-[64px] scroll-mt-[64px] lg:top-[104px] lg:scroll-mt-[104px] z-30 transform-gpu will-change-transform"
>

  <div className="absolute -inset-x-0 -top-px -bottom-px bg-white/95 backdrop-blur -z-10" />

 
        <div className="px-6 sm:px-10 lg:px-16 pt-3 md:mb-6">
          {/* ── Mobile filters (below md) — only the tabs stay sticky; search moves below ── */}
          <div className="md:hidden">
            <ScrollableChipRow tabs={mobileSpeciesTabs} />
            <div className="mt-2">
              <ScrollableChipRow tabs={mobileTopicTabs} />
            </div>
          </div>

          {/* ── Desktop filters (md and up) ── */}
          <div className="hidden md:block">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-1 -mt-1">
              <div className="md:flex-1 md:min-w-0">
                <ScrollableTabsRow
                  items={speciesList.map((cat) => ({
                    id: cat.id,
                    label: getBlogField(cat, "name", isFr),
                  }))}
                  activeIds={activeSpecies ? [activeSpecies.id] : []}
                  onSelect={(id) => {
                    const found = speciesList.find((cat) => cat.id === id);
                    if (!found) return;
                    setActiveSpecies((prev) =>
                      prev?.id === found.id ? null : found,
                    );
                    setActiveTopic([]);
                  }}
                />
              </div>

              <div className="group relative w-full md:w-72 shrink-0 mb-3 md:mb-0">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={tr("searchPlaceholder")}
                  className="h-9 mb-1 w-full border border-gray-300 pl-9 pr-8 text-xs text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:bg-white focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label={tr("clearSearch")}
                    className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <ScrollableTabsRow
              items={[
                { id: "all", label: tr("all") },
                ...topicsList.map((t) => ({
                  id: t.id,
                  label: getBlogField(t, "name", isFr),
                })),
              ]}
              activeIds={
                activeTopic.length === 0 ? ["all"] : activeTopic.map((t) => t.id)
              }
              onSelect={(id) => {
                if (id === "all") {
                  setActiveTopic([]);
                  return;
                }
                const found = topicsList.find((t) => t.id === id);
                if (!found) return;
                setActiveTopic((prev) =>
                  prev.find((t) => t.id === found.id)
                    ? prev.filter((t) => t.id !== found.id)
                    : [...prev, found],
                );
              }}
            />
          </div>

            <hr className="border-t border-gray-200 mt-3 md:mt-3" />
        </div>
      </div>

      {/* Mobile-only: search + selected filters — scrolls normally, not sticky */}
      <div className="md:hidden px-6 sm:px-10 lg:px-16 pt-3 pb-3">
        <div className="group relative w-full">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={tr("searchPlaceholder")}
            className="h-11 mb-1 w-full border border-gray-200 bg-gray-50/60 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={tr("clearSearch")}
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <FiX className="h-3 w-3" />
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
                <a
                  key={a.id}
                  href={getItemHref(a)}
                  onClick={(e) => {
                    // Ctrl/Cmd/Shift+click (and native middle-click) must fall
                    // through to the browser's own "open in new tab/window"
                    // behavior — only a plain left click runs the SPA navigation.
                    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                    e.preventDefault();
                    navigateToDetail(a);
                  }}
                  className="border border-gray-200 cursor-pointer group overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                    <img
                      src={
                        getBlogImage(a)
                          ? `${MEDIA_URL}${getBlogImage(a)}`
                          : "/cat.png"
                      }
                      onLoad={(e) => {
                        e.currentTarget.previousSibling?.remove();
                        e.currentTarget.classList.remove("opacity-0");
                      }}
                      className="relative z-10 w-full h-full grayscale object-cover group-hover:scale-105 group-hover:grayscale-0 transition-transform duration-700 opacity-0"
                    />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-3 flex-1">
                    <p className="text-xs font-bold uppercase text-gray-900 leading-normal line-clamp-2 flex-1 group-hover:underline underline-offset-2">
                      {getBlogField(a, "name", isFr)}
                    </p>
                    <HiOutlineArrowUpRight className="shrink-0 mt-0.5 -mr-0.5 text-gray-700 w-4 h-4" />
                  </div>
                </a>
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
