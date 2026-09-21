import React from "react";

// Ultra-premium modern luxury section header with clean flex-grid layout,
// crisp typography, zero border-radius, and pristine control alignment.
export default function LandingSectionHead({
  index,
  eyebrow,
  line1,
  line2,
  subtitle,
  onTitleClick,
  tone = "light",
  children,
}) {
  const dark = tone === "dark";

  return (
    <div
      className={`w-full pb-6 sm:pb-8 border-b ${
        dark ? "border-white/15" : "border-black/15"
      }`}
    >
      {/* Top Row — Eyebrow Badge Left + Navigation Controls Right */}
      <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
        <div
          className={`flex items-center gap-2.5 sm:gap-3 ${
            dark ? "text-white" : "text-black"
          }`}
        >
          {index ? (
            <span
              className={`px-2.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] rounded-none ${
                dark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              {index}
            </span>
          ) : null}
          <span className={`h-px w-8 sm:w-12 ${dark ? "bg-white/40" : "bg-black/30"}`} />
          <span
            className={`text-[9px] sm:text-[10px] font-bold tracking-[0.28em] uppercase ${
              dark ? "text-white/70" : "text-[#666]"
            }`}
          >
            {eyebrow}
          </span>
        </div>

        {/* Right Pinned Navigation Action Controls */}
        {children ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        ) : null}
      </div>

      {/* Main Title & Description Section */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-4 sm:gap-6 items-end">
        <div>
          {onTitleClick ? (
            <button
              type="button"
              onClick={onTitleClick}
              className="group text-left cursor-pointer"
            >
              <h2 className="text-[clamp(26px,4.5vw,56px)] leading-[1.04] tracking-[-0.035em] uppercase">
                {line1 ? (
                  <span className={`font-light block ${dark ? "text-white/80" : "text-[#444]"}`}>
                    {line1}
                  </span>
                ) : null}
                {line2 ? (
                  <span className={`font-extrabold block ${dark ? "text-white" : "text-[#0c0c0c]"}`}>
                    {line2}
                  </span>
                ) : null}
              </h2>
            </button>
          ) : (
            <h2 className="text-left text-[clamp(26px,4.5vw,56px)] leading-[1.04] tracking-[-0.035em] uppercase">
              {line1 ? (
                <span className={`font-light block ${dark ? "text-white/80" : "text-[#444]"}`}>
                  {line1}
                </span>
              ) : null}
              {line2 ? (
                <span className={`font-extrabold block ${dark ? "text-white" : "text-[#0c0c0c]"}`}>
                  {line2}
                </span>
              ) : null}
            </h2>
          )}
        </div>

        {subtitle ? (
          <p
            className={`max-w-[480px] text-[13px] sm:text-[14px] leading-[1.7] font-normal min-[900px]:text-right ${
              dark ? "text-white/70" : "text-[#555]"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
