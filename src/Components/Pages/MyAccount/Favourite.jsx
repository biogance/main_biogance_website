"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

// ─── Loading Card ────────────────────────────────────────
const LoadingCard = () => (
  <div className="w-full">
    <div
      className="rounded-2xl border border-gray-200 p-3 relative mb-3 aspect-[3/4]"
      style={{
        backgroundColor: "#f9fafb",
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
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

// ─── Single Product Card ─────────────────────────────────
const LandingCards = ({ product, showNav = true }) => {
  const [isLiked, setIsLiked] = useState(product.liked || false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex === 0) return;
    setCurrentImageIndex((prev) => prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex === product.images.length - 1) return;
    setCurrentImageIndex((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-50 rounded-2xl border border-gray-200 relative mb-3 aspect-[3/4] flex flex-col overflow-hidden">
        {product.discount && (
          <div className="absolute top-3 left-3 bg-green-50 text-black border border-green-200 text-xs font-semibold px-2 py-1 rounded-md z-10">
            {product.discount}
          </div>
        )}

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 w-8 h-8 cursor-pointer bg-white rounded-xl border border-gray-200 flex items-center justify-center z-10 hover:bg-gray-50 transition-colors"
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? <FaHeart className="w-4 h-4 text-black" /> : <FaRegHeart className="w-4 h-4 text-gray-700" />}
        </button>

        <div className="relative flex-1 flex items-center justify-center px-6 py-4">
          {product.images?.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                className={`absolute left-3 z-20 w-9 h-9 bg-transparent backdrop-blur flex items-center justify-center  transition-all ${
                  currentImageIndex === 0 ? "opacity-40 cursor-not-allowed" : "opacity-90 hover:opacity-100 cursor-pointer"
                }`}
                aria-label="Previous image"
              >
                <IoChevronBack className="w-5 h-5 text-gray-800" />
              </button>

              <button
                onClick={handleNextImage}
                disabled={currentImageIndex === product.images.length - 1}
                className={`absolute right-3 z-20 w-9 h-9 bg-transparent backdrop-blur flex items-center justify-center  transition-all ${
                  currentImageIndex === product.images.length - 1 ? "opacity-40 cursor-not-allowed" : "opacity-90 hover:opacity-100 cursor-pointer"
                }`}
                aria-label="Next image"
              >
                <IoChevronForward className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          <img
            src={product.images?.[currentImageIndex] || product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>

        {product.images?.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2.5">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentImageIndex ? "bg-gray-900" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-1">
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 min-h-[2.75rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-gray-900">€{product.price}</span>
          <button className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Products List Component ─────────────────────────────
function PopularProducts({
  title = "",
  isWishlist = false,
  isFavourite = false,
  isHorizontal = false,
  showHeader = true,
  scrollContainerRef,
}) {
  const scrollContainerRefInternal = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const containerRef = scrollContainerRef || scrollContainerRefInternal;

  const products = [
    {
      id: 1,
      name: "Natural sunscreen for dogs and cats - Sun Protection",
      price: "15.90",
      discount: "20% Off",
      image: "/product1.svg",
      images: ["/product1.svg", "/product2.svg", "/product3.svg"],
      liked: false,
    },
    {
      id: 3,
      name: 'Universal shampoo 2 in 1 Biogance',
      price: '11.25',
      originalPrice: '35.30',
      image: "/product1.svg",
      images: ["/product1.svg", "/product2.svg", "/product3.svg"],
      liked: false
    },
    {
      id: 4,
      name: 'Also Repair Repair Spray',
      price: '12.60',
      discount: '20% Off',
      image: "/product1.svg",
      images: ["/product1.svg", "/product2.svg", "/product3.svg"],
      liked: false
    },
    {
      id: 5,
      name: 'Premium Pet Conditioner',
      price: '18.90',
      originalPrice: '24.90',
      discount: '20% Off',
      image: "/product1.svg",
      images: ["/product1.svg", "/product2.svg", "/product3.svg"],
      liked: false
    },
    {
      id: 6,
      name: 'Natural Pet Cologne',
      price: '14.50',
      image: "/product1.svg",
      images: ["/product1.svg", "/product2.svg", "/product3.svg"],
      liked: false
    }
  ];

  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 150);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    // Initial check after layout
    const initialCheck = setTimeout(checkScrollPosition, 300);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
      clearTimeout(initialCheck);
    };
  }, [isLoading, products.length]);

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 320;
    containerRef.current.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full">
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10">
       

        <div
          ref={containerRef}
          className={`
            ${isFavourite || isWishlist
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 lg:gap-6"
              : "flex overflow-x-auto gap-6 pb-6 hide-scrollbar snap-x snap-mandatory"
            }
          `}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full min-w-[280px]">
                  <LoadingCard />
                </div>
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className={`
                    w-full
                    ${!isFavourite && !isWishlist ? "flex-shrink-0 w-[280px] sm:w-[300px] md:w-[340px] snap-start" : ""}
                  `}
                >
                  <LandingCards product={product} showNav={false} />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Favourite() {
  const hasFavourites = true;

  const scrollContainerRefRec = useRef(null);
  const [canScrollLeftRec, setCanScrollLeftRec] = useState(false);
  const [canScrollRightRec, setCanScrollRightRec] = useState(true);

  const checkScrollPositionRec = () => {
    const container = scrollContainerRefRec.current;
    if (!container) return;
    setCanScrollLeftRec(container.scrollLeft > 0);
    setCanScrollRightRec(
      Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeout(checkScrollPositionRec, 150);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = scrollContainerRefRec.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPositionRec);
    window.addEventListener("resize", checkScrollPositionRec);

    const initialCheck = setTimeout(checkScrollPositionRec, 300);

    return () => {
      container.removeEventListener("scroll", checkScrollPositionRec);
      window.removeEventListener("resize", checkScrollPositionRec);
      clearTimeout(initialCheck);
    };
  }, []);

  const scrollRec = (direction) => {
    if (!scrollContainerRefRec.current) return;
    const scrollAmount = 320;
    scrollContainerRefRec.current.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Wishlist Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-10">
          <div className="-mb-2">
            <h1 className="text-2xl md:text-2xl font-semibold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1.5">Products you've saved for later</p>
          </div>

          {hasFavourites ? (
            <>
              <PopularProducts isFavourite={true} />

              <div className="flex items-center justify-center gap-2 mt-10">
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <MdOutlineKeyboardDoubleArrowLeft size={22} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <MdOutlineKeyboardArrowLeft size={22} />
                </button>

                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-gray-900 text-white rounded-lg font-medium">
                  1
                </button>
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  2
                </button>
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  3
                </button>

                <span className="px-3 text-gray-500">...</span>

                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  11
                </button>

                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <MdOutlineKeyboardArrowRight size={22} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <MdOutlineKeyboardDoubleArrowRight size={22} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
              <img src="/favacc.svg" alt="Empty wishlist" className="w-64 md:w-80 h-64 md:h-80 object-contain mb-8" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your Wishlist is Empty</h3>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Save your favorite products here to easily find them later.
              </p>
              <button className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm">
                Browse Products
              </button>
            </div>
          )}
        </div>

        {/* Recommended Section */}
        <div className="bg-white rounded-2xl  p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-2xl font-semibold text-gray-900">
              You Might Also Like
            </h2>
\
            <div className="flex gap-2">
              <button
                onClick={() => scrollRec("prev")}
                disabled={!canScrollLeftRec}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  canScrollLeftRec
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-sm"
                    : "bg-white border border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollRec("next")}
                disabled={!canScrollRightRec}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  canScrollRightRec
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-sm"
                    : "bg-white border border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 -mt-6 ml-1 ">Based on your list</p>

          <PopularProducts
            isHorizontal={true}
            showHeader={false}
            scrollContainerRef={scrollContainerRefRec}
          />
        </div>
      </div>
    </div>
  );
}