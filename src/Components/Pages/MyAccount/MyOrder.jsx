"use client"

import { useState, useEffect } from 'react';
import { CiSearch } from "react-icons/ci";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight
} from 'react-icons/md';

// Shimmer Card Component for Order Items
const OrderItemShimmer = () => (
  <div className="
    flex flex-col sm:flex-row sm:items-center
    justify-between gap-4 p-5
    border border-gray-200 rounded-xl
  ">
    {/* Left Section */}
    <div className="flex-1">
      {/* Order ID Shimmer */}
      <div
        style={{
          width: '100px',
          height: '24px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '8px'
        }}
      />
      
      {/* Date Shimmer */}
      <div
        style={{
          width: '170px',
          height: '16px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '12px'
        }}
      />
      
      {/* Status Shimmer */}
      <div
        style={{
          width: '90px',
          height: '28px',
          borderRadius: '6px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>

    {/* Right Section */}
    <div className="flex flex-col items-end gap-2 sm:min-w-[200px]">
      {/* Price Shimmer */}
      <div
        style={{
          width: '90px',
          height: '28px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
      
      {/* Items Count Shimmer */}
      <div
        style={{
          width: '60px',
          height: '16px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '8px'
        }}
      />
      
      {/* Button Shimmer */}
      <div
        style={{
          width: '130px',
          height: '44px',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>
  </div>
);

const Dropdown = ({ label, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={`
          flex items-center justify-between gap-2 
          min-w-[160px] px-4 py-2.5 
          bg-white border border-gray-200 rounded-lg 
          text-sm font-medium text-gray-700
          hover:border-gray-400 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
          transition-all duration-200
          cursor-pointer
          ${isOpen ? 'border-gray-400 shadow-sm' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected || label}</span>
        <MdOutlineKeyboardArrowDown 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={18}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10 bg-black/50 "
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="
            absolute right-0 top-full mt-2 z-20
            min-w-[180px] max-h-[280px] overflow-auto
            bg-white rounded-lg shadow-2xl border border-gray-200
            py-2 text-sm font-medium
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50
          ">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`
                  w-full text-left px-4 py-2.5
                  hover:bg-black hover:text-white
                  transition-colors duration-150
                  cursor-pointer
                  ${selected === option 
                    ? 'bg-gray-100 text-gray-900 font-semibold' 
                    : 'text-gray-700'
                  }
                `}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function MyOrder() {
  const [loadingState, setLoadingState] = useState('shimmer');

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setLoadingState('loaded');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const [orders] = useState([
    { id: '#ORD-001', date: 'January 8, 2025', status: 'Processing', price: 64.98, items: 4 },
    { id: '#ORD-002', date: 'January 10, 2025', status: 'Awaiting Confirmation', price: 49.50, items: 1 },
    { id: '#ORD-003', date: 'January 12, 2025', status: 'Delivered', price: 120.00, items: 5 },
    { id: '#ORD-004', date: 'January 12, 2025', status: 'Delivered', price: 120.00, items: 3 },
    { id: '#ORD-005', date: 'January 15, 2025', status: 'Delivered', price: 250.00, items: 10 },
    { id: '#ORD-006', date: 'January 20, 2025', status: 'Waiting for Shipment', price: 350.00, items: 8 },
    { id: '#ORD-007', date: 'January 22, 2025', status: 'Delivered', price: 75.00, items: 3 },
    { id: '#ORD-008', date: 'January 25, 2025', status: 'Delivered', price: 0.00, items: 2 },
    { id: '#ORD-009', date: 'January 30, 2025', status: 'Delivered', price: 90.00, items: 4 },
    { id: '#ORD-010', date: 'February 1, 2025', status: 'Delivered', price: 200.00, items: 12 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState('All Orders');
  const [selectedSort, setSelectedSort] = useState('Most Recent');

  const orderFilterOptions = [
    'All Orders',
    'Delivered',
    'Processing',
    'Scheduled for Delivery',
    'Awaiting Confirmation',
    'Waiting for Shipment'
  ];

  const sortOptions = [
    'Most Recent',
    'Oldest First',
    'Highest Amount',
    'Lowest Amount'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Processing':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Awaiting Confirmation':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Scheduled for Delivery':
      case 'Waiting for Shipment':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}} />

      <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
            <p className="text-sm text-gray-600 mt-1">View and track all your purchases</p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search here "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-12 pr-5 py-3 
          plz add shimmers         border border-gray-200 rounded-xl 
                  text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-300 
                  placeholder-gray-500 transition-all duration-200
                "
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <Dropdown
                label="All Orders"
                options={orderFilterOptions}
                selected={selectedOrderFilter}
                onSelect={setSelectedOrderFilter}
              />

              <Dropdown
                label="Sort By"
                options={sortOptions}
                selected={selectedSort}
                onSelect={setSelectedSort}
              />
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loadingState === 'shimmer' ? (
              // Show shimmer order items
              Array.from({ length: orders.length }).map((_, index) => (
                <OrderItemShimmer key={index} />
              ))
            ) : (
              // Show actual orders
              orders.map((order) => (
                <div
                  key={order.id}
                  className="
                    flex flex-col sm:flex-row sm:items-center
                    justify-between gap-4 p-5
                    border border-gray-200 rounded-xl
                    hover:border-gray-300 hover:shadow-sm
                    transition-all duration-200
                  "
                >
                  <div className="flex-1">
                    <div className="font-bold  text-lg text-gray-900">{order.id}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Placed on {order.date}
                    </div>
                    <span className={`
                      mt-2.5 inline-block px-3.5 py-1
                      text-xs font-medium rounded-full
                      ${getStatusColor(order.status)}
                    `}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-right sm:min-w-[180px]">
                    <div className="text-xl font-bold text-gray-900">
                      ${order.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {order.items} Items
                    </div>
                    <button className="
                      mt-4 w-full sm:w-auto
                      bg-gray-900 hover:bg-gray-800
                      text-white text-sm font-medium
                      px-6 py-2.5 rounded-lg
                      transition-colors duration-200
                    ">
                      More Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-10">
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <MdOutlineKeyboardDoubleArrowLeft size={22} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <MdOutlineKeyboardArrowLeft size={22} />
            </button>
            
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-gray-900 text-white rounded-lg font-medium">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              3
            </button>
            
            <span className="px-3 text-gray-500">...</span>
            
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              11
            </button>
            
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <MdOutlineKeyboardArrowRight size={22} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <MdOutlineKeyboardDoubleArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}