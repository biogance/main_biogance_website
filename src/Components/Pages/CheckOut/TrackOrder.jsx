"use client";

import { useState } from "react";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { FaArrowRightLong } from "react-icons/fa6";
import { RiShoppingBag2Fill } from "react-icons/ri";


function TrackOrder() {
  const [showSummary, setShowSummary] = useState(true);

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Hero Banner */}
      <div className="relative h-98 bg-black/60 overflow-hidden">
        <img
          src="track.svg"
          alt="banner"
          className="w-full h-full object-cover"
        />
        {/* Breadcrumb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-8 text-white text-[42px]">
            <span className="text-white  font-700">Shopping Cart</span>
           <FaArrowRightLong />

            <span className="text-white  font-700">Checkout</span>
            <FaArrowRightLong />
            <span className="text-white font-700">Order Complete</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Top Section: Left info + Right delivery card */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">

          {/* Left: Order confirmed */}
          <div className="flex-1 mt-10">
            {/* ORDER CONFIRMED badge */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 12l3 3 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Order Confirmed</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">Thank you for your order.</h1>
            <p className="text-[14px] w-125 text-gray-500 leading-relaxed mb-5">
              A confirmation email has been sent to <span className="text-gray-800 font-medium">marie.dupont@hotmail.com</span>.<br/>
              We are carefully preparing your order. You will receive a shipping notification as soon as it is on its way.
            </p>

            {/* Order Number */}
            <div className="flex items-center gap-2  border border-gray-200 px-3 py-2.5 w-fit">
             <img src="track1.svg" alt=""  style={{background:"#111", width:"20px", height:"20px", padding:"3px"}}/>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Order Number</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">#BIO-2026-08472</p>
              </div>
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
          <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">Wednesday, 15 June 2026</p>
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
            <p className="text-xs font-semibold text-gray-900">Home delivery</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Standard, 2-4 business days</p>
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
            <p className="text-xs font-semibold text-gray-900">Marie Dupont</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
              172 rue Barbara<br />
              49 170 Saint Martin du Fouilloux
            </p>
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
          <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">Visa card &#8226;&#8226;&#8226;&#8226; 4221</p>
        </div>
 
        {/* Track button */}
        <div className="px-4 py-3">
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 px-4 rounded transition-colors">
            Track My Order
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  
        </div>

        {/* Track my order progress steps */}
      <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Track my order</h2>
 
      {/* Steps */}
      <div className="flex items-start gap-0">
 
        {/* Step 1: Order Received (completed) */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[10px] font-semibold text-gray-900 mt-2 text-center whitespace-nowrap">ORDER RECEIVED</p>
          <p className="text-[10px] text-gray-400 text-center">Today, 10:34 AM</p>
        </div>
 
        {/* Line 1 - completed, dark */}
        <div className="flex-1 h-0.5 bg-gray-900 mt-4 mx-1"></div>
 
        {/* Step 2: Being Prepared (in progress) */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M3 8l9-5 9 5-9 5-9-5z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 13v8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[10px] font-semibold text-gray-900 mt-2 text-center whitespace-nowrap">BEING PREPARED</p>
          <p className="text-[10px] text-gray-400 text-center">In Progress</p>
        </div>
 
        {/* Line 2 - upcoming, light */}
        <div className="flex-1 h-0.5 bg-gray-200 mt-4 mx-1"></div>
 
        {/* Step 3: Dispatched (upcoming) */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white">
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M21 8l-9-5-9 5 9 5 9-5z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 13v8" strokeLinecap="round"/>
              <path d="M16 5.5l-8 4.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[10px] font-semibold text-gray-400 mt-2 text-center whitespace-nowrap">DISPATCHED</p>
          <p className="text-[10px] text-gray-300 text-center">By 13 June</p>
        </div>
 
        {/* Line 3 - upcoming, light */}
        <div className="flex-1 h-0.5 bg-gray-200 mt-4 mx-1"></div>
 
        {/* Step 4: Delivered (upcoming) */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white">
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/>
            </svg>
          </div>
          <p className="text-[10px] font-semibold text-gray-400 mt-2 text-center whitespace-nowrap">DELIVERED</p>
          <p className="text-[10px] text-gray-300 text-center">By 15 June</p>
        </div>
      </div>
    </div>

        {/* Order Summary */}
        <div className="mb-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">Order Summary</p>
                <p className="text-xs text-gray-400">3 items</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              {showSummary ? "Hide" : "Show"}
              <svg className={`w-3 h-3 transition-transform duration-200 ${showSummary ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {showSummary && (
            <div className="transition-all duration-300">
              {/* Item 1 */}
              <div className="flex items-center gap-3 py-4 border-t border-gray-100">
                <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=100&q=80" alt="shampoo" className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">Universal shampoo 2 in 1 Biogance</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">250ml x 2</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">€22.5</p>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3 py-4 border-t border-gray-100">
                <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">Universal shampoo 2 in 1 Biogance</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">250ml x 1</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">€12.60</p>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>€35.1</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span>€60.01</span>
            </div>
          </div>
        </div>

      </div>

      {/* ────────────── SECTION 2: Pet Profile + Social + Reviews ────────────── */}

      {/* Pet Profile Section */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row rounded-lg border border-gray-200 overflow-hidden">

            {/* Left: text content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">My Pet Profile</p>
                <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                  Get recommendations<br/>made for your pet.
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Tell us a little about your companion: their breed, coat type, age and lifestyle, and we'll tailor every product suggestion, expert advice, and routine tip specifically to them.
                </p>
                <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold py-3 px-5 rounded transition-colors w-full justify-center mb-3">
                  Create My Pets Profile
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="text-[10px] text-gray-400 text-center">Takes 2 minutes · Free · Edit anytime</p>
              </div>

              {/* Benefits list */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Profile Works for Every Companion</p>
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

            {/* Right: image */}
            <div className="md:w-56 shrink-0 h-56 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"
                alt="Dog with owner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Section */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
              Show us your pet's<br/>moment.
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Tag your photos with <span className="font-semibold text-gray-800">#BioganceNaturally</span> and join a community of pet owners who believe in gentler, cleaner care. We share our favourites every week.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-700 text-xs font-medium py-2.5 px-5 rounded transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </button>
            <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-700 text-xs font-medium py-2.5 px-5 rounded transition-colors">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>

      {/* Google Review Section */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">

          {/* Google rating */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {/* Google G icon */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {/* Stars */}
            <div className="flex items-center gap-0.5">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <span className="text-sm font-bold text-gray-900">4.9</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Did we earn your trust?<br/>Tell the world.
          </h2>

          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto mb-2">
            Biogance is an independent, family-owned French laboratory, no big group behind us, just a team passionate about natural pet care.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto mb-6">
            Your Google review helps us stand out and reach other pet owners who care about what goes on their animals' skin.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              </svg>
              <span className="font-semibold">2,500+ Reviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="font-semibold">From Pet Lovers</span>
            </div>
          </div>

          {/* CTA button */}
          <button className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold py-3.5 px-8 rounded transition-colors w-full max-w-sm mx-auto mb-3">
            Leave a Google Review
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <p className="text-[11px] text-gray-400">It takes 30 seconds and means everything to us.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TrackOrder;