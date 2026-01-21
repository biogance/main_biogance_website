"use client"

import Image from "next/image";
import { useTranslation } from 'react-i18next';
import wishlistBg from "../../../../public/wishlist-img.jpg";
import wishlistCart from "../../../../public/Wishlist-emptyCart.svg";
import Navbar from "../Navbar";
import Link from "next/link";
import Footer from "../Footer";
import PopularProducts from "../Landing/LandingCards";

const mockWishlist = [
  // { id: "1", name: "Test Product A", price: 2499, image: "/images/prod1.jpg" },
  // { id: "2", name: "Test Product B", price: 3999, image: "/images/prod2.jpg" },
];

export default function WishlistPage() {
  const { t } = useTranslation('home');
  const wishlistItems = mockWishlist; 

  console.log("Current wishlistItems:", wishlistItems);
  console.log("wishlistItems length:", wishlistItems.length);
  console.log("Is wishlist empty?", wishlistItems.length === 0);

  const isEmpty = wishlistItems.length === 0;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Navbar />
      </div>

      <div className="bg-white min-h-screen pt-20"> 
        {/* Hero Section */}
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

        {/* Main Content Area */}
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {!isEmpty ? (
            // ───── EMPTY STATE ─────
            <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
              <Image
                src={wishlistCart}
                alt="Empty wishlist"
                className="mb-8 opacity-90"
              />
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
            <PopularProducts isWishlist={true} />
          )}
        </div>

        <Footer />
      </div>
    </>
  );  
}