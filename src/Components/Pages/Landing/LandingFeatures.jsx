import React from 'react';
import { useTranslation } from 'react-i18next';

const FONT_SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const GOLD = '#c9a24a';

// "Trust strip" — four joined ink cells: index top-left, then a gold eyebrow,
// a big serif value, a serif label, a small note and a short gold rule. Each
// cell carries a warm glow in its top-right corner. Static content — the
// data prop is accepted but unused (keeps the interface consistent).
export const LandingFeatures = ({ data }) => {
  const { t } = useTranslation();

  const keys = ['clientService', 'freeDelivery', 'madeInFrance', 'securePayment'];

  return (
    <section className="w-full bg-[#262626] py-6 min-[721px]:py-7">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
        precedence="default"
      />
      <div className="w-full">
        <div className="grid grid-cols-2 border-t border-white/[0.07] min-[1101px]:grid-cols-4">
          {keys.map((key, index) => {
            const tk = (field) => t(`home:features.${key}.${field}`, { defaultValue: '' });
            const value = tk('value');
            const isFigure = /^[\d€%.,\s]+$/.test(value);
            return (
              <div
                key={key}
                className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden border-b border-r border-white/[0.07] px-5 py-5 text-white even:border-r-0 min-[1101px]:even:border-r min-[1101px]:last:border-r-0 min-[721px]:min-h-[250px] min-[721px]:px-6 min-[721px]:py-6"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 55% at 100% 0%, rgba(201,162,74,.22), rgba(201,162,74,0) 62%), linear-gradient(180deg, #151412 0%, #0b0b0a 100%)',
                }}
              >
                {/* brighter glow on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(ellipse 80% 65% at 100% 0%, rgba(201,162,74,.16), rgba(201,162,74,0) 65%)',
                  }}
                />

                <span className="relative text-[9px] tracking-[0.2em] tabular-nums text-white/35">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="relative mt-8">
                  <p
                    className="m-0 text-[8px] font-semibold uppercase tracking-[0.24em] min-[721px]:text-[9px]"
                    style={{ color: GOLD }}
                  >
                    {tk('eyebrow')}
                  </p>
                  <p
                    className={`m-0 mt-1.5 leading-[1] text-white ${
                      isFigure
                        ? 'text-[clamp(34px,3.4vw,46px)]'
                        : 'text-[clamp(22px,2.1vw,30px)]'
                    }`}
                    style={{ fontFamily: FONT_SERIF }}
                  >
                    {value}
                  </p>
                  <p
                    className="m-0 mt-1.5 text-[16px] leading-tight text-white/90 min-[721px]:text-[18px]"
                    style={{ fontFamily: FONT_SERIF }}
                  >
                    {tk('label')}
                  </p>
                  <p className="m-0 mt-1 text-[10px] text-white/45 min-[721px]:text-[11px]">
                    {tk('note')}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-4 block h-px w-6 bg-[#c9a24a]/75 transition-all duration-500 ease-out group-hover:w-12 group-hover:bg-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
