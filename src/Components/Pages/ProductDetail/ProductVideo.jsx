"use client";
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";


const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`} />
);

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  // Handle YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }
  
  // Handle regular YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (videoMatch) {
    return `https://www.youtube.com/embed/${videoMatch[1]}`;
  }
  
  return null;
};

export default function ProductVideo({ videoLink, frenchVideoLink, isLoading }) {
  const { t, i18n } = useTranslation("productdetail");
  const language = i18n.language;
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeLoaded = useRef(false);

  const finalVideoLink = (language === "fr" && frenchVideoLink) ? frenchVideoLink : videoLink;
  const embedUrl = getYouTubeEmbedUrl(finalVideoLink);

  if (!embedUrl) return null;

  const handleIframeLoad = () => {
    if (!iframeLoaded.current) {
      iframeLoaded.current = true;
      setIframeLoading(false);
    }
  };

  return (
    <>
      <div className="w-full py-0 lg:py-10 flex items-center justify-center gap-0 lg:gap-3 mb-4 lg:mb-0">
        <RiDoubleQuotesL className="hidden lg:block text-[#aaa] w-4 h-4 mb-auto mt-1 shrink-0" />
        <p className="text-lg font-semibold text-[#1C1C1C]">{t("watchBenefitsLive")}</p>
        <RiDoubleQuotesR className="hidden lg:block text-[#aaa] w-4 h-4 mt-auto mb-1.5 shrink-0" />
      </div>
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: "16/9" }}
      >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmerMove {
            0%   { background-position: -600px 0; }
            100% { background-position:  600px 0; }
          }
          .shimmer-bg-video {
            background: linear-gradient(90deg, #d4d4d4 25%, #e8e8e8 50%, #d4d4d4 75%);
            background-size: 600px 100%;
            animation: shimmerMove 1.4s infinite linear;
          }
          @keyframes spinVideo { to { transform: rotate(360deg); } }
          @keyframes videoFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .video-fade-in { animation: videoFadeIn 0.4s ease forwards; }
        `
      }} />

      {/* State 1: Shimmer — jab tak isLoading true hai */}
      {isLoading && (
        <div className="shimmer-bg-video absolute inset-0 w-full h-full" />
      )}

     {/* State 2: Gray bg, black spinner */}
{!isLoading && iframeLoading && (
  <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-200">
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "4px solid rgba(0,0,0,0.12)",
        borderTopColor: "#111111",
        animation: "spinVideo 0.8s linear infinite",
      }}
    />
  </div>
)}

      {/* State 3: Iframe fade in — spinner ke baad */}
      {!isLoading && (
        <iframe
          src={embedUrl}
          onLoad={handleIframeLoad}
          className={`absolute inset-0 w-full h-full ${
            iframeLoading ? "opacity-0" : "video-fade-in"
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Product Video"
        />
      )}
      </div>
    </>
  );
}