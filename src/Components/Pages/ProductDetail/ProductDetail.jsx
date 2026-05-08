"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiHeart } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import Navbar from "@/Components/Pages/Navbar";
import { GoArrowDownRight, GoArrowUpRight } from "react-icons/go";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import AboutProduct from "./AboutProduct";
import ProductExpertAdvice from "./ProductExpertAdvice";
import StickyAddToCart from "./StickyAddToCart";
import Footer from "../Footer";
import { LandingCards } from "@/Components/Pages/Landing/LandingCards";
import ProductVideo from "./ProductVideo";
import ProductModalAddReview from "./ProductModalAddReview";
import ProductReviews from "./ProductReviews";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { BASE_URL, MEDIA_URL } from "@/Components/API/API";
import toast, { Toaster } from "react-hot-toast";
import { useTopLoader } from "@/Components/Pages/TopLoader";
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star) return <FaStar key={star} className="text-black w-4 h-4" />;
      else if (rating >= star - 0.5) return <FaStarHalfAlt key={star} className="text-black w-4 h-4" />;
      else return <FaRegStar key={star} className="text-black w-4 h-4" />;
    })}
  </div>
);

const formatProductForCard = (product) => {
  const firstProduct = product.products?.[0];
  const allImages = firstProduct?.images?.map(img => `${MEDIA_URL}${img.media}`) || [""];
  return {
    id: product.id,
    name: product.name,
    french_name: product.french_name,
    price: firstProduct?.price || product.price,
    discount: "",
    image: allImages[0],
    images: allImages,
    liked: false,
  };
};

const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export default function ProductDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, i18n } = useTranslation("productdetail");
  const language = i18n.language;
  const productId = searchParams.get("id");
  const { start } = useTopLoader();
 

  const [apiProduct, setApiProduct] = useState(null);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [currentShipping, setCurrentShipping] = useState(0);
  const [isTransparent, setIsTransparent] = useState(true);
  const [showSticky, setShowSticky] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef(null);
  const stickyCartRef = useRef(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isLoadMoreOpen, setIsLoadMoreOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const firstImageLoaded = useRef(false);
  const cartBtnRef = useRef(null);
  const videoRef = useRef(null);
  // ─── NEW: ref for the product title h1 ──────────────────────────────────────
  const titleRef = useRef(null);

  // ─── Fetch product detail ───────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    fetch(`${BASE_URL}/product/detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: "Abc", id: productId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setApiProduct(json.data);
          setSelectedProductIdx(0);
          const firstProduct = json.data.products?.[0];
          if (firstProduct?.type === "size" || firstProduct?.type === "size-color") {
            setSelectedVolume(firstProduct.size_name);
          }
          if (firstProduct?.type === "color" || firstProduct?.type === "size-color") {
            setSelectedColor(firstProduct.color_name);
          }
        } else {
          toast.error(json.action_message || json.action || "Something went wrong.");
        }
      })
      .catch((err) => console.error("API Error:", err));
  }, [productId]);

  // ─── Derived values ─────────────────────────────────────────────────────────
  const displayName =
    language === "fr"
      ? apiProduct?.french_name || apiProduct?.name
      : apiProduct?.name || "Product";
  const apiProducts = apiProduct?.products || [];
  const selectedProduct = apiProducts[selectedProductIdx] || apiProducts[0];
  const displayDescription =
    language === "fr"
      ? apiProduct?.french_description || apiProduct?.description
      : apiProduct?.description || "";
  const productType = apiProducts[0]?.type || "no-size-color";
  const togetherProducts = apiProduct?.together || [];
  const displayPrice = selectedProduct?.price || apiProduct?.price || "0";

  const isTransparentProduct = selectedProduct?.is_transparent === 1;

  const rawImages = selectedProduct?.images || [];
  const firstImage = rawImages.find((img) => img.type !== "video");
  const videoItem = rawImages.find((img) => img.type === "video");
  const otherImages = rawImages.filter(
    (img) => img !== firstImage && img.type !== "video"
  );

  const slides = [
    ...(firstImage ? [{ type: "image", url: `${MEDIA_URL}${firstImage.media}`, isFirst: true }] : []),
    ...(videoItem ? [{ type: "video", url: `${MEDIA_URL}${videoItem.media}` }] : []),
    ...otherImages.map((img) => ({ type: "image", url: `${MEDIA_URL}${img.media}`, isFirst: false })),
  ];

  const infiniteSlides = slides;

  const currentSlideData = slides[currentSlide] || { type: "image", url: "" };
  const isVideo = currentSlideData.type === "video";

  // ─── Reset slide when product changes ───────────────────────────────────────
  useEffect(() => {
    setCurrentSlide(0);
    setImageLoading(true);
    firstImageLoaded.current = false;
  }, [selectedProductIdx]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
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

  const uniqueSizes = [
    ...new Set(apiProducts.filter((p) => p.size_name).map((p) => p.size_name)),
  ];
  const uniqueColors = [
    ...new Set(apiProducts.filter((p) => p.color_name).map((p) => p.color_name)),
  ];

  // ─── Scroll handler — sticky cart visibility ────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (cartBtnRef.current) {
        const rect = cartBtnRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0 || rect.top > window.innerHeight);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── IntersectionObserver — footer visibility ────────────────────────────────
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [apiProduct]);

  // ─── NEW: IntersectionObserver — watch title h1 against navbar ──────────────
  // When the title h1 enters the top 80px zone (navbar area), make navbar solid.
  // When title scrolls back down into view, make navbar transparent again.
  useEffect(() => {
    if (!titleRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // jab title ka top edge navbar ke neeche ho → transparent
        // jab title scroll karke navbar ko touch kare → solid white
        setIsTransparent(entry.boundingClientRect.top > 80);
      },
      {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: [0, 1],
      }
    );

    observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, [apiProduct]); // re-run after product loads so titleRef.current is set

  // ─── When any modal opens → force navbar non-transparent ────────────────────
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.style.position === "fixed") {
        setIsTransparent(false);
      }
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  // ─── Video auto-play when navigated to video slide ────────────────────────
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  }, [currentSlide, isVideo]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  };

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
  };

  // ─── Shipping slider ─────────────────────────────────────────────────────────
  const shippingSlides = [
    { title: t("shippingFromFrance"), note: t("shippingNote1") },
    { title: t("freeShipping"), note: t("shippingNote2") },
    { title: t("complimentaryGift"), note: t("shippingNote3") },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShipping((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleProductCardClick = (productId) => {
    start();
    router.push(`/product-detail?id=${productId}`);
  };

  const formattedTogetherProducts = togetherProducts
    .slice(0, 3)
    .map(formatProductForCard);
  const isLoaded = apiProduct !== null;

  return (
    <div className="w-full bg-white">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes shimmerMove {
            0%   { background-position: -600px 0; }
            100% { background-position:  600px 0; }
          }
          .shimmer-bg {
            background: linear-gradient(90deg, #d4d4d4 25%, #e8e8e8 50%, #d4d4d4 75%);
            background-size: 600px 100%;
            animation: shimmerMove 1.4s infinite linear;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .slides-track {
            display: flex;
            width: 100%;
            height: 100%;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .slides-track-no-transition {
            display: flex;
            width: 100%;
            height: 100%;
            transition: none;
          }
          .slide-item {
            min-width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 32px;
          }
          @keyframes firstFade {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .first-fade-in { animation: firstFade 0.4s ease forwards; }
        `,
        }}
      />

      <Navbar
        transparent={isLoadMoreOpen || isReviewModalOpen ? false : isTransparent}
      />

      <div className="flex flex-col lg:flex-row w-full min-h-screen">

        {/* ── LEFT: Image Section ── */}
        <div
          className="group w-full lg:w-1/2 relative flex items-center justify-center min-h-[420px] lg:sticky lg:top-0 lg:h-screen overflow-hidden transition-colors duration-700"
          style={{ background: "#E1E1E1" }}
        >
          {/* State 1: Shimmer */}
          {!isLoaded && (
            <div className="shimmer-bg absolute inset-0 w-full h-full" />
          )}

          {/* State 2: Black spinner on grey */}
          {isLoaded && imageLoading && !isVideo && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "4px solid rgba(0,0,0,0.12)",
                  borderTopColor: "#111111",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          )}

          {/* State 3: Sliding track (images + video in order) */}
          {isLoaded && infiniteSlides.length > 0 && (
            <div
              className={`absolute inset-0 overflow-hidden ${imageLoading ? "opacity-0" : "first-fade-in"
                }`}
            >
              <div
                className="slides-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {infiniteSlides.map((slide, idx) => {
                  const useContain = slide.isFirst && isTransparentProduct;
                  return (
                    <div
                      key={idx}
                      className="slide-item"
                      style={useContain ? {} : { padding: 0, position: "relative" }}
                    >
                      {slide.type === "video" ? (
                        <video
                          ref={currentSlide === idx ? videoRef : null}
                          key={slide.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          onEnded={handleVideoEnded}
                        >
                          <source src={slide.url} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={slide.url}
                          alt={`Product ${idx + 1}`}
                          onLoad={() => {
                            if (!firstImageLoaded.current) {
                              firstImageLoaded.current = true;
                              setImageLoading(false);
                            }
                          }}
                          onError={() => {
                            if (!firstImageLoaded.current) {
                              firstImageLoaded.current = true;
                              setImageLoading(false);
                            }
                          }}
                          className={
                            useContain
                              ? "object-contain p-20 h-full w-auto max-w-full drop-shadow-xl"
                              : "object-cover absolute inset-0 w-full h-full"
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Left Arrow */}
          {isLoaded && !imageLoading && (
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer transition-opacity duration-300 ${currentSlide === 0
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
                }`}
            >
              <MdChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {isLoaded && !imageLoading && (
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer transition-opacity duration-300 ${currentSlide >= slides.length - 1
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
                }`}
            >
              <MdChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Dot Indicators */}
          {isLoaded && !imageLoading && slides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`rounded-full transition-all duration-700 ${currentSlide === idx
                    ? "w-8 h-2 bg-gray-800"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 lg:px-14 pt-6 pb-6 lg:pt-27 lg:pb-12 bg-white">
          {!isLoaded ? (
            <>
              <ShimmerLoader className="h-8 w-3/4 mb-4" />
              <div className="flex items-center gap-3 mb-5">
                <ShimmerLoader className="h-5 w-24" />
                <ShimmerLoader className="h-5 w-32" />
              </div>
              <ShimmerLoader className="h-20 w-full mb-5" />
              <ShimmerLoader className="h-10 w-32 mb-7" />
              <ShimmerLoader className="h-12 w-full mb-8" />
              <ShimmerLoader className="h-32 w-full" />
            </>
          ) : (
            <>
              {/*
                ─── CHANGED: added ref={titleRef} so IntersectionObserver
                    can watch when this title reaches the navbar ───────────────
              */}
              <h1
                ref={titleRef}
                className="text-[22px] lg:text-[26px] font-bold text-[#1C1C1C] leading-snug mb-4"
              >
                {displayName}
              </h1>

              <div className="flex items-center gap-3 mb-5">
                <StarRating rating={3.5} />
                <span className="text-sm text-black">({t("reviews")})</span>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-sm cursor-pointer text-[#808080] underline hover:text-gray-600 transition-colors ml-1"
                >
                  {t("addReview")}
                </button>
              </div>

              {displayDescription && (
                <>
                  <div
                    style={!readMore ? { display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}}
                    className="text-[16px] text-black leading-relaxed mb-5"
                    dangerouslySetInnerHTML={{ __html: displayDescription }}
                  />
                  <button
                    onClick={() => setReadMore(!readMore)}
                    className={`flex items-center gap-1 cursor-pointer text-sm font-medium border rounded-lg px-4 py-2 w-fit mb-7 ${readMore
                      ? "bg-white text-black border-black"
                      : "bg-black text-white border-gray-300"
                      }`}
                  >
                    {readMore ? t("less") : t("readMore")}{" "}
                    {readMore ? (
                      <GoArrowUpRight className="w-4 h-4" />
                    ) : (
                      <GoArrowDownRight className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}

              {/* Volume Selector */}
              {(productType === "size" || productType === "size-color") &&
                uniqueSizes.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-[#1C1C1C] mb-3">
                      {t("productVolume")}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {uniqueSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleVolumeSelect(size)}
                          className={`px-5 py-2 cursor-pointer rounded-lg text-sm font-medium border transition-all duration-200 ${selectedVolume === size
                            ? "bg-[#F0F0F0] border-gray-800 text-black shadow-sm ring-1 ring-black"
                            : "bg-white border-[#A8A8A8] text-[#A8A8A8] hover:border-gray-400"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Color Selector */}
              {(productType === "color" || productType === "size-color") &&
                uniqueColors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-[#1C1C1C] mb-3">
                      {t("color")}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {uniqueColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          title={color}
                          className={`px-5 py-2 cursor-pointer rounded-lg text-sm font-medium border transition-all duration-200 ${selectedColor === color
                            ? "bg-[#F0F0F0] border-gray-800 text-black shadow-sm ring-1 ring-black"
                            : "bg-white border-[#A8A8A8] text-[#A8A8A8] hover:border-gray-400"
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Add to Cart */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  ref={cartBtnRef}
                  id="add-to-cart-btn"
                  className="flex-1 bg-black text-white cursor-pointer text-sm font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t("addToCart")} – €{displayPrice}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-12 h-12 rounded-lg cursor-pointer border flex items-center justify-center transition-all duration-200 ${isWishlisted
                    ? "border-[#E8E8E8] bg-[#F3F3F3] text-black"
                    : "border-[#E8E8E8] bg-[#F3F3F3] text-gray-600 hover:border-gray-400"
                    }`}
                >
                  <FiHeart
                    className={`w-5 h-5 ${isWishlisted ? "fill-black text-black" : ""
                      }`}
                  />
                </button>
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1C1C1C]">
                      {shippingSlides[currentShipping].title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {shippingSlides[currentShipping].note}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {shippingSlides.map((_, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full inline-block transition-all duration-700 ${idx === currentShipping
                          ? "w-6 h-2 bg-gray-800"
                          : "w-2 h-2 bg-white border border-black"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Quote Section ── */}
      {isLoaded && (
        <div className="hidden lg:flex w-full py-16 items-center justify-center gap-3">
          <RiDoubleQuotesL className="text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
          <p className="text-lg font-semibold text-[#1C1C1C]">
            <span className="text-[#1A171B] font-normal">{t("madeInFrance")}</span>{" "}
            - {t("ingredientsInfo")}
          </p>
          <RiDoubleQuotesR className="text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
        </div>
      )}

      <AboutProduct apiProduct={apiProduct} />

      {isLoaded && showSticky && !isFooterVisible && (
        <StickyAddToCart
          price={displayPrice}
          productName={displayName}
          selectedVolume={selectedVolume}
          onVolumeChange={handleVolumeSelect}
          volumes={uniqueSizes}
        />
      )}

      <ProductExpertAdvice apiProduct={apiProduct} />

      {/* ── Together Products ── */}
      {isLoaded && formattedTogetherProducts.length > 0 && (
        <div className="py-4 lg:py-12 px-6 lg:px-14">
          <div className="w-full py-0 lg:py-12 flex items-center justify-center gap-0 lg:gap-3 mb-6 lg:mb-0">
            <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
            <p className="text-lg lg:text-xl font-semibold text-[#1C1C1C]">
              {t("completeGroomingRoutine")}
            </p>
            <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {formattedTogetherProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[350px] cursor-pointer"
                onClick={() => handleProductCardClick(prod.id)}
              >
                <LandingCards product={prod} showNav={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Video Section ── */}
      <div className="py-4 lg:py-12 px-6 lg:px-14">
        <div className="w-full py-0 lg:py-10 flex items-center justify-center gap-0 lg:gap-3 mb-4 lg:mb-0">
          <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
          <p className="text-lg font-semibold text-[#1C1C1C]">
            {t("watchBenefitsLive")}
          </p>
          <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
        </div>
        <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-lg">
          <ProductVideo
            videoLink={apiProduct?.video_link}
            frenchVideoLink={apiProduct?.french_video_link}
            isLoading={!isLoaded}
          />
        </div>
      </div>

      {/* ── More Products ── */}
      {isLoaded && formattedTogetherProducts.length > 0 && (
        <div className="py-4 lg:py-12 px-6 lg:px-14">
          <div className="w-full py-0 lg:py-12 flex items-center justify-center gap-0 lg:gap-3 mb-6 lg:mb-0">
            <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
            <p className="text-lg lg:text-xl font-semibold text-[#1C1C1C]">
              {t("moreProductsExplore")}
            </p>
            <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {formattedTogetherProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[350px] cursor-pointer"
                onClick={() => handleProductCardClick(prod.id)}
              >
                <LandingCards product={prod} showNav={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductReviews isLoading={!isLoaded} onLoadMoreOpen={setIsLoadMoreOpen} apiProduct={apiProduct} />

      <ProductModalAddReview
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      <div ref={footerRef}>
        <Footer />
      </div>

      {isLoaded && showSticky && isFooterVisible && (
        <div ref={stickyCartRef} className="w-full bg-white border-t border-[#E0E0E0]">
          <StickyAddToCart
            price={displayPrice}
            productName={displayName}
            selectedVolume={selectedVolume}
            onVolumeChange={handleVolumeSelect}
            volumes={uniqueSizes}
            inline
          />
        </div>
      )}
    </div>
  );
}