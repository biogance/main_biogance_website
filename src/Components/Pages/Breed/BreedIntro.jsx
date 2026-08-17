'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

// "A guide built for pet parents" editorial section — ported from .breed-intro.
export default function BreedIntro() {
  const { t } = useTranslation('breed');

  return (
    <section className="bg-white border-b border-[#d8d8d4] py-[clamp(84px,9vw,138px)]">
      {/* No max-w-[1840px]/mx-auto — same zoom/viewport-width fix as
          BreedHero.jsx (and IngredientsHero.jsx's siblings): that cap only
          centers past 1840px, leaving equal margins on both sides instead of
          staying flush left/right like the hero above it once the viewport
          (zooming out effectively widens it) crosses that width. */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-1 min-[1181px]:grid-cols-[minmax(0,.9fr)_minmax(360px,1.1fr)] gap-[clamp(34px,4vw,64px)] items-end">
        <div>
          <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
            {t('intro.eyebrow')}
          </span>
          <h2 className="mt-[18px] text-[clamp(48px,7vw,85px)] leading-[.92] tracking-[-.072em] uppercase font-[100]">
            {t('intro.titleLine1')}
            <br />
            {t('intro.titleLine2')}
          </h2>
        </div>
        <div className="max-w-[620px]">
          <p className="mb-5 text-[15px] leading-[1.75] text-[#595955]">{t('intro.paragraph1')}</p>
          <p className="mb-5 text-[15px] leading-[1.75] text-[#595955]">{t('intro.paragraph2')}</p>
          <div className="border-t border-[#d8d8d4] pt-[18px] mt-7 text-[11px] leading-[1.55] text-[#767670]">
            {t('intro.disclaimer')}
          </div>
        </div>
      </div>
    </section>
  );
}
