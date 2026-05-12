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
      <div className="w-full px-4 lg:px-8 h-[70px] flex items-center justify-between">
        {/* LEFT: Product Name */}
        <div className="flex-1 flex items-center">
          <p className="text-[12px] font-semibold text-[#1C1C1C] max-w-[360px]">
            {productName}
          </p>
        </div>

        {/* CENTER: Volume */}
        {volumes.length > 0 && (
          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="text-[11px] text-[#999] font-medium uppercase tracking-wide">
              {t("productVolume")}
            </span>
            {volumes.map((vol, idx) => (
              <React.Fragment key={vol}>
                <button
                  onClick={() => onVolumeChange(vol)}
                  className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
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
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Quantity */}
          <div className="flex items-center border border-[#E8E8E8] rounded-md overflow-hidden">
            <button
              onClick={() => onQuantityChange((q) => Math.max(1, q - 1))}
              disabled={quantity === 1}
              className={`w-[30px] h-[30px] bg-[#F7F6F7] flex items-center justify-center transition-all duration-200 ${
                quantity === 1
                  ? "cursor-not-allowed text-[#BBB]"
                  : "cursor-pointer hover:bg-[#EBEBEB] text-[#1C1C1C]"
              }`}
            >
              <FaMinus size={9} />
            </button>
            <span className="text-[13px] font-semibold text-[#1C1C1C] w-8 text-center select-none">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange((q) => q + 1)}
              className="w-[30px] h-[30px] bg-[#F7F6F7] flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-all duration-200 text-black"
            >
              <FaPlus size={9} />
            </button>
          </div>

          {/* Add to Cart */}
          <button className="bg-[#1C1C1C] text-white text-[13px] font-semibold px-6 h-[38px] rounded-lg hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap">
            {t("addToCart")} – €{price}
          </button>
        </div>
      </div>
    </div>
  );
}
