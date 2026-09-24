"use client"

import React, { useState, useEffect } from 'react';
import {
  IoClose,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoBagAddOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import SearchBar from './SearchBar';
import { useTranslation } from 'react-i18next';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';
import { mergeCartItem } from '../../../utils/cartStorage';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ModalAddToCart from './ModalAddToCart';
import { FiShoppingCart } from 'react-icons/fi';

const toCleanAmount = (val) => {
  if (typeof val === 'number') return val;
  return parseFloat(String(val ?? '0').replace(',', '.')) || 0;
};
const formatPrice = (val, lang) => {
  const num = toCleanAmount(val);
  const locale = lang && lang.startsWith('fr') ? 'fr-FR' : 'en-US';
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
};

const ImageWithFallback = ({ src, alt, className, fallback = '/fallback-logo.png' }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => { e.currentTarget.src = fallback; }}
    />
  );
};

// One shimmer block — every skeleton here is built from this.
const Bone = ({ w, h, className = '' }) => (
  <span
    className={`block bg-black/[0.06] ${className}`}
    style={{ width: w, height: h, animation: 'searchShimmer 1.5s ease-in-out infinite' }}
  />
);

const Spinner = ({ size = 12 }) => (
  <span
    className="inline-block rounded-full border-2 border-white/40 border-t-white animate-spin"
    style={{ width: size, height: size }}
  />
);

const IMG_SIZE = 88;

// Mirrors the product row 1-to-1: image box + name + price/button row.
const LoadingProductItem = () => (
  <div className="flex gap-4 items-center p-3 bg-white">
    <Bone w={IMG_SIZE} h={IMG_SIZE} className="shrink-0" />
    <div className="flex-1 min-w-0">
      <Bone w="85%" h={13} className="mb-2" />
      <Bone w="50%" h={13} className="mb-3" />
      <div className="flex items-center justify-between gap-3">
        <Bone w={64} h={14} />
        <Bone w={118} h={32} className="shrink-0" />
      </div>
    </div>
  </div>
);

const LoadingSearchTags = () => (
  <div>
    <Bone w={130} h={11} className="mb-3" />
    <div className="flex flex-wrap gap-2">
      {[84, 96, 72, 90, 78, 100, 70, 88].map((w, i) => (
        <Bone key={i} w={w} h={32} />
      ))}
    </div>
  </div>
);

const SearchTags = ({ items, label, recent, onSelect }) => {
  const Icon = recent ? IoTimeOutline : IoTrendingUpOutline;
  return (
    <div>
      <h3 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880] mb-3">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const words = item.trim().split(/\s+/);
          const displayText = words.length > 2 ? words.slice(0, 2).join(' ') + '...' : item;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect?.(item)}
              title={item}
              className="group inline-flex items-center gap-1.5 h-8 px-3.5 bg-black/[0.045] text-[#3a3835] text-[12.5px] font-medium transition-colors duration-200 hover:bg-[#0b0b0a] hover:text-white cursor-pointer"
            >
              <span className="text-[#8a8880] font-bold group-hover:text-white/60">#</span>
              {displayText}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ProductItem = ({ product, index, onNavigate, onAddedToCart }) => {
  const { t, i18n } = useTranslation('searchmodal');
  const firstImage = product.products?.[0]?.images?.[0];
  const imageUrl = firstImage ? `${MEDIA_URL}${firstImage.media}` : null;
  const displayName = i18n.language === 'fr' ? product.french_name || product.name : product.name;
  const slug = i18n.language === 'fr' ? product.french_seo_keyword : (product.english_seo_keyword || product.english_seo_keyboard);
  const variant = product.products?.[0];
  const price = toCleanAmount(variant?.price ?? product.price);
  const [adding, setAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    if (!imageUrl) { setImageLoaded(true); return; }
    const img = new window.Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
    img.src = imageUrl;
  }, [imageUrl]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      const loginData = localStorage.getItem('LoginData');
      const token = loginData ? JSON.parse(loginData)?.data?.token : null;
      const res = await fetch(`${BASE_URL}/user/cart/create`, {
        method: 'POST',
        headers: token
          ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          : { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          token
            ? { product_id: variant?.id ?? product.id, quantity: 1 }
            : { device_id: getDeviceId(), product_id: variant?.id ?? product.id, quantity: 1 },
        ),
      });
      const data = await res.json();
      if (data.status === false) {
        toast.error(data.action_message || data.action || 'Could not add to cart.');
      } else {
        mergeCartItem(data.data);
        onAddedToCart();
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => onNavigate(slug || product.id)}
      className="group flex gap-4 items-center p-3 bg-white border border-black/[0.06] hover:border-black/25 transition-[border-color,box-shadow] duration-300 hover:shadow-[0_22px_44px_-28px_rgba(0,0,0,.4)] cursor-pointer"
    >
      <div className="relative bg-[#f3f3f3] overflow-hidden shrink-0" style={{ width: IMG_SIZE, height: IMG_SIZE }}>
        {!imageLoaded && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#f3f3f3]">
            <span className="w-5 h-5 rounded-full border-[3px] border-black/25 border-t-transparent animate-spin" />
          </div>
        )}
        {imageUrl ? (
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#f3f3f3]" />
        )}
        <span className="absolute top-0 left-0 z-[2] px-1.5 py-0.5 bg-[#0b0b0a] text-white text-[10px] font-semibold tabular-nums">
          {String(index).padStart(2, '0')}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-[13px] font-semibold leading-snug text-[#0b0b0a] line-clamp-2 mb-2.5">{displayName}</h4>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-baseline gap-1.5 text-[#0b0b0a] min-w-0">
            <span className="text-[13.5px] font-bold tabular-nums">{formatPrice(price, i18n.language)} €</span>
            {variant?.size_name && (
              <span className="text-[11.5px] text-[#8a8880] truncate">· {variant.size_name}</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="shrink-0 relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.06em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] cursor-pointer transition-all duration-200 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none"
            style={{ width: 118, height: 32 }}
          >
            <span className="inline-flex items-center gap-1.5" style={{ visibility: adding ? 'hidden' : 'visible' }}>
              <FiShoppingCart className="w-3.5 h-3.5" />
              {t('addToCart', { defaultValue: 'Add to Cart' })}
            </span>
            {adding && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size={13} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ title, products, isLoading, onNavigate, onAddedToCart }) => (
  <section>
    {/* Title always rendered so shimmer and real layout occupy identical vertical space */}
    <div className="flex items-center gap-3 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#0b0b0a] shrink-0" />
      <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#0b0b0a]">
        {isLoading ? <Bone w={120} h={14} /> : title}
      </h3>
      <span className="flex-1 h-px bg-black/10" />
      {!isLoading && products.length > 0 && (
        <span className="text-[11px] font-semibold text-[#8a8880] tabular-nums">{products.length}</span>
      )}
    </div>
    <div className="flex flex-col gap-3">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <LoadingProductItem key={index} />
        ))
      ) : (
        products.map((product, i) => (
          <ProductItem
            key={product.id}
            product={product}
            index={i + 1}
            onNavigate={onNavigate}
            onAddedToCart={onAddedToCart}
          />
        ))
      )}
    </div>
  </section>
);

export const SearchModal = ({ isOpen, onClose, categories = [] }) => {
  const { t } = useTranslation('searchmodal');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [popularProducts, setPopularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [searchTags, setSearchTags] = useState([]);
  const [searchTagsLabel, setSearchTagsLabel] = useState('');
  const [searchTagsRecent, setSearchTagsRecent] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleNavigate = (slug) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  const handleTagSearch = (term) => {
    onClose();
    router.push(`/shop?source=search&q=${encodeURIComponent(term)}`);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);

      const loginData = localStorage.getItem('LoginData');
      const token = loginData ? JSON.parse(loginData)?.data?.token : null;
      const body = token ? { token } : { device_id: getDeviceId() };

      fetch(`${BASE_URL}/web/search/main`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status && data.data) {
            setPopularProducts(data.data.popular || []);
            setBestSellingProducts(data.data.best_seller || []);
            const recent = data.data.recent || [];
            if (recent.length > 0) {
              setSearchTags(recent);
              setSearchTagsRecent(true);
              setSearchTagsLabel(t('recentSearch'));
            } else {
              setSearchTags(data.data.trending || []);
              setSearchTagsRecent(false);
              setSearchTagsLabel(t('trendingSearch', { defaultValue: 'Trending Searches' }));
            }
          } else {
            toast.error(data.action_message || data.action || 'Something went wrong.');
          }
        })
        .catch(() => toast.error('Something went wrong.'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          @keyframes searchShimmer { 0%, 100% { opacity: .4; } 50% { opacity: .9; } }
        `}
      </style>

      <div className="w-full h-full overflow-y-auto relative hide-scrollbar">
        {/* Top bar — logo centred, ESC on the right */}
        <div className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 h-16 md:h-[72px] bg-white/90 backdrop-blur border-b border-black/[0.06]">
          <span aria-hidden="true" />
          <Link
            href="/"
            onClick={onClose}
            className="flex-shrink-0 cursor-pointer flex items-center"
          >
            <ImageWithFallback
              src="/logo.svg"
              alt="Biogance Logo"
              className="h-7 sm:h-10"
            />
          </Link>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center gap-2 h-7 pl-1.5 pr-1.5 border border-black/12 text-[11px] font-semibold tracking-[0.08em] text-[#5c5a54] bg-white hover:bg-[#0b0b0a] hover:text-white hover:border-[#0b0b0a] transition-colors cursor-pointer"
            >
             
              <IoClose className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Search section — white */}
        <section className="relative bg-white px-4 md:px-8 pt-8 md:pt-6 pb-8 md:pb-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <h2 className="text-[28px] sm:text-[34px] md:text-[46px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#0b0b0a]">
                {t('searchHeading1')}
                <br />
                <span className="text-black/30">{t('searchHeading2')}</span>
              </h2>
              <p className="mt-3 md:mt-4 px-2 sm:px-0 text-[13.5px] md:text-[15px] leading-relaxed text-[#8a8880]">
                {t('searchDescription')}
              </p>
            </div>

            <SearchBar
              key={isOpen ? 'open' : 'closed'}
              categories={categories}
              onSearchComplete={onClose}
            />

            <div className="mt-8">
              {isLoading ? (
                <LoadingSearchTags />
              ) : searchTags.length > 0 && (
                <SearchTags
                  items={searchTags}
                  label={searchTagsLabel}
                  recent={searchTagsRecent}
                  onSelect={handleTagSearch}
                />
              )}
            </div>
          </div>
        </section>

        {/* Products — carousels on a grey canvas */}
        <section className="bg-[#f3f3f3] px-4 md:px-8 py-10 md:py-12 min-h-[40vh]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <ProductList
              title={t('popularProducts')}
              products={popularProducts}
              isLoading={isLoading}
              onNavigate={handleNavigate}
              onAddedToCart={() => setIsCartOpen(true)}
            />
            <ProductList
              title={t('bestSelling')}
              products={bestSellingProducts}
              isLoading={isLoading}
              onNavigate={handleNavigate}
              onAddedToCart={() => setIsCartOpen(true)}
            />
          </div>
        </section>
      </div>

      <ModalAddToCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        autoCloseOnLeave
      />
    </div>
  );
};
