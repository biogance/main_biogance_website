


"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
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
  LuBookOpen 
} from "react-icons/lu";

import Navbar from "../Navbar";
import Footer from "../Footer";
import { LandingCards } from "../Landing/LandingCards";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

const GROUP_LABELS_FR = {
  "Category": "Catégorie",
  "Universe": "Univers",
  "Family": "Famille",
  "Specificity": "Spécificité",
  "Needs": "Besoins",
  "Breed": "Race",
  "For Which": "Pour qui",
  "Range": "Gamme",
  "Size": "Taille",
  "Color": "Couleur",
  "Price": "Prix"
};

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
    if (catName.includes("dog") && (text.includes("dog") || text.includes("chien") || text.includes("puppy") || text.includes("hound") || text.includes("terrier"))) {
      shouldAdd = true;
    } else if (catName.includes("cat") && (text.includes("cat") || text.includes("chat") || text.includes("kitten"))) {
      shouldAdd = true;
    } else if (catName.includes("horse") && (text.includes("horse") || text.includes("cheval") || text.includes("poney") || text.includes("pony"))) {
      shouldAdd = true;
    } else if (catName.includes("bird") && (text.includes("bird") || text.includes("poultry") || text.includes("oiseau"))) {
      shouldAdd = true;
    } else if (catName.includes("reptile") && (text.includes("reptile") || text.includes("turtle") || text.includes("tortue") || text.includes("snake") || text.includes("gecko"))) {
      shouldAdd = true;
    } else if (catName.includes("mammal") && (text.includes("rabbit") || text.includes("hamster") || text.includes("bunny") || text.includes("guinea") || text.includes("rodent") || text.includes("ferret") || text.includes("mammal") || text.includes("rongeur"))) {
      shouldAdd = true;
    } else if (catName.includes("puppies") && text.includes("puppy")) {
      shouldAdd = true;
    } else {
      if (text.includes(catName) || (catFrenchName && text.includes(catFrenchName))) {
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
        swatches[c] = `linear-gradient(135deg, ${parts[0]} 50%, ${parts[1]} 50%)`;
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

const extendProductWithFilters = (product, rangesList, sizesList, colorsList, categoriesFromApi) => {
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

  let color = colorsList[Math.abs(hashString(name + "color")) % colorsList.length];
  for (const c of colorsList) {
    if (text.includes(c.toLowerCase())) {
      color = c;
      break;
    }
  }

  const catObj = categoriesFromApi.find(c => c.name === firstCategoryName);

  // Derive universe values dynamically
  const catUniverses = catObj?.sub_categories?.filter(s => s.type === "universe") || [];
  const universeObj = catUniverses.length > 0 
    ? catUniverses[Math.abs(hashString(name + "universe")) % catUniverses.length] 
    : null;
  const universeVal = universeObj ? universeObj.name : "";

  // Derive family values dynamically from universeObj sub_categories
  const uniFamilies = universeObj?.sub_categories?.filter(s => s.type === "family") || [];
  const familyObj = uniFamilies.length > 0
    ? uniFamilies[Math.abs(hashString(name + "family")) % uniFamilies.length]
    : null;
  const familyVal = familyObj ? familyObj.name : "";

  // Derive specificity values dynamically from familyObj sub_categories
  const famSpecs = familyObj?.sub_categories?.filter(s => s.type === "specificity") || [];
  const specObj = famSpecs.length > 0
    ? famSpecs[Math.abs(hashString(name + "specificity")) % famSpecs.length]
    : null;
  const specVal = specObj ? specObj.name : "";

  // Derive need values dynamically from specObj sub_categories
  const specNeeds = specObj?.sub_categories?.filter(s => s.type === "need") || [];
  const needObj = specNeeds.length > 0
    ? specNeeds[Math.abs(hashString(name + "need")) % specNeeds.length]
    : null;
  const needVal = needObj ? needObj.name : "";

  // Derive breed values dynamically
  const catBreeds = catObj?.breeds || [];
  const breedVal = catBreeds.length > 0
    ? catBreeds[Math.abs(hashString(name + "breed")) % catBreeds.length].name
    : "";

  // Derive for_which values dynamically
  const catForWhich = catObj?.sub_categories?.filter(s => s.type === "for_which") || [];
  const forWhichVal = catForWhich.length > 0 
    ? catForWhich[Math.abs(hashString(name + "forwhich")) % catForWhich.length].name 
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
      title: <>{t("category.titlePart1", "All ")}<em className="font-serif italic">{categoryName}</em><span className="block">{t("category.titlePart3", "products.")}</span></>,
      description: t("category.description", "Browse our complete range of formulations crafted for this category — filtered by family, need and ritual."),
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
        title: <>{t("recommended.titlePart1", "Picked ")}<em className="font-serif italic">{t("recommended.titlePart2", "for your")}</em><span className="block">{t("recommended.titlePart3", "companions.")}</span></>,
        description: t("recommended.description", "A personal edit drawn from your recent visits, favourites and the rituals your animals respond to best."),
        Icon: LuSparkles,
        accent: "text-amber-700",
      };
    case "best":
      return {
        key: "best",
        crumbLabel: t("best.crumbLabel", "Best Products"),
        eyebrow: t("best.eyebrow", "Best products · Editor's selection"),
        title: <>{t("best.titlePart1", "The ")}<em className="font-serif italic">{t("best.titlePart2", "very best")}</em><span className="block">{t("best.titlePart3", "of Biogance.")}</span></>,
        description: t("best.description", "Formulations that earned their place — chosen by our laboratory and reviewed by groomers, vets and breeders."),
        Icon: LuAward,
        accent: "text-emerald-700",
      };
    case "popular":
      return {
        key: "popular",
        crumbLabel: t("popular.crumbLabel", "Popular This Week"),
        eyebrow: t("popular.eyebrow", "Popular this week"),
        title: <>{t("popular.titlePart1", "What everyone is ")}<em className="font-serif italic">{t("popular.titlePart2", "reaching")}</em><span className="block">{t("popular.titlePart3", "for right now.")}</span></>,
        description: t("popular.description", "Most-loved bottles across our community over the last seven days — refined by animal, family and ritual."),
        Icon: LuFlame,
        accent: "text-rose-700",
      };
    case "search":
      return {
        key: "search",
        crumbLabel: t("search.crumbLabel", "Search"),
        eyebrow: q ? t("search.eyebrowWithQuery", "Search results · “{{q}}”", { q }) : t("search.eyebrow", "Search results"),
        title: <>{q ? <>{t("search.titleWithQuery", "Results for ")}<em className="font-serif italic">“{q}”</em></> : <>{t("search.titleWithoutQuery", "Search the ")}<em className="font-serif italic">{t("search.titleWithoutQueryPart2", "catalogue")}</em></>}<span className="block">{t("search.titlePart3", "across our library.")}</span></>,
        description: t("search.description", "Use the filters to narrow by species, breed, need or range — your keyword stays applied."),
        Icon: LuSearch,
        accent: "text-stone-700",
      };
    case "ads":
    case "campaign":
      return {
        key: "ads",
        crumbLabel: t("ads.crumbLabel", "Campaign"),
        eyebrow: t("ads.eyebrow", "Featured campaign"),
        title: <>{t("ads.titlePart1", "The ")}<em className="font-serif italic">{t("ads.titlePart2", "edit")}</em> <span className="block">{t("ads.titlePart3", "you came in for.")}</span></>,
        description: t("ads.description", "A focused selection from the campaign that brought you here — all complementary products, in one place."),
        Icon: LuMegaphone,
        accent: "text-indigo-700",
      };
    default:
      return {
        key: "catalogue",
        crumbLabel: t("catalogue.crumbLabel", "Catalogue"),
        eyebrow: t("catalogue.eyebrow", "Catalogue · Vol. 04"),
        title: <>{t("catalogue.titlePart1", "Care, ")}<em className="font-serif italic">{t("catalogue.titlePart2", "refined")}</em><span className="block">{t("catalogue.titlePart3", "for every species.")}</span></>,
        description: t("catalogue.description", "A living index of formulations — filtered by animal, family, need and ritual. Made in France, certified by nature."),
        Icon: LuBookOpen,
        accent: "text-stone-700",
      };
  }
}

const SkeletonCard = () => (
  <div className="w-full animate-pulse min-h-[420px]" aria-hidden>
    <div className="bg-stone-100 aspect-[7/10] mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 shimmer-anim" />
    </div>
    <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
    <div className="h-4 bg-stone-100 rounded w-1/4" />
  </div>
);

// ───────────── Page Component ─────────────
export default function FilterProducts() {
  const searchParams = useSearchParams();
  const source = searchParams ? searchParams.get("source") : undefined;
  const q = searchParams ? searchParams.get("q") : undefined;
  const from = searchParams ? searchParams.get("from") : undefined;
  const categoryName = searchParams ? searchParams.get("category_name") : undefined;

  const { t, i18n } = useTranslation("filter");
  const ctx = getShopContext(source, q, categoryName, t);
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
  const queryDebounceRef = useRef(null);

  useEffect(() => {
    const val = q || "";
    setQuery(val);
    setDebouncedQuery(val);
  }, [q]);

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 1000);
  };

  const [apiData, setApiData] = useState(null);

  // useEffect(() => {
  //   const cached = localStorage.getItem("homePageData");
  //   if (cached) setApiData(JSON.parse(cached));
  // }, []);

  useEffect(() => {
    const loadFromSplash = () => {
      const cached = localStorage.getItem('splashData');
      if (cached) {
        try { setApiData(JSON.parse(cached)); } catch (e) {}
      }
    };
    loadFromSplash();
    window.addEventListener('splashDataReady', loadFromSplash);
    return () => window.removeEventListener('splashDataReady', loadFromSplash);
  }, []);

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
  const RANGES_LIST = useMemo(() => buildRangesList(apiData), [apiData]);
  const SIZES_LIST = useMemo(() => buildSizesList(apiData), [apiData]);
  const COLORS_LIST = useMemo(() => buildColorsList(apiData), [apiData]);
  const COLOR_SWATCHES_MAP = useMemo(() => buildColorSwatches(COLORS_LIST), [COLORS_LIST]);

  const mapProducts = (items) => items.map(item => ({
    id: item.id,
    name: item.name,
    french_name: item.french_name || '',
    english_seo_keyword: item.english_seo_keyboard || item.english_seo_keyword || '',
    french_seo_keyword: item.french_seo_keyword || '',
    subtitle: item.subtitle || (item.products?.[0]?.description ? item.products[0].description.slice(0, 50) + "..." : "Care formulation"),
    price: parseFloat(item.price || (item.products?.[0]?.price) || '0'),
    oldPrice: item.products?.[0]?.price ? parseFloat(item.products[0].price) * 1.2 : null,
    discount: item.discount || (item.products?.[0]?.off) || '',
    tag: item.discount || (item.products?.[0]?.off) || null,
    image: item.image || (item.products?.[0]?.images[0]?.media ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}` : ''),
    images: item.images || (item.products?.[0]?.images?.map(img => `https://d18f57oyxifcsh.cloudfront.net/${img.media}`) || ['']),
    videoUrl: item.products?.[0]?.video?.media ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].video.media}` : null,
    liked: item.liked ?? item.favorites_exists,
    productsCount: item.products?.length || 1,
    products: item.products || [],
    description: item.description || '',
    french_description: item.french_description || '',
    product_label: item.product_label || '',
    french_product_label: item.french_product_label || ''
  }));

  const [searchedProducts, setSearchedProducts] = useState([]);
  const searchedProductsRef = useRef([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingRef = useRef(false);


  const sentinelRef = useRef(null);

  useEffect(() => {
    searchedProductsRef.current = searchedProducts;
  }, [searchedProducts]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current) {
          isFetchingRef.current = true;
          setPage(prev => {
            if (prev < lastPage) return prev + 1;
            isFetchingRef.current = false;
            return prev;
          });
        }
      },
      { threshold: 0, rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [lastPage, isSearching]);

  const catParam = searchParams ? searchParams.get("category_id") : undefined;

  useEffect(() => {
    if (catParam && categoriesList.length > 0) {
      const matchedCat = categoriesList.find((c) => String(c.id) === String(catParam));
      if (matchedCat) {
        setAnimals([matchedCat.name]);
      }
    }
  }, [catParam, categoriesList]);

  const getSelectedIds = () => {
    const categoryIds = categoriesList
      .filter(cat => animals.includes(cat.name))
      .map(cat => cat.id)
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
      categoriesList.forEach(cat => {
        cat.sub_categories?.forEach(traverse);
      });
      return [...new Set(ids)].join(",");
    };

    const universeIds = findSubcategoryIds("universe", universe);
    const familyIds = findSubcategoryIds("family", families);
    const specificityIds = findSubcategoryIds("specificity", specificity);
    const needIds = findSubcategoryIds("need", needs);
    const forWhichIds = findSubcategoryIds("for_which", forWhich);

    const rangeIds = (apiData?.ranges || [])
      .filter(r => ranges.includes(r.name))
      .map(r => r.id)
      .join(",");

    const breedIds = categoriesList
      .flatMap(cat => cat.breeds || [])
      .filter(b => breeds.includes(b.name))
      .map(b => b.id)
      .join(",");

    return {
      categoryIds,
      universeIds,
      familyIds,
      specificityIds,
      needIds,
      forWhichIds,
      rangeIds,
      breedIds
    };
  };

  // Serialize filters to detect changes and reset page to 1
  const filtersSerialized = useMemo(() => {
    return JSON.stringify({
      query: debouncedQuery, q, animals, universe, families, specificity, needs, ranges, forWhich, price, sort, sizes, colors, breeds
    });
  }, [debouncedQuery, q, animals, universe, families, specificity, needs, ranges, forWhich, price, sort, sizes, colors, breeds]);

  const prevFiltersRef = useRef(filtersSerialized);
  const prevPageRef = useRef(page);
  const hasInitializedRef = useRef(false);

  useEffect(() => {


    // Detect if filters changed, reset page to 1
    let targetPage = page;
    const filtersChanged = prevFiltersRef.current !== filtersSerialized;
    const pageChanged = prevPageRef.current !== page;

    if (filtersChanged) {
      prevFiltersRef.current = filtersSerialized;
      targetPage = 1;
      setPage(1);
      setHasSearched(false);
      searchedProductsRef.current = [];
      setSearchedProducts([]);
    } else if (!pageChanged && hasInitializedRef.current) {
      // apiData refreshed but nothing changed — don't re-fire
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
      breedIds
    } = getSelectedIds();

    const body = {
      keyword: (debouncedQuery || q || "").trim(),
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
      per_page: 20,
      ...(token ? { token } : { device_id: getDeviceId() })
    };

    axios.post(`${BASE_URL}/web/search`, body)
      .then((res) => {
        if (res.data.status) {
          const rawItems = Array.isArray(res.data.data) 
            ? res.data.data 
            : (res.data.data?.data && Array.isArray(res.data.data.data)) 
              ? res.data.data.data 
              : [];
          
          const mapped = mapProducts(rawItems);
          const unique = [];
          const seen = new Set();
          
          const baseItems = targetPage === 1 ? [] : searchedProductsRef.current;
          const allItems = [...baseItems, ...mapped];

          for (const p of allItems) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              unique.push(extendProductWithFilters(p, RANGES_LIST, SIZES_LIST, COLORS_LIST, categoriesList));
            }
          }
          const hasMore = res.data.data?.last_page 
            ? targetPage < res.data.data.last_page 
            : rawItems.length >= 20;

          setSearchedProducts(unique);
          setHasSearched(true);
          setTotalCount(res.data.data?.total ?? unique.length);
          setLastPage(res.data.data?.last_page || (hasMore ? targetPage + 1 : targetPage));
         
        } else {
          toast.error(res.data.action_message || res.data.action || "Something went wrong.");
        }
      })
      .catch((err) => {
        console.error("FilterProducts Search Error:", err);
        toast.error("Failed to load products from search API.");
      })
      .finally(() => {
        setIsSearching(false);
        setIsFetchingMore(false);
        isFetchingRef.current = false;
      });
  }, [
    apiData,
    filtersSerialized,
    page
  ]);

  const filteredProducts = searchedProducts;
  const allProducts = filteredProducts;

  const hasAnimal = animals.length > 0;
  const hasUniverse = universe.length > 0;
  const hasFamily = families.length > 0;
  const hasSpec = specificity.length > 0;

  const selectedCategoryObjs = useMemo(() => {
    return categoriesList.filter(cat => animals.includes(cat.name));
  }, [animals, categoriesList]);

  // Universe options: sub_categories of categories where type === "universe"
  const universeOptions = useMemo(() => {
    const options = new Set();
    selectedCategoryObjs.forEach(cat => {
      if (cat.sub_categories) {
        cat.sub_categories.forEach(sub => {
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
    selectedCategoryObjs.forEach(cat => {
      if (cat.sub_categories) {
        cat.sub_categories.forEach(sub => {
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
    selectedCategoryObjs.forEach(cat => {
      cat.sub_categories?.forEach(sub => {
        if (sub.type === "universe") {
          sub.sub_categories?.forEach(fam => {
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
    selectedCategoryObjs.forEach(cat => {
      cat.sub_categories?.forEach(sub => {
        if (sub.type === "universe") {
          sub.sub_categories?.forEach(fam => {
            if (fam.type === "family" && families.includes(fam.name)) list.push(fam);
          });
        }
      });
    });
    return list;
  }, [selectedCategoryObjs, families]);

  // Specificity options: sub_categories of family where type === "specificity"
  const specificityOptions = useMemo(() => {
    const options = new Set();
    selectedFamilyObjs.forEach(fam => {
      if (fam.sub_categories) {
        fam.sub_categories.forEach(sub => {
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
    selectedFamilyObjs.forEach(fam => {
      if (fam.sub_categories) {
        fam.sub_categories.forEach(sub => {
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
    selectedSpecificityObjs.forEach(spec => {
      if (spec.sub_categories) {
        spec.sub_categories.forEach(sub => {
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
    selectedCategoryObjs.forEach(cat => {
      if (cat.breeds) {
        cat.breeds.forEach(breed => {
          options.add(breed.name);
        });
      }
    });
    return Array.from(options);
  }, [selectedCategoryObjs]);

  // For Which options: sub_categories of categories where type === "for_which"
  const forWhichOptions = useMemo(() => {
    const options = new Set();
    selectedCategoryObjs.forEach(cat => {
      if (cat.sub_categories) {
        cat.sub_categories.forEach(sub => {
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
      c.push({ label: a, clear: () => setAnimals((p) => p.filter((x) => x !== a)) });
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
      [colors, setColors],
    ].forEach(([arr, setter]) => {
      arr.forEach((v) => c.push({ label: v, clear: () => setter((p) => p.filter((x) => x !== v)) }));
    });
    return c;
  }, [animals, universe, families, specificity, needs, breeds, forWhich, ranges, sizes, colors]);

  const clearAll = () => {
    setAnimals([]); setUniverse([]); setFamilies([]); setSpecificity([]); setNeeds([]);
    setBreeds([]); setForWhich([]); setRanges([]); setSizes([]); setColors([]);
  };

  return (
    <div className="min-h-screen mt-30 bg-white text-stone-900">
      <Navbar isVideoVisible={!isHeaderTouchingNav} scrolledBlur={true} />

      <style dangerouslySetInnerHTML={{
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
  display: none; /* Chrome/Safari */
}
        `
      }} />

      {/* Editorial header — context aware */}
      <section ref={headerRef} className="border-b border-stone-900/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-8">
          {/* Row 1 — breadcrumb + back */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            <nav className="flex items-center gap-2">
              <a href="/" className="hover:text-stone-900">{t("home", "Home")}</a>
             
              {ctx.key !== "catalogue" && (
                <>
                  <span className="text-stone-300">/</span>
                  <span className="text-stone-900">{ctx.crumbLabel}</span>
                </>
              )}
            </nav>
            {from ? (
              <a
                href={from}
                className="group inline-flex items-center gap-2 text-stone-600 transition hover:text-stone-900"
              >
                <LuArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                {t("backToPrevious", "Back to previous")}
              </a>
            ) : (
              <span className="hidden sm:inline text-stone-400">
                {t("speciesCount", "{{count}} species", { count: categoriesList.length })} · {t("formulationsCount", "{{count}} formulations", { count: allProducts.length })}
              </span>
            )}
          </div>

          {/* Row 2 — editorial hero */}
          <div className="grid grid-cols-12 gap-x-8 gap-y-8 pt-6 pb-10">
            {/* Left: eyebrow + headline */}
            <div className="col-span-12 lg:col-span-9">
              <div className="inline-flex items-center gap-2.5">
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/[0.04] ${ctx.accent}`}>
                   <ctx.Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.28em] text-stone-700">
                  {ctx.eyebrow}
                </span>
              </div>
              <h1
  className="mt-6 font-serif text-[clamp(44px,6.6vw,92px)] leading-[0.92] tracking-[-0.01em] text-stone-900 pb-1"
  style={{
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }}
>
  {ctx.title}
</h1>
            </div>

            {/* Right: description + meta line */}
            <aside className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-3">
              <p className="text-[13.5px] leading-[1.65] text-stone-600">
                {ctx.description}
              </p>

              {ctx.key === "search" && q ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10.5px] uppercase tracking-[0.24em] text-stone-500">{t("keyword", "Keyword")}</span>
                  <span className="inline-flex items-start gap-2 rounded-lg bg-stone-900 px-3 py-2 text-[11px] tracking-[0.05em] text-white max-w-[200px]">
                    <LuSearch className="h-3 w-3 shrink-0 mt-0.5" />
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                      }}
                    >{q}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 border-t border-stone-900/10 pt-4">
                  <span className="font-serif text-3xl leading-none text-stone-900">
                    {totalCount}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.24em] text-stone-500">
                    {t("productsInView", "products in this view")}
                  </span>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Sticky filter rail */}
      <FilterRail
        categoriesList={categoriesList}
        state={{
          animals, universe, families, specificity, needs, breeds, forWhich, ranges, sizes, colors, price,
        }}
        setters={{
          setAnimals, setUniverse, setFamilies, setSpecificity, setNeeds, setBreeds, setForWhich,
          setRanges, setSizes, setColors, setPrice,
        }}
        options={{ familyOptions, universeOptions, specificityOptions, needsOptions, breedOptions, forWhichOptions }}
        hasAnimal={hasAnimal}
        hasUniverse={hasUniverse}
        hasFamily={hasFamily}
        hasSpec={hasSpec}
        dynamicLists={{ RANGES_LIST, SIZES_LIST, COLORS_LIST, COLOR_SWATCHES_MAP, translateName, isFrench }}
      />

      {/* Result meta + chips */}
      <section className="mx-auto max-w-[1500px] px-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-900/10 pb-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl">{totalCount}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">{t("productsInView", "products in view")}</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-5">
            <div className="group relative flex w-full max-w-md items-center">
              <LuSearch className="pointer-events-none absolute left-4 h-4 w-4 text-stone-400 transition group-focus-within:text-stone-900" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={t("searchPlaceholder", "Search shampoos, sprays, rituals…")}
                className="h-11 w-full rounded-full border border-stone-900/15 bg-stone-50/60 pl-11 pr-10 text-sm placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setDebouncedQuery(""); clearTimeout(queryDebounceRef.current); }}
                  className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                  aria-label={t("clearSearch", "Clear search")}
                >
                  <LuX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">{t("sort", "Sort")}</span>
            <SortMenu value={sort} onChange={setSort} />
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {activeChips.map((c, i) => (
              <span
                key={i}
                className="group inline-flex items-center gap-1.5 rounded-full bg-stone-100 py-1.5 pl-3.5 pr-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-200"
              >
                {translateName(c.label)}
                <button
                  onClick={c.clear}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-300 hover:text-stone-700 cursor-pointer"
                  aria-label={`Remove ${translateName(c.label)}`}
                >
                  <LuX className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400 underline underline-offset-4 transition hover:text-stone-700 cursor-pointer"
            >
              {t("resetAll", "Reset all")}
            </button>
          </div>
        )}
      </section>

      {/* Products — grid */}
      <section className="mx-auto max-w-[1500px] px-8 pb-24 pt-10">
        {isSearching ? (
         <div className="grid grid-cols-2 gap-[3px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-[5px]">

            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
          <div 
  className="grid grid-cols-2 gap-[3px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-[5px]"
  style={{ overflowAnchor: "none" }}
>
  {filteredProducts.map((p, i) => (
                <div key={p.id} className="w-full">
                <LandingCards product={p} showNav={true} index={i} compact={false} compactButtons={true} raisedLabel={true} />


                </div>
              ))}
             </div>

{isFetchingMore && (
  <div className="grid grid-cols-2 gap-[3px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-[5px] mt-[3px]">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={`more-${i}`} />
    ))}
  </div>
)}
{filteredProducts.length === 0 && hasSearched && (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                  <LuSearch className="h-7 w-7 text-stone-400" />
                </div>
                <p className="font-serif text-2xl text-stone-800">{t("noResultsFound", "No results found")}</p>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-stone-500">
                  {t("noResultsDesc", "Try adjusting your filters or keyword — a small tweak often reveals the right formulation.")}
                </p>
              </div>
            )}
          </>
        )}
      </section>

   {/* Sentinel: always render when more pages exist to prevent layout thrash on macOS Chrome */}
   {page < lastPage && (
     <div ref={sentinelRef} className="h-1" aria-hidden style={{ overflowAnchor: "none" }} />
   )}

      <Footer />
    </div>
  );
}

// ───────────── Filter Rail ─────────────
function FilterRail({ categoriesList, state, setters, options, hasAnimal, hasUniverse, hasFamily, hasSpec, dynamicLists }) {
  const { t } = useTranslation("filter");
  const { RANGES_LIST, SIZES_LIST, COLORS_LIST, COLOR_SWATCHES_MAP, translateName, isFrench } = dynamicLists;
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
      key: "animal", label: "Category", values: state.animals,
      options: categoriesList.map((c) => c.name),
      setter: (v) => setters.setAnimals((p) => toggle(p, v)),
    },
    {
      key: "family", label: "Family", values: state.families, options: options.familyOptions,
      setter: (v) => setters.setFamilies((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select a category first",
    },
    {
      key: "specificity", label: "Specificity", values: state.specificity, options: options.specificityOptions,
      setter: (v) => setters.setSpecificity((p) => toggle(p, v)),
      disabled: !hasFamily, tip: "Select a family first",
    },
    {
      key: "needs", label: "Needs", values: state.needs, options: options.needsOptions,
      setter: (v) => setters.setNeeds((p) => toggle(p, v)),
      disabled: !hasSpec, tip: "Select a specificity first",
    },
    {
      key: "breed", label: "Breed", values: state.breeds, options: options.breedOptions,
      setter: (v) => setters.setBreeds((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select a category first",
    },
    {
      key: "forwhich", label: "For Which", values: state.forWhich, options: options.forWhichOptions,
      setter: (v) => setters.setForWhich((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select a category first",
    },
    { key: "range", label: "Range", values: state.ranges, options: RANGES_LIST, setter: (v) => setters.setRanges((p) => toggle(p, v)) },
    { key: "size", label: "Size", values: state.sizes, options: SIZES_LIST, setter: (v) => setters.setSizes((p) => toggle(p, v)) },
    { key: "color", label: "Color", values: state.colors, options: COLORS_LIST, setter: (v) => setters.setColors((p) => toggle(p, v)) },
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
    setters.setAnimals([]); setters.setUniverse([]); setters.setFamilies([]); setters.setSpecificity([]);
    setters.setNeeds([]); setters.setBreeds([]); setters.setForWhich([]);
    setters.setRanges([]); setters.setSizes([]); setters.setColors([]);
  };

  return (
    <div ref={ref} className="sticky top-[104px] z-39 border-y border-stone-900/10 bg-white/95 backdrop-blur">
      {/* Mobile: single prominent CTA that opens the full filters modal */}
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 md:hidden">
        <button
          onClick={() => setAllOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <LuSlidersHorizontal className="h-4 w-4" />
          {t("filters", "Filters")}
          {totalActive > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-semibold text-stone-900">
              {totalActive}
            </span>
          )}
        </button>
       <button
  onClick={() => setOpenKey(openKey === "price" ? null : "price")}
  className={`flex shrink-0 items-center gap-1.5 rounded-full border border-stone-900/15 px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-stone-700 cursor-pointer ${openKey === "price" ? "bg-stone-100 text-stone-900" : ""}`}
>
  €{state.price}
  <LuChevronDown className={`h-3 w-3 transition ${openKey === "price" ? "rotate-180" : ""}`} />
</button>
      </div>

      {/* Desktop / tablet: existing horizontal tab rail */}
      <div className="relative hidden md:block">
        <div className="filter-rail-scroll mx-auto flex max-w-[1500px] items-stretch gap-1 overflow-x-auto px-8">

          <button
            onClick={() => setAllOpen(true)}
            className="flex items-center gap-2 pr-4 text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 cursor-pointer"
            title="Open all filters"
          >
            <LuSlidersHorizontal className="h-3.5 w-3.5" /> {t("filter", "Filter")}
            {totalActive > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] text-white leading-none tracking-normal normal-case ai-style-change-1">
                {totalActive}
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
            <LuChevronDown className={`h-3 w-3 transition ${openKey === "price" ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dynamic expanding filter panel container */}
      <FilterPanel
        categoriesList={categoriesList}
        openKey={openKey}
        state={state}
        setters={setters}
        options={options}
        hasAnimal={hasAnimal}
        onClose={() => setOpenKey(null)}
        dynamicLists={{ RANGES_LIST, SIZES_LIST, COLORS_LIST, COLOR_SWATCHES_MAP, translateName, isFrench }}
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

function AllFiltersModal({ groups, price, setPrice, totalActive, onClearAll, onClose, colorSwatches, translateName, isFrench }) {
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
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[10px] text-white">
                {totalActive}
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
          {groups.filter((g) => !g.disabled).map((g) => (
            <ModalGroupSection key={g.key} g={g} colorSwatches={colorSwatches} translateName={translateName} isFrench={isFrench} />
          ))}

          {/* Price */}
          <section className="border-t text-stone-900 border-stone-900/10 py-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-serif text-lg">
                {t("price", "Price")}
              </h3>
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
              <span>€0</span><span>€500</span>
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
            className="rounded-full bg-stone-900 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 cursor-pointer"
          >
            {t("showResults", "Show results")}
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}

function shouldShowSearchInput(group) {
  const largeOptionGroups = ["animal", "universe", "family", "specificity", "breed"];
  if (largeOptionGroups.includes(group.key)) {
    return group.options.length > 30;
  }

  return group.options.length > 20;
}

function ModalGroupSection({ g, colorSwatches, translateName, isFrench }) {
  const { t } = useTranslation("filter");
  const [q, setQ] = useState("");
  const searchable = shouldShowSearchInput(g);
  const filtered = searchable && q
    ? g.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : g.options;
  const isColor = g.key === "color";
  const displayTitle = t(`labels.${g.key}`, g.label);
  const searchPlaceholder = t("searchGroupPlaceholder", { label: displayTitle.toLowerCase() });

  return (
    <section className="border-b border-stone-900/10 py-5 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-lg text-stone-900">{displayTitle}</h3>
          {g.values.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
              {t("selectedCount", "{{count}} selected", { count: g.values.length })}
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
            className="h-9 w-full rounded-full border border-stone-900/15 bg-white pl-8 pr-8 text-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 cursor-pointer">
              <LuX className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-xs text-stone-400">{t("noOptions", "No options")}</div>
      ) : (
        <div className={`flex flex-wrap gap-2 ${searchable ? "max-h-60 overflow-y-auto pr-1" : ""}`}>
          {filtered.map((opt) => {
            const on = g.values.includes(opt);
            const swatch = isColor ? colorSwatches?.[opt] : undefined;
            return (
              <button
                key={opt}
                onClick={() => g.setter(opt)}
                className={`group inline-flex items-center gap-1.5 rounded-full border ${isColor ? "px-1.5 py-1.5" : "px-3.5 py-1.5"} text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer ${
                  on
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
                }`}
              >
                {swatch ? (
  <span
    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-stone-900/15"
    style={{ background: swatch, ...(swatch.includes("gradient") ? {} : { backgroundColor: swatch }) }}
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
    </section>
  );
}

function FilterTab({ group, open, onOpen, translateName, isFrench }) {
  const { t } = useTranslation("filter");
  const count = group.values.length;
  const active = count > 0;
  const displayLabel = t(`labels.${group.key}`, group.label);
  const displayTip = group.disabled ? t(`tips.${group.key}`, group.tip) : undefined;

  return (
    <button
        onClick={onOpen}
        disabled={group.disabled}
        title={group.disabled ? displayTip : undefined}
        className={`flex h-14 items-center gap-2 whitespace-nowrap px-4 text-xs uppercase tracking-[0.18em] transition cursor-pointer font-semibold ai-style-change-3 ${
          group.disabled ? "cursor-not-allowed text-stone-300" : active ? "text-stone-900 font-semibold" : "text-stone-600 hover:text-stone-900"
        } ${open ? "bg-stone-100 text-stone-900" : ""}`}
      >
        {displayLabel}
        {active && (
          <span className="flex h-5 min-w-5 items-center justify-center border border-white border-opacity-15 rounded-full bg-stone-900 text-[10px] text-white leading-none tracking-normal normal-case">{count}</span>
        )}
        <LuChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function FilterPanel({ categoriesList, openKey, state, setters, options, hasAnimal, onClose, dynamicLists }) {
  const { t } = useTranslation("filter");
  const { RANGES_LIST, SIZES_LIST, COLORS_LIST, COLOR_SWATCHES_MAP, translateName, isFrench } = dynamicLists;
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
      key: "animal", label: "Category", values: state.animals,
      options: categoriesList.map((c) => c.name),
      setter: (v) => setters.setAnimals((p) => toggle(p, v)),
    },
    {
      key: "family", label: "Family", values: state.families, options: options.familyOptions,
      setter: (v) => setters.setFamilies((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select a category first",
    },
    {
      key: "specificity", label: "Specificity", values: state.specificity, options: options.specificityOptions,
      setter: (v) => setters.setSpecificity((p) => toggle(p, v)),
      disabled: state.families.length === 0, tip: "Select a family first",
    },
    {
      key: "needs", label: "Needs", values: state.needs, options: options.needsOptions,
      setter: (v) => setters.setNeeds((p) => toggle(p, v)),
      disabled: state.specificity.length === 0, tip: "Select a specificity first",
    },
    {
      key: "breed", label: "Breed", values: state.breeds, options: options.breedOptions,
      setter: (v) => setters.setBreeds((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select a category first",
    },
    {
      key: "forwhich", label: "For Which", values: state.forWhich, options: options.forWhichOptions,
      setter: (v) => setters.setForWhich((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select a category first",
    },
    { key: "range", label: "Range", values: state.ranges, options: RANGES_LIST, setter: (v) => setters.setRanges((p) => toggle(p, v)) },
    { key: "size", label: "Size", values: state.sizes, options: SIZES_LIST, setter: (v) => setters.setSizes((p) => toggle(p, v)) },
    { key: "color", label: "Color", values: state.colors, options: COLORS_LIST, setter: (v) => setters.setColors((p) => toggle(p, v)) },
  ];

  const group = groups.find((g) => g.key === renderedKey);

  return (
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-stone-900/10 bg-stone-100 ${
        isOpen ? "max-h-[500px] opacity-100 py-6 sm:py-7" : "max-h-0 opacity-0 py-0"
      }`}
    >
      <div className="mx-auto max-w-[1500px] px-8">
        {isPrice ? (
  <div className="flex flex-col gap-4 py-1 md:flex-row md:items-center md:gap-6">
    {/* Label + value */}
    <div className="flex items-baseline gap-3 shrink-0">
      <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
        {t("price", "Price")}
      </span>
      <span className="font-serif text-2xl">€{state.price}</span>
      <span className="text-xs text-stone-500">max</span>
    </div>
    {/* Slider + range labels */}
    <div className="flex flex-1 flex-col gap-1.5">
      <input
        type="range" min={0} max={500} value={state.price}
        onChange={(e) => setters.setPrice(Number(e.target.value))}
        className="h-1 w-full accent-stone-900 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-500">
        <span>€0</span><span>€500</span>
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
          <FilterSheetContent group={group} onClose={onClose} colorSwatches={COLOR_SWATCHES_MAP} translateName={translateName} isFrench={isFrench} />
        ) : null}
      </div>
    </div>
  );
}

function FilterSheetContent({ group, onClose, colorSwatches, translateName, isFrench }) {
  const { t } = useTranslation("filter");
  const [q, setQ] = useState("");
  const searchable = shouldShowSearchInput(group);
  const filtered = searchable && q
    ? group.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : group.options;
  const isColor = group.key === "color";
  const displayTitle = t(`labels.${group.key}`, group.label);
  const searchPlaceholder = t("searchGroupPlaceholder", { label: displayTitle.toLowerCase() });

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
              {t("selectedCount", "{{count}} selected", { count: group.values.length })}
            </span>
          )}
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-900/15 hover:bg-stone-100 cursor-pointer">
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
            className="h-10 w-full rounded-full border border-stone-900/15 bg-white pl-9 pr-9 text-sm placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 cursor-pointer">
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
        <div className={`flex flex-wrap gap-2 ${searchable ? "max-h-[320px] overflow-y-auto pr-1" : ""}`}>
          {filtered.map((opt) => {
            const on = group.values.includes(opt);
            const swatch = isColor ? colorSwatches?.[opt] : undefined;
            return (
              <button
                key={opt}
                onClick={() => group.setter(opt)}
                className={`group inline-flex items-center gap-1.5 rounded-full border ${isColor ? "px-1.5 py-1.5" : "px-4 py-2"} text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer ${
                  on
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:shadow-sm"
                }`}
              >
               {swatch ? (
  <span
    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-stone-900/15"
    style={{ background: swatch, ...(swatch.includes("gradient") ? {} : { backgroundColor: swatch }) }}
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
  const opts = ["Featured", "Newest", "Price · low to high", "Price · high to low"];

  const getSortLabel = (key) => {
    switch (key) {
      case "Featured": return t("sortOptions.featured", "Featured");
      case "Newest": return t("sortOptions.newest", "Newest");
      case "Price · low to high": return t("sortOptions.priceLowToHigh", "Price · low to high");
      case "Price · high to low": return t("sortOptions.priceHighToLow", "Price · high to low");
      default: return key;
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
