"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStar, FaStar } from "react-icons/fa";
import { IoStarOutline } from "react-icons/io5";

export default function ProductModalAddReview({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation("productreviews");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.38)",
        transition: "background 0.25s",
      }}
    >
      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "420px",
          padding: "40px 32px 32px 32px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.18)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.25s",
          position: "relative",
        }}
      >
        {/* Title */}
        <h2
          style={{
           
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "#1C1C1C",
            textAlign: "center",
            lineHeight: 1.4,
            marginBottom: "28px",
          }}
        >
          {t("howIsYourFirstImpression")}
        </h2>

        {/* Star Rating */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
       {[1, 2, 3, 4, 5].map((star) => {
  const filled = (hovered || rating) >= star;
  return (
    <button
      key={star}
      onClick={() => setRating(star)}
      onMouseEnter={() => setHovered(star)}
      onMouseLeave={() => setHovered(0)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        transition: "transform 0.15s",
        transform: filled ? "scale(1.18)" : "scale(1)",
      }}
    >
      {filled ? (
        <FaStar style={{ width: 32, height: 32, color: "#1C1C1C" }} />
      ) : (
       <IoStarOutline style={{ width: 32, height: 32, color: "#120101" }} />
      )}
    </button>
  );
})}
        </div>

        {/* Feedback Label */}
        <label
          style={{
            display: "block",
            fontSize: "0.92rem",
            fontWeight: "600",
            color: "#1C1C1C",
            marginBottom: "10px",
          }}
        >
          {t("giveFeedback")}
        </label>

        {/* Textarea */}
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t("writeYourFeedback")}
          rows={4}
          style={{
            width: "100%",
            borderRadius: "10px",
            border: "1px solid #DEDEDE",
            padding: "12px 14px",
            fontSize: "0.93rem",
            color: "#1C1C1C",
            background: "#fff",
            resize: "none",
            outline: "none",
            marginBottom: "22px",
            fontFamily: "inherit",
            transition: "border-color 0.18s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1C1C1C")}
          onBlur={(e) => (e.target.style.borderColor = "#E0E0E0")}
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!rating || !feedback.trim()}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            background: !rating || !feedback.trim() ? "#888" : "#1C1C1C",
            color: "#fff",
            fontWeight: "600",
            fontSize: "1rem",
            border: "none",
            cursor: !rating || !feedback.trim() ? "not-allowed" : "pointer",
            marginBottom: "12px",
            transition: "background 0.18s, transform 0.12s",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            if (rating && feedback.trim())
              e.target.style.background = "#333";
          }}
          onMouseLeave={(e) => {
            if (rating && feedback.trim())
              e.target.style.background = "#1C1C1C";
          }}
        >
          {t("submit")}
        </button>

        {/* Cancel */}
        <button
          onClick={handleClose}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "0.93rem",
            cursor: "pointer",
            padding: "4px",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}