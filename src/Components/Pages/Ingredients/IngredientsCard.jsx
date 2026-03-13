"use client"

import React from 'react';
import { HiArrowRight } from 'react-icons/hi2';

export function IngredientCard({ image, title, tag, description }) {
  return (
   <div className="bg-white rounded-lg p-6 shadow-sm">
      {/* Regular img tag - no configuration needed */}
      <div className="w-32 h-32 mb-2">
        <img 
          src={typeof image === 'string' ? image : image.src} 
          alt={title} 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Title and Tag */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#393939]">{title}</h3>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap ml-3">
          {tag}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      
      {/* Learn More Button */}
      <button className="w-full py-3 border border-gray-300 rounded-lg text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer ">
        Learn More
      </button>
    </div>
  );
}