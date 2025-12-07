import React, { useState, useRef, useEffect } from 'react';
import { IoSearch, IoChevronDown } from 'react-icons/io5';

const SearchBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Select Category');
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const categories = ['Select Category', 'Dogs', 'Cats', 'Horses', 'Small Mammals'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target)) &&
        (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target))
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-4 md:p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-0">
          <input
            type="text"
            placeholder="Search for Products"
            className="flex-1 border border-gray-300 text-gray-700 rounded-l-lg px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-400"
          />
          <div className="relative border-l-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="appearance-none cursor-pointer border-y border-r border-gray-300 px-6 py-3.5 pr-12 text-sm text-gray-500 bg-white focus:outline-none focus:border-gray-400 transition-colors h-full min-w-[180px] text-left"
            >
              {selectedCategory}
            </button>
            <IoChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg z-10 overflow-hidden">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                    className="px-6 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-black hover:text-white transition-colors"
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="bg-black text-white cursor-pointer rounded-r-lg px-8 py-3.5 hover:bg-gray-800 transition-colors flex items-center justify-center">
            <IoSearch className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          {/* Search Input with Button */}
          <div className="flex gap-0">
            <input
              type="text"
              placeholder="Search for Products"
              className="flex-1 border border-gray-300 text-gray-700 rounded-l-lg px-3 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-400"
            />
            <button className="bg-black text-white cursor-pointer rounded-r-lg px-6 py-3 hover:bg-gray-800 transition-colors flex items-center justify-center">
              <IoSearch className="w-5 h-5" />
            </button>
          </div>

          {/* Category Dropdown - Full Width */}
          <div className="relative w-full" ref={mobileDropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full appearance-none cursor-pointer border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm text-gray-700 bg-white focus:outline-none focus:border-gray-400 transition-colors text-left"
            >
              {selectedCategory}
            </button>
            <IoChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg z-10 overflow-hidden">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                    className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-black hover:text-white transition-colors"
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;