"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiHeart } from "react-icons/fi";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import Navbar from "@/Components/Pages/Navbar";
import { GoArrowDownRight, GoArrowUpRight } from "react-icons/go";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import AboutProduct from "./AboutProduct";
import ProductExpertAdvice from "./ProductExpertAdvice";
import StickyAddToCart from "./StickyAddToCart";
import Footer from "../Footer";
import { LandingCards } from "@/Components/Pages/Landing/LandingCards";
import ProductVideo from "./ProductVideo";
import ProductReviews from "./ProductReviews";
import ProductLoadMore from "./ProductLoadMore";
import ProductModalAddReview from "./ProductModalAddReview";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { BASE_URL, MEDIA_URL } from "@/Components/API/API";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { getDeviceId } from "../../../utils/deviceId";
import { useTopLoader } from "@/Components/Pages/TopLoader";
import ModalAddToCart from "../Modal/ModalAddToCart";
import { saveCartData } from "../../../utils/cartStorage";


const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star)
        return <FaStar key={star} className="text-black w-4 h-4" />;
      else if (rating >= star - 0.5)
        return <FaStarHalfAlt key={star} className="text-black w-4 h-4" />;
      else return <FaRegStar key={star} className="text-black w-4 h-4" />;
    })}
  </div>
);

const formatProductForCard = (product) => {
  const firstProduct = product.products?.[0];
  // images array — filter out video type entries
  const allImages = firstProduct?.images
    ?.filter((img) => img.type !== "video")
    .map((img) => `${MEDIA_URL}${img.media}`) || [""];
  const videoUrl = firstProduct?.video?.media
    ? `${MEDIA_URL}${firstProduct.video.media}`
    : null;
  // together1/together2 items use english_seo_keyboard (typo in API)
  const englishSlug =
    product.english_seo_keyword ||
    product.english_seo_keyboard ||
    "";
  const frenchSlug =
    product.french_seo_keyword ||
    product.french_seo_keyboard ||
    "";
  return {
    id: product.id,
    name: product.name,
    french_name: product.french_name || product.name,
    english_seo_keyword: englishSlug,
    french_seo_keyword: frenchSlug,
    price: firstProduct?.price || product.price || "0",
    discount: firstProduct?.off || "",
    image: allImages[0] || "",
    images: allImages.length > 0 ? allImages : [""],
    videoUrl,
    liked: product.favorites_exists || false,
    productsCount: product.products?.length || 1,
    products: product.products || [],
    description: product.description || "",
    french_description: product.french_description || "",
    product_label: product.product_label || "",
    french_product_label: product.french_product_label || "",
    _raw: product,
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
  const params = useParams();
  const productId = searchParams.get("id") || params?.slug;
  const { start } = useTopLoader();
  const descriptionRef = useRef(null);

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
  const firstSectionRef = useRef(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [slideLoading, setSlideLoading] = useState(false);
  const loadedSlides = useRef(new Set());
  const currentSlideRef = useRef(0);
  const [isLoadMoreOpen, setIsLoadMoreOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFetchingProduct, setIsFetchingProduct] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBtnLoading, setCartBtnLoading] = useState(false);

  const handleOpenCart = async () => {
    if (cartBtnLoading) return;
    setCartBtnLoading(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const authPayload = loginData?.data?.token
        ? { token: loginData.data.token }
        : { device_id: getDeviceId() };
      const res = await axios.post(`${BASE_URL}/user/cart/create`, {
        ...authPayload, product_id: selectedProduct?.id, quantity,
      });
      if (res.data.status === false) {
        toast.error(res.data.action || "Could not add to cart.");
      } else {
        // Create response mein hi data hai — storage mein save karo, phir modal open
        saveCartData({ cartItem: [res.data.data.cartItem], cart_count: res.data.data.cart_count });
        setIsCartOpen(true);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setCartBtnLoading(false);
    }
  };

  const firstImageLoaded = useRef(false);
  const cartBtnRef = useRef(null);
  const videoRef = useRef(null);
  const titleRef = useRef(null);

  // ─── Fetch product detail ───────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;

    setIsFetchingProduct(true);
    setApiProduct(null);
    setSelectedProductIdx(0);
    setSelectedVolume(null);
    setSelectedColor(null);
    setCurrentSlide(0);
    setImageLoading(true);
    setSlideLoading(false);
    setReadMore(false);
    setCurrentShipping(0);
    setShowSticky(false);
    setIsFooterVisible(false);
    loadedSlides.current = new Set();
    firstImageLoaded.current = false;
    currentSlideRef.current = 0;

    fetch(`${BASE_URL}/product/detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: "Abc", seo_keyword: productId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setApiProduct(json.data);
          setIsFetchingProduct(false);
          setSelectedProductIdx(0);
          const firstProduct = json.data.products?.[0];
          if (
            firstProduct?.type === "size" ||
            firstProduct?.type === "size-color"
          ) {
            setSelectedVolume(firstProduct.size_name);
          }
          if (
            firstProduct?.type === "color" ||
            firstProduct?.type === "size-color"
          ) {
            setSelectedColor(firstProduct.color_name);
          }
        } else {
          setIsFetchingProduct(false);
          toast.error(
            json.action_message || json.action || "Something went wrong.",
          );
        }
      })
      .catch((err) => {
        setIsFetchingProduct(false);
        console.error("API Error:", err);
      });
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

  const together1Products = apiProduct?.together1 || [];
  const together2Products = apiProduct?.together2 || [];

  const displayPrice = selectedProduct?.price || apiProduct?.price || "0";

  const isTransparentProduct = selectedProduct?.is_transparent === 1;

  const rawImages = selectedProduct?.images || [];
  const firstImage = rawImages.find((img) => img.type !== "video");
  const otherImages = rawImages.filter((img) => img !== firstImage);
  const videoItem = selectedProduct?.video || null;

  const slides = [
    ...(firstImage
      ? [
          {
            type: "image",
            url: `${MEDIA_URL}${firstImage.media}`,
            isFirst: true,
          },
        ]
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

  const infiniteSlides = slides;

  const currentSlideData = slides[currentSlide] || { type: "image", url: "" };
  const isVideo = currentSlideData.type === "video";

  // ─── Reset slide when product changes ───────────────────────────────────────
  useEffect(() => {
    setNoTransition(true);
    setCurrentSlide(0);
    currentSlideRef.current = 0;
    setImageLoading(true);
    setSlideLoading(false);
    loadedSlides.current = new Set();
    firstImageLoaded.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setNoTransition(false));
    });
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
    ...new Set(
      apiProducts.filter((p) => p.color_name).map((p) => p.color_name),
    ),
  ];

  // ─── Scroll handler — sticky cart visibility ────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!cartBtnRef.current) return;

      const rect = cartBtnRef.current.getBoundingClientRect();
      const isButtonOutOfView =
        rect.bottom < 0 || rect.top > window.innerHeight;

      setShowSticky(isButtonOutOfView && window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── IntersectionObserver — footer visibility ────────────────────────────────
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [apiProduct]);

  // ─── Scroll handler — navbar transparency ──────────────────────────────────
  useEffect(() => {
    const check = () => {
      if (!titleRef.current) {
        setIsTransparent(window.scrollY < 10);
        return;
      }
      const rect = titleRef.current.getBoundingClientRect();
      setIsTransparent(rect.top > 80);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  });

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
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlide, isVideo]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const [noTransition, setNoTransition] = useState(false);

  const goToSlide = (idx) => {
    const total = slides.length;
    if (total === 0) return;
    let target = idx;

    if (idx < 0 || idx >= total) {
      target = (idx + total) % total;
      setNoTransition(true);
      setCurrentSlide(target);
      currentSlideRef.current = target;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNoTransition(false));
      });
    } else {
      setNoTransition(false);
      setCurrentSlide(target);
      currentSlideRef.current = target;
    }

    if (!loadedSlides.current.has(target)) setSlideLoading(true);
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

  const handleProductCardClick = (prod) => {
    start();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const slug = i18n.language === 'fr' ? prod.french_seo_keyword : prod.english_seo_keyword;
    router.push(`/product/${slug || prod.id}`);
  };

  const formattedTogether1 = together1Products
    .slice(0, 3)
    .map(formatProductForCard);
  const formattedTogether2 = together2Products
    .slice(0, 3)
    .map(formatProductForCard);

  const isLoaded = !isFetchingProduct && apiProduct !== null;

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
          @keyframes spin89345 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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

      <Navbar transparent={isTransparent} />

      <div
        ref={firstSectionRef}
        className="flex flex-col lg:flex-row w-full min-h-screen"
      >
        {/* ── LEFT: Image Section ── */}
        <div
          className="group w-full lg:w-1/2 relative flex items-center justify-center min-h-[420px] lg:sticky lg:top-0 lg:h-screen overflow-hidden transition-colors duration-700"
          style={{ background: "#f3f3f3" }}
        >
          {!isLoaded && (
            <div className="shimmer-bg absolute inset-0 w-full h-full" />
          )}

          {isLoaded && (imageLoading || slideLoading) && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#E1E1E1]">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "4px solid rgba(0, 0, 0, .1)",
                  borderLeftColor: "transparent",
                  animation: "spin89345 1s linear infinite",
                }}
              />
            </div>
          )}

          {isLoaded && infiniteSlides.length > 0 && (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={
                  noTransition ? "slides-track-no-transition" : "slides-track"
                }
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {infiniteSlides.map((slide, idx) => {
                  const useContain =
                    (slide.isFirst && isTransparentProduct) ||
                    idx === infiniteSlides.length - 1;
                  return (
                    <div
                      key={idx}
                      className="slide-item"
                      style={
                        useContain ? {} : { padding: 0, position: "relative" }
                      }
                    >
                      // Replace karo:
{slide.type === "video" ? (
  <div className="relative w-full h-full">
    <video
      ref={currentSlide === idx ? videoRef : null}
      key={slide.url}
      className="w-full h-full object-cover"
      muted
      playsInline
      onEnded={handleVideoEnded}
      onCanPlay={() => {
        loadedSlides.current.add(idx);
        if (currentSlideRef.current === idx)
          setSlideLoading(false);
      }}
    >
      <source src={slide.url} type="video/mp4" />
    </video>
    {/* Video loading spinner — jab tak canPlay nahi aata */}
    {currentSlide === idx && slideLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-[#f3f3f3] z-10">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "4px solid rgba(0,0,0,0.1)",
            borderLeftColor: "transparent",
            animation: "spin89345 1s linear infinite",
          }}
        />
      </div>
    )}
  </div>
                      ) : (
                        <img
                          src={slide.url}
                          alt={`Product ${idx + 1}`}
                          onLoad={() => {
                            loadedSlides.current.add(idx);
                            if (!firstImageLoaded.current) {
                              firstImageLoaded.current = true;
                              setImageLoading(false);
                            }
                            if (currentSlideRef.current === idx)
                              setSlideLoading(false);
                          }}
                          onError={() => {
                            loadedSlides.current.add(idx);
                            if (!firstImageLoaded.current) {
                              firstImageLoaded.current = true;
                              setImageLoading(false);
                            }
                            if (currentSlideRef.current === idx)
                              setSlideLoading(false);
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

          {isLoaded && !imageLoading && slides.length > 1 && (
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer"
            >
              <MdChevronLeft className="w-6 h-6" />
            </button>
          )}

          {isLoaded && !imageLoading && slides.length > 1 && (
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer"
            >
              <MdChevronRight className="w-6 h-6" />
            </button>
          )}

          {isLoaded && !imageLoading && slides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`rounded-full transition-all duration-700 ${
                    currentSlide === idx
                      ? "w-8 h-2 bg-gray-800"
                      : "w-2 h-2 bg-gray-400 hover:bg-gray-400"
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
              <ShimmerLoader className="h-8 w-19/20 mb-4" />
              <ShimmerLoader className="h-8 w-19/20 mb-4" />
              <ShimmerLoader className="h-8 w-19/20 mb-4" />
              <div className="flex items-center gap-3 mb-5">
                <ShimmerLoader className="h-5 w-24" />
                <ShimmerLoader className="h-5 w-32" />
                <ShimmerLoader className="h-5 w-32" />
              </div>
              <ShimmerLoader className="h-8 w-full mb-5" />
              <ShimmerLoader className="h-8 w-full mb-5" />
              <ShimmerLoader className="h-8 w-full mb-5" />
              <ShimmerLoader className="h-8 w-full mb-5" />
              <ShimmerLoader className="h-8 w-22 mb-4" />
              <div style={{ display: "flex", gap: "20px" }}>
                <ShimmerLoader className="h-8 w-12 mb-3" />
                <ShimmerLoader className="h-8 w-12 mb-7" />
                <ShimmerLoader className="h-8 w-12 mb-7" />
              </div>
              <ShimmerLoader className="h-8 w-22 mb-4" />
              <div style={{ display: "flex", gap: "20px" }}>
                <ShimmerLoader className="h-8 w-8 mb-3" />
                <ShimmerLoader className="h-8 w-8 mb-7" />
                <ShimmerLoader className="h-8 w-8 mb-7" />
              </div>
             
              <div style={{ display: "flex", gap: "20px" }}>
                 <ShimmerLoader className="h-12 w-42 mb-7" />
                <ShimmerLoader className="h-12 w-19/20 mb-7" />
                <ShimmerLoader className="h-12 w-12 mb-7" />
              </div>
              <ShimmerLoader className="h-5 w-full" />
            </>
          ) : (
            <>
              <h1
                ref={titleRef}
                className="text-[22px] lg:text-[26px] font-semibold text-[#1C1C1C] leading-snug mb-4"
                style={{ lineHeight: "1.5" }}
              >
                {displayName}
              </h1>

              <div className="flex items-center gap-1 mb-5">
                <StarRating rating={3.5} />
                <button
                  onClick={() => setIsLoadMoreOpen(true)}
                  className="text-sm text-black cursor-pointer hover:underline"
                >
                  ({t("reviews")})
                </button>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-sm cursor-pointer text-[#808080] underline hover:text-gray-600 transition-colors ml-1"
                >
                  {t("addReview")}
                </button>
              </div>

              {displayDescription &&
                (() => {
                  const plainText =
                    typeof window !== "undefined"
                      ? (() => {
                          const d = document.createElement("div");
                          d.innerHTML = displayDescription;
                          return d.innerText || "";
                        })()
                      : displayDescription.replace(/<[^>]*>/g, "");

                  const CHAR_LIMIT = 460;
                  const isLong = plainText.length > CHAR_LIMIT;
                  const truncated = plainText.slice(0, CHAR_LIMIT);

                  return (
                    <div
                      ref={descriptionRef}
                      className="mb-5 text-[14px] text-black leading-relaxed"
                    >
                      {!readMore ? (
                        <span>
                          {isLong ? (
                            <>
                              {truncated}
                              {"... "}
                              <button
                                onClick={() => setReadMore(true)}
                                className="cursor-pointer text-[#808080] underline hover:text-gray-600 transition-colors text-[14px]"
                              >
                                {t("readMore")}
                              </button>
                            </>
                          ) : (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: displayDescription,
                              }}
                            />
                          )}
                        </span>
                      ) : (
                        <span>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: displayDescription,
                            }}
                          />{" "}
                          <button
                            onClick={() => {
                              setReadMore(false);
                              setTimeout(() => {
                                if (descriptionRef.current) {
                                  const top =
                                    descriptionRef.current.getBoundingClientRect()
                                      .top +
                                    window.scrollY -
                                    500;
                                  window.scrollTo({ top, behavior: "smooth" });
                                }
                              }, 50);
                            }}
                            className="cursor-pointer text-[#808080] underline hover:text-gray-600 transition-colors text-[14px]"
                          >
                            {t("less")}
                          </button>
                        </span>
                      )}
                    </div>
                  );
                })()}

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
                          className={`px-5 py-2 cursor-pointer rounded-xl text-sm font-medium border ${
                            selectedVolume === size
                              ? "bg-black border-gray-800 text-white ring-1 ring-black"
                              : "bg-white text-[#1C1C1C] border-[#E8E8E8] hover:bg-gray-50"
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
                          className={`px-5 py-2 cursor-pointer rounded-lg text-sm font-medium border transition-all duration-200 ${
                            selectedColor === color
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

              {/* Quantity, Add to Cart & Wishlist in one line */}
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <p className="text-md font-semibold text-[#1C1C1C] whitespace-nowrap">
                    {t("quantity")}
                  </p>
                  <div className="flex items-center gap-2 border border-[#E8E8E8] rounded-md">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity === 1}
                      className={`w-10 h-10 rounded-md border border-[#E8E8E8] bg-[#f7f6f7] flex items-center justify-center transition-all duration-200 text-lg font-medium ${
                        quantity === 1
                          ? "cursor-not-allowed text-[#aaa]"
                          : "cursor-pointer hover:bg-[#e6e6e6] text-[#1C1C1C]"
                      }`}
                    >
                      <FaMinus size={13} />
                    </button>
                    <span className="text-sm font-semibold text-[#1C1C1C] w-6 text-center">
                      {String(quantity).padStart(2)}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-md bg-[#f7f6f7] flex items-center justify-center cursor-pointer hover:bg-[#e6e6e6] transition-all duration-200 text-black text-lg font-medium"
                    >
                      <FaPlus size={13} />
                    </button>
                  </div>
                  <button
                    ref={cartBtnRef}
                    id="add-to-cart-btn"
                    onClick={handleOpenCart}
                    disabled={cartBtnLoading}
                    className="flex-1 bg-black text-white cursor-pointer text-sm font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    {cartBtnLoading ? (
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin89345 0.75s linear infinite" }} />
                    ) : (
                      <>{t("addToCart")} – {displayPrice} €</>
                    )}
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-12 h-12 rounded-lg cursor-pointer border flex items-center justify-center transition-all duration-200 ${
                      isWishlisted
                        ? "border-[#E8E8E8] bg-[#F3F3F3] text-black"
                        : "border-[#E8E8E8] bg-[#F3F3F3] text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <FiHeart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-black text-black" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1C1C1C]">
                      {shippingSlides[currentShipping].title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {shippingSlides[currentShipping].note}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {shippingSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentShipping(idx)}
                        className={`rounded-full inline-block cursor-pointer transition-all duration-700 ${
                          idx === currentShipping
                            ? "w-4 h-1.5 bg-gray-800"
                            : "w-1.5 h-1.5 bg-white border border-black hover:bg-gray-400"
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
            <span className="text-[#1A171B] font-normal">
              {t("madeInFrance")}
            </span>{" "}
            - {t("ingredientsInfo")}
          </p>
          <RiDoubleQuotesR className="text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
        </div>
      )}

      <div>
        <AboutProduct apiProduct={apiProduct} />
      </div>

      <ProductExpertAdvice apiProduct={apiProduct} />

      {/* ── Together1 Products — Complete Grooming Routine ── */}
      {isLoaded && formattedTogether1.length > 0 && (
        <div className="py-4 lg:py-12 px-6 lg:px-14">
          <div className="w-full py-0 lg:py-12 flex items-center justify-center gap-0 lg:gap-3 mb-6 lg:mb-0">
            <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
            <p className="text-lg lg:text-xl font-semibold text-[#1C1C1C]">
              {t("completeGroomingRoutine")}
            </p>
            <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {formattedTogether1.map((prod) => (
              <div key={prod.id} className="w-[350px]">
                <LandingCards product={prod} showNav={true} compactButtons />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Video Section ── */}
      {isLoaded &&
        (apiProduct?.video_link || apiProduct?.french_video_link) && (
          <div className="py-4 lg:py-12 px-6 lg:px-14">
          <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-lg">
              <ProductVideo
                videoLink={apiProduct?.video_link}
                frenchVideoLink={apiProduct?.french_video_link}
                isLoading={false}
              />
            </div>
          </div>
        )}

      {/* ── Together2 Products — More Products Explore ── */}
      {isLoaded && formattedTogether2.length > 0 && (
        <div className="py-4 lg:py-12 px-6 lg:px-14">
          <div className="w-full py-0 lg:py-12 flex items-center justify-center gap-0 lg:gap-3 mb-6 lg:mb-0">
            <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
            <p className="text-lg lg:text-xl font-semibold text-[#1C1C1C]">
              {t("moreProductsExplore")}
            </p>
            <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {formattedTogether2.map((prod) => (
              <div key={prod.id} className="w-[350px]">
                <LandingCards product={prod} showNav={true} compactButtons />
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductReviews isLoading={!isLoaded} apiProduct={apiProduct} />

      <ProductLoadMore
        isOpen={isLoadMoreOpen}
        onClose={() => setIsLoadMoreOpen(false)}
      />

      <ProductModalAddReview
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={({ rating, feedback }) => console.log("Review submitted:", { rating, feedback })}
      />

      <div className="h-[72px]" />
      <div className="relative z-10">
        <Footer />
      </div>

      {isLoaded && showSticky && !isFooterVisible && (
        <div className="h-[72px]" />
      )}

      {isLoaded && showSticky && (
        <StickyAddToCart
          price={displayPrice}
          productName={displayName}
          selectedVolume={selectedVolume}
          onVolumeChange={handleVolumeSelect}
          volumes={uniqueSizes}
          isFooterVisible={isFooterVisible}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={() => handleOpenCart()}
        />
      )}

      <ModalAddToCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        product={{
          name: displayName,
          price: displayPrice,
          image: slides[0]?.url || "",
        }}
      />
    </div>
  );
}
