"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import jsPDF from 'jspdf';
import { BASE_URL } from '../../../API/API';
import { saveCartData } from '../../../../utils/cartStorage';
import { CancelOrderModal } from './CancelOrderModal';

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

const formatOrderDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(String(dateStr).replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const generateInvoice = (order, isFrench) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let y = 20;

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Biogance', marginX, y);
  doc.setFontSize(12);
  doc.text('INVOICE', pageWidth - marginX, y, { align: 'right' });

  y += 8;
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Order Number: ${order.order_number || order.id}`, marginX, y);
  doc.text(`Order Date: ${formatOrderDate(order.order_date || order.created_at)}`, pageWidth - marginX, y, { align: 'right' });
  y += 7;
  doc.text(`Status: ${order.status || ''}`, marginX, y);
  const paymentLabel = [order.payment_method, order.payment_status].filter(Boolean).join(' - ');
  if (paymentLabel) {
    doc.text(`Payment: ${paymentLabel}`, pageWidth - marginX, y, { align: 'right' });
  }
  y += 10;

  doc.setFont(undefined, 'bold');
  doc.text('Billed To', marginX, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  if (order.full_name) {
    doc.text(order.full_name, marginX, y);
    y += 6;
  }
  if (order.email) {
    doc.text(order.email, marginX, y);
    y += 6;
  }
  const billingAddress = [
    order.invoice_address_full,
    order.invoice_address_city,
    order.invoice_address_state,
    order.invoice_address_postal_code,
    order.invoice_address_country,
  ].filter(Boolean).join(', ');
  if (billingAddress) {
    const addressLines = doc.splitTextToSize(billingAddress, 100);
    doc.text(addressLines, marginX, y);
    y += addressLines.length * 6;
  }
  y += 6;

  doc.setFont(undefined, 'bold');
  doc.text('Item', marginX, y);
  doc.text('Qty', 125, y);
  doc.text('Unit Price', 148, y);
  doc.text('Total', pageWidth - marginX, y, { align: 'right' });
  y += 3;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;
  doc.setFont(undefined, 'normal');

  const items = Array.isArray(order.items) ? order.items : [];
  items.forEach((item) => {
    const name = isFrench ? (item.french_name || item.name || '') : (item.name || '');
    const quantity = Number(item.quantity) || 0;
    const price = parseFloat(String(item.unit_price ?? item.price ?? 0).replace(',', '.')) || 0;
    const lineTotal = price * quantity;

    const nameLines = doc.splitTextToSize(name, 105);
    doc.text(nameLines, marginX, y);
    doc.text(String(quantity), 125, y);
    doc.text(`$${price.toFixed(2)}`, 148, y);
    doc.text(`$${lineTotal.toFixed(2)}`, pageWidth - marginX, y, { align: 'right' });
    y += Math.max(nameLines.length * 6, 7);

    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  y += 4;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  const subtotal = parseFloat(order.subtotal ?? 0) || 0;
  const shipping = parseFloat(order.shipping_cost ?? 0) || 0;
  const tax = parseFloat(order.tax_amount ?? 0) || 0;
  const discount = parseFloat(order.discount_amount ?? 0) || 0;
  const total = parseFloat(order.total_amount ?? 0) || 0;

  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, pageWidth - marginX, y, { align: 'right' });
  y += 6;
  doc.text(`Shipping: $${shipping.toFixed(2)}`, pageWidth - marginX, y, { align: 'right' });
  y += 6;
  if (discount > 0) {
    doc.text(`Discount: -$${discount.toFixed(2)}`, pageWidth - marginX, y, { align: 'right' });
    y += 6;
  }
  doc.text(`Tax: $${tax.toFixed(2)}`, pageWidth - marginX, y, { align: 'right' });
  y += 7;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(13);
  doc.text(`Total: $${total.toFixed(2)}`, pageWidth - marginX, y, { align: 'right' });

  doc.save(`Invoice-${order.order_number || order.id}.pdf`);
};

export function OrderDetailsModal({ isOpen, onClose, order }) {
  const { t, i18n } = useTranslation("myaccount");
  const isFrench = i18n.language === 'fr';
  const router = useRouter();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const getCartToken = () => {
    try {
      const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
      return loginData?.data?.token || '';
    } catch {
      return '';
    }
  };

  const handleReorder = async () => {
    if (!order || isReordering) return;
    setIsReordering(true);
    try {
      const token = getCartToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const items = Array.isArray(order.items) ? order.items : [];

      for (const item of items) {
        const productId = item.main_product_id ?? item.product?.id;
        if (!productId) continue;
        await fetch(`${BASE_URL}/user/cart/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ product_id: productId, quantity: Number(item.quantity) || 1 }),
        });
      }

      const res = await fetch(`${BASE_URL}/user/cart/list`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data?.status) {
        saveCartData({
          ...data.data,
          cartItem: (data.data.cartItem || data.data.cartItems || []).filter(Boolean),
        });
      }

      onClose();
      router.push('/checkout');
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setIsReordering(false);
    }
  };

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

  if (!isOpen || !order) return null;

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const totalPrice = parseFloat(order.total_amount ?? 0) || 0;
  const totalItems = orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white  shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header with Close Button */}
        <div className="bg-white z-10 p-4 sm:p-6 flex items-center justify-between border-b border-gray-200 ">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('orderDetails.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer text-gray-600 hover:  transition-colors"
            aria-label="Close modal"
          >
            <MdClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Info Box */}
          <div className="border border-gray-200  p-3 sm:p-4">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">#{order.order_number || order.id}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('orderHistory.placedOn')} {formatOrderDate(order.order_date || order.created_at)}</p>
                <span className={`inline-block px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
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
              {orderItems.map((item, index) => {
                const name = isFrench ? (item.french_name || item.name) : (item.name || '');
                const price = parseFloat(String(item.unit_price ?? item.price ?? 0).replace(',', '.')) || 0;
                const quantity = Number(item.quantity) || 0;
                return (
                  <div key={item.id ?? index} className="border border-gray-200  p-3 sm:p-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{name}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{t('orderDetails.quantity')}: {quantity}</div>
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">${price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tracking Information Box */}
            {(order.tracking_number || order.delivery_date) && (
              <div className='mt-4 sm:mt-6'>
                <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">{t('orderDetails.trackingInfo')}</h4>
                {order.tracking_number && (
                  <p className="text-xs sm:text-sm text-gray-900 mb-2">{t('orderDetails.trackingNumber')}: {order.tracking_number}</p>
                )}
                {order.delivery_date && (
                  <p className="text-xs sm:text-sm text-green-600 font-medium">{t('orderDetails.estimatedDelivery')} {formatOrderDate(order.delivery_date)}</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Fixed Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 ">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => generateInvoice(order, isFrench)}
              className="w-full cursor-pointer sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-900 font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              {t('orderDetails.downloadInvoice')}
            </button>
            <button
              disabled={isReordering}
              className="w-full cursor-pointer sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={order.status === "Processing" ? () => setIsCancelModalOpen(true) : handleReorder}
            >
              {order.status === "Processing"
                ? t('orderDetails.cancelOrder')
                : isReordering
                ? t('orderDetails.reordering')
                : t('orderDetails.reorderItem')}
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
