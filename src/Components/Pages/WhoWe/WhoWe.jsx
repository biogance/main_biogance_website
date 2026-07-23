"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import WhoWeBioganceHero from './WhoWeBioganceHero';
import WhoWeBioganceNatural from './WhoWeBioganceNatural';
import WhoWeJourneyLife from './WhoWeJourneyLife';

const WhoWe = () => {
  const [hasJourneyData, setHasJourneyData] = useState(true);
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(
    (typeof window !== 'undefined' && window.__bioganceVideoBlobUrl) || '/VIDEO.mp4'
  );

  useEffect(() => {
    if (window.__bioganceVideoBlobUrl) {
      setVideoSrc(window.__bioganceVideoBlobUrl);
      return;
    }
    const handler = (e) => {
      if (videoRef.current && videoRef.current.readyState >= 3) return;
      setVideoSrc(e.detail);
    };
    window.addEventListener('biogance-video-blob-ready', handler);
    return () => window.removeEventListener('biogance-video-blob-ready', handler);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar bgWhite={true} />
      </div>

      <main className="relative h-screen">
        <div className="relative w-full h-screen flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
            />
          </div>
        
        </div>
      </main>

      <WhoWeBioganceHero />
      <WhoWeBioganceNatural />
      <WhoWeJourneyLife onDataLoaded={setHasJourneyData} />
      <Footer />
    </>
  );
};

export default WhoWe;