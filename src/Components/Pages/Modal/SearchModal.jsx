import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import styled, { keyframes } from 'styled-components';
import SearchBar from './SearchBar';

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
  <div className="flex gap-4 items-start hover:bg-gray-50 -mx-2 px-2 py-3 rounded-lg transition-colors">
    {/* Image area with spinner */}
    <div className="w-22 h-22 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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

// Sample Data
const recentSearches = [
  'Behavior',
  'Health',
  'Tips & Tricks',
  'Hygiene',
  'For Cats',
  'For Nacs',
  'For Dog',
  'Education',
];

const popularProducts = [
  {
    id: 1,
    name: 'Refreshing mist for dogs and cats - FreshMist',
    size: '250ml',
    originalPrice: '€15.00',
    price: '€12.60',
    image:
      'https://images.unsplash.com/photo-1608571899793-a1c0c27a7555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzcHJheSUyMGJvdHRsZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY0OTEzNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Refreshing mist for dogs and cats - FreshMist',
    size: '250ml',
    price: '€12.60',
    image:
      'https://images.unsplash.com/photo-1608571899793-a1c0c27a7555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzcHJheSUyMGJvdHRsZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY0OTEzNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: 'Refreshing mist for dogs and cats - FreshMist',
    size: '250ml',
    price: '€12.60',
    image:
      'https://images.unsplash.com/photo-1608571899793-a1c0c27a7555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzcHJheSUyMGJvdHRsZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY0OTEzNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const bestSellingProducts = [
  {
    id: 4,
    name: 'Refreshing mist for dogs and cats - FreshMist',
    size: '250ml',
    price: '€12.60',
    image:
      'https://images.unsplash.com/photo-1608571899793-a1c0c27a7555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzcHJheSUyMGJvdHRsZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY0OTEzNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    name: 'Refreshing mist for dogs and cats - FreshMist',
    size: '250ml',
    price: '€12.60',
    image:
      'https://images.unsplash.com/photo-1608571899793-a1c0c27a7555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzcHJheSUyMGJvdHRsZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY0OTEzNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 6,
    name: 'Refreshing mist for dogs and cats - FreshMist',
    size: '250ml',
    originalPrice: '€15.00',
    price: '€12.60',
    image:
      'https://images.unsplash.com/photo-1608571899793-a1c0c27a7555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzcHJheSUyMGJvdHRsZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY0OTEzNzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const RecentSearches = ({ searches }) => (
  <div className="mb-8 max-w-4xl mx-auto">
    <h3 className="text-sm font-medium text-gray-800 mb-4">Recent Search</h3>
    <div className="flex flex-wrap gap-2">
      {searches.map((search, index) => (
        <button
          key={index}
          className="px-4 py-2 cursor-pointer bg-transparent border border-gray-300 rounded-4xl text-gray-700 text-sm hover:bg-gray-200 transition-colors"
        >
          {search}
        </button>
      ))}
    </div>
  </div>
);

const ProductItem = ({ product }) => (
  <div
    key={product.id}
    className="flex gap-4 items-start hover:bg-gray-50 -mx-2 px-2 py-3 rounded-lg transition-colors cursor-pointer"
  >
    <div className="w-22 h-22 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
      <ImageWithFallback
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <h4 className="text-sm font-normal text-gray-800 mb-2">{product.name}</h4>
      <span className="inline-block text-xs bg-[#f1f1f1] border border-gray-300 px-2 py-1 rounded-full text-gray-700 w-fit mb-2">
        {product.size}
      </span>
      <div className="flex items-center gap-2">
        {product.originalPrice && (
          <span className="text-sm text-gray-400 line-through">
            {product.originalPrice}
          </span>
        )}
        <span className="text-base font-semibold text-gray-900">
          {product.price}
        </span>
      </div>
    </div>
  </div>
);

const ProductList = ({ title, products, isLoading }) => (
  <div>
    <h3 className="text-lg font-semibold mb-6 text-gray-900">{title}</h3>
    <div className="space-y-5">
      {isLoading ? (
        // Show 3 loading items
        Array.from({ length: 3 }).map((_, index) => (
          <LoadingProductItem key={index} />
        ))
      ) : (
        products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))
      )}
    </div>
  </div>
);



export const SearchModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Reset loading state when modal opens
      setIsLoading(true);
      
      // Simulate loading for 3 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
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
          className="absolute top-6 cursor-pointer right-6 text-gray-500 hover:text-gray-800 transition-colors z-10"
        >
          <IoClose className="w-7 h-7" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Search Bar */}
          <SearchBar />

          {/* Recent Searches */}
          <RecentSearches searches={recentSearches} />

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Popular Products */}
            <ProductList 
              title="Popular Products" 
              products={popularProducts}
              isLoading={isLoading}
            />

            {/* Best Selling */}
            <ProductList 
              title="Best Selling" 
              products={bestSellingProducts}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

