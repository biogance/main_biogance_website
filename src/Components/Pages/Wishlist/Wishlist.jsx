"use client"

import Image from "next/image";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import wishlistBg from "../../../../public/wishlist-img.jpg";
import wishlistCart from "../../../../public/Wishlist-emptyCart.svg";
import Navbar from "../Navbar";
import Link from "next/link";
import Footer from "../Footer";
import PopularProducts from "../Landing/LandingCards";
import LandingExpertAdvice from "../Landing/LandingExpertAdvice";
import { BASE_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';

function getAuthHeaders() {
  try {
    const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
    if (loginData?.data?.token) return { Authorization: `Bearer ${loginData.data.token}` };
  } catch {}
  return {};
}

function getAuthBody() {
  try {
    const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
    if (loginData?.data?.token) return {};
  } catch {}
  return { device_id: getDeviceId() };
}

export default function WishlistPage() {
  const { t } = useTranslation('home');
  const [activeTab, setActiveTab] = useState('favorite');
  const [wishlistItems, setWishlistItems] = useState(null);
  const [adviceItems, setAdviceItems] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const payload = { type: 'favorites', ...getAuthBody() };
        const res = await axios.post(`${BASE_URL}/product/list`, payload, { headers: getAuthHeaders() });
        if (res.data.status === false) {
          const msg = res.data.errors?.length > 0 ? res.data.errors[0].message : res.data.action;
          toast.error(msg);
          setWishlistItems([]);
        } else {
          setWishlistItems(res.data.data?.data || []);
        }
      } catch (err) {
        toast.error('Something went wrong. Please try again.');
        setWishlistItems([]);
      }
    };
    fetchFavorites();
  }, []);

  const fetchFavoriteAdvice = async () => {
    if (adviceItems !== null) return;
    try {
      const payload = { ...getAuthBody() };
      const res = await axios.post(`${BASE_URL}/blog/list/favorites`, payload, { headers: getAuthHeaders() });
      if (res.data.status === false) {
        const msg = res.data.errors?.length > 0 ? res.data.errors[0].message : res.data.action;
        toast.error(msg);
        setAdviceItems([]);
      } else {
        setAdviceItems(res.data.data?.data || res.data.data || []);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setAdviceItems([]);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'advice') fetchFavoriteAdvice();
  };

  const isLoading = wishlistItems === null;
  const isEmpty = !isLoading && wishlistItems.length === 0;

  const dummyShimmerItems = Array.from({ length: 6 }).map((_, i) => ({
    id: `shimmer-${i}`,
    name: '',
    french_name: '',
    price: '0',
    discount: '',
    image: '',
    images: [],
    videoUrl: null,
    liked: false,
  }));

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Navbar />
      </div>

      <div className="bg-white min-h-screen">

        {/* ── Hero Section ── */}
        <div className="relative h-[400px] sm:h-[500px] w-full">
          <div className="absolute inset-0">
            <Image
              src={wishlistBg}
              alt="Wishlist background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide">
              {t('wishlist.title')}
            </h1>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Link href="/" className="hover:underline">
                {t('wishlist.breadcrumb.home')}
              </Link>
              <span>/</span>
              <span className="underline">
                {t('wishlist.breadcrumb.wishlist')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Tabs header - hamesha show hoga */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {t('products.wishlistTitle')}
            </h1>
          </div>
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => handleTabSwitch('favorite')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'favorite' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {t('products.favoriteProducts')}
            </button>
            <button
              onClick={() => handleTabSwitch('advice')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'advice' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {t('products.favoriteAdvices')}
            </button>
          </div>
        </div>

        {activeTab === 'favorite' ? (
          isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
              <Image src={wishlistCart} alt="Empty wishlist" className="mb-8 opacity-90" />
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                {t('wishlist.empty.heading')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-2 max-w-md">
                {t('wishlist.empty.description')}
              </p>
              <p className="text-gray-500 text-sm md:text-base mb-10 max-w-md">
                {t('wishlist.empty.subDescription')}
              </p>
              <Link href="/shop" className="inline-block">
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium transition-colors shadow-sm hover:shadow">
                  {t('wishlist.empty.browseButton')}
                </button>
              </Link>
            </div>
          ) : (
            <PopularProducts
              isFavourite={true}
              onTabChange={handleTabSwitch}
              data={{ popular: isLoading ? dummyShimmerItems : wishlistItems }}
            />
          )
        ) : (
          <LandingExpertAdvice hideHeader={true} data={adviceItems === null ? null : { expert_advice: adviceItems }} />
        )}

        </div>

        <Footer />
      </div>
    </>
  );
}