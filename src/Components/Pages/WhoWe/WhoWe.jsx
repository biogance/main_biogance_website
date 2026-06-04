"use client";
import React, { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import WhoWeBioganceHero from './WhoWeBioganceHero';
import WhoWeBioganceNatural from './WhoWeBioganceNatural';
import WhoWeJourneyLife from './WhoWeJourneyLife';

const WhoWe = () => {
  const [hasJourneyData, setHasJourneyData] = useState(true);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="sticky top-0 h-screen -z-10">
        <div className="relative w-full min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <video
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
              muted
              autoPlay
              loop
              playsInline
            >
              <source src="/LandingVideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="absolute inset-0 bg-black/40"></div>
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