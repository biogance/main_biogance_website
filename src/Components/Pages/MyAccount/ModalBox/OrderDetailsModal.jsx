"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  IoClose,
  IoReceiptOutline,
  IoDownloadOutline,
  IoArrowForward,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../../API/API';
import { saveCartData } from '../../../../utils/cartStorage';
import { CancelOrderModal } from './CancelOrderModal';

// Same status color language as the orders table on MyOrder.jsx, so the
// modal reads as a continuation of that list rather than a different system.
const STATUS_DOT = {
  Delivered: "bg-emerald-600",
  Processing: "bg-amber-500",
  "Awaiting Confirmation": "bg-yellow-500",
  "Scheduled for Delivery": "bg-sky-600",
  "Waiting for Shipment": "bg-sky-600",
};

const STATUS_TINT = {
  Delivered: "bg-emerald-50",
  Processing: "bg-amber-50",
  "Awaiting Confirmation": "bg-yellow-50",
  "Scheduled for Delivery": "bg-sky-50",
  "Waiting for Shipment": "bg-sky-50",
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
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant
  // isOpen flips.
  const [isClosing, setIsClosing] = useState(false);

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
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        return;
      }
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

  if ((!isOpen && !isClosing) || !order) return null;

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const totalPrice = parseFloat(order.total_amount ?? 0) || 0;
  const totalItems = orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const isProcessing = order.status === "Processing";

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 250);
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 z-70 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}>
      <div className={`bg-white w-full max-w-2xl max-h-[95vh] flex flex-col shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
        {/* Dark editorial header band */}
        <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-5 sm:px-8 py-5 sm:py-6 flex items-center gap-4 border-b border-white/5 overflow-hidden shrink-0">
          <IoReceiptOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />

          <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
            <IoReceiptOutline className="w-5 h-5 text-white" />
          </div>

          <div className="relative min-w-0 pr-12">
            <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-white/40 mb-0.5">
              {t('orderDetails.title')}
            </p>
            <h2 className="text-[19px] sm:text-[21px] font-extrabold leading-[1.05] tracking-tight text-white truncate">
              #{order.order_number || order.id}
            </h2>
            <p className="mt-0.5 text-[12.5px] text-white/50 truncate">
              {t('orderHistory.placedOn')} {formatOrderDate(order.order_date || order.created_at)}
            </p>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-6 space-y-6">
          {/* Summary strip — status on the left, total + item count on the right */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#0b0b0a] border border-black/10 ${STATUS_TINT[order.status] || ""}`}>
              <span className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOT[order.status] || "bg-black/30"}`} />
              {order.status}
            </span>
            <div className="text-right">
              <div className="text-[20px] sm:text-[22px] font-extrabold tracking-tight text-[#0b0b0a]">${totalPrice.toFixed(2)}</div>
              <div className="text-[12.5px] text-[#8a8880]">
                {totalItems} {totalItems === 1 ? t('dashboard.item') : t('dashboard.items')}
              </div>
            </div>
          </div>

          {/* Order items */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880] mb-3">
              Items · {orderItems.length}
            </p>
            <div className="border border-black/10 divide-y divide-black/[0.06]">
              {orderItems.map((item, index) => {
                const name = isFrench ? (item.french_name || item.name) : (item.name || '');
                const price = parseFloat(String(item.unit_price ?? item.price ?? 0).replace(',', '.')) || 0;
                const quantity = Number(item.quantity) || 0;
                return (
                  <div key={item.id ?? index} className="flex items-center gap-3.5 px-4 py-3.5">
                    <span className="hidden xs:grid sm:grid place-items-center w-10 h-10 shrink-0 border border-black/10 text-[#0b0b0a]">
                      <IoReceiptOutline className="w-[18px] h-[18px]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14.5px] text-[#0b0b0a] truncate">{name}</div>
                      <div className="text-[12.5px] text-[#8a8880]">{t('orderDetails.quantity')}: {quantity}</div>
                    </div>
                    <div className="text-[15px] font-semibold text-[#0b0b0a] shrink-0">${price.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking */}
          {(order.tracking_number || order.delivery_date) && (
            <div className="border border-black/10 bg-black/[0.015] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <IoLocationOutline className="w-4 h-4 text-[#0b0b0a]" />
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
                  {t('orderDetails.trackingInfo')}
                </p>
              </div>
              {order.tracking_number && (
                <p className="text-[13.5px] text-[#0b0b0a] mb-1.5">{t('orderDetails.trackingNumber')}: <span className="font-medium">{order.tracking_number}</span></p>
              )}
              {order.delivery_date && (
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                  <IoCheckmarkCircleOutline className="w-4 h-4 shrink-0" />
                  {t('orderDetails.estimatedDelivery')} {formatOrderDate(order.delivery_date)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Fixed Action Buttons */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-black/10 bg-white shrink-0 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={() => generateInvoice(order, isFrench)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
          >
            <IoDownloadOutline className="w-4 h-4" />
            {t('orderDetails.downloadInvoice')}
          </button>
          <button
            disabled={isReordering}
            onClick={isProcessing ? () => setIsCancelModalOpen(true) : handleReorder}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white border transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none ${
              isProcessing
                ? 'bg-gradient-to-b from-red-500 to-red-700 border-red-700 hover:from-red-600 hover:to-red-800 hover:shadow-[0_18px_36px_-14px_rgba(220,38,38,.55)] hover:-translate-y-px'
                : 'bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border-[#0b0b0a] hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px'
            }`}
          >
            {isReordering && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isProcessing
              ? t('orderDetails.cancelOrder')
              : isReordering
              ? t('orderDetails.reordering')
              : (
                <>
                  {t('orderDetails.reorderItem')}
                  <IoArrowForward className="w-3.5 h-3.5" />
                </>
              )}
          </button>
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
