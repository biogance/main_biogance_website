// components/LandingBanner.jsx
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

// Fallback (same rakho)
const ERROR_IMG_SRC = 'data:image/svg+xml;base64,...'; // tumhara wahi

const myImages = [
  '/1.svg',
  '/2.svg',
  '/3.svg',
  '/4.svg',
  '/5.svg',
];

const LandingBanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedImage]);

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-5 gap-0 h-48 md:h-64 lg:h-80">
        {myImages.map((imagePath, index) => (
          <div key={index} className="relative">
            <Image
              src={imagePath}
              alt={`Banner image ${index + 1}`}
              fill
              className="object-cover cursor-pointer hover:scale-110 transition-transform duration-700"
              onClick={() => setSelectedImage(imagePath)}
              priority={index < 3}
              loading={index >= 3 ? 'lazy' : 'eager'}
            />
          </div>
        ))}
      </div>

      {selectedImage && ( 
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors bg-white rounded-full p-1"
            >
              <FiX size={24} />
            </button>
            <Image
              src={selectedImage}
              alt="Preview"
              width={500}
              height={500}
              className="w-[500px] h-[500px] object-cover rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingBanner;