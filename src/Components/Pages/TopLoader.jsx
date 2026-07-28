"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Native "pull past the top to refresh" (typology.com-style) — iOS Safari's
// rubber-band bounce is purely visual and never reloads the page on its
// own, so this reproduces the gesture: arm on a touchstart while already at
// scrollY 0, and if the release point is more than PULL_THRESHOLD below
// that while still at the top, reload.
const PULL_THRESHOLD = 80;

export function PullToRefresh() {
  useEffect(() => {
    let startY = null;
    let armed = false;

    const onTouchStart = (e) => {
      // A modal/drawer locks body scroll via overflow:hidden (see Navbar.jsx)
      // while its own inner content scrolls — window.scrollY stays 0 the
      // whole time in that state, so without this guard a pull inside an
      // open modal would also trigger a full-page reload.
      if (document.body.style.overflow === "hidden") {
        armed = false;
        return;
      }
      if (window.scrollY <= 0) {
        startY = e.touches[0].clientY;
        armed = true;
      } else {
        startY = null;
        armed = false;
      }
    };

    const onTouchMove = (e) => {
      if (!armed || startY == null) return;
      const dy = e.touches[0].clientY - startY;
      // Pulling back up (or scrolling away from the top) cancels the pull.
      if (dy < 0 || window.scrollY > 0) armed = false;
    };

    const onTouchEnd = (e) => {
      if (!armed || startY == null) return;
      const endY = e.changedTouches[0].clientY;
      const dy = endY - startY;
      armed = false;
      startY = null;
      if (dy > PULL_THRESHOLD && window.scrollY <= 0) {
        window.location.reload();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}

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
    let frameId;
    if (finishing) {
      frameId = requestAnimationFrame(() => setWidth(100));
      clearInterval(timerRef.current);
      return () => cancelAnimationFrame(frameId);
    }

    let w = 10;
    frameId = requestAnimationFrame(() => setWidth(w));
    timerRef.current = setInterval(() => {
      w += Math.random() * 10 + 2;
      if (w >= 90) { w = 90; clearInterval(timerRef.current); }
      setWidth(w);
    }, 150);
    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(timerRef.current);
    };
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
        // Matches the GPU-layer hints already on the announcement bar in
        // Navbar.jsx — this bar's width repaints every ~150ms while
        // position:fixed at the very top, the same combination prone to
        // flickering during iOS Safari's toolbar collapse/expand animation.
        transform: "translateZ(0)",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
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
    }, 120);
  }, [triggerFinish]);

  // finish on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => triggerFinish());
    return () => cancelAnimationFrame(frame);
  }, [pathname, searchParams, triggerFinish]);

  // start on link click or manual event
  useEffect(() => {
    // iOS Safari synthesizes a "click" on release even when the gesture was
    // actually a scroll/drag over a link (no real tap intent) — without this
    // guard, that ghost click fires the loader bar for a moment on every
    // such scroll, which is the white line flashing at the top on iOS.
    let touchStartY = null;
    let touchStartX = null;
    let touchMoved = false;
    let scrollStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? null;
      touchStartX = e.touches?.[0]?.clientX ?? null;
      scrollStartY = window.scrollY;
      touchStartTime = Date.now();
      touchMoved = false;
    };
    const onTouchMove = (e) => {
      if (touchStartY == null || touchStartX == null) return;
      const y = e.touches?.[0]?.clientY;
      const x = e.touches?.[0]?.clientX;
      if (
        (y != null && Math.abs(y - touchStartY) > 10) ||
        (x != null && Math.abs(x - touchStartX) > 10)
      ) {
        touchMoved = true;
      }
    };

    // Only a touch that started *just before this click* can be an iOS
    // ghost-click — touchStartY stays null for the entire session on a
    // plain mouse/trackpad click, and scrollStartY was only ever set at the
    // last touchstart. Gating scrollDiff/touchMoved behind that recency
    // check matters because scrollStartY otherwise defaults to 0: without
    // this gate, ANY mouse click made after scrolling away from the very
    // top of the page (i.e. almost every click that isn't right at page
    // load) computed scrollDiff = window.scrollY > 5 and silently ate the
    // loader — which is why it looked like the loader "only worked from the
    // top of the page".
    const isGhostClick = () => {
      if (touchStartY === null) return false;
      if (Date.now() - touchStartTime > 300) return false;
      return touchMoved || Math.abs(window.scrollY - scrollStartY) > 5;
    };

    const onLinkClick = (e) => {
      if (isGhostClick()) return;

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

      // Re-clicking the exact same URL doesn't change pathname/searchParams,
      // so the "finish on route change" effect below never fires for it —
      // start the bar as usual but finish it after a short flash instead of
      // leaving it to the 10s safety fallback.
      let isSameUrl = false;
      try {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);
        isSameUrl = url.pathname === currentUrl.pathname && url.search === currentUrl.search;
      } catch (err) {}

      triggerStart();
      if (isSameUrl) {
        setTimeout(() => triggerFinish(), 350);
      }
    };

    // startTopLoader() is called directly from plenty of div/button onClick
    // handlers across the app (article cards, product cards, etc.) — not
    // just <a> tags. Those aren't covered by onLinkClick's anchor check
    // above, so an iOS ghost-click firing one of them after a scroll still
    // got through and flashed the bar. Same ghost-click guard here closes
    // that gap.
    const onStart = () => {
      if (isGhostClick()) return;
      triggerStart();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("click", onLinkClick, true);
    window.addEventListener("toploader:start", onStart);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("click", onLinkClick, true);
      window.removeEventListener("toploader:start", onStart);
      clearTimeout(finishTimer.current);
      clearTimeout(startTimer.current);
    };
  }, [triggerStart, triggerFinish]);

  if (!loaderState.key) return null;

  return <LoaderBar key={loaderState.key} finishing={loaderState.finishing} />;
}
