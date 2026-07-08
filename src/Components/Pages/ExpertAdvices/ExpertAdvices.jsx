"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FiSearch, FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import {
  GoArrowUpRight,
  GoStarFill,
  GoFlame,
  GoHeartFill,
  GoClock,
} from "react-icons/go";

const SPECIES = ["Dogs", "Cats", "Small Mammals", "Birds", "Reptiles", "Horses"];
const TOPICS = [
  "All",
  "Nutrition",
  "Grooming",
  "Training",
  "Health",
  "Behavior",
  "Wellness",
  "First Aid",
  "Lifestyle",
  "Dental Care",
  "Senior Care",
  "Puppies & Kittens",
  "Emergency Care",
  "Seasonal Tips",
  "Product Reviews",
];

const ROWS_PER_PAGE = 3;
const CARD_GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10";
const COLUMN_BREAKPOINTS = [
  { minWidth: 1536, columns: 5 },
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

// TODO: hardcoded for now — wire up to the blogs API once it's available.
const ROW_IMAGES = [
  "/wishlist-img.jpg",
  "/distributorImg.jpg",
  "/partnerImg.jpg",
  "/proImg.jpg",
  "/cat.png",
];

function buildRow(prefix, titles) {
  return titles.map((title, idx) => ({
    id: `${prefix}${idx + 1}`,
    title,
    image: ROW_IMAGES[idx % ROW_IMAGES.length],
  }));
}

const RECOMMENDED = buildRow("r", [
  "Building a gentle brushing routine for shedding season",
  "Choosing the right shampoo for sensitive skin",
  "Signs your pet's coat needs extra care",
  "How often should you really bathe your dog?",
  "Post-walk paw care in muddy season",
  "Understanding your pet's skin barrier",
  "Diet changes that support healthy shedding",
  "When to see a vet about excessive itching",
  "Brushing tools: bristle vs pin vs slicker",
  "Seasonal coat blowouts: what's normal",
]);

const TRENDING = buildRow("t", [
  "Stop the pulling: a 7-day loose-leash protocol",
  "Moving day: helping an anxious cat settle in 72 hours",
  "Senior dogs and joints: what to add, what to stop",
  "Why does my cat knead everything?",
  "The 3-3-3 rule for newly adopted dogs",
  "Crate training without the guilt",
  "Why is my dog suddenly scared of the vacuum?",
  "Reading tail language across species",
  "Multi-pet households: introducing a new cat",
  "Fireworks season: a calming checklist",
]);

const MOST_LIKED = buildRow("m", [
  "Why your dog eats grass (and when to worry)",
  "The truth about grain-free diets for cats",
  "Five enrichment toys vets actually recommend",
  "Raw diets: benefits, risks, and how to start safely",
  "The five love languages of dogs",
  "Why cats knock things off tables (really)",
  "Best budget-friendly enrichment for bored pets",
  "How to trim nails without the stress",
  "Dental chews that actually work",
  "Signs of pain your pet won't show you directly",
]);

const RECENTLY_ADDED = buildRow("n", [
  "New parent checklist: your first week with a puppy",
  "Reading your cat's body language",
  "Traveling with pets: a stress-free guide",
  "Setting up a kitten-proof home",
  "First vet visit: what to expect",
  "Choosing a harness vs a collar",
  "Introducing a new baby to your dog",
  "Litter box setup mistakes to avoid",
  "Building a pet first-aid kit at home",
  "Socializing a shy rescue dog",
]);

const BASE_ARTICLES = [
  {
    species: "Dogs",
    topic: "Health",
    title: "Senior dogs and joints: what to add, what to stop",
    author: "Dr. Léa Moreau",
    time: "6m",
    image: "/distributorImg.jpg",
  },
  {
    species: "Cats",
    topic: "Behavior",
    title: "Moving day: helping an anxious cat settle in 72 hours",
    author: "Sofia Bianchi",
    time: "6m",
    image: "/wishlist-img.jpg",
  },
  {
    species: "Small Mammals",
    topic: "Nutrition",
    title: "Your rabbit's plate: the 80/10/10 rule",
    author: "Dr. Léa Moreau",
    time: "4m",
    image: "/cat.png",
  },
  {
    species: "Birds",
    topic: "Behavior",
    title: "Bored parrots bite: five cheap enrichment ideas",
    author: "Yara Haddad",
    time: "6m",
    image: "/proImg.jpg",
  },
  {
    species: "Horses",
    topic: "Grooming",
    title: "Summer coat care for horses: sun, sweat, and skin",
    author: "Antoine Roux",
    time: "5m",
    image: "/partnerImg.jpg",
  },
  {
    species: "Reptiles",
    topic: "Wellness",
    title: "Humidity, without the mold: a reptile owner's checklist",
    author: "Kenji Tanaka",
    time: "7m",
    image: "/distributorImg.jpg",
  },
  {
    species: "Dogs",
    topic: "First Aid",
    title: "Your dog's first-aid kit: 12 items that actually matter",
    author: "Dr. Léa Moreau",
    time: "5m",
    image: "/wishlist-img.jpg",
  },
  {
    species: "Cats",
    topic: "Lifestyle",
    title: "Indoor cat, outdoor mind: enrichment that works",
    author: "Sofia Bianchi",
    time: "6m",
    image: "/cat.png",
  },
];

// Repeated so there's enough test data to exercise the "Load More" pagination below.
const ARTICLE_CYCLES = 8;
const ARTICLES = Array.from({ length: ARTICLE_CYCLES }).flatMap((_, cycle) =>
  BASE_ARTICLES.map((a, idx) => ({
    ...a,
    id: `a${cycle * BASE_ARTICLES.length + idx + 1}`,
  })),
);

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

function ArticleRow({ label, icon: Icon, items }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const visibleCount = useResponsiveColumns();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const gap = 24; // matches gap-6

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

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </p>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-500 transition-colors cursor-pointer"
        >
          See All
          <GoArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative">
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
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory"
        >
          {items.map((item) => (
            <div
              key={item.id}
              data-card
              onClick={() => router.push("/expert-detail")}
              className="border border-gray-200 shrink-0 snap-start cursor-pointer"
              style={{
                flexBasis: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-60 object-cover"
              />
              <div className="p-4 flex items-start justify-between gap-3">
                <p className="text-xs font-bold uppercase text-gray-900 leading-snug">
                  {item.title}
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

function useResponsiveColumns() {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      return COLUMN_BREAKPOINTS.find((b) => w >= b.minWidth).columns;
    };
    const update = () => setColumns(calc());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columns;
}

function ExpertAdvices() {
  const router = useRouter();
  const [activeSpecies, setActiveSpecies] = useState("Dogs");
  const [activeTopic, setActiveTopic] = useState("All");
  const [search, setSearch] = useState("");
  const [pagesLoaded, setPagesLoaded] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const columns = useResponsiveColumns();
  const pageSize = columns * ROWS_PER_PAGE;

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      if (activeSpecies && a.species !== activeSpecies) return false;
      if (activeTopic !== "All" && a.topic !== activeTopic) return false;
      if (q && !a.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeSpecies, activeTopic, search]);

  useEffect(() => {
    setPagesLoaded(1);
  }, [activeSpecies, activeTopic, search]);

  const visibleCount = pageSize * pagesLoaded;
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setPagesLoaded((p) => p + 1);
      setLoadingMore(false);
    }, 700);
  };

  const scrollToArticles = () => {
    const section = document.getElementById("all-articles-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Hero */}
      <section className="bg-[#f3f3f3]">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight mb-6">
              How to support shedding without irritating the skin?
            </h1>
            <p className="text-sm text-gray-700 leading-relaxed max-w-md mb-8">
              During shedding season, the right reflex is not to bathe more
              often, but to build a gentle routine: brush, cleanse with care,
              then protect the skin barrier.
            </p>
            <div className="flex items-center gap-5 sm:gap-8 text-xs text-gray-700 font-medium flex-wrap mb-8">
              <span>By Biogance Laboratory</span>
              <span>7 min read</span>
              <span>Updated July 3, 2026</span>
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
            <img
              src="/cat.png"
              alt="How to support shedding without irritating the skin"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="px-6 sm:px-10 lg:px-16">
        {/* Filters */}
        <div className="py-8 sticky top-[104px] z-30 bg-white">
          <div className="flex  flex-wrap items-center gap-2 mb-4">
            {SPECIES.map((s) => (
              <TabButton
                key={s}
                label={s}
                active={activeSpecies === s}
                onClick={() => setActiveSpecies(s)}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 overflow-x-auto md:flex-1 md:min-w-0 pb-1">
              {TOPICS.map((t) => (
                <TabButton
                  key={t}
                  label={t}
                  active={activeTopic === t}
                  onClick={() => setActiveTopic(t)}
                />
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rituals..."
                className="w-full border border-gray-300 pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <hr className="border-t border-gray-200 mt-6" />
        </div>

        <ArticleRow
          label="Recommended For Your Pet"
          icon={GoStarFill}
          items={RECOMMENDED}
        />
        <ArticleRow label="Trending" icon={GoFlame} items={TRENDING} />
        <ArticleRow label="Most Liked" icon={GoHeartFill} items={MOST_LIKED} />
        <ArticleRow
          label="Recently Added"
          icon={GoClock}
          items={RECENTLY_ADDED}
        />

        {/* All Articles */}
        <div id="all-articles-section" className="scroll-mt-28 pb-16">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-gray-900 uppercase">
              All Articles
            </p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              {String(filteredArticles.length).padStart(2, "0")} Entries
            </p>
          </div>

          {filteredArticles.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">
              No articles match these filters yet.
            </p>
          ) : (
            <>
              <div className={CARD_GRID}>
                {visibleArticles.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => router.push("/expert-detail")}
                    className="cursor-pointer"
                  >
                    <div className="relative w-full aspect-[5/6] overflow-hidden mb-3 bg-gray-100">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-full object-cover grayscale  hover transition-transform duration-300 hover:scale-105 cursor-pointer hover:grayscale-0"
                      />
                    </div>
                    <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
                      {a.topic}
                    </p>
                    <h3 className="text-sm font-bold uppercase text-gray-900 leading-snug mb-2">
                      {a.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{a.author}</span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {a.time}
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
