'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';


export default function IngredientsEditorial({ total, loading }) {
  const { t } = useTranslation('ingredients');

  return (
   
    <section className="px-4 min-[641px]:px-[clamp(22px,2.5vw,48px)] py-[clamp(84px,9vw,140px)] grid grid-cols-1 min-[1001px]:grid-cols-[.92fr_1.08fr] items-end gap-[clamp(36px,5vw,88px)]">
      <div>
        <span className="flex items-center gap-3 text-[10px] tracking-[.18em] uppercase before:content-[''] before:w-[38px] before:h-px before:bg-current">
          {t('editorial.eyebrow')}
        </span>
        <h2 className="mt-[18px] text-[48px] min-[641px]:text-[clamp(54px,7vw,90px)] leading-[.97] tracking-[-.07em] uppercase font-medium">
          {t('editorial.titleLine1')}
          <br />
          {t('editorial.titleLine2')}
        </h2>
      </div>
      <div className="max-w-[650px]">
        <p className="text-[16px] leading-[1.75] text-[#565650] mb-5">{t('editorial.paragraph1')}</p>
        <p className="text-[16px] leading-[1.75] text-[#565650]">{t('editorial.paragraph2')}</p>
        <div className="border-t border-[#d9d8d1] pt-[22px] mt-6 grid grid-cols-1 min-[641px]:grid-cols-3 gap-[18px]">
          <div>
            {loading ? (
              <span className="block h-[27px] w-[44px] mb-[1px] bg-[#e5e4dd] rounded-[3px] animate-pulse" />
            ) : (
              <strong className="block text-[27px] font-medium">{total ?? 0}</strong>
            )}
            <span className="text-[10px] tracking-[.12em] uppercase text-[#77766f]">
              {t('editorial.stats.ingredientsLabel')}
            </span>
          </div>
          <div>
            <strong className="block text-[27px] font-medium">{t('editorial.stats.waysCount')}</strong>
            <span className="text-[10px] tracking-[.12em] uppercase text-[#77766f]">
              {t('editorial.stats.waysLabel')}
            </span>
          </div>
          <div>
            <strong className="block text-[27px] font-medium">{t('editorial.stats.laboratoryValue')}</strong>
            <span className="text-[10px] tracking-[.12em] uppercase text-[#77766f]">
              {t('editorial.stats.laboratoryLabel')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}