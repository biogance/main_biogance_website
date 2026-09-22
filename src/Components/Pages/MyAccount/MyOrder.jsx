"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { IoSearchOutline, IoArrowForward, IoReceiptOutline, IoChevronBack, IoChevronForward, IoChevronDown } from 'react-icons/io5';
import { BASE_URL } from '@/Components/API/API';
import { OrderDetailsModal } from './ModalBox/OrderDetailsModal';

const Bone = ({ w, h, className = "" }) => (
  <span
    className={`block bg-black/[0.06] ${className}`}
    style={{ width: w, height: h, animation: "orderShimmer 1.5s ease-in-out infinite" }}
  />
);

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

// ── Orders table — column headers on desktop, stacked rows on phones. Same
// shape as the Dashboard's Recent Orders table, so the two feel like one
// system. The last column is a fixed width in both the head and the rows —
// mismatched "auto" tracks are what causes header/row misalignment. ──
function OrdersTableHead({ t }) {
  return (
    <div className="hidden lg:grid grid-cols-[1.4fr_1fr_1fr_0.8fr_190px] gap-6 px-5 sm:px-7 py-3.5 bg-black/[0.02] border-b border-black/10 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
      <span>{t('dashboard.table.order')}</span>
      <span>{t('dashboard.table.date')}</span>
      <span>{t('dashboard.table.status')}</span>
      <span>{t('dashboard.table.total')}</span>
      <span aria-hidden="true" />
    </div>
  );
}

function OrderRow({ order, onOpen, t, formatOrderDate }) {
  const itemCount = order.items?.length ?? 0;
  return (
    <div className="group relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_190px] lg:items-center gap-3 lg:gap-6 pl-5 sm:pl-7 pr-5 sm:pr-7 py-5 border-b border-black/[0.06] last:border-b-0 transition-colors duration-200 hover:bg-black/[0.02]">
      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#0b0b0a] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="hidden xs:grid sm:grid place-items-center w-10 h-10 shrink-0 border border-black/10 text-[#0b0b0a] transition-colors duration-200 group-hover:border-black/25">
          <IoReceiptOutline className="w-[18px] h-[18px]" />
        </span>
        <div className="min-w-0">
          <div className="text-[16px] font-semibold text-[#0b0b0a] truncate">#{order.order_number || order.id}</div>
          <div className="lg:hidden text-[13px] text-[#8a8880] mt-0.5 truncate">
            {t('orderHistory.placedOn')} {formatOrderDate(order.created_at || order.order_date)}
          </div>
        </div>
      </div>

      <div className="hidden lg:block text-[14.5px] text-[#5c5a54]">
        {formatOrderDate(order.created_at || order.order_date)}
      </div>

      <div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#0b0b0a] border border-black/10 ${STATUS_TINT[order.status] || ""}`}>
          <span className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOT[order.status] || "bg-black/30"}`} />
          {order.status}
        </span>
      </div>

      <div className="text-[17px] font-semibold text-[#0b0b0a]">
        ${parseFloat(order.total_amount ?? 0).toFixed(2)}
        <span className="ml-1.5 text-[12.5px] font-normal text-[#8a8880]">
          · {itemCount} {itemCount === 1 ? t('dashboard.item') : t('dashboard.items')}
        </span>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onOpen(order)}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0b0b0a] text-white cursor-pointer px-4 py-2.5 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors duration-200 hover:bg-white hover:text-[#0b0b0a] border border-[#0b0b0a]"
        >
          {t('orderHistory.moreDetails')}
          <IoArrowForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function OrderRowShimmer() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_190px] lg:items-center gap-3 lg:gap-6 px-5 sm:px-7 py-5 border-b border-black/[0.06] last:border-b-0">
      <div className="flex items-center gap-3.5">
        <Bone w="40px" h="40px" className="shrink-0" />
        <div>
          <Bone w="84px" h="16px" className="mb-2" />
          <Bone w="128px" h="12px" className="lg:hidden" />
        </div>
      </div>
      <Bone w="104px" h="13px" className="hidden lg:block" />
      <Bone w="96px" h="22px" />
      <Bone w="76px" h="18px" />
      <Bone w="120px" h="38px" />
    </div>
  );
}

// ── Pagination — Prev / numbered pages (windowed, with an ellipsis for long
// runs) / Next. Sharp squares, active page filled in. ──
function Pagination({ current, last, onChange }) {
  if (last <= 1) return null;

  const pages = [];
  for (let p = 1; p <= last; p += 1) {
    if (p === 1 || p === last || Math.abs(p - current) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-7 py-5 border-t border-black/10">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium text-[#0b0b0a] border border-black/10 cursor-pointer transition-colors duration-200 hover:bg-black/[0.03] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <IoChevronBack className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-9 h-9 grid place-items-center text-[13px] text-[#8a8880]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === current ? 'page' : undefined}
              className={`w-9 h-9 grid place-items-center text-[13px] font-medium border cursor-pointer transition-colors duration-200 ${
                p === current
                  ? 'bg-[#0b0b0a] text-white border-[#0b0b0a]'
                  : 'bg-white text-[#5c5a54] border-black/10 hover:border-black/25'
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === last}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium text-[#0b0b0a] border border-black/10 cursor-pointer transition-colors duration-200 hover:bg-black/[0.03] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <span className="hidden sm:inline">Next</span>
        <IoChevronForward className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Filter/sort dropdown — a plain button that opens a bordered panel below
// it. A dim, click-anywhere-to-close layer sits under the panel. ──
function FilterDropdown({ label, options, selected, onSelect, align = "left" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2.5 px-4 py-3.5 bg-white border text-[13.5px] font-medium cursor-pointer transition-colors duration-200 ${
          open ? "border-black/30" : "border-black/10 hover:border-black/25"
        } text-[#0b0b0a]`}
      >
        {/* <span className="text-[#8a8880] font-normal">{label}</span> */}
        <span className="max-w-[150px] truncate">{selected}</span>
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
          {/* Opens "inward" (left dropdown → left-aligned, right dropdown →
              right-aligned) so a fixed-width panel never runs off either
              edge of a narrow screen — it always grows into free space. */}
          <div
            className={`absolute top-full mt-2 z-50 min-w-[230px] max-w-[calc(100vw-2.5rem)] max-h-[320px] overflow-y-auto bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)] ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[13px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${
                  selected === option
                    ? "bg-black/[0.04] text-[#0b0b0a] font-semibold"
                    : "text-[#5c5a54]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MyOrder() {
  const { t } = useTranslation('myaccount');
  const [loadingState, setLoadingState] = useState('shimmer');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState(t('orderHistory.filters.allOrders'));
  const [selectedSort, setSelectedSort] = useState(t('orderHistory.sort.mostRecent'));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        toast.error(data.action_message || data.action || 'Something went wrong.');
        setOrders([]);
        setPagination({ current_page: 1, last_page: 1 });
        return;
      }

      if (!res.ok) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        setOrders([]);
        setPagination({ current_page: 1, last_page: 1 });
        return;
      }

      const paginationData = data?.data;
      const list = paginationData?.data;
      setOrders(Array.isArray(list) ? list : []);
      setPagination({
        current_page: paginationData?.current_page ?? 1,
        last_page: paginationData?.last_page ?? 1,
      });
    } catch (e) {
      toast.error(e?.action_message || e?.action || 'Something went wrong. Please try again.');
      setOrders([]);
    } finally {
      setLoadingState('loaded');
    }
  }, [t]);

  useEffect(() => {
    fetchOrders('', selectedSort, selectedOrderFilter, 1);
  }, []);

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(String(dateStr).replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchOrders(val, selectedSort, selectedOrderFilter, 1);
    }, 1000);
  };

  const handleSortChange = (option) => {
    setSelectedSort(option);
    fetchOrders(searchQuery, option, selectedOrderFilter, 1);
  };

  const handleFilterChange = (option) => {
    setSelectedOrderFilter(option);
    fetchOrders(searchQuery, selectedSort, option, 1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.last_page) return;
    fetchOrders(searchQuery, selectedSort, selectedOrderFilter, page);
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const orderFilterOptions = [
    t('orderHistory.filters.allOrders'),
    t('orderHistory.filters.delivered'),
    t('orderHistory.filters.processing'),
    t('orderHistory.filters.scheduledForDelivery'),
    t('orderHistory.filters.awaitingConfirmation'),
    t('orderHistory.filters.waitingForShipment'),
  ];

  const sortOptions = [
    t('orderHistory.sort.mostRecent'),
    t('orderHistory.sort.oldestFirst'),
    t('orderHistory.sort.highestAmount'),
    t('orderHistory.sort.lowestAmount'),
  ];

  const isLoading = loadingState === 'shimmer';

  return (
    <div className="bg-[#f3f3f3] min-h-full">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orderShimmer { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
      ` }} />

      <div className="p-4 md:p-8 max-w-10xl mx-auto">
        {/* Page header — title, then search + filter/sort dropdowns */}
        <div className="mb-8 md:mb-10">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
            {t('dashboard.orderStatus')}
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
            {t('orderHistory.title')}
          </h1>
          <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
            {t('orderHistory.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8a8880]" />
              <input
                type="text"
                placeholder={t('orderHistory.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/10 text-[14px] text-[#0b0b0a] placeholder:text-[#8a8880] focus:outline-none focus:border-black/30 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <FilterDropdown
                label={t('dashboard.orderStatus')}
                options={orderFilterOptions}
                selected={selectedOrderFilter}
                onSelect={handleFilterChange}
              />
              <FilterDropdown
                label={t('orderHistory.sort.label')}
                options={sortOptions}
                selected={selectedSort}
                onSelect={handleSortChange}
                align="right"
              />
            </div>
          </div>
        </div>

        {/* The card locks to the viewport (desktop only, see the effect
            above) — count bar and table head stay put, rows scroll inside,
            and Pagination is pinned to the card's bottom edge. */}
        <div className="border border-black/10 bg-white flex flex-col lg:h-[calc(100vh-440px)] lg:min-h-[420px] lg:mb-8 lg:overflow-hidden">
            <div className="shrink-0">
              <OrdersTableHead t={t} />
            </div>

            {/* pb-9 shaves a fixed slice off the visible window on purpose —
                whatever row lands on that line gets cut mid-row instead of
                exactly at a row boundary, at any viewport height. */}
            <div className="relative flex-1 min-h-0 lg:pb-2">
              <div className="h-full lg:overflow-y-auto">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <OrderRowShimmer key={index} />
                  ))
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
                    <div className="w-40 h-40 mb-5 flex items-center justify-center opacity-80">
                      <img src="empty.svg" alt="" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#0b0b0a] mb-1.5">
                      {t('dashboard.emptyCart.title')}
                    </h3>
                    <p className="text-[13px] text-[#8a8880] text-center max-w-xs">
                      {t('orderHistory.subtitle')}
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onOpen={handleOpenDetails}
                      t={t}
                      formatOrderDate={formatOrderDate}
                    />
                  ))
                )}
              </div>

            </div>

            {!isLoading && orders.length > 0 && (
              <div className="shrink-0">
                <Pagination
                  current={pagination.current_page}
                  last={pagination.last_page}
                  onChange={handlePageChange}
                />
              </div>
            )}
        </div>
      </div>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
