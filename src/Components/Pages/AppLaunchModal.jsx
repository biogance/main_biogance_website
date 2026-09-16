"use client";

import { Fragment, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { PiRocketLaunchDuotone } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { lockBodyScroll, unlockBodyScroll } from "./Onboarding/ScrollLock";

const LAUNCH_STORAGE_KEY = "appLaunchTargetDate";
const COUNTDOWN_DAYS = 60;

// Countdown target is pinned to the first time any visitor opens this modal
// (persisted in localStorage) so the 60-day timer counts down consistently
// across visits instead of resetting to 60 days on every open.
function getLaunchTarget() {
  if (typeof window === "undefined") return null;
  try {
    const stored = Number(localStorage.getItem(LAUNCH_STORAGE_KEY));
    if (!Number.isNaN(stored) && stored > Date.now()) return stored;
  } catch {
    /* ignore */
  }
  const target = Date.now() + COUNTDOWN_DAYS * 24 * 60 * 60 * 1000;
  try {
    localStorage.setItem(LAUNCH_STORAGE_KEY, String(target));
  } catch {
    /* ignore */
  }
  return target;
}

function getTimeLeft(target) {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function AppLaunchModal({ isOpen, onClose }) {
  const { t } = useTranslation("footer");
  const [isClosing, setIsClosing] = useState(false);
  // Lazy initializers so the countdown target/value are ready on first
  // render — an effect that set them afterwards would cause an extra
  // cascading render on every open.
  const [target] = useState(() => getLaunchTarget());
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 250);
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  const units = [
    { label: t("mobileApp.days", "Days"), value: timeLeft.days },
    { label: t("mobileApp.hours", "Hours"), value: timeLeft.hours },
    { label: t("mobileApp.minutes", "Minutes"), value: timeLeft.minutes },
    { label: t("mobileApp.seconds", "Seconds"), value: timeLeft.seconds },
  ];

  return (
    <div
      className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[1300] ${
        isClosing ? "backdrop-out" : "backdrop-in"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-lg ${isClosing ? "modal-pop-out" : "modal-pop-in"}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white text-black w-full p-10 sm:p-12 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-black via-gray-400 to-black" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-1.5 text-black hover:text-gray-600 hover:bg-gray-100 z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
          >
            <AiOutlineClose size={20} />
          </button>

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 bg-black text-white text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              {t("mobileApp.badge", "Launching Soon")}
            </span>

            <div className="relative mx-auto mb-7 w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-black/5 blur-xl" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center shadow-lg ring-4 ring-black/5">
                <PiRocketLaunchDuotone size={28} className="text-white" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-black">
              {t("mobileApp.modalTitle", "Something exciting is coming")}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-10 max-w-sm mx-auto">
              {t(
                "mobileApp.modalDescription",
                "The Biogance app is launching soon. Get ready for a whole new way to care for your companions.",
              )}
            </p>

            <div className="flex items-start justify-center gap-2 sm:gap-3 mb-10">
              {units.map((u, i) => (
                <Fragment key={u.label}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      <span className="text-lg sm:text-xl font-bold tabular-nums text-black">
                        {String(u.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="mt-2 text-[10px] tracking-widest uppercase text-gray-500">
                      {u.label}
                    </span>
                  </div>
                  {i < units.length - 1 && (
                    <span className="mt-2.5 sm:mt-3.5 text-xl font-light text-black">
                      :
                    </span>
                  )}
                </Fragment>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 tracking-wide">
                {t(
                  "mobileApp.footerNote",
                  "We'll let you know the moment we launch.",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
