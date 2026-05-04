"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import ProductReviews from "./ProductReviews";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { BASE_URL, MEDIA_URL } from "@/Components/API/API";

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
  const firstImage = firstProduct?.images?.[0];
  const firstProductPrice = firstProduct?.price;
  
  return {
    id: product.id,
    name: product.name,
    french_name: product.french_name,
    price: firstProductPrice || product.price,
    discount: "",
    image: firstImage ? `${MEDIA_URL}${firstImage.media}` : "",
    images: [firstImage ? `${MEDIA_URL}${firstImage.media}` : ""],
    liked: false,
  };
};

export default function ProductDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");

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
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const cartBtnRef = useRef(null);
  const videoRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Fetch product detail
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
          // Set default selections based on first product type
          const firstProduct = json.data.products?.[0];
          if (firstProduct?.type === "size" || firstProduct?.type === "size-color") {
            setSelectedVolume(firstProduct.size_name);
          }
          if (firstProduct?.type === "color" || firstProduct?.type === "size-color") {
            setSelectedColor(firstProduct.color_name);
          }
        }
      })
      .catch(() => {});
  }, [productId]);

  // Derived values from API
  const displayName = apiProduct?.name || "Product";
  const displayDescription = apiProduct?.description || "";
  const apiProducts = apiProduct?.products || [];
  const productType = apiProducts[0]?.type || "no-size-color";
  const togetherProducts = apiProduct?.together || [];

  // Build slides from selected product's images
  const selectedProduct = apiProducts[selectedProductIdx] || apiProducts[0];
  const displayPrice = selectedProduct?.price || apiProduct?.price || "0";
  const slides = selectedProduct?.images?.map((img) => ({
    type: "image",
    url: `${MEDIA_URL}${img.media}`,
  })) || [];

  const currentSlideData = slides[currentSlide] || { type: "image", url: "" };
  const isVideo = currentSlideData.type === "video";

  // Reset slide when product selection changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedProductIdx]);

  // Handle volume selection - find matching product
  const handleVolumeSelect = (sizeName) => {
    setSelectedVolume(sizeName);
    const idx = apiProducts.findIndex((p) => p.size_name === sizeName);
    if (idx !== -1) setSelectedProductIdx(idx);
  };

  // Handle color selection - find matching product
  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    const idx = apiProducts.findIndex((p) => p.color_name === colorName);
    if (idx !== -1) setSelectedProductIdx(idx);
  };

  // Unique sizes and colors from products array
  const uniqueSizes = [...new Set(apiProducts.filter((p) => p.size_name).map((p) => p.size_name))];
  const uniqueColors = [...new Set(apiProducts.filter((p) => p.color_name).map((p) => p.color_name))];

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

  useEffect(() => {
    const timer = setTimeout(() => setShowAnnouncement(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    clearTimeout(autoPlayTimerRef.current);
    if (!isVideo && slides.length > 1) {
      autoPlayTimerRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
    }
    return () => clearTimeout(autoPlayTimerRef.current);
  }, [currentSlide, isVideo, slides.length]);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlide, isVideo]);

  const handleVideoEnded = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

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

  const handleProductCardClick = (productId) => {
    router.push(`/product-detail?id=${productId}`);
  };

  const formattedTogetherProducts = togetherProducts.slice(0, 3).map(formatProductForCard);

  return (
    <div className="w-full bg-white">
      {/* Announcement Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] w-full bg-[#111] text-white overflow-hidden transition-all duration-700 ${
          showAnnouncement ? "h-[40px]" : "h-0"
        }`}
      >
        <p className="flex items-center justify-center h-[40px] font-normal tracking-wide text-[11px] lg:text-[13px] text-center px-10">
          Enjoy complimentary standard delivery across France on all orders over €39.
        </p>
      </div>

      <Navbar transparent={isTransparent} announcementVisible={showAnnouncement} />

      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        {/* LEFT: Image Section */}
        <div className="group w-full lg:w-1/2 bg-[#E1E1E1] relative flex items-center justify-center min-h-[420px] lg:sticky lg:top-0 lg:h-screen overflow-hidden">
          {slides.length === 0 ? (
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : isVideo ? (
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
            <div className="relative w-full h-full flex items-center justify-center py-10 px-8">
              <img
                src={currentSlideData.url}
                alt="Product"
                className="object-contain max-h-[480px] w-auto max-w-full drop-shadow-xl transition-all duration-500"
              />
            </div>
          )}

          {/* Left Arrow */}
          <button
            onClick={() => goToSlide(currentSlide - 1)}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer transition-opacity duration-300 ${
              currentSlide === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <MdChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => goToSlide(currentSlide + 1)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer transition-opacity duration-300 ${
              currentSlide === slides.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <MdChevronRight className="w-6 h-6" />
          </button>

          {/* Dot Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`rounded-full transition-all duration-700 ${
                    currentSlide === idx ? "w-8 h-2 bg-gray-800" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start px-5 lg:px-14 pt-6 pb-6 lg:pt-27 lg:pb-12 bg-white">
          <h1 className="text-[22px] lg:text-[26px] font-bold text-[#1C1C1C] leading-snug mb-4">
            {displayName}
          </h1>

          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={3.5} />
            <span className="text-sm text-black">(245 Reviews)</span>
            <button className="text-sm cursor-pointer text-[#808080] underline hover:text-gray-600 transition-colors ml-1">
              Add Review
            </button>
          </div>

          <div className="text-[16px] text-black leading-relaxed mb-5">
            <p
              dangerouslySetInnerHTML={{
                __html: readMore
                  ? displayDescription
                  : displayDescription?.replace(/<[^>]+>/g, "").slice(0, 200) + "...",
              }}
            />
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

          {/* Volume Selector - only for type == size or size-color */}
          {(productType === "size" || productType === "size-color") && uniqueSizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Product Volume:</p>
              <div className="flex items-center gap-3 flex-wrap">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleVolumeSelect(size)}
                    className={`px-5 py-2 cursor-pointer rounded-lg text-sm font-medium border transition-all duration-200 ${
                      selectedVolume === size
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

          {/* Color Selector - only for type == color or size-color */}
          {(productType === "color" || productType === "size-color") && uniqueColors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Color:</p>
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

          {/* Add to Cart */}
          <div className="flex items-center gap-3 mb-8">
            <button
              ref={cartBtnRef}
              id="add-to-cart-btn"
              className="flex-1 bg-black text-white cursor-pointer text-sm font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add to cart – €{displayPrice}
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
                    className={`rounded-full inline-block transition-all duration-700 ${
                      idx === currentShipping ? "w-6 h-2 bg-gray-800" : "w-2 h-2 bg-white border border-black"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="hidden lg:flex w-full py-16 items-center justify-center gap-3">
        <RiDoubleQuotesL className="text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
        <p className="text-lg font-semibold text-[#1C1C1C]">
          <span className="text-[#1A171B] font-normal">Made in france</span> - 98% ingredients of natural & organic origin - free from parabens - free from phthalates
        </p>
        <RiDoubleQuotesR className="text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
      </div>

      <AboutProduct apiProduct={apiProduct} />

      <StickyAddToCart
        price={displayPrice}
        productName={displayName}
        visible={showSticky}
        selectedVolume={selectedVolume}
        onVolumeChange={handleVolumeSelect}
        volumes={uniqueSizes}
      />

      <ProductExpertAdvice apiProduct={apiProduct} />

      {/* Together Products */}
      {formattedTogetherProducts.length > 0 && (
        <div className="py-4 lg:py-12 px-6 lg:px-14">
          <div className="w-full py-0 lg:py-12 flex items-center justify-center gap-0 lg:gap-3 mb-6 lg:mb-0">
            <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
            <p className="text-lg lg:text-xl font-semibold text-[#1C1C1C]">Complete your grooming routine</p>
            <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {formattedTogetherProducts.map((prod) => (
              <div key={prod.id} className="w-[350px] cursor-pointer" onClick={() => handleProductCardClick(prod.id)}>
                <LandingCards product={prod} showNav={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="py-4 lg:py-12 px-6 lg:px-14">
        <div className="w-full py-0 lg:py-10 flex items-center justify-center gap-0 lg:gap-3 mb-4 lg:mb-0">
          <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
          <p className="text-lg font-semibold text-[#1C1C1C]">Watch the Benefits Live</p>
          <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
        </div>
        <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-lg">
          <ProductVideo videoLink={apiProduct?.video_link} />
        </div>
      </div>

      <ProductReviews />
      <Footer />
    </div>
  );
}
