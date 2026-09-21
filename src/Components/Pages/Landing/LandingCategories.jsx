import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import { MEDIA_URL } from "../../API/API";
import LandingSectionHead from "./LandingSectionHead";

// Compact & sleek architectural panel widths (Fits exact whole columns, no side gaps, no half cut-off cards)
const PANEL_WIDTH =
  "w-[calc(100%/2)] min-[540px]:w-[calc(100%/3)] min-[780px]:w-[calc(100%/4)] min-[1020px]:w-[calc(100%/5)] min-[1280px]:w-[calc(100%/6)] flex-shrink-0";

const PANEL_TILE =
  "relative bg-[#fbfaf7] border-r border-b border-[#d6d4cc] min-h-[250px] min-[721px]:min-h-[300px] flex-shrink-0 rounded-none overflow-hidden";

// Shimmer card for compact architectural panel
const ShimmerCard = () => (
  <div className={`${PANEL_TILE} ${PANEL_WIDTH} p-5 min-[721px]:p-6 flex flex-col justify-between bg-[#fbfaf7]`}>
    <div className="flex items-start justify-between">
      <div className="h-4 w-10 bg-black/10 animate-pulse rounded-none" />
      <div className="h-7 w-7 bg-black/10 animate-pulse rounded-none" />
    </div>
    <div className="w-18 h-18 min-[721px]:w-22 min-[721px]:h-22 mx-auto bg-black/10 animate-pulse rounded-none" />
    <div>
      <div className="h-4 w-[75%] bg-black/10 animate-pulse rounded-none mb-2" />
      <div className="h-2.5 w-[45%] bg-black/5 rounded-none" />
    </div>
  </div>
);

// Loading card for compact architectural panel
const LoadingCard = () => (
  <div className={`${PANEL_TILE} ${PANEL_WIDTH} p-5 min-[721px]:p-6 flex flex-col justify-between bg-[#fbfaf7]`}>
    <div className="flex items-start justify-between">
      <div className="h-4 w-10 bg-black/10 rounded-none" />
      <div className="h-7 w-7 bg-black/10 rounded-none" />
    </div>
    <div className="h-20 flex items-center justify-center">
      <span className="relative block w-16 h-px bg-black/20 overflow-hidden rounded-none">
        <span
          className="absolute inset-y-0 left-0 w-1/3 bg-black"
          style={{ animation: "lcatSlide 1.1s ease-in-out infinite" }}
        />
      </span>
    </div>
    <div className="h-4 w-[75%] bg-black/10 animate-pulse rounded-none" />
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

  const scrollContainerRef = useRef(null);
  const currentCardIndexRef = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (currentCardIndexRef.current > 0) return;
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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

  const arrowClass = (enabled) =>
    `h-8 sm:h-9 px-3 min-w-[36px] sm:min-w-[42px] flex items-center justify-center border rounded-none transition-all duration-300 ${
      enabled
        ? "border-black/30 text-black cursor-pointer hover:bg-black hover:text-white shadow-sm active:scale-95"
        : "border-black/15 text-black/25 cursor-not-allowed"
    }`;

  return (
    <section className="bg-[#f5f4f0] py-[clamp(60px,7vw,110px)] text-[#0c0c0c] relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes lcatSlide {
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

      {/* Header Container */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] mb-6 min-[721px]:mb-10">
        <LandingSectionHead
          tone="light"
          index="01"
          eyebrow={t("categories.eyebrow")}
          line1={t("categories.headingLine1")}
          line2={t("categories.headingLine2")}
          subtitle={t("categories.subtitle")}
        >
          <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
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
        </LandingSectionHead>
      </div>

      {/* Sleeker Architectural Panel Showcase (Reduced Height & Width, Edge-to-Edge) */}
      <div
        ref={scrollContainerRef}
        className="w-full flex overflow-x-auto hide-scrollbar border-t border-l border-[#d6d4cc]"
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
                  className={`group ${PANEL_TILE} ${PANEL_WIDTH} p-5 min-[721px]:p-6 flex flex-col justify-between cursor-pointer rounded-none transition-all duration-500 bg-[#fbfaf7] hover:bg-white hover:z-10`}
                >
                  {/* Background Watermark Category Image */}
                  <div className="absolute right-0 bottom-0 w-36 h-36 opacity-[0.03] group-hover:opacity-[0.09] transition-all duration-500 pointer-events-none transform translate-x-6 translate-y-6 group-hover:translate-x-2 group-hover:translate-y-2">
                    <img
                      src={`${MEDIA_URL}${category.media}`}
                      alt=""
                      className="w-full h-full object-contain brightness-0"
                    />
                  </div>

                  {/* Top Bar — Oversized Monospace Index Badge + Action Arrow */}
                  <div className="flex items-start justify-between w-full relative z-10">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] min-[721px]:text-[11px] font-mono font-bold tracking-[0.2em] text-[#0c0c0c] uppercase">
                        [{String(index + 1).padStart(2, "0")}]
                      </span>
                      <span className="mt-0.5 text-[8px] min-[721px]:text-[9px] font-mono tracking-[0.18em] text-[#888] uppercase">
                        COLLECTION
                      </span>
                    </div>

                    <div className="w-7 h-7 min-[721px]:w-8 min-[721px]:h-8 flex items-center justify-center border border-[#d6d4cc] bg-white text-[#0c0c0c] rounded-none transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border-black group-hover:scale-105 shadow-sm">
                      <GoArrowUpRight className="w-3.5 h-3.5 min-[721px]:w-4 min-[721px]:h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Center Stage — Compact Inset Stage Frame */}
                  <div className="my-3 min-[721px]:my-4 relative z-10 flex items-center justify-center">
                    <div className="w-18 h-18 min-[721px]:w-22 min-[721px]:h-22 flex items-center justify-center bg-white border border-[#e2e0d5] rounded-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-500 group-hover:scale-105 group-hover:border-black group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
                      <img
                        src={`${MEDIA_URL}${category.media}`}
                        alt={category.name}
                        className="w-10 h-10 min-[721px]:w-12 min-[721px]:h-12 object-contain brightness-0 opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Bar — High-Fashion Title + Interactive CTA */}
                  <div className="relative z-10 w-full pt-3 border-t border-[#e8e6df]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] min-[481px]:text-[14px] min-[721px]:text-[16px] font-bold leading-[1.2] tracking-[0.02em] text-[#0c0c0c] uppercase transition-colors duration-300 group-hover:text-black">
                        {isFrench && category.french_name
                          ? category.french_name
                          : category.name}
                      </h3>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-[0.2em] text-[#777] uppercase group-hover:text-black transition-colors duration-300">
                        {t("hero.discover") || "DISCOVER"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-black transform group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </div>

                    {/* Sliding Bottom Black Bar */}
                    <span className="absolute -bottom-5 min-[721px]:-bottom-6 left-0 h-[3px] w-0 bg-black transition-all duration-500 group-hover:w-full" />
                  </div>
                </div>
              ))}
      </div>
    </section>
  );
}
