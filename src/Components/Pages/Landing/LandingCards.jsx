import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoChevronBack, IoChevronForward, IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useTopLoader } from '../TopLoader';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';
 

// Loading Card Component
const LoadingCard = () => (
  <div className="w-full">
    <div
      className="rounded-2xl border border-gray-200 p-3 relative mb-3 aspect-[5/6]"
      style={{
        backgroundColor: '#f9fafb',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    >
      <div className="absolute top-3 left-3 w-14 h-6 rounded-md bg-gray-300 animate-pulse" />
      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-gray-300 animate-pulse" />
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

export const LandingCards = ({ product, showNav, squareCard }) => {
  const { t, i18n } = useTranslation('home');
  const displayName = i18n.language === 'fr' && product.french_name ? product.french_name : product.name;
  const router = useRouter();
  const { start } = useTopLoader();
  const videoRef = useRef(null);

  const [isLiked, setIsLiked] = useState(product.liked || false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (loadingFav) return;
    setLoadingFav(true);
    try {
      const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
      const payload = {};
      if (loginData?.data?.token) {
        payload.token = loginData.data.token;
      } else {
        payload.device_id = getDeviceId();
      }
      const res = await axios.post(`${BASE_URL}/user/add/favorite/bundle/${product.id}`, payload);
      if (res.data.status === false) {
        const msg = res.data.errors?.length > 0 ? res.data.errors[0].message : res.data.action;
        toast.error(msg);
      } else {
      
        setIsLiked(prev => !prev);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingFav(false);
    }
  };

  // slides: first image, then video (if any), then rest of images
  const firstImage = product.images?.[0];
  const restImages = product.images?.slice(1) || [];
  const videoUrl = product.videoUrl || null;

  const slides = [
    ...(firstImage ? [{ type: 'image', url: firstImage }] : []),
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : []),
    ...restImages.map(url => ({ type: 'image', url })),
  ];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleMouseEnter = () => {
    if (!videoUrl) return;
    setCurrentImageIndex(1); // video is always at index 1
  };

  const handleMouseLeave = () => {
    if (!videoUrl) return;
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    if (slides[currentImageIndex]?.type === 'video') {
      setMediaLoading(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      setMediaLoading(false);
      if (videoRef.current) videoRef.current.pause();
    }
  }, [currentImageIndex]);

  const currentSlide = slides[currentImageIndex];

  return (
    <div className="w-full h-full flex flex-col">
      <div
       className={`bg-gray-50 rounded-2xl border border-gray-200 relative mb-3 aspect-[5/6] flex flex-col`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {product.discount && (
          <div className="absolute top-3 left-3 bg-green-50 text-black border border-green-200 text-xs font-semibold px-2 py-1 rounded-md z-10">
            {product.discount}
          </div>
        )}

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 cursor-pointer w-8 h-8 bg-white rounded-xl border border-gray-200 flex items-center justify-center z-10 hover:bg-gray-50 transition-colors"
        >
          {isLiked ? (
            <FaHeart className="w-4 h-4 text-black" />
          ) : (
            <FaRegHeart className="w-4 h-4 text-gray-700" />
          )}
        </button>

        <div className="flex-1 flex items-center justify-center relative px-8 py-4 overflow-hidden rounded-2xl">
          {showNav && slides.length > 1 && currentSlide?.type !== 'video' && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-0 w-7 h-7 bg-transparent flex items-center justify-center z-20 transition-all opacity-70 hover:opacity-100 cursor-pointer"
              >
                <IoChevronBack className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-0 w-7 h-7 bg-transparent flex items-center justify-center z-20 transition-all opacity-70 hover:opacity-100 cursor-pointer"
              >
                <IoChevronForward className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50">
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '3px solid rgba(0,0,0,.1)',
                borderLeftColor: 'transparent',
                animation: 'spin89345 1s linear infinite',
              }} />
            </div>
          )}

          {currentSlide?.type === 'video' ? (
            <video
              ref={videoRef}
              src={currentSlide.url}
              className="w-full h-full object-cover absolute inset-0 cursor-pointer"
              muted
              playsInline
              loop
              onCanPlay={() => setMediaLoading(false)}
              onClick={() => { start(); router.push(`/product-detail?id=${product.id}`); }}
            />
          ) : (
            <img
              src={currentSlide?.url || product.image}
              alt={product.name}
              onLoad={() => setMediaLoading(false)}
              onError={() => setMediaLoading(false)}
              onClick={() => { start(); router.push(`/product-detail?id=${product.id}`); }}
              className={`cursor-pointer ${
                currentImageIndex === 0
                  ? 'max-w-full max-h-full object-contain'
                  : 'w-full h-full object-cover absolute inset-0'
              }`}
            />
          )}
        </div>

        {slides.length > 1 && (
          <div className={`${currentImageIndex === 0 ? 'flex justify-center gap-1 py-2' : 'absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10'}`}>
            {slides.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-black' : 'bg-gray-300'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
          {displayName}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-gray-900">
            €{product.price}
          </span>
          <button className="bg-black text-white cursor-pointer text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
            {t('products.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PopularProducts({ 
  title = 'Popular Products', 
  isWishlist = false, 
  isFavourite = false, 
  isHorizontal = false,
  isBestSeller = false,
  onTabChange,
  data
}) {
  const { t } = useTranslation('home');
 
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorite');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const apiProducts = data?.popular || [];
  const bestSellerProducts = data?.best_seller || [];
  
  const mapProducts = (items) => items.map(item => ({
    id: item.id,
    name: item.name,
    french_name: item.french_name || '',
    price: item.price || (item.products?.[0]?.price) || '0',
    discount: item.discount || (item.products?.[0]?.off) || '',
    image: item.image || (item.products?.[0]?.images[0]?.media ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}` : '/product1.svg'),
    images: item.images || (item.products?.[0]?.images?.map(img => `https://d18f57oyxifcsh.cloudfront.net/${img.media}`) || ['/product1.svg']),
    videoUrl: item.products?.[0]?.video?.media ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].video.media}` : null,
    liked: item.liked ?? item.favorites_exists
  }));

  const products = isBestSeller ? mapProducts(bestSellerProducts) : mapProducts(apiProducts);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      setIsLoading(true);
      return;
    }

    const imageUrls = products.flatMap(product => product.images);
    const imagePromises = imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = url;
      });
    });

    Promise.all([
      Promise.all(imagePromises), 
      new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 100);
    });

    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(checkScrollPosition, 100);
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, [products]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [isLoading]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer { 
          0% { background-position: -200px 0; } 
          100% { background-position: 200px 0; } 
        }
        @keyframes spin89345 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hide-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
        .hide-scrollbar::-webkit-scrollbar { 
          display: none; 
        }
      `}} />

      <div className={
        isFavourite ? "px-4 py-6" : 
        isWishlist ? "px-4 py-6" : 
        "px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10"
      }>
        {isFavourite ? null : isWishlist ? (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t('products.wishlistTitle')}
              </h1>
              <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black transition-colors self-start cursor-pointer">
                <IoClose className="w-5 h-5" />
                <span>{t('products.removeAll')}</span>
              </button>
            </div>

            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => { setActiveTab('favorite'); onTabChange?.('favorite'); }}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                  activeTab === 'favorite'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {t('products.favoriteProducts')}
              </button>
              <button
                onClick={() => { setActiveTab('advice'); onTabChange?.('advice'); }}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap cursor-pointer ${
                  activeTab === 'advice'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {t('products.favoriteAdvices')}
              </button>
            </div>
          </div>
        ) : isHorizontal ? (
          <div className="flex justify-end mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('prev')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-400 cursor-not-allowed'
                }`}
              >
                <IoChevronBack className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={() => scroll('next')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-400 cursor-not-allowed'
                }`}
              >
                <IoChevronForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title} ›</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('prev')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
              >
                <IoChevronBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scroll('next')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
                    : 'bg-white border border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
              >
                <IoChevronForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div 
          ref={scrollContainerRef} 
          className={
            isFavourite || isWishlist
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              : isHorizontal
              ? "flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
              : "flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
          }
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className={
                  isFavourite || isWishlist
                    ? "w-full"
                    : "flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                }
              >
                <LoadingCard />
              </div>
            ))
            : products.map((product) => (
              <div 
                key={product.id} 
                className={
                  isFavourite || isWishlist
                    ? "w-full"
                    : "flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                }
              >
                <LandingCards product={product} showNav={true} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}