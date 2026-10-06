"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RxRocket } from "react-icons/rx";
import { TbNotes } from "react-icons/tb";
import { FaRegHeart } from "react-icons/fa";
import { IoReceiptOutline, IoArrowForward } from "react-icons/io5";
import { OrderDetailsModal } from "./ModalBox/OrderDetailsModal";
import { BASE_URL } from "../../API/API";

// One shimmer block — every skeleton on this page is built from this.
const Bone = ({ w, h, className = "" }) => (
  <span
    className={`block bg-black/[0.06] ${className}`}
    style={{
      width: w,
      height: h,
      animation: "dashShimmer 1.5s ease-in-out infinite",
    }}
  />
);

// ── KPI card — sm and up: a compact single row (icon, number + label,
// arrow) sitting flush against its neighbours (one shared border). Phones:
// three small stacked cards side by side (icon, number, label) instead of
// three full-width rows, so the page needs far less scrolling. ──
function StatCard({
  Icon,
  value,
  label,
  subtitle,
  isLoading,
  onClick,
  isLast,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden flex min-w-0 flex-col items-start gap-2.5 text-left bg-white border border-black/10 p-3 cursor-pointer transition-colors duration-200 hover:bg-black/[0.02] sm:flex-row sm:items-center sm:gap-4 sm:border-r-0 sm:p-6 ${isLast ? "sm:border-r" : ""}`}
    >
      <span className="grid place-items-center w-8 h-8 shrink-0 bg-[#0b0b0a] text-white transition-transform duration-300 ease-out group-hover:scale-[1.06] sm:w-11 sm:h-11">
        <Icon className="w-[15px] h-[15px] sm:w-[18px] sm:h-[18px]" />
      </span>

      <div className="flex-1 min-w-0">
        {isLoading ? (
          <Bone w="52px" h="24px" className="mb-1.5" />
        ) : (
          <div className="text-[19px] sm:text-[25px] font-semibold leading-none tracking-[-0.01em] text-[#0b0b0a] tabular-nums mb-1 sm:mb-1.5">
            {value}
          </div>
        )}
        <div className="text-[11px] leading-tight font-medium text-[#0b0b0a] sm:text-[12.5px] sm:truncate">
          {label}
        </div>
        {subtitle && (
          <div className="mt-0.5 hidden text-[11px] text-[#8a8880] truncate sm:block">
            {subtitle}
          </div>
        )}
      </div>

      <IoArrowForward className="hidden sm:block w-3.5 h-3.5 shrink-0 text-black/20 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#0b0b0a] transition-all duration-300" />

      <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0b0b0a] transition-[width] duration-300 ease-out group-hover:w-full" />
    </button>
  );
}

const STATUS_DOT = {
  Delivered: "bg-emerald-600",
  Processing: "bg-amber-500",
  "Awaiting Confirmation": "bg-yellow-500",
  "Scheduled for Delivery": "bg-sky-600",
  "Waiting for Shipment": "bg-sky-600",
};

// ── Orders table — column headers on desktop, stacked rows on phones ──
function OrdersTableHead({ t }) {
  return (
    <div className="hidden lg:grid grid-cols-[1.4fr_1fr_1fr_0.8fr_190px] gap-6 px-5 sm:px-7 py-3.5 bg-black/[0.02] border-b border-black/10 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
      <span>{t("dashboard.table.order")}</span>
      <span>{t("dashboard.table.date")}</span>
      <span>{t("dashboard.table.status")}</span>
      <span>{t("dashboard.table.total")}</span>
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
          <div className="text-[16px] font-semibold text-[#0b0b0a] truncate">
            #{order.order_number || order.id}
          </div>
          <div className="lg:hidden text-[13px] text-[#8a8880] mt-0.5 truncate">
            {t("dashboard.placedOn")}{" "}
            {formatOrderDate(order.order_date || order.created_at)}
          </div>
        </div>
      </div>

      <div className="hidden lg:block text-[14.5px] text-[#5c5a54]">
        {formatOrderDate(order.order_date || order.created_at)}
      </div>

      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#0b0b0a] border border-black/10">
          <span
            className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOT[order.status] || "bg-black/30"}`}
          />
          {order.status}
        </span>
      </div>

      <div className="text-[17px] font-semibold text-[#0b0b0a]">
        ${parseFloat(order.total_amount ?? 0).toFixed(2)}
        <span className="ml-1.5 text-[12.5px] font-normal text-[#8a8880]">
          · {itemCount}{" "}
          {itemCount === 1 ? t("dashboard.item") : t("dashboard.items")}
        </span>
      </div>

      <div>
        <button
          onClick={() => onOpen(order)}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0b0b0a] text-white cursor-pointer px-4 py-2.5 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors duration-200 hover:bg-white hover:text-[#0b0b0a] border border-[#0b0b0a]"
        >
          {t("dashboard.moreDetails")}
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

export default function Dashboard() {
  const { t } = useTranslation("myaccount");
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingState, setLoadingState] = useState("shimmer");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem("splashData") || "{}");
      return splashData?.user?.token || localStorage.getItem("token") || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("LoginData")) {
      router.replace("/");
      return;
    }

    const fetchDashboard = async () => {
      setLoadingState("shimmer");
      try {
        const res = await fetch(`${BASE_URL}/web/dashboard`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data?.status === false) {
          toast.error(
            data?.action_message || data?.action || "Something went wrong.",
          );
        } else if (data?.status) {
          setLoyaltyPoints(data.data?.loyalty_points ?? 0);
          setTotalOrders(data.data?.total_orders ?? 0);
          setWishlistCount(data.data?.wishlist_count ?? 0);
          setRecentOrders(
            Array.isArray(data.data?.recent_orders)
              ? data.data.recent_orders
              : [],
          );
        }
      } catch (err) {
        console.error("Fetch dashboard error:", err);
      } finally {
        setLoadingState("loaded");
      }
    };
    fetchDashboard();
  }, []);

  const isLoading = loadingState === "shimmer";
  const hasOrders = recentOrders.length > 0;
  const showOrdersSection = isLoading || hasOrders;

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(String(dateStr).replace(" ", "T"));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const goTo = (tab) => router.push(`/my-account?tab=${tab}`);

  return (
    <div className="bg-[#f3f3f3]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes dashShimmer { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
      `,
        }}
      />

      <div className="p-4 md:p-8 max-w-10xl mx-auto">
        {/* KPI row — cards share their borders (one hairline between each),
            not three separate boxed tiles. */}
        <div className="grid grid-cols-3 gap-2 sm:gap-0 mb-8 md:mb-12">
          <StatCard
            Icon={RxRocket}
            isLoading={isLoading}
            value={loyaltyPoints}
            label={t("dashboard.loyaltyPoints")}
            onClick={() => goTo("loyalty")}
          />
          <StatCard
            Icon={TbNotes}
            isLoading={isLoading}
            value={totalOrders}
            label={t("dashboard.totalOrders")}
            onClick={() => goTo("orders")}
          />
          <StatCard
            Icon={FaRegHeart}
            isLoading={isLoading}
            value={wishlistCount}
            label={t("dashboard.wishlist")}
            subtitle={t("dashboard.itemsSavedForLater")}
            onClick={() => goTo("favorites")}
            isLast
          />
        </div>

        {/* Recent orders — a proper table on desktop, stacked rows on phones */}
        <div className="bg-white border border-black/10">
          <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-black/10">
            <h2 className="text-[16.5px] font-semibold text-[#0b0b0a]">
              {t("dashboard.recentOrders")}
            </h2>
            {hasOrders && (
              <button
                onClick={() => goTo("orders")}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold tracking-[0.05em] uppercase text-[#0b0b0a] cursor-pointer hover:opacity-60 transition-opacity"
              >
                {t("dashboard.seeAll")}
                <IoArrowForward className="w-3 h-3" />
              </button>
            )}
          </div>

          {showOrdersSection ? (
            <div>
              <OrdersTableHead t={t} />
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <OrderRowShimmer key={index} />
                  ))
                : recentOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onOpen={handleOpenDetails}
                      t={t}
                      formatOrderDate={formatOrderDate}
                    />
                  ))}
            </div>
          ) : (
            // Empty state — compact on phones (small illustration, short
            // copy width, smaller button), roomier from md up.
            <div className="flex flex-col items-center justify-center px-5 py-7 text-center sm:py-9 md:min-h-[30vh] md:py-10">
              <div className="mb-3 flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32 md:mb-5 md:h-48 md:w-48">
                <img src="/empty.svg" alt="" className="h-full w-full object-contain" />
              </div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-[#0b0b0a] md:mb-2 md:text-lg">
                {t("dashboard.emptyCart.title")}
              </h3>
              <p className="mb-4 max-w-[260px] text-[12.5px] leading-relaxed text-[#8a8880] sm:max-w-sm md:mb-6 md:max-w-md md:text-sm">
                {t("dashboard.emptyCart.description")}
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="cursor-pointer border border-[#0b0b0a] bg-[#0b0b0a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-white hover:text-[#0b0b0a] md:px-6 md:py-3"
              >
                {t("dashboard.emptyCart.browseProducts")}
              </button>
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
