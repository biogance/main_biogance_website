"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HiPlus, HiMinus } from "react-icons/hi";
import { MEDIA_URL } from "@/Components/API/API";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=900&q=80";

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url);

const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export default function AboutProduct({ apiProduct }) {
  const { t, i18n } = useTranslation("aboutproduct");
  const language = i18n.language;
  const [openIndex, setOpenIndex] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const imageLoaded = useRef(false);
  const videoRef = useRef(null);

  const toggle = (idx) => setOpenIndex((prev) => (prev === idx ? null : idx));

  const aboutMedia = apiProduct?.about_product_media
    ? `${MEDIA_URL}${apiProduct.about_product_media}`
    : FALLBACK_IMAGE;

  const isVideo = isVideoUrl(aboutMedia);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVideo, aboutMedia]);

  const accordionData = [
    {
      title: t("typeOfCoat"),
      content: t("typeOfCoatContent"),
    },
    {
      title: t("whyChooseThisProduct"),
      content: language === "fr" ? (apiProduct?.french_why_choose_this_product || apiProduct?.why_choose_this_product || t("noData")) : (apiProduct?.why_choose_this_product || t("noData")),
    },
    {
      title: t("ingredients"),
      content: apiProduct?.bundle_ingredients?.length
        ? apiProduct.bundle_ingredients.map((b) => language === "fr" ? (b.ingredient?.french_description || b.ingredient?.description) : (b.ingredient?.description)).filter(Boolean)
        : [t("noData")],
      isList: true,
    },
    {
      title: t("ourSingularity"),
      content: apiProduct?.our_singularities?.length
        ? apiProduct.our_singularities.map((s) => language === "fr" ? (s.french_description || s.description || s.french_name || s.name) : (s.description || s.name)).filter(Boolean).join(" ")
        : t("noData"),
    },
    {
      title: t("ourCommitments"),
      content: apiProduct?.our_commitments?.length
        ? apiProduct.our_commitments.map((c) => language === "fr" ? (c.french_description || c.description || c.french_name || c.name) : (c.description || c.name)).filter(Boolean).join(" ")
        : t("noData"),
    },
    {
      title: t("directionsOfUse"),
      content: language === "fr" ? (apiProduct?.french_direction || apiProduct?.direction || t("noData")) : (apiProduct?.direction || t("noData")),
    },
    {
      title: t("composition"),
      content: language === "fr" ? (apiProduct?.french_composition || apiProduct?.composition || t("noData")) : (apiProduct?.composition || t("noData")),
    },
    {
      title: t("safety"),
      content: apiProduct?.safety_items?.length
        ? apiProduct.safety_items.map((s) => language === "fr" ? (s.french_short_description || s.short_description) : (s.short_description)).filter(Boolean)
        : [t("noData")],
      isList: true,
    },
  ];

  const isLoaded = apiProduct !== null;

  const handleImageLoad = () => {
    if (!imageLoaded.current) {
      imageLoaded.current = true;
      setImageLoading(false);
    }
  };

  return (
    <section className="w-full bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmerMove {
            0%   { background-position: -600px 0; }
            100% { background-position:  600px 0; }
          }
          .shimmer-bg {
            background: linear-gradient(90deg, #d4d4d4 25%, #e8e8e8 50%, #d4d4d4 75%);
            background-size: 600px 100%;
            animation: shimmerMove 1.4s infinite linear;
          }
          @keyframes spinBlack { to { transform: rotate(360deg); } }
          @keyframes aboutFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .about-fade-in { animation: aboutFadeIn 0.4s ease forwards; }
        `
      }} />

      <div className="flex flex-col lg:flex-row w-full items-start">

        {/* LEFT: Accordion */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-14">
          <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-[#1C1C1C] mb-8">
            {t("aboutThisProduct")}
          </h2>

          {!isLoaded ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="border-t border-[#E0E0E0]">
                  <div className="py-4 flex items-center justify-between">
                    <ShimmerLoader className="h-4 w-1/2" />
                    <ShimmerLoader className="h-4 w-6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
           <div className="flex flex-col">
  {accordionData.map((item, idx) => (
    <div key={idx} className="border-t border-[#E0E0E0] last:border-b">
      <button
        onClick={() => toggle(idx)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
      >
        <span className="text-[15px] font-medium text-[#1C1C1C]">{item.title}</span>
        <span className="shrink-0 ml-4 text-[#1C1C1C]">
          {openIndex === idx ? <HiMinus className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
        </span>
      </button>

      {/* Outer grid wrapper — controls height animation */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: openIndex === idx ? "1fr" : "0fr",
          transition: "grid-template-rows 0.5s cubic-bezier(0.77, 0, 0.175, 1)",
        }}
      >
        {/* Inner div — clips overflow */}
        <div style={{ overflow: "hidden" }}>
          {/* Content wrapper — opacity + translateY animation */}
          <div
            style={{
              paddingBottom: openIndex === idx ? "20px" : "0px",
              opacity: openIndex === idx ? 1 : 0,
              transform: openIndex === idx ? "translateY(0)" : "translateY(-8px)",
              transition: openIndex === idx
                ? "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s, padding 0.5s cubic-bezier(0.77, 0, 0.175, 1)"
                : "opacity 0.2s ease, transform 0.2s ease, padding 0.5s cubic-bezier(0.77, 0, 0.175, 1)",
            }}
          >
            {item.isList ? (
              <ul className="flex flex-col gap-1">
                {item.content.map((line, i) => (
                  <li key={i} className="text-[14px] text-[#555555] leading-relaxed">{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-[#555555] leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
          )}
        </div>

        {/* RIGHT: Image */}
        <div
          className="hidden lg:flex w-full lg:w-1/2 lg:sticky overflow-hidden items-center justify-center"
          style={{ background: "#E1E1E1", top: "104px", height: "calc(100vh - 176px)", alignSelf: "flex-start" }}
        >
          {/* State 1: Shimmer — API nahi aaya abhi */}
          {!isLoaded && (
            <div className="shimmer-bg absolute inset-0 w-full h-full" />
          )}

          {/* State 2: Black spinner — API aa gaya, image/video load ho rahi hai */}
          {isLoaded && imageLoading && !isVideo && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "4px solid rgba(0,0,0,0.12)",
                  borderTopColor: "#111111",
                  animation: "spinBlack 0.8s linear infinite",
                }}
              />
            </div>
          )}

          {/* State 3: Video autoplay loop */}
          {isLoaded && isVideo && (
            <video
              ref={videoRef}
              key={aboutMedia}
              className="w-full h-full object-cover about-fade-in"
              autoPlay
              muted
              playsInline
              onEnded={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                }
              }}
            >
              <source src={aboutMedia} type="video/mp4" />
            </video>
          )}

          {/* State 3: Image fade in */}
          {isLoaded && !isVideo && (
            <img
              src={aboutMedia}
              alt="About this product"
              onLoad={handleImageLoad}
              onError={handleImageLoad}
              className={`w-full h-full object-cover ${
                imageLoading ? "opacity-0" : "about-fade-in"
              }`}
            />
          )}
        </div>

      </div>
    </section>
  );
}