"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { LuCopy } from "react-icons/lu";
import {
  FaFacebookF,
  FaXTwitter,
  FaWhatsapp,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";

export default function ShareModal({ isOpen, onClose, url, title }) {
  const { t } = useTranslation("expertadvice");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url || "");
  const encodedTitle = encodeURIComponent(title || "");

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url || "");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url || "";
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      inputRef.current?.focus();
      inputRef.current?.select();
      toast.success(t("linkCopied"), { position: "top-center" });
    } catch {
      toast.error(t("somethingWentWrong"), { position: "top-center" });
    }
  };

  const openShareWindow = (shareUrl) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

 const socialOptions = [
  {
    key: "facebook",
    label: "Facebook",
    icon: <FaFacebookF className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />,
    bg: "#1877F2",
    onClick: () =>
      openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
  },
  {
    key: "twitter",
    label: "X",
    icon: <FaXTwitter className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />,
    bg: "#000000",
    onClick: () =>
      openShareWindow(
        `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      ),
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: <FaWhatsapp className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
    bg: "#25D366",
    onClick: () =>
      openShareWindow(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: <FaLinkedinIn className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />,
    bg: "#0A66C2",
    onClick: () =>
      openShareWindow(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      ),
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: <FaPinterestP className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />,
    bg: "#E60023",
    onClick: () =>
      openShareWindow(
        `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      ),
  },
  {
    key: "email",
    label: "Email",
    icon: <MdOutlineEmail className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
    bg: "#6b7280",
    onClick: () => {
      window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
    },
  },
];

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{t("share")}</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 cursor-pointer transition-all duration-300 hover:rotate-90"
            aria-label={t("close")}
          >
            <IoClose size={22} />
          </button>
        </div>

        <div className="px-6 pt-5">
          <div className="flex border border-gray-200 overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={url || ""}
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 px-3 py-2.5 text-xs sm:text-sm outline-none bg-white text-gray-700 [&::selection]:bg-blue-600 [&::selection]:text-white"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold uppercase tracking-wide cursor-pointer transition-colors bg-gray-900 text-white hover:bg-gray-700"
            >
              <LuCopy size={16} />
              <span className="hidden sm:inline">{t("copy")}</span>
            </button>
          </div>
        </div>

   <div className="px-6 py-6">
  <div className="flex flex-nowrap justify-between gap-2 sm:gap-4">
    {socialOptions.map((opt) => (
      <button
        key={opt.key}
        type="button"
        onClick={opt.onClick}
        className="flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer group flex-1 min-w-0"
      >
        <span
          className="w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 shrink-0"
          style={{ backgroundColor: opt.bg }}
        >
          {opt.icon}
        </span>
        <span className="text-[8px] sm:text-[10px] text-gray-600 truncate max-w-full">
          {opt.label}
        </span>
      </button>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}
