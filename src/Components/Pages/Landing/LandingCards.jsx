import React, { useState, useRef, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useTopLoader } from "../TopLoader";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

import ModalAddToCart from "../Modal/ModalAddToCart";
import ModalQuickView from "../Modal/ModalQuickView";

// Loading Card Component
const LoadingCard = () => (
  <div className="w-full">
    <div
      className=" border border-gray-200 p-3 relative mb-3 aspect-[5/6]"
      style={{
        backgroundColor: "#f9fafb",
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200px 100%",
        animation: "shimmer 1.5s infinite",
      }}
    >
      <div className="absolute top-3 left-3 w-14 h-6 rounded-md bg-gray-300 animate-pulse" />
      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-gray-300 animate-pulse" />
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
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
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const isCurrentImageLoading = false; // DISABLED: cache removed to fix blank cards on Chrome macOS

  const handleImageLoaded = (_idx) => {}; // DISABLED: cache removed


  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (loadingFav) return;
    setLoadingFav(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const payload = {};
      if (loginData?.data?.token) {
        payload.token = loginData.data.token;
      } else {
        payload.device_id = getDeviceId();
      }
      const res = await axios.post(
        `${BASE_URL}/user/add/favorite/bundle/${safeProduct.id}`,
        payload,
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
  };

  useEffect(() => {
    return () => clearTimeout(hoverTimeout.current);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;
    if (isHovered) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isHovered, videoUrl]);

  // CHANGE 3: title ke pehle 3 letters
  const shortTitle = displayName ? displayName.slice(0, 22) : "";
  const price = safeProduct.price ?? 0;

  return (
    <div className="w-full h-full flex flex-col">
     <div
  className={`bg-[#f3f3f3] relative flex flex-col ${compact ? "aspect-[4/5]" : "aspect-[7/10]"} cursor-pointer`}
  onMouseEnter={() => { setIsCardHovered(true); handleMouseEnter(); }}
  onMouseLeave={() => { setIsCardHovered(false); handleMouseLeave(); }}
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
          <div className="absolute top-3 left-3 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
            New
          </div>
        )}

        {index === 1 && (
          <div className="absolute top-3 left-3 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
            Best
          </div>
        )}

        {index === 2 && (
          <div className="absolute top-3 left-3 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
            -20%
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
          const label = i18n.language === "fr" && safeProduct.french_product_label
            ? safeProduct.french_product_label
            : safeProduct.product_label || "";
          return label ? (
            <div className="absolute top-3 right-3 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
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
              style={{ background: "#f0f0f0" }}
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
                    opacity: 1, // DISABLED: was loadedImages.has(idx) — caused blank on Chrome macOS
                    transition: "opacity 0.3s ease",
                  }}
                  className="w-full h-full object-cover"
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
              preload="none"
              loop
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload nofullscreen noremoteplayback"
              onCanPlay={() => setIsVideoReady(true)}
              style={{
                pointerEvents: "none",
                zIndex: 2,
                opacity: isHovered && isVideoReady ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            />
          )}
          {isHovered && videoUrl && !isVideoReady && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 3, background: "#f0f0f0" }}
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

         {/* Title + Price / QuickView overlay */}
<div
  className={`absolute bottom-0 ${compactButtons ? 'mb-3' : 'mb-4'} left-0 right-0 px-3 py-2`}
  style={{ zIndex: 7 }}
>
  {/* Title + Price — hover pe hide */}
  <p
    className="text-black text-xs font-medium truncate cursor-pointer"
    style={{
      margin: 0,
      opacity: isCardHovered ? 0 : 1,
      transition: "opacity 0.2s ease",
      pointerEvents: isCardHovered ? "none" : "auto",
    }}
  >
    {shortTitle} — <span style={{ color: "#6d6d6d" }}>{price} €</span>
  </p>

  {/* QuickView OR Add to Cart button — hover pe show */}
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: "12px",
      right: "12px",
      opacity: isCardHovered ? 1 : 0,
      transition: "opacity 0.2s ease",
      pointerEvents: isCardHovered ? "auto" : "none",
    }}
  >
    {isSingleProduct ? (
      /* Single product → Add to Cart button */
      <button
        className="w-full py-2 text-xs font-semibold tracking-widest uppercase cursor-pointer"
        style={{
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "4px",
          transition: "background-color 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.color = "black";
        }}
       onClick={(e) => {
  e.stopPropagation();
  setIsCartOpen(true);
}}
      >
        {t("products.addToCart")} – {safeProduct.price ?? 0} €
      </button>
    ) : (
      /* Multiple products → Quickview button */
      <button
        className="w-full py-2 text-xs font-semibold tracking-widest uppercase cursor-pointer"
        style={{
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "4px",
          transition: "background-color 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.color = "black";
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsQuickViewOpen(true);
        }}
      >
        {t("products.quickview")}
      </button>
    )}
  </div>
</div>
        </div>
      </div>

      {/* ModalQuickView */}
      <ModalQuickView
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={safeProduct}
        fullProductData={safeProduct._raw || safeProduct}
      />
<ModalAddToCart
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  product={safeProduct}
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

  const mapProducts = (items) =>
    items.map((item) => ({
      id: item.id,
      name: item.name,
      french_name: item.french_name || "",
      english_seo_keyword: item.english_seo_keyboard || item.english_seo_keyword || "",
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
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }
};

  useEffect(() => {
    if (products.length === 0) return;

    const imageUrls = products.flatMap((product) => product.images);
    const imagePromises = imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = url;
      });
    });

    Promise.all([
      Promise.all(imagePromises),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 100);
    });

    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 100);
    }, 3000);

    return () => clearTimeout(fallbackTimer);
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

  // Dono update karo — ref turant, state re-render ke liye
  currentCardIndexRef.current = newIndex;

  const targetCard = cards[newIndex];
  container.scrollTo({
    left: targetCard.offsetLeft - 5,
    behavior: "smooth",
  });

  setCanScrollLeft(newIndex > 0);
  setCanScrollRight(newIndex < maxIndex);
};

  return (
    <div className="w-full bg-white">
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
              : "px-0 py-6 md:py-8 lg:py-10"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? "bg-gray-100 cursor-pointer hover:bg-gray-200"
                    : "bg-white border border-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronBack className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? "bg-gray-100 cursor-pointer hover:bg-gray-200"
                    : "bg-white border border-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        ) : useGrid ? null : (
          <div className="flex items-center justify-between mb-6 px-4 md:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => {
                start();
                router.push(`/shop?source=${sectionSource}`);
              }}
              className="text-left text-2xl font-bold text-gray-900 transition hover:text-black hover:underline cursor-pointer"
            >
              {title} ›
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("prev")}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? "bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                    : "bg-white border border-gray-300 text-gray-300 cursor-not-allowed"
                }`}
              >
                <IoChevronBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? "bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                    : "bg-white border border-gray-300 text-gray-300 cursor-not-allowed"
                }`}
              >
                <IoChevronForward className="w-5 h-5" />
              </button>
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
                  ? "flex overflow-x-auto gap-[3px] pb-4 hide-scrollbar px-[5px]"
                  : "flex overflow-x-auto gap-[3px] pb-4 hide-scrollbar px-[5px]"

          }
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={
                    useGrid || isFavourite || isWishlist
                      ? "w-full"
                      : "flex-shrink-0 w-[calc(50%-1px)] sm:w-[calc(33.333%-1.34px)] md:w-[calc(25%-1.5px)]"
                  }
                >
                  <LoadingCard />
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  className={
                    useGrid || isFavourite || isWishlist
                      ? "w-full max-w-[240px] mx-auto"
                      : "flex-shrink-0 w-[calc(50%-1px)] sm:w-[calc(33.333%-1.34px)] md:w-[calc(25%-1.5px)]"
                  }
                >
                  <LandingCards
                    product={product}
                    showNav={true}
                    index={index}
                    compact={false}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
