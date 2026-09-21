import React from 'react';
import { useTranslation } from 'react-i18next';

// LandingFeatures has no dynamic API data — it's static feature info.
// The data prop is accepted but unused (keeps interface consistent).
export const LandingFeatures = ({ data }) => {
  const { t } = useTranslation();

  const features = [
    { icon: '/head.svg', translationKey: 'clientService' },
    { icon: '/truck.svg', translationKey: 'freeDelivery' },
    { icon: '/earth.svg', translationKey: 'madeInFrance' },
    { icon: '/card.svg', translationKey: 'securePayment' },
  ];

  return (
    // Ink-black "trust strip": four cells split by hairlines, white line
    // icons, numbered top-left. Static content, no API data.
    <section className="w-full bg-[#0c0c0c] text-white">
      <div className="w-full px-0 min-[721px]:px-[clamp(24px,2.4vw,46px)]">
        <div className="grid grid-cols-2 min-[1101px]:grid-cols-4 border-l border-white/15">
          {features.map((feature, index) => {
            const subtitle = t(`home:features.${feature.translationKey}.subtitle`, {
              defaultValue: '',
            });
            return (
              <div
                key={feature.translationKey}
                className="group relative flex flex-col justify-between gap-10 min-h-[190px] min-[721px]:min-h-[220px] px-5 min-[721px]:px-7 py-6 min-[721px]:py-8 border-r border-b min-[1101px]:border-b-0 border-white/15 transition-colors duration-300 hover:bg-white hover:text-black"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] tracking-[0.22em] tabular-nums text-white/45 group-hover:text-black/45 transition-colors duration-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <img
                    src={feature.icon}
                    alt=""
                    className="w-9 h-9 min-[721px]:w-10 min-[721px]:h-10 object-contain brightness-0 invert group-hover:invert-0 transition-all duration-300"
                  />
                </div>

                <div>
                  <strong className="block text-[12px] min-[721px]:text-[13px] leading-[1.4] font-semibold uppercase tracking-[0.12em] mb-2">
                    {t(`home:features.${feature.translationKey}.title`)}
                  </strong>
                  {subtitle && (
                    <p className="m-0 text-[12px] leading-[1.55] text-white/60 group-hover:text-black/60 transition-colors duration-300">
                      {subtitle}
                    </p>
                  )}
                  <p className="m-0 mt-1 text-[12px] leading-[1.55] text-white/60 group-hover:text-black/60 transition-colors duration-300">
                    {t(`home:features.${feature.translationKey}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
