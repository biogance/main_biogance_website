"use client"

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MEDIA_URL } from '../../API/API';

export default function Products({ isOpen, onClose, categories = [], triggerRef, popular = [] }) {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const menuRef = useRef(null);

  const getName = (item) => isFrench ? (item.french_name || item.name) : item.name;

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (isOpen && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActiveImageIndex(0);
  }, [isOpen]);

  const featuredProduct = popular[0] || null;

  const rawImages = featuredProduct?.products?.[0]?.images || [];
  const productImages = rawImages.filter(img => img?.media && img.media.trim() !== '');

  const productName = featuredProduct
    ? (isFrench ? (featuredProduct.french_name || featuredProduct.name) : featuredProduct.name)
    : '';

  const handleDotClick = (index) => setActiveImageIndex(index);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}${path}`;
  };

  const universes = (activeCategory?.sub_categories || []).filter(s => s.type === 'universe');

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white border-b border-gray-200 shadow-lg z-[999] flex"
      style={{
        position: 'fixed',
        top: '104px',
        left: 0,
        right: 0,
        minHeight: '420px',
      }}
      // Jab mouse dropdown se bahar (upar navbar center/right mein) jaaye toh close karo
      onMouseLeave={onClose}
    >
      {/* Left Sidebar - Categories */}
      <div className="w-[200px] bg-[#2a2a2a] flex-shrink-0 py-4">
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 cursor-pointer ${
                isActive ? 'bg-white text-black' : 'text-white hover:bg-[#3a3a3a]'
              }`}
            >
              {(cat.black_media || cat.media) && (
                <img
                  src={getImageUrl(isActive ? cat.black_media : (cat.media || cat.black_media))}
                  alt={getName(cat)}
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
              )}
              <span className="text-xs font-medium truncate min-w-0 flex-1 text-left">
                {getName(cat)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Middle — Universes Grid */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        {universes.length === 0 ? (
          <p className="text-gray-400 text-sm">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-7">
            {universes.map((universe) => {
              const families = (universe.sub_categories || []).filter(s => s.type === 'family');
              return (
                <div key={universe.id} className="flex flex-col">
                  <h3 className="text-xs font-semibold text-black uppercase tracking-wider mb-3">
                    {getName(universe)}
                  </h3>
                  <div className="space-y-1.5">
                    {families.map((fam) => (
                      <div
                        key={fam.id}
                        className="text-xs text-gray-500 hover:text-black hover:underline cursor-pointer transition-all duration-200"
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

      {/* Right — Product Image Carousel */}
      {productImages.length > 0 && (
        <div
          className="flex-shrink-0 flex flex-col mr-50 items-center justify-center gap-3 py-8 px-5"
          style={{ width: '250px' }}
        >
          <div
            className="w-full bg-[#f3f3f3] flex items-center justify-center overflow-hidden"
            style={{ height: '250px' }}
          >
            <img
              key={activeImageIndex}
              src={getImageUrl(productImages[activeImageIndex]?.media)}
              alt={`Product image ${activeImageIndex + 1}`}
              className="w-full h-full object-contain"
              style={{ animation: 'fadeIn 0.3s ease' }}
              onError={(e) => {
                const next = (activeImageIndex + 1) % productImages.length;
                if (next !== activeImageIndex) setActiveImageIndex(next);
              }}
            />
          </div>

          {productImages.length > 1 && (
            <div className="flex items-center gap-1.5">
              {productImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className="cursor-pointer transition-all duration-300 rounded-full"
                  style={{
                    width: idx === activeImageIndex ? '18px' : '6px',
                    height: '6px',
                    backgroundColor: idx === activeImageIndex ? '#111' : '#d1d5db',
                  }}
                />
              ))}
            </div>
          )}

          {productName && (
            <p
              className="text-center text-gray-400 leading-snug px-1"
              style={{
                fontSize: '10px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {productName}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}