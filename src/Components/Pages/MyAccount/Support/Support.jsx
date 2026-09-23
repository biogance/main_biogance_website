"use client";

import React, { useState, useEffect } from 'react';
import { BsChatText } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { IoChevronDown, IoArrowForward, IoCalendarOutline, IoCheckmarkCircleOutline, IoTimeOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import SupportChat from './SupportChat';
import CreateTicketModal from './CreateTicketModal';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../../API/API';

// One shimmer block — every skeleton on this page is built from this.
const Bone = ({ w, h, className = "" }) => (
  <span
    className={`block bg-black/[0.06] ${className}`}
    style={{ width: w, height: h, animation: "supportShimmer 1.5s ease-in-out infinite" }}
  />
);

// Support ticket card shimmer — mirrors TicketCard's icon + status row,
// message block, and action button.
const SupportTicketShimmer = () => (
  <div className="flex bg-white border border-black/10 overflow-hidden min-h-[280px]">
    <div className="w-16 sm:w-20 shrink-0 bg-black/10" />
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="p-6 sm:p-7 flex-1">
        <Bone w="75%" h="30px" className="mb-2.5" />
        <Bone w="50%" h="15px" className="mb-5" />
        <div className="h-px bg-black/10 mb-5" />
        <Bone w="65%" h="15px" className="mb-3.5" />
        <Bone w="45%" h="15px" />
      </div>
      <Bone w="100%" h="56px" />
    </div>
  </div>
);

// A filter dropdown — a plain button that opens a bordered panel below it,
// same shape as the one on the Orders page.
function FilterDropdown({ options, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center justify-between gap-3 cursor-pointer px-5 py-3 bg-white border text-[13.5px] font-medium text-[#0b0b0a] transition-colors duration-200 w-full sm:w-auto ${
          open ? "border-black/30" : "border-black/10 hover:border-black/25"
        }`}
      >
        <span>{selected}</span>
        <IoChevronDown className={`w-4 h-4 shrink-0 text-[#8a8880] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
          />
          <div className="absolute right-0 sm:left-0 top-full mt-2 z-50 min-w-[200px] bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)]">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  onSelect(option.key);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[13px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${
                  selected === option.label ? "bg-black/[0.04] text-[#0b0b0a] font-semibold" : "text-[#5c5a54]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// A support ticket — icon badge + id/status up top, a quoted message block,
// and an "Open Support Chat" action, all in one card.
// A bold, editorial ticket card — a full-height black spine on the left
// carrying the status and ticket number as vertical type (a book-spine
// label, not a small pill), a big headline for the category, a hairline,
// then the meta rows (date, status) each with their own icon, and a
// full-width black action bar at the bottom.
function TicketCard({ ticket, onOpenChat, t }) {
  const isClosed = ticket.statusKey === 'support.status.closed';
  const StatusIcon = isClosed ? IoCheckmarkCircleOutline : IoTimeOutline;

  return (
    <div className="flex bg-white border border-black/10 overflow-hidden transition-shadow duration-300 hover:shadow-[0_30px_60px_-32px_rgba(0,0,0,.3)]">
      {/* Spine */}
      <div className="w-16 sm:w-20 shrink-0 bg-[#f3f3f3] flex items-center justify-center py-8">
        <div
          className="flex items-center gap-4 text-[#0b0b0a] font-extrabold uppercase tracking-tight leading-none whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          <span className="text-[18px] sm:text-[18px]">{t(ticket.statusKey)}</span>
          <span className="text-[18px] sm:text-[18px]">{t('support.ticketId')} {ticket.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="p-6 sm:p-7 flex-1">
          <h3 className="text-[20px] sm:text-[20px] font-extrabold leading-[1.05] tracking-tight text-[#0b0b0a] mb-1.5 break-words">
            {ticket.titleKey ? t(ticket.titleKey) : ticket.title}
          </h3>
          {(ticket.orderRef || ticket.description) && (
            <p className="text-[14px] text-[#8a8880] truncate">
              {ticket.orderRef ? `${t('support.orderReference')} ${ticket.orderRef}` : (ticket.descriptionKey ? t(ticket.descriptionKey) : ticket.description)}
            </p>
          )}

          <div className="h-px bg-black/15 my-5" />

          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <IoCalendarOutline className="w-5 h-5 shrink-0 text-[#0b0b0a]" />
              <span className="text-[14.5px] text-[#5c5a54]">{ticket.createdOn}</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusIcon className="w-5 h-5 shrink-0 text-[#0b0b0a]" />
              <span className="text-[14.5px] text-[#5c5a54]">{t(ticket.statusKey)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-7 pb-6 sm:pb-7">
         <button
  onClick={onOpenChat}
  className="w-full flex items-center justify-center gap-3 bg-[#0b0b0a] text-white py-3 sm:py-4 text-[15px] font-bold tracking-[0.01em] border border-transparent transition-colors duration-200 hover:bg-white hover:text-[#0b0b0a] hover:border-[#0b0b0a] cursor-pointer"
>
  <BsChatText size={19} />
  {t('support.openSupportChat')}
</button>
        </div>
      </div>
    </div>
  );
}

export default function Support({ onOpenChat }) {
  const { t, i18n } = useTranslation("myaccount");
  const { t: tSidebar } = useTranslation("sidebar");
  const isFrench = i18n.language === 'fr';
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterKey, setFilterKey] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingState, setLoadingState] = useState('shimmer');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  };

  const getStatusInfo = (status) => {
    if (Number(status) === 1) {
      return { key: 'support.status.closed' };
    }
    return { key: 'support.status.active' };
  };

  const fetchTickets = async (filter = 'all', keyword = '') => {
    setLoadingState('shimmer');
    try {
      let url = `${BASE_URL}/app/ticket`;
      if (filter === 'active') url += '/0';
      else if (filter === 'closed') url += '/1';

      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        setTickets([]);
      } else {
        const raw = data?.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);

        const splashCategories = JSON.parse(localStorage.getItem('splashData') || '{}')?.ticket_categories || [];

        setTickets(list.map((ticket) => {
          const statusInfo = getStatusInfo(ticket.status);
          const categoryMeta = splashCategories.find((c) => c.name === ticket.category);
          const categoryLabel = isFrench
            ? (categoryMeta?.french_name || ticket.category || '')
            : (ticket.category || '');

          return {
            id: `#${ticket.id}`,
            rawId: ticket.id,
            userId: ticket.user_id,
            orderRef: ticket.order_id ? `#${ticket.order_id}` : '',
            createdOn: ticket.time ? formatCreatedOn(new Date(Number(ticket.time) * 1000)) : '',
            statusKey: statusInfo.key,
            title: categoryLabel,
            description: ticket.message || '',
          };
        }));
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
      setTickets([]);
    } finally {
      setLoadingState('loaded');
    }
  };

  const filterOptions = [
    { key: 'all', label: t('support.filters.allTickets') },
    { key: 'active', label: t('support.filters.active') },
    { key: 'closed', label: t('support.filters.closed') }
  ];
  const filterOption = filterOptions.find((f) => f.key === filterKey)?.label || filterOptions[0].label;

  const formatCreatedOn = (date) => {
    const datePart = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} - ${timePart}`;
  };

  const handleCreateTicket = () => {
    fetchTickets(filterKey, debouncedQuery);
  };

  const handleOpenChat = (ticket) => {
    setSelectedTicket(ticket);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedTicket(null);
  };

  const isLoading = loadingState === 'shimmer';
  const isFiltering = filterKey !== 'all' || debouncedQuery.trim() !== '';
  const hasTickets = tickets.length > 0;
  const showBar = isLoading || hasTickets || isFiltering;

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 1000);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    fetchTickets(filterKey, debouncedQuery);
  }, [filterKey, debouncedQuery]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes supportShimmer { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
      `}} />

      {/* No min-h-screen — MyAccount.jsx's wrapper already provides a full
          viewport (navbar clearance included); stacking another one here
          forced this tab an extra viewport tall even on short/empty
          content, causing a page scrollbar on the empty state at any
          screen size or zoom level. */}
      <div className="bg-[#f3f3f3]">
        {/* mt-2 on mobile, not mt-9 — that was stacking on top of
            Sidebar.jsx's own bottom padding on the mobile tab row, leaving
            a big empty gap before this card started. md:mt-9 keeps desktop
            unchanged, same pattern as Dashboard.jsx's mt-2 md:mt-10 fix. */}
        <div className="p-4 sm:p-6 md:p-8 mt-2 md:mt-9 max-w-10xl mx-auto">
          {isChatOpen ? (
            <div className="bg-white border border-black/10 p-6 md:p-8">
              <SupportChat ticket={selectedTicket} onClose={handleCloseChat} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8 md:mb-10">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
                  {tSidebar('groupHelp')}
                </p>
                <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
                  {t('support.title')}
                </h1>
                <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
                  {t('support.subtitle')}
                </p>
              </div>

              {showBar ? (
                <>
                  {/* Search + Filter + Create */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-8 md:mb-10">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8a8880]" />
                      <input
                        type="text"
                        placeholder={t('support.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-black/10 text-[14px] text-[#0b0b0a] placeholder:text-[#8a8880] focus:outline-none focus:border-black/30 transition-colors"
                      />
                    </div>

                    <FilterDropdown options={filterOptions} selected={filterOption} onSelect={setFilterKey} />

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13px] font-medium tracking-[0.02em] border border-[#0b0b0a]  transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer whitespace-nowrap w-full sm:w-auto"
                    >
                      {t('support.createTicket.button')}
                    </button>
                  </div>

                  {/* Tickets */}
                  {!isLoading && !hasTickets ? (
                    <div className="bg-white border border-black/10 flex flex-col items-center justify-center min-h-[40vh] py-12 px-4 text-center">
                      <h3 className="text-[16px] font-semibold text-[#0b0b0a] mb-2">
                        {t('support.noResults.title')}
                      </h3>
                      <p className="text-[13.5px] text-[#8a8880] max-w-md">
                        {t('support.noResults.description')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                          <SupportTicketShimmer key={index} />
                        ))
                      ) : (
                        tickets.map((ticket) => (
                          <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onOpenChat={() => handleOpenChat(ticket)}
                            t={t}
                          />
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* ── Empty State ── */
                <div className="bg-white border border-black/10 flex flex-col items-center justify-center min-h-[40vh] py-12 px-4">
                  <div className="w-48 h-48 md:w-64 md:h-64 mb-6 flex items-center justify-center">
                    <img
                      src="/sr.svg"
                      alt={t('support.emptyState.illustrationAlt')}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0b0b0a] mb-2">
                    {t('support.emptyState.title')}
                  </h3>

                  <p className="text-[13.5px] text-[#8a8880] text-center max-w-md mb-6 leading-relaxed">
                    {t('support.emptyState.description')}
                  </p>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
                  >
                    {t('support.emptyState.createNewTicket')}
                    <IoArrowForward className="w-[15px] h-[15px]" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTicket}
      />
    </>
  );
}
