"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import ProductModalAddReview from "./ProductModalAddReview";
import ProductLoadMore from "./ProductLoadMore";
import { MEDIA_URL } from "@/Components/API/API";

const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200  animate-pulse ${className}`} />
);

const getReviews = (t) => [
  {
    id: 1,
    name: t("review_1_name"),
    role: t("verifiedBuyer"),
    date: "18/03/2026",
    rating: 4,
    text: t("review_1_text"),
  },
  {
    id: 2,
    name: t("review_2_name"),
    role: t("verifiedBuyer"),
    date: "18/03/2026",
    rating: 4,
    text: t("review_2_text"),
  },
  {
    id: 3,
    name: t("review_3_name"),
    role: t("verifiedBuyer"),
    date: "18/03/2026",
    rating: 3.5,
    text: t("review_3_text"),
  },
  {
    id: 4,
    name: t("review_4_name"),
    role: t("verifiedBuyer"),
    date: "12/02/2026",
    rating: 5,
    text: t("review_4_text"),
  },
  {
    id: 5,
    name: t("review_5_name"),
    role: t("verifiedBuyer"),
    date: "05/01/2026",
    rating: 4,
    text: t("review_5_text"),
  },
  {
    id: 6,
    name: t("review_6_name"),
    role: t("verifiedBuyer"),
    date: "28/12/2025",
    rating: 5,
    text: t("review_6_text"),
  },
];

const INITIAL_VISIBLE = 5;

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star)
        return <FaStar key={star} className="text-black w-3.5 h-3.5" />;
      else if (rating >= star - 0.5)
        return <FaStarHalfAlt key={star} className="text-black w-3.5 h-3.5" />;
      else return <FaRegStar key={star} className="text-black w-3.5 h-3.5" />;
    })}
  </div>
);

export default function ProductReviews({ isLoading, apiProduct }) {
  const { t } = useTranslation("productreviews");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadMoreOpen, setIsLoadMoreOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imageLoaded = useRef(false);
  const allReviews = getReviews(t);

  const handleImageLoad = () => {
    if (!imageLoaded.current) {
      imageLoaded.current = true;
      setImageLoading(false);
    }
  };

  const handleReviewSubmit = ({ rating, feedback }) => {
   
  };

  const visibleReviews = allReviews.slice(0, visibleCount);
  const hasMore = visibleCount < allReviews.length;

  return (
    <div className="w-full bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes shimmerMove {
            0%   { background-position: -600px 0; }
            100% { background-position:  600px 0; }
          }
          .shimmer-bg-reviews {
            background: linear-gradient(90deg, #d4d4d4 25%, #e8e8e8 50%, #d4d4d4 75%);
            background-size: 600px 100%;
            animation: shimmerMove 1.4s infinite linear;
          }
          @keyframes spinReviews { to { transform: rotate(360deg); } }
          @keyframes reviewsFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .reviews-fade-in { animation: reviewsFadeIn 0.4s ease forwards; }
        `,
        }}
      />

      {/* Top Quote Banner */}
      {!isLoading && (
        <div className="hidden lg:flex w-full py-10 flex items-center justify-center gap-3">
          <RiDoubleQuotesL className="text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
          <p className="text-base lg:text-lg font-semibold text-[#1C1C1C] text-center">
            {t("thisProductIsRated")}
          </p>
          <RiDoubleQuotesR className="text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
        </div>
      )}

      {/* Main Content: Two Columns */}
      <div className="w-full flex flex-col lg:flex-row items-start">
        {/* LEFT: Reviews List */}
        <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-14 py-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C1C]">
              {t("userReviews")}
            </h2>
            {!isLoading && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#F3F3F3] text-sm font-medium text-[#1C1C1C] px-4 py-2 cursor-pointer"
              >
                <span className="text-lg leading-none">+</span> {t("addReview")}
              </button>
            )}
          </div>

          {/* Review Items */}
          {isLoading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="min-w-[90px] sm:min-w-[100px] flex flex-col gap-2">
                    <ShimmerLoader className="h-4 w-16" />
                    <ShimmerLoader className="h-3 w-12" />
                    <ShimmerLoader className="h-3 w-14" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <ShimmerLoader className="h-4 w-20" />
                    <ShimmerLoader className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-200">
              {visibleReviews.map((review) => (
                <div key={review.id} className="py-5 first:pt-0">
                  <div className="flex gap-4">
                    {/* Left Meta */}
                    <div className="min-w-[90px] sm:min-w-[100px] flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[#1C1C1C]">
                        {review.name}
                      </span>
                      <span className="text-xs text-[#888]">{review.role}</span>
                      <span className="text-xs text-[#888]">{review.date}</span>
                    </div>

                    {/* Right: Stars + Text */}
                    <div className="flex-1 flex flex-col gap-2">
                      <StarRow rating={review.rating} />
                      <p className="text-sm text-[#1C1C1C] leading-relaxed text-justify">
                        {review.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setIsLoadMoreOpen(true)}
                    className="px-8 py-2.5 bg-black border border-[#C0C0C0]  text-sm font-medium text-white cursor-pointer hover:bg-[#fff] transition-all duration-200 hover:text-black"
                  >
                    {t("loadMore")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Product Image */}
        <div
          className="hidden lg:flex w-full lg:w-1/2 lg:sticky overflow-hidden items-center justify-center"
          style={{
            background: "#E1E1E1",
            top: "104px",
            height: "calc(100vh - 176px)",
            alignSelf: "flex-start",
          }}
        >
          {/* State 1: Shimmer */}
          {isLoading && (
            <div className="shimmer-bg-reviews absolute inset-0 w-full h-full" />
          )}

          {/* State 2: No image from API - show grey background */}
          {!isLoading && !apiProduct?.review_image && (
            <div className="w-full h-full bg-[#E1E1E1]" />
          )}

          {/* State 3: Gray bg + Black spinner */}
          {!isLoading && apiProduct?.review_image && imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#E1E1E1]">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "4px solid rgba(0,0,0,0.12)",
                  borderTopColor: "#111111",
                  animation: "spinReviews 0.8s linear infinite",
                }}
              />
            </div>
          )}

          {/* State 4: Image fade in */}
          {!isLoading && apiProduct?.review_image && (
            <>
              <img
                src={`${MEDIA_URL}${apiProduct.review_image}`}
                alt="Biogance Product Review"
                onLoad={handleImageLoad}
                onError={handleImageLoad}
                className={`w-full h-full object-cover ${
                  imageLoading ? "opacity-0" : "reviews-fade-in"
                }`}
                style={{ minHeight: 420 }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(240,238,233,0.18) 0%, transparent 60%)",
                }}
              />
            </>
          )}
        </div>
      </div>

      {!isLoading && (
        <>
          <ProductModalAddReview
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleReviewSubmit}
          />
          <ProductLoadMore
            isOpen={isLoadMoreOpen}
            onClose={() => setIsLoadMoreOpen(false)}
            reviewImage={apiProduct?.review_image}
          />
        </>
      )}
    </div>
  );
}
