import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const BASE_MEDIA_URL = 'https://your-cdn.com/'; // replace with your actual CDN base URL

// Static fallback images (used only when API has no banner data)
const FALLBACK_IMAGES = ['/1.svg', '/2.svg', '/3.svg', '/4.svg', '/5.svg'];

const LandingBanner = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // API provides data.home_middle_banner — array of banner objects with .media paths
  // Also data.home_header_banner is available for hero banners if needed
  const apiBanners = data?.home_middle_banner || [];
  const imageList =
    apiBanners.length > 0
      ? apiBanners.map((b) => `${BASE_MEDIA_URL}${b.media}`)
      : FALLBACK_IMAGES;

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

  if (imageList.length === 0) return null;

  // Determine grid columns based on number of banners (max 5)
  const colCount = Math.min(imageList.length, 5);
  const gridStyle = { gridTemplateColumns: `repeat(${colCount}, 1fr)` };

  return (
    <div className="w-full overflow-hidden">
      <div className="grid gap-0 h-48 md:h-64 lg:h-80" style={gridStyle}>
        {imageList.slice(0, 5).map((src, index) => (
          <div key={index} className="relative">
            <Image
              src={src}
              alt={`Banner ${index + 1}`}
              fill
              className="object-cover cursor-pointer hover:scale-110 transition-transform duration-700"
              onClick={() => setSelectedImage(src)}
              priority={index < 3}
              loading={index >= 3 ? 'lazy' : 'eager'}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
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
              <FiX size={20} />
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