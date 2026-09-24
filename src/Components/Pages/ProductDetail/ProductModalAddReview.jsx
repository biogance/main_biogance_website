"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaStar } from "react-icons/fa";
import { IoStarOutline, IoClose } from "react-icons/io5";

export default function ProductModalAddReview({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation("productreviews");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const modalCardRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      setRating(0);
      setHovered(0);
      setFeedback("");
    }, 250);
  };

  const handleSubmit = () => {
    if (!rating || !feedback.trim()) return;
    onSubmit?.({ rating, feedback });
    handleClose();
  };

  // Same shake-instead-of-close-on-backdrop-click as Login.jsx's
  // handleBackdropClick — .modal-shake/@keyframes modalShake are global
  // classes already defined in globals.css for that.
  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  if (!isOpen && !isClosing) return null;

  const canSubmit = rating && feedback.trim();
  const shown = hovered || rating;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div className={`w-full max-w-[440px] ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
      {/* Modal Box */}
      <div
        ref={modalCardRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-white overflow-hidden shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)]"
      >
        {/* Header band */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-7 pt-7 pb-6">
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "14px 14px",
              maskImage: "linear-gradient(to bottom, #000, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, #000, transparent)",
            }}
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 grid place-items-center w-8 h-8 bg-transparent border border-white/25 text-white cursor-pointer hover:bg-white hover:text-[#0b0b0a] transition-colors"
          >
            <IoClose className="w-4 h-4" />
          </button>
          <span className="relative block text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">
            Biogance
          </span>
          <h2 className="relative m-0 mt-2 pr-10 text-[19px] font-bold leading-snug text-white">
            {t("howIsYourFirstImpression")}
          </h2>
          <div className="absolute bottom-0 left-0 h-[2px] w-16 bg-white" />
        </div>

        <div className="px-7 pt-7 pb-6">
          {/* Star Rating */}
          <div className="flex items-center justify-center mb-7">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = shown >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${star} / 5`}
                    className="bg-transparent border-0 p-0.5 cursor-pointer"
                    style={{
                      transition: "transform 0.15s",
                      transform: filled ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    {filled ? (
                      <FaStar style={{ width: 26, height: 26, color: "#0b0b0a" }} />
                    ) : (
                      <IoStarOutline style={{ width: 26, height: 26, color: "#8a8880" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          <label className="block mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b0b0a]">
            {t("giveFeedback")}
          </label>
          <div className="group relative mb-6">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("writeYourFeedback")}
              rows={4}
              className="block w-full resize-none bg-[#f3f3f3] border border-black/10 px-4 py-3 text-[14px] text-[#0b0b0a] placeholder:text-[#8a8880] outline-none font-[inherit] box-border"
            />
            <span className="pointer-events-none absolute left-0 bottom-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#211e1a] to-[#0b0b0a] transition-transform duration-300 group-focus-within:scale-x-100" />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 border-0 text-white text-[12px] font-bold uppercase tracking-[0.14em] bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] transition-opacity enabled:cursor-pointer enabled:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("submit")}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={handleClose}
            className="mt-3 w-full bg-transparent border-0 py-1 text-[12px] text-[#8a8880] hover:text-[#0b0b0a] cursor-pointer underline underline-offset-4 transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
