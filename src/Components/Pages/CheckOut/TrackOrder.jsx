"use client";

import { useState, useEffect } from "react";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { FaArrowRightLong } from "react-icons/fa6";
import { RiShoppingBag2Fill, RiShoppingBag2Line } from "react-icons/ri";
import { FaFacebookF } from "react-icons/fa";
import { CiHeart, CiInstagram } from "react-icons/ci";
import { RxPeople } from "react-icons/rx";
import { GoArrowRight, GoPeople } from "react-icons/go";
import { LuCircleCheckBig } from "react-icons/lu";
import { MEDIA_URL, BASE_URL } from "../../API/API";
import { PiShoppingBagLight } from "react-icons/pi";
import { CgShoppingBag } from "react-icons/cg";
import { BsBoxArrowUpRight } from "react-icons/bs";



// Map status string to step index (0-based)
const STATUS_STEP = {
  Confirmed: 0,
  "Label Generated": 1,
  Dispatched: 2,
  Delivered: 3,
};

// Format "2026-07-06 00:00:00" → "Monday, 6 July 2026"
function formatDeliveryDate(raw) {
  if (!raw) return null;
  try {
    const d = new Date(raw.replace(" ", "T"));
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

// Calculate estimated delivery: order_date + 3 to 4 days
function getEstimatedDelivery(orderDate) {
  if (!orderDate) return null;
  try {
    const from = new Date(orderDate.replace(" ", "T"));
    const to = new Date(orderDate.replace(" ", "T"));
    from.setDate(from.getDate() + 3);
    to.setDate(to.getDate() + 4);
    const opts = { day: "numeric", month: "long", year: "numeric" };
    return `${from.toLocaleDateString("en-GB", opts)} – ${to.toLocaleDateString("en-GB", opts)}`;
  } catch {
    return null;
  }
}

// Format order_date for step label e.g. "Today, 10:34 AM"
function formatOrderTime(raw) {
  if (!raw) return "";
  try {
    const d = new Date(raw.replace(" ", "T"));
    return d.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

function TrackOrder() {
  const [showSummary, setShowSummary] = useState(true);
  const [orderSummary, setOrderSummary] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const lastOrder = localStorage.getItem("lastPlacedOrder");
      if (lastOrder) {
        const parsed = JSON.parse(lastOrder);
        if (parsed && parsed.order_number) {
          setOrderSummary(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error loading order summary in TrackOrder:", e);
    }
  }, []);

  // On visibility change (tab refocus / refresh): re-fetch detail API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const stored = localStorage.getItem("lastPlacedOrder");
        if (!stored) return;
        const order = JSON.parse(stored);
        const orderId = order?.id;
        if (!orderId) return;

        const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
        const token = loginData?.data?.token;
        if (!token) return;

        setIsRefreshing(true);
        const res = await fetch(`${BASE_URL}/user/order/detail/${orderId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.status && json.data) {
          // Merge paymentInfo from original saved order
          const updated = {
            ...json.data,
            paymentInfo: order.paymentInfo || null,
          };
          setOrderSummary(updated);
          // Update localStorage with fresh data
          localStorage.setItem("lastPlacedOrder", JSON.stringify(updated));
        }
      } catch (e) {
        console.error("Error fetching order detail:", e);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Run on mount (covers page refresh) and on tab re-focus
    fetchDetail();
    window.addEventListener("focus", fetchDetail);
    return () => window.removeEventListener("focus", fetchDetail);
  }, []);

  const handleTrackOrderClick = () => {
    const section = document.getElementById("track-order-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Hero Banner */}
      <div className="relative h-56 sm:h-72 md:h-98 bg-black/60 overflow-hidden">
        <img
          src="track.svg"
          alt="banner"
          className="w-full h-full object-cover"
        />
        {/* Breadcrumb */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 text-white text-base sm:text-2xl md:text-[42px] flex-wrap justify-center text-center">
            <span className="text-white  font-700">Shopping Cart</span>
           <FaArrowRightLong className="shrink-0" />

            <span className="text-white  font-700">Checkout</span>
            <FaArrowRightLong className="shrink-0" />
            <span className="text-white font-700">Order Complete</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Top Section: Left info + Right delivery card */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">

          {/* Left: Order confirmed */}
        <div className="flex-1 mt-4 md:mt-10 md:max-w-none">
            {/* ORDER CONFIRMED badge */}
            <div className="flex items-center gap-1 mb-3">
             <LuCircleCheckBig className="text-gray-500" />

              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Order Confirmed</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Thank you for your order.</h1>
       <p className="text-[13px] sm:text-[13px] w-full lg:w-120 text-gray-500 leading-relaxed mb-5">
              A confirmation email has been sent to <span className="text-gray-800 font-medium">{orderSummary?.email || "biogance@biogance.com"}</span><br/> 
              We are carefully preparing your order. You will receive a shipping notification as soon as it is on its way.
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Order Number */}
              <div className="flex items-center gap-2 border border-[#E3E3E3]/50 px-3 py-2 w-fit max-w-full">
                <CgShoppingBag style={{background:"#111", width:"20px", color:"#fff" ,height:"20px", padding:"3px"}} />
                <div>
                  <p className="text-[10px] text-black uppercase tracking-wider font-bold">Order Number</p>
                  <p className="text-xs text-[#717171] mt-0.5">#{orderSummary?.order_number || orderSummary?.id || ""}</p>
                </div>
              </div>

              {/* Pickup Address Card */}
              {/* {Number(orderSummary?.is_pickup) === 1 && (
                <div className="flex items-start gap-2 border border-[#E3E3E3]/50 px-3 py-2 w-fit max-w-xs">
                  <div style={{background:"#111", width:"20px", color:"#fff", height:"20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding:"3px"}}>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z" strokeLinecap="round" />
                      <circle cx="12" cy="11" r="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-black uppercase tracking-wider font-bold">Pickup Location</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{orderSummary?.pickup_name || "Pickup Location"}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{orderSummary?.pickup_address}</p>
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Right: Delivery info card */}
          <div className="md:w-104 shrink-0">
      <div className="border border-gray-200 overflow-hidden text-sm bg-white">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-base">Delivery Information</p>
        </div>
 
        {/* Estimated Delivery */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" />
              <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Estimated Delivery</span>
          </div>
          <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">
            {orderSummary?.delivery_date
              ? formatDeliveryDate(orderSummary.delivery_date)
              : getEstimatedDelivery(orderSummary?.order_date) || "—"}
          </p>
        </div>
 
        {/* Shipping Method */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 7l9-4 9 4-9 4-9-4z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 7v10l9 4 9-4V7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11v10" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Shipping Method</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-900">
              {Number(orderSummary?.is_pickup) === 1 ? "Store pickup" : "Home delivery"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {Number(orderSummary?.is_pickup) === 1 ? "Free, 2-4 business days" : "Standard, 2-4 business days"}
            </p>
          </div>
        </div>
 
        {/* Address */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-500 pt-0.5">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z" strokeLinecap="round" />
              <circle cx="12" cy="11" r="2" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Address</span>
          </div>
          <div className="text-right">
            {Number(orderSummary?.is_pickup) === 1 ? (
              <>
                <p className="text-xs font-semibold text-gray-900">
                  {orderSummary.pickup_name || "Pickup Location"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  {orderSummary.pickup_address}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-900">{orderSummary?.full_name || "Biogance"}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  {orderSummary?.delivery_address_full ? (
                    <>
                      {orderSummary.delivery_address_full}<br />
                      {orderSummary.delivery_address_postal_code} {orderSummary.delivery_address_city}<br />
                      {orderSummary.delivery_address_country}
                    </>
                  ) : (
                    <>
                      
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
 
        {/* Payment */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" />
              <path d="M2 10h20" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Payment</span>
          </div>
          <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">
            {orderSummary?.paymentInfo ? (
              `${orderSummary.paymentInfo.brand.charAt(0).toUpperCase() + orderSummary.paymentInfo.brand.slice(1)} card •••• ${orderSummary.paymentInfo.last4}`
            ) : (
              "Visa card ••••"
            )}
          </p>
        </div>
 
        {/* Track button */}
        <div className="px-4 py-3">
          <button
            onClick={handleTrackOrderClick}
            className="w-full flex cursor-pointer items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 px-4 transition-colors"
          >
            Track My Order
           <GoArrowRight size={20} />

          </button>
        </div>
      </div>
    </div>
  
        </div>

         {/* Track my order progress steps */}
      <div id="track-order-section" className="mb-10 scroll-mt-28">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Track my order</h2>
 
      {/* Dynamic Steps based on order status */}
      {(() => {
        const status = orderSummary?.status || "Confirmed";
        const step = STATUS_STEP[status] ?? 0;
        const orderTime = formatOrderTime(orderSummary?.order_date);
        const deliveryDateFormatted = formatDeliveryDate(orderSummary?.delivery_date);

        const stepDone   = "w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center";
        const stepActive = "w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center bg-white";
        const stepTodo   = "w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white";
        const lineDone   = "flex-1 h-0.5 bg-gray-900 mt-4 mx-1";
        const lineTodo   = "flex-1 h-0.5 bg-gray-200 mt-4 mx-1";

        return (
          <div className="flex items-start gap-0">

            {/* Step 1: Order Received */}
            <div className="flex flex-col items-center">
              <div className={step >= 0 ? stepDone : stepTodo}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[10px] font-semibold text-gray-900 mt-2 text-center whitespace-nowrap">ORDER RECEIVED</p>
              <p className="text-[10px] text-gray-400 text-center">{orderTime ? `Today, ${orderTime}` : "Confirmed"}</p>
            </div>

            {/* Line 1 */}
            <div className={step >= 1 ? lineDone : lineTodo}></div>

            {/* Step 2: Being Prepared */}
            <div className="flex flex-col items-center">
              <div className={step >= 1 ? stepDone : step === 0 ? stepActive : stepTodo}>
                {step >= 1 ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 ${step === 0 ? "text-gray-700" : "text-gray-300"}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="M3 8l9-5 9 5-9 5-9-5z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13v8" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <p className={`text-[10px] font-semibold mt-2 text-center whitespace-nowrap ${step >= 0 ? "text-gray-900" : "text-gray-400"}`}>BEING PREPARED</p>
              <p className={`text-[10px] text-center ${step === 0 ? "text-gray-400" : step > 0 ? "text-gray-400" : "text-gray-300"}`}>
                {step === 0 ? "In Progress" : step > 0 ? "Done" : "Pending"}
              </p>
            </div>

            {/* Line 2 */}
            <div className={step >= 2 ? lineDone : lineTodo}></div>

            {/* Step 3: Dispatched */}
            <div className="flex flex-col items-center">
              <div className={step >= 2 ? stepDone : step === 1 ? stepActive : stepTodo}>
                {step >= 2 ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 ${step === 1 ? "text-gray-700" : "text-gray-300"}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="M21 8l-9-5-9 5 9 5 9-5z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13v8" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <p className={`text-[10px] font-semibold mt-2 text-center whitespace-nowrap ${step >= 1 ? "text-gray-900" : "text-gray-400"}`}>DISPATCHED</p>
              <p className={`text-[10px] text-center ${step === 1 ? "text-gray-400" : step > 1 ? "text-gray-400" : "text-gray-300"}`}>
                {step === 1 ? "In Progress" : step > 1 ? "Done" : "Pending"}
              </p>
            </div>

            {/* Line 3 */}
            <div className={step >= 3 ? lineDone : lineTodo}></div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center">
              <div className={step >= 3 ? stepDone : step === 2 ? stepActive : stepTodo}>
                {step >= 3 ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 ${step === 2 ? "text-gray-700" : "text-gray-300"}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/>
                  </svg>
                )}
              </div>
              <p className={`text-[10px] font-semibold mt-2 text-center whitespace-nowrap ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}>DELIVERED</p>
              <p className={`text-[10px] text-center ${step >= 2 ? "text-gray-400" : "text-gray-300"}`}>
                {step >= 3 && deliveryDateFormatted
                  ? deliveryDateFormatted
                  : step === 2 && deliveryDateFormatted
                  ? `Expected: ${deliveryDateFormatted}`
                  : step === 2
                  ? "In Progress"
                  : "Pending"}
              </p>
            </div>

          </div>
        );
      })()}
    </div>

        {/* Order Summary */}
        <div className="mb-5 border-t border-gray-200 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
            <RiShoppingBag2Line className="bg-[#f3f3f3] p-1.5 w-8 h-8" size={20} />

              <div>
                <p className="text-sm font-semibold text-gray-900">Order Summary</p>
                <p className="text-xs text-gray-400">
                  {orderSummary?.items ? `${orderSummary.items.reduce((s, i) => s + (i.quantity ?? 0), 0)} items` : "3 items"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-1 cursor-pointer text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              {showSummary ? "Hide" : "Show"}
              <svg className={`w-3 h-3  transition-transform duration-200 ${showSummary ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div
            className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
            style={{
              gridTemplateRows: showSummary ? "1fr" : "0fr",
              opacity: showSummary ? 1 : 0,
            }}
          >
            <div className="overflow-hidden">
              {orderSummary?.items ? (
                orderSummary.items.map((item, idx) => {
                  // API response: items[] directly on order object
                  // item.images[] has media path, item.name is product name
                  const name = item.name || "";
                  const qty = item.quantity ?? 1;
                  const unitPrice = parseFloat(String(item.unit_price ?? item.price ?? "0").replace(",", ".")) || 0;
                  const itemTotal = (unitPrice * qty).toFixed(2);
                  const firstImage = item.images?.[0]?.media
                    ? `${MEDIA_URL}${item.images[0].media}`
                    : "";
                  const sizeName = item.product?.size_name || item.size_name || item.size || "";

                  return (
                    <div key={item.id || idx} className="flex items-center gap-3 py-4 px-4 border border-[#E3E3E3] mb-4">
                      <div className="w-14 h-14 bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2">{name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {sizeName ? `${sizeName} x ${qty}` : `x ${qty}`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">{itemTotal} €</p>
                    </div>
                  );
                })
              ) : null}

              {/* Totals */}
              <div className="px-4 py-4 border border-[#E3E3E3] space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{orderSummary?.subtotal ? parseFloat(orderSummary.subtotal).toFixed(2) : "0.00"} €</span>
                </div>
                {orderSummary?.discount_amount && parseFloat(orderSummary.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Discount</span>
                    <span className="text-red-600 font-semibold">-{parseFloat(orderSummary.discount_amount).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  {orderSummary?.shipping_cost && parseFloat(orderSummary.shipping_cost) > 0 ? (
                    <span>{parseFloat(orderSummary.shipping_cost).toFixed(2)} €</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Free</span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                  <span>Total</span>
                  <span>{orderSummary?.total_amount ? parseFloat(orderSummary.total_amount).toFixed(2) : "0.00"} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ────────────── SECTION 2: Pet Profile + Social + Reviews ────────────── */}

      {/* Pet Profile Section */}
      <div className=" bg-white">
        <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-[#E3E3E3] py-8 md:py-15">
          <div className="flex flex-col md:flex-row  border border-[#E3E3E3] overflow-hidden">

            {/* Left: text content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">My Pet Profile</p>
                <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                  Get recommendations<br/>made for your pet.
                </h3>
                <p className="text-xs text-black leading-relaxed mb-5">
                  Tell us a little about your companion: their breed, coat type, age and lifestyle, and we'll tailor every product suggestion, expert advice, and routine tip specifically to them.
                </p>
                <button className="flex items-center cursor-pointer gap-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold py-3 px-5  transition-colors w-full justify-center mb-3">
                  Create My Pets Profile
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="text-[13px] text-black pt-2">Takes 2 minutes · Free · Edit anytime</p>
              </div>

              {/* Benefits list */}
              <div className="mt-5">
                <p className="text-[10px] font-semibold text-[#C6C6C6] uppercase tracking-widest mb-3">Your Profile Works for Every Companion</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Enjoy our personalised expert advices for your pet
                  </li>
                  <li className="flex items-start gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Receive exclusive articles of our experts
                  </li>
                  <li className="flex items-start gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Personalise your universe with only adapted products for your pets
                  </li>
                  <li className="flex items-start gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    One profile per pet. Add as many as you like
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: video (replaces previous image) */}
            <div className="md:w-146 shrink-0 h-56 md:h-auto bg-[#f3f3f3]">
              <video
                src="/VIDEO.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Social Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-[#E3E3E3] py-8 md:py-13 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
              Show us your pet's<br/>moment.
            </h3>
            <p className="text-sm  text-gray-500 leading-relaxed max-w-xs">
              Tag your photos with <span className="font-semibold text-gray-800">#BioganceNaturally</span> and join a community of pet owners who believe in gentler, cleaner care. We share our favourites every week.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href="https://www.instagram.com/bioganceofficiel/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center cursor-pointer gap-2 border border-gray-200 hover:border-gray-200  hover:bg-black hover:text-[#fff] text-gray-700 text-sm font-medium py-2.5 px-5 transition-colors"
            >
             <CiInstagram size={20} />

              Instagram
            </a>
            <a
              href="https://www.facebook.com/bioganceofficiel/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer border border-gray-200 hover:border-gray-200  hover:bg-black hover:text-[#fff] hover:border-gray-400 text-gray-700 text-sm font-medium py-2.5 px-5 transition-colors"
            >
             <FaFacebookF size={15}/>

              Facebook
            </a>
          </div>
        </div>
        </div>
      </div>

      {/* Google Review Section */}
    <div className="bg-white">
  <div className="max-w-7xl mx-auto px-4">
  <div className="border-t border-[#E3E3E3]">
  <div className="mt-8 md:mt-15 mb-10 md:mb-20 py-8 md:py-12 px-4 bg-[#F3F3F3] text-center">
    
    {/* Google rating pill */}
    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 mb-5">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-900">4.9</span>
    </div>

    <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 leading-snug">
      Did we earn your trust?<br />Tell the world.
    </h2>

    <p className="text-xs text-[#717171] leading-relaxed max-w-sm mx-auto mb-4">
      Biogance is an independent, family-owned French laboratory, no big group behind us, just a team passionate about natural pet care.
    </p>
    <p className="text-xs text-[#717171] leading-relaxed max-w-sm mx-auto mb-6">
      Your Google review helps us stand out and reach other pet owners who care about what goes on their animals' skin.
    </p>

    {/* Stats */}
    <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs text-gray-700">
       <GoPeople className="text-blue-400" size={15} />


        <span className="font-medium">2,500+ reviews</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-700">
       <CiHeart className="text-red-600" size={18} />

        <span className="font-medium">From pet lovers</span>
      </div>
    </div>

    {/* CTA */}
    <a

      href="https://search.google.com/local/reviews?placeid=ChIJd1q6Z-InBkgRBAHsb2wiK4M"
      target="_blank"
      rel="noopener noreferrer"
      
      className="flex items-center text-center uppercase justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium py-3.5 px-8 transition-colors w-full max-w-sm mx-auto mb-3"
    >
      Leave a Google review
    <BsBoxArrowUpRight style={{width:"15px", marginBottom:"2px", height:"15px"}} />

    </a>

    <p className="text-[11px] text-[#717171]">It takes 30 seconds and means everything to us.</p>
  </div>
  </div>
  </div>
</div>

      <Footer />
    </div>
  );
}

export default TrackOrder;