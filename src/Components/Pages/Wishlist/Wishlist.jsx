"use client"

import Image from "next/image";
import wishlist from "../../../../public/wishlist-img.jpg"
import wishlistCart from "../../../../public/Wishlist-emptyCart.svg"
import Navbar from "../Navbar";
import Link from "next/link";
import Footer from "../Footer";
import PopularProducts from "../Landing/LandingCards";



export default function WishlistPage() {
    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            <div className=" bg-white">
                {/* Hero Section */}
                <div className="relative h-[500px] w-full">
                    <div className="absolute inset-0">
                        <Image
                            src={wishlist}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <h1 className="text-white mb-3 sm:mb-4 tracking-wide text-center text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight">
                            WISHLIST
                        </h1>

                        <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                            <Link href="/" className="hover:underline">Home</Link>
                            <span>/</span>
                            <a className="underline">Wishlist</a>
                        </div>
                    </div>
                </div>

                {/* Empty Wishlist Section */}
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    {/* Shopping Basket Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <Image
                                src={wishlistCart}
                            />
                        </div>
                    </div>

                    {/* Text Content */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        This wishlist is empty.
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">
                        You don't have any products in the Wishlist yet.
                    </p>
                    <p className="text-gray-600 text-sm mb-8">
                        You will find a lot of interesting products on our "Shop" page.
                    </p>

                    {/* Browse Products Button */}
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium cursor-pointer">
                        Browse Products
                    </button>
                </div>
            </div>

            <PopularProducts isWishlist={true}/>

            <Footer />
        </>
    );
}