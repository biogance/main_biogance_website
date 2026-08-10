'use client';

import React, { useState } from 'react';

const HERO_DOG = 'https://static.vecteezy.com/system/resources/thumbnails/047/493/732/small/cute-dog-posing-png.png';
const HERO_CAT = 'https://www.dropbox.com/scl/fi/caforeo3mhadf0cdxhleq/Abyssin.png?rlkey=vx7mb8dati42xp52r2yyxzyef&raw=1';

// Same black spinner-while-loading pattern as BreedCard.jsx — these two URLs
// are hardcoded for now, but once they come from an API instead they can
// arrive late just like breed card images do, so this needs the same
// loading state.
function HeroImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-7 h-7 rounded-full border-2 border-black/15 border-t-black animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`relative z-10 max-h-full max-w-full object-contain saturate-[.92] p-[5px] min-[761px]:p-5 ${
          loaded ? '' : 'opacity-0'
        }`}
      />
    </>
  );
}

export default function BreedHero() {
  return (
    <section className="relative w-full bg-[#f6f6f4] border-b border-[#d8d8d4] min-h-screen min-[1181px]:h-screen overflow-hidden grid grid-rows-[auto_auto] min-[1181px]:grid-rows-1 min-[1181px]:grid-cols-[1.05fr_.95fr]">
      {/* Copy */}
      <div className="flex flex-col justify-center max-w-[1040px] px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] py-[clamp(24px,6vw,60px)] min-[1181px]:py-[clamp(70px,8vw,100px)]">
        <span className="flex items-center gap-3 text-[10px] tracking-[.22em] uppercase before:content-[''] before:w-[34px] before:h-px before:bg-current">
          Biogance breed guide
        </span>
        <h1 className="mt-[18px] mb-[18px] min-[721px]:mt-[22px] min-[721px]:mb-[26px] text-[clamp(38px,11vw,58px)] min-[721px]:text-[clamp(48px,8vw,72px)] min-[1181px]:text-[clamp(62px,8.4vw,100px)] leading-[1.02] tracking-[-.05em] min-[1181px]:tracking-[-.08em] uppercase font-medium">
          Know them.
          <br />
          Care better.
        </h1>
        <p className="max-w-[620px] text-sm min-[721px]:text-base leading-[1.65] min-[721px]:leading-[1.72] text-[#595955]">
          Explore breed profiles designed around the questions pet parents actually ask: personality, lifestyle,
          grooming and the specific coat or skin needs that can shape an everyday care routine.
        </p>
      </div>

      {/* Pets */}
      <div className="grid grid-cols-2 h-[260px] min-[481px]:h-[340px] min-[721px]:h-[420px] min-[1181px]:h-full min-[1181px]:min-h-0 overflow-hidden bg-[#efefee]">
        <div className="relative overflow-hidden border-l border-[#d8d8d4] bg-[#efefee] flex items-center justify-center">
          <HeroImage src={HERO_DOG} alt="Dog breed" />
          <span className="absolute bottom-[14px] left-[14px] min-[761px]:bottom-[22px] min-[761px]:left-[22px] text-[8px] min-[761px]:text-[9px] tracking-[.15em] uppercase">Dog breeds</span>
        </div>
        <div className="relative overflow-hidden border-l border-[#d8d8d4] bg-[#deddd8] flex items-center justify-center">
          <HeroImage src={HERO_CAT} alt="Cat breed" />
          <span className="absolute bottom-[14px] left-[14px] min-[761px]:bottom-[22px] min-[761px]:left-[22px] text-[8px] min-[761px]:text-[9px] tracking-[.15em] uppercase">Cat breeds</span>
        </div>
      </div>
    </section>
  );
}
