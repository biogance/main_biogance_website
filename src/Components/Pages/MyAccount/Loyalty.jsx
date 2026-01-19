"use client"

import { useState, useEffect } from "react";
import { FiExternalLink } from "react-icons/fi"
import CreateVoucherModal from "./ModalBox/CreateVoucherModal";
import { FaRegEdit } from "react-icons/fa";

// Shimmer Card Component for Voucher Items
const VoucherShimmer = () => (
  <div className="bg-gray-100 cursor-pointer rounded-xl p-4">
    {/* Header Section */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        {/* Voucher Code Shimmer */}
        <div
          style={{
            width: '120px',
            height: '28px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        {/* Edit Icon Placeholder */}
        <div className="w-4 h-4 bg-gray-200 rounded" />
      </div>
      {/* Status Badge Shimmer */}
      <div
        style={{
          width: '60px',
          height: '24px',
          borderRadius: '6px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>

    {/* Details Section */}
    <div className="space-y-2 text-sm">
      {/* Value Shimmer */}
      <div className="flex justify-between">
        <div
          style={{
            width: '100px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        <div
          style={{
            width: '50px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      {/* Points Shimmer */}
      <div className="flex justify-between">
        <div
          style={{
            width: '110px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        <div
          style={{
            width: '30px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      {/* Date Created Shimmer */}
      <div className="flex justify-between">
        <div
          style={{
            width: '90px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        <div
          style={{
            width: '80px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      {/* Expiry Date Shimmer */}
      <div className="flex justify-between">
        <div
          style={{
            width: '80px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        <div
          style={{
            width: '80px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
    </div>
  </div>
);

export default function Loyalty() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingState, setLoadingState] = useState('shimmer');
    const [vouchers, setVouchers] = useState([
     
       
      {
        code: 'SAVE10-XYZ123',
        value: 10.00,
        pointsRedeemed: 100,
        dateCreated: 'July 10, 2025',
        expiryDate: 'August 10, 2025',
        status: 'Active'
      },
      {
        code: 'SAVE20-ABC456',
        value: 20.00,
        pointsRedeemed: 200,
        dateCreated: 'August 1, 2025',
        expiryDate: 'September 1, 2025',
        status: 'Active'
      },
      {
        code: 'SAVE15-DEF789',
        value: 15.00,
        pointsRedeemed: 150,
        dateCreated: 'June 15, 2025',
        expiryDate: 'July 15, 2025',
        status: 'Used'
      },
      {
        code: 'SAVE25-GHI101',
        value: 25.00,
        pointsRedeemed: 250,
        dateCreated: 'September 5, 2025',
        expiryDate: 'October 5, 2025',
        status: 'Active'
      },
      {
        code: 'SAVE5-JKL202',
        value: 5.00,
        pointsRedeemed: 50,
        dateCreated: 'May 20, 2025',
        expiryDate: 'June 20, 2025',
        status: 'Expired'
      }
      
    ]);
    
    const userBalance = 220;
    const hasPoints = userBalance > 0;

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
      console.log('Loading state:', loadingState);
      // Simulate loading for 3 seconds
      const timer = setTimeout(() => {
        setLoadingState('loaded');
        console.log('Loading state changed to loaded');
      }, 3000);

      return () => clearTimeout(timer);
    }, [loadingState]);

    const getStatusBadgeColor = (status) => {
      switch (status) {
        case 'Active':
          return 'bg-[#1FC16B]';
        case 'Used':
          return 'bg-[#DFB400]';
        case 'Expired':
          return 'bg-[#D00416]';
        default:
          return 'bg-gray-500';
      }
    };

    return(
        <>
         <style dangerouslySetInnerHTML={{__html: `
           @keyframes shimmer {
             0% {
               background-position: -200px 0;
             }
             100% {
               background-position: calc(200px + 100%) 0;
             }
           }
         `}} />
         <div className="min-h-screen bg-gray-100">
          <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              {/* Header - always visible */}
              <div className="mb-6 md:mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Loyalty & Rewards</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your points and redeem rewards
                  </p>
                </div>
                {hasPoints && vouchers.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button className="bg-white text-black border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                      Loyalty Points Details
                    </button>
                    <button
                      onClick={handleOpenModal}
                      className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
                    >
                      Create Voucher
                    </button>
                  </div>
                )}
              </div>

              {/* Conditional Rendering: No Points State */}
              {!hasPoints && (
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                    <img
                      src="/loyalty.svg"
                      alt="No points illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    You don't have any points yet.
                  </h3>

                  <p className="text-gray-500 text-base text-center max-w-2xl mb-8 leading-relaxed">
                    Start shopping with Biogance and earn rewards every time you make a purchase.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    <button
                      className="bg-white text-black border border-black px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm cursor-pointer"
                    >
                      Loyalty Points Details
                    </button>
                    <button
                      className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm cursor-pointer"
                    >
                      Shop & Earn
                    </button>
                  </div>
                </div>
              )}

              {/* Conditional Rendering: Has Points but No Vouchers */}
              {hasPoints && vouchers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <div className="bg-[#FFFBEC] w-full text-center p-4 border-dotted border-2 rounded-lg border-yellow-500 mb-8">
                    <p className="text-black">You've <span className="text-[#DFB400] font-semibold">{userBalance} points</span> so far! 🎉</p>
                  </div>

                  <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                    <img
                      src="/reward.svg"
                      alt="No vouchers illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    No Vouchers yet.
                  </h3>

                  <p className="text-gray-500 text-base text-center max-w-2xl leading-relaxed">
                    You haven't created any vouchers from your loyalty points.
                  </p>
                  <p className="text-gray-500 text-base text-center max-w-2xl mb-8 leading-relaxed">
                    Turn your points into discount codes and save on your next order!
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    <button
                      className="bg-white text-black border border-black px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm cursor-pointer"
                    >
                      Loyalty Points Details
                    </button>
                    <button
                      onClick={handleOpenModal}
                      className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm cursor-pointer"
                    >
                      Create Voucher
                    </button>
                  </div>
                </div>
              )}

              {/* Conditional Rendering: Has Points and Vouchers */}
              {hasPoints && vouchers.length > 0 && (
                <>
                  {/* Points Banner */}
                  <div className="bg-[#FFFBEC] w-full text-center border-2 border-dotted border-yellow-500 p-4 rounded-lg mb-8">
                    <p className="text-black">You've <span className="text-[#DFB400] font-semibold">{userBalance} points</span> so far! 🎉</p>
                  </div>

                  {/* Vouchers History */}
                  <div>
                    <h3 className="text-xl text-black font-semibold mb-6">Your Vouchers History</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {loadingState === 'shimmer' ? (
                        // Show shimmer voucher items
                        Array.from({ length: vouchers.length }).map((_, index) => (
                          <VoucherShimmer key={index} />
                        ))
                      ) : (
                        // Show actual vouchers
                        vouchers.map((voucher, index) => (
                          <div key={index} className="bg-gray-100 cursor-pointer rounded-xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-gray-900">{voucher.code}</span>
                                <FaRegEdit className="text-black" size={16} />
                              </div>
                              <span className={`px-3 py-1 ${getStatusBadgeColor(voucher.status)} text-white text-sm rounded-md font-medium`}>
                                {voucher.status}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Value of Voucher:</span>
                                <span className="font-medium text-gray-900">€{voucher.value.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Points Redeemed:</span>
                                <span className="font-medium text-gray-900">{voucher.pointsRedeemed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Date Created:</span>
                                <span className="font-medium text-gray-900">{voucher.dateCreated}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Expiry Date:</span>
                                <span className="font-medium text-gray-900">{voucher.expiryDate}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Create Voucher Modal - External Component */}
        <CreateVoucherModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    )
}