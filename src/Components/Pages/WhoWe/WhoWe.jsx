import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import WhoWeBioganceHero from './WhoWeBioganceHero';
import WhoWeBioganceNatural from './WhoWeBioganceNatural';
import WhoWeJourneyLife from './WhoWeJourneyLife';

const WhoWe = () => {
  return (
    <>
      {/* Fixed Navbar at top - MainVideo.jsx ki tarah */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main content with viewport height */}
      <main className="sticky top-0 h-screen -z-10">
        <div className="relative w-full min-h-screen flex items-center justify-center">
          {/* Background Video */}
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
          
          {/* Dark Overlay - optional */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Content Container - yahan aap apna content add kar sakte hain */}
          {/* <div className="relative mt-12 flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 w-full h-full py-20 sm:py-24 md:py-28 lg:py-32">
            <div className="max-w-2xl text-white text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Who We Are
              </h1>
              <p className="text-base md:text-lg mb-8 max-w-xl leading-relaxed">
                Your content here
              </p>
            </div>
          </div> */}
        </div>
      </main>

      <WhoWeBioganceHero/>
      <WhoWeBioganceNatural/>
      <WhoWeJourneyLife/>
      <Footer />
    </>
  );
};

export default WhoWe;