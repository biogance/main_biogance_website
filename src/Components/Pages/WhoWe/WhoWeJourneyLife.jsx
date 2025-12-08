"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function WhoWeJourneyLife() {
  const [activeYears, setActiveYears] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef(null);
  const yearRefs = useRef([]);

  const timelineData = [
    {
      year: "2015",
      position: "right",
      award: {
        logo:"/L1.svg",
        isImage: true,
        title: "Communication Trophies",
        description: "Biogance was recognized with the Best Professional Website Award, honoring excellence in communication and transparency. This trophy highlights the brand's commitment to clear messaging, digital presence, and its ability to connect effectively with both customers and industry stakeholders in the pet care sector."
      }
    },
    {
      year: "2015",
      position: "left",
      award: {
        logo: "/LL2.svg",
        isImage: true,
        title: "Global PETS Forum Award",
        description: "In 2015, Biogance won the prestigious Global PETS Forum Award in Madrid, presented by PETS International. As the first hygiene and care brand to receive it, Biogance was celebrated for innovation, credibility, and international export strategy among leading companies in the pet care industry."
      }
    },
    {
      year: "2016",
      position: "right",
      award: {
        logo: "/L3.svg",
         isImage: true,
        title: "Winner of Start-Up of the Year by Ernst and Young",
        description: "Biogance was awarded Start-Up of the Year by Ernst & Young, recognizing entrepreneurial excellence and innovation. This honor highlighted Biogance as a high-potential company that demonstrated leadership, growth capability, and a pioneering role in the organic and natural pet care market."
      }
    },
    {
      year: "2017",
      position: "left",
      award: {
        logo: "/L4.svg",
         isImage: true,
        title: "INNO BIO Bronze Trophy",
        description: "At the NATEXPO International Trade Fair, Biogance earned the INNO BIO Bronze Trophy for its ORGANISSIME range. This award celebrated Biogance's dedication to organic, ECOCERT-certified pet care products, reinforcing the company's mission of combining nature and science for healthier, eco-friendly solutions."
      }
    },
    {
      year: "2020",
      position: "right",
      award: {
        logo: "/L5.svg",
         isImage: true,
        title: "Pet Friendly Trophies",
        description: "Biogance received the Pet Friendly Trophy in the Entreprise+ category, honoring companies that integrate pets into daily life, travel, and workplaces. This award recognized Biogance's role in promoting animal inclusion, improving pet-friendly environments, and supporting better coexistence between people and their animals."
      }
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const timeline = timelineRef.current;
      const timelineRect = timeline.getBoundingClientRect();
      const timelineTop = timelineRect.top;
      const timelineHeight = timelineRect.height;
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress for the line - smoother calculation
      const startOffset = viewportHeight * 0.5;
      const scrolled = startOffset - timelineTop;
      const progress = Math.max(0, Math.min(1, scrolled / timelineHeight));
      setScrollProgress(progress);

      // Check which years should be active - synchronized with line progress
      const newActiveYears = new Set();
      yearRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const itemTop = rect.top;
          const itemCenter = itemTop + 20; // Adjust this offset to sync with dot position
          
          // Year becomes active when the black line reaches it
          if (itemCenter <= viewportHeight / 2) {
            newActiveYears.add(index);
          }
        }
      });
      
      setActiveYears(newActiveYears);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 lg:mb-24">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-medium">
            OUR JOURNEY OF EXCELLENCE
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 leading-tight">
            From a small French laboratory to a<br />
            global leader in natural pet care.
          </h1>
        </div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative">
          {/* Center Vertical Line - Desktop Only */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-300 transform -translate-x-1/2">
            {/* Animated black line */}
            <div 
              className="absolute top-0 left-0 w-full bg-gray-900"
              style={{ height: `${scrollProgress * 100}%`, transition: 'height 0.1s linear' }}
            />
          </div>

          {/* Timeline Items */}
          <div className="space-y-16 lg:space-y-20">
            {timelineData.map((item, index) => (
              <div key={index} className="relative" ref={el => yearRefs.current[index] = el}>
                
                {/* Mobile Layout */}
                <div className="lg:hidden flex gap-6">
                  {/* Year and Line */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className={`text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-300 ${
                      activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                    }`}>
                      {item.year}
                    </div>
                    <div className={`w-3 h-3 rounded-full my-3 border-[3px] transition-all duration-300 ${
                      activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                    }`}></div>
                    {index !== timelineData.length - 1 && (
                      <div className="w-[2px] bg-gray-300 flex-1"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    {/* Logo Box */}
                    <div className="w-24 h-24 flex items-center justify-center mb-4 border border-gray-200 bg-white p-2">
                      {item.award.isImage ? (
                        <img src={item.award.logo} alt={item.award.title} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl font-bold">{item.award.logo}</span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {item.award.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.award.description}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block ">
                  {item.position === "right" ? (
                    /* Right Side Content */
                    <div className="grid grid-cols-2 gap-12 items-start ">
                      {/* Left Side - Year */}
                      <div className="flex justify-end pr-12 ">
                        <div className="text-right">
                          <div className={`inline-block text-white text-sm font-bold px-5 py-2 rounded-full transition-colors duration-300 ${
                            activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                          }`}>
                            {item.year}
                          </div>
                        </div>
                      </div>

                      {/* Center Dot - Positioned on the line */}
                      <div className="absolute left-1/2 top-3 transform -translate-x-1/2 z-10">
                        <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                          activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                        }`}></div>
                      </div>

                      {/* Right Content */}
                      <div className="p-8 bg-white">
                        {/* Logo Box */}
                        <div className="w-28 h-28 flex items-center justify-center mb-5  bg-white p-3">
                          {item.award.isImage ? (
                            <img src={item.award.logo} alt={item.award.title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-3xl font-bold">{item.award.logo}</span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                          {item.award.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.award.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Left Side Content */
                    <div className="grid grid-cols-2 gap-12 items-start">
                      {/* Left Content */}
                      <div className="pr-12 flex flex-col items-start bg-white p-8">
                        {/* Logo Box */}
                        <div className="w-28 h-28 flex items-center justify-center mb-5 ">
                          {item.award.isImage ? (
                            <img src={item.award.logo} alt={item.award.title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-3xl font-bold">{item.award.logo}</span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                          {item.award.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.award.description}
                        </p>
                      </div>

                      {/* Center Dot - Positioned on the line */}
                      <div className="absolute left-1/2 top-3 transform -translate-x-1/2 z-10">
                        <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                          activeYears.has(index) ? 'bg-white border-black' : 'bg-gray-300 border-gray-300'
                        }`}></div>
                      </div>

                      {/* Right Side - Year */}
                      <div className="pl-12 ">
                        <div className={`inline-block text-white text-sm font-bold px-5 py-2 rounded-full transition-colors duration-300 ${
                          activeYears.has(index) ? 'bg-gray-900' : 'bg-gray-400'
                        }`}>
                          {item.year}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}