"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiClock } from "react-icons/fi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MEDIA_URL } from "@/Components/API/API";
import { startTopLoader } from "../TopLoader";
import { GoArrowUpRight } from "react-icons/go";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1572296374832-8737db0d011b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
];

function formatReadingTime(value, t) {
  const raw = String(value ?? "").trim();
  if (raw && /min/i.test(raw)) return raw;
  return t("minShort", { time: raw || "0" });
}

function getCategoryName(article, isFrench) {
  const topicEntry = article?.categories?.find((c) => c?.type === "topic");
  const cat = topicEntry?.category;
  if (!cat) return "JOURNAL";
  return isFrench && cat.french_name ? cat.french_name : (cat.name ?? "JOURNAL");
}

function getArticleTitle(article, isFrench) {
  if (!article) return "";
  if (isFrench) {
    return article.french_name || article.french_title || article.name || article.title || "";
  }
  return article.name || article.title || article.french_name || article.french_title || "";
}

const ShimmerFeatured = () => (
  <div className="relative min-h-[460px] lg:min-h-[540px] bg-[#e4e2db] animate-pulse rounded-none">
    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col gap-4">
      <div className="h-4 w-36 bg-black/10 rounded-none" />
      <div className="h-8 w-4/5 bg-black/10 rounded-none" />
      <div className="h-8 w-3/5 bg-black/10 rounded-none" />
    </div>
  </div>
);

const ShimmerCard = () => (
  <div className="flex flex-col justify-between bg-white border border-[#d6d4cc] rounded-none animate-pulse min-h-[250px] p-4">
    <div className="h-32 w-full bg-black/10 rounded-none mb-3" />
    <div className="h-3 w-20 bg-black/10 rounded-none mb-2" />
    <div className="h-5 w-full bg-black/10 rounded-none mb-2" />
  </div>
);

export default function LandingExpertAdvice({ data, hideHeader = false }) {
  const { t, i18n } = useTranslation("home");
  const { t: trAdvice } = useTranslation("expertadvice");
  const isFrench = i18n.language === "fr";
  const router = useRouter();

  const apiAdvice = data?.expert_advice || [];
  const isLoading = !data;

  const shownAdvice = apiAdvice.slice(0, 5);
  const mainFeatured = shownAdvice[0];
  const sideArticles = shownAdvice.slice(1, 5);

  // Desktop: shrink the subtitle box to its widest rendered line so the
  // text sits flush with the right padding (same as LandingCategories).
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
  }, [i18n.language, hideHeader]);

  const navigateToDetail = (article) => {
    const keyword = isFrench
      ? article.french_seo_keyword || article.english_seo_keyboard
      : article.english_seo_keyboard || article.french_seo_keyword;
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  const resolveImage = (article, index) => {
    const apiImagePath = article.images?.[0]?.media;
    return apiImagePath
      ? `${MEDIA_URL}${apiImagePath}`
      : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  const renderImage = (article, index, className) => {
    const displayName = getArticleTitle(article, isFrench);
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center bg-[#e4e2db]">
          <span className="relative block w-14 h-px bg-black/15 overflow-hidden">
            <span
              className="absolute inset-y-0 left-0 w-1/3 bg-black"
              style={{ animation: "leaSlide 1.1s ease-in-out infinite" }}
            />
          </span>
        </div>
        <img
          src={resolveImage(article, index)}
          alt={displayName || "Article Image"}
          onLoad={(e) => {
            if (e.currentTarget.previousSibling) {
              e.currentTarget.previousSibling.style.display = "none";
            }
            e.currentTarget.classList.remove("opacity-0");
          }}
          onError={(e) => {
            e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
          }}
          className={`relative z-10 w-full h-full object-cover grayscale contrast-[1.05] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-0 ${className || ""}`}
        />
      </>
    );
  };

  // Small screens: the articles become a one-card-per-view carousel with
  // arrows on the row's edges — right only at the start, both in the middle,
  // left only at the end (same behaviour as LandingCategories / LandingCards).
  const scrollerRef = useRef(null);
  const [edgeLeft, setEdgeLeft] = useState(false);
  const [edgeRight, setEdgeRight] = useState(false);
  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdgeLeft(el.scrollLeft > 2);
    setEdgeRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };
  useEffect(() => {
    const timer = setTimeout(updateEdges, 150);
    window.addEventListener("resize", updateEdges);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateEdges);
    };
  }, [isLoading, shownAdvice.length]);

  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    const cards = el?.querySelectorAll(":scope > div");
    if (!cards?.length) return;
    // card width + the gap to the next card
    const step =
      cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const edgeBtnClass = (visible) =>
    `absolute top-1/2 z-40 grid h-9 w-9 -translate-y-1/2 place-items-center border border-black/15 bg-white text-black shadow-[0_6px_18px_-8px_rgba(0,0,0,0.35)] transition-all duration-300 active:scale-95 cursor-pointer ${
      visible ? "opacity-100" : "pointer-events-none opacity-0"
    }`;

  // Title underline — drawn left to right on card hover (a background
  // gradient on the inline text, so it follows every wrapped line).
  const underlineClass = (large) =>
    `bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[position:0_100%] transition-[background-size] duration-500 ease-out ${
      large
        ? "pb-[3px] bg-[length:0%_2px] group-hover:bg-[length:100%_2px]"
        : "pb-px bg-[length:0%_1px] group-hover:bg-[length:100%_1px]"
    }`;

  // One poster card. `large` = the featured cover-story look (card #1);
  // otherwise the compact look used by the 2x2 grid on larger screens.
  const renderCard = (article, imageIndex, large, sizeClass) => (
    <article
      key={article.id}
      onClick={() => navigateToDetail(article)}
      className={`group relative flex flex-col justify-between overflow-hidden cursor-pointer bg-[#0c0c0c] border border-black rounded-none transition-all duration-500 hover:shadow-2xl ${
        large ? "p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]" : "p-2"
      } ${sizeClass}`}
    >
      <div className="absolute inset-0">{renderImage(article, imageIndex)}</div>
      <div
        className={`absolute inset-0 z-20 bg-gradient-to-t from-black/95 to-black/10 pointer-events-none ${
          large ? "via-black/40" : "via-black/45"
        }`}
      />

      {/* Top badges — topic + reading time */}
      <div className="relative z-30 flex items-center justify-between gap-2 w-full">
        <span
          className={`bg-white text-black font-mono font-bold uppercase px-2.5 py-1 rounded-none shadow-sm ${
            large
              ? "text-[9px] sm:text-[10px] tracking-[0.18em]"
              : "text-[8px] sm:text-[9px] tracking-[0.14em] border border-black/10"
          }`}
        >
          {getCategoryName(article, isFrench)}
        </span>

        <span
          className={`bg-black/60 backdrop-blur-md font-mono uppercase rounded-none border border-white/10 flex items-center ${
            large
              ? "text-white/90 text-[9px] tracking-[0.14em] px-2.5 py-1 gap-1.5"
              : "text-white/80 text-[8px] sm:text-[9px] tracking-[0.12em] px-2 py-0.5 gap-1"
          }`}
        >
          <FiClock className={large ? "w-3 h-3 text-white/70" : "w-2.5 h-2.5 text-white/60"} />
          {formatReadingTime(article.reading_time, trAdvice)}
        </span>
      </div>

      {/* Title — sits at the bottom of the card */}
      <div
        className={`relative z-30 text-white mt-auto ${
          large ? "px-2 pb-3 pt-6 sm:px-3 sm:pb-4" : "px-2 pb-2.5 pt-4"
        }`}
      >
        <h3
          className={`m-0 uppercase font-extrabold text-white drop-shadow-md ${
            large
              ? "text-[20px] sm:text-[clamp(22px,2.4vw,34px)] leading-[1.16] tracking-[-0.02em]"
              : "text-[13px] sm:text-[14px] leading-[1.3] tracking-[0.01em] line-clamp-2 pb-[2px]"
          }`}
        >
          <span className={underlineClass(large)}>{getArticleTitle(article, isFrench)}</span>
        </h3>
      </div>
    </article>
  );

  return (
    <section
      className={`bg-[#f5f4f0] text-[#0c0c0c] relative ${
        hideHeader ? "py-[clamp(60px,7vw,110px)]" : "py-6 min-[721px]:py-11"
      }`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes leaSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        .lea-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .lea-scroll::-webkit-scrollbar { display: none; }`,
        }}
      />
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
        {!hideHeader && (
          // Header — hairline + eyebrow, two-line title (no index). Large
          // screens: subtitle on the first title line, "See all" on the
          // second, flush right. Small screens: "See all" on its own row
          // under the description, right-aligned.
          <div className="w-full pb-6 sm:pb-8 min-[721px]">
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <span className="h-px w-8 shrink-0 bg-black/30 sm:w-12" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#666] sm:text-[10px]">
                {t("expertAdvice.sectionEyebrow")}
              </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6">
              {/* display:contents lets the two title lines sit in the grid rows */}
              <h2 className="contents">
                <span className="col-start-1 row-start-1 block text-[clamp(26px,4.5vw,56px)] font-light uppercase leading-[1.04] tracking-[-0.035em] text-[#444]">
                  {t("expertAdvice.sectionHeadingLine1")}
                </span>
                <span className="col-start-1 row-start-2 block text-[clamp(26px,4.5vw,56px)] font-extrabold uppercase leading-[1.04] tracking-[-0.035em] text-[#0c0c0c]">
                  {t("expertAdvice.sectionHeadingLine2")}
                </span>
              </h2>

              <p
                ref={subtitleRef}
                className="col-span-2 row-start-3 mt-4 max-w-[480px] text-[13px] leading-[1.7] text-[#555] sm:text-[14px] min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:mt-0 min-[900px]:justify-self-end min-[900px]:self-center"
              >
                {t("expertAdvice.sectionSubtitle")}
              </p>

              <button
                type="button"
                onClick={() => {
                  startTopLoader();
                  router.push("/advices");
                }}
                className="group col-span-2 row-start-4 mt-4 self-center justify-self-end inline-flex items-center gap-2 cursor-pointer border border-black/30 px-4 h-8 sm:h-9 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-bold text-black whitespace-nowrap rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95 shadow-sm min-[721px]:col-span-1 min-[721px]:col-start-2 min-[721px]:row-start-2 min-[721px]:mt-0"
              >
                {t("expertAdvice.seeAll")}
                <GoArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* Small screens — one-card-per-view carousel, every card in the
            featured (card #1) look, arrows on the row's edges */}
        <div className="relative min-[721px]:hidden">
          {!isLoading && (
            <>
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous"
                aria-hidden={!edgeLeft}
                tabIndex={edgeLeft ? 0 : -1}
                className={`left-0 -translate-x-3 ${edgeBtnClass(edgeLeft)}`}
              >
                <IoChevronBack className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next"
                aria-hidden={!edgeRight}
                tabIndex={edgeRight ? 0 : -1}
                className={`right-0 translate-x-3 ${edgeBtnClass(edgeRight)}`}
              >
                <IoChevronForward className="h-4 w-4" />
              </button>
            </>
          )}
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            className="lea-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto"
          >
            {isLoading ? (
              <div className="w-full shrink-0">
                <ShimmerFeatured />
              </div>
            ) : (
              shownAdvice.map((article, i) => (
                <div key={article.id} className="flex w-full shrink-0 snap-start">
                  {renderCard(article, i === 0 ? 0 : i + 1, true, "min-h-[420px] sm:min-h-[480px] w-full")}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Larger screens — editorial grid: featured poster on the left, 2x2
            posters on the right */}
        <div className="hidden min-[721px]:grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {isLoading ? (
            <>
              <div className="lg:col-span-5">
                <ShimmerFeatured />
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </div>
            </>
          ) : (
            <>
              {/* Left column: featured cover story (card #1) */}
              {mainFeatured && (
                <div className="lg:col-span-5 flex flex-col">
                  {renderCard(mainFeatured, 0, true, "min-h-[420px] sm:min-h-[480px] lg:min-h-full flex-1")}
                </div>
              )}

              {/* Right column: 2x2 grid of posters (#2–#5) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 items-stretch">
                {sideArticles.map((article, i) =>
                  renderCard(article, i + 2, false, "min-h-[250px] sm:min-h-[270px]"),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
