"use client";

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { IoClose, IoLogOutOutline, IoAlertCircleOutline } from "react-icons/io5";
import { logout } from "../../../../redux/features/authSlice";
import toast from 'react-hot-toast';
import { BASE_URL } from '../../../API/API';
import { getDeviceId } from '../../../../utils/deviceId';
import { saveCartData } from '../../../../utils/cartStorage';

export default function LogoutModal({
  isOpen,
  onClose,
})
{
  const { t } = useTranslation("myaccount");
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Same open/close lifecycle as Login.jsx — stays mounted for the exit
  // animation's duration instead of unmounting the instant isOpen flips.
  const [isClosing, setIsClosing] = useState(false);


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
  if (!isOpen && !isClosing) return null;

  // Plays the pop-out/backdrop-out animation, then unmounts — same 250ms
  // pattern as Login.jsx's handleClose. handleLogout's own success path
  // still calls onClose() directly (no animation), matching how Login.jsx's
  // successful-login path also skips it: the user's already being taken
  // elsewhere, so the extra delay would just be lag.
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 250);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const loginData = JSON.parse(localStorage.getItem('LoginData') || '{}');
      const token = loginData?.data?.token || loginData?.token || '';
      const res = await fetch(`${BASE_URL}/user/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ device_id: getDeviceId() }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.title;
        toast.error(msg);
      } else {
        // Logout se pehle guest cart/list fetch karo
        let normalizedCart = null;
        try {
          const cartRes = await fetch(`${BASE_URL}/user/cart/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_id: getDeviceId() }),
          });
          const cartData = await cartRes.json();
          if (cartData.status) {
            normalizedCart = {
              ...cartData.data,
              cartItem: (cartData.data.cartItem || cartData.data.cartItems || []).filter(Boolean),
            };
          }
        } catch { /* silent */ }
        const rememberMe = localStorage.getItem('rememberMe');
        const deviceId = localStorage.getItem('device_id');
        localStorage.clear();
        if (rememberMe) localStorage.setItem('rememberMe', rememberMe);
        if (deviceId) localStorage.setItem('device_id', deviceId);
        if (normalizedCart) saveCartData(normalizedCart);
        dispatch(logout());
        window.dispatchEvent(new Event('logoutStateChange'));
        router.push('/');
        onClose();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleClose}
    >
      <div className={`w-full max-w-md ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
        <div
          className="bg-white shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dark editorial header band — same shape as the other confirmation modals */}
          <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 py-5 flex items-center gap-3 border-b border-white/5 overflow-hidden">
            <IoLogOutOutline className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 text-white/[0.05] rotate-[12deg]" />
            <div className="relative w-9 h-9 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
              <IoLogOutOutline className="w-4 h-4 text-white" />
            </div>
            <h2 className="relative text-[17px] font-extrabold leading-tight tracking-tight text-white">
              {t('logoutModal.title')}
            </h2>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center w-8 h-8 border border-white/15 text-white/60 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
            >
              <IoClose size={16} />
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-start gap-3 p-4 bg-black/[0.02] border border-black/10 mb-6">
              <IoAlertCircleOutline className="w-5 h-5 text-[#8a8880] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13.5px] font-semibold text-[#0b0b0a] mb-0.5">
                  {t('logoutModal.message')}
                </p>
                <p className="text-[12.5px] text-[#8a8880] leading-relaxed">
                  {t('logoutModal.warning')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
              >
                {isLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? 'Logging Out...' : t('logoutModal.confirmButton')}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
              >
                {t('logoutModal.cancelButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}