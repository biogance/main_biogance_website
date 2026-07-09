"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';
import { BASE_URL } from "../../../API/API";

export default function DeletePetModal({
  isOpen,
  onClose,
  onSuccess,
  petId,
  petName = "this pet",
}) {
  const { t } = useTranslation("myaccount");
  const [isDeleting, setIsDeleting] = useState(false);

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch { return ''; }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/user/pet/delete/${petId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data?.status === false) {
        toast.error(data?.action || 'Something went wrong.');
      } else {
        onSuccess?.();
      }
    } catch (e) {
      console.error('Delete pet error:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white  shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-7 text-center">
          <h2 className="text-2xl font-semibold text-black mb-4">
            {t("deletePet.title")}
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            {t("deletePet.confirmation", { petName })}
            <br />
            <span className="text-gray-500 font-medium">
              {t("deletePet.warning")}
            </span>
          </p>

          <div className="flex flex-col gap-4 justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`
                px-8 py-3.5  font-medium text-white
                bg-[#D00416] hover:bg-red-700 active:bg-red-800
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2
                active:scale-[0.98] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed
              `}
            >
              {isDeleting ? 'Deleting...' : t("deletePet.confirmButton")}
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
              {t("deletePet.cancelButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}