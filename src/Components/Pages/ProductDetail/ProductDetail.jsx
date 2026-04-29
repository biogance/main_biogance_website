"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiHeart } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import Navbar from "@/Components/Pages/Navbar";
import { GoArrowDownRight, GoArrowUpRight } from "react-icons/go";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import AboutProduct from "./AboutProduct";
import ProductExpertAdvice from "./ProductExpertAdvice";
import StickyAddToCart from "./StickyAddToCart";
import Footer from "../Footer";

const product = {
  name: "Biogance Universal 2-in-1 Shampoo – Gentle Cleansing & Nourishing Care for Healthy Pet Coats",
  rating: 3.5,
  reviewCount: 245,
  description:
    "Carat Professional Styling Mousse is expertly formulated with nourishing jojoba oil and provitamin B5 to provide advanced coat care and long-lasting styling support. This lightweight yet effective formula helps maintain a well-structured, full, and voluminous coat while preserving the pet's natural look and texture. It enhances....",
  volumes: ["250ml", "500ml", "700ml", "1L"],
  price: 16.0,
  shipping: "Shipping From France",
  shippingNote: "Customers may see typical issues",
  slides: [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
    },
    {
      type: "video",
      url: "/LandingVideo.mp4",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600&q=80",
    },
  ],
};

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        if (rating >= star) return <FaStar key={star} className="text-black w-4 h-4" />;
        else if (rating >= star - 0.5) return <FaStarHalfAlt key={star} className="text-black w-4 h-4" />;
        else return <FaRegStar key={star} className="text-black w-4 h-4" />;
      })}
    </div>
  );
};

export default function ProductDetail() {
  const [selectedVolume, setSelectedVolume] = useState("250ml");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [currentShipping, setCurrentShipping] = useState(0);
  const [isTransparent, setIsTransparent] = useState(true);
  const [showSticky, setShowSticky] = useState(false);
  const cartBtnRef = useRef(null);
  const videoRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("Blue");

  const slides = product.slides;
  const currentSlideData = slides[currentSlide];
  const isVideo = currentSlideData.type === "video";

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsTransparent(window.scrollY < window.innerHeight);
      if (cartBtnRef.current) {
        const rect = cartBtnRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0 || rect.top > window.innerHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance: images use 3s timer, videos use onEnded
  useEffect(() => {
    clearTimeout(autoPlayTimerRef.current);

    if (!isVideo) {
      autoPlayTimerRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
    }
    // For video, onEnded handler takes care of advancing

    return () => clearTimeout(autoPlayTimerRef.current);
  }, [currentSlide, isVideo, slides.length]);

  // When slide changes to video, play it
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlide, isVideo]);

  const handleVideoEnded = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (idx) => {
    clearTimeout(autoPlayTimerRef.current);
    setCurrentSlide(idx);
  };

  const shippingSlides = [
    { title: "Shipping From France", note: "Customers may see typical issues" },
    { title: "Free Shipping", note: "Starts at 20$" },
    { title: "Complimentry Gift", note: "With every purchase over 10$" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShipping((prev) => (prev + 1) % shippingSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white">
      <Navbar transparent={isTransparent} />
      <div className="flex flex-col lg:flex-row w-full min-h-screen">

        {/* LEFT: Image/Video Section - 50% sticky */}
        <div className="w-full lg:w-1/2 bg-[#E1E1E1] relative flex items-center justify-center min-h-[420px] lg:sticky lg:top-0 lg:h-screen overflow-hidden">

          {isVideo ? (
            /* VIDEO SLIDE */
            <video
              ref={videoRef}
              key={currentSlideData.url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              autoPlay
              playsInline
              onEnded={handleVideoEnded}
            >
              <source src={currentSlideData.url} type="video/mp4" />
            </video>
          ) : (
            /* IMAGE SLIDE */
            <div className="relative w-full h-full flex items-center justify-center py-10 px-8">
              <img
                src={currentSlideData.url}
                alt="Product"
                className="object-contain max-h-[480px] w-auto max-w-full drop-shadow-xl transition-all duration-500"
              />
            </div>
          )}

          {/* Dot Indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-3 h-3 bg-gray-800"
                    : "w-2 h-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info - 50% */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start px-8 lg:px-14 pt-27 pb-12 bg-white">

          <h1 className="text-[22px] lg:text-[26px] font-bold text-[#1C1C1C] leading-snug mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={product.rating} />
            <span className="text-sm text-black">({product.reviewCount} Reviews)</span>
            <button className="text-sm cursor-pointer text-[#808080] underline hover:text-gray-600 transition-colors ml-1">
              Add Review
            </button>
          </div>

          <div className="text-[16px] text-black leading-relaxed mb-5">
            <p>
              {readMore
                ? "Carat Professional Styling Mousse is expertly formulated with nourishing jojoba oil and provitamin B5 to provide advanced coat care and long-lasting styling support. This lightweight yet effective formula helps maintain a well-structured, full, and voluminous coat while preserving the pet's natural look and texture. It enhances the natural shine and softness of the coat with every use. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
                : product.description}
            </p>
          </div>

          <button
            onClick={() => setReadMore(!readMore)}
            className={`flex items-center gap-1 cursor-pointer text-sm font-medium border rounded-lg px-4 py-2 w-fit mb-7 ${
              readMore ? "bg-white text-black border-black" : "bg-black text-white border-gray-300"
            }`}
          >
            {readMore ? "less" : "Read more"}{" "}
            {readMore ? <GoArrowUpRight className="w-4 h-4" /> : <GoArrowDownRight className="w-4 h-4" />}
          </button>

          <div className="mb-6">
            <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Product Volume:</p>
            <div className="flex items-center gap-3 flex-wrap">
              {product.volumes.map((vol) => (
                <button
                  key={vol}
                  onClick={() => setSelectedVolume(vol)}
                  className={`px-5 py-2 cursor-pointer rounded-lg text-sm font-medium border transition-all duration-200 ${
                    selectedVolume === vol
                      ? "bg-[#F0F0F0] border-gray-800 text-black shadow-sm ring-1 ring-black"
                      : "bg-white border-[#A8A8A8] text-[#A8A8A8] hover:border-gray-400"
                  }`}
                >
                  {vol}
                </button>
              ))}
            </div>
          </div>
{/* Color Selector */}
<div className="mb-6">
  <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Color:</p>
  <div className="flex items-center gap-3 flex-wrap">
    {[
      { name: "Blue",  hex: "#3B6FA0" },
      { name: "Green", hex: "#C8DBA8" },
      { name: "Peach", hex: "#E8B48A" },
      { name: "Gray",  hex: "#8A8A8A" },
    ].map((color) => (
      <button
        key={color.name}
        onClick={() => setSelectedColor(color.name)}
        title={color.name}
        className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200 ${
          selectedColor === color.name
            ? "ring-2 ring-offset-2 ring-gray-800 scale-110"
            : "hover:scale-105"
        }`}
        style={{ backgroundColor: color.hex }}
      />
    ))}
  </div>
</div>
          <div className="flex items-center gap-3 mb-8">
            <button
              ref={cartBtnRef}
              id="add-to-cart-btn"
              className="flex-1 bg-black text-white cursor-pointer text-sm font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add to cart – ${product.price.toFixed(2)}
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`w-12 h-12 rounded-lg cursor-pointer border flex items-center justify-center transition-all duration-200 ${
                isWishlisted
                  ? "border-[#E8E8E8] bg-[#F3F3F3] text-black"
                  : "border-[#E8E8E8] bg-[#F3F3F3] text-gray-600 hover:border-gray-400"
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isWishlisted ? "fill-black text-black" : ""}`} />
            </button>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">
                  {shippingSlides[currentShipping].title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{shippingSlides[currentShipping].note}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {shippingSlides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`rounded-full inline-block transition-all duration-300 ${
                      idx === currentShipping
                        ? "w-2.5 h-2.5 bg-gray-800"
                        : "w-2 h-2 bg-[#fff] border border-[#000000]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Quote Section */}
      <div className="w-full py-16 flex items-center justify-center gap-3">
        <RiDoubleQuotesL className="text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
        <p className="text-lg font-semibold text-[#1C1C1C]">
          <span className="text-[#1A171B] font-normal">Made in france</span> - 98% ingredients of natural & organic origin - free from parabens - free from phthalates
        </p>
        <RiDoubleQuotesR className="text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
      </div>

      <AboutProduct />
      <StickyAddToCart price={product.price} productName={product.name} visible={showSticky} />
     <ProductExpertAdvice />
      <Footer/>
    </div>
  );
}