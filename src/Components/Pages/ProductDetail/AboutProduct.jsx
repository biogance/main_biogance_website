"use client";
import React, { useState, useRef } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import { MEDIA_URL } from "@/Components/API/API";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=900&q=80";

const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export default function AboutProduct({ apiProduct }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const imageLoaded = useRef(false);

  const toggle = (idx) => setOpenIndex((prev) => (prev === idx ? null : idx));

  const aboutImage = apiProduct?.about_product_media
    ? `${MEDIA_URL}${apiProduct.about_product_media}`
    : FALLBACK_IMAGE;

  const accordionData = [
    {
      title: "Type of coat",
      content: "This product is suitable for all coat types including short, medium, and long hair.",
    },
    {
      title: "Why Choose this Product?",
      content: apiProduct?.why_choose_this_product || "-",
    },
    {
      title: "Ingredients",
      content: apiProduct?.bundle_ingredients?.length
        ? apiProduct.bundle_ingredients.map((b) => b.ingredient?.description).filter(Boolean)
        : ["-"],
      isList: true,
    },
    {
      title: "Our Singularity",
      content: apiProduct?.our_singularities?.length
        ? apiProduct.our_singularities.map((s) => s.description || s.name).filter(Boolean).join(" ")
        : "-",
    },
    {
      title: "Our Commitments",
      content: apiProduct?.our_commitments?.length
        ? apiProduct.our_commitments.map((c) => c.description || c.name).filter(Boolean).join(" ")
        : "-",
    },
    {
      title: "Directions of Use",
      content: apiProduct?.direction || "-",
    },
    {
      title: "Composition",
      content: apiProduct?.composition || "-",
    },
    {
      title: "Safety",
      content: apiProduct?.safety_items?.length
        ? apiProduct.safety_items.map((s) => s.short_description).filter(Boolean)
        : ["-"],
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

      <div className="flex flex-col lg:flex-row w-full min-h-[600px]">

        {/* LEFT: Accordion */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-14">
          <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-[#1C1C1C] mb-8">
            About This Product
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

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === idx ? "max-h-96 pb-5" : "max-h-0"
                    }`}
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
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Image */}
        <div
          className="hidden lg:flex w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen overflow-hidden items-center justify-center"
          style={{ background: "#E1E1E1" }}
        >
          {/* State 1: Shimmer — API nahi aaya abhi */}
          {!isLoaded && (
            <div className="shimmer-bg absolute inset-0 w-full h-full" />
          )}

          {/* State 2: Black spinner — API aa gaya, image load ho rahi hai */}
          {isLoaded && imageLoading && (
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

          {/* State 3: Image fade in */}
          {isLoaded && (
            <img
              src={aboutImage}
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