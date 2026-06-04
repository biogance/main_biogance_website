import { MEDIA_URL } from '@/Components/API/API';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const LandingBanner = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const blogs = data?.blogs || [];
  const imageList = blogs.flatMap((blog) =>
    (blog.images || []).map((img) => `${MEDIA_URL}${img.media}`)
  ).slice(0, 5);

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

  const isLoading = !data && !(typeof window !== 'undefined' && localStorage.getItem('homePageData'));

  if (!isLoading && imageList.length === 0) return null;

  const colCount = isLoading ? 5 : Math.min(imageList.length, 5);
  const gridStyle = { gridTemplateColumns: `repeat(${colCount}, 1fr)` };

  return (
    <div className="w-full overflow-hidden">
      <div className="grid gap-0 h-48 md:h-64 lg:h-80" style={gridStyle}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden bg-gray-200 animate-pulse" />
            ))
          : imageList.map((src, index) => (
          <div key={index} className="relative overflow-hidden">
            <Image
              src={src}
              alt={`Blog ${index + 1}`}
              fill
              className="object-cover cursor-pointer hover:scale-110 transition-transform duration-700"
              onClick={() => {
                const img = new window.Image();
                img.onload = () => {
                  const maxW = window.innerWidth * 0.9;
                  const maxH = window.innerHeight * 0.9;
                  const ratio = img.naturalWidth / img.naturalHeight;
                  let w = img.naturalWidth;
                  let h = img.naturalHeight;
                  if (w > maxW) { w = maxW; h = w / ratio; }
                  if (h > maxH) { h = maxH; w = h * ratio; }
                  setImgSize({ width: Math.round(w), height: Math.round(h) });
                  setSelectedImage(src);
                };
                img.src = src;
              }}
              priority={index < 3}
              loading={index >= 3 ? 'lazy' : 'eager'}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()} style={{ width: imgSize.width, height: imgSize.height }}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors bg-white rounded-full p-1"
            >
              <FiX size={20} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              width={imgSize.width}
              height={imgSize.height}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingBanner;