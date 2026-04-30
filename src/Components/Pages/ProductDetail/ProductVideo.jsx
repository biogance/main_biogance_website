"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { IoIosPause } from "react-icons/io";

export default function ProductVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef(null);

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    setProgress((vid.currentTime / vid.duration) * 100 || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = ratio * vid.duration;
    }
    resetHideTimer();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const handleMouseMove = () => {
    resetHideTimer();
  };

  useEffect(() => {
    return () => clearTimeout(hideControlsTimer.current);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src="/LandingVideo.mp4"
        className="w-full h-full min-w-[350px] object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        playsInline
        onClick={togglePlay}
      />

      {/* Gradient Overlay at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Center Play/Pause Big Button */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.35s ease",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(18, 0, 0, 0.59)",
          
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(32, 3, 3, 0.40)",
            transition: "transform 0.15s ease, background 0.15s ease",
          }}
          className="hover:scale-110 hover:bg-white/25"
        >
          {isPlaying ? (
            /* Pause Icon */
           <IoIosPause  size={30} />

          ) : (
            /* Play Icon */
           <FaPlay size={20} />

          )}
        </div>
      </button>

      {/* Bottom Controls Bar */}
      <div
        className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-2"
        style={{
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        {/* Progress Bar */}
        <div
          className="w-full h-1 rounded-full mb-3 cursor-pointer relative group"
          style={{ background: "rgba(255,255,255,0.3)" }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "#fff",
              transition: "width 0.1s linear",
            }}
          />
          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
            style={{
              left: `calc(${progress}% - 6px)`,
              opacity: showControls ? 1 : 0,
            }}
          />
        </div>

        {/* Time Row */}
        <div className="flex items-center justify-between">
          {/* Small play/pause pill */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-medium"
           
          >
           
          </button>

          {/* Time display */}
          <span
            className="text-xs font-mono"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}