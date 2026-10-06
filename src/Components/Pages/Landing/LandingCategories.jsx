import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MEDIA_URL } from "../../API/API";

// A row shows 6 cards at a time on desktop, no gap between them (same as
// the html's border-collapsed grid) — width is 1/6th of the scroll
// container there. On small screens 6-across made every tile ~60px wide
// (icon + label unreadable), so narrower viewports show fewer cards per
// screen — the rest stay reachable via the existing horizontal scroll.
// Whole-number fractions only (2, 3, 4, 5, 6) so each screen shows
// complete tiles with no partial next-card peeking in at the edge.
const CARD_WIDTH =
  "w-[calc(100%/2)] min-[481px]:w-[calc(100%/3)] min-[721px]:w-[calc(100%/4)] min-[901px]:w-[calc(100%/5)] min-[1101px]:w-[calc(100%/6)]";

// Collection photos (public/), revealed on hover over an all-black card —
// see biogance_animals_maquette.html. Matched by category id, with a name
// fallback in case ids change. A category without a photo keeps its icon
// as the hover visual instead.
const CATEGORY_PHOTOS = {
  10: { src: "/CHIEN.png", position: "50% 50%" }, // Dogs
  20: { src: "/CHIOT.png", position: "50% 53%" }, // Puppies
  24: { src: "/CHAT.png", position: "50% 48%" }, // Cats & Kittens
  33: { src: "/NACS.png", position: "50% 50%" }, // Small mammals
  // shortTitle: shorter name for the card title only (English); links and
  // labels keep the full category name.
  37: { src: "/7.png", position: "50% 38%", shortTitle: "Birds & Poultry" }, // Birds & Backyard Poultry
  49: { src: "/13.png", position: "50% 52%" }, // Reptiles & Turtles
  84: { src: "/horse.jpg", position: "50% 45%" }, // Horses
};
const getCategoryPhoto = (category) => {
  if (CATEGORY_PHOTOS[category?.id]) return CATEGORY_PHOTOS[category.id];
  const name = `${category?.name || ""} ${category?.french_name || ""}`.toLowerCase();
  if (/pupp|chiot/.test(name)) return CATEGORY_PHOTOS[20];
  if (/dog|chien/.test(name)) return CATEGORY_PHOTOS[10];
  if (/cat|chat/.test(name)) return CATEGORY_PHOTOS[24];
  if (/bird|oiseau|poultry|basse/.test(name)) return CATEGORY_PHOTOS[37];
  if (/reptile|turtle|tortue/.test(name)) return CATEGORY_PHOTOS[49];
  if (/mammal|mammif|rongeur|nac/.test(name)) return CATEGORY_PHOTOS[33];
  if (/horse|cheva/.test(name)) return CATEGORY_PHOTOS[84];
  return null;
};
const PHOTO_SIZES =
  "(max-width: 480px) 50vw, (max-width: 720px) 34vw, (max-width: 900px) 25vw, (max-width: 1100px) 20vw, 17vw";
const CARD_EASE = "cubic-bezier(.22,.61,.36,1)";

// Black placeholder tile — same box as the real card (3:4, black, hairline
// borders) with a sliding line where the title sits.
const ShimmerCard = () => (
  <div
    className={`relative ${CARD_WIDTH} aspect-[3/4] shrink-0 overflow-hidden border-r border-b border-white/[0.14] bg-[#060606]`}
  >
    <div className="absolute inset-x-4 bottom-5 flex flex-col gap-2.5 min-[721px]:inset-x-[22px] min-[721px]:bottom-6">
      <span className="relative block h-5 w-2/3 overflow-hidden bg-white/[0.06]">
        <span
          className="absolute inset-y-0 left-0 w-1/3 bg-white/[0.12]"
          style={{ animation: "catSlide 1.2s ease-in-out infinite" }}
        />
      </span>
      <span className="block h-2 w-1/3 bg-white/[0.05]" />
    </div>
  </div>
);

export default function LandingCategories({ data }) {
  const { t, i18n } = useTranslation("home");
  const router = useRouter();
  const isFrench = i18n.language === "fr";
  // Starts loaded when the categories are already there on mount (returning
  // to the home page paints from memory — see MainVideo.jsx), so no shimmer.
  const [loadingState, setLoadingState] = useState(() =>
    data?.categories?.length ? "loaded" : "shimmer",
  );

  const categories = data?.categories || [];

  useEffect(() => {
    if (categories.length > 0) {
      setLoadingState("loaded");
      return;
    }
    const shimmerTimer = setTimeout(() => setLoadingState("spinner"), 1500);
    const spinnerTimer = setTimeout(() => setLoadingState("loaded"), 3000);
    return () => {
      clearTimeout(shimmerTimer);
      clearTimeout(spinnerTimer);
    };
  }, [categories.length]);

  // Scroll arrows. Large screens: in the header, disabled when that
  // direction can't scroll. Small screens: on top of the card row at its
  // left/right edges, and only the usable directions are shown — right only
  // at the start, both in the middle, left only at the end. State is read
  // from the real scroll position, so it also follows touch/trackpad
  // scrolling, not just arrow clicks.
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    if (loadingState !== "loaded") return undefined;
    const timer = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [loadingState, categories.length]);

  useEffect(() => {
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);

  // One card per click, snapped to the card's left edge.
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(":scope > div");
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth;
    const visibleCount = Math.max(1, Math.round(container.clientWidth / cardWidth));
    const maxIndex = Math.max(0, cards.length - visibleCount);
    const currentIndex = Math.round(container.scrollLeft / cardWidth);
    const newIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, maxIndex)
        : Math.max(currentIndex - 1, 0);

    container.scrollTo({
      left: cards[newIndex].offsetLeft - cards[0].offsetLeft,
      behavior: "smooth",
    });
  };

  // Desktop: a wrapped paragraph keeps its max-width box even when its
  // lines are shorter, which leaves a gap on the right. Shrink the box to
  // the widest rendered line so the text sits flush with the right padding.
  const subtitleRef = useRef(null);
  useEffect(() => {
    const el = subtitleRef.current;
    if (!el) return undefined;
    const fit = () => {
      el.style.width = "";
      if (window.innerWidth < 900) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const widest = Math.max(0, ...[...range.getClientRects()].map((r) => r.width));
      if (widest) el.style.width = `${Math.ceil(widest)}px`;
    };
    fit();
    document.fonts?.ready?.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [i18n.language]);

  const headerArrowClass = (enabled) =>
    `h-9 px-3 min-w-[42px] flex items-center justify-center border rounded-none transition-all duration-300 ${
      enabled
        ? "border-black/30 text-black cursor-pointer hover:bg-black hover:text-white shadow-sm active:scale-95"
        : "border-black/15 text-black/25 cursor-not-allowed"
    }`;

  // Small screens only (hidden from 721px up)
  const arrowClass = (visible) =>
    `absolute top-1/2 z-10 grid h-9 w-9 min-[721px]:hidden -translate-y-1/2 place-items-center border border-black/15 bg-white text-black shadow-[0_6px_18px_-8px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-black hover:bg-black hover:text-white active:scale-95 cursor-pointer ${
      visible ? "opacity-100" : "pointer-events-none opacity-0"
    }`;

  return (
    // "Explore our collections" section — same editorial/monochrome design as
    // HOMEPAGE V2.html's .collections section, kept as a horizontal scroller
    // (6 cards visible at a time, same width/height as the html tiles),
    // with card data coming from the API.
    <section className="bg-[#f5f4f0] py-[clamp(60px,7vw,110px)] text-[#0c0c0c]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes catSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />

    
      {/* Header — hairline + eyebrow, two-line title. The subtitle sits on
          the first title line and (large screens) the scroll arrows on the
          second, both flush with the right padding (same as the left). */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] min-[721px]">
        <div className="w-full pb-6 -mt-7 sm:pb-8 min-[721px]:-mt-12">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <span className="h-px w-8 shrink-0 bg-black/30 sm:w-12" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#666] sm:text-[10px]">
              {t("categories.eyebrow")}
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6">
            {/* display:contents lets the two title lines sit in the grid rows */}
            <h2 className="contents">
              <span className="col-start-1 row-start-1 block text-[clamp(26px,4.5vw,56px)] font-light uppercase leading-[1.04] tracking-[-0.035em] text-[#444]">
                {t("categories.headingLine1")}
              </span>
              <span className="col-start-1 row-start-2 block text-[clamp(26px,4.5vw,56px)] font-extrabold uppercase leading-[1.2] tracking-[-0.035em] text-[#0c0c0c]">
                {t("categories.headingLine2")}
              </span>
            </h2>

            <p
              ref={subtitleRef}
              className="col-span-2 row-start-3 mt-4 max-w-[480px] text-[13px] leading-[1.7] text-[#555] sm:text-[14px] min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:mt-0 min-[900px]:justify-self-end min-[900px]:self-center">
              {t("categories.subtitle")}
            </p>

            {/* Large screens: arrows stay in the header, on the second title line */}
            <div className="col-start-2 row-start-2 hidden shrink-0 gap-2 self-center justify-self-end min-[721px]:flex">
              <button
                onClick={() => scroll("prev")}
                disabled={!canScrollLeft}
                aria-label="Previous"
                className={headerArrowClass(canScrollLeft)}
              >
                <IoChevronBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={!canScrollRight}
                aria-label="Next"
                className={headerArrowClass(canScrollRight)}
              >
                <IoChevronForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card row — edge to edge at every width. Small screens get their own
          arrows on the row, flush with the screen edges; from 721px up the
          header arrows are used instead. */}
      <div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("prev")}
          aria-label="Previous"
          aria-hidden={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
          className={`left-0 ${arrowClass(canScrollLeft)}`}
        >
          <IoChevronBack className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll("next")}
          aria-label="Next"
          aria-hidden={!canScrollRight}
          tabIndex={canScrollRight ? 0 : -1}
          className={`right-0 ${arrowClass(canScrollRight)}`}
        >
          <IoChevronForward className="h-4 w-4" />
        </button>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex overflow-x-auto hide-scrollbar border-t border-[#d8d8d4] bg-black"
      >
        {loadingState !== "loaded"
          ? Array.from({ length: 6 }).map((_, index) => (
              <ShimmerCard key={index} />
            ))
          : categories.map((category) => {
              const displayName =
                isFrench && category.french_name
                  ? category.french_name
                  : category.name;
              const photo = getCategoryPhoto(category);
              const isPuppies = photo === CATEGORY_PHOTOS[20];
              const open = () =>
                router.push(
                  `/shop?category_id=${category.id}&category_name=${encodeURIComponent(displayName)}`,
                );
              return (
                // All-black card; on hover/focus the collection photo fades
                // and zooms in under a dark veil and the title lifts. Small
                // screens (no hover on touch) show the photo straight away.
                <div
                  key={category.id}
                  role="link"
                  tabIndex={0}
                  aria-label={displayName}
                  onClick={open}
                  onKeyDown={(e) => e.key === "Enter" && open()}
                  className={`group relative ${CARD_WIDTH} aspect-[3/4] shrink-0 cursor-pointer overflow-hidden border-r border-b border-white/[0.14] bg-[#060606] text-white [isolation:isolate] focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white`}
                >
                  {photo ? (
                    <div
                      className="absolute -inset-[3%] z-0 scale-[1.055] opacity-0 [filter:saturate(.82)_contrast(.96)_brightness(.82)] group-hover:scale-100 group-hover:opacity-90 group-hover:[filter:saturate(.9)_contrast(.98)_brightness(.86)] group-focus-visible:scale-100 group-focus-visible:opacity-90 max-[720px]:scale-100 max-[720px]:opacity-90 max-[720px]:[filter:saturate(.9)_contrast(.98)_brightness(.86)]"
                      style={{
                        // Tailwind v4 scale-* sets the CSS `scale` property (not
                        // `transform`), so that is what has to be transitioned.
                        transition: `opacity .6s ${CARD_EASE}, scale .85s ${CARD_EASE}, filter .6s ease`,
                        willChange: "opacity, scale",
                      }}
                    >
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        sizes={PHOTO_SIZES}
                        className="object-cover"
                        style={{ objectPosition: photo.position }}
                      />
                    </div>
                  ) : (
                    category.media && (
                      <img
                        src={`${MEDIA_URL}${category.media}`}
                        alt=""
                        className="absolute left-1/2 top-[38%] z-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 object-contain opacity-0 brightness-0 invert transition-opacity duration-500 group-hover:opacity-70 group-focus-visible:opacity-70 max-[720px]:opacity-70"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )
                  )}

                  {/* Veil */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-[720px]:opacity-100"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.12) 38%, rgba(0,0,0,.62) 100%), radial-gradient(circle at 50% 40%, rgba(0,0,0,0) 10%, rgba(0,0,0,.10) 100%)",
                    }}
                  />

                  {/* Title + sub-label */}
                  <span className="absolute inset-x-4 bottom-5 z-[3] flex flex-col items-start gap-2.5 min-[721px]:inset-x-[22px] min-[721px]:bottom-6">
                    <span
                      className="block text-left text-[clamp(22px,2.2vw,40px)] font-light uppercase leading-[0.94] tracking-[-0.045em] text-white group-hover:-translate-y-[3px] group-hover:tracking-[-0.03em] group-focus-visible:-translate-y-[3px]"
                      style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        transition: `translate .5s ${CARD_EASE}, letter-spacing .5s ease`,
                      }}
                    >
                      {(!isFrench && photo?.shortTitle) || displayName}
                    </span>
                    <span
                      className="block text-[8px] font-medium uppercase leading-none tracking-[0.26em] text-white/50 group-hover:-translate-y-px group-hover:text-white/75 group-focus-visible:text-white/75"
                      style={{
                        transition: `color .45s ease, translate .5s ${CARD_EASE}`,
                      }}
                    >
                      {isPuppies
                        ? t("categories.cardSubPuppies", "Gentle care")
                        : t("categories.cardSub", "Care collection")}
                    </span>
                  </span>
                </div>
              );
            })}
      </div>
      </div>
      </div>
    </section>
  );
}
