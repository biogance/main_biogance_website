"use client"

import { PiDog, PiCat, PiHorse, PiBird, PiGameController, PiGridFour } from 'react-icons/pi';
import { GiRabbit, GiSnake } from 'react-icons/gi';
import { useState, useEffect } from 'react';

export default function Products({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('dogs');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const categories = [
    { id: 'dogs', name: 'Dogs & Puppies', icon: <PiDog size={24} /> },
    { id: 'cats', name: 'Cats & Kittens', icon: <PiCat size={24} /> },
    { id: 'horses', name: 'Horses', icon: <PiHorse size={24} /> },
    { id: 'mammals', name: 'Small Mammals', icon: <GiRabbit size={24} /> },
    { id: 'birds', name: 'Birds & Poultry', icon: <PiBird size={24} /> },
    { id: 'reptiles', name: 'Reptiles', icon: <GiSnake size={24} /> },
    { id: 'games', name: 'Games & Treats', icon: <PiGameController size={24} /> },
    { id: 'all', name: 'All Ranges', icon: <PiGridFour size={24} /> },
  ];

  const contentSections = [
    {
      title: 'Grooming & Care',
      image: 'https://images.unsplash.com/photo-1641484202528-c33769340d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdyb29taW5nJTIwd2hpdGUlMjBkb2d8ZW58MXx8fHwxNzY3OTUzODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      items: [
        'Shampoos & Conditioners',
        'Dry & Leave-In Shampoos',
        'Sensitive Area Care',
        'Skin & Coat Care',
        'Shedding Care',
        'Detanglers & Brushes',
        'Anti-Free Radical Treatment',
        'Dermoccare Veto-Pharma Range'
      ]
    },
    {
      title: 'Lifestyle & Wellness',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1080&q=80',
      items: [
        'Relaxation',
        'Toys & Treats',
        'Accessories & Textiles',
        'Scented Waters',
        'Our Kits',
        'What\'s New'
      ]
    },
    {
      title: 'Health & Nutrition',
      image: 'https://images.unsplash.com/photo-1629581327302-45202bbc4bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBidWxsZG9nJTIwb3V0ZG9vcnxlbnwxfHx8fDE3Njc5NTM4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      items: [
        'Pest Care',
        'Food Supplements',
        'Biogance Premium & Natural Range',
        'ECOCERT Organiclisme Controlled Range',
        'Plouf Fruity Range (Low Budget)'
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center sm:pt-10 md:pt-20 px-2 sm:px-4 overflow-y-auto">
        <div
          className={`bg-white rounded-lg shadow-2xl max-w-6xl w-full my-4 sm:my-0 transition-all duration-300 ease-out transform ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-[70px] right-3 sm:top-4  sm:right-4 text-gray-600 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all duration-200 z-10 cursor-pointer hover:rotate-90"
          >
            ✕
          </button>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
              {/* Mobile Category Dropdown */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {categories.find(c => c.id === activeCategory)?.icon}
                    <span className="text-sm">{categories.find(c => c.id === activeCategory)?.name}</span>
                  </div>
                  <span className={`transform transition-transform text-sm ${isMobileMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {isMobileMenuOpen && (
                  <div className="mt-2 bg-[#2a2a2a] rounded-lg p-2 space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                          activeCategory === category.id
                            ? 'bg-white text-black'
                            : 'text-white hover:bg-[#3a3a3a]'
                        }`}
                      >
                        <span className="flex-shrink-0">{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Sidebar */}
              <div className={`hidden lg:block w-[180px] bg-[#2a2a2a] p-3 rounded-lg flex-shrink-0 h-fit transition-all duration-500 delay-100 ${
                isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}>
                <div className="space-y-1">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                        activeCategory === category.id
                          ? 'bg-white text-black shadow-lg scale-105'
                          : 'text-white hover:bg-[#3a3a3a] hover:translate-x-1'
                      } ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{ transitionDelay: `${index * 50 + 200}ms` }}
                    >
                      <span className="flex-shrink-0">{category.icon}</span>
                      <span className="text-xs">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {contentSections.map((section, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col transition-all duration-500 ${
                        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: `${index * 100 + 300}ms` }}
                    >
                      {/* Section Title */}
                      <h2 className="text-sm sm:text-base font-medium mb-3 text-black">{section.title}</h2>

                      {/* Section Image */}
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-[140px] sm:h-[120px] md:h-[130px] object-cover rounded-lg hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Section Items */}
                      <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        {section.items.map((item, itemIndex) => (
                          <div 
                            key={itemIndex} 
                            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:translate-x-2 cursor-pointer transition-all duration-300"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}