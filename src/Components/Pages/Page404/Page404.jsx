'use client';

import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { GiSittingDog } from "react-icons/gi";
import { PiDogBold } from 'react-icons/pi';


export default function Custom404() {
  const [count1, setCount1] = useState(10);
  const [count2, setCount2] = useState(10);
  const [count3, setCount3] = useState(10);

  useEffect(() => {
    // First digit: counts from 10 down to 4
    if (count1 > 4) {
      const timer = setTimeout(() => {
        setCount1(count1 - 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [count1]);

  useEffect(() => {
    // Second digit: starts when first reaches 7, counts from 10 down to 0
    if (count1 <= 7 && count2 > 0) {
      const timer = setTimeout(() => {
        setCount2(count2 - 1);
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [count1, count2]);

  useEffect(() => {
    // Third digit: starts when second reaches 5, counts from 10 down to 4
    if (count2 <= 5 && count3 > 4) {
      const timer = setTimeout(() => {
        setCount3(count3 - 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [count2, count3]);

  return (
    <>
      <div className='min-h-screen flex flex-col'>
        <Navbar />

        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
          <div className="text-center w-full max-w-6xl mx-auto">
            {/* 404 with overlapping circles - Responsive */}
            <div className="relative inline-flex items-center justify-center mb-8 sm:mb-12 scale-75 sm:scale-90 md:scale-100">
              {/* OH! bubble - Responsive */}
              <div className="absolute -top-1 sm:-top-2 left-0 bg-black text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-normal italic z-20 shadow-xl animate-bounce">
                OH!
              </div>

              {/* First 4 - animated - Responsive */}
              <div className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-400 text-white rounded-full w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center text-6xl sm:text-7xl md:text-9xl font-bold shadow-2xl ml-8 sm:ml-10 md:ml-12 transition-all duration-300 hover:scale-105">
                <span className="animate-pulse">{count1}</span>
              </div>

              {/* 0 - animated - Responsive */}
              <div className="relative -ml-8 sm:-ml-10 md:-ml-12 z-[11] bg-gradient-to-r from-gray-900 to-gray-400 text-white rounded-full w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center text-6xl sm:text-7xl md:text-9xl font-bold shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="animate-pulse">{count2}</span>
              </div>

              {/* Last 4 - animated - Responsive */}
              <div className="relative -ml-8 sm:-ml-10 md:-ml-12 z-[12] bg-gradient-to-r from-gray-900 to-gray-400 text-white rounded-full w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center text-6xl sm:text-7xl md:text-9xl font-bold shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="animate-pulse">{count3}</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-gray-900 mb-8 sm:mb-10 md:mb-12  px-4">
                Sorry! Page not found
              </h1>
              {/* Cat image - Fully Responsive */}
              <div className="flex justify-center mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-1 md:mb-0">
                <img 
                  src="cat.png" 
                  alt="Lost cat" 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
                />
              </div>
            </div>
            

            {/* Button - Responsive */}
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 cursor-pointer bg-gradient-to-r from-gray-900 to-gray-400 text-white border-none rounded-lg text-base sm:text-lg font-normal hover:from-gray-400 hover:to-gray-900 hover:shadow-lg transition-all shadow-sm w-auto"
            >
              
              Take Me Home
            </button>
            
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.8s both;
        }

        /* Ensure proper spacing on very small screens */
        @media (max-width: 375px) {
          .scale-75 {
            transform: scale(0.65);
          }
        }
      `}</style>
    </>
  );
}