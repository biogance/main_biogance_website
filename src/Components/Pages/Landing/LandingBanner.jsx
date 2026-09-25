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

  const isLoading = !data;

  if (!isLoading && imageList.length === 0) return null;

  const colCount = isLoading ? 5 : Math.min(imageList.length, 5);
  const gridStyle = { gridTemplateColumns: `repeat(${colCount}, 1fr)` };

  return (
    // Gallery strip — images separated by 1px ink gaps, grayscale until
    // hovered, index number pinned to each frame's corner.
    <div className="w-full overflow-hidden bg-[#0c0c0c]">
      <div
        className="flex md:grid gap-px h-56 md:h-64 lg:h-[26rem] overflow-x-auto md:overflow-visible snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={gridStyle}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="relative shrink-0 w-[70%] sm:w-[40%] md:w-auto overflow-hidden bg-[#1c1c1b] animate-pulse" />
            ))
          : imageList.map((src, index) => (
          <div key={index} className="group relative shrink-0 w-[70%] sm:w-[40%] md:w-auto snap-start overflow-hidden bg-[#1c1c1b]">
            <Image
              src={src}
              alt={`Blog ${index + 1}`}
              fill
              className="object-cover cursor-pointer grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
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
            <span className="pointer-events-none absolute top-3 left-3 z-10 text-[10px] tracking-[0.22em] tabular-nums text-white mix-blend-difference">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 z-10 w-8 h-8 border border-white/70 text-white grid place-items-center text-lg leading-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              +
            </span>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-[#0c0c0c]/90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()} style={{ width: imgSize.width, height: imgSize.height }}>
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
              className="absolute top-2 right-2 bg-black/50 z-10 cursor-pointer w-9 h-9 grid place-items-center border border-white/60 text-white hover:bg-white hover:text-black transition-colors duration-200"
            >
              <FiX size={18} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              width={imgSize.width}
              height={imgSize.height}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingBanner;
