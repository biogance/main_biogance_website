'use client';

import React from 'react';

// "A guide built for pet parents" editorial section — ported from .breed-intro.
export default function BreedIntro() {
  return (
    <section className="bg-white border-b border-[#d8d8d4] py-[clamp(84px,9vw,138px)]">
      <div className="w-full max-w-[1840px] mx-auto px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[minmax(0,.9fr)_minmax(360px,1.1fr)] gap-[clamp(34px,4vw,64px)] items-end">
        <div>
          <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
            Every companion is different
          </span>
          <h2 className="mt-[18px] text-[clamp(48px,7vw,100px)] leading-[.92] tracking-[-.072em] uppercase font-[100]">
            A guide built
            <br />
            for pet parents.
          </h2>
        </div>
        <div className="max-w-[620px]">
          <p className="mb-5 text-[15px] leading-[1.75] text-[#595955]">
            Start with a breed, then discover the information that matters in daily life — from temperament and
            energy to grooming needs, coat profile and home lifestyle.
          </p>
          <p className="mb-5 text-[15px] leading-[1.75] text-[#595955]">
            Each profile uses the breed information prepared for Biogance and presents it in a clearer, more useful
            format.
          </p>
          <div className="border-t border-[#d8d8d4] pt-[18px] mt-7 text-[11px] leading-[1.55] text-[#767670]">
            Breed traits are general guides. Every dog and cat remains an individual, with needs shaped by age,
            health, lifestyle and personality.
          </div>
        </div>
      </div>
    </section>
  );
}
