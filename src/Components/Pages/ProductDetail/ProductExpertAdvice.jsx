"use client";
import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { MdWaves } from "react-icons/md";

const adviceList = [
  "Why does my dog smell bad?",
  "Which care is best for my dog?",
  "My dog is scratching – What should I do?",
  "How to properly wash my dog?",
  "My dog had fleas: what should I do?",
];

const allAdviceList = [...adviceList, ...adviceList];

export default function ProductExpertAdvice() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <>
      <section className="w-full bg-[#EFEFEF] lg:mt-20">
        <div className="flex flex-col lg:flex-row w-full">

          {/* LEFT: Dog Image — small aur medium screens pe hidden */}
          <div className="hidden lg:block w-full lg:w-1/2 bg-[#D7D7D7] relative group overflow-visible -mt-[40px] -mb-[40px]">
            <img
              src="dog.svg"
              alt="Expert Advice Dog"
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Hover Card */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%]
                            opacity-0 translate-y-4 
                            group-hover:opacity-100 group-hover:translate-y-0
                            transition-all duration-300 ease-out
                            bg-white rounded-md px-5 py-4 shadow-lg
                            flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MdWaves size={20} className="bg-gray-200 text-[#808080] p-1" />
                <span className="text-[14px] text-[#1C1C1C] font-medium whitespace-nowrap">
                  Why does my dog smell bad?
                </span>
              </div>
              <span className="text-[#1C1C1C] text-sm"><FaArrowRight /></span>
            </div>
          </div>

          {/* RIGHT: Expert Advice — full width on small/medium, half on large */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-14 bg-[#F3F3F3]">
            <h2 className="text-[22px] sm:text-[24px] lg:text-[28px] font-bold text-[#1C1C1C] mb-7">
              Expert Advice
            </h2>
            <div className="flex flex-col">
              {adviceList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3.5 border-t border-[#D8D8D8] last:border-b cursor-pointer group"
                >
                  <span className="text-[14px] text-[#1C1C1C]">{item}</span>
                  <img src="review.svg" alt="" />
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 w-fit bg-[#1C1C1C] text-white text-[13px] font-medium px-6 py-2.5 rounded-md hover:bg-[#333] transition-colors cursor-pointer"
            >
              See more
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-[20px] font-bold text-[#1C1C1C]">
                Rating &amp; Reviews
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888] cursor-pointer hover:text-[#1C1C1C] text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Banner */}
            <div className="mx-4 mb-4 bg-[#FBF7EE] rounded-xl px-5 py-4 flex items-center justify-between">
              <p className="text-[14px] text-[#1C1C1C] leading-snug max-w-[55%]">
                Get reliable <strong>expert advice</strong> to give your pet
                the best care every day.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {["banner1.svg", "banner2.svg", "banner3.svg", "banner4.svg"].map(
                  (src, i) => (
                    <img
                      key={i}
                      src={`/${src}`}
                      alt={`pet ${i + 1}`}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )
                )}
              </div>
            </div>

            {/* List */}
            <div className="px-4 pb-6 flex flex-col">
              {allAdviceList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3.5 border-t last:border-b border-[#E8E8E8] cursor-pointer px-2 group"
                >
                  <span className="text-[14px] text-[#1C1C1C] group-hover:text-gray-400 transition-colors">
                    {item}
                  </span>
                  <img src="review.svg" alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}