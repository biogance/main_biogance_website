"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
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

// ───────────── Data Model ─────────────
const ANIMALS = [
  { key: "dog", label: "Dog", icon: "🐶" },
  { key: "cat", label: "Cat & kitten", icon: "🐱" },
  { key: "reptile", label: "Reptile", icon: "🐢" },
  { key: "small_mammal", label: "Small mammal", icon: "🐰" },
  { key: "horse", label: "Horse", icon: "🐴" },
  { key: "bird", label: "Birds & poultry", icon: "🐦" },
];

const FAMILIES = {
  dog: ["Hound", "Terrier", "Sporting", "Companion", "Herding", "Working", "Toy"],
  cat: ["Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll"],
  reptile: ["Lizards", "Snakes", "Turtles", "Geckos"],
  small_mammal: ["Rabbits", "Hamsters", "Guinea Pigs", "Ferrets"],
  horse: ["Sport Horse", "Pony", "Draft Horse"],
  bird: ["Parrots", "Canaries", "Poultry"],
};

const SPECIFICITY = {
  dog: ["Leash Training", "Aggressive Chewers", "Guard Training", "Outdoor Active", "Excessive Barking", "Senior Dogs"],
  cat: ["Indoor", "Outdoor", "Long Hair", "Short Hair", "Senior Cats"],
  reptile: ["Tropical", "Desert", "Aquatic"],
  small_mammal: ["Cage", "Free Roam", "Senior"],
  horse: ["Competition", "Leisure", "Therapy"],
  bird: ["Cage", "Aviary", "Free Flight"],
};

const NEEDS = {
  dog: ["Training Kits", "Outdoor Gear", "Anxiety Relief", "Joint Support", "Grooming", "Skin Care"],
  cat: ["Grooming", "Skin Care", "Anxiety Relief", "Dental"],
  reptile: ["Heat", "Humidity", "Skin Shed"],
  small_mammal: ["Bedding", "Nutrition", "Grooming"],
  horse: ["Coat Care", "Hoof Care", "Joint Support"],
  bird: ["Feather Care", "Beak Care", "Nutrition"],
};

const BREEDS = {
  dog: ["Labrador", "Golden Retriever", "Pomeranian", "German Shepherd", "Husky", "Border Collie", "Pug"],
  cat: ["Persian", "Bengal", "Sphynx", "Birman"],
  reptile: ["Bearded Dragon", "Ball Python", "Leopard Gecko"],
  small_mammal: ["Dwarf Rabbit", "Syrian Hamster", "Holland Lop"],
  horse: ["Arabian", "Quarter Horse", "Thoroughbred"],
  bird: ["African Grey", "Cockatiel", "Budgerigar"],
};

const FOR_WHICH = {
  dog: ["Protection & Work", "Training", "Emotional & Therapy", "Environment", "Maintenance"],
  cat: ["Indoor Life", "Show", "Therapy"],
  reptile: ["Display", "Breeding"],
  small_mammal: ["Companion", "Show"],
  horse: ["Competition", "Leisure"],
  bird: ["Companion", "Breeding"],
};

const RANGES = ["Wood Brush", "Professional", "Sensitive Skin", "Natural Supplements", "Spa Cocoon", "Atopic Skin", "Geraniol Repellent"];
const SIZES = ["120 ml", "250 ml", "500 ml", "700 ml", "1L", "2L"];
const COLORS = ["Green", "Blue", "Orange", "Black", "White", "Yellow"];

const COLOR_SWATCHES = {
  Green: "#3f8a4a",
  Blue: "#3b6fb5",
  Orange: "#e8843c",
  Black: "#111111",
  White: "#f5f5f1",
  Yellow: "#e9c63a",
};



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

const getProductAnimalKeys = (name, subtitle) => {
  const text = `${name} ${subtitle}`.toLowerCase();
  const keys = [];
  if (text.includes("dog") || text.includes("chien") || text.includes("puppy") || text.includes("hound") || text.includes("terrier")) {
    keys.push("dog");
  }
  if (text.includes("cat") || text.includes("chat") || text.includes("kitten")) {
    keys.push("cat");
  }
  if (text.includes("horse") || text.includes("cheval") || text.includes("poney") || text.includes("pony")) {
    keys.push("horse");
  }
  if (text.includes("bird") || text.includes("poultry") || text.includes("oiseau")) {
    keys.push("bird");
  }
  if (text.includes("reptile") || text.includes("turtle") || text.includes("tortue") || text.includes("snake") || text.includes("gecko")) {
    keys.push("reptile");
  }
  if (text.includes("rabbit") || text.includes("hamster") || text.includes("bunny") || text.includes("guinea") || text.includes("rodent") || text.includes("ferret") || text.includes("mammal") || text.includes("rongeur")) {
    keys.push("small_mammal");
  }
  if (keys.length === 0) {
    if (text.includes("universal") || text.includes("all coat") || text.includes("pet") || text.includes("animal")) {
      keys.push("dog", "cat");
    } else {
      keys.push("dog", "cat");
    }
  }
  return keys;
};

const extendProductWithFilters = (product) => {
  const name = product.name || "";
  const subtitle = product.subtitle || "";
  const text = `${name} ${subtitle}`.toLowerCase();

  const animals = getProductAnimalKeys(name, subtitle);

  let range = RANGES[Math.abs(hashString(name)) % RANGES.length];
  for (const r of RANGES) {
    if (text.includes(r.toLowerCase())) {
      range = r;
      break;
    }
  }

  let size = SIZES[Math.abs(hashString(name + "size")) % SIZES.length];
  for (const s of SIZES) {
    if (text.includes(s.toLowerCase())) {
      size = s;
      break;
    }
  }

  let color = COLORS[Math.abs(hashString(name + "color")) % COLORS.length];
  for (const c of COLORS) {
    if (text.includes(c.toLowerCase())) {
      color = c;
      break;
    }
  }

  const firstAnimal = animals[0] || "dog";
  const animalFamilies = FAMILIES[firstAnimal] || [];
  const family = animalFamilies[Math.abs(hashString(name + "family")) % animalFamilies.length];

  const animalSpecs = SPECIFICITY[firstAnimal] || [];
  const spec = animalSpecs[Math.abs(hashString(name + "spec")) % animalSpecs.length];

  const animalNeeds = NEEDS[firstAnimal] || [];
  const need = animalNeeds[Math.abs(hashString(name + "need")) % animalNeeds.length];

  const animalBreeds = BREEDS[firstAnimal] || [];
  const breed = animalBreeds[Math.abs(hashString(name + "breed")) % animalBreeds.length];

  const animalForWhich = FOR_WHICH[firstAnimal] || [];
  const forWhichVal = animalForWhich[Math.abs(hashString(name + "forwhich")) % animalForWhich.length];

  return {
    ...product,
    animals,
    family,
    specificity: spec,
    need,
    breed,
    forWhich: forWhichVal,
    range,
    size,
    color,
  };
};



// ───────────── Context (entry source) ─────────────
function getShopContext(source, q) {
  switch (source) {
    case "recommended":
      return {
        key: "recommended",
        eyebrow: "Recommended · Curated for you",
        title: <>Picked <em className="font-serif italic">for your</em><span className="block">companions.</span></>,
        description: "A personal edit drawn from your recent visits, favourites and the rituals your animals respond to best.",
        Icon: LuSparkles,
        accent: "text-amber-700",
      };
    case "best":
      return {
        key: "best",
        crumbLabel: "Best Products",
        eyebrow: "Best products · Editor's selection",
        title: <>The <em className="font-serif italic">very best</em><span className="block">of Biogance.</span></>,
        description: "Formulations that earned their place — chosen by our laboratory and reviewed by groomers, vets and breeders.",
        Icon: LuAward,
        accent: "text-emerald-700",
      };
    case "popular":
      return {
        key: "popular",
        crumbLabel: "Popular This Week",
        eyebrow: "Popular this week",
        title: <>What everyone is <em className="font-serif italic">reaching</em><span className="block">for right now.</span></>,
        description: "Most-loved bottles across our community over the last seven days — refined by animal, family and ritual.",
        Icon: LuFlame,
        accent: "text-rose-700",
      };
    case "search":
      return {
        key: "search",
        eyebrow: q ? `Search results · “${q}”` : "Search results",
        title: <>{q ? <>Results for <em className="font-serif italic">“{q}”</em></> : <>Search the <em className="font-serif italic">catalogue</em></>}<span className="block">across our library.</span></>,
        description: "Use the filters to narrow by species, breed, need or range — your keyword stays applied.",
        Icon: LuSearch,
        accent: "text-stone-700",
      };
    case "ads":
    case "campaign":
      return {
        key: "ads",
        eyebrow: "Featured campaign",
        title: <>The <em className="font-serif italic">edit</em> you<span className="block">came in for.</span></>,
        description: "A focused selection from the campaign that brought you here — all complementary products, in one place.",
        Icon: LuMegaphone,
        accent: "text-indigo-700",
      };
    default:
      return {
        key: "catalogue",
        crumbLabel: "Catalogue",
        eyebrow: "Catalogue · Vol. 04",
        title: <>Care, <em className="font-serif italic">refined</em><span className="block">for every species.</span></>,
        description: "A living index of formulations — filtered by animal, family, need and ritual. Made in France, certified by nature.",
        Icon: LuBookOpen,
        accent: "text-stone-700",
      };
  }
}

// ───────────── Page Component ─────────────
export default function FilterProducts() {
  const searchParams = useSearchParams();
  const source = searchParams ? searchParams.get("source") : undefined;
  const q = searchParams ? searchParams.get("q") : undefined;
  const from = searchParams ? searchParams.get("from") : undefined;

  const ctx = getShopContext(source, q);
  const [animals, setAnimals] = useState([]);
  const [families, setFamilies] = useState([]);
  const [specificity, setSpecificity] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [forWhich, setForWhich] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [price, setPrice] = useState(60);
  const [sort, setSort] = useState("Featured");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  const [apiData, setApiData] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("homePageData");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const payload = {};

    if (loginData?.data?.token) {
      payload.token = loginData.data.token;
    } else {
      payload.device_id = getDeviceId();
    }

    axios.post(`${BASE_URL}/web/home`, payload)
      .then((res) => {
        if (res.data.status === false) {
          toast.error(res.data.action || "Unable to load products.");
          return;
        }
        localStorage.setItem("homePageData", JSON.stringify(res.data.data));
        setApiData(res.data.data);
      })
      .catch((err) => {
        console.error("FilterProducts API Error:", err);
      });
  }, []);

  const apiProducts = apiData?.popular || [];
  const bestSellerProducts = apiData?.best_seller || [];

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
    liked: item.liked ?? item.favorites_exists
  }));

  const mappedApiProducts = useMemo(() => {
    const popularMapped = mapProducts(apiProducts);
    const bestSellerMapped = mapProducts(bestSellerProducts);
    const all = [...popularMapped, ...bestSellerMapped];
    const seen = new Set();
    const unique = [];
    for (const p of all) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        unique.push(extendProductWithFilters(p));
      }
    }
    return unique;
  }, [apiProducts, bestSellerProducts]);

  const allProducts = mappedApiProducts;

  const hasAnimal = animals.length > 0;
  const hasFamily = families.length > 0;
  const hasSpec = specificity.length > 0;

  const familyOptions = useMemo(() => Array.from(new Set(animals.flatMap((a) => FAMILIES[a] || []))), [animals]);
  const specificityOptions = useMemo(() => Array.from(new Set(animals.flatMap((a) => SPECIFICITY[a] || []))), [animals]);
  const needsOptions = useMemo(() => Array.from(new Set(animals.flatMap((a) => NEEDS[a] || []))), [animals]);
  const breedOptions = useMemo(() => Array.from(new Set(animals.flatMap((a) => BREEDS[a] || []))), [animals]);
  const forWhichOptions = useMemo(() => Array.from(new Set(animals.flatMap((a) => FOR_WHICH[a] || []))), [animals]);

  const activeChips = useMemo(() => {
    const c = [];
    animals.forEach((a) => {
      const animalObj = ANIMALS.find((x) => x.key === a);
      const lab = animalObj ? animalObj.label : a;
      c.push({ label: lab, clear: () => setAnimals((p) => p.filter((x) => x !== a)) });
    });
    [
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
  }, [animals, families, specificity, needs, breeds, forWhich, ranges, sizes, colors]);

  const clearAll = () => {
    setAnimals([]); setFamilies([]); setSpecificity([]); setNeeds([]);
    setBreeds([]); setForWhich([]); setRanges([]); setSizes([]); setColors([]);
  };

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    const activeSearchQuery = (query || q || "").trim().toLowerCase();
    if (activeSearchQuery) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(activeSearchQuery) ||
          p.subtitle?.toLowerCase().includes(activeSearchQuery) ||
          p.french_name?.toLowerCase().includes(activeSearchQuery)
      );
    }

    if (animals.length > 0) {
      result = result.filter((p) =>
        p.animals?.some((a) => animals.includes(a))
      );
    }

    if (families.length > 0) {
      result = result.filter((p) => families.includes(p.family));
    }

    if (specificity.length > 0) {
      result = result.filter((p) => specificity.includes(p.specificity));
    }

    if (needs.length > 0) {
      result = result.filter((p) => needs.includes(p.need));
    }

    if (breeds.length > 0) {
      result = result.filter((p) => breeds.includes(p.breed));
    }

    if (forWhich.length > 0) {
      result = result.filter((p) => forWhich.includes(p.forWhich));
    }

    if (ranges.length > 0) {
      result = result.filter((p) => ranges.includes(p.range));
    }

    if (sizes.length > 0) {
      result = result.filter((p) => sizes.includes(p.size));
    }

    if (colors.length > 0) {
      result = result.filter((p) => colors.includes(p.color));
    }

    result = result.filter((p) => p.price <= price);

    if (sort === "Price · low to high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "Price · high to low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "Newest") {
      result.sort((a, b) => (b.tag === "New" ? 1 : 0) - (a.tag === "New" ? 1 : 0));
    }

    return result;
  }, [allProducts, query, q, animals, families, specificity, needs, breeds, forWhich, ranges, sizes, colors, price, sort]);

  const totalCount = filteredProducts.length;

  return (
    <div className="min-h-screen mt-30 bg-white text-stone-900">
      <Navbar />

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
        `
      }} />

      {/* Editorial header — context aware */}
      <section className="border-b border-stone-900/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-8">
          {/* Row 1 — breadcrumb + back */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            <nav className="flex items-center gap-2">
              <a href="/" className="hover:text-stone-900">Home</a>
             
              {/* <a href="/shop" className="hover:text-stone-900">Catalogue</a> */}
              {ctx.key !== "catalogue" && (
                <>
                  <span className="text-stone-300">/</span>
                  <span className="text-stone-900">{ctx.crumbLabel || ctx.eyebrow.split("·")[0].trim()}</span>
                </>
              )}
            </nav>
            {from ? (
              <a
                href={from}
                className="group inline-flex items-center gap-2 text-stone-600 transition hover:text-stone-900"
              >
                <LuArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                Back to previous
              </a>
            ) : (
              <span className="hidden sm:inline text-stone-400">
                {ANIMALS.length} species · {allProducts.length} formulations
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
              <h1 className="mt-6 font-serif text-[clamp(44px,6.6vw,92px)] leading-[0.92] tracking-[-0.01em] text-stone-900">
                {ctx.title}
              </h1>
            </div>

            {/* Right: description + meta line */}
            <aside className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-3">
              <p className="text-[13.5px] leading-[1.65] text-stone-600">
                {ctx.description}
              </p>

              {ctx.key === "search" && q ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] uppercase tracking-[0.24em] text-stone-500">Keyword</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1.5 text-[11px] tracking-[0.05em] text-white">
                    <LuSearch className="h-3 w-3" /> {q}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 border-t border-stone-900/10 pt-4">
                  <span className="font-serif text-3xl leading-none text-stone-900">
                    {String(totalCount).padStart(2, "0")}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.24em] text-stone-500">
                    products in this view
                  </span>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Sticky filter rail */}
      <FilterRail
        state={{
          animals, families, specificity, needs, breeds, forWhich, ranges, sizes, colors, price,
        }}
        setters={{
          setAnimals, setFamilies, setSpecificity, setNeeds, setBreeds, setForWhich,
          setRanges, setSizes, setColors, setPrice,
        }}
        options={{ familyOptions, specificityOptions, needsOptions, breedOptions, forWhichOptions }}
        hasAnimal={hasAnimal}
        hasFamily={hasFamily}
        hasSpec={hasSpec}
      />

      {/* Result meta + chips */}
      <section className="mx-auto max-w-[1500px] px-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-900/10 pb-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl">{String(totalCount).padStart(2, "0")}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">products in view</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-5">
            <div className="group relative flex w-full max-w-md items-center">
              <LuSearch className="pointer-events-none absolute left-4 h-4 w-4 text-stone-400 transition group-focus-within:text-stone-900" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shampoos, sprays, rituals…"
                className="h-11 w-full rounded-full border border-stone-900/15 bg-stone-50/60 pl-11 pr-10 text-sm placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                  aria-label="Clear search"
                >
                  <LuX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Sort</span>
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
                {c.label}
                <button
                  onClick={c.clear}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-300 hover:text-stone-700 cursor-pointer"
                  aria-label={`Remove ${c.label}`}
                >
                  <LuX className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400 underline underline-offset-4 transition hover:text-stone-700 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </section>

      {/* Products — grid */}
      <section className="mx-auto max-w-[1500px] px-8 pb-24 pt-10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p, i) => (
            <div key={p.id} className="w-full">
              <LandingCards product={p} showNav={true} index={i} compact={false} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-stone-500">
            No products match your selected filters.
          </div>
        )}


      </section>

      <Footer />
    </div>
  );
}

// ───────────── Filter Rail ─────────────
function FilterRail({ state, setters, options, hasAnimal, hasFamily, hasSpec }) {
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
      key: "animal", label: "Animal", values: state.animals.map((a) => ANIMALS.find((x) => x.key === a)?.label || a),
      options: ANIMALS.map((a) => a.label),
      setter: (v) => {
        const k = ANIMALS.find((a) => a.label === v)?.key;
        if (k) setters.setAnimals((p) => toggle(p, k));
      },
    },
    {
      key: "family", label: "Family", values: state.families, options: options.familyOptions,
      setter: (v) => setters.setFamilies((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select an animal first",
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
      disabled: !hasAnimal, tip: "Select an animal first",
    },
    {
      key: "forwhich", label: "For Which", values: state.forWhich, options: options.forWhichOptions,
      setter: (v) => setters.setForWhich((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select an animal first",
    },
    { key: "range", label: "Range", values: state.ranges, options: RANGES, setter: (v) => setters.setRanges((p) => toggle(p, v)) },
    { key: "size", label: "Size", values: state.sizes, options: SIZES, setter: (v) => setters.setSizes((p) => toggle(p, v)) },
    { key: "color", label: "Color", values: state.colors, options: COLORS, setter: (v) => setters.setColors((p) => toggle(p, v)) },
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
    setters.setAnimals([]); setters.setFamilies([]); setters.setSpecificity([]);
    setters.setNeeds([]); setters.setBreeds([]); setters.setForWhich([]);
    setters.setRanges([]); setters.setSizes([]); setters.setColors([]);
  };

  return (
    <div ref={ref} className="sticky top-[104px] z-40 border-y border-stone-900/10 bg-white/95 backdrop-blur">
      {/* Mobile: single prominent CTA that opens the full filters modal */}
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 md:hidden">
        <button
          onClick={() => setAllOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <LuSlidersHorizontal className="h-4 w-4" />
          Filters
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
        <div className="mx-auto flex max-w-[1500px] items-stretch gap-1 overflow-x-auto px-8">
          <button
            onClick={() => setAllOpen(true)}
            className="flex items-center gap-2 pr-4 text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 cursor-pointer"
            title="Open all filters"
          >
            <LuSlidersHorizontal className="h-3.5 w-3.5" /> Filter
            {totalActive > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[10px] text-white">
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
            />
          ))}
          <button
            onClick={() => setOpenKey(openKey === "price" ? null : "price")}
            className={`flex h-14 items-center gap-2 whitespace-nowrap px-4 text-xs uppercase tracking-[0.18em] text-stone-600 hover:text-stone-900 cursor-pointer ${openKey === "price" ? "bg-white text-stone-900" : ""}`}
          >
            Price · €{state.price}
            <LuChevronDown className={`h-3 w-3 transition ${openKey === "price" ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dynamic expanding filter panel container */}
      <FilterPanel
        openKey={openKey}
        state={state}
        setters={setters}
        options={options}
        hasAnimal={hasAnimal}
        hasFamily={hasFamily}
        hasSpec={hasSpec}
        onClose={() => setOpenKey(null)}
      />

      {allOpen && (
        <AllFiltersModal
          groups={groups}
          price={state.price}
          setPrice={setters.setPrice}
          totalActive={totalActive}
          onClearAll={clearAll}
          onClose={() => setAllOpen(false)}
        />
      )}
    </div>
  );
}

function AllFiltersModal({ groups, price, setPrice, totalActive, onClearAll, onClose }) {
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
            <span className="text-xs uppercase tracking-[0.25em] text-stone-500">All</span>
            <h2 className="font-serif text-3xl text-stone-900">Filters</h2>
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
            <ModalGroupSection key={g.key} g={g} />
          ))}

          {/* Price */}
          <section className="border-t text-stone-900 border-stone-900/10 py-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-serif text-lg">Price</h3>
              <span className="font-serif text-xl">€{price}</span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-1 w-full accent-stone-900 cursor-pointer"
            />
            <div className="mt-2 flex justify-between  text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <span>€0</span><span>€120</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-stone-900/10 bg-white px-7 py-4">
          <button
            onClick={onClearAll}
            className="text-xs uppercase tracking-[0.2em] text-stone-500 underline underline-offset-4 hover:text-stone-900 cursor-pointer"
          >
            Reset all
          </button>
          <button
            onClick={handleClose}
            className="rounded-full bg-stone-900 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 cursor-pointer"
          >
            Show results
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}

function shouldShowSearchInput(group) {
  const largeOptionGroups = ["animal", "family", "specificity", "breed"];
  if (largeOptionGroups.includes(group.key)) {
    return group.options.length > 30;
  }

  return group.options.length > 20;
}

function ModalGroupSection({ g }) {
  const [q, setQ] = useState("");
  const searchable = shouldShowSearchInput(g);
  const filtered = searchable && q
    ? g.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : g.options;
  const isColor = g.key === "color";
  return (
    <section className="border-b border-stone-900/10 py-5 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-lg text-stone-900">{g.label}</h3>
          {g.values.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
              {g.values.length} selected
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
            placeholder={`Search ${g.label.toLowerCase()}…`}
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
        <div className="text-xs text-stone-400">No options</div>
      ) : (
        <div className={`flex flex-wrap gap-2 ${searchable ? "max-h-60 overflow-y-auto pr-1" : ""}`}>
          {filtered.map((opt) => {
            const on = g.values.includes(opt);
            const swatch = isColor ? COLOR_SWATCHES[opt] : undefined;
            return (
              <button
                key={opt}
                onClick={() => g.setter(opt)}
                className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer ${
                  on
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
                }`}
              >
                {swatch ? (
  <span
    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-stone-900/15"
    style={{ background: swatch }}
    aria-hidden
  />
) : on ? (
  <span className="grid place-items-center overflow-hidden rounded-full bg-white/15 mr-0.5 h-4 w-4">
    <LuCheck className="h-2.5 w-2.5 stroke-[3] text-white" />
  </span>
) : null}
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FilterTab({ group, open, onOpen }) {
  const count = group.values.length;
  const active = count > 0;
  return (
    <button
        onClick={onOpen}
        disabled={group.disabled}
        title={group.disabled ? group.tip : undefined}
        className={`flex h-14 items-center gap-2 whitespace-nowrap px-4 text-xs uppercase tracking-[0.18em] transition cursor-pointer ${
          group.disabled ? "cursor-not-allowed text-stone-300" : active ? "text-stone-900 font-semibold" : "text-stone-600 hover:text-stone-900"
        } ${open ? "bg-stone-100 text-stone-900" : ""}`}
      >
        {group.label}
        {active && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[10px] text-white">
            {count}
          </span>
        )}
        <LuChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function FilterPanel({ openKey, state, setters, options, hasAnimal, hasFamily, hasSpec, onClose }) {
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
      key: "animal", label: "Animal", values: state.animals.map((a) => ANIMALS.find((x) => x.key === a)?.label || a),
      options: ANIMALS.map((a) => a.label),
      setter: (v) => {
        const k = ANIMALS.find((a) => a.label === v)?.key;
        if (k) setters.setAnimals((p) => toggle(p, k));
      },
    },
    {
      key: "family", label: "Family", values: state.families, options: options.familyOptions,
      setter: (v) => setters.setFamilies((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select an animal first",
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
      disabled: !hasAnimal, tip: "Select an animal first",
    },
    {
      key: "forwhich", label: "For Which", values: state.forWhich, options: options.forWhichOptions,
      setter: (v) => setters.setForWhich((p) => toggle(p, v)),
      disabled: !hasAnimal, tip: "Select an animal first",
    },
    { key: "range", label: "Range", values: state.ranges, options: RANGES, setter: (v) => setters.setRanges((p) => toggle(p, v)) },
    { key: "size", label: "Size", values: state.sizes, options: SIZES, setter: (v) => setters.setSizes((p) => toggle(p, v)) },
    { key: "color", label: "Color", values: state.colors, options: COLORS, setter: (v) => setters.setColors((p) => toggle(p, v)) },
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
      <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Price</span>
      <span className="font-serif text-2xl">€{state.price}</span>
      <span className="text-xs text-stone-500">max</span>
    </div>
    {/* Slider + range labels */}
    <div className="flex flex-1 flex-col gap-1.5">
      <input
        type="range" min={0} max={120} value={state.price}
        onChange={(e) => setters.setPrice(Number(e.target.value))}
        className="h-1 w-full accent-stone-900 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-500">
        <span>€0</span><span>€120</span>
      </div>
    </div>
    {/* Done button */}
    <button
      onClick={onClose}
      className="self-start rounded-full border border-stone-900 px-4 py-2 text-[10px] uppercase tracking-[0.25em] cursor-pointer bg-white hover:bg-stone-900 hover:text-white transition md:self-auto"
    >
      Done
    </button>
  </div>
        ) : group ? (
          <FilterSheetContent group={group} onClose={onClose} />
        ) : null}
      </div>
    </div>
  );
}

function FilterSheetContent({ group, onClose }) {
  const [q, setQ] = useState("");
  const searchable = shouldShowSearchInput(group);
  const filtered = searchable && q
    ? group.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : group.options;
  const isColor = group.key === "color";

  useEffect(() => {
    setQ("");
  }, [group.key]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-stone-500">Filter by</span>
          <h3 className="font-serif text-2xl">{group.label}</h3>
          {group.values.length > 0 && (
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
              {group.values.length} selected
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
            placeholder={`Search ${group.label.toLowerCase()}…`}
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
        <div className="text-sm text-stone-500">No options available.</div>
      ) : (
        <div className={`flex flex-wrap gap-2 ${searchable ? "max-h-[320px] overflow-y-auto pr-1" : ""}`}>
          {filtered.map((opt) => {
            const on = group.values.includes(opt);
            const swatch = isColor ? COLOR_SWATCHES[opt] : undefined;
            return (
              <button
                key={opt}
                onClick={() => group.setter(opt)}
                className={`group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer ${
                  on
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:shadow-sm"
                }`}
              >
               {swatch ? (
  <span
    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-stone-900/15"
    style={{ background: swatch }}
    aria-hidden
  />
) : on ? (
  <span className="grid place-items-center overflow-hidden rounded-full bg-white/15 mr-0.5 h-4 w-4">
    <LuCheck className="h-2.5 w-2.5 stroke-[3] text-white" />
  </span>
) : null}
               
                {opt}
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
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef(null);
  const opts = ["Featured", "Newest", "Price · low to high", "Price · high to low"];

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
        {value}
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
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}