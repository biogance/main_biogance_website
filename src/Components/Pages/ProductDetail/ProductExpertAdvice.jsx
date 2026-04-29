"use client";
import React from "react";
import { BsBookmark } from "react-icons/bs";

const adviceList = [
  "Why does my dog smell bad?",
  "Which care is best for my dog?",
  "My dog is scratching – What should I do ?",
  "How to properly wash my dog ?",
  "My dog had flaas: what should I do ?",
];

export default function ProductExpertAdvice() {
  return (
<section className="w-full bg-[#EFEFEF] mt-20">
  <div className="flex flex-col lg:flex-row w-full">

    {/* LEFT: Dog Image - 50% */}
    <div className="w-full lg:w-1/2 bg-[#D7D7D7] flex items-center justify-center py-10">
      <img
        src="dog.svg"
        alt="Expert Advice Dog"
        className="h-[480px] w-auto object-contain object-center"
      />
    </div>

    {/* RIGHT: Expert Advice - 50% */}
    <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 lg:px-16 py-14 bg-[#F3F3F3]">

      <h2 className="text-[24px] lg:text-[28px] font-bold text-[#1C1C1C] mb-7">
        Expert Advice
      </h2>

      <div className="flex flex-col">
        {adviceList.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3.5 border-t border-[#D8D8D8] last:border-b cursor-pointer group"
          >
            <span className="text-[14px] text-[#1C1C1C] group-hover:text-black transition-colors">
              {item}
            </span>
            <BsBookmark className="w-4 h-4 text-[#1C1C1C] shrink-0 ml-4" />
          </div>
        ))}
      </div>

      <button className="mt-8 w-fit bg-[#1C1C1C] text-white text-[13px] font-medium px-6 py-2.5 rounded-md hover:bg-[#333] transition-colors cursor-pointer">
        See more
      </button>

    </div>
  </div>
</section>
  );
}