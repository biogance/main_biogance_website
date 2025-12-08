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
      <main className="relative bg-white">
        <div className="relative w-full min-h-screen flex items-center justify-center">
          {/* Background Video */}
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/uxwk-YslZf0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=uxwk-YslZf0"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ pointerEvents: 'none' }}
          />
          
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