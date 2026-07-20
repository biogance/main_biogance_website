"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ModalAddToCart from "../Modal/ModalAddToCart";
import { LuPackage, LuUser, LuUserRoundPen } from "react-icons/lu";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { mergeCartItem } from "../../../utils/cartStorage";
import { startTopLoader } from "../TopLoader";
import { FaRegHourglassHalf, FaRegCircleUser } from "react-icons/fa6";
import { FaArrowLeft, FaRegUserCircle } from "react-icons/fa";
import { MdOutlineUpdate, MdUpdate } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import { SlUser } from "react-icons/sl";
import { PiUser, PiUserLight } from "react-icons/pi";

// Mirrors ExpertAdvicesSeeAll.jsx's TYPE_LABEL_KEYS — needed here to rebuild
// the "Back to X" label from a stored typeKey in the current language.
const TYPE_LABEL_KEYS = {
  recommended: "sectionLabels.recommended",
  trending: "sectionLabels.trending",
  like: "sectionLabels.mostLiked",
  recent: "sectionLabels.recentlyAdded",
  pet: "sectionLabels.petBlogs",
};

function getAuthHeaders() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    if (loginData?.data?.token)
      return { Authorization: `Bearer ${loginData.data.token}` };
  } catch {}
  return {};
}

function getAuthBody() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    if (loginData?.data?.token) return {};
  } catch {}
  return { device_id: getDeviceId() };
}

function getBlogImage(item) {
  return item?.images?.[0]?.media ?? item?.image ?? null;
}

function getBlogField(item, field, isFr) {
  if (!item) return "";
  if (!isFr) return item[field] ?? "";
  // Most fields are prefixed (name -> french_name), but the *_description
  // fields put "french" in the middle (long_description -> long_french_description).
  const frField = field.endsWith("_description")
    ? field.replace("_description", "_french_description")
    : `french_${field}`;
  return item[frField] || item[field] || "";
}

function getYoutubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.pop() || null;
  } catch {
    return null;
  }
}

function useCardsPerView() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 1024) return 2;
      return 3;
    };
    const update = () => setCount(calc());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

function MoreAdvicesRow({ items, isFr, backInfo, filterLabel }) {
  const { t } = useTranslation("expertadvice");
  const router = useRouter();
  const scrollRef = useRef(null);
  const cardsPerView = useCardsPerView();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const track = scrollRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    );
  };

  useEffect(() => {
    const timer = setTimeout(updateScrollState, 50);
    const track = scrollRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      clearTimeout(timer);
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [items]);

  const scrollByCard = (direction) => {
    const track = scrollRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const amount = card ? card.offsetWidth + 12 : 320;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const navigateToDetail = (item) => {
    const keyword = isFr
      ? item.french_seo_keyword || item.english_seo_keyboard
      : item.english_seo_keyboard || item.french_seo_keyword;
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  if (!items?.length) return null;

  return (
    <section className="bg-[#fbf9f7] border-t border-gray-200 py-8 sm:py-12 md:py-16">
      <div className="px-6 sm:px-10 lg:px-16 flex items-end justify-between mb-4">
        <div>
        <button
  onClick={() => { startTopLoader(); router.push(backInfo.url); }}
  className="inline-flex items-start sm:items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase text-gray-900 hover:text-gray-500 transition-colors mb-3 cursor-pointer bg-transparent border-none p-0 text-left"
>
     <FaArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5 sm:mt-0" />
  {t("backTo", { label: backInfo.label })}
</button>
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("moreExpertAdvices")}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            aria-label={t("scrollLeft")}
            className="w-9 h-9 bg-white border border-gray-300  flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-6 h-6 mr-0.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            aria-label={t("scrollRight")}
            className="w-9 h-9 bg-white border border-gray-300  flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="w-6 h-6 ml-0.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
     className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-card
            onClick={() => navigateToDetail(item)}
            className="relative h-72 shrink-0 overflow-hidden cursor-pointer group"
            style={{
               flexBasis: `calc((100% - ${(cardsPerView - 1) * 12}px) / ${cardsPerView})`,
            }}
          >
            <img
              src={
                getBlogImage(item)
                  ? `${MEDIA_URL}${getBlogImage(item)}`
                  : "/cat.png"
              }
              className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-transform duration-700"
            />
            {/* Top-right arrow icon on hover */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <HiOutlineArrowUpRight className="w-4 h-4 text-gray-900" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              {filterLabel && (
                <p className="text-xs text-white/80 mb-1">{filterLabel}</p>
              )}
              <p className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-white">
                {getBlogField(item, "name", isFr)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExpertArticleDetail({ seoKeyword: seoKeywordProp }) {
  const { t, i18n } = useTranslation("expertadvice");
  const isFr = i18n.language?.startsWith("fr");
  const router = useRouter();
  const seoKeyword = seoKeywordProp;
  const sectionLabel = t("expertInsight");

  // Stored as raw parts/typeKey (not a pre-rendered label) so the label below
  // can be rebuilt via t()/isFr on every render — a plain string cached in
  // sessionStorage or a useState initializer would otherwise freeze the label
  // in whatever language was active when the previous page wrote it, ignoring
  // any later language switch made while already on this page.
  const [storedBackInfo, setStoredBackInfo] = useState(null);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("adviceBack");
      if (stored) setStoredBackInfo(JSON.parse(stored));
    } catch {}
  }, []);

  const backParts = storedBackInfo?.parts ?? [];
  const backPartsLabel = backParts
    .map((p) => (isFr && p.frenchName ? p.frenchName : p.name))
    .filter(Boolean)
    .join(" & ");
  const backTypeLabel =
    !backPartsLabel && storedBackInfo?.typeKey
      ? t(TYPE_LABEL_KEYS[storedBackInfo.typeKey] || "articles")
      : "";
  const backPrefix = backPartsLabel || backTypeLabel;
  const backInfo = {
    url: storedBackInfo?.url ?? "/advices",
    label: backPrefix ? `${backPrefix} ${t("advicesSuffix")}` : t("advicesSuffix"),
  };

  const [blog, setBlog] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [addingBundleId, setAddingBundleId] = useState(null);
  // const [addingAll, setAddingAll] = useState(false); // Add all — commented out
  const [cartOpen, setCartOpen] = useState(false);

  // This component stays mounted across /advices/[keyword] navigations (only
  // seoKeyword changes), so both a related-card click and a browser back/
  // forward otherwise just inherit whatever scroll position carried over —
  // landing near the "More expert advices" row (right above the footer)
  // since that's where related-card clicks originate. Force every keyword
  // change back to the top, and stop the browser's native scroll
  // restoration from fighting that on back/forward.
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [seoKeyword]);

  useEffect(() => {
    if (!seoKeyword) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${BASE_URL}/blog/detail`,
          { ...getAuthBody(), seo_keyboard: decodeURIComponent(seoKeyword) },
          { headers: { ...getAuthHeaders() } },
        );
        if (!res.data.status) {
          router.push("/advices");
          return;
        }
        setBlog(res.data.data?.blog ?? null);
        setBundles(res.data.data?.bundles ?? []);
        setRelatedBlogs(res.data.data?.relatedBlogs ?? []);
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.action || err.response?.data?.message;
        if (status === 404 || message === "Unauthenticated") {
          router.push("/advices");
        } else {
          toast.error(t("somethingWentWrong"));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [seoKeyword]);

  const hasProducts = bundles.length > 0;
  const youtubeLink = isFr
    ? blog?.french_youtube_link || blog?.youtube_link
    : blog?.youtube_link || blog?.french_youtube_link;
  const youtubeId = getYoutubeId(youtubeLink);
  const tags = blog?.tags ?? [];

  const getSelectedProduct = (bundle) => {
    const products = bundle.products || [];
    return (
      products.find((p) => p.id === selectedSizes[bundle.id]) || products[0]
    );
  };

  const navigateToProduct = (bundle) => {
    const slug = isFr
      ? bundle.french_seo_keyword || bundle.english_seo_keyboard
      : bundle.english_seo_keyboard || bundle.french_seo_keyword;
    if (!slug) return;
    startTopLoader();
    router.push(`/product/${slug}`);
  };

  const addProductToCart = async (productId) => {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const res = await axios.post(
      `${BASE_URL}/user/cart/create`,
      token
        ? { product_id: productId, quantity: 1 }
        : { device_id: getDeviceId(), product_id: productId, quantity: 1 },
      token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    );
    if (res.data.status === false) {
      throw new Error(res.data.action || t("couldNotAddToCart"));
    }
    mergeCartItem(res.data.data);
  };

  const handleAddToCart = async (bundle) => {
    const product = getSelectedProduct(bundle);
    if (!product || addingBundleId) return;
    setAddingBundleId(bundle.id);
    try {
      await addProductToCart(product.id);
      setCartOpen(true);
    } catch (err) {
      toast.error(err.message || t("somethingWentWrong"));
    } finally {
      setAddingBundleId(null);
    }
  };

  const cardsPerView = useCardsPerView();

  const cardsScrollRef = useRef(null);



  // const handleAddAll = async () => {
  //   if (addingAll) return;
  //   setAddingAll(true);
  //   try {
  //     for (const bundle of bundles) {
  //       const product = getSelectedProduct(bundle);
  //       if (!product) continue;
  //       await addProductToCart(product.id);
  //     }
  //     setCartOpen(true);
  //   } catch (err) {
  //     toast.error(err.message || "Something went wrong.");
  //   } finally {
  //     setAddingAll(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
        <Navbar bgWhite={true} />

        {/* Hero skeleton — mirrors the real hero's exact margins (mb-6 / mb-6 / mb-8 / gap-5 sm:gap-8) */}
        <section className="bg-[#fbf9f7]">
          <div className="flex flex-col lg:flex-row items-stretch">
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-18">
              <div className="h-3 bg-gray-200 animate-pulse rounded w-40 mb-6" />
              <div className="h-9 sm:h-10 lg:h-9 bg-gray-200 animate-pulse rounded w-full mb-3" />
              <div className="h-9 sm:h-10 lg:h-9 bg-gray-200 animate-pulse rounded w-full mb-3" />
               <div className="h-9 sm:h-10 lg:h-9 bg-gray-200 animate-pulse rounded w-2/3 mb-6" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full max-w-lg mb-2" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-full max-w-lg mb-2" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-full max-w-lg mb-2" />
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-full max-w-lg mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6 max-w-md mb-8" />
              <div className="flex items-center gap-5 sm:gap-8 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-16" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-32" />
                </div>
              </div>
            </div>
            <div className="relative w-full lg:w-1/2 h-auto bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* Article body + sidebar skeleton — same container padding + column split as the real layout */}
        <div className="px-6 sm:px-10 lg:px-16 py-6 md:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-12">
            <div className="w-full lg:flex-1 space-y-4">
              <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-full !mt-8" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-4/6" />
              <div className="h-40 bg-gray-100 animate-pulse rounded !mt-8" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-full !mt-8" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
            </div>

            <div className="w-full lg:w-2/5 xl:w-1/4 xl:max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <div className="border border-gray-200 p-4 sm:p-6">
                <div className="h-3 bg-gray-100 animate-pulse rounded w-28 mb-2" />
                <div className="h-6 bg-gray-100 animate-pulse rounded w-44 mb-4" />
                <hr className="border-gray-200 mb-4" />
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="h-3.5 bg-gray-100 animate-pulse rounded w-3/5" />
                        <div className="h-3.5 bg-gray-100 animate-pulse rounded w-8 shrink-0" />
                      </div>
                      <div className="h-3 bg-gray-100 animate-pulse rounded w-2/5 mb-2" />
                      <div className="flex gap-1.5 mb-2">
                        <div className="h-5 bg-gray-100 animate-pulse rounded w-9" />
                        <div className="h-5 bg-gray-100 animate-pulse rounded w-9" />
                        <div className="h-5 bg-gray-100 animate-pulse rounded w-9" />
                      </div>
                      <div className="flex gap-1.5 mb-2">
                        <div className="w-6 h-6 bg-gray-100 animate-pulse rounded-full" />
                        <div className="w-6 h-6 bg-gray-100 animate-pulse rounded-full" />
                        <div className="w-6 h-6 bg-gray-100 animate-pulse rounded-full" />
                      </div>
                      <div className="h-9 bg-gray-100 animate-pulse rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Video skeleton */}
        <section className="bg-white py-12 md:py-16">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-12">
              <div className="w-full lg:flex-1 aspect-video bg-gray-200 animate-pulse" />
              <div className="hidden lg:block lg:w-2/5 xl:w-1/4 xl:max-w-sm" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Tags skeleton */}
        <section className="bg-white py-12 md:py-16">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-12">
              <div className="w-full lg:flex-1 flex flex-wrap gap-2">
                {[16, 20, 14, 24, 18, 12].map((w, i) => (
                  <div
                    key={i}
                    className="h-7 bg-gray-100 animate-pulse"
                    style={{ width: `${w * 4}px` }}
                  />
                ))}
              </div>
              <div className="hidden lg:block lg:w-2/5 xl:w-1/4 xl:max-w-sm" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* More advices skeleton — includes the left/right scroll-arrow placeholders the real header has */}
      <section className="bg-[#fbf9f7] py-8 sm:py-12 md:py-16">
          <div className="px-6 sm:px-10 lg:px-16 flex items-end justify-between mb-4">
            <div>
              <div className="h-3 bg-gray-200 animate-pulse rounded w-32 mb-1" />
              <div className="h-8 bg-gray-200 animate-pulse rounded w-60" />
            </div>
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: cardsPerView }).map((_, i) => (
              <div
                key={i}
                className="relative h-72 bg-gray-200 animate-pulse shrink-0"
                style={{
                  flexBasis: `calc((100% - ${(cardsPerView - 1) * 12}px) / ${cardsPerView})`,
                }}
              >
                <div className="absolute inset-x-0 bottom-0 p-4 pt-10 space-y-2">
                  <div className="h-2.5 bg-gray-300/70 rounded w-1/4" />
                  <div className="h-3.5 bg-gray-300/70 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Hero */}
      <section className="bg-[#fbf9f7]">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
            <button
              onClick={() => { startTopLoader(); router.push(backInfo.url); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-500 transition-colors mb-6 cursor-pointer bg-transparent border-none p-0"
            >
            <FaArrowLeft className="w-3.5 h-3.5" />
              {t("backTo", { label: backInfo.label })}
            </button>
          <h1 className="text-2xl sm:text-3xl lg:text-[42px] font-bold text-gray-900 leading-tight mb-6">
              {getBlogField(blog, "name", isFr)}
            </h1>
            {getBlogField(blog, "short_description", isFr) && (
              <p className="text-sm text-gray-700 leading-relaxed max-w-md mb-8">
                {getBlogField(blog, "short_description", isFr)}
              </p>
            )}
            <div className="flex items-center gap-5 sm:gap-8 text-xs text-gray-700 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
      <FaRegUserCircle  size={16} className="text-gray-700 mb-0.3" />
                {t("byAuthor", { name: blog?.company_name || "Biogance" })}
              </span>
              <span className="flex items-center gap-1">
                <IoHourglassOutline size={16} className="text-gray-700 mb-0.4" />
                {t("minRead", { time: blog?.reading_time || "0" })}
              </span>
              {blog?.updated_at && (
                <span className="flex items-center gap-1">
                  <MdUpdate size={18} className="text-gray-700" />
                  {t("updatedOn", {
                    date: new Date(blog.updated_at).toLocaleDateString(
                      isFr ? "fr-FR" : "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    ),
                  })}
                
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full lg:w-1/2">
            <img
              src={
                getBlogImage(blog)
                  ? `${MEDIA_URL}${getBlogImage(blog)}`
                  : "/cat.png"
              }
          
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article body + product recommendation */}
    <div className="px-6 sm:px-10 lg:px-16 py-6 md:py-8 lg:py-12">
        {hasProducts ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_40%] xl:grid-cols-[1fr_25%] gap-2 lg:gap-x-12">

            {/* 1. Left: article content */}
            <div className="w-full order-1 lg:col-start-1">
              {getBlogField(blog, "long_description", isFr) ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: getBlogField(blog, "long_description", isFr),
                  }}
                />
              ) : (
                <p className="text-sm text-gray-500">{t("noContent")}</p>
              )}
            </div>

            {/* 2. Right: recommended products */}
            <div
              className="w-full mt-6 mb-6 lg:mt-0 lg:mb-0 xl:max-w-sm mx-auto lg:mx-0 lg:ml-auto lg:sticky lg:top-[130px] lg:self-start border border-gray-200 flex flex-col overflow-hidden sticky-products-sidebar order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3"
            >
              <div className="p-4 sm:p-6 pb-4 shrink-0">
                <p className="text-xs text-gray-400 mb-2">
                  {t("recommendedRoutine")}
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {t("recommendedProducts")}
                </h3>
                <hr className="border-gray-200" />
              </div>
              <div
                ref={cardsScrollRef}
                className="flex-1 min-h-0 -mt-5 overflow-y-auto scroll-smooth px-4 sm:px-6 pb-4 sm:pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {bundles.map((bundle) => {
                  const products = bundle.products || [];
                  const uniqueSizes = [
                    ...new Set(
                      products
                        .filter((p) => p.size_name)
                        .map((p) => p.size_name),
                    ),
                  ];
                  const hasSizes = uniqueSizes.length > 1;
                  const singleSize =
                    uniqueSizes.length === 1 ? uniqueSizes[0] : null;
                  const product = getSelectedProduct(bundle);
                  // Once a size is picked, only show the colors available for that size.
                  const colorSourceProducts =
                    hasSizes && product?.size_name
                      ? products.filter((p) => p.size_name === product.size_name)
                      : products;
                  const uniqueColors = [
                    ...new Set(
                      colorSourceProducts
                        .filter((p) => p.color_name)
                        .map((p) => p.color_name),
                    ),
                  ];
                  const productImg = product?.images?.[0]?.media ?? null;
                  const productName = isFr
                    ? bundle.french_name || bundle.name
                    : bundle.name;
                  const productLabel = isFr
                    ? bundle.french_product_label || bundle.product_label
                    : bundle.product_label;
                  const isAdding = addingBundleId === bundle.id;
                  return (
                    <div
                      key={bundle.id}
                      onClick={() => navigateToProduct(bundle)}
                      className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer"
                    >
                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-[#f3f3f3] shrink-0 flex items-center justify-center overflow-hidden">
                        {productImg ? (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            </div>
                            <img
                              src={`${MEDIA_URL}${productImg}`}
                              onLoad={(e) => e.currentTarget.previousSibling?.remove()}
                              className="relative z-10 w-full h-full object-cover"
                            />
                          </>
                        ) : (
                          <LuPackage className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs sm:text-sm font-bold  text-gray-900">
                            {productName}
                          </p>
                        </div>
                        {(productLabel || singleSize) && (
                          <p className="text-[9px] sm:text-[11px] text-gray-500 mb-2">
                            {productLabel && singleSize
                              ? `${productLabel} — ${singleSize}`
                              : productLabel || singleSize}
                          </p>
                        )}
                        {hasSizes && (
                          <div className="flex flex-wrap gap-1.5 mt-2 mb-3.5">
                            {uniqueSizes.map((size) => {
                              const sizeProduct = products.find(
                                (p) => p.size_name === size,
                              );
                              const isSelected = product?.size_name === size;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSizes((prev) => ({
                                      ...prev,
                                      [bundle.id]: sizeProduct?.id,
                                    }));
                                  }}
                                  className={`px-2 py-1 text-[8px] sm:text-xs font-medium border transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-gray-900 border-gray-900 text-white"
                                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-900"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {uniqueColors.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3.5">
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
                              const isSelected = product?.color_name === color;
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const sizeName = hasSizes
                                      ? product?.size_name
                                      : null;
                                    const match =
                                      products.find(
                                        (p) =>
                                          (!sizeName || p.size_name === sizeName) &&
                                          p.color_name === color,
                                      ) || products.find((p) => p.color_name === color);
                                    setSelectedSizes((prev) => ({
                                      ...prev,
                                      [bundle.id]: match?.id,
                                    }));
                                  }}
                                  title={color}
                                  aria-label={color}
                                  className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-colors ${
                                    isSelected
                                      ? "border-gray-900 ring-1 ring-gray-900"
                                      : "border-gray-200 hover:border-gray-400"
                                  }`}
                                  style={{ background: swatchBg }}
                                />
                              );
                            })}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(bundle);
                          }}
                          disabled={isAdding}
                          className="w-full mt-auto pt-2 text-black bg-[#f3f3f3] hover:bg-gray-900 hover:text-white text-xs sm:text-sm font-semibold py-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isAdding ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            `${t("addToCart")}${product?.price ? ` - €${product.price}` : ""}`
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. YouTube video */}
            {youtubeId && (
              <div className="w-full order-3 lg:col-start-1 mt-12 md:mt-16 relative aspect-video bg-gray-900 overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=1&rel=0`}
                  title="Blog Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* 4. Tags */}
            {tags.length > 0 && (
              <div
                className={`w-full order-4 lg:col-start-1 ${
                  youtubeId ? "mt-12 md:mt-16" : "mt-6 md:mt-8"
                } flex flex-wrap gap-2`}
              >
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-3 py-1.5 border border-black/15 text-black/70"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* No products: plain content, aligned with hero content */
          <div>
            {getBlogField(blog, "long_description", isFr) ? (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: getBlogField(blog, "long_description", isFr),
                }}
              />
            ) : (
              <p className="text-sm text-gray-500">{t("noContent")}</p>
            )}
          </div>
        )}
      </div>

      {/* YouTube video */}
      {!hasProducts && youtubeId && (
        <section className="bg-white py-12 md:py-16">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-12">
              <div className="relative w-full lg:flex-1 aspect-video bg-gray-900 overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=1&rel=0`}
                  title="Blog Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div
                className="hidden lg:block lg:w-2/5 xl:w-1/4 xl:max-w-sm"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
      )}

      {/* Tags — shown below the video if there is one, otherwise take its place */}
      {!hasProducts && tags.length > 0 && (
        <section
          className={`bg-white pb-12 md:pb-16 ${youtubeId ? "pt-12 md:pt-16" : "pt-0"}`}
        >
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-12">
              <div className="w-full lg:flex-1 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-3 py-1.5 border border-black/15 text-black/70"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
              <div
                className="hidden lg:block lg:w-2/5 xl:w-1/4 xl:max-w-sm"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
      )}

      {/* More expert advices */}
      <MoreAdvicesRow
        items={relatedBlogs}
        isFr={isFr}
        backInfo={backInfo}
        filterLabel={backPartsLabel}
      />

      <Footer />

      <ModalAddToCart isOpen={cartOpen} onClose={() => setCartOpen(false)} autoCloseOnLeave />
    </div>
  );
}

export default ExpertArticleDetail;