"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
} from "react-icons/lu";

import Navbar from "../Navbar";
import Footer from "../Footer";
import { LandingCards } from "../Landing/LandingCards";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "@/utils/deviceId";

// Fixed navbar height (matches the `mt-[104px]` / `top-[104px]` used across this page).
const NAVBAR_HEIGHT = 104;

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
  const [price, setPrice] = useState(250);
  const [sort, setSort] = useState("Featured");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [isSearchPending, setIsSearchPending] = useState(false);
  const queryDebounceRef = useRef(null);

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

      {/* Sticky filter rail */}
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

      <section className="mx-auto max-w-10xl px-4 sm:px-6 lg:px-8">
        <section
          ref={headerRef}
          className="-mx-4 sm:-mx-6 lg:-mx-8 bg-[#fbf9f7]"
        >
          <div className="mx-auto max-w-10xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-12 gap-x-8 gap-y-6 pt-6 pb-6">
              {/* Left: headline + count, description underneath */}
              <div className="col-span-12 lg:col-span-8">
                <h4 className="mt-0 flex flex-wrap items-baseline gap-3 font-serif text-3xl sm:text-4xl lg:text-5xl leading-[0.92] tracking-[-0.01em] text-stone-900 pb-1">
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      paddingBottom: "0.1em",
                    }}
                  >
                    {ctx.title}
                  </span>
                  <span className="font-sans text-lg sm:text-xl lg:text-2xl font-normal text-stone-400">
                    ({totalCount})
                  </span>
                </h4>
                <p className="mt-2  max-w-[50vw] text-sm md:text-lg sm:text-xs text-stone-700 rich-text c-desc">
                  {t(
                    "products.shopDescription",
                    "External parasites such as fleas and ticks can quickly affect your dog's comfort and well-being. Walks outdoors or contact with other animals can encourage infestations, leading to itching and skin irritation.",
                  )}
                </p>
              </div>

              {/* Right: search + sort */}
              <div className="col-span-12 flex flex-col justify-center gap-3 lg:col-span-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="group relative flex w-full items-center sm:flex-1 lg:max-w-sm">
                    <LuSearch className="pointer-events-none absolute left-4 h-4 w-4 text-stone-400 transition group-focus-within:text-stone-900" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      placeholder={t(
                        "searchPlaceholder",
                        "Search shampoos, sprays, rituals…",
                      )}
                      className="h-11 w-full border border-stone-900/15 bg-white pl-11 pr-10 text-sm placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                    />
                    {query && (
                      <button
                        onClick={() => {
                          setQuery("");
                          setDebouncedQuery("");
                          clearTimeout(queryDebounceRef.current);
                        }}
                        className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                        aria-label={t("clearSearch", "Clear search")}
                      >
                        <LuX className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      {t("sort", "Sort")}
                    </span>
                    <SortMenu value={sort} onChange={setSort} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

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
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                  <LuSearch className="h-7 w-7 text-stone-400" />
                </div>
                <p className="font-serif text-2xl text-stone-800">
                  {t("noResultsFound", "No results found")}
                </p>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-stone-500">
                  {t(
                    "noResultsDesc",
                    "Try adjusting your filters or keyword — a small tweak often reveals the right formulation.",
                  )}
                </p>
              </div>
            )}

            {filteredProducts.length > 0 && page < lastPage && (
              <div className="flex justify-center pt-10">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="flex items-center gap-2 border border-stone-900 text-stone-900 text-xs font-semibold uppercase tracking-wider px-8 py-3 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFetchingMore && (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {isFetchingMore
                    ? t("loading", "Loading...")
                    : t("loadMore", "Load More")}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {!isSearching && !isSearchPending && recentViews.length > 0 && (
        <section className="mx-auto max-w-10xl px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-center text-lg font-bold uppercase tracking-[0.15em] text-stone-900 mb-8">
            {t("recentlyViewed", "Recently Viewed")}
          </h2>
          <div className="flex justify-center gap-6 flex-wrap">
            {recentViews.slice(0, 3).map((p, i) => (
              <div key={p.id} className="w-[350px]">
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
        </section>
      )}

      {!isSearching && !isSearchPending && featuredBlog && (
        <section className="mx-auto max-w-10xl px-4 sm:px-6 lg:px-8 pb-14">
          <div className="grid grid-cols-1 gap-12 border-t border-stone-900/10 pt-14 lg:grid-cols-2 lg:items-start">
            <div className="lg:sticky lg:top-[200px] lg:self-start">
              <h2 className="mb-4 font-serif text-4xl text-stone-900 sm:text-5xl">
                {isFrench && featuredBlog.french_name
                  ? featuredBlog.french_name
                  : featuredBlog.name}
              </h2>
              {featuredBlog.images?.[0]?.media && (
                <div className="w-full overflow-hidden">
                  <img
                    src={`${MEDIA_URL}${featuredBlog.images[0].media}`}
                    alt={
                      isFrench && featuredBlog.french_name
                        ? featuredBlog.french_name
                        : featuredBlog.name
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div
              className="prose prose-sm max-w-none text-stone-600"
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
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenKey(null);
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
  };

  return (
    <div
      ref={(el) => {
        ref.current = el;
        if (railRef) railRef.current = el;
      }}
      className="sticky top-[64px] lg:top-[104px] z-39 border-b border-stone-900/10 bg-white"
    >
      {/* Mobile: single prominent CTA that opens the full filters modal */}
      <div className="mx-auto flex max-w-10xl items-center gap-3 px-5 py-3 md:hidden">
        <button
          onClick={() => setAllOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <LuSlidersHorizontal className="h-4 w-4" />
          {t("filters", "Filters")}
          {totalActive > 0 && (
            <span
              className="relative ml-1 shrink-0 rounded-full bg-white"
              style={{
                height: "20px",
                width:
                  totalActive >= 100
                    ? "34px"
                    : totalActive >= 10
                      ? "26px"
                      : "20px",
              }}
            >
              <span
                className="absolute text-[10px] font-semibold text-stone-900 tracking-normal normal-case"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  letterSpacing: "normal",
                  lineHeight: "1",
                }}
              >
                {totalActive}
              </span>
            </span>
          )}
        </button>
        <button
          onClick={() => setOpenKey(openKey === "price" ? null : "price")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border border-stone-900/15 px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-stone-700 cursor-pointer ${openKey === "price" ? "bg-stone-100 text-stone-900" : ""}`}
        >
          €{state.price}
          <LuChevronDown
            className={`h-3 w-3 transition ${openKey === "price" ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Desktop / tablet: existing horizontal tab rail */}
      <div className="relative hidden md:block">
        <div className="mx-auto flex max-w-10xl items-stretch gap-3 px-8">
          <div className="filter-rail-scroll flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto">
            <button
              onClick={() => setAllOpen(true)}
              className="flex items-center gap-2 pr-4 text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 cursor-pointer"
              title={t("openAllFilters", "Open all filters")}
            >
              <LuSlidersHorizontal className="h-3.5 w-3.5" />{" "}
              {t("filter", "Filter")}
              {totalActive > 0 && (
                <span
                  className="relative shrink-0 rounded-full bg-stone-900 ai-style-change-1"
                  style={{
                    height: "20px",
                    width:
                      totalActive >= 100
                        ? "34px"
                        : totalActive >= 10
                          ? "26px"
                          : "20px",
                  }}
                >
                  <span
                    className="absolute text-[13px] text-white tracking-normal normal-case"
                    style={{
                      top: "50%",
                      left: "50%",
                      marginLeft: "-0.6px",
                      transform: "translate(-50%, -50%)",
                      letterSpacing: "normal",
                      lineHeight: "1",
                    }}
                  >
                    {totalActive}
                  </span>
                </span>
              )}
            </button>
            {groups.map((g) => (
              <FilterTab
                key={g.key}
                group={g}
                open={openKey === g.key}
                onOpen={() => setOpenKey(openKey === g.key ? null : g.key)}
                translateName={translateName}
                isFrench={isFrench}
              />
            ))}
            <button
              onClick={() => setOpenKey(openKey === "price" ? null : "price")}
              className={`flex h-14 items-center gap-2 whitespace-nowrap px-4 text-xs uppercase tracking-[0.18em] text-stone-600 hover:text-stone-900 cursor-pointer ${openKey === "price" ? "bg-white text-stone-900" : ""}`}
            >
              {t("price", "Price")} · €{state.price}
              <LuChevronDown
                className={`h-3 w-3 transition ${openKey === "price" ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips — shown directly below the filter bar */}
      {activeChips && activeChips.length > 0 && (
        <div className="mx-auto flex max-w-10xl flex-wrap items-center gap-2 px-8 py-2 border-t border-stone-900/10">
          {activeChips.map((c, i) => (
            <span
              key={i}
              className="group inline-flex shrink-0 items-center border border-gray-300 gap-1.5 bg-stone-100 py-1 pl-3 pr-1 text-[11px] font-medium text-stone-700 transition hover:bg-black hover:text-white"
            >
              {c.swatch ? (
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-stone-900/15"
                  style={{
                    background: c.swatch,
                    ...(c.swatch.includes("gradient") ? {} : { backgroundColor: c.swatch }),
                  }}
                  aria-label={c.label}
                />
              ) : (
                translateName(c.label)
              )}
              <button
                onClick={c.clear}
                className="flex h-4 w-4 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-200 hover:text-black cursor-pointer"
                aria-label={t("removeFilter", "Remove {{label}}", { label: translateName(c.label) })}
              >
                <LuX className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllChips}
            className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400 underline underline-offset-4 transition hover:text-stone-700 cursor-pointer"
          >
            {t("resetAll", "Reset all")}
          </button>
        </div>
      )}

      {/* Dynamic expanding filter panel container */}
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

function AllFiltersModal({
  groups,
  price,
  setPrice,
  totalActive,
  onClearAll,
  onClose,
  colorSwatches,
  translateName,
  isFrench,
}) {
  const { t } = useTranslation("filter");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
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
        className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />
      <aside
        className={`relative flex h-full w-full max-w-[560px] flex-col bg-stone-50 shadow-2xl ${
          isClosing ? "animate-slide-out-right" : "animate-slide-in-right"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-900/10 bg-white px-7 py-5">
          <div className="flex items-baseline gap-3">
            <span className="text-xs uppercase tracking-[0.25em] text-stone-500">
              {t("all", "All")}
            </span>
            <h2 className="font-serif text-3xl text-stone-900">
              {t("filters", "Filters")}
            </h2>
            {totalActive > 0 && (
              <span
                className="relative shrink-0 rounded-full bg-stone-900"
                style={{
                  height: "20px",
                  width:
                    totalActive >= 100
                      ? "34px"
                      : totalActive >= 10
                        ? "26px"
                        : "20px",
                }}
              >
                <span
                  className="absolute text-[13px] text-white tracking-normal normal-case"
                  style={{
                    top: "50%",
                    left: "50%",
                    marginLeft: "-0.6px",
                    transform: "translate(-50%, -50%)",
                    letterSpacing: "normal",
                    lineHeight: "1",
                  }}
                >
                  {totalActive}
                </span>
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center text-stone-900 justify-center rounded-full border border-stone-900/15 transition hover:bg-stone-900 hover:text-white cursor-pointer"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
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
          <section className="border-t text-stone-900 border-stone-900/10 py-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-serif text-lg">{t("price", "Price")}</h3>
              <span className="font-serif text-xl">€{price}</span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-1 w-full accent-stone-900 cursor-pointer"
            />
            <div className="mt-2 flex justify-between  text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <span>€0</span>
              <span>€500</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-stone-900/10 bg-white px-7 py-4">
          <button
            onClick={onClearAll}
            className="text-xs uppercase tracking-[0.2em] text-stone-500 underline underline-offset-4 hover:text-stone-900 cursor-pointer"
          >
            {t("resetAll", "Reset all")}
          </button>
          <button
            onClick={handleClose}
            className=" bg-stone-900 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 cursor-pointer"
          >
            {t("showResults", "Show results")}
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
  const isColor = g.key === "color";
  const displayTitle = t(`labels.${g.key}`, g.label);
  const searchPlaceholder = t("searchGroupPlaceholder", "Search {{label}}…", {
    label: displayTitle.toLowerCase(),
  });

  return (
    <section className="border-b border-stone-900/10 py-5 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-lg text-stone-900">{displayTitle}</h3>
          {g.values.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
              {t("selectedCount", "{{count}} selected", {
                count: g.values.length,
              })}
            </span>
          )}
        </div>
      </div>
      {searchable && (
        <div className="relative mb-3">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full border border-stone-900/15 bg-white pl-8 pr-8 text-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2  top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 cursor-pointer"
            >
              <LuX className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-xs text-stone-400">
          {t("noOptions", "No options")}
        </div>
      ) : (
        <div
          className={`flex flex-wrap gap-2 ${searchable ? "max-h-60 overflow-y-auto pr-1" : ""}`}
        >
          {filtered.map((opt) => {
            const on = g.values.includes(opt);
            const swatch = isColor ? colorSwatches?.[opt] : undefined;
            return (
              <button
                key={opt}
                onClick={() => g.setter(opt)}
                className={`group inline-flex items-center gap-1.5 border ${isColor ? "px-1.5 py-1.5" : "px-3.5 py-1.5"} text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer ${
                  on
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
                }`}
              >
                {swatch ? (
                  <span
                    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-stone-900/15"
                    style={{
                      background: swatch,
                      ...(swatch.includes("gradient")
                        ? {}
                        : { backgroundColor: swatch }),
                    }}
                    aria-hidden
                  />
                ) : on ? (
                  <span className="grid place-items-center rounded-full overflow-hidden bg-stone-300 mr-0.5 h-4 w-4">
                    <LuCheck className="h-2.5 w-2.5 stroke-[3] text-black" />
                  </span>
                ) : null}
                {!isColor && translateName(opt)}
              </button>
            );
          })}
        </div>
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
      onClick={onOpen}
      disabled={group.disabled}
      title={group.disabled ? displayTip : undefined}
      className={`flex h-14 items-center gap-2 whitespace-nowrap px-4 text-xs uppercase tracking-[0.18em] transition cursor-pointer font-semibold ai-style-change-3 ${
        group.disabled
          ? "cursor-not-allowed text-stone-300"
          : active
            ? "text-stone-900 font-semibold"
            : "text-stone-600 hover:text-stone-900"
      } ${open ? "bg-stone-100 text-stone-900" : ""}`}
    >
      {displayLabel}
      {active && (
        <span
          className="relative shrink-0  border-opacity-15 rounded-full bg-stone-900 box-border"
          style={{
            height: "20px",
            width: count >= 100 ? "34px" : count >= 10 ? "26px" : "20px",
          }}
        >
          <span
            className="absolute text-[12px] font-medium text-stone-100 tracking-normal normal-case"
            style={{
              top: "50%",
              left: "50%",
              marginLeft: "-0.6px",
              transform: "translate(-50%, -50%)",
              letterSpacing: "normal",
              lineHeight: "1",
            }}
          >
            {count}
          </span>
        </span>
      )}
      <LuChevronDown
        className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
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
  const { t } = useTranslation("filter");
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

  const isPrice = renderedKey === "price";
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
      className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-stone-900/10 bg-stone-100 ${
        isOpen
          ? "max-h-[500px] opacity-100 py-6 sm:py-7"
          : "max-h-0 opacity-0 py-0"
      }`}
    >
      <div className="mx-auto max-w-10xl px-8">
        {isPrice ? (
          <div className="flex flex-col gap-4 py-1 md:flex-row md:items-center md:gap-6">
            {/* Label + value */}
            <div className="flex items-baseline gap-3 shrink-0">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
                {t("price", "Price")}
              </span>
              <span className="font-serif text-2xl">€{state.price}</span>
              <span className="text-xs text-stone-500">{t("max", "max")}</span>
            </div>
            {/* Slider + range labels */}
            <div className="flex flex-1 flex-col gap-1.5">
              <input
                type="range"
                min={0}
                max={500}
                value={state.price}
                onChange={(e) => setters.setPrice(Number(e.target.value))}
                className="h-1 w-full accent-stone-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-500">
                <span>€0</span>
                <span>€500</span>
              </div>
            </div>
            {/* Done button */}
            <button
              onClick={onClose}
              className="self-start rounded-full border border-stone-900 px-4 py-2 text-[10px] uppercase tracking-[0.25em] cursor-pointer bg-white hover:bg-stone-900 hover:text-white transition md:self-auto"
            >
              {t("done", "Done")}
            </button>
          </div>
        ) : group ? (
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
  const isColor = group.key === "color";
  const displayTitle = t(`labels.${group.key}`, group.label);
  const searchPlaceholder = t("searchGroupPlaceholder", "Search {{label}}…", {
    label: displayTitle.toLowerCase(),
  });

  useEffect(() => {
    setQ("");
  }, [group.key]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-stone-500">
            {t("filterBy", "Filter by")}
          </span>
          <h3 className="font-serif text-2xl">{displayTitle}</h3>
          {group.values.length > 0 && (
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
              {t("selectedCount", "{{count}} selected", {
                count: group.values.length,
              })}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-900/15 hover:bg-stone-100 cursor-pointer"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>
      {searchable && (
        <div className="relative mb-4 max-w-md">
          <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full border border-stone-900/15 bg-white pl-9 pr-9 text-sm placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 cursor-pointer"
            >
              <LuX className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-sm text-stone-500">
          {t("noOptionsAvailable", "No options available.")}
        </div>
      ) : (
        <div
          className={`flex flex-wrap gap-2 ${searchable ? "max-h-[320px] overflow-y-auto pr-1" : ""}`}
        >
          {filtered.map((opt) => {
            const on = group.values.includes(opt);
            const swatch = isColor ? colorSwatches?.[opt] : undefined;
            return (
              <button
                key={opt}
                onClick={() => group.setter(opt)}
                className={`group inline-flex items-center gap-1.5 border ${isColor ? "px-1.5 py-1.5" : "px-4 py-2"} text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer ${
                  on
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:shadow-sm"
                }`}
              >
                {swatch ? (
                  <span
                    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-stone-900/15"
                    style={{
                      background: swatch,
                      ...(swatch.includes("gradient")
                        ? {}
                        : { backgroundColor: swatch }),
                    }}
                    aria-hidden
                  />
                ) : on ? (
                  <span className="grid place-items-center overflow-hidden rounded-full bg-white/15 mr-0.5 h-4 w-4">
                    <LuCheck className="h-2.5 w-2.5 stroke-[3] text-white" />
                  </span>
                ) : null}

                {!isColor && translateName(opt)}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
// ───────────── Sort Menu ─────────────

function SortMenu({ value, onChange }) {
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
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 border-b border-stone-900 pb-1 text-sm cursor-pointer"
      >
        {getSortLabel(value)}
        <LuChevronDown
          className="h-3 w-3 transition-transform duration-200 ease-in-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-56 border border-stone-900/10 bg-white p-2 origin-top"
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
          {opts.map((o) => (
            <button
              key={o}
              onClick={() => handleSelect(o)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-stone-100 cursor-pointer ${value === o ? "font-semibold" : ""}`}
            >
              {getSortLabel(o)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
