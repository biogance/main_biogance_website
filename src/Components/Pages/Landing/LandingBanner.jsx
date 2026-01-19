// components/LandingBanner.jsx   ← Pure JSX, clean, working JSX

import React, { useEffect, useState } from 'react';

// Fallback image (jab image load na ho)
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4=';

const ImageWithFallback = ({ src, alt = '', className = '', onClick, ...rest }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} onClick={onClick} {...rest}>
        <img src={ERROR_IMG_SRC} alt="Failed to load" className="w-20 h-20 opacity-30" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      onClick={onClick}
      loading="lazy"
      {...rest}
    />
  );
};

// Apne images ka path (Next.js mein /public folder se directly access hota hai)
const myImages = [
  '/1.svg', '/2.svg', '/3.svg', '/4.svg', '/5.svg' ];

const LandingBanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);

   useEffect(() => {
    if (selectedImage) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedImage]);

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-5 gap-0 h-48 md:h-64 lg:h-80">
        {myImages.map((imagePath, index) => (
          <div key={index} className="relative">
            <ImageWithFallback
              src={imagePath}
              alt={`Banner image ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-700"
              onClick={() => setSelectedImage(imagePath)}
            />
          </div>
        ))}
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img src={selectedImage} alt="Preview" className="w-[500px] max-h-full" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white text-xl bg-transparent bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingBanner;