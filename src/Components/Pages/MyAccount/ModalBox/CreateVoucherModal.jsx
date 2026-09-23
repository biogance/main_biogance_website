"use client"
import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { IoClose, IoChevronDown, IoCheckmark, IoAlertCircleOutline, IoCopyOutline, IoTicketOutline } from "react-icons/io5";
import toast from 'react-hot-toast';
import { BASE_URL } from "../../../API/API";

// Custom points picker — same bordered-trigger + floating-panel pattern
// used by the other account modals, instead of a plain div-based list.
function PointsDropdown({ options, value, onSelect, placeholder, hasError }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border text-left text-[14px] transition-colors duration-200 cursor-pointer ${
          hasError ? 'border-red-400' : open ? 'border-black/30' : 'border-black/10 hover:border-black/25'
        }`}
      >
        <span className={selected ? 'text-[#0b0b0a] font-medium' : 'text-[#8a8880]'}>
          {selected ? selected.label : placeholder}
        </span>
        <IoChevronDown className={`w-4 h-4 shrink-0 text-[#8a8880] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)]">
            {options.length === 0 ? (
              <div className="px-4 py-3.5 text-[13px] text-[#8a8880]">—</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onSelect(opt.value); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 text-[13.5px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${
                      isSelected ? 'bg-black/[0.04] text-[#0b0b0a] font-semibold' : 'text-[#5c5a54]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <IoCheckmark className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CreateVoucherModal({ isOpen, onClose, loyaltyPoints = 0, onRedeemSuccess }) {
    const { t } = useTranslation("myaccount");
    const [selectedPoints, setSelectedPoints] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [redeemedPoints, setRedeemedPoints] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [redeemError, setRedeemError] = useState(null);
    const modalCardRef = useRef(null);
    // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
    // the exit animation's duration instead of unmounting the instant
    // isOpen flips.
    const [isClosing, setIsClosing] = useState(false);

    const minimumPoints = 10;
    const userBalance = loyaltyPoints;
    const maxOptions = Math.floor(loyaltyPoints / 10);

    // Generate dropdown: 10, 20, 30 ... up to (maxOptions * 10)
    const pointsOptions = Array.from({ length: maxOptions }, (_, i) => {
      const pts = (i + 1) * 10;
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
            if (data?.status === false) {
                setRedeemError(data?.action_message || data?.action || data.message || "Something went wrong.");
                toast.error(data?.action_message || data?.action || data.message || "Something went wrong.");
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

    const copyVoucherCode = () => {
        navigator.clipboard.writeText(voucherCode);
        toast.success('Voucher code copied!');
    };

    const handleBackdropClick = () => {
        if (modalCardRef.current) {
            modalCardRef.current.classList.add('modal-shake');
            modalCardRef.current.addEventListener('animationend', () => {
                modalCardRef.current?.classList.remove('modal-shake');
            }, { once: true });
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => { setIsClosing(false); onClose(); }, 250);
    };

    const handleCloseAll = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setIsSuccessModalOpen(false);
            setSelectedPoints('');
            setRedeemError(null);
            onClose();
        }, 250);
    };

    const hasEnoughPoints = selectedPoints && parseInt(selectedPoints) <= userBalance;
    const showError = selectedPoints && parseInt(selectedPoints) > userBalance;

     useEffect(() => {
        if (isOpen) {
          const scrollY = window.scrollY;
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = '100%';

          return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
          };
        }
      }, [isOpen]);

    if (!isOpen && !isClosing) return null;

    return (
        <>
          {/* Main Redeem Modal */}
          {!isSuccessModalOpen && (
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-[1200] ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
                onClick={handleBackdropClick}
            >
              <div
                ref={modalCardRef}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white w-full max-w-[520px] shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
              >
                {/* Dark editorial header band */}
                <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 sm:px-7 pt-6 sm:pt-7 pb-5 sm:pb-6 overflow-hidden">
                  <IoTicketOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />

                  <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
                  >
                    <IoClose size={18} />
                  </button>

                  <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
                    <IoTicketOutline className="w-5 h-5 text-white" />
                  </div>

                  <h2 className="text-[20px] sm:text-[22px] font-extrabold leading-[1.05] tracking-tight text-white mb-1.5 pr-12">
                    {t('createVoucher.title')}
                  </h2>
                  <p className="text-[13.5px] text-white/50 max-w-[380px] leading-relaxed">
                    {t('createVoucher.description1')} {t('createVoucher.description2')}
                  </p>
                </div>

                {/* Form */}
                <div className="px-6 sm:px-7 pt-6 pb-7">
                  <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                    {t('createVoucher.pointsToRedeem')}
                  </label>
                  <PointsDropdown
                    options={pointsOptions}
                    value={selectedPoints}
                    onSelect={(val) => { setSelectedPoints(val); setRedeemError(null); }}
                    placeholder={t('createVoucher.selectPoints')}
                    hasError={showError}
                  />

                  {showError && (
                    <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                      <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                      {t('createVoucher.notEnoughPoints')}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-3 text-[12.5px] mt-4 pt-4 border-t border-black/10">
                    <span className="text-[#8a8880]">{t('createVoucher.minimumRedeemable', { points: minimumPoints })}</span>
                    <span className="text-[#0b0b0a]">
                      {t('createVoucher.yourBalance')}: <span className="font-semibold">{t('createVoucher.balancePoints', { points: userBalance })}</span>
                    </span>
                  </div>

                  {redeemError && (
                    <div className="flex items-start gap-2 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[13px]">
                      <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" />
                      <span>{redeemError}</span>
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
                    >
                      {t('createVoucher.cancel')}
                    </button>
                    <button
                      onClick={handleRedeem}
                      disabled={!selectedPoints || parseInt(selectedPoints) < minimumPoints || !hasEnoughPoints || redeemLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
                    >
                      {redeemLoading && (
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      )}
                      {redeemLoading ? (t('createVoucher.redeeming') || 'Redeeming...') : t('createVoucher.redeem')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {isSuccessModalOpen && (
            <div className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-[1200] ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}>
              <div className={`bg-white w-full max-w-xl shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
                <div className="bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-8 pt-8 pb-7 flex flex-col items-center text-center">
                  <img src="success.svg" alt="" className="w-24 h-24 mb-5" />
                  <h2 className="text-[22px] font-extrabold leading-[1.05] tracking-tight text-white">
                    {t('createVoucher.success.title')}
                  </h2>
                </div>

                <div className="px-8 py-7">
                  <p className="text-center text-[14px] text-[#5c5a54] leading-relaxed mb-6">
                    {t('createVoucher.success.description1')}{' '}
                    <span className="text-[#DFB400] font-semibold">{t('createVoucher.success.redeemedPoints', { points: redeemedPoints })}</span> {t('createVoucher.success.for')}{' '}
                    <span className="text-[#DFB400] font-semibold">{t('createVoucher.success.discount', { amount: discountAmount })}</span>.
                    <br />
                    {t('createVoucher.success.description2')}
                  </p>

                  {/* Voucher code — call out the code the same way the pet-modal success screen calls out its reward */}
                  <div className="flex items-center justify-between gap-3 border border-black/10 bg-black/[0.02] px-5 py-4 mb-7">
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#8a8880] mb-1">
                        {t('createVoucher.success.voucherCode')}
                      </p>
                      <p className="text-[18px] font-extrabold tracking-[0.04em] text-[#0b0b0a] truncate">{voucherCode}</p>
                    </div>
                    <button
                      onClick={copyVoucherCode}
                      title={t('createVoucher.success.copyCode')}
                      aria-label={t('createVoucher.success.copyCode')}
                      className="flex items-center justify-center w-10 h-10 shrink-0 border border-black/10 text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white hover:border-[#0b0b0a] transition-colors duration-200 cursor-pointer"
                    >
                      <IoCopyOutline size={17} />
                    </button>
                  </div>

                  <button
                    onClick={handleCloseAll}
                    className="w-full py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
                  >
                    {t('createVoucher.success.okay')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
    );
}
