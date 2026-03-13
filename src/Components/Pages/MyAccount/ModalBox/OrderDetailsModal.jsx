"use client"

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { CancelOrderModal } from './CancelOrderModal';

export function OrderDetailsModal({ isOpen, onClose, order }) {
  const { t } = useTranslation("myaccount");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Default order data if none provided
  const defaultOrder = {
    id: "ORD-001",
    date: "January 8, 2025",
    status: "Delivered",
    statusColor: "green",
    trackingNumber: "PKG123456789",
    estimatedDelivery: "January 10, 2025",
    items: [
      { name: 'Natural Shampoo Bundle', price: 39.99, quantity: 2 },
      { name: 'Eco Dental Treats', price: 24.99, quantity: 1 },
      { name: 'Organic Paw Balm', price: 15.99, quantity: 1 },
    ]
  };
  

  const orderData = order || defaultOrder;
  const orderItems = Array.isArray(orderData.items) ? orderData.items : defaultOrder.items;

  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header with Close Button */}
        <div className="bg-white z-10 p-4 sm:p-6 flex items-center justify-between border-b border-gray-200 rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('orderDetails.title')}</h2>
          <button 
            onClick={onClose}
            className="p-2 cursor-pointer text-gray-600 hover: rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <MdClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Info Box */}
          <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">#{orderData.id}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('orderHistory.placedOn')} {orderData.date}</p>
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
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">${totalPrice.toFixed(2)}</div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {totalItems} {totalItems === 1 ? t('dashboard.item') : t('dashboard.items')}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
              {orderItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{item.name}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{t('orderDetails.quantity')}: {item.quantity}</div>
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tracking Information Box */}
            <div className='mt-4 sm:mt-6'>
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">{t('orderDetails.trackingInfo')}</h4>
              <p className="text-xs sm:text-sm text-gray-900 mb-2">{t('orderDetails.trackingNumber')}: {orderData.trackingNumber}</p>
              <p className="text-xs sm:text-sm text-green-600 font-medium">{t('orderDetails.estimatedDelivery')} {orderData.estimatedDelivery}</p>
            </div>
          </div>

        </div>

        {/* Fixed Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="w-full cursor-pointer sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base">
              {t('orderDetails.downloadInvoice')}
            </button>
            <button
              className="w-full cursor-pointer sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
              onClick={orderData.status === "Processing" ? () => setIsCancelModalOpen(true) : undefined}
            >
              {orderData.status === "Processing" ? t('orderDetails.cancelOrder') : t('orderDetails.reorderItem')}
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => {
          setIsCancelModalOpen(false);
          onClose(); // Close the order details modal as well
        }}
      />
    </div>
  );
}