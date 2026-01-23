"use client"

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { OrderDetailsModal } from "./ModalBox/OrderDetailsModal";

// Shimmer Card Component for StatCard
const StatCardShimmer = () => (
  <div className="bg-white rounded-xl p-6">
    {/* Value Shimmer */}
    <div
      style={{
        width: '60px',
        height: '36px',
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite',
        marginBottom: '8px'
      }}
    />
    {/* Title Shimmer */}
    <div
      style={{
        width: '80px',
        height: '14px',
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite',
        marginBottom: '4px'
      }}
    />
    {/* Subtitle Shimmer */}
    <div
      style={{
        width: '100px',
        height: '12px',
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  </div>
);

// Shimmer Card Component for Order Items
const OrderItemShimmer = () => (
  <div className="flex items-center justify-between py-4 border border-gray-200 p-4 rounded-xl">
    <div className="flex-1">
      {/* Order ID Shimmer */}
      <div
        style={{
          width: '80px',
          height: '16px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '4px'
        }}
      />
      {/* Date Shimmer */}
      <div
        style={{
          width: '120px',
          height: '14px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '8px'
        }}
      />
      {/* Status Shimmer */}
      <div
        style={{
          width: '100px',
          height: '20px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>
    <div className="text-right">
      {/* Amount Shimmer */}
      <div
        style={{
          width: '60px',
          height: '20px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '4px'
        }}
      />
      {/* Items Shimmer */}
      <div
        style={{
          width: '50px',
          height: '14px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '12px'
        }}
      />
      {/* Button Shimmer */}
      <div
        style={{
          width: '100px',
          height: '32px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>
  </div>
);

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="text-4xl font-semibold text-gray-900 mb-2">{value}</div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

export default function Dashboard() {
    const { t } = useTranslation('myaccount');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingState, setLoadingState] = useState('shimmer');

    useEffect(() => {
      // Simulate loading for 2 seconds
      const timer = setTimeout(() => {
        setLoadingState('loaded');
      }, 1000);

      return () => clearTimeout(timer);
    }, []);
  // Sample orders data - set to empty array to show empty state
  const recentOrders = [
   {
      id: "ORD-001",
      date: "January 8, 2025",
      status: "Delivered",
      statusColor: "green",
      amount: "$64.98",
      items: 4
    },
    {
      id: "ORD-002",
      date: "January 10, 2025",
      status: "Processing",
      statusColor: "orange",
      amount: "$49.50",
      items: 1
    },
    {
      id: "ORD-003",
      date: "January 12, 2025",
      status: "Awaiting Confirmation",
      statusColor: "yellow",
      amount: "$120.00",
      items: 2
    }
  ];

  // Change this to [] to test empty state
  // const recentOrders = [];

  const hasOrders = recentOrders.length > 0;

  // Calculate stats
  const deliveredCount = recentOrders.filter(o => o.status === "Delivered").length;
  const processingCount = recentOrders.filter(o => o.status === "Processing").length;
  const shippingCount = recentOrders.filter(o => o.status === "Shipping").length;

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

      <div className="p-4 md:p-8 max-w-10xl mx-auto">
        {/* Welcome Message */}
        <h1 className="text-xl md:text-2xl mb-6 md:mb-8 mt-6 md:mt-10 font-semibold text-gray-900">
          {t('dashboard.welcome')}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {loadingState === 'shimmer' ? (
            <>
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
            </>
          ) : (
            <>
              <StatCard
                title={t('dashboard.loyaltyPoints')}
                value={hasOrders ? 1250 : 0}
                subtitle={hasOrders ? t('dashboard.pointsThisMonth', { count: 150 }) : t('dashboard.pointsThisMonth', { count: 0 })}
              />
              <StatCard
                title={t('dashboard.recentOrders')}
                value={recentOrders.length}
                subtitle={t('dashboard.orderStats', { delivered: deliveredCount, processing: processingCount, shipping: shippingCount })}
              />
              <StatCard
                title={t('dashboard.wishlist')}
                value={hasOrders ? 8 : 0}
                subtitle={t('dashboard.itemsSavedForLater')}
              />
            </>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.recentOrders')}</h2>
            {hasOrders && (
              <button className="text-sm md:text-md text-black cursor-pointer hover:underline decoration-gray-400">
                {t('dashboard.seeAll')}
              </button>
            )}
          </div>
          
          {hasOrders ? (
            /* Orders List */
            <div className="space-y-4">
              {loadingState === 'shimmer' ? (
                // Show shimmer order items
                Array.from({ length: recentOrders.length }).map((_, index) => (
                  <OrderItemShimmer key={index} />
                ))
              ) : (
                // Show actual orders
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-4 border border-gray-200 p-4 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-black mb-1">#{order.id}</div>
                      <div className="text-sm text-gray-500 mb-2">{t('dashboard.placedOn')} {order.date}</div>
                     <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded ${
                          order.statusColor === 'green'
                            ? 'bg-green-50 text-green-700'
                            : order.statusColor === 'orange'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {order.status === "Delivered" && t('dashboard.status.delivered')}
                        {order.status === "Processing" && t('dashboard.status.processing')}
                        {order.status === "Awaiting Confirmation" && t('dashboard.status.awaitingConfirmation')}
                        {order.status === "Shipping" && t('dashboard.status.shipping')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900 mb-1">
                        {order.amount}
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        {order.items} {order.items === 1 ? t('dashboard.item') : t('dashbaord.items')}
                      </div>
                      <button className="bg-gray-900 text-white cursor-pointer px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"   onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}  >
                        {t('dashboard.moreDetails')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-8 md:py-12">
              <div className="w-48 md:w-64 h-48 md:h-64 mb-4 md:mb-6 flex items-center justify-center">
               <img src="empty.svg" alt="" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.emptyCart.title')}
              </h3>
              <p className="text-sm text-gray-500 mb-4 md:mb-6 text-center max-w-md">
                {t('dashbaord.emptyCart.description')}
              </p>
              <button className="bg-gray-900 text-white cursor-pointer px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                {t('dashboard.emptyCart.browseProducts')}
              </button>
            </div>
          )}
        </div>
      </div>
        <OrderDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </div>
  );
}