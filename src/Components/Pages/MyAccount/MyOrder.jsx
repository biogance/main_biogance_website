"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CiSearch } from "react-icons/ci";
import toast from 'react-hot-toast';
import { BASE_URL } from '@/Components/API/API';
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
    border border-gray-200 
  ">
    {/* Left Section */}
    <div className="flex-1">
      {/* Order ID Shimmer */}
      <div
        style={{
          width: '100px',
          height: '24px',
        
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
          bg-white border border-gray-200  
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
            className="fixed inset-0 z-60 bg-black/50 "
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="
            absolute right-0 top-full mt-2 z-70
            min-w-[180px] max-h-[280px] overflow-auto
            bg-white  shadow-2xl border border-gray-200
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
  const { t } = useTranslation('myaccount');
  const [loadingState, setLoadingState] = useState('shimmer');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState(t('orderHistory.filters.allOrders'));
  const [selectedSort, setSelectedSort] = useState(t('orderHistory.sort.mostRecent'));
  const searchDebounceRef = useRef(null);

  const getSortParam = (sortLabel) => {
    if (sortLabel === t('orderHistory.sort.oldestFirst')) return 'oldest';
    if (sortLabel === t('orderHistory.sort.highestAmount')) return 'highest_amount';
    if (sortLabel === t('orderHistory.sort.lowestAmount')) return 'lowest_amount';
    return null;
  };

  const getStatusParam = (filterLabel) => {
    if (filterLabel === t('orderHistory.filters.allOrders')) return null;
    if (filterLabel === t('orderHistory.filters.delivered')) return 'Delivered';
    if (filterLabel === t('orderHistory.filters.processing')) return 'Processing';
    if (filterLabel === t('orderHistory.filters.scheduledForDelivery')) return 'Scheduled for Delivery';
    if (filterLabel === t('orderHistory.filters.awaitingConfirmation')) return 'Awaiting Confirmation';
    if (filterLabel === t('orderHistory.filters.waitingForShipment')) return 'Waiting for Shipment';
    return null;
  };

  const fetchOrders = useCallback(async (keyword, sortLabel, filterLabel, page = 1) => {
    setLoadingState('shimmer');
    try {
      const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
      const token = loginData?.data?.token;
     

      const body = {};
      if (keyword) body.keyword = keyword;
      const sort = getSortParam(sortLabel);
      if (sort) body.sort = sort;
      const status = getStatusParam(filterLabel);
      if (status) body.status = status;

      const res = await fetch(`${BASE_URL}/user/order/history?page=${page}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(body),
});

const data = await res.json().catch(() => null);



if (data && data.status === false) {
  toast.error(data.action || 'Something went wrong.');
  setOrders([]);
  setPagination({ current_page: 1, last_page: 1 });
  return;
}

if (!res.ok) {
  toast.error(data?.action || 'Something went wrong.');
  setOrders([]);
  setPagination({ current_page: 1, last_page: 1 });
  return;
}

const pagination = data?.data;
const list = pagination?.data;
setOrders(Array.isArray(list) ? list : []);
setPagination({ current_page: pagination?.current_page ?? 1, last_page: pagination?.last_page ?? 1 });
    } catch (e) {
    
      toast.error(e?.action || 'Something went wrong. Please try again.');
      setOrders([]);
    } finally {
      setLoadingState('loaded');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders('', selectedSort, selectedOrderFilter, 1);
  }, []);

  // Search debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchOrders(val, selectedSort, selectedOrderFilter, 1);
    }, 1000);
  };

  // Sort change
  const handleSortChange = (option) => {
    setSelectedSort(option);
    fetchOrders(searchQuery, option, selectedOrderFilter, 1);
  };

  // Filter change
  const handleFilterChange = (option) => {
    setSelectedOrderFilter(option);
    fetchOrders(searchQuery, selectedSort, option, 1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.last_page) return;
    fetchOrders(searchQuery, selectedSort, selectedOrderFilter, page);
  };

  const orderFilterOptions = [
    t('orderHistory.filters.allOrders'),
    t('orderHistory.filters.delivered'),
    t('orderHistory.filters.processing'),
    t('orderHistory.filters.scheduledForDelivery'),
    t('orderHistory.filters.awaitingConfirmation'),
    t('orderHistory.filters.waitingForShipment')
  ];

  const sortOptions = [
    t('orderHistory.sort.mostRecent'),
    t('orderHistory.sort.oldestFirst'),
    t('orderHistory.sort.highestAmount'),
    t('orderHistory.sort.lowestAmount')
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
    
    <div className="bg-gray-100">
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

    
      <div className="p-4 md:p-8 mt-2 md:mt-8 max-w-10xl mx-auto">
        <div className="bg-white  shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t('orderHistory.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('orderHistory.subtitle')}</p>
            
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={t('orderHistory.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="
                  w-full pl-12 pr-5 py-3
                 border border-gray-200 
                  text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-300
                  placeholder-gray-500 transition-all duration-200
                "
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <Dropdown
                label={t('orderHistory.filters.allOrders')}
                options={orderFilterOptions}
                selected={selectedOrderFilter}
                onSelect={handleFilterChange}
              />

              <Dropdown
                label={t('orderHistory.sort.label')}
                options={sortOptions}
                selected={selectedSort}
                onSelect={handleSortChange}
              />
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loadingState === 'shimmer' ? (
              Array.from({ length: 5 }).map((_, index) => (
                <OrderItemShimmer key={index} />
              ))
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] text-gray-500">No orders found.</div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="
                    flex flex-col sm:flex-row sm:items-center
                    justify-between gap-4 p-5
                    border border-gray-200 
                    hover:border-gray-300 hover:shadow-sm
                    transition-all duration-200
                  "
                >
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{order.order_number || order.id}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {t('orderHistory.placedOn')} {order.created_at || order.date}
                    </div>
                    <span className={`
                      mt-2.5 inline-block px-3.5 py-1
                      text-xs font-medium 
                      ${getStatusColor(order.status)}
                    `}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-right sm:min-w-[180px]">
                    <div className="text-xl font-bold text-gray-900">
                      ${parseFloat(order.total_amount ?? 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {order.items?.length ?? 0} {order.items?.length === 1 ? t('dashboard.item') : t('dashboard.items')}
                    </div>
                    <button className="
                      mt-4 w-full sm:w-auto
                      bg-gray-900 hover:bg-gray-800 cursor-pointer
                      text-white text-sm font-medium
                      px-6 py-2.5
                      transition-colors duration-200
                    ">
                      {t('orderHistory.moreDetails')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.current_page === 1}
                className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MdOutlineKeyboardDoubleArrowLeft size={22} />
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MdOutlineKeyboardArrowLeft size={22} />
              </button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-3 text-gray-500">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 flex items-center justify-center border  font-medium transition-colors ${
                        pagination.current_page === p
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              }

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MdOutlineKeyboardArrowRight size={22} />
              </button>
              <button
                onClick={() => handlePageChange(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="w-9 h-9 flex items-center justify-center border border-gray-200  text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MdOutlineKeyboardDoubleArrowRight size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}