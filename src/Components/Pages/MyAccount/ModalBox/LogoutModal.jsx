"use client";

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "../../../../redux/features/authSlice";
import toast from 'react-hot-toast';
import { BASE_URL } from '../../../API/API';

export default function LogoutModal({
  isOpen,
  onClose,
})
{
  const { t } = useTranslation("myaccount");
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


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
        body: JSON.stringify({ device_id: 'web123' }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = data.errors?.length > 0 ? data.errors[0].message : data.title;
        toast.error(msg);
      } else {
        const rememberMe = localStorage.getItem('rememberMe');
        const deviceId = localStorage.getItem('device_id');
        localStorage.clear();
        if (rememberMe) localStorage.setItem('rememberMe', rememberMe);
        if (deviceId) localStorage.setItem('device_id', deviceId);
        dispatch(logout());
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-7 text-center">
          <h2 className="text-2xl font-semibold text-black mb-4">
            {t('logoutModal.title')}
          </h2>

          <p className="text-black text-md font-medium mb-8 leading-relaxed">
            {t('logoutModal.message')}
           
            <br />
            <span className="text-gray-500 font-medium">
              {t('logoutModal.warning')}
            </span>
          </p>

          <div className="flex flex-col gap-4 justify-center">
           

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className={`
                px-8 py-3.5  font-medium text-white
                bg-[#D00416] hover:bg-red-700 active:bg-red-800
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2
                active:scale-[0.98] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? 'Logging Out...' : t('logoutModal.confirmButton')}
            </button>
             <button
              type="button"
              onClick={onClose}
              className={`
                px-8 py-3.5  font-medium text-gray-800
                border border-gray-300 hover:bg-gray-100 active:bg-gray-300
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-gray-400/50
                active:scale-[0.98]
              `}
            >
              {t('logoutModal.cancelButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}