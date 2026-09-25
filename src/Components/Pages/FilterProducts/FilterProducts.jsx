"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LuChevronDown,
  LuSearch,
  LuX,
  LuSlidersHorizontal,
  LuHeart,
  LuArrowUpRight,
  LuCheck,
  LuArrowLeft,
  LuSparkles,
  LuAward,
  LuFlame,
  LuMegaphone,
  LuBookOpen,
  LuArrowRight,
  LuArrowDownUp,
  LuHouse,
  LuRotateCcw,
} from "react-icons/lu";

import Navbar from "../Navbar";
import Footer from "../Footer";
import { LandingCards } from "../Landing/LandingCards";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "@/utils/deviceId";

// Fixed navbar height (matches the `mt-[104px]` / `top-[104px]` used across this page).
const NAVBAR_HEIGHT = 104;

// Same typefaces as the home page hero (MainVideo.jsx), used by the shop hero.
const SHOP_FONT = "'Outfit', 'Sora', system-ui, -apple-system, sans-serif";
const SHOP_FONT_SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";

// Matches the restProducts grid's actual column counts (grid-cols-2 below md,
// md:grid-cols-3, lg:grid-cols-3, xl:grid-cols-4) — same responsive-per_page
// approach as ExpertAdvices.jsx, so a fetched page always fills whole rows.
const COLUMN_BREAKPOINTS = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 768, columns: 3 },
  { minWidth: 0, columns: 2 },
];
const ROWS_PER_PAGE = 3;

function useResponsiveColumns() {
  const [columns, setColumns] = useState(2);
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

// ───────────── Data Model ─────────────
const FALLBACK_CATEGORIES = [
  { id: 10, name: "Dogs", sub_categories: [] },
  { id: 20, name: "Puppies", sub_categories: [] },
  { id: 24, name: "Cats & Kittens", sub_categories: [] },
  { id: 33, name: "Small mammals", sub_categories: [] },
  { id: 37, name: "Birds & Backyard Poultry", sub_categories: [] },
  { id: 49, name: "Reptiles & Turtles", sub_categories: [] },
  { id: 84, name: "Horses", sub_categories: [] },
];

const buildTranslationMap = (apiData) => {
  const map = {};
  if (!apiData) return map;

  const traverse = (item) => {
    if (item && item.name && item.french_name) {
      map[item.name] = item.french_name;
    }
    if (item && item.sub_categories) {
      item.sub_categories.forEach(traverse);
    }
    if (item && item.breeds) {
      item.breeds.forEach(traverse);
    }
  };

  if (apiData.categories) {
    apiData.categories.forEach(traverse);
  }
  if (apiData.ranges) {
    apiData.ranges.forEach(traverse);
  }
  if (apiData.product_sizes) {
    apiData.product_sizes.forEach(traverse);
  }
  return map;
};

const getProductCategories = (product, categoriesFromApi) => {
  const name = product.name || "";
  const subtitle = product.subtitle || "";
  const text = `${name} ${subtitle}`.toLowerCase();
  const matched = [];

  for (const cat of categoriesFromApi) {
    const catName = cat.name.toLowerCase();
    const catFrenchName = (cat.french_name || "").toLowerCase();

    let shouldAdd = false;
    if (
      catName.includes("dog") &&
      (text.includes("dog") ||
        text.includes("chien") ||
        text.includes("puppy") ||
        text.includes("hound") ||
        text.includes("terrier"))
    ) {
      shouldAdd = true;
    } else if (
      catName.includes("cat") &&
      (text.includes("cat") || text.includes("chat") || text.includes("kitten"))
    ) {
      shouldAdd = true;
    } else if (
      catName.includes("horse") &&
      (text.includes("horse") ||
        text.includes("cheval") ||
        text.includes("poney") ||
        text.includes("pony"))
    ) {
      shouldAdd = true;
    } else if (
      catName.includes("bird") &&
      (text.includes("bird") ||
        text.includes("poultry") ||
        text.includes("oiseau"))
    ) {
      shouldAdd = true;
    } else if (
      catName.includes("reptile") &&
      (text.includes("reptile") ||
        text.includes("turtle") ||
        text.includes("tortue") ||
        text.includes("snake") ||
        text.includes("gecko"))
    ) {
      shouldAdd = true;
    } else if (
      catName.includes("mammal") &&
      (text.includes("rabbit") ||
        text.includes("hamster") ||
        text.includes("bunny") ||
        text.includes("guinea") ||
        text.includes("rodent") ||
        text.includes("ferret") ||
        text.includes("mammal") ||
        text.includes("rongeur"))
    ) {
      shouldAdd = true;
    } else if (catName.includes("puppies") && text.includes("puppy")) {
      shouldAdd = true;
    } else {
      if (
        text.includes(catName) ||
        (catFrenchName && text.includes(catFrenchName))
      ) {
        shouldAdd = true;
      }
    }

    if (shouldAdd) {
      matched.push(cat.name);
    }
  }

  if (matched.length === 0 && categoriesFromApi.length > 0) {
    matched.push(categoriesFromApi[0].name);
  }
  return matched;
};

// Fallback constants — used only when API data hasn't loaded yet
const FALLBACK_RANGES = ["BIOGANCE", "ORGANISSIME", "PLOUF", "DERMOCARE"];
const FALLBACK_SIZES = ["50ml", "100ml", "250ml", "500ml", "1L"];
const FALLBACK_COLORS = ["#5ecae5", "#c7dd70", "#f68438", "#782472"];

// Helper: build dynamic lists from API data
function buildRangesList(apiData) {
  if (apiData?.ranges?.length) {
    return apiData.ranges.map((r) => r.name);
  }
  return FALLBACK_RANGES;
}

function buildSizesList(apiData) {
  if (apiData?.product_sizes?.length) {
    return apiData.product_sizes.map((s) => s.name);
  }
  return FALLBACK_SIZES;
}

function buildColorsList(apiData) {
  if (apiData?.product_colors?.length) {
    return apiData.product_colors.map((c) => c.name);
  }
  return FALLBACK_COLORS;
}

function buildColorSwatches(colorsList) {
  const swatches = {};
  colorsList.forEach((c) => {
    // If the color name is already a hex code (e.g. "#5ecae5"), use it directly
    // If it contains " & " (dual colors like "#94ca59 & #185f53"), use a gradient
    if (c.startsWith("#")) {
      if (c.includes(" & ")) {
        const parts = c.split(" & ").map((p) => p.trim());
        swatches[c] =
          `linear-gradient(135deg, ${parts[0]} 50%, ${parts[1]} 50%)`;
      } else {
        swatches[c] = c;
      }
    } else {
      // Fallback: use the name as-is (could be a named CSS color)
      swatches[c] = c;
    }
  });
  return swatches;
}

function toggle(arr, v) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

// Deterministic hashing helper to map filter attributes on dynamic products
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const extendProductWithFilters = (
  product,
  rangesList,
  sizesList,
  colorsList,
  categoriesFromApi,
) => {
  const name = product.name || "";
  const subtitle = product.subtitle || "";
  const text = `${name} ${subtitle}`.toLowerCase();

  const animals = getProductCategories(product, categoriesFromApi);
  const firstCategoryName = animals[0] || "Dogs";

  let range = rangesList[Math.abs(hashString(name)) % rangesList.length];
  for (const r of rangesList) {
    if (text.includes(r.toLowerCase())) {
      range = r;
      break;
    }
  }

  let size = sizesList[Math.abs(hashString(name + "size")) % sizesList.length];
  for (const s of sizesList) {
    if (text.includes(s.toLowerCase())) {
      size = s;
      break;
    }
  }

  let color =
    colorsList[Math.abs(hashString(name + "color")) % colorsList.length];
  for (const c of colorsList) {
    if (text.includes(c.toLowerCase())) {
      color = c;
      break;
    }
  }

  const catObj = categoriesFromApi.find((c) => c.name === firstCategoryName);

  // Derive universe values dynamically
  const catUniverses =
    catObj?.sub_categories?.filter((s) => s.type === "universe") || [];
  const universeObj =
    catUniverses.length > 0
      ? catUniverses[
          Math.abs(hashString(name + "universe")) % catUniverses.length
        ]
      : null;
  const universeVal = universeObj ? universeObj.name : "";

  // Derive family values dynamically from universeObj sub_categories
  const uniFamilies =
    universeObj?.sub_categories?.filter((s) => s.type === "family") || [];
  const familyObj =
    uniFamilies.length > 0
      ? uniFamilies[Math.abs(hashString(name + "family")) % uniFamilies.length]
      : null;
  const familyVal = familyObj ? familyObj.name : "";

  // Derive specificity values dynamically from familyObj sub_categories
  const famSpecs =
    familyObj?.sub_categories?.filter((s) => s.type === "specificity") || [];
  const specObj =
    famSpecs.length > 0
      ? famSpecs[Math.abs(hashString(name + "specificity")) % famSpecs.length]
      : null;
  const specVal = specObj ? specObj.name : "";

  // Derive need values dynamically from specObj sub_categories
  const specNeeds =
    specObj?.sub_categories?.filter((s) => s.type === "need") || [];
  const needObj =
    specNeeds.length > 0
      ? specNeeds[Math.abs(hashString(name + "need")) % specNeeds.length]
      : null;
  const needVal = needObj ? needObj.name : "";

  // Derive breed values dynamically
  const catBreeds = catObj?.breeds || [];
  const breedVal =
    catBreeds.length > 0
      ? catBreeds[Math.abs(hashString(name + "breed")) % catBreeds.length].name
      : "";

  // Derive for_which values dynamically
  const catForWhich =
    catObj?.sub_categories?.filter((s) => s.type === "for_which") || [];
  const forWhichVal =
    catForWhich.length > 0
      ? catForWhich[
          Math.abs(hashString(name + "forwhich")) % catForWhich.length
        ].name
      : "";

  return {
    ...product,
    animals,
    universe: universeVal,
    family: familyVal,
    specificity: specVal,
    need: needVal,
    breed: breedVal,
    forWhich: forWhichVal,
    range,
    size,
    color,
  };
};

// ───────────── Context (entry source) ─────────────
function getShopContext(source, q, categoryName, t) {
  if (categoryName) {
    return {
      key: "category",
      crumbLabel: categoryName,
      eyebrow: t("category.eyebrow", "Category · Curated collection"),
      title: categoryName,
      Icon: LuBookOpen,
      accent: "text-stone-700",
    };
  }
  switch (source) {
    case "recommended":
      return {
        key: "recommended",
        crumbLabel: t("recommended.crumbLabel", "Recommended"),
        eyebrow: t("recommended.eyebrow", "Recommended · Curated for you"),
        title: t("recommended.title", "Recommended For You"),
        Icon: LuSparkles,
        accent: "text-amber-700",
      };
    case "best":
      return {
        key: "best",
        crumbLabel: t("best.crumbLabel", "Best Products"),
        eyebrow: t("best.eyebrow", "Best products · Editor's selection"),
        title: t("best.title", "Best Seller"),
        Icon: LuAward,
        accent: "text-emerald-700",
      };
    case "popular":
      return {
        key: "popular",
        crumbLabel: t("popular.crumbLabel", "Popular This Week"),
        eyebrow: t("popular.eyebrow", "Popular this week"),
        title: t("popular.title", "Popular Products"),
        Icon: LuFlame,
        accent: "text-rose-700",
      };
    case "search":
      return {
        key: "search",
        crumbLabel: t("search.crumbLabel", "Search"),
        eyebrow: q
          ? t("search.eyebrowWithQuery", "Search results · “{{q}}”", { q })
          : t("search.eyebrow", "Search results"),
        title: q || t("search.title", "Search Results"),
        Icon: LuSearch,
        accent: "text-stone-700",
      };
    case "ads":
    case "campaign":
      return {
        key: "ads",
        crumbLabel: t("ads.crumbLabel", "Campaign"),
        eyebrow: t("ads.eyebrow", "Featured campaign"),
        title: t("ads.title", "Featured Selection"),
        Icon: LuMegaphone,
        accent: "text-indigo-700",
      };
    default:
      return {
        key: "catalogue",
        crumbLabel: t("catalogue.crumbLabel", "Catalogue"),
        eyebrow: t("catalogue.eyebrow", "Catalogue · Vol. 04"),
        title: t("catalogue.title", "All Products"),
        Icon: LuBookOpen,
        accent: "text-stone-700",
      };
  }
}

// Title + price sit directly on the image with no backing panel on the real
// card (LandingCards' overlay is `absolute bottom-0 mb-3 left-0 right-0
// px-3`, no background) — mirror that exactly instead of a solid white bar.
const CardTextShimmer = () => (
  <div
    className="absolute bottom-0 mb-3 left-0 right-0 px-3 py-2"
    style={{ zIndex: 7 }}
  >
    <div className="h-2.5 w-3/5 rounded bg-white/80 mb-1.5" />
    <div className="h-2.5 w-1/4 rounded bg-white/60" />
  </div>
);

// Matches the "New" / "Best" / "-20%" badge LandingCards renders for the
// first three cards (index 0/1/2), top-left.
const CardBadgeShimmer = () => (
  <div
    className="absolute top-3 left-3 h-3 w-8 rounded bg-white/70"
    style={{ zIndex: 10 }}
  />
);

// Real bottom-grid / "Recently Viewed" cards are `compact` without
// `fillHeight`, which LandingCards renders at a fixed h-140 (not an aspect
// ratio) — match that exactly so cards don't jump taller once data loads.
const SkeletonCard = ({ badge = false }) => (
  <div
    className="w-full h-[220px] sm:h-[280px] bg-[#f3f3f3] relative overflow-hidden"
    aria-hidden
  >
    <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 shimmer-anim" />
    {badge && <CardBadgeShimmer />}
    <CardTextShimmer />
  </div>
);

// Same as SkeletonCard but stretches to fill its grid cell (viewport-fit rows) instead of a fixed height.
const SkeletonCardFill = ({ badge = false }) => (
  <div
    className="w-full h-full bg-[#f3f3f3] relative overflow-hidden"
    aria-hidden
  >
    <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 shimmer-anim" />
    {badge && <CardBadgeShimmer />}
    <CardTextShimmer />
  </div>
);

// Matches the taller "video" slot in the featured rows (viewport-fit height).
const SkeletonVideoCard = () => (
  <div
    className="w-full h-full bg-[#f3f3f3] relative overflow-hidden"
    aria-hidden
  >
    <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 shimmer-anim" />
    <CardTextShimmer />
  </div>
);

// Grid style mirrors the real featured grid exactly: fixed width/height from
// cardDimensions (viewport-based), not a 50/50 flex split with the video —
// otherwise the skeleton jumps in size the moment real cards replace it.
const featuredGridStyle = (cardDimensions) =>
  cardDimensions.width
    ? {
        width: cardDimensions.width * 4 + 3 * 3 + "px",
        height: cardDimensions.height * 2 + 1 * 3 + "px",
        gridTemplateColumns: "repeat(4, " + cardDimensions.width + "px)",
        gridTemplateRows: "repeat(2, " + cardDimensions.height + "px)",
        gap: "3px",
      }
    : { flex: 1 };

const FeaturedSkeleton = ({ rowHeight, cardDimensions }) => (
  <div className="mb-[3px]">
    <div
      className="flex flex-col sm:flex-row gap-[3px] mb-[3px]"
      style={{ height: rowHeight }}
    >
      <div
        className="grid flex-shrink-0"
        style={featuredGridStyle(cardDimensions)}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCardFill key={`row1-${i}`} badge={i < 3} />
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <SkeletonVideoCard />
      </div>
    </div>

    <div
      className="flex flex-col sm:flex-row gap-[3px] mb-[3px]"
      style={{ height: rowHeight }}
    >
      <div className="flex-1 min-h-0">
        <SkeletonVideoCard />
      </div>
      <div
        className="grid flex-shrink-0"
        style={featuredGridStyle(cardDimensions)}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCardFill key={`row2-${i}`} />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-[3px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={`grid-${i}`} />
      ))}
    </div>
  </div>
);

// ───────────── Page Component ─────────────
export default function FilterProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams ? searchParams.get("source") : undefined;
  const q = searchParams ? searchParams.get("q") : undefined;
  const from = searchParams ? searchParams.get("from") : undefined;
  const categoryName = searchParams
    ? searchParams.get("category_name")
    : undefined;
  // OurProducts' family links land here with both category_name and family_name — in that
  // flow the header should just read "Products", not the category name.
  const familyDeepLink = searchParams
    ? searchParams.get("family_name")
    : undefined;

  const { t, i18n } = useTranslation("filter");
  const ctx = familyDeepLink
    ? {
        key: "products",
        title: t("products.title", "Products"),
        Icon: LuBookOpen,
        accent: "text-stone-700",
      }
    : getShopContext(source, q, categoryName, t);
  const isFrench = i18n?.language === "fr";
  const headerRef = useRef(null);
  const [isHeaderTouchingNav, setIsHeaderTouchingNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const rect = headerRef.current.getBoundingClientRect();
      // navbar height = 40px (announcement) + 64px (nav) = 104px
      setIsHeaderTouchingNav(rect.top <= 104);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The filter rail sticks right below the navbar once scrolled — measure its
  // real height so the featured rows can size themselves to whatever space is
  // actually left in the viewport (navbar + rail eat into it) instead of a
  // guessed constant, which is what left them still needing a scroll.
  const filterRailRef = useRef(null);
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    const el = filterRailRef.current;
    if (!el) return;
    const update = () => setRailHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Featured rows scroll normally as part of the page (no position:sticky pin) — a
  // sticky-pinned row used to hold the same content in view for a whole viewport-height's
  // worth of scroll, which read as the page being "stuck" every time a row reached the
  // viewport. rowHeight still sizes each row to roughly fill the viewport so the grid+video
  // layout looks right, it just no longer pins in place while you scroll past it.
  const reservedTop = NAVBAR_HEIGHT + railHeight;
  const featuredRowHeight = `max(420px, calc(100dvh - ${reservedTop}px))`;
  const row1Height = featuredRowHeight;

  // Card dimensions: height = (viewport minus navbar/rail) / 2, width = height * 0.8.
  // Both featured rows are always sized to featuredRowHeight, so they share this one
  // set of dimensions — the grid always fits its row exactly, and the video (flex-1)
  // takes whatever width is left over next to it.
  const [cardDimensions, setCardDimensions] = useState({ height: 0, width: 0 });
  useEffect(() => {
    const update = () => {
      const availableHeight = Math.max(420, window.innerHeight - reservedTop);
      const h = availableHeight / 2;
      const widthMultiplier = window.innerWidth <= 1440 ? 0.85 : 0.8;
      const w = h * widthMultiplier;
      setCardDimensions({ height: h, width: w });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [reservedTop]);

  const [animals, setAnimals] = useState([]);
  const [universe, setUniverse] = useState([]);
  const [families, setFamilies] = useState([]);
  const [specificity, setSpecificity] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [forWhich, setForWhich] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [price, setPrice] = useState(500);
  const [minPrice, setMinPrice] = useState(0);
  const [sort, setSort] = useState("Featured");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [isSearchPending, setIsSearchPending] = useState(false);
  const queryDebounceRef = useRef(null);
  // Mobile-only: the shop description sits inside a collapsed accordion
  // instead of always showing (desktop keeps it always visible).
  const [mobileDescOpen, setMobileDescOpen] = useState(false);

  useEffect(() => {
    const val = q || "";
    setQuery(val);
    setDebouncedQuery(val);
  }, [q]);

  const hasUserEditedSearchRef = useRef(false);

  const handleQueryChange = (val) => {
    hasUserEditedSearchRef.current = true;
    setQuery(val);
    setIsSearchPending(true);
    clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 1000);
  };

  useEffect(() => {
    if (!hasUserEditedSearchRef.current) return;
    if (debouncedQuery.trim() !== "") return;
    if (!searchParams.get("q") && !searchParams.get("source")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("source");
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  }, [debouncedQuery, searchParams, router]);

  const [apiData, setApiData] = useState(null);

  // useEffect(() => {
  //   const cached = localStorage.getItem("homePageData");
  //   if (cached) setApiData(JSON.parse(cached));
  // }, []);

  useEffect(() => {
    const loadFromSplash = () => {
      const cached = localStorage.getItem("splashData");
      if (cached) {
        try {
          setApiData(JSON.parse(cached));
        } catch (e) {}
      }
    };
    loadFromSplash();
    window.addEventListener("splashDataReady", loadFromSplash);
    return () => window.removeEventListener("splashDataReady", loadFromSplash);
  }, []);

  const [homeApiData, setHomeApiData] = useState(null);
  useEffect(() => {
    const loadFromHome = () => {
      const cached = localStorage.getItem("homePageData");
      if (cached) {
        try {
          setHomeApiData(JSON.parse(cached));
        } catch (e) {}
      }
    };
    loadFromHome();
    window.addEventListener("homePageDataReady", loadFromHome);
    return () => window.removeEventListener("homePageDataReady", loadFromHome);
  }, []);

  const allRanges = useMemo(() => {
    const merged = new Map();
    [...(apiData?.ranges || []), ...(homeApiData?.ranges || [])].forEach(
      (r) => {
        if (r?.name && !merged.has(r.name)) merged.set(r.name, r);
      },
    );
    return [...merged.values()];
  }, [apiData, homeApiData]);

  const apiProducts = apiData?.popular || [];
  const bestSellerProducts = apiData?.best_seller || [];

  const categoriesList = useMemo(() => {
    return apiData?.categories || FALLBACK_CATEGORIES;
  }, [apiData]);

  const translationMap = useMemo(() => {
    return buildTranslationMap(apiData);
  }, [apiData]);

  const translateName = (name) => {
    if (!name) return "";
    if (isFrench) {
      const translationKey = `apiTranslations.${name.replace(/[^a-zA-Z0-9]/g, "")}`;
      const hasTranslation = t(translationKey) !== translationKey;
      if (hasTranslation) {
        return t(translationKey);
      }
      if (translationMap[name]) {
        return translationMap[name];
      }
    }
    return name;
  };

  // Build dynamic filter lists from API data
  const RANGES_LIST = useMemo(
    () => (allRanges.length ? allRanges.map((r) => r.name) : FALLBACK_RANGES),
    [allRanges],
  );
  const SIZES_LIST = useMemo(() => buildSizesList(apiData), [apiData]);
  const COLORS_LIST = useMemo(() => buildColorsList(apiData), [apiData]);
  const COLOR_SWATCHES_MAP = useMemo(
    () => buildColorSwatches(COLORS_LIST),
    [COLORS_LIST],
  );

  const mapProducts = (items) =>
    items.map((item) => ({
      id: item.id,
      name: item.name,
      french_name: item.french_name || "",
      english_seo_keyword:
        item.english_seo_keyboard || item.english_seo_keyword || "",
      french_seo_keyword: item.french_seo_keyword || "",
      subtitle:
        item.subtitle ||
        (item.products?.[0]?.description
          ? item.products[0].description.slice(0, 50) + "..."
          : t("careFormulation", "Care formulation")),
      price: parseFloat(item.price || item.products?.[0]?.price || "0"),
      oldPrice: item.products?.[0]?.price
        ? parseFloat(item.products[0].price) * 1.2
        : null,
      discount: item.discount || item.products?.[0]?.off || "",
      tag: item.discount || item.products?.[0]?.off || null,
      image:
        item.image ||
        (item.products?.[0]?.images[0]?.media
          ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}`
          : ""),
      images: item.images ||
        item.products?.[0]?.images?.map(
          (img) => `https://d18f57oyxifcsh.cloudfront.net/${img.media}`,
        ) || [""],
      videoUrl: item.products?.[0]?.video?.media
        ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].video.media}`
        : null,
      liked: item.liked ?? item.favorites_exists,
      productsCount: item.products?.length || 1,
      products: item.products || [],
      description: item.description || "",
      french_description: item.french_description || "",
      product_label: item.product_label || "",
      french_product_label: item.french_product_label || "",
    }));

  const [searchedProducts, setSearchedProducts] = useState([]);
  const searchedProductsRef = useRef([]);
  const [recentViews, setRecentViews] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingRef = useRef(false);

  const columns = useResponsiveColumns();
  const perPage = 18 + columns * ROWS_PER_PAGE;

  useEffect(() => {
    searchedProductsRef.current = searchedProducts;
  }, [searchedProducts]);

  const loadMoreAnchorRef = useRef(null);

  const handleLoadMore = () => {
    if (isFetchingRef.current || page >= lastPage) return;
    loadMoreAnchorRef.current = restProducts.length;
    isFetchingRef.current = true;
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (isFetchingMore || loadMoreAnchorRef.current === null) return;
    const anchorIndex = loadMoreAnchorRef.current;
    loadMoreAnchorRef.current = null;
    requestAnimationFrame(() => {
      // Two grids share this attribute (desktop lg:grid + mobile lg:hidden fallback) —
      // only one is ever visible at a given viewport, so skip the display:none one.
      const candidates = document.querySelectorAll(
        `[data-rest-index="${anchorIndex}"]`,
      );
      const el = Array.from(candidates).find(
        (node) => node.offsetParent !== null,
      );
      if (!el) return;
      const offset = NAVBAR_HEIGHT + railHeight + 16;
      const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  }, [isFetchingMore, railHeight]);

  const catParam = searchParams ? searchParams.get("category_id") : undefined;
  const familyParam = searchParams
    ? searchParams.get("family_name")
    : undefined;
  // Footer.jsx's "Our Products Ranges" links land here as /shop?range_name=..
  const rangeParam = searchParams ? searchParams.get("range_name") : undefined;

  // Tracks the last catParam/familyParam/rangeParam value actually applied
  // (not just "was one ever applied") — a plain "applied once" boolean ref
  // would permanently block re-applying after the first OurProducts.jsx
  // family click, so clicking a *different* one later while still on /shop
  // (searchParams updates without a remount) would silently do nothing.
  const lastAppliedCatParamRef = useRef(null);
  useEffect(() => {
    if (!catParam || catParam === lastAppliedCatParamRef.current) return;
    if (categoriesList.length > 0) {
      const matchedCat = categoriesList.find(
        (c) => String(c.id) === String(catParam),
      );
      if (matchedCat) {
        setAnimals([matchedCat.name]);
        lastAppliedCatParamRef.current = catParam;
      }
    }
  }, [catParam, categoriesList]);

  const lastAppliedFamilyParamRef = useRef(null);
  useEffect(() => {
    if (!familyParam || familyParam === lastAppliedFamilyParamRef.current)
      return;
    if (animals.length > 0) {
      setFamilies((prev) =>
        prev.includes(familyParam) ? prev : [familyParam],
      );
      lastAppliedFamilyParamRef.current = familyParam;
    }
  }, [familyParam, animals]);

  const lastAppliedRangeParamRef = useRef(null);
  useEffect(() => {
    if (!rangeParam || rangeParam === lastAppliedRangeParamRef.current) return;
    if (RANGES_LIST.includes(rangeParam)) {
      setRanges((prev) => (prev.includes(rangeParam) ? prev : [rangeParam]));
      lastAppliedRangeParamRef.current = rangeParam;
    }
  }, [rangeParam, RANGES_LIST]);

  const [shopDeepLink, setShopDeepLink] = useState(null);
  useEffect(() => {
    const readDeepLink = () => {
      try {
        const raw = sessionStorage.getItem("shopDeepLink");
        if (raw) {
          sessionStorage.removeItem("shopDeepLink");
          setShopDeepLink(JSON.parse(raw));
        }
      } catch {
        /* ignore */
      }
    };
    readDeepLink();
    // Footer.jsx's goToShop() dispatches this right after writing a fresh
    // deep link. Clicking a Footer link while already on /shop is a
    // same-route router.push() — Next.js reuses this already-mounted
    // component instead of remounting it, so the mount-only read above
    // would otherwise never see the new sessionStorage value and the
    // filter would silently not apply.
    window.addEventListener("shopDeepLinkReady", readDeepLink);
    return () => window.removeEventListener("shopDeepLinkReady", readDeepLink);
  }, []);

  // Tracks the last shopDeepLink object actually applied (not just "was any
  // deep link ever applied") — a plain "applied once" boolean ref would
  // permanently block a second Footer.jsx click while still on /shop, since
  // this component never remounts to reset it. setShopDeepLink always
  // stores a freshly-parsed object, so identity comparison alone tells us
  // whether this is a new deep link.
  const lastAppliedCatDeepLinkRef = useRef(null);
  useEffect(() => {
    if (
      shopDeepLink?.type === "family" &&
      shopDeepLink.category_id &&
      shopDeepLink !== lastAppliedCatDeepLinkRef.current &&
      categoriesList.length > 0
    ) {
      const matchedCat = categoriesList.find(
        (c) => String(c.id) === String(shopDeepLink.category_id),
      );
      if (matchedCat) {
        setAnimals([matchedCat.name]);
        lastAppliedCatDeepLinkRef.current = shopDeepLink;
      }
    }
  }, [shopDeepLink, categoriesList]);

  const lastAppliedFamilyDeepLinkRef = useRef(null);
  useEffect(() => {
    if (
      shopDeepLink?.type === "family" &&
      shopDeepLink.family_name &&
      shopDeepLink !== lastAppliedFamilyDeepLinkRef.current &&
      animals.length > 0
    ) {
      setFamilies((prev) =>
        prev.includes(shopDeepLink.family_name)
          ? prev
          : [shopDeepLink.family_name],
      );
      lastAppliedFamilyDeepLinkRef.current = shopDeepLink;
    }
  }, [shopDeepLink, animals]);

  const lastAppliedRangeDeepLinkRef = useRef(null);
  useEffect(() => {
    if (
      shopDeepLink?.type === "range" &&
      shopDeepLink.range_name &&
      shopDeepLink !== lastAppliedRangeDeepLinkRef.current &&
      RANGES_LIST.includes(shopDeepLink.range_name)
    ) {
      setRanges((prev) =>
        prev.includes(shopDeepLink.range_name)
          ? prev
          : [shopDeepLink.range_name],
      );
      lastAppliedRangeDeepLinkRef.current = shopDeepLink;
    }
  }, [shopDeepLink, RANGES_LIST]);

  const getSelectedIds = () => {
    const categoryIds = categoriesList
      .filter((cat) => animals.includes(cat.name))
      .map((cat) => cat.id)
      .join(",");

    const findSubcategoryIds = (type, selectedNames) => {
      if (!selectedNames || selectedNames.length === 0) return "";
      const ids = [];
      const traverse = (item) => {
        if (item.type === type && selectedNames.includes(item.name)) {
          ids.push(item.id);
        }
        if (item.sub_categories) {
          item.sub_categories.forEach(traverse);
        }
      };
      categoriesList.forEach((cat) => {
        cat.sub_categories?.forEach(traverse);
      });
      return [...new Set(ids)].join(",");
    };

    const universeIds = findSubcategoryIds("universe", universe);
    const familyIds = findSubcategoryIds("family", families);
    const specificityIds = findSubcategoryIds("specificity", specificity);
    const needIds = findSubcategoryIds("need", needs);
    const forWhichIds = findSubcategoryIds("for_which", forWhich);

    const rangeIds = allRanges
      .filter((r) => ranges.includes(r.name))
      .map((r) => r.id)
      .join(",");

    const breedIds = categoriesList
      .flatMap((cat) => cat.breeds || [])
      .filter((b) => breeds.includes(b.name))
      .map((b) => b.id)
      .join(",");

    return {
      categoryIds,
      universeIds,
      familyIds,
      specificityIds,
      needIds,
      forWhichIds,
      rangeIds,
      breedIds,
    };
  };

  // Serialize filters to detect changes and reset page to 1
  const filtersSerialized = useMemo(() => {
    return JSON.stringify({
      query: debouncedQuery,
      q,
      animals,
      universe,
      families,
      specificity,
      needs,
      ranges,
      forWhich,
      price,
      minPrice,
      sort,
      sizes,
      colors,
      breeds,
    });
  }, [
    debouncedQuery,
    q,
    animals,
    universe,
    families,
    specificity,
    needs,
    ranges,
    forWhich,
    price,
    minPrice,
    sort,
    sizes,
    colors,
    breeds,
  ]);

  const prevFiltersRef = useRef(filtersSerialized);
  const prevPageRef = useRef(page);
  const prevCategoriesListRef = useRef(categoriesList);
  const hasInitializedRef = useRef(false);
  const searchRequestSeqRef = useRef(0);

  useEffect(() => {
    // Detect if filters changed, reset page to 1
    let targetPage = page;
    const filtersChanged = prevFiltersRef.current !== filtersSerialized;
    const pageChanged = prevPageRef.current !== page;

    const categoriesListChanged =
      prevCategoriesListRef.current === FALLBACK_CATEGORIES &&
      categoriesList !== FALLBACK_CATEGORIES;
    prevCategoriesListRef.current = categoriesList;

    if (filtersChanged) {
      prevFiltersRef.current = filtersSerialized;
      targetPage = 1;
      setPage(1);
      setHasSearched(false);
      searchedProductsRef.current = [];
      setSearchedProducts([]);
    } else if (
      !pageChanged &&
      !categoriesListChanged &&
      hasInitializedRef.current
    ) {
      // apiData refreshed but nothing that affects the resolved filter ids changed — don't re-fire
      return;
    }

    hasInitializedRef.current = true;

    prevPageRef.current = targetPage;
    isFetchingRef.current = true;

    if (targetPage === 1) {
      setIsSearching(true);
    } else {
      setIsFetchingMore(true);
    }

    const loginData = localStorage.getItem("LoginData");
    const token = loginData ? JSON.parse(loginData)?.data?.token : null;

    let sortParam = "";
    if (sort === "Newest") {
      sortParam = "newest";
    } else if (sort === "Price · low to high") {
      sortParam = "price_low_to_high";
    } else if (sort === "Price · high to low") {
      sortParam = "price_high_to_low";
    }

    const {
      categoryIds,
      universeIds,
      familyIds,
      specificityIds,
      needIds,
      forWhichIds,
      rangeIds,
      breedIds,
    } = getSelectedIds();

    const body = {
      keyword: (debouncedQuery || "").trim(),
      ...(categoryIds ? { category_id: categoryIds } : {}),
      ...(universeIds ? { universe_id: universeIds } : {}),
      ...(familyIds ? { family_id: familyIds } : {}),
      ...(specificityIds ? { specificity_id: specificityIds } : {}),
      ...(needIds ? { need_id: needIds } : {}),
      ...(rangeIds ? { range_id: rangeIds } : {}),
      ...(forWhichIds ? { for_which_id: forWhichIds } : {}),
      ...(breedIds ? { breed_id: breedIds } : {}),
      ...(sizes.length > 0 ? { size_name: sizes.join(",") } : {}),
      ...(colors.length > 0 ? { color_name: colors.join(",") } : {}),
      min_price: minPrice,
      max_price: price,
      sort: sortParam,
      page: targetPage,
      per_page: perPage,
      // Logged-in users are identified via the Authorization header below —
      // device_id is only sent for guests.
      ...(token ? {} : { device_id: getDeviceId() }),
    };

    const requestSeq = ++searchRequestSeqRef.current;

    axios
      .post(
        `${BASE_URL}/web/search`,
        body,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      )
      .then((res) => {
        if (requestSeq !== searchRequestSeqRef.current) return;
        if (res.data.status) {
          // /web/search now nests the paginated product results under
          // data.bundles (alongside a suggested data.blog and
          // data.recent_view) instead of returning them directly on data.
          const bundlesPage = res.data.data?.bundles;
          const rawItems = Array.isArray(bundlesPage?.data)
            ? bundlesPage.data
            : Array.isArray(res.data.data)
              ? res.data.data
              : [];

          const mapped = mapProducts(rawItems);
          const unique = [];
          const seen = new Set();

          const baseItems = targetPage === 1 ? [] : searchedProductsRef.current;
          const allItems = [...baseItems, ...mapped];

          for (const p of allItems) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              unique.push(
                extendProductWithFilters(
                  p,
                  RANGES_LIST,
                  SIZES_LIST,
                  COLORS_LIST,
                  categoriesList,
                ),
              );
            }
          }
          const hasMore = bundlesPage?.last_page
            ? targetPage < bundlesPage.last_page
            : rawItems.length >= perPage;

          setSearchedProducts(unique);
          setHasSearched(true);
          setTotalCount(bundlesPage?.total ?? unique.length);
          setLastPage(
            bundlesPage?.last_page || (hasMore ? targetPage + 1 : targetPage),
          );
          setRecentViews(mapProducts(res.data.data?.recent_view ?? []));
          setFeaturedBlog(res.data.data?.blog ?? null);
        } else {
          // A page-1 search/filter fetch that comes back status:false (some
          // backends use this for "no products matched" instead of
          // status:true + an empty array) left hasSearched stuck at the
          // false the filters-changed reset above set it to, so the "No
          // results found" empty state below never rendered — the page just
          // stayed blank apart from the toast. Only do this for page 1: a
          // failed "load more" (targetPage > 1) shouldn't wipe out results
          // already on screen.
          if (targetPage === 1) {
            setSearchedProducts([]);
            setHasSearched(true);
          }
          toast.error(
            res.data.action_message ||
              res.data.action ||
              t("somethingWentWrong", "Something went wrong."),
          );
        }
      })
      .catch((err) => {
        if (requestSeq !== searchRequestSeqRef.current) return;
        console.error("FilterProducts Search Error:", err);
        toast.error(
          t("searchFailed", "Failed to load products from search API."),
        );
      })
      .finally(() => {
        if (requestSeq !== searchRequestSeqRef.current) return;
        setIsSearching(false);
        setIsFetchingMore(false);
        setIsSearchPending(false);
        isFetchingRef.current = false;
      });
  }, [apiData, filtersSerialized, page]);

  const filteredProducts = searchedProducts;

  // First up to 18 products get the featured "grid + video" treatment; the rest use the plain grid.
  // The pattern adapts to however many products are available: 8-grid, +video, +video, +8-grid —
  // each slot only renders once there are enough products to fill it.
  const featuredProducts = filteredProducts.slice(0, 18);
  const showFeaturedIntro = featuredProducts.length > 0;
  const restProducts = filteredProducts.slice(featuredProducts.length);
  const restStartIndex = featuredProducts.length;
  const featuredRow1Grid = featuredProducts.slice(0, 8);
  const featuredRow1Video = featuredProducts[8];
  const featuredRow2Video = featuredProducts[9];
  const featuredRow2Grid = featuredProducts.slice(10, 18);

  const mobileFeaturedBlockA = featuredRow1Grid.slice(0, 4);
  const mobileFeaturedBlockB = featuredRow2Grid.slice(0, 4);
  const mobileFeaturedLeftover = [
    ...featuredRow1Grid.slice(4),
    ...featuredRow2Grid.slice(4),
  ];

  const hasAnimal = animals.length > 0;
  const hasUniverse = universe.length > 0;
  const hasFamily = families.length > 0;
  const hasSpec = specificity.length > 0;

  const selectedCategoryObjs = useMemo(() => {
    return categoriesList.filter((cat) => animals.includes(cat.name));
  }, [animals, categoriesList]);

  // Universe options: sub_categories of categories where type === "universe"
  const universeOptions = useMemo(() => {
    const options = new Set();
    selectedCategoryObjs.forEach((cat) => {
      if (cat.sub_categories) {
        cat.sub_categories.forEach((sub) => {
          if (sub.type === "universe") {
            options.add(sub.name);
          }
        });
      }
    });
    return Array.from(options);
  }, [selectedCategoryObjs]);

  // Selected universe objects
  const selectedUniverseObjs = useMemo(() => {
    const list = [];
    selectedCategoryObjs.forEach((cat) => {
      if (cat.sub_categories) {
        cat.sub_categories.forEach((sub) => {
          if (sub.type === "universe" && universe.includes(sub.name)) {
            list.push(sub);
          }
        });
      }
    });
    return list;
  }, [selectedCategoryObjs, universe]);

  // Family options: all families from all universes under selected categories (universe step skipped in UI)
  const familyOptions = useMemo(() => {
    const options = new Set();
    selectedCategoryObjs.forEach((cat) => {
      cat.sub_categories?.forEach((sub) => {
        if (sub.type === "universe") {
          sub.sub_categories?.forEach((fam) => {
            if (fam.type === "family") options.add(fam.name);
          });
        }
      });
    });
    return Array.from(options);
  }, [selectedCategoryObjs]);

  // Selected family objects (search across all universes)
  const selectedFamilyObjs = useMemo(() => {
    const list = [];
    selectedCategoryObjs.forEach((cat) => {
      cat.sub_categories?.forEach((sub) => {
        if (sub.type === "universe") {
          sub.sub_categories?.forEach((fam) => {
            if (fam.type === "family" && families.includes(fam.name))
              list.push(fam);
          });
        }
      });
    });
    return list;
  }, [selectedCategoryObjs, families]);

  // Specificity options: sub_categories of family where type === "specificity"
  const specificityOptions = useMemo(() => {
    const options = new Set();
    selectedFamilyObjs.forEach((fam) => {
      if (fam.sub_categories) {
        fam.sub_categories.forEach((sub) => {
          if (sub.type === "specificity") {
            options.add(sub.name);
          }
        });
      }
    });
    return Array.from(options);
  }, [selectedFamilyObjs]);

  // Selected specificity objects
  const selectedSpecificityObjs = useMemo(() => {
    const list = [];
    selectedFamilyObjs.forEach((fam) => {
      if (fam.sub_categories) {
        fam.sub_categories.forEach((sub) => {
          if (sub.type === "specificity" && specificity.includes(sub.name)) {
            list.push(sub);
          }
        });
      }
    });
    return list;
  }, [selectedFamilyObjs, specificity]);

  // Need options: sub_categories of specificity where type === "need"
  const needsOptions = useMemo(() => {
    const options = new Set();
    selectedSpecificityObjs.forEach((spec) => {
      if (spec.sub_categories) {
        spec.sub_categories.forEach((sub) => {
          if (sub.type === "need") {
            options.add(sub.name);
          }
        });
      }
    });
    return Array.from(options);
  }, [selectedSpecificityObjs]);

  // Breed options: breeds property of categories
  const breedOptions = useMemo(() => {
    const options = new Set();
    selectedCategoryObjs.forEach((cat) => {
      if (cat.breeds) {
        cat.breeds.forEach((breed) => {
          options.add(breed.name);
        });
      }
    });
    return Array.from(options);
  }, [selectedCategoryObjs]);

  // For Which options: sub_categories of categories where type === "for_which"
  const forWhichOptions = useMemo(() => {
    const options = new Set();
    selectedCategoryObjs.forEach((cat) => {
      if (cat.sub_categories) {
        cat.sub_categories.forEach((sub) => {
          if (sub.type === "for_which") {
            options.add(sub.name);
          }
        });
      }
    });
    return Array.from(options);
  }, [selectedCategoryObjs]);

  const activeChips = useMemo(() => {
    const c = [];
    animals.forEach((a) => {
      c.push({
        label: a,
        clear: () => setAnimals((p) => p.filter((x) => x !== a)),
      });
    });
    [
      [universe, setUniverse],
      [families, setFamilies],
      [specificity, setSpecificity],
      [needs, setNeeds],
      [breeds, setBreeds],
      [forWhich, setForWhich],
      [ranges, setRanges],
      [sizes, setSizes],
    ].forEach(([arr, setter]) => {
      arr.forEach((v) =>
        c.push({
          label: v,
          clear: () => setter((p) => p.filter((x) => x !== v)),
        }),
      );
    });
    colors.forEach((v) => {
      c.push({
        label: v,
        swatch: COLOR_SWATCHES_MAP?.[v],
        clear: () => setColors((p) => p.filter((x) => x !== v)),
      });
    });
    return c;
  }, [
    animals,
    universe,
    families,
    specificity,
    needs,
    breeds,
    forWhich,
    ranges,
    sizes,
    colors,
    COLOR_SWATCHES_MAP,
  ]);

  // Hero headline: last word set in the serif italic accent, like the home hero.
  const titleWords = String(ctx.title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const clearAll = () => {
    setAnimals([]);
    setUniverse([]);
    setFamilies([]);
    setSpecificity([]);
    setNeeds([]);
    setBreeds([]);
    setForWhich([]);
    setRanges([]);
    setSizes([]);
    setColors([]);
    setPrice(500);
    setMinPrice(0);
  };

  return (
    <div className="min-h-screen mt-[104px] bg-white text-stone-900">
      <Navbar bgWhite={true} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideOutRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
          @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .shimmer-anim {
            background: linear-gradient(90deg, #f3f3f3 25%, #e5e5e5 50%, #f3f3f3 75%);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite;
          }
          .animate-fade-in {
            animation: fadeIn 400ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
          .animate-fade-out {
            animation: fadeOut 400ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
          .animate-slide-in-right {
            animation: slideInRight 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-slide-out-right {
            animation: slideOutRight 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.2s ease-out forwards;
          }
            .filter-rail-scroll {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.filter-rail-scroll::-webkit-scrollbar {
  display: none;
}
        `,
        }}
      />

      {/* Sticky filter toolbar — sits right under the navbar, above the hero */}
      <FilterRail
        railRef={filterRailRef}
        categoriesList={categoriesList}
        activeChips={activeChips}
        clearAll={clearAll}
        translateName={translateName}
        state={{
          animals,
          universe,
          families,
          specificity,
          needs,
          breeds,
          forWhich,
          ranges,
          sizes,
          colors,
          price,
          minPrice,
        }}
        setters={{
          setAnimals,
          setUniverse,
          setFamilies,
          setSpecificity,
          setNeeds,
          setBreeds,
          setForWhich,
          setRanges,
          setSizes,
          setColors,
          setPrice,
          setMinPrice,
        }}
        options={{
          familyOptions,
          universeOptions,
          specificityOptions,
          needsOptions,
          breedOptions,
          forWhichOptions,
        }}
        hasAnimal={hasAnimal}
        hasUniverse={hasUniverse}
        hasFamily={hasFamily}
        hasSpec={hasSpec}
        dynamicLists={{
          RANGES_LIST,
          SIZES_LIST,
          COLORS_LIST,
          COLOR_SWATCHES_MAP,
          translateName,
          isFrench,
        }}
      />

      {/* Page hero — compact dark band in the home hero's voice: breadcrumb,
          headline (serif-italic last word) + live stats, description, and
          search + sort. It continues the dark band of the filter toolbar above. */}
      <header
        ref={headerRef}
        className="relative bg-[#0b0b0a] text-white"
        style={{ fontFamily: SHOP_FONT }}
      >
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          precedence="default"
        />
        {/* Decoration is clipped on its own layer, not on the header, so the
            sort dropdown can hang below the header without being cut off. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 120% at 92% -20%, rgba(255,255,255,.10), rgba(255,255,255,0) 60%)",
            }}
          />
          <span
            className="absolute -bottom-[0.24em] right-[-0.03em] hidden select-none whitespace-nowrap text-[clamp(90px,11vw,190px)] font-extralight uppercase leading-none tracking-[-0.05em] text-transparent md:block"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,.07)" }}
          >
            Biogance
          </span>
        </div>

        <div className="relative mx-auto max-w-10xl px-4 pb-6 pt-5 sm:px-6 sm:pb-7 lg:px-8">
          {/* Breadcrumb + context */}
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/45"
          >
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 transition-colors hover:text-white"
            >
              <LuHouse className="h-3.5 w-3.5" />
              {t("home", "Home")}
            </Link>
            <span className="h-px w-5 shrink-0 bg-white/25" />
            <span className="inline-flex min-w-0 items-center gap-1.5 text-white/90">
              <ctx.Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{ctx.crumbLabel || ctx.title}</span>
            </span>
          </nav>

          <div className="mt-4 grid grid-cols-1 items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(400px,500px)] lg:gap-12">
            <div className="min-w-0">
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 className="min-w-0 text-[clamp(30px,3.8vw,54px)] font-extralight uppercase leading-[1] tracking-[-0.035em] text-white">
                  <span className="line-clamp-2 break-words">
                    {titleWords.map((word, i) => {
                      const last =
                        i === titleWords.length - 1 && titleWords.length > 1;
                      return (
                        <span
                          key={`${word}-${i}`}
                          className={
                            last
                              ? "font-normal normal-case italic tracking-[-0.02em]"
                              : ""
                          }
                          style={
                            last ? { fontFamily: SHOP_FONT_SERIF } : undefined
                          }
                        >
                          {word}
                          {i < titleWords.length - 1 ? " " : ""}
                        </span>
                      );
                    })}
                  </span>
                </h1>
                {/* Live stats */}
                <p className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55 tabular-nums">
                  <span className="border border-white/25 px-2 py-1 text-white">
                    {totalCount} {t("productsCount", "products")}
                  </span>
                  {t("speciesCount", "{{count}} species", {
                    count: categoriesList.length,
                  })}
                  <span className="h-1 w-1 bg-white/35" />
                  {t("rangesCount", "{{count}} ranges", {
                    count: RANGES_LIST.length,
                  })}
                </p>
              </div>

              <div className="mt-3 max-w-[640px]">
                <p
                  className={`text-[13px] font-light leading-[1.7] text-white/65 rich-text c-desc sm:text-[14px] ${
                    mobileDescOpen ? "" : "line-clamp-2"
                  }`}
                >
                  {t(
                    "products.shopDescription",
                    "External parasites such as fleas and ticks can quickly affect your dog's comfort and well-being. Walks outdoors or contact with other animals can encourage infestations, leading to itching and skin irritation.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileDescOpen((v) => !v)}
                  aria-expanded={mobileDescOpen}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 transition-colors hover:text-white cursor-pointer"
                >
                  {mobileDescOpen
                    ? t("readLess", "Read less")
                    : t("readMore", "Read more")}
                  <LuChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      mobileDescOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Search + sort */}
            <div className="flex min-w-0 items-stretch gap-2">
              <div className="group relative flex h-12 min-w-0 flex-1 items-center border border-white/20 bg-white/[0.06] backdrop-blur-sm transition-colors duration-200 focus-within:border-white/50">
                {isSearchPending && query ? (
                  <span className="pointer-events-none absolute left-4 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <LuSearch className="pointer-events-none absolute left-4 h-4 w-4 text-white/50 transition-colors group-focus-within:text-white" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={t(
                    "searchPlaceholder",
                    "Search shampoos, sprays, rituals…",
                  )}
                  className="h-full w-full min-w-0 bg-transparent pl-11 pr-10 text-[14px] text-white placeholder:text-white/40 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setDebouncedQuery("");
                      clearTimeout(queryDebounceRef.current);
                    }}
                    className="absolute right-2.5 grid h-7 w-7 place-items-center text-white/50 transition-colors hover:bg-white hover:text-black cursor-pointer"
                    aria-label={t("clearSearch", "Clear search")}
                  >
                    <LuX className="h-3.5 w-3.5" />
                  </button>
                )}
                {/* AuthInput-style focus bar, in white for the dark hero */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-white via-[#c4c4c0] to-white transition-all duration-300 group-focus-within:w-full"
                />
              </div>
              <SortMenu value={sort} onChange={setSort} tone="dark" />
            </div>
          </div>
        </div>
      </header>

      {/* Products — grid */}
      <section className="mx-auto max-w-10xl pb-24">
        {isSearching || isSearchPending ? (
          <>
            <div className="grid grid-cols-2 gap-[3px] md:grid-cols-3 lg:hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} badge={i < 3} />
              ))}
            </div>
            <div className="hidden lg:block">
              <FeaturedSkeleton
                rowHeight={featuredRowHeight}
                cardDimensions={cardDimensions}
              />
            </div>
          </>
        ) : (
          <>
            {showFeaturedIntro && (
              <>
                <div className="flex flex-col gap-[3px] mb-[3px] lg:hidden">
                  {mobileFeaturedBlockA.length > 0 && (
                    <div className="grid grid-cols-2 gap-[3px]">
                      {mobileFeaturedBlockA.map((p, i) => (
                        <div
                          key={p.id}
                          className="w-full h-[220px] sm:h-[280px]"
                        >
                          <LandingCards
                            product={p}
                            showNav={true}
                            index={i}
                            compact={true}
                            compactButtons={true}
                            fillHeight
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {featuredRow1Video && (
                    <div className="w-full h-[260px] sm:h-[340px]">
                      <LandingCards
                        product={featuredRow1Video}
                        showNav={true}
                        index={8}
                        compact={false}
                        compactButtons={true}
                        fillHeight
                        forceVideo
                      />
                    </div>
                  )}

                  {mobileFeaturedBlockB.length > 0 && (
                    <div className="grid grid-cols-2 gap-[3px]">
                      {mobileFeaturedBlockB.map((p, i) => (
                        <div
                          key={p.id}
                          className="w-full h-[220px] sm:h-[280px]"
                        >
                          <LandingCards
                            product={p}
                            showNav={true}
                            index={i + 10}
                            compact={true}
                            compactButtons={true}
                            fillHeight
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {featuredRow2Video && (
                    <div className="w-full h-[260px] sm:h-[340px]">
                      <LandingCards
                        product={featuredRow2Video}
                        showNav={true}
                        index={9}
                        compact={false}
                        compactButtons={true}
                        fillHeight
                        forceVideo
                      />
                    </div>
                  )}
                </div>

                <div className="mb-2 hidden lg:block">
                  {/* Row 1: 8-grid + video — sized to sit inside the first screen, right along with the intro header above it */}
                  {featuredRow1Video ? (
                    <div
                      className="flex flex-col sm:flex-row gap-[3px] mb-2"
                      style={{ height: row1Height }}
                    >
                      <div
                        className="grid flex-shrink-0"
                        style={
                          cardDimensions.width
                            ? {
                                width: cardDimensions.width * 4 + 3 * 3 + "px",
                                height:
                                  cardDimensions.height * 2 + 1 * 3 + "px",
                                gridTemplateColumns:
                                  "repeat(4, " + cardDimensions.width + "px)",
                                gridTemplateRows:
                                  "repeat(2, " + cardDimensions.height + "px)",
                                gap: "3px",
                              }
                            : { flex: 1 }
                        }
                      >
                        {featuredRow1Grid.map((p, i) => (
                          <div
                            key={p.id}
                            className="overflow-hidden"
                            style={
                              cardDimensions.width
                                ? {
                                    width: cardDimensions.width + "px",
                                    height: cardDimensions.height + "px",
                                  }
                                : {}
                            }
                          >
                            <LandingCards
                              product={p}
                              showNav={true}
                              index={i}
                              compact={true}
                              compactButtons={true}
                              fillHeight
                              smallLabel
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <LandingCards
                          product={featuredRow1Video}
                          showNav={true}
                          index={8}
                          compact={false}
                          compactButtons={true}
                          fillHeight
                          forceVideo
                        />
                      </div>
                    </div>
                  ) : (
                    // No video to sit alongside (8 or fewer products total,
                    // so featuredRow1Video came back undefined) — grid-cols-4
                    // (not 2) so this still reads as the same "four wide"
                    // layout the video variant above uses. CSS grid wraps
                    // this on its own: 8 items become two rows of 4, 5-7
                    // items become a full row of 4 + a partial second row,
                    // 1-4 items stay a single row of (up to) 4 — no video,
                    // exactly matching however many products there are.
                    <div className="grid grid-cols-4 gap-[3px] mb-2">
                      {featuredRow1Grid.map((p, i) => (
                        <div key={p.id} className="w-full">
                          <LandingCards
                            product={p}
                            showNav={true}
                            index={i}
                            compact={true}
                            compactButtons={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Row 2: video + 8-grid */}
                  {featuredRow2Video &&
                    (featuredRow2Grid.length > 0 ? (
                      <div
                        className="flex flex-col sm:flex-row gap-[3px]"
                        style={{ height: featuredRowHeight }}
                      >
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <LandingCards
                            product={featuredRow2Video}
                            showNav={true}
                            index={9}
                            compact={false}
                            compactButtons={true}
                            fillHeight
                            forceVideo
                          />
                        </div>
                        <div
                          className="grid flex-shrink-0"
                          style={
                            cardDimensions.width
                              ? {
                                  width:
                                    cardDimensions.width * 4 + 3 * 3 + "px",
                                  height:
                                    cardDimensions.height * 2 + 1 * 3 + "px",
                                  gridTemplateColumns:
                                    "repeat(4, " + cardDimensions.width + "px)",
                                  gridTemplateRows:
                                    "repeat(2, " +
                                    cardDimensions.height +
                                    "px)",
                                  gap: "3px",
                                  alignSelf: "flex-start",
                                }
                              : { flex: 1 }
                          }
                        >
                          {featuredRow2Grid.map((p, i) => (
                            <div
                              key={p.id}
                              className="overflow-hidden"
                              style={
                                cardDimensions.width
                                  ? {
                                      width: cardDimensions.width + "px",
                                      height: cardDimensions.height + "px",
                                    }
                                  : {}
                              }
                            >
                              <LandingCards
                                product={p}
                                showNav={true}
                                index={i + 10}
                                compact={true}
                                compactButtons={true}
                                fillHeight
                                smallLabel
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <LandingCards
                          product={featuredRow2Video}
                          showNav={true}
                          index={5}
                          compact={true}
                          compactButtons={true}
                          forceVideo
                        />
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Desktop (lg+): restProducts only — everything else already shown in the
                8-wide featured rows above. */}
            <div
              className="hidden lg:grid gap-[3px]"
              style={{
                overflowAnchor: "none",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {restProducts.map((p, i) => (
                <div key={p.id} className="w-full" data-rest-index={i}>
                  <LandingCards
                    product={p}
                    showNav={true}
                    index={restStartIndex + i}
                    compact={true}
                    compactButtons={true}
                  />
                </div>
              ))}
            </div>

            {/* Mobile/tablet (below lg): the 4-item featured blocks above only used half of
                each 8-item group — the leftover half rejoins here, ahead of restProducts. */}
            <div
              className="grid gap-[3px] lg:hidden"
              style={{
                overflowAnchor: "none",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {mobileFeaturedLeftover.map((p, i) => (
                <div key={p.id} className="w-full h-[220px] sm:h-[280px]">
                  <LandingCards
                    product={p}
                    showNav={true}
                    index={i + 4}
                    compact={true}
                    compactButtons={true}
                    fillHeight
                  />
                </div>
              ))}
              {restProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="w-full h-[220px] sm:h-[280px]"
                  data-rest-index={i}
                >
                  <LandingCards
                    product={p}
                    showNav={true}
                    index={restStartIndex + i}
                    compact={true}
                    compactButtons={true}
                    fillHeight
                  />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && hasSearched && (
              <div className="mx-4 my-10 flex flex-col items-center justify-center border border-dashed border-[#d6d4cc] bg-[#fbfaf7] px-6 py-20 text-center sm:mx-6 lg:mx-8">
                <div className="mb-6 grid h-14 w-14 place-items-center bg-black text-white">
                  <LuSearch className="h-6 w-6" />
                </div>
                <p className="text-[clamp(22px,3vw,32px)] font-extrabold uppercase leading-tight tracking-[-0.02em] text-black">
                  {t("noResultsFound", "No results found")}
                </p>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#555]">
                  {t(
                    "noResultsDesc",
                    "Try adjusting your filters or keyword — a small tweak often reveals the right formulation.",
                  )}
                </p>
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-7 inline-flex h-11 items-center gap-2 border border-black px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
                  >
                    <LuRotateCcw className="h-3.5 w-3.5" />
                    {t("resetAll", "Reset all")}
                  </button>
                )}
              </div>
            )}

            {filteredProducts.length > 0 && page < lastPage && (
              <div className="flex flex-col items-center gap-5 px-4 pt-12">
                <div className="w-full max-w-[260px] text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50 tabular-nums">
                    {t("showingOf", "Showing {{shown}} of {{total}}", {
                      shown: filteredProducts.length,
                      total: totalCount,
                    })}
                  </p>
                  <div className="mt-3 h-[2px] w-full bg-black/10">
                    <div
                      className="h-full bg-black transition-[width] duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (filteredProducts.length / Math.max(totalCount, 1)) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="inline-flex h-12 items-center gap-3 border border-black bg-black px-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-black cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingMore && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {isFetchingMore
                    ? t("loading", "Loading...")
                    : t("loadMore", "Load More")}
                  {!isFetchingMore && <LuChevronDown className="h-4 w-4" />}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {!isSearching && !isSearchPending && recentViews.length > 0 && (
        <section className="border-t border-[#d6d4cc] bg-[#f5f4f0] py-14 sm:py-20">
          <div className="mx-auto max-w-10xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 border-b border-black/15 pb-6 sm:mb-10">
              <div className="mb-3 flex items-center gap-3">
                <span className="bg-black px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-white tabular-nums">
                  {String(Math.min(recentViews.length, 3)).padStart(2, "0")}
                </span>
                <span className="h-px w-8 bg-black/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#666]">
                  {t("pickUpWhereYouLeft", "Pick up where you left off")}
                </span>
              </div>
              <h2 className="text-[clamp(26px,4vw,48px)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em] text-black">
                {t("recentlyViewed", "Recently Viewed")}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {recentViews.slice(0, 3).map((p, i) => (
                <div key={p.id} className="w-[350px] max-w-full">
                  <LandingCards
                    product={p}
                    showNav={true}
                    index={i}
                    compactButtons
                    smallLabel
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isSearching && !isSearchPending && featuredBlog && (
        <section className="border-t border-[#d6d4cc] bg-white py-14 sm:py-20">
          <div className="mx-auto grid max-w-10xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16 lg:px-8">
            <div className="lg:sticky lg:top-[200px] lg:self-start">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center bg-black text-white">
                  <LuBookOpen className="h-3.5 w-3.5" />
                </span>
                <span className="h-px w-8 bg-black/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#666]">
                  {t("fromJournal", "From the journal")}
                </span>
              </div>
              <h2 className="text-[clamp(26px,3.4vw,44px)] font-extrabold uppercase leading-[1.04] tracking-[-0.03em] text-black">
                {isFrench && featuredBlog.french_name
                  ? featuredBlog.french_name
                  : featuredBlog.name}
              </h2>
              {featuredBlog.images?.[0]?.media && (
                <div className="mt-6 aspect-[4/3] w-full overflow-hidden border border-[#d6d4cc] bg-[#f5f4f0]">
                  <img
                    src={`${MEDIA_URL}${featuredBlog.images[0].media}`}
                    alt={
                      isFrench && featuredBlog.french_name
                        ? featuredBlog.french_name
                        : featuredBlog.name
                    }
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Rich text from the API — styled here since the typography
                plugin isn't installed. */}
            <div
              className="max-w-none text-[15px] leading-[1.8] text-[#444] [&_a]:text-black [&_a]:underline [&_a]:underline-offset-4 [&_h1]:mb-4 [&_h1]:mt-10 [&_h1]:text-[26px] [&_h1]:font-extrabold [&_h1]:uppercase [&_h1]:leading-tight [&_h1]:tracking-[-0.02em] [&_h1]:text-black [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-black [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:text-black [&_li]:mb-1.5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-5 [&_strong]:text-black [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&>*:first-child]:mt-0"
              dangerouslySetInnerHTML={{
                __html:
                  (isFrench && featuredBlog.long_french_description) ||
                  featuredBlog.long_description ||
                  "",
              }}
            />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

// ───────────── Filter Rail ─────────────
function FilterRail({
  railRef,
  categoriesList,
  activeChips,
  clearAll: clearAllChips,
  translateName: translateNameProp,
  state,
  setters,
  options,
  hasAnimal,
  hasUniverse,
  hasFamily,
  hasSpec,
  dynamicLists,
}) {
  const { t } = useTranslation("filter");
  const {
    RANGES_LIST,
    SIZES_LIST,
    COLORS_LIST,
    COLOR_SWATCHES_MAP,
    isFrench,
  } = dynamicLists;
  const translateName = translateNameProp || dynamicLists.translateName;
  const [openKey, setOpenKey] = useState(null);
  const [allOpen, setAllOpen] = useState(false);
  // Price is its own floating popover (anchored under the Price button)
  // rather than a group inside the shared accordion strip.
  const [priceOpen, setPriceOpen] = useState(false);
  const ref = useRef(null);
  const mobilePriceBtnRef = useRef(null);
  const desktopPriceBtnRef = useRef(null);
  const pricePanelRef = useRef(null);
  // Only one of the two buttons is ever actually visible (the other is
  // display:none via the md breakpoint), so pick whichever has layout.
  const getPriceAnchorEl = () =>
    (mobilePriceBtnRef.current?.offsetParent && mobilePriceBtnRef.current) ||
    (desktopPriceBtnRef.current?.offsetParent && desktopPriceBtnRef.current) ||
    null;

  useEffect(() => {
    const onClick = (e) => {
      if (pricePanelRef.current?.contains(e.target)) return;
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenKey(null);
        setPriceOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const groups = [
    {
      key: "animal",
      label: "Category",
      values: state.animals,
      options: categoriesList.map((c) => c.name),
      setter: (v) => setters.setAnimals((p) => toggle(p, v)),
    },
    {
      key: "family",
      label: "Family",
      values: state.families,
      options: options.familyOptions,
      setter: (v) => setters.setFamilies((p) => toggle(p, v)),
      disabled: !hasAnimal,
      tip: "Select a category first",
    },
    {
      key: "specificity",
      label: "Specificity",
      values: state.specificity,
      options: options.specificityOptions,
      setter: (v) => setters.setSpecificity((p) => toggle(p, v)),
      disabled: !hasFamily,
      tip: "Select a family first",
    },
    {
      key: "needs",
      label: "Needs",
      values: state.needs,
      options: options.needsOptions,
      setter: (v) => setters.setNeeds((p) => toggle(p, v)),
      disabled: !hasSpec,
      tip: "Select a specificity first",
    },
    {
      key: "breed",
      label: "Breed",
      values: state.breeds,
      options: options.breedOptions,
      setter: (v) => setters.setBreeds((p) => toggle(p, v)),
      disabled: !hasAnimal,
      tip: "Select a category first",
    },
    {
      key: "forwhich",
      label: "For Which",
      values: state.forWhich,
      options: options.forWhichOptions,
      setter: (v) => setters.setForWhich((p) => toggle(p, v)),
      disabled: !hasAnimal,
      tip: "Select a category first",
    },
    {
      key: "range",
      label: "Range",
      values: state.ranges,
      options: RANGES_LIST,
      setter: (v) => setters.setRanges((p) => toggle(p, v)),
    },
    {
      key: "size",
      label: "Size",
      values: state.sizes,
      options: SIZES_LIST,
      setter: (v) => setters.setSizes((p) => toggle(p, v)),
    },
    {
      key: "color",
      label: "Color",
      values: state.colors,
      options: COLORS_LIST,
      setter: (v) => setters.setColors((p) => toggle(p, v)),
    },
  ];

  const activeGroup = groups.find((g) => g.key === openKey);

  const totalActive =
    state.animals.length +
    state.families.length +
    state.specificity.length +
    state.needs.length +
    state.breeds.length +
    state.forWhich.length +
    state.ranges.length +
    state.sizes.length +
    state.colors.length;

  const clearAll = () => {
    setters.setAnimals([]);
    setters.setUniverse([]);
    setters.setFamilies([]);
    setters.setSpecificity([]);
    setters.setNeeds([]);
    setters.setBreeds([]);
    setters.setForWhich([]);
    setters.setRanges([]);
    setters.setSizes([]);
    setters.setColors([]);
    setters.setPrice(500);
    setters.setMinPrice(0);
  };

  const priceLabel =
    state.minPrice > 0
      ? `€${state.minPrice} – €${state.price}`
      : `€${state.price}`;

  return (
    <div
      ref={(el) => {
        ref.current = el;
        if (railRef) railRef.current = el;
      }}
      className="sticky top-[64px] z-39 border-b border-white/10 bg-[#0b0b0a]/95 text-white backdrop-blur-md lg:top-[104px]"
    >
      {/* Mobile: Filters (opens the drawer) + price */}
      <div className="flex items-stretch gap-2 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2.5 bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black active:scale-[0.99] cursor-pointer"
        >
          <LuSlidersHorizontal className="h-4 w-4" />
          {t("filters", "Filters")}
          <CountBadge count={totalActive} />
        </button>
        <button
          type="button"
          ref={mobilePriceBtnRef}
          onClick={() => {
            setOpenKey(null);
            setPriceOpen((v) => !v);
          }}
          aria-expanded={priceOpen}
          className={`inline-flex h-11 shrink-0 items-center gap-2 border px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
            priceOpen
              ? "border-white bg-white text-black"
              : "border-white/20 bg-white/[0.06] text-white"
          }`}
        >
          {priceLabel}
          <LuChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${priceOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Tablet / desktop: all-filters button, one pill per group, price */}
      <div className="mx-auto hidden max-w-10xl items-center gap-3 px-6 py-3 md:flex lg:px-8">
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          title={t("openAllFilters", "Open all filters")}
          className="inline-flex h-10 shrink-0 items-center gap-2.5 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#e7e7e5] cursor-pointer"
        >
          <LuSlidersHorizontal className="h-3.5 w-3.5" />
          {t("filter", "Filter")}
          <CountBadge count={totalActive} />
        </button>

        <span className="h-6 w-px shrink-0 bg-white/15" />

        <div className="filter-rail-scroll flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {groups.map((g) => (
            <FilterTab
              key={g.key}
              group={g}
              open={openKey === g.key}
              onOpen={() => {
                setPriceOpen(false);
                setOpenKey(openKey === g.key ? null : g.key);
              }}
              translateName={translateName}
              isFrench={isFrench}
            />
          ))}
        </div>

        <button
          type="button"
          ref={desktopPriceBtnRef}
          onClick={() => {
            setOpenKey(null);
            setPriceOpen((v) => !v);
          }}
          aria-expanded={priceOpen}
          className={`inline-flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap border px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer ${
            priceOpen
              ? "border-white bg-white text-black"
              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
          }`}
        >
          {t("price", "Price")}
          <span
            className={`px-1.5 py-0.5 text-[11px] font-bold tracking-[0.04em] tabular-nums ${
              priceOpen ? "bg-black text-white" : "bg-white/10 text-white"
            }`}
          >
            {priceLabel}
          </span>
          <LuChevronDown
            className={`h-3 w-3 transition-transform duration-300 ${priceOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <PricePopover
        open={priceOpen}
        getAnchorEl={getPriceAnchorEl}
        panelRef={pricePanelRef}
        minPrice={state.minPrice}
        price={state.price}
        setMinPrice={setters.setMinPrice}
        setPrice={setters.setPrice}
        onClose={() => setPriceOpen(false)}
        align="right"
      />

      {/* Active filter chips — one scrollable line, reset pinned right */}
      {activeChips && activeChips.length > 0 && (
        <div className="border-t border-white/10 bg-[#141412]">
          <div className="mx-auto flex max-w-10xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 sm:block">
              {t("activeFilters", "Active")}
            </span>
            <div className="filter-rail-scroll flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              {activeChips.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex h-8 shrink-0 items-center gap-2 border border-white/15 bg-white/[0.05] pl-3 pr-1 text-[11px] font-medium text-white"
                >
                  {c.swatch ? (
                    <span
                      className="h-3.5 w-3.5 shrink-0 ring-1 ring-white/25"
                      style={{
                        background: c.swatch,
                        ...(c.swatch.includes("gradient")
                          ? {}
                          : { backgroundColor: c.swatch }),
                      }}
                      aria-label={c.label}
                    />
                  ) : (
                    <span className="whitespace-nowrap">
                      {translateName(c.label)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={c.clear}
                    className="grid h-6 w-6 place-items-center text-white/45 transition-colors hover:bg-white hover:text-black cursor-pointer"
                    aria-label={t("removeFilter", "Remove {{label}}", {
                      label: translateName(c.label),
                    })}
                  >
                    <LuX className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAllChips}
              className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white cursor-pointer"
            >
              <LuRotateCcw className="h-3 w-3" />
              {t("resetAll", "Reset all")}
            </button>
          </div>
        </div>
      )}

      {/* Expanding panel for the open pill */}
      <FilterPanel
        categoriesList={categoriesList}
        openKey={openKey}
        state={state}
        setters={setters}
        options={options}
        hasAnimal={hasAnimal}
        onClose={() => setOpenKey(null)}
        dynamicLists={{
          RANGES_LIST,
          SIZES_LIST,
          COLORS_LIST,
          COLOR_SWATCHES_MAP,
          translateName,
          isFrench,
        }}
      />

      {allOpen && (
        <AllFiltersModal
          groups={groups}
          price={state.price}
          setPrice={setters.setPrice}
          minPrice={state.minPrice}
          setMinPrice={setters.setMinPrice}
          totalActive={totalActive}
          onClearAll={clearAll}
          onClose={() => setAllOpen(false)}
          colorSwatches={COLOR_SWATCHES_MAP}
          translateName={translateName}
          isFrench={isFrench}
        />
      )}
    </div>
  );
}

const PRICE_FLOOR = 0;
const PRICE_CEILING = 500;

// Small square count pill used on the filter triggers and the drawer header.
function CountBadge({ count, tone = "dark" }) {
  if (!count) return null;
  return (
    <span
      className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center px-1.5 text-[10px] font-bold leading-none tracking-normal tabular-nums ${
        tone === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {count}
    </span>
  );
}

// One selectable filter value: a square tile with a checkbox mark, or a
// colour swatch for the Color group. `tone="dark"` is the in-toolbar panel,
// light is the white All-filters drawer.
function OptionChip({ label, on, swatch, onClick, tone = "light" }) {
  const dark = tone === "dark";
  if (swatch) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        aria-pressed={on}
        className={`relative h-10 w-10 border p-1 transition-colors duration-200 cursor-pointer ${
          on
            ? dark
              ? "border-white"
              : "border-black"
            : dark
              ? "border-white/15 hover:border-white/50"
              : "border-black/15 hover:border-black/50"
        }`}
      >
        <span
          className="block h-full w-full"
          style={{
            background: swatch,
            ...(swatch.includes("gradient") ? {} : { backgroundColor: swatch }),
          }}
        />
        {on && (
          <span
            className={`absolute right-0 top-0 grid h-4 w-4 place-items-center ${
              dark ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            <LuCheck className="h-2.5 w-2.5 stroke-[3]" />
          </span>
        )}
      </button>
    );
  }
  const chipTone = dark
    ? on
      ? "border-white bg-white text-black"
      : "border-white/15 bg-white/[0.04] text-white/80 hover:border-white/50 hover:text-white"
    : on
      ? "border-black bg-black text-white"
      : "border-black/15 bg-white text-[#333] hover:border-black hover:text-black";
  const boxTone = dark
    ? on
      ? "border-black bg-black text-white"
      : "border-white/30 group-hover:border-white"
    : on
      ? "border-white bg-white text-black"
      : "border-black/30 group-hover:border-black";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`group inline-flex min-h-9 items-center gap-2.5 border px-3.5 py-2 text-left text-[12px] leading-tight transition-colors duration-200 cursor-pointer ${chipTone}`}
    >
      <span
        className={`grid h-3.5 w-3.5 shrink-0 place-items-center border transition-colors ${boxTone}`}
      >
        {on && <LuCheck className="h-2.5 w-2.5 stroke-[3]" />}
      </span>
      {label}
    </button>
  );
}

function GroupSearch({ value, onChange, placeholder, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className="relative mb-4 max-w-md">
      <LuSearch
        className={`pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
          dark ? "text-white/45" : "text-black/40"
        }`}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full border pl-10 pr-10 text-[13px] transition-colors focus:outline-none ${
          dark
            ? "border-white/15 bg-white/[0.05] text-white placeholder:text-white/35 focus:border-white/60"
            : "border-black/15 bg-white text-black placeholder:text-black/35 focus:border-black"
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear"
          className={`absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center transition-colors cursor-pointer ${
            dark
              ? "text-white/45 hover:bg-white hover:text-black"
              : "text-black/40 hover:bg-black hover:text-white"
          }`}
        >
          <LuX className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function OptionList({
  group,
  filtered,
  searchable,
  colorSwatches,
  translateName,
  maxHeight,
  tone = "light",
}) {
  const isColor = group.key === "color";
  return (
    <div
      className={`flex flex-wrap gap-2 ${searchable ? `${maxHeight} overflow-y-auto pr-1` : ""}`}
    >
      {filtered.map((opt) => (
        <OptionChip
          key={opt}
          tone={tone}
          label={translateName(opt)}
          on={group.values.includes(opt)}
          swatch={isColor ? colorSwatches?.[opt] : undefined}
          onClick={() => group.setter(opt)}
        />
      ))}
    </div>
  );
}

// Dual-thumb price slider — two overlapping range inputs whose track is
// pointer-events-none so only each thumb (styled via the pseudo-element
// arbitrary variants below) is actually clickable. `onChangeMin`/`onChangeMax`
// only touch local/draft values — callers decide when a draft is actually
// committed (e.g. on Apply), so dragging never fires a product refetch.
function PriceRangeControl({
  minValue,
  maxValue,
  onChangeMin,
  onChangeMax,
  onReset,
  onApply,
  applyLabel,
  showActions = true,
}) {
  const { t } = useTranslation("filter");
  const percentMin =
    ((minValue - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100;
  const percentMax =
    ((maxValue - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100;

  const thumbClasses =
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#000] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none";

  const fieldClass =
    "flex h-11 items-center border border-black/15 bg-white transition-colors focus-within:border-black";
  const inputClass =
    "w-full min-w-0 bg-transparent px-2 text-[14px] font-semibold text-black tabular-nums focus:outline-none";

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">
            {t("from", "From")}
          </span>
          <span className={fieldClass}>
            <span className="pl-3 text-[13px] text-black/40">€</span>
            <input
              type="number"
              min={PRICE_FLOOR}
              max={maxValue}
              value={minValue}
              onChange={(e) =>
                onChangeMin(Math.min(Number(e.target.value) || 0, maxValue))
              }
              className={inputClass}
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">
            {t("to", "To")}
          </span>
          <span className={fieldClass}>
            <span className="pl-3 text-[13px] text-black/40">€</span>
            <input
              type="number"
              min={minValue}
              max={PRICE_CEILING}
              value={maxValue}
              onChange={(e) =>
                onChangeMax(Math.max(Number(e.target.value) || 0, minValue))
              }
              className={inputClass}
            />
          </span>
        </label>
      </div>

      <div className="relative mt-6 h-4">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-black/15" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-black"
          style={{ left: `${percentMin}%`, right: `${100 - percentMax}%` }}
        />
        <input
          type="range"
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          value={minValue}
          onChange={(e) =>
            onChangeMin(Math.min(Number(e.target.value), maxValue))
          }
          className={`pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent ${thumbClasses}`}
        />
        <input
          type="range"
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          value={maxValue}
          onChange={(e) =>
            onChangeMax(Math.max(Number(e.target.value), minValue))
          }
          className={`pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent ${thumbClasses}`}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40 tabular-nums">
        <span>€{PRICE_FLOOR}</span>
        <span>€{PRICE_CEILING}</span>
      </div>

      {showActions && (
        <div className="mt-6 grid grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            onClick={onReset}
            className="h-11 border border-black/20 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:border-black cursor-pointer"
          >
            {t("reset", "Reset")}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-11 bg-black px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2a2a28] cursor-pointer"
          >
            {applyLabel || t("apply", "Apply")}
          </button>
        </div>
      )}
    </div>
  );
}

// Floating card anchored under the Price trigger button. Portaled to
// document.body (instead of position:absolute inside the tab rail) so the
// rail's overflow-x-auto scroller never clips it — position is computed
// from getAnchorEl()'s bounding box instead. Draft state is re-seeded from
// the committed price every time it opens, and only Done commits it (which
// is what actually triggers the product refetch).
function PricePopover({
  open,
  getAnchorEl,
  panelRef,
  minPrice,
  price,
  setMinPrice,
  setPrice,
  onClose,
  align = "right",
}) {
  const { t } = useTranslation("filter");
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(price);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (open) {
      setDraftMin(minPrice);
      setDraftMax(price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const anchor = getAnchorEl?.();
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        right: window.innerWidth - rect.right,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, getAnchorEl]);

  if (!open || !coords || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[200] w-[340px] max-w-[calc(100vw-2rem)] border border-black/10 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] animate-scale-in"
      style={{
        top: coords.top,
        ...(align === "right" ? { right: coords.right } : { left: coords.left }),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#e8e6df] px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">
            {t("price", "Price")}
          </p>
          <p className="mt-1 text-[20px] font-extrabold leading-none tracking-[-0.02em] text-black tabular-nums">
            €{draftMin} – €{draftMax}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-8 w-8 shrink-0 place-items-center border border-black/15 text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        <PriceRangeControl
          minValue={draftMin}
          maxValue={draftMax}
          onChangeMin={setDraftMin}
          onChangeMax={setDraftMax}
          onReset={() => {
            setDraftMin(0);
            setDraftMax(PRICE_CEILING);
            setMinPrice(0);
            setPrice(PRICE_CEILING);
          }}
          onApply={() => {
            setMinPrice(draftMin);
            setPrice(draftMax);
            onClose();
          }}
          applyLabel={t("done", "Done")}
        />
      </div>
    </div>,
    document.body,
  );
}

function AllFiltersModal({
  groups,
  price,
  setPrice,
  minPrice,
  setMinPrice,
  totalActive,
  onClearAll,
  onClose,
  colorSwatches,
  translateName,
  isFrench,
}) {
  const { t } = useTranslation("filter");
  const [isClosing, setIsClosing] = useState(false);
  // Draft price so dragging the slider inside this drawer doesn't refetch
  // products — only "Show results" commits it (the modal remounts fresh
  // each time it opens, so a plain useState is enough to seed the draft).
  const [draftPrice, setDraftPrice] = useState(price);
  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleShowResults = () => {
    setPrice(draftPrice);
    setMinPrice(draftMinPrice);
    handleClose();
  };

  const handleClearAll = () => {
    onClearAll();
    setDraftPrice(500);
    setDraftMinPrice(0);
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />
      <aside
        className={`relative flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl ${
          isClosing ? "animate-slide-out-right" : "animate-slide-in-right"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#e8e6df] px-5 pb-5 pt-6 sm:px-7">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
              <LuSlidersHorizontal className="h-3.5 w-3.5" />
              {t("refine", "Refine")}
            </p>
            <h2 className="mt-2 flex items-center gap-3 text-[28px] font-extrabold uppercase leading-none tracking-[-0.03em] text-black">
              {t("filters", "Filters")}
              <CountBadge count={totalActive} />
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center border border-black/15 text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7">
          {groups
            .filter((g) => !g.disabled)
            .map((g) => (
              <ModalGroupSection
                key={g.key}
                g={g}
                colorSwatches={colorSwatches}
                translateName={translateName}
                isFrench={isFrench}
              />
            ))}

          {/* Price */}
          <section className="py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-black">
                {t("price", "Price")}
              </h3>
              <span className="text-[15px] font-extrabold text-black tabular-nums">
                €{draftMinPrice} – €{draftPrice}
              </span>
            </div>
            <PriceRangeControl
              minValue={draftMinPrice}
              maxValue={draftPrice}
              onChangeMin={setDraftMinPrice}
              onChangeMax={setDraftPrice}
              showActions={false}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-[#e8e6df] bg-white p-4 sm:px-7">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex h-12 items-center gap-2 border border-black/20 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:border-black cursor-pointer"
          >
            <LuRotateCcw className="h-3.5 w-3.5" />
            {t("resetAll", "Reset all")}
          </button>
          <button
            type="button"
            onClick={handleShowResults}
            className="group inline-flex h-12 items-center justify-center gap-3 bg-black px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2a2a28] cursor-pointer"
          >
            {t("showResults", "Show results")}
            <LuArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function shouldShowSearchInput(group) {
  const largeOptionGroups = [
    "animal",
    "universe",
    "family",
    "specificity",
    "breed",
  ];
  if (largeOptionGroups.includes(group.key)) {
    return group.options.length > 30;
  }

  return group.options.length > 20;
}

function ModalGroupSection({ g, colorSwatches, translateName, isFrench }) {
  const { t } = useTranslation("filter");
  const [q, setQ] = useState("");
  const searchable = shouldShowSearchInput(g);
  const filtered =
    searchable && q
      ? g.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
      : g.options;
  const displayTitle = t(`labels.${g.key}`, g.label);
  const searchPlaceholder = t("searchGroupPlaceholder", "Search {{label}}…", {
    label: displayTitle.toLowerCase(),
  });

  return (
    <section className="border-b border-[#e8e6df] py-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-black">
          {displayTitle}
        </h3>
        {g.values.length > 0 && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">
            {t("selectedCount", "{{count}} selected", {
              count: g.values.length,
            })}
          </span>
        )}
      </div>
      {searchable && (
        <GroupSearch value={q} onChange={setQ} placeholder={searchPlaceholder} />
      )}
      {filtered.length === 0 ? (
        <div className="text-[12px] text-black/40">
          {t("noOptions", "No options")}
        </div>
      ) : (
        <OptionList
          group={g}
          filtered={filtered}
          searchable={searchable}
          colorSwatches={colorSwatches}
          translateName={translateName}
          maxHeight="max-h-60"
        />
      )}
    </section>
  );
}

function FilterTab({ group, open, onOpen, translateName, isFrench }) {
  const { t } = useTranslation("filter");
  const count = group.values.length;
  const active = count > 0;
  const displayLabel = t(`labels.${group.key}`, group.label);
  const displayTip = group.disabled
    ? t(`tips.${group.key}`, group.tip)
    : undefined;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={group.disabled}
      title={group.disabled ? displayTip : undefined}
      aria-expanded={open}
      className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap border px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        group.disabled
          ? "cursor-not-allowed border-white/[0.06] text-white/25"
          : open
            ? "border-white bg-white text-black cursor-pointer"
            : active
              ? "border-white/60 text-white cursor-pointer"
              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white cursor-pointer"
      }`}
    >
      {displayLabel}
      <CountBadge count={count} tone={open ? "dark" : "light"} />
      <LuChevronDown
        className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function FilterPanel({
  categoriesList,
  openKey,
  state,
  setters,
  options,
  hasAnimal,
  onClose,
  dynamicLists,
}) {
  const {
    RANGES_LIST,
    SIZES_LIST,
    COLORS_LIST,
    COLOR_SWATCHES_MAP,
    translateName,
    isFrench,
  } = dynamicLists;
  const [renderedKey, setRenderedKey] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (openKey) {
      setRenderedKey(openKey);
      if (!isOpen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
      const timer = setTimeout(() => {
        setRenderedKey(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [openKey, isOpen]);

  if (!renderedKey) return null;

  const groups = [
    {
      key: "animal",
      label: "Category",
      values: state.animals,
      options: categoriesList.map((c) => c.name),
      setter: (v) => setters.setAnimals((p) => toggle(p, v)),
    },
    {
      key: "family",
      label: "Family",
      values: state.families,
      options: options.familyOptions,
      setter: (v) => setters.setFamilies((p) => toggle(p, v)),
      disabled: !hasAnimal,
      tip: "Select a category first",
    },
    {
      key: "specificity",
      label: "Specificity",
      values: state.specificity,
      options: options.specificityOptions,
      setter: (v) => setters.setSpecificity((p) => toggle(p, v)),
      disabled: state.families.length === 0,
      tip: "Select a family first",
    },
    {
      key: "needs",
      label: "Needs",
      values: state.needs,
      options: options.needsOptions,
      setter: (v) => setters.setNeeds((p) => toggle(p, v)),
      disabled: state.specificity.length === 0,
      tip: "Select a specificity first",
    },
    {
      key: "breed",
      label: "Breed",
      values: state.breeds,
      options: options.breedOptions,
      setter: (v) => setters.setBreeds((p) => toggle(p, v)),
      disabled: !hasAnimal,
      tip: "Select a category first",
    },
    {
      key: "forwhich",
      label: "For Which",
      values: state.forWhich,
      options: options.forWhichOptions,
      setter: (v) => setters.setForWhich((p) => toggle(p, v)),
      disabled: !hasAnimal,
      tip: "Select a category first",
    },
    {
      key: "range",
      label: "Range",
      values: state.ranges,
      options: RANGES_LIST,
      setter: (v) => setters.setRanges((p) => toggle(p, v)),
    },
    {
      key: "size",
      label: "Size",
      values: state.sizes,
      options: SIZES_LIST,
      setter: (v) => setters.setSizes((p) => toggle(p, v)),
    },
    {
      key: "color",
      label: "Color",
      values: state.colors,
      options: COLORS_LIST,
      setter: (v) => setters.setColors((p) => toggle(p, v)),
    },
  ];

  const group = groups.find((g) => g.key === renderedKey);

  return (
    <div
      className={`overflow-hidden border-t border-white/10 bg-[#141412] text-white transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-10xl px-6 py-6 sm:py-7 lg:px-8">
        {group ? (
          <FilterSheetContent
            group={group}
            onClose={onClose}
            colorSwatches={COLOR_SWATCHES_MAP}
            translateName={translateName}
            isFrench={isFrench}
          />
        ) : null}
      </div>
    </div>
  );
}

function FilterSheetContent({
  group,
  onClose,
  colorSwatches,
  translateName,
  isFrench,
}) {
  const { t } = useTranslation("filter");
  const [q, setQ] = useState("");
  const searchable = shouldShowSearchInput(group);
  const filtered =
    searchable && q
      ? group.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
      : group.options;
  const displayTitle = t(`labels.${group.key}`, group.label);
  const searchPlaceholder = t("searchGroupPlaceholder", "Search {{label}}…", {
    label: displayTitle.toLowerCase(),
  });

  useEffect(() => {
    setQ("");
  }, [group.key]);

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
            {t("filterBy", "Filter by")}
          </p>
          <h3 className="mt-1.5 flex items-center gap-3 text-[22px] font-extralight uppercase leading-none tracking-[-0.02em] text-white">
            {displayTitle}
            <CountBadge count={group.values.length} tone="light" />
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {group.values.length > 0 && (
            <button
              type="button"
              // setter toggles, so toggling every selected value clears the group
              onClick={() => group.values.forEach((v) => group.setter(v))}
              className="inline-flex h-9 items-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white cursor-pointer"
            >
              <LuRotateCcw className="h-3 w-3" />
              {t("clear", "Clear")}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center border border-white/20 text-white transition-colors hover:bg-white hover:text-black cursor-pointer"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>
      </div>
      {searchable && (
        <GroupSearch
          value={q}
          onChange={setQ}
          placeholder={searchPlaceholder}
          tone="dark"
        />
      )}
      {filtered.length === 0 ? (
        <div className="text-[13px] text-white/45">
          {t("noOptionsAvailable", "No options available.")}
        </div>
      ) : (
        <OptionList
          group={group}
          filtered={filtered}
          searchable={searchable}
          colorSwatches={colorSwatches}
          translateName={translateName}
          maxHeight="max-h-[300px]"
          tone="dark"
        />
      )}
    </>
  );
}
// ───────────── Sort Menu ─────────────

function SortMenu({ value, onChange, tone = "light" }) {
  const dark = tone === "dark";
  const { t } = useTranslation("filter");
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef(null);
  const opts = [
    "Featured",
    "Newest",
    "Price · low to high",
    "Price · high to low",
  ];

  const getSortLabel = (key) => {
    switch (key) {
      case "Featured":
        return t("sortOptions.featured", "Featured");
      case "Newest":
        return t("sortOptions.newest", "Newest");
      case "Price · low to high":
        return t("sortOptions.priceLowToHigh", "Price · low to high");
      case "Price · high to low":
        return t("sortOptions.priceHighToLow", "Price · high to low");
      default:
        return key;
    }
  };

  const handleOpen = () => {
    if (open) {
      handleClose();
    } else {
      setIsClosing(false);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleSelect = (o) => {
    onChange(o);
    handleClose();
  };

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-12 items-center gap-3 border px-3.5 text-left transition-colors cursor-pointer sm:px-4 ${
          dark
            ? `bg-white/[0.06] text-white backdrop-blur-sm ${open ? "border-white" : "border-white/20 hover:border-white/50"}`
            : `bg-white text-black ${open ? "border-black" : "border-black/15 hover:border-black"}`
        }`}
      >
        <LuArrowDownUp className="h-4 w-4 shrink-0" />
        <span className="flex min-w-0 flex-col leading-none">
          <span className={`hidden text-[9px] font-semibold uppercase tracking-[0.22em] sm:block ${dark ? "text-white/50" : "text-black/45"}`}>
            {t("sort", "Sort")}
          </span>
          <span className="max-w-[92px] truncate text-[12px] font-semibold sm:mt-1 sm:max-w-[150px]">
            {getSortLabel(value)}
          </span>
        </span>
        <LuChevronDown
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-in-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-[45] mt-2 w-60 origin-top border border-black/10 bg-white py-1.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.3)]"
          style={{
            animation: isClosing
              ? "sortMenuClose 0.2s cubic-bezier(0.4, 0, 1, 1) forwards"
              : "sortMenuOpen 0.2s cubic-bezier(0, 0, 0.2, 1) forwards",
          }}
        >
          <style>{`
            @keyframes sortMenuOpen {
              from { opacity: 0; transform: scaleY(0.85) translateY(-6px); }
              to   { opacity: 1; transform: scaleY(1)    translateY(0);    }
            }
            @keyframes sortMenuClose {
              from { opacity: 1; transform: scaleY(1)    translateY(0);    }
              to   { opacity: 0; transform: scaleY(0.85) translateY(-6px); }
            }
          `}</style>
          <p className="px-4 pb-2 pt-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-black/40">
            {t("sort", "Sort")}
          </p>
          {opts.map((o) => {
            const selected = value === o;
            return (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                key={o}
                onClick={() => handleSelect(o)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[#f5f4f0] cursor-pointer ${
                  selected ? "font-semibold text-black" : "text-[#444]"
                }`}
              >
                {getSortLabel(o)}
                {selected && <LuCheck className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
