import React, { useState, useRef, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useTopLoader } from "../TopLoader";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { mergeCartItem } from "../../../utils/cartStorage";
import { getDeviceId } from "../../../utils/deviceId";

import ModalAddToCart from "../Modal/ModalAddToCart";
import { GoArrowUpRight } from "react-icons/go";

const toCleanAmount = (val) => {
  if (typeof val === "number") return val;
  return parseFloat(String(val ?? "0").replace(",", ".")) || 0;
};
const formatPrice = (val, lang) => {
  const num = toCleanAmount(val);
  const locale = lang && lang.startsWith("fr") ? "fr-FR" : "en-US";
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
};
// Loading Card — mirrors the real card's box (soft studio bg, spotlight, tag
// top-left, glass caption along the bottom) so the skeleton doesn't jump in
// size once the real card swaps in. Same w-1/2 sm:w-1/3 md:w-1/4 wrapper as
// the real cards handles the small/large screen sizing. Sharp: the loader is a
// sliding line, not a spinning circle.
export const LoadingCard = ({ showBorder = false }) => (
  <div className="w-full h-full flex flex-col">
    <style>{`@keyframes lcSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    <div
      className={`bg-[#eceae4] ${showBorder ? "border border-[#d6d4cc]" : ""} relative flex flex-col aspect-[7/10] overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,.95),rgba(255,255,255,0)_62%)]" />

      {/* Top-left tag placeholder (New / Best / -20%) */}
      <div className="absolute top-2.5 left-2.5 w-14 h-6 bg-black/10 animate-pulse z-10" />
      {/* Top-right product-label placeholder */}
      <div className="absolute top-3 right-3 w-12 h-2 bg-black/10 animate-pulse z-10" />

      {/* Image area — sliding line, like the real card's loader */}
      <div className="relative flex-1 flex items-center justify-center">
        <span className="relative block w-14 h-px bg-black/15 overflow-hidden">
          <span
            className="absolute inset-y-0 left-0 w-1/3 bg-black"
            style={{ animation: "lcSlide 1.1s ease-in-out infinite" }}
          />
        </span>
      </div>

      {/* Caption placeholder */}
      <div className="absolute inset-x-2 bottom-2 bg-white/70 border border-white/60 px-3.5 py-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-3 w-3/4 bg-black/10 animate-pulse mb-2" />
          <div className="h-2 w-1/3 bg-black/10 animate-pulse" />
        </div>
        <div className="h-3 w-10 bg-black/10 animate-pulse" />
      </div>
    </div>
  </div>
);

export const LandingCards = ({
  product,
  showNav,
  squareCard,
  index,
  compact = false,
  compactButtons = false,
  fillHeight = false,
  forceVideo = false,
  promoStyle = false,
  smallLabel = false,
  // Only true for the Popular Products / Best Selling rows rendered from
  // MainVideo.jsx — every other place this card is used (shop grid,
  // wishlist, related products, etc.) stays borderless.
  showBorder = false,
}) => {
  const isSingleProduct = (product?.productsCount ?? 1) === 1;
  const { t, i18n } = useTranslation("home");
  const safeProduct = product || {};
  const displayName =
    i18n.language === "fr" && safeProduct.french_name
      ? safeProduct.french_name
      : safeProduct.name || "";
  const router = useRouter();
  const { start } = useTopLoader();
  const videoRef = useRef(null);
  const hoverTimeout = useRef(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isCurrentImageLoading = !imageLoaded;

  const handleImageLoaded = (_idx) => {
    if (_idx === currentImageIndex) setImageLoaded(true);
  };

  const firstImage = safeProduct.images?.[0];
  const restImages = safeProduct.images?.slice(1) || [];
  const videoUrl = safeProduct.videoUrl || null;

  const slides = [
    ...(firstImage ? [{ type: "image", url: firstImage }] : []),
    ...restImages.map((url) => ({ type: "image", url })),
  ];

  // Agar image browser cache mein ho to onLoad fire nahi hota — manually check karo
  useEffect(() => {
    setImageLoaded(false);
    const url = slides[currentImageIndex]?.url || safeProduct.image;
    if (!url) {
      setImageLoaded(true);
      return;
    }
    const img = new window.Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
    img.src = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageIndex, safeProduct.image]);

  useEffect(() => {
    if (!videoUrl) return;
    setIsVideoReady(false);
  }, [videoUrl]);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(false);
    setIsCardHovered(false);
    setSelectedSize(null);
    setSelectedColor(null);
  };

  useEffect(() => {
    return () => clearTimeout(hoverTimeout.current);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;
    if (isHovered || forceVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isHovered, videoUrl, forceVideo]);

  // CHANGE 3: title ke pehle 3 letters
  const shortTitle = displayName ? displayName.slice(0, 30) : "";
  const price = safeProduct.price ?? 0;

  const allProducts = safeProduct.products || [];
  const productType = allProducts[0]?.type || "no-size-color";
  const uniqueSizes = [
    ...new Set(allProducts.filter((p) => p.size_name).map((p) => p.size_name)),
  ];
  // Once a size is picked, only show the colors available for that size.
  const colorSourceProducts = selectedSize
    ? allProducts.filter((p) => p.size_name === selectedSize)
    : allProducts;
  const uniqueColors = [
    ...new Set(
      colorSourceProducts.filter((p) => p.color_name).map((p) => p.color_name),
    ),
  ];
  const hasSizes =
    (productType === "size" || productType === "size-color") &&
    uniqueSizes.length > 0;
  const hasColors =
    (productType === "color" || productType === "size-color") &&
    uniqueColors.length > 0;

  const handleDropupSelect = async (size, color) => {
    const matchedProduct =
      allProducts.find((p) => {
        if (productType === "size-color")
          return p.size_name === size && p.color_name === color;
        if (productType === "size") return p.size_name === size;
        if (productType === "color") return p.color_name === color;
        return true;
      }) || allProducts[0];
    if (!matchedProduct) return;
    setAddingToCart(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await axios.post(
        `${BASE_URL}/user/cart/create`,
        token
          ? { product_id: matchedProduct.id, quantity: 1 }
          : {
              device_id: getDeviceId(),
              product_id: matchedProduct.id,
              quantity: 1,
            },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );
      if (res.data.status === false) {
        toast.error(res.data.action_message || res.data.action || "Could not add to cart.");
      } else {
        mergeCartItem(res.data.data);
        setIsCartOpen(true);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setAddingToCart(false);
    }
  };

  const badgeText =
    index === 0 ? "New" : index === 1 ? "Best" : index === 2 ? "-20%" : null;
  const isDiscountBadge = index === 2;
  // Caption panel is open (add-to-cart / picker revealed) on hover, or always in promoStyle.
  const panelOpen = isCardHovered || promoStyle;
  // Round spinner (the one deliberate exception to the zero-radius rule).
  const spinnerSquare = (size, light = true) => (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid ${light ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)"}`,
        borderTopColor: light ? "#fff" : "#000",
        borderRadius: "50%",
        animation: "lcSpin 0.75s linear infinite",
        verticalAlign: "middle",
      }}
    />
  );
  const swatchBackground = (color) => {
    if (!color.includes(" & ")) return color;
    const [a, b] = color.split(" & ").map((p) => p.trim());
    return `linear-gradient(135deg, ${a} 50%, ${b} 50%)`;
  };
  // Tiny colour preview next to the name (max 4, "+n" for the rest).
  const previewColors = hasColors ? uniqueColors.slice(0, 4) : [];
  const extraColors = hasColors ? Math.max(0, uniqueColors.length - 4) : 0;

  const cartBtnClass = `group/btn w-full min-h-[40px] px-3.5 flex items-center justify-between text-[10px] font-semibold tracking-[0.2em] uppercase cursor-pointer border border-[#0b0b0a] transition-colors duration-300 ${
    addingToCart
      ? "bg-[#0b0b0a] text-white"
      : "bg-[#0b0b0a] text-white hover:bg-transparent hover:text-[#0b0b0a]"
  }`;

  return (
    <div className="w-full h-full flex flex-col">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes btnSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lcSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
      `}</style>
      <div
        className={`group/card bg-[#f3f3f3] ${showBorder ? "border border-[#d6d4cc]" : ""} relative flex flex-col overflow-hidden ${fillHeight ? "h-full" : compact ? "w-full h-140" : "aspect-[7/10]"} cursor-pointer`}
        onMouseEnter={() => {
          setIsCardHovered(true);
          handleMouseEnter();
        }}
        onMouseLeave={() => {
          setIsCardHovered(false);
          handleMouseLeave();
        }}
        onClick={() => {
          const slug =
            i18n.language === "fr"
              ? safeProduct.french_seo_keyword
              : safeProduct.english_seo_keyword;
          start();
          router.push(`/product/${slug}`);
        }}
      >
        {/* Studio spotlight behind the product */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,.95),rgba(255,255,255,0)_62%)] transition-opacity duration-700 group-hover/card:opacity-100 opacity-80" />

        {/* Tag — glass chip (solid ink for the discount) */}
        {badgeText && (
          <div
            className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex items-center gap-1.5 font-semibold uppercase tracking-[0.16em] ${
              smallLabel ? "text-[8px] px-1.5 py-1" : "text-[9px] px-2 py-1.5"
            } ${
              isDiscountBadge
                ? "bg-[#0b0b0a] text-white"
                : "bg-white/75 backdrop-blur-md text-[#0b0b0a] border border-white"
            }`}
          >
            {!isDiscountBadge && <span className="w-1 h-1 bg-[#0b0b0a]" />}
            {badgeText}
          </div>
        )}

        {promoStyle && (
          <div className="absolute top-3 left-3 flex items-center gap-0.5 z-10">
            {[0, 1, 2, 3].map((s) => (
              <FaStar key={s} className="w-3 h-3 text-black" />
            ))}
            <FaRegStar className="w-3 h-3 text-black" />
          </div>
        )}

        {/* Product Label — from API */}
        {(() => {
          const label =
            i18n.language === "fr" && safeProduct.french_product_label
              ? safeProduct.french_product_label
              : safeProduct.product_label || "";
          return label ? (
            <div
              className={`absolute top-3 right-3 text-right text-[#55544e] font-medium uppercase tracking-[0.14em] z-10 ${
                smallLabel
                  ? "max-w-[55%] text-[8px] leading-tight"
                  : "max-w-[52%] truncate text-[9px]"
              }`}
            >
              {label}
            </div>
          ) : null;
        })()}

        <div className="flex-1 relative overflow-hidden">
          {/* Image loader — sliding line */}
          {isCurrentImageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eceae4]">
              <span className="relative block w-14 h-px bg-black/15 overflow-hidden">
                <span
                  className="absolute inset-y-0 left-0 w-1/3 bg-black"
                  style={{ animation: "lcSlide 1.1s ease-in-out infinite" }}
                />
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              transform: `translateX(-${currentImageIndex * 100}%)`,
              transition: noTransition
                ? "none"
                : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {slides.map((slide, idx) => (
              <div key={idx} style={{ minWidth: "100%", height: "100%" }}>
                <img
                  src={slide.url || safeProduct.image}
                  alt={safeProduct.name || ""}
                  onLoad={() => handleImageLoaded(idx)}
                  onError={() => handleImageLoaded(idx)}
                  style={{
                    opacity: 1,
                    transition: "opacity 0.3s ease",
                  }}
                  className="w-full h-full object-contain px-3 pt-9 pb-[76px] "
                />
              </div>
            ))}
          </div>

          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              preload={forceVideo ? "auto" : "none"}
              loop
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload nofullscreen noremoteplayback"
              onCanPlay={() => setIsVideoReady(true)}
              style={{
                pointerEvents: "none",
                zIndex: 2,
                opacity: (isHovered || forceVideo) && isVideoReady ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            />
          )}

          {(isHovered || forceVideo) && videoUrl && !isVideoReady && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-[#eceae4]"
              style={{ zIndex: 3 }}
            >
              <span className="relative block w-14 h-px bg-black/15 overflow-hidden">
                <span
                  className="absolute inset-y-0 left-0 w-1/3 bg-black"
                  style={{ animation: "lcSlide 1.1s ease-in-out infinite" }}
                />
              </span>
            </div>
          )}

          {/* Glass caption — name, price, colour preview; the panel grows on
              hover to reveal add-to-cart (single product) or, straight away,
              the size/colour picker (products with variants) */}
          <div
            className="absolute inset-x-1.5 bottom-1.5 sm:inset-x-2 sm:bottom-2 bg-white/45 backdrop-blur-[6px] border border-white/60 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.45)]"
            style={{ zIndex: 7 }}
          >
            <div className={compactButtons ? "px-3 pt-2.5 pb-2.5" : "px-3.5 pt-3 pb-3"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[12px] font-medium leading-[1.3] tracking-[-0.005em] text-[#0b0b0a]">
                    {shortTitle}
                  </p>
                  {previewColors.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      {previewColors.map((color) => (
                        <span
                          key={color}
                          title={color}
                          className="w-2 h-2 border border-black/25"
                          style={{ background: swatchBackground(color) }}
                        />
                      ))}
                      {extraColors > 0 && (
                        <span className="ml-0.5 text-[9px] tabular-nums text-[#6c6a62]">
                          +{extraColors}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[#0b0b0a]">
                  {formatPrice(price, i18n.language)} €
                </span>
              </div>
            </div>

            {/* Expanding action area */}
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
              style={{ gridTemplateRows: panelOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className={compactButtons ? "px-2.5 pb-2.5" : "px-3 pb-3"}>
                  {isSingleProduct ? (
                    /* Single product → Add to Cart button */
                    <button
                      className={cartBtnClass}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (addingToCart) return;
                        const firstProduct = safeProduct.products?.[0];
                        if (firstProduct?.color || firstProduct?.size) {
                          setIsCartOpen(true);
                          return;
                        }
                        setAddingToCart(true);
                        try {
                          const loginData = JSON.parse(
                            localStorage.getItem("LoginData") || "null",
                          );
                          const token = loginData?.data?.token;
                          const res = await axios.post(
                            `${BASE_URL}/user/cart/create`,
                            token
                              ? {
                                  product_id: firstProduct?.id ?? safeProduct.id,
                                  quantity: 1,
                                }
                              : {
                                  device_id: getDeviceId(),
                                  product_id: firstProduct?.id ?? safeProduct.id,
                                  quantity: 1,
                                },
                            token
                              ? { headers: { Authorization: `Bearer ${token}` } }
                              : {},
                          );
                          if (res.data.status === false) {
                            toast.error(
                              res.data.action_message || res.data.action || "Could not add to cart.",
                            );
                          } else {
                            mergeCartItem(res.data.data);
                            setIsCartOpen(true);
                          }
                        } catch {
                          toast.error("Something went wrong.");
                        } finally {
                          setAddingToCart(false);
                        }
                      }}
                    >
                      {addingToCart ? (
                        <span className="mx-auto">{spinnerSquare(14)}</span>
                      ) : (
                        <>
                          <span>{t("products.addToCart")}</span>
                          <span className="text-[14px] leading-none font-normal">+</span>
                        </>
                      )}
                    </button>
                  ) : (
                    /* Size / colour picker — shown directly on hover (no
                       intermediate Add to Cart button, no close icon) */
                    <div onClick={(e) => e.stopPropagation()} className="relative pt-1">
                      {addingToCart && !(hasSizes && hasColors) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                          {spinnerSquare(14, false)}
                        </div>
                      )}

                      {hasSizes && (
                        <div className={hasColors ? "mb-2.5" : ""}>
                          <p className="m-0 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black">
                            {t("products.size") || "Size"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {uniqueSizes.map((size) => (
                              <button
                                key={size}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSize(size);
                                  if (!hasColors)
                                    handleDropupSelect(size, selectedColor);
                                }}
                                className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] cursor-pointer border transition-colors duration-150 ${
                                  selectedSize === size
                                    ? "bg-[#0b0b0a] text-white border-[#0b0b0a]"
                                    : "bg-white/80 text-black border-black/20 hover:border-black"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasColors && (
                        <div className={hasSizes && hasColors ? "mb-2.5" : ""}>
                          <p className="m-0 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black">
                            {t("products.color") || "Color"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {uniqueColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                title={color}
                                aria-label={color}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedColor(color);
                                  if (!hasSizes)
                                    handleDropupSelect(selectedSize, color);
                                }}
                                className="w-5 h-5 p-0 cursor-pointer border border-black/25 transition-all duration-150"
                                style={{
                                  background: swatchBackground(color),
                                  boxShadow:
                                    selectedColor === color
                                      ? "0 0 0 2px #fff, 0 0 0 3px #111"
                                      : "none",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {hasSizes && hasColors && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedSize && selectedColor)
                              handleDropupSelect(selectedSize, selectedColor);
                          }}
                          disabled={!selectedSize || !selectedColor}
                          className={`w-full min-h-[38px] text-[10px] font-semibold uppercase tracking-[0.2em] text-white border-0 flex items-center justify-center transition-colors duration-200 ${
                            selectedSize && selectedColor
                              ? "bg-[#0b0b0a] cursor-pointer"
                              : "bg-[#b9b7af] cursor-default"
                          }`}
                        >
                          {addingToCart
                            ? spinnerSquare(12)
                            : t("products.addToCart")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalAddToCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        product={safeProduct}
        autoCloseOnLeave
      />
    </div>
  );
};

export default function PopularProducts({
  title = "Popular Products",
  isWishlist = false,
  isFavourite = false,
  isHorizontal = false,
  isBestSeller = false,
  onTabChange,
  data,
  useGrid = false,
}) {
  const { t, i18n } = useTranslation("home");
  const router = useRouter();
  const { start } = useTopLoader();
  const currentCardIndexRef = useRef(0);

  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("favorite");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const apiProducts = data?.popular || [];
  const bestSellerProducts = data?.best_seller || [];
  const sectionSource = isBestSeller ? "best" : "popular";

  // Heading — eyebrow + big two-line uppercase title (last word gets a
  // trailing period), subtitle on the first line, controls on the second.
  const headingEyebrow = isBestSeller
    ? t("products.bestSellerEyebrow")
    : t("products.eyebrow");
  const headingSubtitle = isBestSeller
    ? t("products.bestSellerSubtitle")
    : t("products.subtitle");
  const titleWords = title.trim().split(" ");
  const titleLastWord = titleWords.pop() || "";
  const titleFirstLine = titleWords.join(" ");

  const mapProducts = (items) =>
    items.map((item) => ({
      id: item.id,
      name: item.name,
      french_name: item.french_name || "",
      english_seo_keyword:
        item.english_seo_keyboard || item.english_seo_keyword || "",
      french_seo_keyword: item.french_seo_keyword || "",
      price: item.price || item.products?.[0]?.price || "0",
      discount: item.discount || item.products?.[0]?.off || "",
      image:
        item.image ||
        (item.products?.[0]?.images[0]?.media
          ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}`
          : ""),
      images: item.images ||
        item.products?.[0]?.images?.map(
          (img) => `https://d18f57oyxifcsh.cloudfront.net/${img.media}`,
        ) || [""],
      videoUrl: item.products?.[0]?.video?.media
        ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].video.media}`
        : null,
      liked: item.liked ?? item.favorites_exists,
      productsCount: item.products?.length || 1,
      products: item.products || [],
      description: item.description || "",
      french_description: item.french_description || "",
      product_label: item.product_label || "",
      french_product_label: item.french_product_label || "",
      _raw: item,
    }));

  const products = isBestSeller
    ? mapProducts(bestSellerProducts)
    : mapProducts(apiProducts);

  const checkScrollPosition = () => {
    // Sirf tab run karo jab index 0 pe ho (initial state)
    if (currentCardIndexRef.current > 0) return;

    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    if (products.length === 0) return;
    // Agar already loaded tha (cached data se), shimmer skip karo
    setIsLoading(false);
    setTimeout(checkScrollPosition, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Desktop: a wrapped paragraph keeps its max-width box even when its
  // lines are shorter, which leaves a gap on the right. Shrink the box to
  // the widest rendered line so the text sits flush with the right padding
  // (same as LandingCategories).
  const subtitleRef = useRef(null);
  useEffect(() => {
    const el = subtitleRef.current;
    if (!el) return undefined;
    const fit = () => {
      el.style.width = "";
      if (window.innerWidth < 900) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const widest = Math.max(0, ...[...range.getClientRects()].map((r) => r.width));
      if (widest) el.style.width = `${Math.ceil(widest)}px`;
    };
    fit();
    document.fonts?.ready?.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [i18n.language, headingSubtitle]);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll(":scope > div");
    if (!cards.length) return;

    const totalCards = cards.length;
    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth + 3;
    const visibleCount = Math.round(container.clientWidth / cardWidth);
    const maxIndex = totalCards - visibleCount;

    // Ref se current value lo — stale closure problem nahi hogi
    const currentIndex = currentCardIndexRef.current;

    let newIndex;
    if (direction === "next") {
      newIndex = Math.min(currentIndex + 1, maxIndex);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    currentCardIndexRef.current = newIndex;

    const targetCard = cards[newIndex];
    container.scrollTo({
      left: targetCard.offsetLeft - 5,
      behavior: "smooth",
    });

    setCanScrollLeft(newIndex > 0);
    setCanScrollRight(newIndex < maxIndex);
  };

  const isDefaultRow = !useGrid && !isFavourite && !isWishlist;

  // Square nav button — hairline black, compact height, rounded-none
  const navBtnClass = (enabled) =>
    `h-8 sm:h-9 px-3 min-w-[36px] sm:min-w-[42px] flex items-center justify-center border rounded-none transition-all duration-300 ${
      enabled
        ? "border-black/30 text-black cursor-pointer hover:bg-black hover:text-white hover:border-black shadow-sm active:scale-95"
        : "border-black/15 text-black/25 cursor-not-allowed"
    }`;

  const goToSection = () => {
    start();
    router.push(`/shop?source=${sectionSource}`);
  };

  return (
    <div className="w-full bg-[#f5f4f0]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lcSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />

      <div
        className={
          isFavourite
            ? "px-4 py-6"
            : isWishlist
              ? "px-4 py-6"
              : isHorizontal || useGrid
                ? "px-0 py-6 md:py-8 lg:py-10"
                : // Default heading (below) carries its own top/bottom
                  // rhythm, and the cards sit flush against whatever comes
                  // next — so no extra top/bottom padding here at all.
                  "px-0"
        }
      >
        {isFavourite ? null : isWishlist ? (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h1 className="text-2xl lg:text-4xl font-light uppercase tracking-[-0.03em] text-black">
                {t("products.wishlistTitle")}
              </h1>
              <button className="group flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase font-semibold text-black self-start cursor-pointer">
                <IoClose className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                <span className="border-b border-transparent group-hover:border-black transition-colors">
                  {t("products.removeAll")}
                </span>
              </button>
            </div>

            <div className="flex gap-0 border-b border-black/15">
              <button
                onClick={() => {
                  setActiveTab("favorite");
                  onTabChange?.("favorite");
                }}
                className={`px-5 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
                  activeTab === "favorite"
                    ? "bg-black text-white"
                    : "bg-transparent text-black hover:bg-black/5"
                }`}
              >
                {t("products.favoriteProducts")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("advice");
                  onTabChange?.("advice");
                }}
                className={`px-5 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
                  activeTab === "advice"
                    ? "bg-black text-white"
                    : "bg-transparent text-black hover:bg-black/5"
                }`}
              >
                {t("products.favoriteAdvices")}
              </button>
            </div>
          </div>
        ) : isHorizontal ? (
          <div className="flex justify-end mb-6">
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => scroll("prev")}
                disabled={!canScrollLeft}
                aria-label="Previous"
                className={navBtnClass(canScrollLeft)}
              >
                <IoChevronBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={!canScrollRight}
                aria-label="Next"
                className={navBtnClass(canScrollRight)}
              >
                <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        ) : useGrid ? null : (
          <div className="w-full bg-[#f5f4f0]">
            <div
              className={`w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] pb-8 min-[721px]:pb-14 ${
                isBestSeller ? "pt-[clamp(60px,7vw,110px)]" : "pt-0"
              }`}
            >
              {/* Header — hairline + eyebrow, two-line title (no dividers). The subtitle
                  sits on the first title line and the controls on the
                  second, both flush with the right padding (same as the
                  left), like LandingCategories. */}
              <div className="w-full">
                <div className="mb-3 flex items-center gap-3 sm:mb-4">
                  <span className="h-px w-8 shrink-0 bg-black/30 sm:w-12" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#666] sm:text-[10px]">
                    {headingEyebrow}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6">
                  {/* display:contents lets the two title lines sit in the grid rows */}
                  <h2 className="contents">
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={goToSection}
                      onKeyDown={(e) => e.key === "Enter" && goToSection()}
                      className="col-start-1 row-start-1 block cursor-pointer text-[clamp(26px,4.5vw,56px)] font-light uppercase leading-[1.04] tracking-[-0.035em] text-[#444]"
                    >
                      {titleFirstLine}
                    </span>
                    <span
                      role="link"
                      tabIndex={-1}
                      onClick={goToSection}
                      className="col-start-1 row-start-2 block cursor-pointer text-[clamp(26px,4.5vw,56px)] font-extrabold uppercase leading-[1.04] tracking-[-0.035em] text-[#0c0c0c]"
                    >
                      {`${titleLastWord}.`}
                    </span>
                  </h2>

                  <p
                    ref={subtitleRef}
                    className="col-span-2 row-start-3 mt-4 max-w-[480px] text-[13px] leading-[1.7] text-[#555] sm:text-[14px] min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:mt-0 min-[900px]:justify-self-end min-[900px]:self-center"
                  >
                    {headingSubtitle}
                  </p>

                  <div className="col-start-2 row-start-2 flex shrink-0 items-center gap-1.5 self-center justify-self-end sm:gap-2">
                    <button
                      onClick={() => scroll("prev")}
                      disabled={!canScrollLeft}
                      aria-label="Previous"
                      className={navBtnClass(canScrollLeft)}
                    >
                      <IoChevronBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => scroll("next")}
                      disabled={!canScrollRight}
                      aria-label="Next"
                      className={navBtnClass(canScrollRight)}
                    >
                      <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        start();
                        router.push("/shop");
                      }}
                      className="group ml-1 hidden sm:inline-flex items-center gap-2 cursor-pointer border border-black/30 px-4 h-8 sm:h-9 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-bold text-black whitespace-nowrap rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95 shadow-sm"
                    >
                      {t("products.seeMore")}
                      <GoArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className={
            useGrid
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 "
              : isFavourite || isWishlist
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "flex overflow-x-auto pb-4 hide-scrollbar"
          }
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={
                    useGrid || isFavourite || isWishlist
                      ? "w-full"
                      : `flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 ${index > 0 ? "-ml-px" : ""}`
                  }
                >
                  <LoadingCard showBorder={isDefaultRow} />
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  className={
                    useGrid || isFavourite || isWishlist
                      ? "w-full max-w-[240px] mx-auto"
                      : `flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 ${index > 0 ? "-ml-px" : ""}`
                  }
                >
                  <LandingCards
                    product={product}
                    showNav={true}
                    index={index}
                    compact={false}
                    showBorder={isDefaultRow}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
