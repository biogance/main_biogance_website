"use client"
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { FiChevronDown, FiAlertCircle, FiCopy } from "react-icons/fi"

export default function CreateVoucherModal({ isOpen, onClose }) {
    const [selectedPoints, setSelectedPoints] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [redeemedPoints, setRedeemedPoints] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    
    const minimumPoints = 10;
    const userBalance = 20;

    const pointsOptions = [
      { value: "10", label: "10 points" },
      { value: "20", label: "20 points" },
      { value: "50", label: "50 points" },
      { value: "100", label: "100 points" },
      { value: "200", label: "200 points" },
      { value: "220", label: "220 points" },
    ];

    const generateVoucherCode = () => {
        return 'VOUCHER' + Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const handleRedeem = () => {
        if (!selectedPoints || parseInt(selectedPoints) > userBalance || parseInt(selectedPoints) < minimumPoints) {
            return;
        }
        
        const points = parseInt(selectedPoints);
        const discount = points / 10; // 10 points = 1 euro
        
        setRedeemedPoints(points);
        setDiscountAmount(discount);
        setVoucherCode(generateVoucherCode());
        setIsSuccessModalOpen(true);
    };

    const handleSelectOption = (value) => {
        setSelectedPoints(value);
        setIsDropdownOpen(false);
    };

    const copyVoucherCode = () => {
        navigator.clipboard.writeText(voucherCode);
        // Optional: Add a toast notification here
    };

    const handleCloseAll = () => {
        setIsSuccessModalOpen(false);
        setSelectedPoints('');
        onClose();
    };

    const hasEnoughPoints = selectedPoints && parseInt(selectedPoints) <= userBalance;
    const showError = selectedPoints && parseInt(selectedPoints) > userBalance;


     useEffect(() => {
        if (isOpen) {
          // Save current scroll position
          const scrollY = window.scrollY;
          
          // Prevent scrolling
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = '100%';
          
          return () => {
            // Restore scrolling
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            
            // Restore scroll position
            window.scrollTo(0, scrollY);
          };
        }
      }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
          {/* Main Redeem Modal */}
          {!isSuccessModalOpen && (
            <div 
                className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50 overflow-hidden"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 ">
                <h2 className="text-xl text-black font-semibold mb-3">Create Voucher</h2>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-1">
                    Redeem your loyalty points to generate a discount voucher.
                  </p>
                  <p className="text-gray-700">
                    10 loyalty points = 1 euro. Use your points to save on your next order!
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to Redeem
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full px-4 py-3 border rounded-lg cursor-pointer focus:outline-none text-left flex items-center justify-between ${
                        showError 
                          ? 'bg-red-50 border-red-300 focus:ring-2 focus:ring-red-400' 
                          : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-gray-400'
                      }`}
                    >
                      <span className={selectedPoints ? 'text-gray-700' : 'text-gray-400'}>
                        {selectedPoints ? `${selectedPoints} points` : "Select Points"}
                      </span>
                      <FiChevronDown className={`text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden">
                        {pointsOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleSelectOption(option.value)}
                            className="px-4 py-3 cursor-pointer text-gray-700 hover:bg-black hover:text-white transition-colors"
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {showError && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <FiAlertCircle size={16} />
                      <span>*You don't have enough points to redeem</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm mb-8">
                  <span className="text-gray-600">Minimum redeemable: {minimumPoints} points</span>
                  <span className="text-gray-900">
                    Your balance: <span className="font-semibold">{userBalance} points</span>
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 cursor-pointer bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeem}
                    disabled={!selectedPoints || parseInt(selectedPoints) < minimumPoints || !hasEnoughPoints}
                    className="flex-1 px-6 py-3 cursor-pointer bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {isSuccessModalOpen && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50 overflow-hidden">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">
                {/* Success Illustration */}
                <div className="flex justify-center mb-6">
                 
                    <img src="success.svg" alt="" />
                  
                </div>
                
                {/* Success Message */}
                <h2 className="text-xl text-black font-semibold text-center mb-3">
                  Voucher Created Successfully!
                </h2>
                
                <p className="text-center text-gray-700 mb-6">
                  You've successfully redeemed{' '}
                  <span className="text-[#DFB400] font-semibold">{redeemedPoints} points</span> for a{' '}
                  <span className="text-[#DFB400] font-semibold">€{discountAmount} discount</span>.
                  <br />
                  Use this voucher at checkout to save on your next order.
                </p>
                
                {/* Voucher Code */}
                <div className="mb-8">
                  <p className="text-center text-sm text-gray-600 mb-2">Voucher Code</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-black font-semibold">{voucherCode}</span>
                    <button
                      onClick={copyVoucherCode}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy voucher code"
                    >
                      <FaRegEdit size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Okay Button */}
                <button
                  onClick={handleCloseAll}
                  className="w-full px-6 py-3 cursor-pointer bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Okay!
                </button>
              </div>
            </div>
          )}
        </>
    );
}