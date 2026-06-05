"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useTopLoader } from "@/Components/Pages/TopLoader";
import { FiHeart } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar, FaPlus, FaMinus } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { MEDIA_URL } from "@/Components/API/API";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star) return <FaStar key={star} className="text-black w-4 h-4" />;
      else if (rating >= star - 0.5) return <FaStarHalfAlt key={star} className="text-black w-4 h-4" />;
      else return <FaRegStar key={star} className="text-black w-4 h-4" />;
    })}
  </div>
);

const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const buildSlides = (rawProduct) => {
  if (!rawProduct) return [];
  const images = rawProduct.images || [];
  const videoItem = rawProduct.video || null;
  const nonVideoImages = images.filter((img) => img.type !== "video");
  const firstImage = nonVideoImages[0] || null;
  const otherImages = nonVideoImages.slice(1);
  return [
    ...(firstImage
      ? [{ type: "image", url: `${MEDIA_URL}${firstImage.media}`, isFirst: true }]
      : []),
    ...(videoItem
      ? [{ type: "video", url: `${MEDIA_URL}${videoItem.media}` }]
      : []),
    ...otherImages.map((img) => ({
      type: "image",
      url: `${MEDIA_URL}${img.media}`,
      isFirst: false,
    })),
  ];
};

export default function ModalQuickView({ isOpen, onClose, product, fullProductData }) {
  const { t, i18n } = useTranslation("productdetail");
  const language = i18n.language;
  const router = useRouter();
  const { start } = useTopLoader();
  const videoRef = useRef(null);
  const currentSlideRef = useRef(0);
  const loadedSlides = useRef(new Set());
  const firstImageLoaded = useRef(false);

  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [slideLoading, setSlideLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const rawBundleData = fullProductData || product;
  const apiProducts = rawBundleData?.products || [];
  const hasFullData = apiProducts.length > 0 && apiProducts[0]?.images !== undefined;

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      return;
    }
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProductIdx(0);
    setSelectedVolume(null);
    setSelectedColor(null);
    setCurrentSlide(0);
    setImageLoading(true);
    setSlideLoading(false);
    setReadMore(false);
    setQuantity(1);
    loadedSlides.current = new Set();
    firstImageLoaded.current = false;
    currentSlideRef.current = 0;

    const firstP = apiProducts[0];
    if (firstP?.type === "size" || firstP?.type === "size-color") {
      setSelectedVolume(firstP.size_name || null);
    }
    if (firstP?.type === "color" || firstP?.type === "size-color") {
      setSelectedColor(firstP.color_name || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, rawBundleData?.id]);

  const displayName =
    language === "fr"
      ? rawBundleData?.french_name || rawBundleData?.name
      : rawBundleData?.name || "";

  const displayDescription =
    language === "fr"
      ? rawBundleData?.french_description || rawBundleData?.description || ""
      : rawBundleData?.description || "";

  const selectedProduct = apiProducts[selectedProductIdx] || apiProducts[0];
  const displayPrice = selectedProduct?.price || rawBundleData?.price || "0";
  const productType = apiProducts[0]?.type || "no-size-color";

  const uniqueSizes = [...new Set(apiProducts.filter((p) => p.size_name).map((p) => p.size_name))];
  const uniqueColors = [...new Set(apiProducts.filter((p) => p.color_name).map((p) => p.color_name))];

  const hasSizeSelector = (productType === "size" || productType === "size-color") && uniqueSizes.length > 0;
  const hasColorSelector = (productType === "color" || productType === "size-color") && uniqueColors.length > 0;

  const slides = buildSlides(selectedProduct);
  const isLoaded = hasFullData;

  const goToSlide = (idx) => {
    const total = slides.length;
    if (total === 0) return;
    let target = idx;
    if (idx < 0 || idx >= total) {
      target = (idx + total) % total;
      setNoTransition(true);
      setCurrentSlide(target);
      currentSlideRef.current = target;
      requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)));
    } else {
      setNoTransition(false);
      setCurrentSlide(target);
      currentSlideRef.current = target;
    }
    if (!loadedSlides.current.has(target)) setSlideLoading(true);
  };

  useEffect(() => {
    setCurrentSlide(0);
    currentSlideRef.current = 0;
    setImageLoading(true);
    setSlideLoading(false);
    loadedSlides.current = new Set();
    firstImageLoaded.current = false;
  }, [selectedProductIdx]);

  const currentSlideData = slides[currentSlide] || { type: "image", url: "" };
  const isVideo = currentSlideData.type === "video";

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlide, isVideo]);

  const handleVolumeSelect = (sizeName) => {
    setSelectedVolume(sizeName);
    const idx = apiProducts.findIndex((p) => p.size_name === sizeName);
    if (idx !== -1) setSelectedProductIdx(idx);
  };

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    const idx = apiProducts.findIndex((p) => p.color_name === colorName);
    if (idx !== -1) setSelectedProductIdx(idx);
  };

  const handleViewProduct = () => {
    const slug =
      language === "fr"
        ? rawBundleData?.french_seo_keyword
        : rawBundleData?.english_seo_keyword || rawBundleData?.english_seo_keyboard;
    onClose();
    start();
    router.push(`/product/${slug}`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  // Fixed description char limit — same on all screens
  const CHAR_LIMIT = 220;

  const plainText =
    typeof window !== "undefined"
      ? (() => { const d = document.createElement("div"); d.innerHTML = displayDescription; return d.innerText || ""; })()
      : displayDescription.replace(/<[^>]*>/g, "");
  const isLong = plainText.length > CHAR_LIMIT;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes quickViewFadeIn {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes backdropFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes spin89345 {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .qv-slides-track {
            display: flex; width: 100%; height: 100%;
            transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .qv-slides-track-no-transition {
            display: flex; width: 100%; height: 100%; transition: none;
          }
          .qv-slide-item {
            min-width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
          }
          .qv-right-panel::-webkit-scrollbar { width: 4px; }
          .qv-right-panel::-webkit-scrollbar-track { background: transparent; }
          .qv-right-panel::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 4px; }
        `,
        }}
      />

      {/* Backdrop — fixed, full screen, no scroll */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          zIndex: 9998,
          animation: "backdropFadeIn 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          overflowY: "auto",          // backdrop itself scrolls if viewport too small
        }}
      >
        {/* Modal Box — fixed dimensions, never changes shape */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            width: "100%",
            maxWidth: "900px",
            // Fixed height — same on all screens
            height: "min(600px, calc(100vh - 32px))",
            display: "flex",
            flexDirection: "row",
            animation: "quickViewFadeIn 0.3s ease",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "14px", right: "14px", zIndex: 10,
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: "#fff", border: "1px solid #e0e0e0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            <IoClose size={20} color="#1c1c1c" />
          </button>

          {/* LEFT: Image Slider — exactly 50% width, full height */}
          <div
            style={{
              width: "50%",
              flexShrink: 0,
              background: "#f3f3f3",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isLoaded && (imageLoading || slideLoading) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, backgroundColor: "#e1e1e1" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(0,0,0,.1)", borderLeftColor: "transparent", animation: "spin89345 1s linear infinite" }} />
              </div>
            )}

            {isLoaded && slides.length > 0 && (
              <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <div
                  className={noTransition ? "qv-slides-track-no-transition" : "qv-slides-track"}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map((slide, idx) => {
                    const useContain = slide.isFirst;
                    return (
                      <div
                        key={idx}
                        className="qv-slide-item"
                        style={useContain ? { padding: "40px 32px" } : { padding: 0, position: "relative" }}
                      >
                        {slide.type === "video" ? (
                          <video
                            ref={currentSlide === idx ? videoRef : null}
                            key={slide.url}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            muted playsInline
                            onCanPlay={() => {
                              loadedSlides.current.add(idx);
                              if (currentSlideRef.current === idx) setSlideLoading(false);
                            }}
                          >
                            <source src={slide.url} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={slide.url}
                            alt={`Product ${idx + 1}`}
                            onLoad={() => {
                              loadedSlides.current.add(idx);
                              if (!firstImageLoaded.current) { firstImageLoaded.current = true; setImageLoading(false); }
                              if (currentSlideRef.current === idx) setSlideLoading(false);
                            }}
                            onError={() => {
                              loadedSlides.current.add(idx);
                              if (!firstImageLoaded.current) { firstImageLoaded.current = true; setImageLoading(false); }
                              if (currentSlideRef.current === idx) setSlideLoading(false);
                            }}
                            style={
                              useContain
                                ? { objectFit: "contain", height: "100%", width: "auto", maxWidth: "100%", padding: "40px 20px", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }
                                : { objectFit: "cover", position: "absolute", inset: 0, width: "100%", height: "100%" }
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isLoaded && !imageLoading && slides.length > 1 && (
              <>
                <button onClick={() => goToSlide(currentSlide - 1)} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 20, width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
                  <MdChevronLeft size={22} color="#1c1c1c" />
                </button>
                <button onClick={() => goToSlide(currentSlide + 1)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 20, width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
                  <MdChevronRight size={22} color="#1c1c1c" />
                </button>
              </>
            )}

            {isLoaded && !imageLoading && slides.length > 1 && (
              <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "6px", zIndex: 20 }}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    style={{ borderRadius: "9999px", border: "none", cursor: "pointer", padding: 0, transition: "all 0.4s", width: currentSlide === idx ? "28px" : "8px", height: "8px", backgroundColor: currentSlide === idx ? "#1c1c1c" : "rgba(100,100,100,0.4)" }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div
            className="qv-right-panel"
            style={{
              width: "50%",
              flexShrink: 0,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "32px 28px 24px 28px",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
            }}
          >
            {!isLoaded ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <ShimmerLoader className="h-6 w-3/4" />
                <ShimmerLoader className="h-8 w-full" />
                <ShimmerLoader className="h-5 w-1/2" />
                <ShimmerLoader className="h-16 w-full" />
                <ShimmerLoader className="h-10 w-full" />
                <ShimmerLoader className="h-12 w-full" />
              </div>
            ) : (
              <>
                {/* Exclusive Pro label */}
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1C1C1C", letterSpacing: "0.05em", textTransform: "uppercase", background: "#f3f3f3", padding: "4px 10px", borderRadius: "6px" }}>
                    Exclusive Pro
                  </span>
                </div>

                {/* Product Name */}
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1C1C1C", lineHeight: "1.4", marginBottom: "10px", marginTop: 0, paddingRight: "30px" }}>
                  {displayName}
                </h2>

                {/* Stars + Reviews */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <StarRating rating={3.5} />
                  <span style={{ fontSize: "13px", color: "#808080", cursor: "pointer" }} onClick={handleViewProduct}>
                    ({t("reviews")})
                  </span>
                </div>

                {/* Description — fixed char limit, no flex: 1 */}
                {displayDescription && (
                  <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.7", marginBottom: "18px" }}>
                    {!readMore ? (
                      isLong ? (
                        <>
                          {plainText.slice(0, CHAR_LIMIT)}{"... "}
                          <button
                            onClick={() => setReadMore(true)}
                            style={{ cursor: "pointer", color: "#808080", textDecoration: "underline", background: "none", border: "none", fontSize: "13px", padding: 0 }}
                          >
                            Show more
                          </button>
                        </>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: displayDescription }} />
                      )
                    ) : (
                      <>
                        <span dangerouslySetInnerHTML={{ __html: displayDescription }} />{" "}
                        <button
                          onClick={() => setReadMore(false)}
                          style={{ cursor: "pointer", color: "#808080", textDecoration: "underline", background: "none", border: "none", fontSize: "13px", padding: 0 }}
                        >
                          Show less
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Volume Selector */}
                {hasSizeSelector && (
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1C1C1C", marginBottom: "10px", marginTop: 0 }}>{t("productVolume")}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {uniqueSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleVolumeSelect(size)}
                          style={{
                            padding: "7px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                            cursor: "pointer",
                            border: selectedVolume === size ? "1.5px solid #1C1C1C" : "1.5px solid #E8E8E8",
                            backgroundColor: selectedVolume === size ? "#1C1C1C" : "#fff",
                            color: selectedVolume === size ? "#fff" : "#1C1C1C",
                            transition: "all 0.2s", outline: "none", boxShadow: "none",
                            lineHeight: "1.2", display: "inline-flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {hasColorSelector && (
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1C1C1C", marginBottom: "10px", marginTop: 0 }}>{t("color")}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {uniqueColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          style={{
                            padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                            cursor: "pointer",
                            border: selectedColor === color ? "1.5px solid #1C1C1C" : "1.5px solid #A8A8A8",
                            backgroundColor: selectedColor === color ? "#F0F0F0" : "#fff",
                            color: selectedColor === color ? "#1C1C1C" : "#A8A8A8",
                            transition: "all 0.2s",
                            outline: selectedColor === color ? "1px solid #1C1C1C" : "none",
                            outlineOffset: "1px",
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacer — pushes bottom section down */}
                <div style={{ flex: 1 }} />

                {/* Quantity + Add to Cart + Wishlist */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#1C1C1C", whiteSpace: "nowrap", margin: 0 }}>{t("quantity")}</p>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #E8E8E8", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity === 1}
                        style={{ width: "40px", height: "40px", backgroundColor: "#f7f6f7", border: "none", borderRight: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center", cursor: quantity === 1 ? "not-allowed" : "pointer", color: quantity === 1 ? "#aaa" : "#1C1C1C" }}
                      >
                        <FaMinus size={12} />
                      </button>
                      <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#1C1C1C" }}>
                        {String(quantity).padStart(2, "0")}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        style={{ width: "40px", height: "40px", backgroundColor: "#f7f6f7", border: "none", borderLeft: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1C1C1C" }}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>

                    <button
                      style={{ flex: 1, backgroundColor: "#1C1C1C", color: "#fff", border: "none", borderRadius: "8px", height: "40px", fontSize: "13px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.03em", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1C1C1C")}
                    >
                      {t("addToCart")} – €{displayPrice}
                    </button>

                    {/* <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid #E8E8E8", backgroundColor: "#F3F3F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}
                    >
                      <FiHeart size={18} style={{ fill: isWishlisted ? "#1C1C1C" : "none", color: isWishlisted ? "#1C1C1C" : "#666", transition: "all 0.2s" }} />
                    </button> */}
                  </div>
                </div>

                {/* View Product Details — always at bottom */}
                <div style={{ paddingTop: "12px", borderTop: "1px solid #F0F0F0" }}>
                  <button
                    onClick={handleViewProduct}
                    style={{ width: "100%", backgroundColor: "transparent", border: "none", padding: "10px 0", fontSize: "13px", fontWeight: 600, color: "#1C1C1C", textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#1C1C1C")}
                  >
                    View the Product Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}