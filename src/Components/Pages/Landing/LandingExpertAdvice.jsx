"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiClock } from "react-icons/fi";
import { MEDIA_URL, BASE_URL } from "@/Components/API/API";
import { startTopLoader } from "../TopLoader";
import { GoArrowUpRight } from "react-icons/go";
import LandingSectionHead from "./LandingSectionHead";

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

  return (
    <section className="bg-[#f5f4f0] border-t border-[#d6d4cc] py-[clamp(50px,6vw,90px)] text-[#0c0c0c] relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes leaSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`,
        }}
      />
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
        {!hideHeader && (
          <div className="mb-6 min-[721px]:mb-10">
            <LandingSectionHead
              tone="light"
              index="04"
              eyebrow={t("expertAdvice.sectionEyebrow")}
              line1={t("expertAdvice.sectionHeadingLine1")}
              line2={t("expertAdvice.sectionHeadingLine2")}
              subtitle={t("expertAdvice.sectionSubtitle")}
            >
              {/* Compact "SEE ALL" button */}
              <button
                type="button"
                onClick={() => {
                  startTopLoader();
                  router.push("/advices");
                }}
                className="group inline-flex items-center gap-2 cursor-pointer border border-black/30 px-4 h-8 sm:h-9 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-bold text-black whitespace-nowrap rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95 shadow-sm"
              >
                {t("expertAdvice.seeAll")}
                <GoArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </LandingSectionHead>
          </div>
        )}

        {/* High-Fashion Editorial Grid (Left Featured Poster + Right 2x2 Clean Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
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
              {/* Left Column: Featured Cover Story (Card #1) */}
              {mainFeatured && (
                <div className="lg:col-span-5 flex flex-col">
                  <article
                    key={mainFeatured.id}
                    onClick={() => navigateToDetail(mainFeatured)}
                    className="group relative min-h-[420px] sm:min-h-[480px] lg:min-h-full flex-1 flex flex-col justify-between overflow-hidden cursor-pointer bg-[#0c0c0c] border border-black rounded-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-2xl p-3"
                  >
                    <div className="absolute inset-0">{renderImage(mainFeatured, 0)}</div>
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none" />

                    {/* Top Header Badges (No Numbers, Tag Higher) */}
                    <div className="relative z-30 flex items-center justify-between gap-2 w-full">
                      <span className="bg-white text-black text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-none shadow-sm">
                        {getCategoryName(mainFeatured, isFrench)}
                      </span>

                      <span className="bg-black/60 backdrop-blur-md text-white/90 text-[9px] font-mono tracking-[0.14em] uppercase px-2.5 py-1 rounded-none border border-white/10 flex items-center gap-1.5">
                        <FiClock className="w-3 h-3 text-white/70" />
                        {formatReadingTime(mainFeatured.reading_time, trAdvice)}
                      </span>
                    </div>

                    {/* Bottom Content Area (Pushed Down, Reduced Padding) */}
                    <div className="relative z-30 text-white flex flex-col justify-end mt-auto pt-6">
                      <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-white/70 mb-1.5 font-semibold">
                        {mainFeatured.company_name || "BIOGANCE JOURNAL"}
                      </span>
                      <h3 className="text-[20px] sm:text-[clamp(22px,2.4vw,34px)] leading-[1.12] tracking-[-0.02em] uppercase font-extrabold mb-4 drop-shadow-md group-hover:text-white/90 transition-colors">
                        {getArticleTitle(mainFeatured, isFrench)}
                      </h3>
                      
                      <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.18em] uppercase font-bold text-white/90 group-hover:underline">
                          {mainFeatured.company_name || "BIOGANCE"}
                        </span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white text-black border border-white rounded-none transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border-white">
                          <GoArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {/* Right Column: 2x2 Grid of Luxury Editorial Photo Posters (#2, #3, #4, #5) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 items-stretch">
                {sideArticles.map((article, i) => {
                  const displayName = getArticleTitle(article, isFrench);
                  const itemIndex = i + 2;
                  return (
                    <article
                      key={article.id}
                      onClick={() => navigateToDetail(article)}
                      className="group relative bg-[#0c0c0c] border border-black flex flex-col justify-between min-h-[250px] sm:min-h-[270px] rounded-none cursor-pointer transition-all duration-500 hover:shadow-2xl overflow-hidden p-2"
                    >
                      <div className="absolute inset-0">{renderImage(article, itemIndex)}</div>
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/45 to-black/10 pointer-events-none" />

                      {/* Top Badges (No Numbers, Tag Higher) */}
                      <div className="relative z-30 flex items-center justify-between gap-2 w-full">
                        <span className="bg-white text-black px-2.5 py-1 text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.14em] uppercase rounded-none border border-black/10 shadow-sm">
                          {getCategoryName(article, isFrench)}
                        </span>

                        <span className="bg-black/60 backdrop-blur-md text-white/80 text-[8px] sm:text-[9px] font-mono tracking-[0.12em] uppercase px-2 py-0.5 rounded-none border border-white/10 flex items-center gap-1">
                          <FiClock className="w-2.5 h-2.5 text-white/60" />
                          {formatReadingTime(article.reading_time, trAdvice)}
                        </span>
                      </div>

                      {/* Bottom Content Area (Pushed Down, Reduced Padding) */}
                      <div className="relative z-30 text-white flex flex-col justify-end mt-auto pt-4">
                        <span className="text-[8px] sm:text-[9px] font-mono text-white/70 uppercase tracking-[0.14em] mb-1 font-medium">
                          {article.company_name || "BIOGANCE JOURNAL"}
                        </span>

                        <h3 className="text-[13px] sm:text-[14px] font-extrabold uppercase leading-[1.25] tracking-[0.01em] text-white line-clamp-2 transition-colors duration-300 drop-shadow-md mb-2.5">
                          {displayName}
                        </h3>

                        <div className="pt-2.5 border-t border-white/20 flex items-center justify-between">
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.16em] text-white/90 uppercase group-hover:underline">
                            {article.company_name || "BIOGANCE"}
                          </span>
                          <div className="w-6 h-6 flex items-center justify-center bg-white text-black border border-white rounded-none transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border-white">
                            <GoArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
