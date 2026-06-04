"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function StickyAddToCart({
  price = "16.0",
  selectedVolume,
  onVolumeChange,
  productName = "Biogance Universal 2-in-1 Shampoo",
  volumes = [],
  isFooterVisible = false,
  quantity,
  onQuantityChange,
}) {
  const { t } = useTranslation("stickyaddtocart");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-[#E0E0E0]">
      <div className="w-full px-3 py-2 sm:px-4 lg:px-8 lg:py-0 min-h-[70px] flex flex-col gap-2 lg:h-[70px] lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT: Product Name */}
        <div className="w-full flex items-center justify-center lg:flex-1 lg:justify-start">
          <p className="text-[11px] sm:text-[12px] font-semibold text-[#1C1C1C] max-w-full lg:max-w-[360px] leading-tight text-center lg:text-left">
            {productName}
          </p>
        </div>

        {/* CENTER: Volume */}
        {volumes.length > 0 && (
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 lg:flex-1 lg:gap-2">
            <span className="text-[10px] sm:text-[11px] text-[#999] font-medium uppercase tracking-wide">
              {t("productVolume")}
            </span>
            {volumes.map((vol, idx) => (
              <React.Fragment key={vol}>
                <button
                  onClick={() => onVolumeChange(vol)}
                  className={`flex items-center gap-1 text-[11px] sm:text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
                    selectedVolume === vol ? "text-[#1C1C1C]" : "text-[#AAAAAA]"
                  }`}
                >
                  <span
                    className={`w-[7px] h-[7px] rounded-full inline-block shrink-0 transition-colors duration-150 ${
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

        {/* RIGHT: Quantity + Add to Cart */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3 lg:flex-1 lg:justify-end">
          {/* Quantity */}
          <div className="flex items-center border border-[#E8E8E8] rounded-md overflow-hidden shrink-0">
            <button
              onClick={() => onQuantityChange((q) => Math.max(1, q - 1))}
              disabled={quantity === 1}
              className={`w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] bg-[#F7F6F7] flex items-center justify-center transition-all duration-200 ${
                quantity === 1
                  ? "cursor-not-allowed text-[#BBB]"
                  : "cursor-pointer hover:bg-[#EBEBEB] text-[#1C1C1C]"
              }`}
            >
              <FaMinus size={9} />
            </button>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#1C1C1C] w-7 sm:w-8 text-center select-none">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange((q) => q + 1)}
              className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] bg-[#F7F6F7] flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-all duration-200 text-black"
            >
              <FaPlus size={9} />
            </button>
          </div>

          {/* Add to Cart */}
          <button className="flex-1 lg:flex-none bg-[#1C1C1C] text-white text-[11px] sm:text-[12px] lg:text-[13px] font-semibold px-3 sm:px-4 lg:px-6 h-[36px] sm:h-[38px] rounded-lg hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap text-center">
            {t("addToCart")} – €{price}
          </button>
        </div>
      </div>
    </div>
  );
}
