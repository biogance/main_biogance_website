"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose, IoWarningOutline, IoPersonRemoveOutline } from "react-icons/io5";

export default function DeleteMyAccount({ isOpen, onClose, onFeedback }) {
  const { t } = useTranslation("myaccount");
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant
  // isOpen flips.
  const [isClosing, setIsClosing] = useState(false);

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

  if (!isOpen && !isClosing) return null;

  // Closes this modal (with the exit animation) and then, once it's fully
  // out, runs `after` — e.g. opening the feedback modal that follows it.
  const handleClose = (after) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      after?.();
    }, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={() => handleClose()}
    >
      <div
        className={`w-full max-w-md bg-white shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark header */}
        <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 py-5 flex items-center gap-3 border-b border-white/5 overflow-hidden">
          <IoPersonRemoveOutline className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 text-white/[0.05]" />
          <div className="relative w-9 h-9 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
            <IoPersonRemoveOutline className="w-4 h-4 text-white" />
          </div>
          <div className="relative min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/40">
                {t("settings.title")}
              </span>
            </div>
            <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-white">
              {t("setsettings.deleteAccount.confirmTitle")}
            </h2>
          </div>
          <button
            onClick={() => handleClose()}
            aria-label="Close"
            className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center w-8 h-8 border border-white/15 text-white/60 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
          >
            <IoClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Warning box */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 mb-6">
            <IoWarningOutline className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-red-600 leading-relaxed">
              {t("setsettings.deleteAccount.confirmDescription")}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleClose(onFeedback)}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-semibold tracking-[0.02em] text-white bg-gradient-to-b from-red-500 to-red-700 border border-red-700 hover:from-red-600 hover:to-red-800 hover:shadow-[0_14px_28px_-10px_rgba(220,38,38,.6)] hover:-translate-y-px active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              {t("setsettings.deleteAccount.confirmButton")}
            </button>
            <button
              type="button"
              onClick={() => handleClose()}
              className="w-full py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
            >
              {t("setsettings.deleteAccount.cancelButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
