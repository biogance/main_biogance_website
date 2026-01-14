"use client"

export default function Address() {
    return(
        <>
         <div className="min-h-screen bg-gray-100">
      <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Header - always visible */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Address</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your addresses for faster checkout.
            </p>
          </div>
           <div className="flex flex-col items-center justify-center py-12 md:py-20">
              {/* Illustration */}
              <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                <img
                  src="/address.svg"
                  alt="Empty wishlist illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Texts */}
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                You Haven't Added an Address
              </h3>

              <p className="text-gray-500 text-base text-center max-w-xl mb-8 leading-relaxed">
                You haven't saved any shipping or billing addresses yet. Add one now to speed up checkout and manage your orders more easily.
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
                Add Your First Address
              </button>
            </div>
           </div>
            </div>
             </div>
        </>
    )}