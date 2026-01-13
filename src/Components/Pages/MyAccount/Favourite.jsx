"use client"

import PopularProducts from "../Landing/LandingCards"
import { 
  MdOutlineKeyboardArrowLeft, 
  MdOutlineKeyboardArrowRight, 
  MdOutlineKeyboardDoubleArrowLeft, 
  MdOutlineKeyboardDoubleArrowRight 
} from 'react-icons/md';

export default function Favourite() {
  // Change this value to test different states
  const hasFavourites = true;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Header - always visible */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            <p className="text-sm text-gray-600 mt-1">
              Products you've saved for later
            </p>
          </div>

          {/* Main content - conditional */}
          {hasFavourites ? (
            <div className="min-h-[400px]">
              <PopularProducts isFavourite={true} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              {/* Illustration */}
              <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                <img
                  src="/favacc.svg"
                  alt="Empty wishlist illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Texts */}
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                Your Wishlist is Empty
              </h3>

              <p className="text-gray-500 text-base text-center max-w-md mb-8 leading-relaxed">
                Save your favorite products here to easily find them later.
              </p>

              {/* Button */}
              <button
                className="
                  bg-gray-900 text-white
                  px-8 py-3.5 rounded-lg
                  text-base font-medium
                  hover:bg-gray-800
                  transition-colors duration-200
                  shadow-sm cursor-pointer
                "
              >
                Browse Products
              </button>
            </div>
          )}

          {/* Pagination - only shown when there are items */}
          {hasFavourites && (
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
          )}
        </div>

      
             
      </div>
         <div className="min-h-screen bg-gray-100">
      <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Header - always visible */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-900">You Might also Like</h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on your wishlist items
            </p>
          </div>
          {/* <div className="min-h-[400px]"><PopularProducts isHorizontal={true} /></div> */}
          <div className="min-h-[400px]"></div>
           </div>
            </div>
            </div>
    </div>
  )
}