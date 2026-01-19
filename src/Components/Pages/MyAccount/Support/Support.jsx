"use client";

import React, { useState, useEffect } from 'react';
import { BsChatText } from 'react-icons/bs';
import { FiSearch, FiMessageCircle } from 'react-icons/fi';
import { IoChevronDown } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import SupportChat from './SupportChat';

// Support Ticket Shimmer Component
const SupportTicketShimmer = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    {/* Header with Ticket ID and Status */}
    <div className="flex items-center justify-between mb-3">
      <div
        style={{
          width: '100px',
          height: '20px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
      <div
        style={{
          width: '80px',
          height: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>

    {/* Order Reference */}
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

    {/* Created On */}
    <div
      style={{
        width: '140px',
        height: '14px',
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite',
        marginBottom: '24px'
      }}
    />

    {/* Description Box */}
    <div className="bg-gray-100 p-3 rounded-xl w-full mb-3">
      <div
        style={{
          width: '100px',
          height: '16px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '8px'
        }}
      />
      <div
        style={{
          width: '100%',
          height: '14px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '4px'
        }}
      />
      <div
        style={{
          width: '80%',
          height: '14px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>

    {/* Button */}
    <div
      style={{
        width: '100%',
        height: '44px',
        borderRadius: '8px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  </div>
);

export default function Support({ onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('All Tickets');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingState, setLoadingState] = useState('shimmer');

  // ← Your ticket data (later you will fetch this from API)
  const [tickets, setTickets] = useState([
    {
      id: '#3021',
      orderRef: '#56891',
      createdOn: 'July 10, 2025 - 09:18 PM',
      status: 'Active',
      title: 'Order Refund',
      description: "I purchased the 250ml shampoo bottle last week, but the pump isn't working properly and it's difficult to get the product out.",
      statusColor: 'bg-green-100 text-green-700'
    },
    {
      id: '#3023',
      orderRef: '#56912',
      createdOn: 'July 13, 2025 - 11:05 AM',
      status: 'In Progress',
      title: 'Request a Refund',
      description: "I ordered a Biogance shampoo but realized I picked the wrong variant. I'd like to request a refund for this order.",
      statusColor: 'bg-yellow-50 text-yellow-500'
    },
    {
      id: '#3024',
      orderRef: '#56925',
      createdOn: 'July 14, 2025 - 04:30 PM',
      status: 'Closed',
      title: 'Quality Issue',
      description: "The conditioner I received has an unusual texture and doesn't seem right. I'd like to request a replacement or refund.",
      statusColor: 'bg-gray-200 text-gray-700'
    }
  ]);

  const filterOptions = ['All Tickets', 'Active', 'In Progress', 'Closed'];

  const handleOpenChat = (ticket) => {
    setSelectedTicket(ticket);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedTicket(null);
  };

  // You can later add real filtering + search logic here
  const displayedTickets = tickets; // placeholder — add filtering later

  const hasTickets = displayedTickets.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingState('loaded');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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

      <div className="min-h-screen bg-gray-100">
        <div className=" sm:p-6 md:p-8 max-w-10xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">

          {isChatOpen ? (
            <SupportChat ticket={selectedTicket} onClose={handleCloseChat} />
          ) : (
            <>
              {/* Header - always visible */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-2xl font-semibold text-gray-900">
                  Support & Refund
                </h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Manage your cancellations, refund requests, and support tickets all in one place.
                </p>
              </div>

              {hasTickets ? (
                <>
                  {/* Search + Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <FiSearch
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 text-black pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">

                      {showFilterDropdown && (
                        <div 
                          className="fixed inset-0 bg-black/50 z-50"
                          onClick={() => setShowFilterDropdown(false)}
                        />
                      )}

                      <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center cursor-pointer text-black gap-3 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors w-full sm:w-auto justify-between relative"
                      >
                        <span>{filterOption}</span>
                        <IoChevronDown size={18} className="text-gray-600" />
                      </button>

                      {showFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                          {filterOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setFilterOption(option);
                                setShowFilterDropdown(false);
                              }}
                              className="w-full text-left text-black cursor-pointer px-4 py-2.5 hover:bg-black hover:text-white transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>


                  </div>

                  {/* Tickets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {loadingState === 'shimmer' ? (
                      Array.from({ length: displayedTickets.length }).map((_, index) => (
                        <SupportTicketShimmer key={index} />
                      ))
                    ) : (
                      displayedTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-white rounded-xl border border-gray-200 p-4 hover: transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-black">Ticket ID: {ticket.id}</h3>
                            <span
                              className={`px-4 py-2 rounded-full text-xs font-medium ${ticket.statusColor}`}
                            >
                              {ticket.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            Order Reference: {ticket.orderRef}
                          </p>
                          <p className="text-sm text-gray-600 mb-6">
                            Created On: {ticket.createdOn}
                          </p>

                            <div className='bg-gray-100 p-3 rounded-xl w-full mb-3 text black'>
                          <h4 className="font-medium mb-2 text-black">{ticket.title}</h4>
                          <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">
                            {ticket.description}
                          </p>
                          </div>

                          <button
                            onClick={() => handleOpenChat(ticket)}
                            className="w-full flex items-center cursor-pointer justify-center gap-2 text-black px-4 py-3 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                          >
                            <BsChatText size={18} />
                            Open Support Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* ── Empty State ── */
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                    <img
                      src="/sr.svg"
                      alt="No support tickets illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    No Support Tickets Yet
                  </h3>

                  <p className="text-gray-500 text-base text-center max-w-2xl mb-8 leading-relaxed">
                    You haven't created any support or refund requests yet. If you face any issue with your order, you can easily raise a ticket here and track it in real time.
                  </p>

                  <button
                    className="
                      bg-gray-900 text-white
                      px-8 py-3.5 rounded-lg
                      text-base font-medium
                      hover:bg-gray-800
                      transition-colors duration-200
                      shadow-sm
                    "
                  >
                    Create New Ticket
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
