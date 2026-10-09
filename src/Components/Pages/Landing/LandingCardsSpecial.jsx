"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { LuShoppingBag, LuX, LuCheck } from "react-icons/lu";
import { useTopLoader } from "../TopLoader";
import { BASE_URL } from "../../API/API";
import { mergeCartItem } from "../../../utils/cartStorage";
import { getDeviceId } from "../../../utils/deviceId";
import ModalAddToCart from "../Modal/ModalAddToCart";

// Mobile-only product card for the home page rows (Popular / Best Selling,
// rendered from MainVideo.jsx through LandingCards.jsx's PopularProducts
// with `mobileSpecial`). Everywhere else — and on larger screens — the
// regular LandingCards card is used.
//
// Look: the photo sits in a soft studio tile with the tag (New / Best /
// -20%) top-left and an add-to-cart icon bottom-right; the name, the
// product label and the price sit under the tile. The icon adds a
// single-variant product straight away and opens the cart modal; a product
// with sizes / colours opens a quick-add panel inside the tile to pick them
// first.

// Price exactly as the API sends it ("12,3" stays "12,3").
const priceText = (val) => {
  const raw = typeof val === "string" ? val.trim() : val;
  if (raw === "" || raw === null || raw === undefined) return "0";
  return String(raw);
};

const swatchBackground = (color) => {
  if (!color.includes(" & ")) return color;
  const [a, b] = color.split(" & ").map((p) => p.trim());
  return `linear-gradient(135deg, ${a} 50%, ${b} 50%)`;
};

const Spinner = ({ size = 14, light = false }) => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-block",
      width: size,
      height: size,
      border: `2px solid ${light ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)"}`,
      borderTopColor: light ? "#fff" : "#0b0b0a",
      borderRadius: "50%",
      animation: "lcsSpin 0.75s linear infinite",
    }}
  />
);

const addToCartRequest = async (productId) => {
  const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
  const token = loginData?.data?.token;
  const res = await axios.post(
    `${BASE_URL}/user/cart/create`,
    token
      ? { product_id: productId, quantity: 1 }
      : { device_id: getDeviceId(), product_id: productId, quantity: 1 },
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
  if (res.data.status === false) {
    throw new Error(res.data.action_message || res.data.action || "Could not add to cart.");
  }
  mergeCartItem(res.data.data);
};

// Placeholder with the same box as the real card.
export const SpecialLoadingCard = () => (
  <div className="flex h-full w-full flex-col">
    <style>{`@keyframes lcsSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    <div className="relative grid aspect-[1/1.12] w-full place-items-center overflow-hidden bg-[#eceae4] border border-black/5">
      <span className="relative block h-px w-12 overflow-hidden bg-black/15">
        <span
          className="absolute inset-y-0 left-0 w-1/3 bg-black"
          style={{ animation: "lcsSlide 1.1s ease-in-out infinite" }}
        />
      </span>
    </div>
    <div className="px-1 pt-2.5 pb-2">
      <div className="h-3.5 w-4/5 animate-pulse bg-black/10 mb-1.5" />
      <div className="h-2.5 w-1/2 animate-pulse bg-black/10 mb-2" />
      <div className="h-3.5 w-1/4 animate-pulse bg-black/10" />
    </div>
  </div>
);

export function LandingCardSpecial({ product, index }) {
  const { t, i18n } = useTranslation("home");
  const router = useRouter();
  const { start } = useTopLoader();
  const isFrench = i18n.language === "fr";
  const p = product || {};

  const name = (isFrench && p.french_name ? p.french_name : p.name) || "";
  const label = (isFrench && p.french_product_label ? p.french_product_label : p.product_label) || "";
  const image = p.images?.[0] || p.image || "";

  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const tileRef = useRef(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Variants (same rules as LandingCards.jsx)
  const allProducts = p.products || [];
  const isSingleProduct = (p.productsCount ?? 1) === 1;
  const productType = allProducts[0]?.type || "no-size-color";
  const uniqueSizes = [...new Set(allProducts.filter((x) => x.size_name).map((x) => x.size_name))];
  const hasSizes = (productType === "size" || productType === "size-color") && uniqueSizes.length > 0;
  const allColors = [...new Set(allProducts.filter((x) => x.color_name).map((x) => x.color_name))];
  const hasColors = (productType === "color" || productType === "size-color") && allColors.length > 0;
  const needsPicker = !isSingleProduct && (hasSizes || hasColors);

  const badgeText = index === 0 ? "New" : index === 1 ? "Best" : index === 2 ? "-20%" : null;
  const isDiscountBadge = index === 2;

  const openProduct = () => {
    const slug = isFrench ? p.french_seo_keyword : p.english_seo_keyword;
    start();
    router.push(`/product/${slug}`);
  };

  const handleCartIcon = async (e) => {
    e.stopPropagation();
    if (adding) return;
    if (needsPicker) {
      setSheetOpen(true);
      return;
    }
    setAdding(true);
    try {
      await addToCartRequest(allProducts[0]?.id ?? p.id);
      setCartOpen(true);
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <style>{`@keyframes lcsSpin { to { transform: rotate(360deg); } }`}</style>

      {/* Photo Tile — zero border radius (rounded-none), soft studio background */}
      <div
        ref={tileRef}
        role="link"
        tabIndex={0}
        aria-label={name}
        onClick={sheetOpen ? undefined : openProduct}
        onKeyDown={(e) => e.key === "Enter" && openProduct()}
        className="relative aspect-[1/1.12] w-full cursor-pointer overflow-hidden bg-[#f3f3f3] border border-black/5"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,.95),rgba(255,255,255,0)_64%)]" />

        {!imageLoaded && (
          <div className="absolute inset-0 grid place-items-center bg-[#eceae4]">
            <span className="relative block h-px w-12 overflow-hidden bg-black/15">
              <span
                className="absolute inset-y-0 left-0 w-1/3 bg-black"
                style={{ animation: "lcsSlide 1.1s ease-in-out infinite" }}
              />
            </span>
            <style>{`@keyframes lcsSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
          </div>
        )}
        {image && (
          <img
            src={image}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            ref={(el) => {
              if (el?.complete && !imageLoaded) setImageLoaded(true);
            }}
            className="relative h-full w-full object-contain px-3 pb-10 pt-8"
          />
        )}

        {/* Tag — EXACT same design as LandingCards.jsx */}
        {badgeText && (
          <div
            className={`absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] ${
              isDiscountBadge
                ? "bg-[#0b0b0a] text-white"
                : "bg-white/75 backdrop-blur-md text-[#0b0b0a] border border-white"
            }`}
          >
            {!isDiscountBadge && <span className="w-1 h-1 bg-[#0b0b0a]" />}
            {badgeText}
          </div>
        )}

        {/* Cart Icon button — square sharp corners (rounded-none) */}
        <button
          type="button"
          onClick={handleCartIcon}
          aria-label={t("products.addToCart", "Add to Cart")}
          className="absolute bottom-2 right-2 z-10 grid h-9 w-9 place-items-center border border-black/10 bg-white text-[#0b0b0a] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
        >
          {adding ? <Spinner size={14} /> : <LuShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.75} />}
        </button>

        {sheetOpen && (
          <QuickAddPanel
            product={p}
            allProducts={allProducts}
            productType={productType}
            hasSizes={hasSizes}
            hasColors={hasColors}
            uniqueSizes={uniqueSizes}
            containerRef={tileRef}
            onClose={() => setSheetOpen(false)}
            onAdded={() => {
              setSheetOpen(false);
              setCartOpen(true);
            }}
          />
        )}
      </div>

      {/* Name, label, price under the tile */}
      <div className="cursor-pointer px-1 pt-2.5 pb-2" onClick={openProduct}>
        <p className="m-0 line-clamp-2 text-[13px] font-bold leading-[1.3] tracking-tight text-[#0b0b0a]">
          {name}
        </p>
        {label && (
          <p className="m-0 mt-1 truncate text-[11px] font-medium text-[#6c6a62]">{label}</p>
        )}
        <p className="m-0 mt-1.5 text-[13px] font-semibold tabular-nums text-[#0b0b0a]">
          {p.priceLabel || priceText(p.price)} €
        </p>
      </div>

      <ModalAddToCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        product={p}
        autoCloseOnLeave
      />
    </div>
  );
}

// Quick-add panel for products with sizes / colours. Instead of a bottom
// sheet it rises from the bottom of the product tile itself, only as tall as
// its options need (sizes only = short; sizes + colours = taller, scrolling
// inside if it would outgrow the tile): pick the options right on the card,
// then add. Closes with the ✕,
// Escape, or a tap anywhere outside the card.
function QuickAddPanel({
  product,
  allProducts,
  productType,
  hasSizes,
  hasColors,
  uniqueSizes,
  containerRef,
  onClose,
  onAdded,
}) {
  const { t } = useTranslation("home");
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [shown, setShown] = useState(false);

  // Once a size is picked, only the colours available in that size.
  const colorSource = size ? allProducts.filter((x) => x.size_name === size) : allProducts;
  const colors = [...new Set(colorSource.filter((x) => x.color_name).map((x) => x.color_name))];

  const ready = (!hasSizes || size) && (!hasColors || color);
  const matched =
    allProducts.find((x) => {
      if (productType === "size-color") return x.size_name === size && x.color_name === color;
      if (productType === "size") return x.size_name === size;
      if (productType === "color") return x.color_name === color;
      return true;
    }) || null;
  const shownPrice = matched?.price ?? product.priceLabel ?? product.price;

  const close = () => {
    setShown(false);
    setTimeout(onClose, 220);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async () => {
    if (!ready || adding) return;
    setAdding(true);
    try {
      await addToCartRequest((matched || allProducts[0])?.id ?? product.id);
      setShown(false);
      setTimeout(onAdded, 180);
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
      setAdding(false);
    }
  };

  const sectionLabel = (text, value) => (
    <p className="m-0 mb-1.5 flex items-baseline justify-between gap-2 text-[8.5px] font-semibold uppercase tracking-[0.22em] text-[#0b0b0a]">
      {text}
      {value && (
        <span className="truncate text-[10px] font-medium normal-case tracking-normal text-[#6c6a62]">{value}</span>
      )}
    </p>
  );

  return (
    <div
      role="dialog"
      aria-label={t("products.addToCart", "Add to Cart")}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={`absolute inset-x-0 bottom-0 z-30 flex max-h-full cursor-default flex-col border-t border-black/[0.06] bg-white/[0.88] backdrop-blur-md transition-[opacity,translate] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-2.5 pt-2">
        <span className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-[0.24em] text-[#0b0b0a]">
          <span className="h-px w-3 bg-[#0b0b0a]" />
          {t("products.quickAdd", "Quick add")}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label={t("productFinder.close", "Close")}
          className="grid h-7 w-7 place-items-center text-[#0b0b0a] active:scale-95"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 space-y-3 overflow-y-auto px-2.5 pb-2.5 pt-1" style={{ overscrollBehavior: "contain" }}>
        {hasSizes && (
          <div>
            {/* {sectionLabel(t("products.size", "Size"), size)} */}
            <div className="grid grid-cols-2 gap-1.5">
              {uniqueSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => {
                    setSize(s);
                    // drop a colour that does not exist in the new size
                    if (color && !allProducts.some((x) => x.size_name === s && x.color_name === color)) setColor(null);
                  }}
                  className={`h-8 truncate border px-1 text-[10.5px] font-medium uppercase tracking-[0.04em] transition-colors ${
                    size === s
                      ? "border-[#0b0b0a] bg-[#0b0b0a] text-white"
                      : "border-black/15 bg-white text-[#0b0b0a]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasColors && (
          <div>
            {sectionLabel(t("products.color", "Color"), color)}
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  aria-label={c}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className="h-6 w-6 border border-black/20 transition-shadow"
                  style={{
                    background: swatchBackground(c),
                    boxShadow: color === c ? "0 0 0 2px #fff, 0 0 0 3.5px #0b0b0a" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={!ready || adding}
        className="mx-2.5 mb-2.5 flex h-9 shrink-0 items-center justify-between gap-2 bg-[#0b0b0a] px-3 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white transition-colors disabled:bg-black/[0.14] disabled:text-[#6c6a62]"
      >
        {adding ? (
          <span className="mx-auto">
            <Spinner size={13} light />
          </span>
        ) : (
          <>
  <span className="text-[10px] leading-none">{t("products.add", "Add")}</span>
  <span className="text-[10px] leading-none tracking-normal tabular-nums">
    {priceText(shownPrice)} €
  </span>
</>
        )}
      </button>
    </div>
  );
}
