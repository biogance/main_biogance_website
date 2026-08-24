"use client"

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { OrderDetailsModal } from "./ModalBox/OrderDetailsModal";
import { BASE_URL } from "../../API/API";

// Shimmer Card Component for StatCard
const StatCardShimmer = () => (
  <div className="bg-white  p-6">
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
  <div className="flex items-center justify-between py-4 border border-gray-200 p-4 ">
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
    <div className="bg-white  p-6">
      <div className="text-4xl font-semibold text-gray-900 mb-2">{value}</div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

export default function Dashboard() {
    const { t } = useTranslation('myaccount');
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingState, setLoadingState] = useState('shimmer');
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [userName, setUserName] = useState('');

    const getToken = () => {
      try {
        const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
        return splashData?.user?.token || localStorage.getItem('token') || '';
      } catch {
        return '';
      }
    };

    useEffect(() => {
      const loadUserName = () => {
        try {
          const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
          setUserName(splashData?.user?.name || '');
        } catch {
          setUserName('');
        }
      };
      loadUserName();
      window.addEventListener('splashDataReady', loadUserName);
      return () => window.removeEventListener('splashDataReady', loadUserName);
    }, []);

    useEffect(() => {
      if (!localStorage.getItem('LoginData')) {
        router.replace('/');
        return;
      }

      const fetchDashboard = async () => {
        setLoadingState('shimmer');
        try {
          const res = await fetch(`${BASE_URL}/web/dashboard`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          const data = await res.json();
          if (data?.status === false) {
            toast.error(data?.action || 'Something went wrong.');
          } else if (data?.status) {
            setLoyaltyPoints(data.data?.loyalty_points ?? 0);
            setTotalOrders(data.data?.total_orders ?? 0);
            setWishlistCount(data.data?.wishlist_count ?? 0);
            setRecentOrders(Array.isArray(data.data?.recent_orders) ? data.data.recent_orders : []);
          }
        } catch (err) {
          console.error('Fetch dashboard error:', err);
        } finally {
          setLoadingState('loaded');
        }
      };
      fetchDashboard();
    }, []);

  const isLoading = loadingState === 'shimmer';
  const hasOrders = recentOrders.length > 0;
  const showOrdersSection = isLoading || hasOrders;

  // Calculate stats from the recent orders shown below
  const deliveredCount = recentOrders.filter(o => o.status === "Delivered").length;
  const processingCount = recentOrders.filter(o => o.status === "Processing").length;
  const shippingCount = recentOrders.filter(o => o.status === "Shipping").length;

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(String(dateStr).replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-50 text-green-700';
      case 'Processing':
        return 'bg-orange-50 text-orange-700';
      case 'Awaiting Confirmation':
        return 'bg-yellow-50 text-yellow-700';
      case 'Scheduled for Delivery':
      case 'Waiting for Shipment':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    // No min-h-screen here — MyAccount.jsx's wrapper already reserves a
    // full viewport (with the navbar's 104px clearance baked in). Stacking
    // another min-h-screen on top of that forced this tab to be at least a
    // full extra viewport tall no matter how little content it had, causing
    // a page scrollbar on short/empty content at any screen size or zoom
    // level.
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

      <div className="p-4 md:p-8 max-w-10xl mx-auto">
        {/* Welcome Message — mt-2 on mobile, not mt-6: stacked on top of
            Sidebar.jsx's own trailing space under the mobile tab row, that
            combination was the large empty gap between the tabs and this
            heading on small screens. md:mt-10 keeps desktop unchanged. */}
        <h1 className="text-xl md:text-2xl mb-6 md:mb-8 mt-2 md:mt-10 font-semibold text-gray-900">
          {t('dashboard.welcome', { name: userName })}
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
                value={loyaltyPoints}
                subtitle=""
              />
              <StatCard
                title={t('dashboard.totalOrders')}
                value={totalOrders}
                subtitle={t('dashboard.orderStats', { delivered: deliveredCount, processing: processingCount, shipping: shippingCount })}
              />
              <StatCard
                title={t('dashboard.wishlist')}
                value={wishlistCount}
                subtitle={t('dashboard.itemsSavedForLater')}
              />
            </>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white  p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.recentOrders')}</h2>
            {hasOrders && (
              <button
                onClick={() => router.push('/my-account?tab=orders')}
                className="text-sm md:text-md text-black cursor-pointer hover:underline decoration-gray-400"
              >
                {t('dashboard.seeAll')}
              </button>
            )}
          </div>
          
          {showOrdersSection ? (
            /* Orders List */
            <div className="space-y-4">
              {isLoading ? (
                // Show shimmer order items
                Array.from({ length: 3 }).map((_, index) => (
                  <OrderItemShimmer key={index} />
                ))
              ) : (
                // Show actual orders
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-4 border border-gray-200 p-4 "
                  >
                    <div className="flex-1">
                      <div className="font-bold text-black mb-1">#{order.order_number || order.id}</div>
                      <div className="text-sm text-gray-500 mb-2">{t('dashboard.placedOn')} {formatOrderDate(order.order_date || order.created_at)}</div>
                     <span
                        className={`inline-block px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900 mb-1">
                        ${parseFloat(order.total_amount ?? 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? t('dashboard.item') : t('dashboard.items')}
                      </div>
                      <button className="bg-gray-900 text-white cursor-pointer px-4 py-2  text-sm font-medium hover:bg-gray-800 transition-colors"   onClick={() => handleOpenDetails(order)}  >
                        {t('dashboard.moreDetails')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <div className="w-48 md:w-64 h-48 md:h-64 mb-4 md:mb-6 flex items-center justify-center">
               <img src="empty.svg" alt="" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.emptyCart.title')}
              </h3>
              <p className="text-sm text-gray-500 mb-4 md:mb-6 text-center max-w-md">
                {t('dashboard.emptyCart.description')}
              </p>
              <button className="bg-gray-900 text-white cursor-pointer px-4 md:px-6 py-2 md:py-3  text-sm font-medium hover:bg-gray-800 transition-colors">
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