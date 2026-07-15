"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useTopLoader() {
  const start = () => window.dispatchEvent(new Event("toploader:start"));
  return { start };
}

export function startTopLoader() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("toploader:start"));
}

function LoaderBar({ finishing }) {
  const [width, setWidth] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (finishing) {
      setWidth(100);
      clearInterval(timerRef.current);
      return;
    }

    let w = 10;
    setWidth(w);
    timerRef.current = setInterval(() => {
      w += Math.random() * 10 + 2;
      if (w >= 90) { w = 90; clearInterval(timerRef.current); }
      setWidth(w);
    }, 150);
    return () => clearInterval(timerRef.current);
  }, [finishing]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${width}%`,
        background: "white",
       
        zIndex: 99999,
        opacity: finishing ? 0 : 1,
        transition: finishing ? "width 0.2s ease-out, opacity 0.3s ease 0.2s" : "width 0.15s ease-out",
        pointerEvents: "none",
      }}
    />
  );
}

export function RouteTopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loaderState, setLoaderState] = useState({ key: null, finishing: false });
  const finishTimer = useRef(null);
  const startTimer = useRef(null);

  const triggerFinish = useCallback(() => {
    clearTimeout(startTimer.current);
    clearTimeout(finishTimer.current);
    
    setLoaderState(prev => {
      if (!prev.key) return prev;
      return { ...prev, finishing: true };
    });

    finishTimer.current = setTimeout(() => {
      setLoaderState({ key: null, finishing: false });
    }, 500); // Wait for fade out transition
  }, []);

  const triggerStart = useCallback(() => {
    clearTimeout(finishTimer.current);
    clearTimeout(startTimer.current);
    
    // Small delay to prevent flashing on instant navigations (cached routes)
    startTimer.current = setTimeout(() => {
      setLoaderState({ key: Date.now(), finishing: false });
      // Safety fallback in case route never changes
      finishTimer.current = setTimeout(() => {
        triggerFinish();
      }, 10000);
    }, 50);
  }, [triggerFinish]);

  // finish on route change
  useEffect(() => {
    triggerFinish();
  }, [pathname, searchParams, triggerFinish]);

  // start on link click or manual event
  useEffect(() => {
    const onLinkClick = (e) => {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      
      if (
        !href || 
        href.startsWith("#") || 
        href.startsWith("mailto:") || 
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      ) return;

      // Don't show loader if navigating to the exact same URL
      try {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
            return;
        }
      } catch (err) {}

      triggerStart();
    };

    const onStart = () => triggerStart();

    document.addEventListener("click", onLinkClick, true);
    window.addEventListener("toploader:start", onStart);
    return () => {
      document.removeEventListener("click", onLinkClick, true);
      window.removeEventListener("toploader:start", onStart);
      clearTimeout(finishTimer.current);
      clearTimeout(startTimer.current);
    };
  }, [triggerStart]);

  if (!loaderState.key) return null;

  return <LoaderBar key={loaderState.key} finishing={loaderState.finishing} />;
}
