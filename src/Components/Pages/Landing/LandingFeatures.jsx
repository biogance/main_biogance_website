import React from 'react';
import { useTranslation } from 'react-i18next';
import { LuHeadset, LuTruck, LuMapPin, LuShieldCheck } from 'react-icons/lu';

const GOLD = '#c9a24a';

const ITEMS = [
  { key: 'clientService', Icon: LuHeadset },
  { key: 'freeDelivery', Icon: LuTruck },
  { key: 'madeInFrance', Icon: LuMapPin },
  { key: 'securePayment', Icon: LuShieldCheck },
];

// "Trust strip" — one solid ink band of four joined cells: an outlined icon
// on top, then a gold eyebrow, a big value, a label and a small note,
// all in the site's regular font. A white rule draws across the cell's base
// on hover.
//
// The band sits flush between the product row above and the product finder
// below — no gap on either side. Static content — the data prop is accepted
// but unused (keeps the interface consistent).
export const LandingFeatures = ({ data }) => {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-[#0b0b0a]">
      <div className="grid w-full grid-cols-2 bg-[#0b0b0a] min-[1101px]:grid-cols-4">
        {ITEMS.map(({ key, Icon }) => {
          const tk = (field) => t(`home:features.${key}.${field}`, { defaultValue: '' });
          const value = tk('value');
          const isFigure = /^[\d€%.,\s]+$/.test(value);
          return (
            <div
              key={key}
              className="group relative flex min-h-[210px] flex-col justify-between border-white/10 px-4 py-6 text-white odd:border-r max-[1100px]:[&:nth-child(-n+2)]:border-b min-[721px]:min-h-[270px] min-[721px]:px-[clamp(24px,2.4vw,46px)] min-[721px]:py-9 min-[1101px]:border-r min-[1101px]:last:border-r-0"
            >
              {/* Icon */}
              <div className="flex items-start">
                <span className="grid h-9 w-9 place-items-center border border-white/15 text-white/80 min-[721px]:h-11 min-[721px]:w-11">
                  <Icon className="h-4 w-4 min-[721px]:h-[18px] min-[721px]:w-[18px]" strokeWidth={1.5} />
                </span>
              </div>

              <div className="mt-8">
                <p
                  className="m-0 text-[9px] font-semibold uppercase tracking-[0.26em] min-[721px]:text-[10px]"
                  style={{ color: GOLD }}
                >
                  {tk('eyebrow')}
                </p>
                <p
                  className={`m-0 mt-2.5 font-light leading-[1] tracking-[-0.03em] text-white ${
                    isFigure
                      ? 'text-[clamp(34px,3.4vw,50px)]'
                      : 'text-[clamp(22px,2.1vw,30px)]'
                  }`}
                >
                  {value}
                </p>
                <p className="m-0 mt-2.5 text-[14px] font-medium leading-tight text-white/90 min-[721px]:text-[16px]">
                  {tk('label')}
                </p>
                <p className="m-0 mt-2 text-[10px] uppercase tracking-[0.18em] text-white/45 min-[721px]:text-[11px]">
                  {tk('note')}
                </p>
              </div>

              {/* White rule — drawn across the cell's base on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
