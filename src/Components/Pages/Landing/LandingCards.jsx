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
// (bg-[#efefee], aspect-[7/10], optional border, title/price overlaid at
// the bottom of the card) instead of its own aspect-[5/6] box with a
// separate title/price block below it, so the skeleton doesn't jump in
// size once the real card swaps in. Same w-1/2 sm:w-1/3 md:w-1/4 wrapper
// as the real cards handles the small/large screen sizing.
export const LoadingCard = ({ showBorder = false }) => (
  <div className="w-full h-full flex flex-col">
    <div
      className={`bg-[#efefee] ${showBorder ? "border border-gray-300" : ""} relative flex flex-col aspect-[7/10] overflow-hidden`}
    >
      {/* Top-left badge placeholder (New / Best / -20%) */}
      <div className="absolute top-3 left-3 w-10 h-3 rounded-sm bg-gray-300/80 animate-pulse z-10" />
      {/* Top-right product-label placeholder */}
      <div className="absolute top-3 right-3 w-12 h-3 rounded-sm bg-gray-300/80 animate-pulse z-10" />

      {/* Image area — same #f3f3f3 + spinning ring as the real card's image loader */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "#f3f3f3" }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "3px solid #aaa",
            borderTopColor: "transparent",
            animation: "lcSpin 0.75s linear infinite",
          }}
        />
      </div>

      {/* Title/price line placeholder, overlaid at the bottom like the real card */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
        <div className="h-3 w-3/4 bg-gray-300/80 rounded animate-pulse" />
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
            : res.data.action;
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
        toast.error(res.data.action || "Could not add to cart.");
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

  return (
    <div className="w-full h-full flex flex-col">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes btnSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <div
        className={`bg-[#efefee] ${showBorder ? "border border-gray-300" : ""} relative flex flex-col ${fillHeight ? "h-full" : compact ? "w-full h-140" : "aspect-[7/10]"} cursor-pointer`}
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
        {/* CHANGE 2: !(isHovered && videoUrl) condition hata di — ab video hover pe bhi show hoga */}
        {index === 0 && (
          // Replace karo:
          <div
            className={`absolute top-3 left-3 text-black ${smallLabel ? "text-[10px] px-1.5" : "text-xs px-2"} font-semibold py-1 z-10`}
          >
            New
          </div>
        )}

        {index === 1 && (
          // Replace karo:
          <div
            className={`absolute top-3 left-3 text-black ${smallLabel ? "text-[10px] px-1.5" : "text-xs px-2"} font-semibold py-1  z-10`}
          >
            Best
          </div>
        )}

        {index === 2 && (
          // Replace karo:
          <div
            className={`absolute top-3 left-3 text-black ${smallLabel ? "text-[10px] px-1.5" : "text-xs px-2"} font-semibold py-1 z-10`}
          >
            -20%
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

        {/* Heart Icon - Commented Out */}
        {/* <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 cursor-pointer w-8 h-8 bg-white rounded-xl border border-gray-200 flex items-center justify-center z-10 hover:bg-gray-50 transition-colors"
        >
          {isLiked ? (
            <FaHeart className="w-4 h-4 text-black" />
          ) : (
            <FaRegHeart className="w-4 h-4 text-gray-700" />
          )}
        </button> */}

        {/* CHANGE 2: Product Label — from API */}
        {(() => {
          const label =
            i18n.language === "fr" && safeProduct.french_product_label
              ? safeProduct.french_product_label
              : safeProduct.product_label || "";
          return label ? (
            <div
              className={`absolute top-3 right-3 text-right text-black font-semibold py-1 z-10 ${
                smallLabel
                  ? "max-w-[65%] text-[10px] leading-tight px-1.5"
                  : "max-w-[60%] truncate text-xs px-2"
              }`}
            >
              {label}
            </div>
          ) : null;
        })()}

        <div className="flex-1 relative overflow-hidden">
          {/* CHANGE 1: showNav arrows — commented out (image case mein bhi) */}
          {/* {showNav && slides.length > 1 && !(isHovered && videoUrl) && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-transparent flex items-center justify-center z-20 transition-all opacity-70 hover:opacity-100 cursor-pointer"
              >
                <IoChevronBack className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-transparent flex items-center justify-center z-20 transition-all opacity-70 hover:opacity-100 cursor-pointer"
              >
                <IoChevronForward className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )} */}

          {/* Image loader — #aaa background + centered #aaa spinning ring */}
          {isCurrentImageLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: "#f3f3f3" }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "3px solid #aaa",
                  borderTopColor: "transparent",
                  animation: "lcSpin 0.75s linear infinite",
                }}
              />
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
                  className="w-full h-full object-contain"
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
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 3, background: "#f3f3f3" }}
            >
              <div
                // Replace karo:

                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "3px solid #aaa",
                  borderTopColor: "transparent",
                  animation: "spin 0.75s linear infinite",
                }}
              />
            </div>
          )}

          {/* CHANGE 1: Dot indicators — commented out (image case mein bhi) */}
          {/* {slides.length > 1 && !(isHovered && videoUrl) && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    width: idx === currentImageIndex ? "16px" : "6px",
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor:
                      idx === currentImageIndex
                        ? "#000"
                        : "rgba(163, 163, 163, 0.8)",
                  }}
                />
              ))}
            </div>
          )} */}

          {/* Title + Price / Add to Cart overlay */}
          <div
            className={`absolute bottom-0 ${compactButtons ? "mb-0 sm:mb-3" : "mb-0 sm:mb-4"} left-0 right-0 px-3 py-2`}
            style={{ zIndex: 7 }}
          >
            {/* Title + Price — hover pe hide (promoStyle mein hamesha hidden) */}
            <p
              className="text-black text-xs font-medium truncate cursor-pointer"
              style={{
                margin: 0,
                opacity: isCardHovered || promoStyle ? 0 : 1,
                transition: "opacity 0.2s ease",
                pointerEvents: isCardHovered || promoStyle ? "none" : "auto",
              }}
            >
              {shortTitle} —{" "}
              <span style={{ color: "#6d6d6d" }}>
                {formatPrice(price, i18n.language)} €
              </span>
            </p>

            {/* QuickView OR Add to Cart button — hover pe show (promoStyle mein hamesha visible) */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "12px",
                right: "12px",
                opacity: isCardHovered || promoStyle ? 1 : 0,
                transition: "opacity 0.2s ease",
                pointerEvents: isCardHovered || promoStyle ? "auto" : "none",
              }}
            >
              {isSingleProduct ? (
                /* Single product → Add to Cart button */
                <button
                  className="w-full py-2 text-xs font-semibold tracking-widest uppercase cursor-pointer"
                  style={{
                    backgroundColor: promoStyle ? "black" : "white",
                    color: promoStyle ? "white" : "black",
                    border: "none",

                    transition: "background-color 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = promoStyle
                      ? "black"
                      : "white";
                    e.currentTarget.style.color = promoStyle
                      ? "white"
                      : "black";
                  }}
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
                          res.data.action || "Could not add to cart.",
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
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        animation: "lcSpin 0.75s linear infinite",
                        verticalAlign: "middle",
                      }}
                    />
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
                    className="w-full py-2 text-xs font-semibold tracking-widest uppercase cursor-pointer"
                    style={{
                      backgroundColor:
                        addingToCart || promoStyle ? "black" : "white",
                      color: addingToCart || promoStyle ? "white" : "black",
                      border: "none",
                      visibility: isDropupOpen ? "hidden" : "visible",
                      transition: "background-color 0.2s ease, color 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      if (!addingToCart) {
                        e.currentTarget.style.backgroundColor = promoStyle
                          ? "black"
                          : "white";
                        e.currentTarget.style.color = promoStyle
                          ? "white"
                          : "black";
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(null);
                      setSelectedColor(null);
                      setIsDropupOpen(true);
                    }}
                  >
                    {addingToCart ? (
                      <span
                        style={{
                          display: "inline-block",
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid white",
                          borderTopColor: "transparent",
                          animation: "btnSpin 0.75s linear infinite",
                          verticalAlign: "middle",
                        }}
                      />
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
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 9,
                      maxHeight: isDropupOpen ? "300px" : "0px",
                      overflow: "hidden",
                      transition:
                        "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div style={{ padding: "12px", position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropupOpen(false);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 14,
                          lineHeight: 1,
                          color: "#555",
                        }}
                      >
                        ✕
                      </button>

                      {hasSizes && (
                        <div style={{ marginBottom: hasColors ? 10 : 0 }}>
                          <p
                            style={{
                              margin: "0 0 6px",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#111",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {t("products.size") || "Size"}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {uniqueSizes.map((size) => (
                              <button
                                key={size}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSize(size);
                                  if (!hasColors)
                                    handleDropupSelect(size, selectedColor);
                                }}
                                style={{
                                  padding: "5px 12px",
                                  fontSize: 12,
                                  cursor: "pointer",
                                  border:
                                    selectedSize === size
                                      ? "1.5px solid #111"
                                      : "1.5px solid #ddd",
                                  backgroundColor:
                                    selectedSize === size ? "#111" : "#fff",
                                  color:
                                    selectedSize === size ? "#fff" : "#111",
                                  transition: "all 0.15s",
                                }}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasColors && (
                        <div
                          style={{
                            marginBottom: hasSizes && hasColors ? 10 : 0,
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 6px",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#111",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {t("products.color") || "Color"}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
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
                                  style={{
                                    width: 26,
                                    height: 26,
                                    padding: 0,
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    background: swatchBg,
                                    border:
                                      selectedColor === color
                                        ? "2px solid #111"
                                        : "1.5px solid #ddd",
                                    boxShadow:
                                      selectedColor === color
                                        ? "0 0 0 2px #fff inset"
                                        : "none",
                                    transition: "all 0.15s",
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
                          style={{
                            width: "100%",
                            padding: "8px",
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor:
                              selectedSize && selectedColor ? "#111" : "#ccc",
                            color: "#fff",
                            border: "none",
                            cursor:
                              selectedSize && selectedColor
                                ? "pointer"
                                : "default",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            transition: "background 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {addingToCart ? (
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                border: "2px solid rgba(255,255,255,0.4)",
                                borderTopColor: "#fff",
                                animation: "lcSpin 0.75s linear infinite",
                              }}
                            />
                          ) : (
                            t("products.addToCart")
                          )}
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
      {/* CHANGE 3: Neeche wala title/price/button section — removed (card ke andar move ho gaya) */}
      {/* <div className="flex-shrink-0">
        <h3
          className={`text-gray-800 mb-2 line-clamp-2 ${compact ? "text-xs min-h-[2rem]" : "text-sm min-h-[2.5rem]"}`}
        >
          {displayName}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-bold text-gray-900 ${compact ? "text-base" : "text-xl"}`}
          >
            €{safeProduct.price ?? 0}
          </span>
          <button
            className={`bg-black text-white cursor-pointer font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap ${compact ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"}`}
          >
            {t("products.addToCart")}
          </button>
        </div>
      </div> */}
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

  return (
    <div className="w-full bg-[#f6f6f4]">
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
                : // Default heading (below) already carries html's own
                  // top/bottom rhythm, and html's .popular-products section
                  // has padding-bottom:0 (cards sit flush against whatever
                  // comes next) — so no extra top/bottom padding here at all.
                  "px-0"
        }
      >
        {isFavourite ? null : isWishlist ? (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t("products.wishlistTitle")}
              </h1>
              <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black transition-colors self-start cursor-pointer">
                <IoClose className="w-5 h-5" />
                <span>{t("products.removeAll")}</span>
              </button>
            </div>

            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("favorite");
                  onTabChange?.("favorite");
                }}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                  activeTab === "favorite"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-50"
                }`}
              >
                {t("products.favoriteProducts")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("advice");
                  onTabChange?.("advice");
                }}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                  activeTab === "advice"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-50"
                }`}
              >
                {t("products.favoriteAdvices")}
              </button>
            </div>
          </div>
        ) : isHorizontal ? (
          <div className="flex justify-end mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => scroll("prev")}
                disabled={!canScrollLeft}
                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? "bg-gray-100 cursor-pointer hover:bg-gray-200"
                    : "bg-white border border-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronBack className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={!canScrollRight}
                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? "bg-gray-100 cursor-pointer hover:bg-gray-200"
                    : "bg-white border border-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronForward className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
              </button>
            </div>
          </div>
        ) : useGrid ? null : (
          <div className="w-full bg-[#efefee] border-t border-[#d8d8d4]">
            <div className="w-full px-4 min-[721px]:px-4 lg:px-[clamp(24px,2.4vw,46px)] pt-[68px] min-[721px]:pt-[clamp(72px,8vw,118px)] pb-[34px] min-[721px]:pb-[46px]">
              <div className="grid grid-cols-1 min-[1101px]:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-[26px] min-[721px]:gap-[clamp(34px,4vw,64px)] items-end">
                <div>
                  <div className="flex items-center gap-3 text-black">
                    <span className="w-[34px] h-px bg-current"></span>
                    <span className="text-[10px] tracking-[0.22em] uppercase">
                      {headingEyebrow}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      start();
                      router.push(`/shop?source=${sectionSource}`);
                    }}
                    className="group mt-[18px] text-left text-[50px] min-[721px]:text-[clamp(48px,7vw,108px)] leading-[0.9] tracking-[-0.072em] uppercase font-[100] text-black cursor-pointer"
                  >
                    <span className="relative inline-block">
                      {titleFirstLine}
                      <span className="absolute left-0 bottom-[-5px] h-[3px] w-0 bg-black transition-all duration-500 ease-out group-hover:w-full" />
                    </span>

                    <br />

                    <span className="relative inline-block">
                      {titleLastWord}.
                      <span className="absolute left-0 bottom-[-5px] h-[3px] w-0 bg-black transition-all duration-500 ease-out group-hover:w-full" />
                    </span>
                  </button>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <p className="mb-2 max-w-[600px] text-[#595955] text-[15px] leading-[1.75]">
                    {headingSubtitle}
                  </p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => scroll("prev")}
                      disabled={!canScrollLeft}
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-colors ${
                        canScrollLeft
                          ? "bg-gray-100 text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200"
                          : "bg-white border border-gray-300 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <IoChevronBack className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button
                      onClick={() => scroll("next")}
                      disabled={!canScrollRight}
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-colors ${
                        canScrollRight
                          ? "bg-gray-100 text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200"
                          : "bg-white border border-gray-300 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <IoChevronForward className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Below the whole header row, right-aligned */}
              <div className="flex justify-end mt-4 md:mt-5 -mb-4 md:-mb-6">
                <button
                  type="button"
                  onClick={() => {
                    start();
                    router.push("/shop");
                  }}
                  className="group inline-flex items-center gap-0.5 md:gap-1 cursor-pointer text-[10px] md:text-[12px] tracking-[0.1em] md:tracking-[0.15em] uppercase font-bold text-black hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  <span className="relative">
                    {t("products.seeMore")}
                    <span className="absolute left-0 bottom-[-3px] h-[1px] w-0 bg-black transition-all duration-300 ease-out group-hover:w-full" />
                  </span>

                  <GoArrowUpRight className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                </button>
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
