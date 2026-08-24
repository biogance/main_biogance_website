"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

import { LandingCards, LoadingCard } from "../Landing/LandingCards";
import { BASE_URL } from "../../API/API";

const MEDIA_BASE = "https://d18f57oyxifcsh.cloudfront.net/";


const mapFavoriteProduct = (item) => ({
  id: item.id,
  name: item.name,
  french_name: item.french_name || "",
  english_seo_keyword: item.english_seo_keyboard || item.english_seo_keyword || "",
  french_seo_keyword: item.french_seo_keyword || "",
  price: item.price || item.products?.[0]?.price || "0",
  discount: item.discount || item.products?.[0]?.off || "",
  image:
    item.image ||
    (item.products?.[0]?.images?.[0]?.media
      ? `${MEDIA_BASE}${item.products[0].images[0].media}`
      : ""),
  images:
    item.images ||
    item.products?.[0]?.images?.map((img) => `${MEDIA_BASE}${img.media}`) || [""],
  videoUrl: item.products?.[0]?.video?.media
    ? `${MEDIA_BASE}${item.products[0].video.media}`
    : null,
  liked: item.liked ?? item.favorites_exists ?? true,
  productsCount: item.products?.length || 1,
  products: item.products || [],
  description: item.description || "",
  french_description: item.french_description || "",
  product_label: item.product_label || "",
  french_product_label: item.french_product_label || "",
  _raw: item,
});

// ─── Favourites Grid ──────────────────────────────────────
function FavouritesGrid({ isLoading, products }) {
  return (
    <div className="w-full">
    
      <style>{`
        @keyframes lcSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <LoadingCard />
              </div>
            ))
          : products.map((product, index) => (
              <div key={product.id} className="w-full">
                <LandingCards product={product} index={index} showNav={true} />
              </div>
            ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Favourite() {
  const { t } = useTranslation('myaccount');
  const [isLoading, setIsLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  };

  const fetchFavourites = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/web/favorites`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data?.status === false) {
        toast.error(data?.action || 'Something went wrong.');
        setFavourites([]);
      } else if (data?.status) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setFavourites(list.map(mapFavoriteProduct));
      } else {
        setFavourites([]);
      }
    } catch (err) {
      console.error('Fetch favorites error:', err);
      setFavourites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const hasFavourites = isLoading || favourites.length > 0;

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
   
    <div>
      <div className="max-w-10xl -mt-1 md:mt-9 mx-auto px-4 sm:px-6 py-8">
      {/* Wishlist Section */}
        <div className="bg-white  p-6 md:p-8 mb-10">
          <div className="mb-6 md:mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-2xl font-semibold text-gray-900">{t('favourite.title')}</h1>
              <p className="text-gray-600 mt-1.5">{t('favourite.subtitle')}</p>
            </div>

            {!isLoading && favourites.length > 0 && (
              <button className="flex cursor-pointer  items-center gap-1 text-md font-semibold text-gray-700 hover:text-gray-900">
                <span  ><RxCross2 size={20} /></span>
                <span>Remove All</span>
              </button>
            )}
          </div>

          {hasFavourites ? (
            <>
              <FavouritesGrid isLoading={isLoading} products={favourites} />

              {!isLoading && favourites.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors">
                    <MdOutlineKeyboardDoubleArrowLeft size={22} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors">
                    <MdOutlineKeyboardArrowLeft size={22} />
                  </button>

                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-gray-900 text-white  font-medium">
                    1
                  </button>

                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors">
                    <MdOutlineKeyboardArrowRight size={22} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors">
                    <MdOutlineKeyboardDoubleArrowRight size={22} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
              <img src="/favacc.svg" alt="Empty wishlist" className="w-64 md:w-80 h-64 md:h-80 object-contain mb-8" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('favourite.empty.title')}</h3>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                {t('favourite.empty.description')}
              </p>
              <button className="bg-gray-900 text-white px-8 py-3.5  font-medium hover:bg-gray-800 transition-colors shadow-sm">
                {t('favourite.empty.browseProducts')}
              </button>
            </div>
          )}
        </div>

        {/* Recommended Section — hidden for now */}
        {false && (
        <div className="bg-white   p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-2xl font-semibold text-gray-900">
              {t('favourite.recommended.title')}
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => scrollRec("prev")}
                disabled={!canScrollLeftRec}
                className={`w-10 h-10  flex items-center justify-center transition-all duration-200 ${
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
                className={`w-10 h-10  flex items-center justify-center transition-all duration-200 ${
                  canScrollRightRec
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-sm"
                    : "bg-white border border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <IoChevronForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 -mt-6 ml-1 ">{t('favourite.recommended.subtitle')}</p>

          {/* <PopularProducts
            isHorizontal={true}
            showHeader={false}
            scrollContainerRef={scrollContainerRefRec}
          /> */}
        </div>
        )}
      </div>
    </div>
  );
}
