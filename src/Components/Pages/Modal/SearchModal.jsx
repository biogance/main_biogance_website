import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import SearchBar from './SearchBar'; // Assuming SearchBar is in the same folder

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

const ProductList = ({ title, products }) => (
  <div>
    <h3 className="text-lg font-semibold mb-6 text-gray-900">{title}</h3>
    <div className="space-y-5">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  </div>
);

export const SearchModal = ({ isOpen, onClose }) => {
  // The App component is just for demonstration and should be removed
  // if this modal is used within a larger application structure.
  const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Open Search
        </button>
        <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="w-full h-full overflow-y-auto relative">
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
            <ProductList title="Popular Products" products={popularProducts} />

            {/* Best Selling */}
            <ProductList title="Best Selling" products={bestSellingProducts} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SearchModal;