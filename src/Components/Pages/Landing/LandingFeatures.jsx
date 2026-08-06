import React from 'react';
import { useTranslation } from 'react-i18next';
import { LuHeadphones, LuTruck, LuGlobe, LuShieldCheck } from 'react-icons/lu';

// LandingFeatures has no dynamic API data — it's static feature info.
// The data prop is accepted but unused (keeps interface consistent).
export const LandingFeatures = ({ data }) => {
  const { t } = useTranslation();

  // Lucide react-icons standing in for the 4 line-icon SVGs used by
  // .trust-icon in HOMEPAGE V2.html (client service, delivery, made in
  // France, secure payment) — same thin-stroke line look, via icon library
  // instead of inline SVG.
  const features = [
    {
      Icon: () => <img src="head.svg" alt="" className="w-10 h-10" />,
      translationKey: 'clientService',
    },
    {
      Icon: () => <img src="truck.svg" alt="" className="w-10 h-10" />,
      translationKey: 'freeDelivery',
    },
    {
      Icon: () => <img src="earth.svg" alt="" className="w-10 h-10" />,
      translationKey: 'madeInFrance',
    },
    {
      Icon: () => <img src="card.svg" alt="" className="w-10 h-10" />,
      translationKey: 'securePayment',
    },
  ];

  return (
    // "Trust strip" — same editorial design as .trust in HOMEPAGE V2.html
    // (4 bordered items, line-icon + title + copy). Static content, no API data.
    <section className="w-full bg-[#f6f6f4] pt-[10px] pb-[25px] border-b border-[#d8d8d4]">
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] grid grid-cols-2 min-[1101px]:grid-cols-4 gap-[24px]">
        {features.map((feature, index) => {
          const { Icon } = feature;
          return (
            <div
              key={index}
              className="min-h-[118px] bg-transparent border border-[#d8d8d4] px-[18px] pt-[18px] pb-[16px] flex items-start gap-[14px]"
            >
             <Icon />
              <div>
                <strong className="block text-[13px] leading-[1.35] font-bold mb-1 text-black">
                  {t(`home:features.${feature.translationKey}.title`)}
                </strong>
                {t(`home:features.${feature.translationKey}.subtitle`, { defaultValue: '' }) && (
                  <p className="m-0 text-[12px] leading-[1.45] text-[#5f5f5a]">
                    {t(`home:features.${feature.translationKey}.subtitle`)}
                  </p>
                )}
                <p className="m-0 mt-[3px] text-[12px] leading-[1.45] text-[#5f5f5a]">
                  {t(`home:features.${feature.translationKey}.description`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
