'use client';

import React from 'react';

export default function IngredientsHero() {
  return (
    <section className="relative overflow-hidden min-h-[100svh]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,#00000094,#0000001f 55%,#0000000d), url('https://www.biogance.com/wp-content/uploads/2023/02/IMG_9984-scaled.jpg') 50% 52%/cover no-repeat",
        }}
      />

      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-[1] w-full px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] text-white">
        <span className="flex items-center gap-3 text-[10px] tracking-[.18em] uppercase before:content-[''] before:w-[38px] before:h-px before:bg-current">
          Inside every formula
        </span>
        <h1 className="mt-6 mb-7 text-[58px] min-[641px]:text-[clamp(62px,9vw,100px)] leading-[.82] tracking-[-.07em] uppercase font-medium">
          Our
          <br />
          Ingredients.
        </h1>
        <p className="max-w-[620px] text-[17px] leading-[1.6] text-white/[.92]">
          Discover the ingredients behind Biogance care — selected for their quality, their purpose and the benefits
          they bring to your companion&apos;s everyday routine.
        </p>
      </div>
    </section>
  );
}