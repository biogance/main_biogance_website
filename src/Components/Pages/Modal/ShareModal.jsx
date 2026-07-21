"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { LuCopy, LuCheck } from "react-icons/lu";
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
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Drive mount → visible → invisible → unmount lifecycle for CSS transitions.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Two rAF ticks so the browser paints the initial hidden state first.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock body scroll while open — restores exact scroll position on close.
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

  // Reset "Copied!" state whenever modal closes.
  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  if (!mounted) return null;

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
      setCopied(true);
      toast.success(t("linkCopied"), { position: "top-center" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(t("somethingWentWrong"), { position: "top-center" });
    }
  };

  const openShareWindow = (href) =>
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");

  const socialOptions = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FaFacebookF className="w-3.5 h-3.5" />,
      bg: "#1877F2",
      onClick: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        ),
    },
    {
      key: "twitter",
      label: "X / Twitter",
      icon: <FaXTwitter className="w-3.5 h-3.5" />,
      bg: "#000000",
      onClick: () =>
        openShareWindow(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        ),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp className="w-3.5 h-3.5" />,
      bg: "#25D366",
      onClick: () =>
        openShareWindow(
          `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: <FaLinkedinIn className="w-3.5 h-3.5" />,
      bg: "#0A66C2",
      onClick: () =>
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        ),
    },
    {
      key: "pinterest",
      label: "Pinterest",
      icon: <FaPinterestP className="w-3.5 h-3.5" />,
      bg: "#E60023",
      onClick: () =>
        openShareWindow(
          `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
        ),
    },
    {
      key: "email",
      label: "Email",
      icon: <MdOutlineEmail className="w-4 h-4" />,
      bg: "#6b7280",
      onClick: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
      },
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-out ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="min-w-0 pr-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
              {t("share")}
            </h2>
            {title && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1 leading-snug">
                {title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="shrink-0 text-gray-400 hover:text-gray-900 cursor-pointer transition-all duration-200 hover:rotate-90 mt-0.5"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* ── Copy link ── */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
            {t("copyLink")}
          </p>
          <div className="flex border border-gray-200 overflow-hidden">
            <input
              type="text"
              readOnly
              value={url || ""}
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 px-3 py-2.5 text-xs outline-none bg-gray-50 text-gray-500 [&::selection]:bg-blue-600 [&::selection]:text-white"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors duration-200 ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {copied ? (
                <>
                  <LuCheck size={13} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <LuCopy size={13} />
                  <span>{t("copy")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 px-6 pb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-300 whitespace-nowrap">
            {t("shareVia")}
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* ── Social buttons — 3-column grid ── */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2.5">
            {socialOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={opt.onClick}
                className="flex items-center gap-2.5 px-3 py-2.5 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group rounded-sm"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 transition-transform duration-150 group-hover:scale-110"
                  style={{ backgroundColor: opt.bg }}
                >
                  {opt.icon}
                </span>
                <span className="text-[11px] font-medium text-gray-700 truncate leading-tight">
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
