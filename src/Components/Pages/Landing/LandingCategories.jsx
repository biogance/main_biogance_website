import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
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

// Shimmer tile — mirrors the real card box (same size, border, gaps as HOMEPAGE V2.html's .collection-tile)
const ShimmerCard = () => (
  <div
    className={`relative bg-white border-r border-b border-[#d8d8d4] min-h-[205px] ${CARD_WIDTH} flex-shrink-0 px-[18px] pt-[22px] pb-[20px] flex flex-col items-center justify-center gap-[22px]`}
  >
    <div
      className="w-[52px] h-[52px]"
      style={{
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200px 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
    <div
      className="w-[70%] h-[14px] rounded"
      style={{
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200px 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  </div>
);

// Loading tile with spinner
const LoadingCard = () => (
  <div
    className={`relative bg-white border-r border-b border-[#d8d8d4] min-h-[205px] ${CARD_WIDTH} flex-shrink-0 px-[18px] pt-[22px] pb-[20px] flex flex-col items-center justify-center gap-[22px]`}
  >
    <div className="w-[52px] h-[52px] flex items-center justify-center">
      <div
        style={{
          border: "2px solid #f3f3f3",
          borderTop: "2px solid #000000",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
    <div
      className="w-[70%] h-[14px] rounded"
      style={{
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200px 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  </div>
);

export default function LandingCategories({ data }) {
  const { t, i18n } = useTranslation("home");
  const router = useRouter();
  const isFrench = i18n.language === "fr";
  const [loadingState, setLoadingState] = useState("shimmer");

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

  // Left/right scroll-by-page arrows — same pattern as LandingCards.jsx's
  // PopularProducts default heading row (scrollContainerRef + a page-based
  // scroll() using currentCardIndexRef so repeated clicks don't fight a
  // stale closure, plus canScrollLeft/canScrollRight to enable/disable and
  // style the buttons).
  const scrollContainerRef = useRef(null);
  const currentCardIndexRef = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (currentCardIndexRef.current > 0) return;
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    if (loadingState !== "loaded") return;
    setTimeout(checkScrollPosition, 100);
  }, [loadingState]);

  useEffect(() => {
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll(":scope > div");
    if (!cards.length) return;

    const totalCards = cards.length;
    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth;
    const visibleCount = Math.round(container.clientWidth / cardWidth);
    const maxIndex = totalCards - visibleCount;

    const currentIndex = currentCardIndexRef.current;

    let newIndex;
    if (direction === "next") {
      newIndex = Math.min(currentIndex + 1, maxIndex);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    currentCardIndexRef.current = newIndex;

    const targetCard = cards[newIndex];
    container.scrollTo({
      left: targetCard.offsetLeft,
      behavior: "smooth",
    });

    setCanScrollLeft(newIndex > 0);
    setCanScrollRight(newIndex < maxIndex);
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

  const arrowClass = (enabled) =>
    `h-8 sm:h-9 px-3 min-w-[36px] sm:min-w-[42px] flex items-center justify-center border rounded-none transition-all duration-300 ${
      enabled
        ? "border-black/30 text-black cursor-pointer hover:bg-black hover:text-white shadow-sm active:scale-95"
        : "border-black/15 text-black/25 cursor-not-allowed"
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
          the first title line and the scroll arrows on the second, both
          flush with the right padding (same as the left). */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] mb-6 min-[721px]:mb-10">
        <div className="w-full border-b border-black/15 pb-6 sm:pb-8">
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
              <span className="col-start-1 row-start-2 block text-[clamp(26px,4.5vw,56px)] font-extrabold uppercase leading-[1.04] tracking-[-0.035em] text-[#0c0c0c]">
                {t("categories.headingLine2")}
              </span>
            </h2>

            <p
              ref={subtitleRef}
              className="col-span-2 row-start-3 mt-4 max-w-[480px] text-[13px] leading-[1.7] text-[#555] sm:text-[14px] min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:mt-0 min-[900px]:justify-self-end min-[900px]:self-center">
              {t("categories.subtitle")}
            </p>

            <div className="col-start-2 row-start-2 flex shrink-0 gap-1.5 self-center justify-self-end sm:gap-2">
              <button
                onClick={() => scroll("prev")}
                disabled={!canScrollLeft}
                aria-label="Previous"
                className={arrowClass(canScrollLeft)}
              >
                <IoChevronBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={!canScrollRight}
                aria-label="Next"
                className={arrowClass(canScrollRight)}
              >
                <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scrollbar border-t border-l border-[#d8d8d4]"
      >
        {loadingState === "shimmer"
          ? Array.from({ length: 6 }).map((_, index) => (
              <ShimmerCard key={index} />
            ))
          : loadingState === "spinner"
            ? Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            : categories.map((category, index) => (
                <div
                  key={category.id}
                  onClick={() =>
                    router.push(
                      `/shop?category_id=${category.id}&category_name=${encodeURIComponent(isFrench && category.french_name ? category.french_name : category.name)}`,
                    )
                  }
                  className={`group relative bg-white border-r border-b border-[#d8d8d4] min-h-[205px] ${CARD_WIDTH} flex-shrink-0 px-[18px] pt-[22px] pb-[20px] flex flex-col items-center justify-center gap-[22px] overflow-hidden text-black cursor-pointer transition-colors duration-[250ms] hover:bg-black hover:border-black`}
                >
                  <div className="relative w-full min-h-[72px] flex items-center justify-center">
                    <span className="absolute top-0 left-0 text-[9px] tracking-[0.16em] uppercase text-[#757571] transition-colors duration-[250ms] group-hover:text-white/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* Icon only — no background box. Forced black by default,
                      inverted to white on hover, same as .collection-icon in the html. */}
                    <img
                      src={`${MEDIA_URL}${category.media}`}
                      alt={category.name}
                      className="w-[52px] h-[52px] object-contain brightness-0 transition-all duration-[250ms] group-hover:invert"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-center w-full text-center">
                    <span className="max-w-[160px] text-[15px] font-medium leading-[1.2] text-inherit group-hover:text-white transition-colors duration-[250ms]">
                      {isFrench && category.french_name
                        ? category.french_name
                        : category.name}
                    </span>
                  </div>
                </div>
              ))}
      </div>
    </section>
  );
}
