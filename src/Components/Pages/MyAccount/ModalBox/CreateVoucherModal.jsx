"use client"
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaRegEdit } from "react-icons/fa";
import { FiChevronDown, FiAlertCircle } from "react-icons/fi"
import { BASE_URL } from "../../../API/API";

export default function CreateVoucherModal({ isOpen, onClose, loyaltyPoints = 0, onRedeemSuccess }) {
    const { t } = useTranslation("myaccount");
    const [selectedPoints, setSelectedPoints] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [redeemedPoints, setRedeemedPoints] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [redeemError, setRedeemError] = useState(null);

    const minimumPoints = 10;
    const userBalance = loyaltyPoints;
    const maxOptions = Math.floor(loyaltyPoints / 10);

    // Generate dropdown: 10, 20, 30 ... maxOptions (not *10)
    const pointsOptions = Array.from({ length: maxOptions }, (_, i) => {
      const pts = (i + 1);
      return { value: String(pts), label: t('createVoucher.pointsOption', { points: pts }) };
    });

    const handleRedeem = async () => {
        if (!selectedPoints || parseInt(selectedPoints) > userBalance || parseInt(selectedPoints) < minimumPoints) return;
        setRedeemLoading(true);
        setRedeemError(null);
        try {
            const token = JSON.parse(localStorage.getItem('splashData') || '{}')?.user?.token;
            const res = await fetch(`${BASE_URL}/user/voucher/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ point: parseInt(selectedPoints) }),
            });
            const data = await res.json();
            if (!data.status) {
                setRedeemError(data.message || "Something went wrong.");
                setRedeemLoading(false);
                return;
            }
            const points = parseInt(selectedPoints);
            setRedeemedPoints(points);
            setDiscountAmount(points / 10);
            setVoucherCode(data.data?.name || data.data?.code || '');
            setIsSuccessModalOpen(true);
            onRedeemSuccess?.();
        } catch {
            setRedeemError("Something went wrong.");
        }
        setRedeemLoading(false);
    };

    const handleSelectOption = (value) => {
        setSelectedPoints(value);
        setIsDropdownOpen(false);
        setRedeemError(null);
    };

    const copyVoucherCode = () => {
        navigator.clipboard.writeText(voucherCode);
    };

    const handleCloseAll = () => {
        setIsSuccessModalOpen(false);
        setSelectedPoints('');
        setRedeemError(null);
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
                className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[1100] overflow-hidden"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
              <div className="bg-white  shadow-2xl w-full max-w-2xl p-8 ">
                <h2 className="text-xl text-black font-semibold mb-3">{t('createVoucher.title')}</h2>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-1">
                    {t('createVoucher.description1')}
                  </p>
                  <p className="text-gray-700">
                    {t('createVoucher.description2')}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createVoucher.pointsToRedeem')}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full px-4 py-3 border  cursor-pointer focus:outline-none text-left flex items-center justify-between ${
                        showError 
                          ? 'bg-red-50 border-red-300 focus:ring-2 focus:ring-red-400' 
                          : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-gray-400'
                      }`}
                    >
                      <span className={selectedPoints ? 'text-gray-700' : 'text-gray-400'}>
                        {selectedPoints ? t('createVoucher.pointsOption', { points: selectedPoints }) : t('createVoucher.selectPoints')}
                      </span>
                      <FiChevronDown className={`text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    
                    {isDropdownOpen && (
  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 shadow-lg z-10 max-h-60 overflow-y-auto">
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
                      <span>{t('createVoucher.notEnoughPoints')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm mb-8">
                  <span className="text-gray-600">{t('createVoucher.minimumRedeemable', { points: minimumPoints })}</span>
                  <span className="text-gray-900">
                    {t('createVoucher.yourBalance')}: <span className="font-semibold">{t('createVoucher.balancePoints', { points: userBalance })}</span>
                  </span>
                </div>

                {redeemError && (
                  <div className="flex items-center gap-2 mb-4 text-red-600 text-sm">
                    <FiAlertCircle size={16} />
                    <span>{redeemError}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 cursor-pointer bg-white border border-gray-300 text-gray-900  font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('createVoucher.cancel')}
                  </button>
                  <button
                    onClick={handleRedeem}
                    disabled={!selectedPoints || parseInt(selectedPoints) < minimumPoints || !hasEnoughPoints || redeemLoading}
                    className="flex-1 px-6 py-3 cursor-pointer bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {redeemLoading ? (
                      <>
                        <style>{`@keyframes redeemSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                        <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "redeemSpin 0.6s linear infinite" }} />
                        {t('createVoucher.redeeming') || 'Redeeming...'}
                      </>
                    ) : t('createVoucher.redeem')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {isSuccessModalOpen && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[1100] overflow-hidden">
              <div className="bg-white  shadow-2xl w-full max-w-xl p-8">
                {/* Success Illustration */}
                <div className="flex justify-center mb-6">
                    <img src="success.svg" alt="" />
                </div>
                
                {/* Success Message */}
                <h2 className="text-xl text-black font-semibold text-center mb-3">
                  {t('createVoucher.success.title')}
                </h2>
                
                <p className="text-center text-gray-700 mb-6">
                  {t('createVoucher.success.description1')}{' '}
                  <span className="text-[#DFB400] font-semibold">{t('createVoucher.success.redeemedPoints', { points: redeemedPoints })}</span> {t('createVoucher.success.for')}{' '}
                  <span className="text-[#DFB400] font-semibold">{t('createVoucher.success.discount', { amount: discountAmount })}</span>.
                  <br />
                  {t('createVoucher.success.description2')}
                </p>
                
                {/* Voucher Code */}
                <div className="mb-8">
                  <p className="text-center text-sm text-gray-600 mb-2">{t('createVoucher.success.voucherCode')}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-black font-semibold">{voucherCode}</span>
                    <button
                      onClick={copyVoucherCode}
                      className="p-1 hover:bg-gray-100 transition-colors"
                      title={t('createVoucher.success.copyCode')}
                    >
                      <FaRegEdit size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Okay Button */}
                <button
                  onClick={handleCloseAll}
                  className="w-full px-6 py-3 cursor-pointer bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  {t('createVoucher.success.okay')}
                </button>
              </div>
            </div>
          )}
        </>
    );
}