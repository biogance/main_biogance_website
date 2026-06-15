"use client"

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MEDIA_URL } from '../../API/API';

export default function Products({ isOpen, onClose, categories = [] }) {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';
  const [activeCategory, setActiveCategory] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const getName = (item) => isFrench ? (item.french_name || item.name) : item.name;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      if (categories.length > 0 && !activeCategory) {
        setActiveCategory(categories[0]);
      }
    }
  }, [isOpen, categories]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) handleClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 700);
  };

  if (!isOpen) return null;

  // Active category ki sub_categories mein universe type wale
  const universes = (activeCategory?.sub_categories || []).filter(s => s.type === 'universe');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}${path}`;
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-700 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
        <div
          className="bg-white shadow-2xl max-w-6xl w-full my-4 transition-transform duration-700 ease-in-out"
          style={{ transform: isAnimating ? 'translateY(0)' : 'translateY(-150vh)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-600 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-all duration-200 z-10 cursor-pointer hover:rotate-90"
          >
            ✕
          </button>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">

              {/* Left Sidebar - Categories */}
              <div className={`hidden lg:block w-[220px] bg-[#2a2a2a] p-6 flex-shrink-0 h-fit transition-all duration-500 delay-100 ${isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 transition-all duration-300 ${
                        activeCategory?.id === cat.id
                          ? 'bg-white text-black shadow-lg scale-105'
                          : 'text-white hover:bg-[#3a3a3a] hover:translate-x-1'
                      }`}
                    >
                      {cat.black_media ? (
                        <img
                          src={getImageUrl(activeCategory?.id === cat.id ? cat.media : cat.black_media)}
                          alt={getName(cat)}
                          className="w-5 h-5 object-contain flex-shrink-0"
                        />
                      ) : null}
                      <span className="text-xs">{getName(cat)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Dropdown */}
              <div className="lg:hidden">
                <select
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 text-sm"
                  value={activeCategory?.id || ''}
                  onChange={(e) => {
                    const found = categories.find(c => c.id === Number(e.target.value));
                    if (found) setActiveCategory(found);
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{getName(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Right - Universes grid */}
              <div className="flex-1 overflow-y-auto max-h-[70vh]">
                {universes.length === 0 ? (
                  <p className="text-gray-400 text-sm">No products found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {universes.map((universe, index) => {
                      const families = (universe.sub_categories || []).filter(s => s.type === 'family');
                      return (
                        <div
                          key={universe.id}
                          className={`flex flex-col transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                          style={{ transitionDelay: `${index * 80 + 200}ms` }}
                        >
                          {/* Universe Name */}
                          <h2 className="text-sm font-semibold mb-2 text-black">{getName(universe)}</h2>

                          {/* Universe Image */}
                          {getImageUrl(universe.media) && (
                            <div className="mb-3 overflow-hidden">
                              <img
                                src={getImageUrl(universe.media)}
                                alt={getName(universe)}
                                className="w-full h-[130px] object-cover hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          )}

                          {/* Family list */}
                          <div className="space-y-2">
                            {families.map((fam) => (
                              <div
                                key={fam.id}
                                className="text-xs text-gray-600 hover:text-gray-900 hover:translate-x-2 cursor-pointer transition-all duration-300"
                              >
                                {getName(fam)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
