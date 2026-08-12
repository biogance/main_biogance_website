'use client';

import React from 'react';

// Ported from .editorial / .statline — "Chosen with purpose." section. The
// ingredient count now comes from OurIngredients.jsx's
// POST {BASE_URL}/ingredient/list response (`data.total`) instead of a
// hardcoded name list — shows a pulsing placeholder until that first
// response lands.
export default function IngredientsEditorial({ total, loading }) {
  return (
    /* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
       IngredientsHero.jsx: that cap only centers past 1840px, pinning
       this flush left below it then sliding it inward above it. */
    <section className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] py-[clamp(84px,9vw,140px)] grid grid-cols-1 min-[1001px]:grid-cols-[.92fr_1.08fr] items-end gap-[clamp(36px,5vw,88px)]">
      <div>
        <span className="flex items-center gap-3 text-[10px] tracking-[.18em] uppercase before:content-[''] before:w-[38px] before:h-px before:bg-current">
          Natural by choice
        </span>
        <h2 className="mt-[18px] text-[48px] min-[641px]:text-[clamp(54px,7vw,112px)] leading-[.87] tracking-[-.07em] uppercase font-medium">
          Chosen with
          <br />
          purpose.
        </h2>
      </div>
      <div className="max-w-[650px]">
        <p className="text-[16px] leading-[1.75] text-[#565650] mb-5">
          Every formula begins with ingredient selection. At Biogance, botanical extracts, minerals and functional
          actives are chosen according to the care need, then incorporated at the right concentration to create
          effective, well-balanced formulas.
        </p>
        <p className="text-[16px] leading-[1.75] text-[#565650]">
          Explore the ingredient library to understand where each active comes from, what it brings to the formula
          and the types of care in which it is used.
        </p>
        <div className="border-t border-[#d9d8d1] pt-[22px] mt-6 grid grid-cols-1 min-[641px]:grid-cols-3 gap-[18px]">
          <div>
            {loading ? (
              <span className="inline-block h-[27px] w-10 bg-[#eee] rounded animate-pulse" />
            ) : (
              <strong className="block text-[27px] font-medium">{total ?? 0}</strong>
            )}
            <span className="text-[10px] tracking-[.12em] uppercase text-[#77766f]">Ingredients to explore</span>
          </div>
          <div>
            <strong className="block text-[27px] font-medium">3</strong>
            <span className="text-[10px] tracking-[.12em] uppercase text-[#77766f]">Ways to understand each active</span>
          </div>
          <div>
            <strong className="block text-[27px] font-medium">France</strong>
            <span className="text-[10px] tracking-[.12em] uppercase text-[#77766f]">Laboratory expertise</span>
          </div>
        </div>
      </div>
    </section>
  );
}
