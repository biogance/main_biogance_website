"use client";
import React from "react";
import { useTranslation } from "react-i18next";

export default function StickyAddToCart({
  price = "16.0",
  selectedVolume,
  onVolumeChange,
  productName = "Biogance Universal 2-in-1 Shampoo",
  volumes = [],
  inline = false,
}) {
  const { t } = useTranslation("stickyaddtocart");

  return (
    <div
      className={`bg-white border-t border-[#E0E0E0] ${
        inline ? "w-full" : "fixed bottom-0 left-0 right-0 z-50"
      }`}
    >
      <div className="w-full px-4 lg:px-14 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-6">
        {/* Product Name - large screen only */}
        <p className="text-[13px] font-medium text-[#1C1C1C] leading-snug max-w-[360px] hidden lg:block">
          {productName}
        </p>

        {/* Volume Selector + Button row on small/medium */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full lg:contents gap-2 sm:gap-4">
          {/* Volume Selector */}
          {volumes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-[#888] font-medium shrink-0">
                {t("quantity")}
              </span>
              {volumes.map((vol, idx) => (
                <React.Fragment key={vol}>
                  <button
                    onClick={() => onVolumeChange(vol)}
                    className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                      selectedVolume === vol ? "text-[#1C1C1C]" : "text-[#AAAAAA]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block shrink-0 transition-colors duration-150 ${
                        selectedVolume === vol ? "bg-[#1C1C1C]" : "bg-[#CCCCCC]"
                      }`}
                    />
                    {vol}
                  </button>
                  {idx < volumes.length - 1 && (
                    <span className="text-[#DDDDDD] text-sm select-none">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Add to Cart Button */}
          <button className="bg-[#1C1C1C] text-white text-[13px] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-[#333] transition-colors cursor-pointer shrink-0 w-full sm:w-auto">
            {t("addToCart")} – €{price}
          </button>
        </div>
      </div>
    </div>
  );
}
