"use client";
import React, { useState } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import { MEDIA_URL } from "@/Components/API/API";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=900&q=80";

export default function AboutProduct({ apiProduct }) {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (idx) => setOpenIndex((prev) => (prev === idx ? null : idx));

  // Right side image
  const aboutImage = apiProduct?.about_product_media
    ? `${MEDIA_URL}${apiProduct.about_product_media}`
    : FALLBACK_IMAGE;

  // Build accordion items dynamically from API
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

  return (
    <section className="w-full bg-white">
      <div className="flex flex-col lg:flex-row w-full min-h-[600px]">

        {/* LEFT: Accordion */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-14">
          <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-[#1C1C1C] mb-8">
            About This Product
          </h2>

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
        </div>

        {/* RIGHT: Image */}
        <div className="hidden lg:block w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen overflow-hidden">
          <img
            src={aboutImage}
            alt="About this product"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}
