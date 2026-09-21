import React, { useState, useRef, useEffect } from "react";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useTopLoader } from "../TopLoader";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { saveCartData, mergeCartItem } from "../../../utils/cartStorage";
import { getDeviceId } from "../../../utils/deviceId";

import ModalAddToCart from "../Modal/ModalAddToCart";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { GoArrowUpRight } from "react-icons/go";
import LandingSectionHead from "./LandingSectionHead";

const toCleanAmount = (val) => {
  if (typeof val === "number") return val;
  return parseFloat(String(val ?? "0").replace(",", ".")) || 0;
};
const formatPrice = (val, lang) => {
  const num = toCleanAmount(val);
  const locale = lang && lang.startsWith("fr") ? "fr-FR" : "en-US";
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
};
// Loading Card Component — mirrors the real LandingCards shape exactly
// (paper bg, aspect-[7/10], optional hairline border, tag top-left, name +
// price row along the bottom) so the skeleton doesn't jump in size once the
// real card swaps in. Same w-1/2 sm:w-1/3 md:w-1/4 wrapper as the real cards
// handles the small/large screen sizing. Sharp: the loader is a sliding
// line, not a spinning circle.
export const LoadingCard = ({ showBorder = false }) => (
  <div className="w-full h-full flex flex-col">
    <style>{`@keyframes lcSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    <div
      className={`bg-[#efeee9] ${showBorder ? "border border-[#d6d4cc]" : ""} relative flex flex-col aspect-[7/10] overflow-hidden`}
    >
      {/* Top-left tag placeholder (New / Best / -20%) */}
      <div className="absolute top-0 left-0 w-14 h-6 bg-black/10 animate-pulse z-10" />
      {/* Top-right product-label placeholder */}
      <div className="absolute top-3 right-3 w-12 h-2 bg-black/10 animate-pulse z-10" />

      {/* Image area — paper tone + sliding line, like the real card's loader */}
      <div className="flex-1 flex items-center justify-center bg-[#f4f3ef]">
        <span className="relative block w-14 h-px bg-black/15 overflow-hidden">
          <span
            className="absolute inset-y-0 left-0 w-1/3 bg-black"
            style={{ animation: "lcSlide 1.1s ease-in-out infinite" }}
          />
        </span>
      </div>

      {/* Name/price row placeholder, along the bottom like the real card */}
      <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5 flex items-end justify-between gap-4">
        <div className="h-3 w-1/2 bg-black/10 animate-pulse" />
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

  const [isLiked, setIsLiked] = useState(safeProduct.liked || false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const [loadedImages, setLoadedImages] = useState(new Set()); // DISABLED: causes blank cards on Chrome macOS after infinite scroll
  const [noTransition, setNoTransition] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  const isCurrentImageLoading = !imageLoaded;

  const handleImageLoaded = (_idx) => {
    if (_idx === currentImageIndex) setImageLoaded(true);
  };

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
  }, [currentImageIndex, safeProduct.image]);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (loadingFav) return;
    setLoadingFav(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const payload = token ? {} : { device_id: getDeviceId() };
      const res = await axios.post(
        `${BASE_URL}/user/add/favorite/bundle/${safeProduct.id}`,
        payload,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );
      if (res.data.status === false) {
        const msg =
          res.data.errors?.length > 0
            ? res.data.errors[0].message
            : (res.data.action_message || res.data.action);
        toast.error(msg);
      } else {
        setIsLiked((prev) => !prev);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingFav(false);
    }
  };

  const firstImage = safeProduct.images?.[0];
  const restImages = safeProduct.images?.slice(1) || [];
  const videoUrl = safeProduct.videoUrl || null;

  const slides = [
    ...(firstImage ? [{ type: "image", url: firstImage }] : []),
    ...restImages.map((url) => ({ type: "image", url })),
  ];

  const goToSlide = (idx) => {
    const total = slides.length;
    if (total === 0) return;
    if (idx < 0 || idx >= total) {
      const target = (idx + total) % total;
      setNoTransition(true);
      setCurrentImageIndex(target);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setNoTransition(false)),
      );
    } else {
      setNoTransition(false);
      setCurrentImageIndex(idx);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    goToSlide(currentImageIndex - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    goToSlide(currentImageIndex + 1);
  };

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
    setIsDropupOpen(false);
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
    setIsDropupOpen(false);
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
  const infoVisible = !(isCardHovered || promoStyle);
  const actionVisible = isCardHovered || promoStyle;
  const spinnerSquare = (size, light = true) => (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid ${light ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)"}`,
        borderTopColor: light ? "#fff" : "#000",
        animation: "lcSpin 0.75s linear infinite",
        verticalAlign: "middle",
      }}
    />
  );
  const cartBtnBase =
    "w-full py-2.5 px-3 text-[10px] font-semibold tracking-[0.18em] uppercase cursor-pointer border border-black flex items-center justify-center transition-colors duration-200";

  return (
    <div className="w-full h-full flex flex-col">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes btnSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lcSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
      `}</style>
      <div
        className={`group/card bg-[#efeee9] ${showBorder ? "border border-[#d6d4cc]" : ""} relative flex flex-col ${fillHeight ? "h-full" : compact ? "w-full h-140" : "aspect-[7/10]"} cursor-pointer`}
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
        {/* Solid black corner tag — New / Best / -20% */}
        {badgeText && (
          <div
            className={`absolute top-0 left-0 z-10 bg-black text-white font-semibold uppercase tracking-[0.16em] ${smallLabel ? "text-[8px] px-2 py-1" : "text-[9px] px-2.5 py-1.5"}`}
          >
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
              className={`absolute top-3 right-3 text-right text-[#4f4e48] font-semibold uppercase tracking-[0.14em] z-10 ${
                smallLabel
                  ? "max-w-[60%] text-[8px] leading-tight"
                  : "max-w-[55%] truncate text-[9px]"
              }`}
            >
              {label}
            </div>
          ) : null;
        })()}

        <div className="flex-1 relative overflow-hidden">
          {/* Image loader — paper tone + centered sliding line */}
          {isCurrentImageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f4f3ef]">
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
                  className="w-full h-full object-contain px-2 pt-7 pb-10 transition-transform duration-700 group-hover/card:scale-[1.04]"
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
              className="absolute inset-0 flex items-center justify-center bg-[#f4f3ef]"
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

          {/* Info row + add-to-cart overlay along the bottom edge */}
          <div
            className={`absolute bottom-0 left-0 right-0 ${compactButtons ? "px-2.5 pb-2.5 pt-8" : "px-3.5 pb-3.5 pt-10"} bg-gradient-to-t from-[#efeee9] via-[#efeee9]/85 to-transparent`}
            style={{ zIndex: 7 }}
          >
            {/* Name + price — hide on hover (always hidden in promoStyle) */}
            <div
              className="flex items-baseline justify-between gap-3 cursor-pointer"
              style={{
                opacity: infoVisible ? 1 : 0,
                transition: "opacity 0.2s ease",
                pointerEvents: infoVisible ? "auto" : "none",
              }}
            >
              <p className="min-w-0 truncate m-0 text-[11px] font-medium uppercase tracking-[0.06em] text-black">
                {shortTitle}
              </p>
              <span className="shrink-0 text-[11px] tabular-nums text-[#55544e]">
                {formatPrice(price, i18n.language)} €
              </span>
            </div>

            {/* QuickView OR Add to Cart button — show on hover (always in promoStyle) */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: compactButtons ? "0 10px 10px" : "0 14px 14px",
                opacity: actionVisible ? 1 : 0,
                transition: "opacity 0.2s ease",
                pointerEvents: actionVisible ? "auto" : "none",
              }}
            >
              {isSingleProduct ? (
                /* Single product → Add to Cart button */
                <button
                  className={`${cartBtnBase} ${
                    addingToCart || promoStyle
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
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
                    spinnerSquare(14)
                  ) : (
                    <>
                      {t("products.addToCart")} –{" "}
                      {formatPrice(safeProduct.price, i18n.language)} €
                    </>
                  )}
                </button>
              ) : (
                /* Multiple products → button click pe dropup in-place expand */
                <div style={{ position: "relative" }}>
                  <button
                    className={`${cartBtnBase} ${
                      addingToCart || promoStyle
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                    style={{ visibility: isDropupOpen ? "hidden" : "visible" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(null);
                      setSelectedColor(null);
                      setIsDropupOpen(true);
                    }}
                  >
                    {addingToCart ? (
                      spinnerSquare(14)
                    ) : (
                      <>
                        {t("products.addToCart")} –{" "}
                        {formatPrice(safeProduct.price, i18n.language)} €
                      </>
                    )}
                  </button>

                  {/* Dropup — maxHeight animation for smooth open/close */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden border-black"
                    style={{
                      zIndex: 9,
                      maxHeight: isDropupOpen ? "300px" : "0px",
                      borderTopWidth: isDropupOpen ? 1 : 0,
                      transition:
                        "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="relative p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropupOpen(false);
                        }}
                        aria-label="Close"
                        className="absolute top-2 right-2 text-[13px] leading-none text-[#55544e] hover:text-black cursor-pointer bg-transparent border-0"
                      >
                        ✕
                      </button>

                      {hasSizes && (
                        <div className={hasColors ? "mb-3" : ""}>
                          <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
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
                                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] cursor-pointer border transition-colors duration-150 ${
                                  selectedSize === size
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-[#cfcdc5] hover:border-black"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasColors && (
                        <div className={hasSizes && hasColors ? "mb-3" : ""}>
                          <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
                            {t("products.color") || "Color"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {uniqueColors.map((color) => {
                              const isDual = color.includes(" & ");
                              const swatchBg = isDual
                                ? (() => {
                                    const [a, b] = color
                                      .split(" & ")
                                      .map((p) => p.trim());
                                    return `linear-gradient(135deg, ${a} 50%, ${b} 50%)`;
                                  })()
                                : color;
                              return (
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
                                  className="w-6 h-6 p-0 cursor-pointer border border-[#cfcdc5] transition-all duration-150"
                                  style={{
                                    background: swatchBg,
                                    boxShadow:
                                      selectedColor === color
                                        ? "0 0 0 2px #fff, 0 0 0 3px #111"
                                        : "none",
                                  }}
                                />
                              );
                            })}
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
                          className={`w-full py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white border-0 flex items-center justify-center transition-colors duration-200 ${
                            selectedSize && selectedColor
                              ? "bg-black cursor-pointer"
                              : "bg-[#c9c7bf] cursor-default"
                          }`}
                        >
                          {addingToCart
                            ? spinnerSquare(12)
                            : t("products.addToCart")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
  const { t } = useTranslation("home");
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

  // Heading — same editorial style as HOMEPAGE V2.html's .commerce-heading
  // (eyebrow + big two-line uppercase title, last word gets a trailing period).
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
  }, [products]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        // container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [isLoading]);

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

  return (
    <div className="w-full bg-[#f5f4f0]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes imgShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin89345 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
          <div className="w-full bg-[#f5f4f0] border-t border-[#d6d4cc]">
            <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] pt-[68px] min-[721px]:pt-[clamp(72px,8vw,118px)] pb-[34px] min-[721px]:pb-[52px]">
              <LandingSectionHead
                index="02"
                eyebrow={headingEyebrow}
                line1={titleFirstLine}
                line2={`${titleLastWord}.`}
                subtitle={headingSubtitle}
                onTitleClick={() => {
                  start();
                  router.push(`/shop?source=${sectionSource}`);
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
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

                  <button
                    type="button"
                    onClick={() => {
                      start();
                      router.push("/shop");
                    }}
                    className="group inline-flex items-center gap-2 cursor-pointer border border-black/30 px-4 h-8 sm:h-9 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-bold text-black whitespace-nowrap rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95 shadow-sm"
                  >
                    {t("products.seeMore")}
                    <GoArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </LandingSectionHead>
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
                : isHorizontal
                  ? "flex overflow-x-auto pb-4 hide-scrollbar"
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
