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
import { LuPackage } from "react-icons/lu";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { mergeCartItem } from "../../../utils/cartStorage";
import { startTopLoader } from "../TopLoader";

function getAuthHeaders() {
  try {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    if (loginData?.data?.token) return { Authorization: `Bearer ${loginData.data.token}` };
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

function MoreAdvicesRow({ items, isFr, sectionLabel }) {
  const { t } = useTranslation("expertadvice");
  const router = useRouter();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const track = scrollRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
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
    const amount = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const navigateToDetail = (item) => {
    const keyword = isFr
      ? (item.french_seo_keyword || item.english_seo_keyboard)
      : (item.english_seo_keyboard || item.french_seo_keyword);
    startTopLoader();
    router.push(`/advices/${encodeURIComponent(keyword)}`);
  };

  if (!items?.length) return null;

  return (
    <section className="bg-[#fbf9f7] py-12 md:py-16">
      <div className="px-6 sm:px-10 lg:px-16 flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            <Link href="/" className="hover:text-gray-600 transition-colors">{t("home")}</Link>{" "}/{" "}
            <Link href="/advices" className="hover:text-gray-600 transition-colors">{t("advice")}</Link>{" "}/ {sectionLabel}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("moreExpertAdvices")}</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scrollByCard(-1)} disabled={!canScrollLeft} aria-label="Scroll left"
            className="w-9 h-9 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => scrollByCard(1)} disabled={!canScrollRight} aria-label="Scroll right"
            className="w-9 h-9 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <div key={item.id} data-card onClick={() => navigateToDetail(item)}
            className="relative h-72 shrink-0 overflow-hidden cursor-pointer group"
            style={{ flexBasis: "calc((100% - 48px) / 3)" }}>
            <img
              src={getBlogImage(item) ? `${MEDIA_URL}${getBlogImage(item)}` : "/cat.png"}
              alt={getBlogField(item, "name", isFr)}
              className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-transform duration-300"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              <p className="text-xs text-white/80 mb-1">{t("pets")}</p>
              <p className="text-base font-bold text-white leading-snug line-clamp-2">{getBlogField(item, "name", isFr)}</p>
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

  const [blog, setBlog] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [addingBundleId, setAddingBundleId] = useState(null);
  // const [addingAll, setAddingAll] = useState(false); // Add all — commented out
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!seoKeyword) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${BASE_URL}/blog/detail`,
          { ...getAuthBody(), seo_keyboard: decodeURIComponent(seoKeyword) },
          { headers: { ...getAuthHeaders() } }
        );
        if (!res.data.status) {
          toast.error(res.data.action || "Something went wrong.");
          return;
        }
        setBlog(res.data.data?.blog ?? null);
        setBundles(res.data.data?.bundles ?? []);
        setRelatedBlogs(res.data.data?.relatedBlogs ?? []);
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [seoKeyword]);

  const hasProducts = bundles.length > 0;
  const youtubeLink = isFr ? (blog?.french_youtube_link || blog?.youtube_link) : (blog?.youtube_link || blog?.french_youtube_link);
  const youtubeId = getYoutubeId(youtubeLink);

  const getSelectedProduct = (bundle) => {
    const products = bundle.products || [];
    return products.find((p) => p.id === selectedSizes[bundle.id]) || products[0];
  };

  const addProductToCart = async (productId) => {
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const res = await axios.post(
      `${BASE_URL}/user/cart/create`,
      token ? { product_id: productId, quantity: 1 } : { device_id: getDeviceId(), product_id: productId, quantity: 1 },
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    if (res.data.status === false) {
      throw new Error(res.data.action || "Could not add to cart.");
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
      toast.error(err.message || "Something went wrong.");
    } finally {
      setAddingBundleId(null);
    }
  };

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
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
              <div className="h-3 bg-gray-200 animate-pulse rounded w-40 mb-6" />
              <div className="h-9 sm:h-10 lg:h-11 bg-gray-200 animate-pulse rounded w-full mb-3" />
              <div className="h-9 sm:h-10 lg:h-11 bg-gray-200 animate-pulse rounded w-2/3 mb-6" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full max-w-md mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6 max-w-md mb-8" />
              <div className="flex items-center gap-5 sm:gap-8 flex-wrap">
                <div className="h-3 bg-gray-200 animate-pulse rounded w-28" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-20" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-36" />
              </div>
            </div>
            <div className="relative w-full lg:w-1/2 h-[420px] bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* Article body + sidebar skeleton — same container padding + column split as the real layout */}
        <div className="px-6 sm:px-8 md:px-10 lg:px-14 xl:px-16 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            <div className="w-full lg:w-2/3 space-y-4">
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

            <div className="w-full lg:w-1/3 max-w-md mx-auto lg:mx-0">
              <div className="border border-gray-200 p-4 sm:p-6">
                <div className="h-3 bg-gray-100 animate-pulse rounded w-28 mb-2" />
                <div className="h-6 bg-gray-100 animate-pulse rounded w-44 mb-4" />
                <hr className="border-gray-200 mb-4" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-b-0">
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
            <div className="w-full max-w-5xl mx-auto aspect-video bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* More advices skeleton — includes the left/right scroll-arrow placeholders the real header has */}
        <section className="bg-[#fbf9f7] py-12 md:py-16">
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
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-72 bg-gray-200 animate-pulse shrink-0" style={{ flexBasis: "calc((100% - 48px) / 3)" }}>
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
            <p className="text-xs text-gray-400 mb-6">
              <Link href="/" className="hover:text-gray-600 transition-colors">{t("home")}</Link>{" "}/{" "}
              <Link href="/advices" className="hover:text-gray-600 transition-colors">{t("advice")}</Link>{" "}/ {sectionLabel}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight mb-6">
              {getBlogField(blog, "name", isFr)}
            </h1>
            {getBlogField(blog, "short_description", isFr) && (
              <p className="text-sm text-gray-700 leading-relaxed max-w-md mb-8">
                {getBlogField(blog, "short_description", isFr)}
              </p>
            )}
            <div className="flex items-center gap-5 sm:gap-8 text-xs text-gray-700 font-medium flex-wrap">
             <span>{t("byAuthor", { name: blog?.company_name || "Biogance" })}</span>
<span>{t("minRead", { time: blog?.reading_time || "0" })}</span>
              {blog?.updated_at && (
                <span>{t("updatedOn", { date: new Date(blog.updated_at).toLocaleDateString(isFr ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) })}</span>
              )}
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 h-[420px]">
            <img
              src={getBlogImage(blog) ? `${MEDIA_URL}${getBlogImage(blog)}` : "/cat.png"}
              alt={getBlogField(blog, "name", isFr)}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

    {/* Article body + product recommendation */}
<div className="px-6 sm:px-8 md:px-10 lg:px-14 xl:px-16 py-12 md:py-16">
  {hasProducts ? (
    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
      {/* Left: article content */}
      <div className="w-full lg:w-2/3">
        {getBlogField(blog, "long_description", isFr) ? (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: getBlogField(blog, "long_description", isFr) }}
          />
        ) : (
          <p className="text-sm text-gray-500">{t("noContent")}</p>
        )}
      </div>

      {/* Right: recommended products */}
      <div className="w-full lg:w-1/3 max-w-md mx-auto lg:mx-0">
        <div className="sticky top-[130px] bottom-[130px] border border-gray-200 p-4 sm:p-6">
          <p className="text-xs text-gray-400 mb-2">{t("recommendedRoutine")}</p>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{t("recommendedProducts")}</h3>
          <hr className="border-gray-200 mb-4" />
          {bundles.map((bundle) => {
            const products = bundle.products || [];
            const uniqueSizes = [...new Set(products.filter((p) => p.size_name).map((p) => p.size_name))];
            const hasSizes = uniqueSizes.length > 1;
            const singleSize = uniqueSizes.length === 1 ? uniqueSizes[0] : null;
            const product = getSelectedProduct(bundle);
            const productImg = product?.images?.[0]?.media ?? null;
            const productName = isFr ? (bundle.french_name || bundle.name) : bundle.name;
            const productLabel = isFr ? (bundle.french_product_label || bundle.product_label) : bundle.product_label;
            const isAdding = addingBundleId === bundle.id;
            return (
              <div key={bundle.id} className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-[#f3f3f3] shrink-0 flex items-center justify-center overflow-hidden">
                  {productImg ? (
                    <img src={`${MEDIA_URL}${productImg}`} alt={productName} className="w-full h-full object-cover" />
                  ) : (
                    <LuPackage className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2">{productName}</p>
                    {product?.price && <p className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">€{product.price}</p>}
                  </div>
                  {productLabel && (
                    <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mb-2 line-clamp-1">{productLabel}</p>
                  )}
                  {hasSizes && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {uniqueSizes.map((size) => {
                        const sizeProduct = products.find((p) => p.size_name === size);
                        const isSelected = product?.size_name === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [bundle.id]: sizeProduct?.id }))}
                            className={`px-2 py-1 text-[10px] sm:text-xs font-medium border transition-colors cursor-pointer ${
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
                  {singleSize && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-[10px] sm:text-xs font-medium border border-gray-900 bg-gray-900 text-white">
                        {singleSize}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(bundle)}
                    disabled={isAdding}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white text-xs sm:text-sm font-semibold py-2.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAdding ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t("addToCart")
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    /* No products: plain centered content, no flex wrapper involved */
    <div className="max-w-3xl mx-auto">
      {getBlogField(blog, "long_description", isFr) ? (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: getBlogField(blog, "long_description", isFr) }}
        />
      ) : (
        <p className="text-sm text-gray-500">{t("noContent")}</p>
      )}
    </div>
  )}
</div>

      {/* YouTube video */}
      {youtubeId && (
        <section className="bg-white py-12 md:py-16">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="relative w-full max-w-5xl mx-auto aspect-video bg-gray-900  overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=1&rel=0`}
                title="Blog Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* More expert advices */}
      <MoreAdvicesRow items={relatedBlogs} isFr={isFr} sectionLabel={sectionLabel} />

      <Footer />

      <ModalAddToCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default ExpertArticleDetail;
