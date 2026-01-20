// components/LandingBanner.jsx
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

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
              // Yeh important changes
              priority={index < 3}           // pehle 3 images jaldi load (LCP better)
              loading={index >= 3 ? 'lazy' : 'eager'} // ya sirf priority use karo
              // placeholder="blur"         // agar low-res blur chahiye (SVG pe limited kaam karta hai)
              // unoptimized={true}         // agar SVG optimize nahi karna chahte (default false rakho)
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Preview"
              width={800}          // ya jo bhi max size chahiye
              height={800}
              className="max-w-full max-h-[80vh] object-contain"
            />
           <button
  onClick={() => setSelectedImage(null)}
  className="
    absolute 
    top-4 right-4              // mobile pe right-4 (safe margin)
    md:right-12                 // medium screens pe thoda zyada space
    lg:right-12                // large screens pe aur thoda adjust
    xl:right-20                // large screens pe aur thoda adjust
    text-white 
    text-2xl md:text-2xl       // mobile pe chhota, badi screen pe bada
    bg-black/50 
    rounded-full 
    w-10 h-10 md:w-12 md:h-12  // size bhi responsive
    flex items-center justify-center 
    cursor-pointer 
    hover:bg-black/50          // optional: hover effect
    transition-colors duration-200
    z-50                       // ensure button content ke upar rahe
  "
>
  ×
</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingBanner;