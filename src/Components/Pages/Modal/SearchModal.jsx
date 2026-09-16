"use client"

import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import styled, { keyframes } from 'styled-components';
import SearchBar from './SearchBar';
import { useTranslation } from 'react-i18next';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { getDeviceId } from '../../../utils/deviceId';
import { mergeCartItem } from '../../../utils/cartStorage';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ModalAddToCart from './ModalAddToCart';

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

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Spinner animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Base Shimmer component
const ShimmerBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
`;

// Spinner component
const Spinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #000000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} 0.8s linear infinite;
`;

// Loading Product Item Component
const LoadingProductItem = () => (
  <div className="flex gap-4 items-start hover:bg-gray-50 -mx-2 px-2 py-3  transition-colors">
    {/* Image area with spinner */}
    <div className="w-22 h-22 bg-gray-100  flex items-center justify-center flex-shrink-0 overflow-hidden">
      <Spinner />
    </div>
    
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      {/* Product name shimmer */}
      <ShimmerBase 
        style={{ 
          width: '100%',
          height: '14px',
          marginBottom: '8px',
          borderRadius: '4px'
        }} 
      />
      
      {/* Size badge shimmer */}
      <ShimmerBase 
        style={{ 
          width: '60px',
          height: '24px',
          borderRadius: '9999px',
          marginBottom: '8px'
        }} 
      />
      
      {/* Price shimmer */}
      <div className="flex items-center gap-2">
        <ShimmerBase 
          style={{ 
            width: '50px',
            height: '14px',
            borderRadius: '4px'
          }} 
        />
        <ShimmerBase 
          style={{ 
            width: '60px',
            height: '16px',
            borderRadius: '4px'
          }} 
        />
      </div>
    </div>
  </div>
);

const SearchTags = ({ items, label, onSelect }) => (
  <div className="mb-8 max-w-4xl mx-auto">
    <h3 className="text-sm font-medium text-gray-800 mb-4">{label}</h3>
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
            className="px-4 py-2 cursor-pointer bg-transparent border border-gray-300  text-gray-700 text-sm hover:bg-gray-200 transition-colors"
          >
            {displayText}
          </button>
        );
      })}

      {/* {items.map((item, index) => {
  const displayText = item.length > 20 ? item.slice(0, 20) + '...' : item;

  return (
    <button
      key={index}
      title={item}
      className="px-4 py-2 cursor-pointer bg-transparent border border-gray-300 rounded-4xl text-gray-700 text-sm hover:bg-gray-200 transition-colors"
    >
      {displayText}
    </button>
  );
})} */}
    </div>
  </div>
);

const ProductItem = ({ product, onNavigate, onAddedToCart }) => {
  const { t, i18n } = useTranslation('searchmodal');
  const firstImage = product.products?.[0]?.images?.[0];
  const imageUrl = firstImage ? `${MEDIA_URL}${firstImage.media}` : null;
  const displayName = i18n.language === 'fr' ? product.french_name || product.name : product.name;
  const slug = i18n.language === 'fr' ? product.french_seo_keyword : (product.english_seo_keyword || product.english_seo_keyboard);
  const variant = product.products?.[0];
  const price = toCleanAmount(variant?.price ?? product.price);
  const [adding, setAdding] = useState(false);

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
        toast.error(data.action || 'Could not add to cart.');
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
      className="flex gap-4 items-start hover:bg-gray-50 -mx-2 px-2 py-3  transition-colors cursor-pointer">
      <div className="w-22 h-22 bg-gray-100  flex items-center justify-center flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 " />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-sm font-normal text-gray-800 mb-2">{displayName}</h4>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm text-gray-900">
            <span className="font-semibold">{formatPrice(price, i18n.language)} €</span>
            {variant?.size_name && (
              <span className="text-xs text-gray-500">· {variant.size_name}</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="shrink-0 border border-gray-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-900 cursor-pointer transition-colors hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? (
              <Spinner style={{ width: 12, height: 12 }} />
            ) : (
              t('addToCart', { defaultValue: 'Add to Cart' })
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ title, products, isLoading, onNavigate, onAddedToCart }) => (
  <div>
    <h3 className="text-lg font-semibold mb-6 text-gray-900">{title}</h3>
    <div className="space-y-5">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <LoadingProductItem key={index} />
        ))
      ) : (
        products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            onAddedToCart={onAddedToCart}
          />
        ))
      )}
    </div>
  </div>
);

export const SearchModal = ({ isOpen, onClose, categories = [] }) => {
  const { t } = useTranslation('searchmodal');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [popularProducts, setPopularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [searchTags, setSearchTags] = useState([]);
  const [searchTagsLabel, setSearchTagsLabel] = useState('');
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
              setSearchTagsLabel(t('recentSearch'));
            } else {
              setSearchTags(data.data.trending || []);
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
        `}
      </style>
      <div className="w-full h-full overflow-y-auto relative hide-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-5 lg:top-6 lg:right-6 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors z-10"
        >
          <IoClose className="w-7 h-7" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Search Bar */}
          <SearchBar
            key={isOpen ? 'open' : 'closed'}
            categories={categories}
            onSearchComplete={onClose}
          />

          {/* Recent or Trending Searches */}
          {searchTags.length > 0 && (
            <SearchTags items={searchTags} label={searchTagsLabel} onSelect={handleTagSearch} />
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
        </div>
      </div>

      <ModalAddToCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        autoCloseOnLeave
      />
    </div>
  );
};