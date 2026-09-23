"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { IoTicketOutline, IoCopyOutline, IoArrowForward } from "react-icons/io5";
import toast from 'react-hot-toast';
import CreateVoucherModal from "./ModalBox/CreateVoucherModal";
import { BASE_URL } from '../../API/API';

// One shimmer block — every skeleton on this page is built from this,
// same pattern as Support.jsx / PetProfile.jsx.
const Bone = ({ w, h, className = "" }) => (
  <span
    className={`block bg-black/[0.06] ${className}`}
    style={{ width: w, height: h, animation: "loyaltyShimmer 1.5s ease-in-out infinite" }}
  />
);

// Mirrors the balance hero's shape (label + big number + description on
// the left, two buttons on the right) so it doesn't pop in once loaded.
const BalanceHeroShimmer = () => (
  <div className="bg-black/[0.03] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-10">
    <div>
      <Bone w="90px" h="11px" className="mb-3" />
      <Bone w="120px" h="38px" className="mb-3" />
      <Bone w="220px" h="14px" />
    </div>
    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
      <Bone w="150px" h="44px" />
      <Bone w="150px" h="44px" />
    </div>
  </div>
);

// Mirrors VoucherCard's stub + content shape so the loading state doesn't
// jump around once real data lands.
const VoucherCardShimmer = () => (
  <div className="flex bg-white border border-black/10 overflow-hidden">
    <div className="w-24 sm:w-28 shrink-0 bg-black/[0.04] flex flex-col items-center justify-center gap-2 px-2 py-4">
      <Bone w="60%" h="9px" />
      <Bone w="70%" h="24px" />
    </div>
    <div className="flex-1 min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Bone w="110px" h="18px" />
        <Bone w="64px" h="22px" />
      </div>
      <div className="space-y-2.5 pt-3 border-t border-black/[0.06]">
        <Bone w="100%" h="13px" />
        <Bone w="100%" h="13px" />
        <Bone w="100%" h="13px" />
      </div>
    </div>
  </div>
);

// Dot + tint keyed by the status suffix — same visual language as the
// order-status badges on MyOrder.jsx.
const STATUS_STYLES = {
  active: { dot: 'bg-emerald-600', tint: 'bg-emerald-50' },
  used: { dot: 'bg-[#DFB400]', tint: 'bg-yellow-50' },
  expired: { dot: 'bg-red-600', tint: 'bg-red-50' },
  disabled: { dot: 'bg-gray-400', tint: 'bg-gray-50' },
};
const getStatusStyle = (statusKey) => {
  const key = Object.keys(STATUS_STYLES).find((k) => statusKey.includes(k));
  return STATUS_STYLES[key] || STATUS_STYLES.disabled;
};

// A coupon-shaped card — a dark stub carrying the discount value (with
// punch-hole notches and a dashed tear line, like a physical voucher),
// then the code, status and detail rows alongside it.
function VoucherCard({ voucher, t, onCopy }) {
  const isDisabled = voucher.statusKey === 'loyalty.status.disabled';
  const style = getStatusStyle(voucher.statusKey);

  return (
    <div
      className={`flex bg-white border border-black/10 overflow-hidden transition-shadow duration-300 ${
        isDisabled ? 'opacity-50' : 'hover:shadow-[0_30px_60px_-32px_rgba(0,0,0,.3)]'
      }`}
    >
      {/* Value stub */}
      <div className="relative w-24 sm:w-28 shrink-0 bg-[#0b0b0a] text-white flex flex-col items-center justify-center gap-1 px-2 py-4 text-center">
        <span className="text-[9.5px] font-semibold tracking-[0.14em] uppercase text-white/40">
          {t('loyalty.voucherDetails.value')}
        </span>
        <span className="text-[26px] font-extrabold leading-none">€{Number(voucher.value).toFixed(0)}</span>

        {/* Punch-hole notches + tear line, coloured to match the white card so they read as cut-outs */}
        <span className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-white" />
        <span className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-white" />
        <span className="absolute right-0 top-3 bottom-3 border-r-2 border-dashed border-white/15" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-[16px] text-[#0b0b0a] truncate">{voucher.code}</span>
            <button
              type="button"
              onClick={() => onCopy(voucher.code)}
              aria-label="Copy voucher code"
              className="shrink-0 text-[#8a8880] hover:text-[#0b0b0a] transition-colors cursor-pointer"
            >
              <IoCopyOutline size={15} />
            </button>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-[#0b0b0a] border border-black/10 shrink-0 ${style.tint}`}>
            <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${style.dot}`} />
            {t(voucher.statusKey)}
          </span>
        </div>

        <div className="space-y-1.5 text-[13px] pt-3 border-t border-black/[0.06]">
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8880]">{t('loyalty.voucherDetails.pointsRedeemed')}</span>
            <span className="font-medium text-[#0b0b0a]">{voucher.pointsRedeemed}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8880]">{t('loyalty.voucherDetails.dateCreated')}</span>
            <span className="font-medium text-[#0b0b0a]">{voucher.dateCreated}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8880]">{t('loyalty.voucherDetails.expiryDate')}</span>
            <span className="font-medium text-[#0b0b0a]">{voucher.expiryDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loyalty() {
    const router = useRouter();
    const { t } = useTranslation('myaccount');
    const { t: tSidebar } = useTranslation('sidebar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingState, setLoadingState] = useState('shimmer');
    const [vouchers, setVouchers] = useState([]);
    const [userBalance, setUserBalance] = useState(0);
    const isLoading = loadingState === 'shimmer';
    const hasPoints = userBalance > 0;

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Voucher code copied!');
    };

    const getStatusKey = (status) => {
      if (status === 0) return 'loyalty.status.disabled';
      if (status === 2) return 'loyalty.status.used';
      if (status === 3) return 'loyalty.status.expired';
      return 'loyalty.status.active'; // status === 1
    };

    const fetchVouchers = () => {
      const token = JSON.parse(localStorage.getItem('splashData') || '{}')?.user?.token;
      fetch(`${BASE_URL}/user/voucher/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.status === false) {
            toast.error(data?.action_message || data?.action || 'Something went wrong.');
          } else if (data?.status) {
            setUserBalance(data.data.loyalty_points);
            setVouchers(
              (data.data.vouchers?.data || []).map(v => ({
                code: v.name,
                value: v.off,
                pointsRedeemed: v.point,
                dateCreated: v.created_date,
                expiryDate: v.validity_date,
                statusKey: getStatusKey(v.status)
              }))
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoadingState('loaded'));
    };

    useEffect(() => {
      fetchVouchers();
    }, []);

    return(
        <>
         <style dangerouslySetInnerHTML={{__html: `
           @keyframes loyaltyShimmer { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
         `}} />

         <div className="bg-[#f3f3f3]">
          <div className="p-4 mt-2 md:mt-9 sm:p-6 md:p-8 max-w-10xl mx-auto">
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
                {tSidebar('groupAccount')}
              </p>
              <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
                {t('loyalty.title')}
              </h1>
              <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
                {t('loyalty.subtitle')}
              </p>
            </div>

            {/* Balance hero — one consistent action row across every state that has points */}
            {!isLoading && hasPoints && (
              <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] text-white p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-10">
                <IoTicketOutline className="pointer-events-none absolute -right-6 -top-10 w-44 h-44 text-white/[0.04] rotate-[15deg]" />

                <div className="relative">
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/40 mb-2">
                    {t('createVoucher.yourBalance')}
                  </p>
                  <div className="text-[34px] sm:text-[40px] font-extrabold leading-none tracking-tight">
                    {userBalance}
                  </div>
                  <p className="mt-2.5 text-[13.5px] text-white/50 max-w-sm">
                    {t('loyalty.hasPoints.pointsMessage', { points: userBalance })}
                  </p>
                </div>

                <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => router.push('/loyalty')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[13px] font-medium border border-white/20 text-white hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer whitespace-nowrap"
                  >
                    {t('loyalty.pointsDetails')}
                  </button>
                  <button
                    onClick={handleOpenModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[13px] font-medium bg-white text-[#0b0b0a] hover:bg-white/90 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                  >
                    {t('loyalty.createVoucher')}
                    <IoArrowForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <>
                <BalanceHeroShimmer />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <VoucherCardShimmer key={index} />
                  ))}
                </div>
              </>
            )}

            {/* No points at all */}
            {!isLoading && !hasPoints && (
              <div className="bg-white border border-black/10 flex flex-col items-center justify-center min-h-[40vh] py-12 px-4 text-center">
                <div className="w-48 h-48 md:w-64 md:h-64 mb-6 flex items-center justify-center">
                  <img src="/loyalty.svg" alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0b0b0a] mb-2">
                  {t('loyalty.noPoints.title')}
                </h3>
                <p className="text-[13.5px] text-[#8a8880] max-w-md mb-6 leading-relaxed">
                  {t('loyalty.noPoints.description')}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => router.push('/loyalty')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
                  >
                    {t('loyalty.pointsDetails')}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
                  >
                    {t('loyalty.noPoints.shopEarn')}
                  </button>
                </div>
              </div>
            )}

            {/* Has points, no vouchers yet */}
            {!isLoading && hasPoints && vouchers.length === 0 && (
              <div className="bg-white border border-black/10 flex flex-col items-center justify-center min-h-[40vh] py-12 px-4 text-center">
                <div className="w-48 h-48 md:w-64 md:h-64 mb-6 flex items-center justify-center">
                  <img src="/reward.svg" alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0b0b0a] mb-2">
                  {t('loyalty.hasPoints.noVouchers.title')}
                </h3>
                <p className="text-[13.5px] text-[#8a8880] max-w-md leading-relaxed">
                  {t('loyalty.hasPoints.noVouchers.description1')}
                </p>
                <p className="text-[13.5px] text-[#8a8880] max-w-md mb-6 leading-relaxed">
                  {t('loyalty.hasPoints.noVouchers.description2')}
                </p>
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
                >
                  {t('loyalty.createVoucher')}
                  <IoArrowForward className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Has points and vouchers */}
            {!isLoading && hasPoints && vouchers.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880] mb-4">
                  {t('loyalty.vouchersHistory')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {vouchers.map((voucher, index) => (
                    <VoucherCard key={index} voucher={voucher} t={t} onCopy={handleCopyCode} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Voucher Modal - External Component */}
        <CreateVoucherModal isOpen={isModalOpen} onClose={handleCloseModal} loyaltyPoints={userBalance} onRedeemSuccess={fetchVouchers} />
        </>
    )
}
