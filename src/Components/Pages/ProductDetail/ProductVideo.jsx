"use client";
import React from "react";

const HARDCODED_VIDEO = "https://www.youtube.com/watch?v=23GHPclU39E";

const getYouTubeEmbedUrl = (url) => {
  const videoId = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export default function ProductVideo({ videoLink }) {
  const finalVideoLink = videoLink || HARDCODED_VIDEO;
  const embedUrl = getYouTubeEmbedUrl(finalVideoLink);

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: "16/9" }}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Product Video"
      />
    </div>
  );
}
