import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { saveCartData, getCartData } from "../../../utils/cartStorage";
import { RiDeleteBinLine } from "react-icons/ri";
import CreateVoucherModal from "../MyAccount/ModalBox/CreateVoucherModal";
import LoginModal from "../Onboarding/Login";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";


const toCleanAmount = (val) => {
  if (typeof val === "number") return val;
  return parseFloat(String(val ?? "0").replace(",", ".")) || 0;
};
const formatPrice = (val, lang) => {
  const num = toCleanAmount(val);
  const locale = lang && lang.startsWith("fr") ? "fr-FR" : "en-US";
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
};

const getErrorMsg = (data) => {
  if (data.errors?.length > 0) return data.errors[0].message;
  if (data.action) return data.action;
  if (data.action_message) return data.action_message;
  return null;
};

// ─── Chevron Icons ────────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// ─── New Quantity Dropdown ────────────────────────────────────────────────────
function CustomDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [windowStart, setWindowStart] = useState(1);
  const dropdownRef = useRef(null);
  const MAX = 100;
  const WINDOW = 10;

  const selectedQty = parseInt(value) || 1;
  const windowEnd = Math.min(windowStart + WINDOW - 1, MAX);
  const numbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  const openDropdown = () => {
    // Center window around selected value
    const idealStart = Math.max(1, Math.min(selectedQty - 4, MAX - WINDOW + 1));
    setWindowStart(idealStart);
    setIsOpen(true);
  };

  const handleSelect = (num) => {
    onChange(String(num));
    setIsOpen(false);
  };

  const slideDown = () => {
    setWindowStart((prev) => Math.min(prev + WINDOW, MAX - WINDOW + 1));
  };

  const slideUp = () => {
    setWindowStart((prev) => Math.max(1, prev - WINDOW));
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className="flex items-center gap-1 border border-gray-200 px-1.5 py-1 text-sm text-gray-800 cursor-pointer hover:border-gray-400 transition-colors min-w-10"
      >
        <span className="font-medium">{selectedQty}</span>
        <span className={`ml-auto text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 bg-white border border-gray-200 shadow-md z-50 min-w-10 overflow-hidden">
          {/* Up arrow — only show if not at top */}
          {windowStart > 1 && (
            <button
              className="w-full flex items-center cursor-pointer justify-center h-7 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              onMouseEnter={slideUp}
              onClick={slideUp}
            >
              <ChevronUp />
            </button>
          )}

          <ul>
            {numbers.map((num) => (
              <li
                key={num}
                onClick={() => handleSelect(num)}
                className={`py-1.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 text-center w-full ${
                  num === selectedQty ? "font-medium text-black" : "text-gray-800"
                }`}
              >
                {num}
              </li>
            ))}
          </ul>

          {/* Down arrow — only show if not at bottom */}
          {windowEnd < MAX && (
            <button
              className="w-full flex items-center cursor-pointer justify-center h-7 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              onMouseEnter={slideDown}
              onClick={slideDown}
            >
              <ChevronDown />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Size Dropdown (unchanged — only for size, not qty) ───────────────────────
function SizeDropdown({ options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        .dropdown-menu-scrollbar-hide::-webkit-scrollbar { display: none; }
        .dropdown-menu-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          border: "1px solid #ddd", padding: "4px 8px",
          fontSize: "13px", background: "#fff", color: "#111",
          cursor: disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "6px", minWidth: disabled ? "auto" : "42px",
          userSelect: "none", transition: "border-color 0.15s",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = "#999"; }}
        onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.borderColor = "#ddd"; }}
      >
        <span>{value}</span>
        {!disabled && (
          <span style={{
            display: "inline-block", width: 0, height: 0,
            borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
            borderTop: "5px solid #555", flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
          }} />
        )}
      </div>
      {open && !disabled && (
        <div
          className="dropdown-menu-scrollbar-hide"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff",
            border: "1px solid #ddd", minWidth: "100%", zIndex: 1100,
            maxHeight: "calc(10 * 33px)", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {options.map((opt) => (
            <SizeDropItem key={opt} label={opt} selected={opt === value} onSelect={() => { onChange(opt); setOpen(false); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function SizeDropItem({ label, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 12px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
        background: hovered ? "#111" : "#fff", color: hovered ? "#fff" : "#111",
        fontWeight: selected ? 600 : 400, transition: "background 0.15s, color 0.15s",
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
}

function AppliedPill({ code, label, onRemove }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0",
      border: "1px solid #ccc", overflow: "hidden", background: "#fff",
    }}>
      <span style={{
        padding: "5px 10px", fontSize: "12px", fontWeight: 600,
        color: "#111", letterSpacing: "0.04em",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}>
        {code}
      </span>
      {label && (
        <>
          <span style={{ display: "block", width: "1px", height: "26px", background: "#ccc" }} />
          <span style={{
            padding: "5px 10px", fontSize: "12px", color: "#888",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}>
            {label}
          </span>
        </>
      )}
      {onRemove && (
        <>
          <span style={{ display: "block", width: "1px", height: "26px", background: "#ccc" }} />
          <button
            onClick={onRemove}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "5px 8px", background: "none", border: "none",
              cursor: "pointer", color: "#555",
            }}
          >
            <IoClose size={12} />
          </button>
        </>
      )}
    </div>
  );
}

function ButtonSpinner({ color = "#111" }) {
  return (
    <>
      <style>{`@keyframes applyBtnSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <span
        style={{
          display: "inline-block", width: "13px", height: "13px",
          border: `2px solid ${color === "#fff" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.15)"}`,
          borderTopColor: color, borderRadius: "50%",
          animation: "applyBtnSpin 0.6s linear infinite",
        }}
      />
    </>
  );
}

const VOUCHER_KEY = "cartVoucherState";
const getVoucherState = () => { try { return JSON.parse(localStorage.getItem(VOUCHER_KEY) || "null"); } catch { return null; } };
const setVoucherState = (state) => localStorage.setItem(VOUCHER_KEY, JSON.stringify(state));
const removeVoucherState = () => localStorage.removeItem(VOUCHER_KEY);

// ─── Upsell Product Card ──────────────────────────────────────────────────────
function UpsellCard({ item, onAdd, isAdding }) {
  const { t, i18n } = useTranslation("modaladdtocart");
  const lang = i18n.language;
  const [addHovered, setAddHovered] = useState(false);
  if (!item) return null;

  const imageUrl = item.image ||
    (item.products?.[0]?.images?.[0]?.media
      ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}`
      : null);

  const price = parseFloat(String(item.price ?? item.products?.[0]?.price ?? "0").replace(",", ".")) || 0;
  const name = (lang === "fr" && item.french_name) ? item.french_name : (item.name || "");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 12px 4px 4px", backgroundColor: "#fff" }}>
      <div style={{
        width: "64px", height: "72px", flexShrink: 0,
        backgroundColor: "#f3f3f3", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {imageUrl
          ? <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "36px", height: "48px", backgroundColor: "#ddd" }} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: "0 0 8px", fontSize: "12px", fontWeight: 600, color: "#111",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          lineHeight: 1.4, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}>
          {name}
        </p>
        <button
          onClick={() => !isAdding && onAdd(item)}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          disabled={isAdding}
          style={{
            padding: "6px 8px", fontSize: "11px", fontWeight: 500,
            letterSpacing: "0.08em", textTransform: "uppercase",
            border: "1px solid #ccc",
            background: isAdding ? "#111" : addHovered ? "#111" : "#f3f3f3",
            color: isAdding ? "#fff" : addHovered ? "#fff" : "#111",
            cursor: isAdding ? "default" : "pointer",
            transition: "background 0.2s, color 0.2s",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", minWidth: "80px",
          }}
        >
          {isAdding ? (
            <>
              <style>{`@keyframes upsellSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
              <span style={{ width: 11, height: 11, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "upsellSpin 0.6s linear infinite" }} />
            </>
          ) : `${t("add")} — ${formatPrice(price, lang)} €`}
        </button>
      </div>
    </div>
  );
}

export default function ModalAddToCart({ isOpen, onClose, product = {}, autoCloseOnLeave = false }) {
  const { t, i18n } = useTranslation("modaladdtocart");
  const lang = i18n.language;
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [upsellProducts, setUpsellProducts] = useState([]);
  const [upsellIndex, setUpsellIndex] = useState(0);
  const [addingUpsellId, setAddingUpsellId] = useState(null);

  const [giftOpen, setGiftOpen] = useState(false);
  const [giftContentHeight, setGiftContentHeight] = useState(0);

  const isLoggedIn = (() => {
    try {
      const d = JSON.parse(localStorage.getItem("LoginData") || "null");
      return !!(d?.data?.token);
    } catch { return false; }
  })();

  const [guestVoucherInput, setGuestVoucherInput] = useState("");
  const [guestVoucherError, setGuestVoucherError] = useState(null);
  const [guestVoucherLoading, setGuestVoucherLoading] = useState(false);
  const [guestApplyHovered, setGuestApplyHovered] = useState(false);
  const [guestPendingPill, setGuestPendingPill] = useState(null);
  const [guestAppliedVoucher, setGuestAppliedVoucher] = useState(null);
  const [guestUsedCodes, setGuestUsedCodes] = useState([]);
  const [guestLoginHovered, setGuestLoginHovered] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [loggedVoucherInput, setLoggedVoucherInput] = useState(() => getVoucherState()?.selectedPill || "");
  const [loggedVoucherError, setLoggedVoucherError] = useState(null);
  const [loggedVoucherLoading, setLoggedVoucherLoading] = useState(false);
  const [loggedApplyHovered, setLoggedApplyHovered] = useState(false);
  const [loggedVoucherApplied, setLoggedVoucherApplied] = useState(() => getVoucherState()?.applied || false);
  const [appliedVoucherOff, setAppliedVoucherOff] = useState(() => getVoucherState()?.off || 0);
  const [selectedPill, setSelectedPill] = useState(() => getVoucherState()?.selectedPill || null);
  const [redeemHovered, setRedeemHovered] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherPills, setVoucherPills] = useState([]);
  const [voucherPoints, setVoucherPoints] = useState(() => {
    const saved = getVoucherState();
    return saved?.voucherPoints !== undefined ? saved.voucherPoints : null;
  });
  const [createMoreHovered, setCreateMoreHovered] = useState(false);
  const [learnMoreHovered, setLearnMoreHovered] = useState(false);

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoHovered, setPromoHovered] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [pendingPromoPill, setPendingPromoPill] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("home");
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const deliveryDropdownRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkoutDeliveryMethod");
      if (saved === "home" || saved === "pickup") setDeliveryMethod(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (deliveryDropdownRef.current && !deliveryDropdownRef.current.contains(e.target))
        setDeliveryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const router = useRouter();
  const overlayRef = useRef(null);
  const giftContentRef = useRef(null);

  // Opened from LandingCards/ExpertAdvicesDetail (add-to-cart), the cursor is usually still over
  // the card, not the panel that slides in from the right — so start the 2s close timer
  // immediately, and only cancel it while the cursor is actually over the panel. Opened from
  // Navbar (viewing the cart), autoCloseOnLeave stays false and none of this runs — it never
  // self-closes.
  const autoCloseTimerRef = useRef(null);
  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };
  const startAutoCloseTimer = () => {
    if (!autoCloseOnLeave) return;
    clearAutoCloseTimer();
    autoCloseTimerRef.current = setTimeout(() => {
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (isOpen && autoCloseOnLeave) {
      startAutoCloseTimer();
    } else {
      clearAutoCloseTimer();
    }
    return clearAutoCloseTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoCloseOnLeave]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      return;
    }
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const preventScroll = (e) => e.preventDefault();
    const overlay = overlayRef.current;
    overlay?.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      overlay?.removeEventListener("touchmove", preventScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const saved = getVoucherState();
    if (saved) {
      setLoggedVoucherApplied(saved.applied || false);
      setAppliedVoucherOff(saved.off || 0);
      setSelectedPill(saved.selectedPill || null);
      setLoggedVoucherInput(saved.selectedPill || "");
      if (saved.voucherPoints !== undefined) setVoucherPoints(saved.voucherPoints);
    } else {
      setLoggedVoucherApplied(false);
      setAppliedVoucherOff(0);
      setSelectedPill(null);
      setLoggedVoucherInput("");
      setVoucherPoints(null);
    }
  }, [isOpen]);

  const refreshCartFromServer = async (stopLoader = false) => {
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/cart/list`, {
        method: "POST",
        headers: token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token ? {} : { device_id: getDeviceId() }),
      });
      const data = await res.json();
      if (data.status) {
        const normalizedData = {
          ...data.data,
          cartItem: (data.data.cartItem || data.data.cartItems || []).filter(Boolean),
        };
        saveCartData(normalizedData);
        const items = normalizedData.cartItem;
        setCartItems(items);
        setCartCount(normalizedData.cart_count || 0);
        if (items.length === 0) {
          removeVoucherState();
          setLoggedVoucherApplied(false);
          setAppliedVoucherOff(0);
          setSelectedPill(null);
          setLoggedVoucherInput("");
          setVoucherPoints(null);
        }
      }
    } catch { } finally {
      if (stopLoader) setIsRemoving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const stored = getCartData();
    if (stored) {
      setCartItems((stored.cartItem || stored.cartItems || []).filter(Boolean));
      setCartCount(stored.cart_count || 0);
    }
    refreshCartFromServer();
    fetchUpsellProducts();
  }, [isOpen]);

  // Login hone ke baad cart ko fresh data se update karo
  useEffect(() => {
    const handleLoginChange = () => {
      const stored = getCartData();
      if (stored) {
        setCartItems((stored.cartItem || stored.cartItems || []).filter(Boolean));
        setCartCount(stored.cart_count || 0);
      }
    };
    window.addEventListener('loginStateChange', handleLoginChange);
    return () => window.removeEventListener('loginStateChange', handleLoginChange);
  }, []);

  // Logout hone ke baad guest cart data se update karo
  useEffect(() => {
    const handleLogoutChange = () => {
      const stored = getCartData();
      if (stored) {
        setCartItems((stored.cartItem || stored.cartItems || []).filter(Boolean));
        setCartCount(stored.cart_count || 0);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    };
    window.addEventListener('logoutStateChange', handleLogoutChange);
    return () => window.removeEventListener('logoutStateChange', handleLogoutChange);
  }, []);

  const fetchUpsellProducts = () => {
    try {
      const cached = localStorage.getItem('splashData');
      if (cached) {
        const data = JSON.parse(cached);
        setUpsellProducts(data?.suggest_products || []);
      }
    } catch {}
  };

  const voucherFetchedRef = useRef(false);

  const fetchVouchers = async () => {
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/voucher/list`, {
        method: "GET",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        ...(token ? {} : { body: JSON.stringify({ device_id: getDeviceId() }) }),
      });
      const data = await res.json();
      const list = data.data?.vouchers?.data || data.data?.data;
      if (data.status) {
        setVoucherPills(list || []);
        const totalPoints = data.data?.loyalty_points !== undefined ? Number(data.data.loyalty_points) : 0;
        setVoucherPoints(totalPoints);
        const saved = getVoucherState();
        setVoucherState({ ...(saved || {}), voucherPoints: totalPoints });
      }
    } catch { }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchVouchers();
  }, [isOpen]);

  useEffect(() => {
    if (giftContentRef.current) {
      setGiftContentHeight(giftContentRef.current.scrollHeight);
    }
  }, [
    giftOpen, selectedPill, loggedVoucherApplied, loggedVoucherError,
    voucherPills, voucherPoints, guestPendingPill, guestAppliedVoucher, guestVoucherError,
  ]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  const handleGuestInputChange = (e) => {
    const val = e.target.value;
    setGuestVoucherInput(val);
    setGuestVoucherError(null);
  };

  const handleGuestPendingPillRemove = () => {
    setGuestPendingPill(null);
    setGuestVoucherInput("");
    setGuestVoucherError(null);
  };

  const handleGuestApply = () => {
    if (!guestVoucherInput.trim()) return;
    setGuestVoucherError(t("loginFirstVoucher"));
  };

  const handleGuestRemoveApplied = () => {
    setGuestAppliedVoucher(null);
    setGuestVoucherError(null);
    setGuestVoucherInput("");
    setGuestPendingPill(null);
  };

  const handlePillClick = (code) => {
    if (loggedVoucherApplied) return;
    setSelectedPill(code);
    setLoggedVoucherInput(code);
    setLoggedVoucherError(null);
    setVoucherState({ ...getVoucherState(), selectedPill: code, applied: false });
  };

  const handlePillRemove = () => {
    setSelectedPill(null);
    setLoggedVoucherInput("");
    setLoggedVoucherError(null);
    setVoucherState({ ...getVoucherState(), selectedPill: null });
  };

  const handleLoggedApply = async () => {
    const codeToApply = selectedPill || loggedVoucherInput.trim();
    if (!codeToApply || loggedVoucherApplied) return;
    if (!selectedPill) setSelectedPill(codeToApply);
    setLoggedVoucherLoading(true);
    setLoggedVoucherError(null);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/order/check/voucher`, {
        method: "POST",
        headers: token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { name: codeToApply } : { name: codeToApply, device_id: getDeviceId() }),
      });
      const data = await res.json();
      if (data.status === false) {
        setLoggedVoucherError(getErrorMsg(data) || t("invalidVoucher"));
        setLoggedVoucherLoading(false);
        return;
      }
      const off = data.data?.off || 0;
      const point = data.data?.point ?? 0;
      setAppliedVoucherOff(off);
      setVoucherPoints(point);
      if (point === 0) {
        setSelectedPill(null);
        setLoggedVoucherInput("");
        setVoucherState({ applied: false, selectedPill: null, input: "", off: 0, voucherPoints: 0 });
      } else {
        setLoggedVoucherApplied(true);
        setVoucherState({ applied: true, selectedPill: codeToApply, input: codeToApply, off, voucherPoints: point });
        fetchVouchers();
      }
    } catch {
      setLoggedVoucherError(t("somethingWentWrong"));
    }
    setLoggedVoucherLoading(false);
  };

  const handleLoggedRemoveVoucher = () => {
    setSelectedPill(null);
    setLoggedVoucherApplied(false);
    setLoggedVoucherInput("");
    setLoggedVoucherError(null);
    setAppliedVoucherOff(0);
    setVoucherPoints(null);
    removeVoucherState();
    fetchVouchers();
  };

  const handlePromoInputChange = (e) => {
    setPromoInput(e.target.value);
    if (promoError) setPromoError(null);
  };

  const handlePromoApply = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch(`${BASE_URL}/user/order/check/promo-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: code }),
      });
      const data = await res.json();
      if (data.status === false) {
        setPromoError(getErrorMsg(data) || t("invalidPromoCode"));
        setPromoLoading(false);
        return;
      }
      setAppliedPromo({ code, off: data.data?.off || 0 });
      setPromoInput("");
    } catch {
      setPromoError(t("somethingWentWrong"));
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoInput("");
    fetchVouchers();
  };

  const handleUpsellAdd = async (item) => {
    const prod = item.products?.[0] || item;
    setAddingUpsellId(item.id);
    setIsRemoving(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      await fetch(`${BASE_URL}/user/cart/create`, {
        method: "POST",
        headers: token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token
          ? { product_id: prod.id, quantity: 1 }
          : { device_id: getDeviceId(), product_id: prod.id, quantity: 1 }
        ),
      });
      await refreshCartFromServer(true);
    } catch {}
    finally {
      setAddingUpsellId(null);
      setIsRemoving(false);
    }
  };

  const freeShippingThreshold = 39;
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item) return sum;
    const unitPrice = parseFloat(String(item.price ?? "0").replace(",", ".")) || 0;
    return sum + unitPrice * (item.quantity || 0);
  }, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal).toFixed(2);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.off) / 100 : 0;
  const totalDiscount = (loggedVoucherApplied ? appliedVoucherOff : 0) + promoDiscount;

  const getDeliveryCost = (method, total) => {
    if (total < 39) return method === "pickup" ? 5.90 : 6.90;
    if (total < 59) return method === "pickup" ? 0 : 6.90;
    return method === "pickup" ? 0 : 2.90;
  };
  const deliveryCost = getDeliveryCost(deliveryMethod, subtotal);
  const isFreeDelivery = deliveryCost === 0;
  const deliveryCostsCharge = subtotal >= 39 ? 0 : 5.90;
  const totalWithDelivery = Math.max(0, subtotal + deliveryCostsCharge + deliveryCost - totalDiscount).toFixed(2);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => { window.location.href = "/checkout"; }, 600);
  };

  const handleRemove = async (cartId) => {
    setIsRemoving(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/cart/remove`, {
        method: "POST",
        headers: token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { cartId } : { device_id: getDeviceId(), cartId }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = getErrorMsg(data);
        if (msg) toast.error(msg);
        setIsRemoving(false);
        return;
      }
      refreshCartFromServer(true);
    } catch (err) {
      console.error("Cart remove error:", err);
      setIsRemoving(false);
    }
  };

  const handleQtyChange = async (cartId, newQty) => {
    setIsRemoving(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/cart/update/quantity`, {
        method: "POST",
        headers: token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { quantity: parseInt(newQty), cartId } : { device_id: getDeviceId(), quantity: parseInt(newQty), cartId }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg = getErrorMsg(data);
        if (msg) toast.error(msg);
        setIsRemoving(false);
        return;
      }
      refreshCartFromServer(true);
    } catch (err) {
      console.error("Cart update error:", err);
      setIsRemoving(false);
    }
  };

  const isEmpty = !isLoading && cartItems.length === 0;

  const renderGuestVoucherContent = () => (
    <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
      <div style={{
        display: "flex",
        border: `1px solid ${guestVoucherError ? "#e02424" : "#ddd"}`,
        overflow: "hidden", transition: "border-color 0.15s",
      }}>
        <input
          type="text" placeholder={t("enterVoucherCodePlaceholder")}
          value={guestVoucherInput}
          onChange={handleGuestInputChange}
          onKeyDown={(e) => { if (e.key === "Enter") handleGuestApply(); }}
          style={{
            flex: 1, border: "none", outline: "none", padding: "11px 14px", fontSize: "13px",
            color: "#111", background: "#fff", cursor: "text",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        />
        
        <button
          onClick={handleGuestApply}
          disabled={!guestVoucherInput.trim()}
          onMouseEnter={() => { if (guestVoucherInput.trim()) setGuestApplyHovered(true); }}
          onMouseLeave={() => setGuestApplyHovered(false)}
          style={{
            border: "none", borderLeft: "1px solid #ddd",
            background: !guestVoucherInput.trim() ? "#f3f3f3" : guestApplyHovered ? "#111" : "transparent",
            color: !guestVoucherInput.trim() ? "#aaa" : guestApplyHovered ? "#fff" : "#111",
            padding: "11px 18px", fontSize: "12px", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: !guestVoucherInput.trim() ? "default" : "pointer",
            transition: "background 0.2s, color 0.2s",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {t("apply")}
        </button>
      </div>

      {guestVoucherError && (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
    padding: "10px 12px",
    background: "#fdecec",
    border: "1px solid #f5c6c6",
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="#e02424" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <span style={{
      fontSize: "12px",
      color: "#c0392b",
      lineHeight: 1.4,
      flex: 1,
    }}>
      {guestVoucherError}{" "}
      <span
        onClick={() => setIsLoginModalOpen(true)}
        onMouseEnter={() => setGuestLoginHovered(true)}
        onMouseLeave={() => setGuestLoginHovered(false)}
        style={{
          fontSize: "12px",
          color: "#c0392b",
          fontWeight: 700,
          cursor: "pointer",
          textDecoration: guestLoginHovered ? "underline" : "none",
        }}
      >
        {t("login")}
      </span>
    </span>
  </div>
)}

      <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
        {t("noVouchersYet")}{" "}
        <span
          onClick={() => { onClose(); router.push("/loyalty"); }}
          onMouseEnter={() => setLearnMoreHovered(true)}
          onMouseLeave={() => setLearnMoreHovered(false)}
          style={{ color: "#111", cursor: "pointer", fontWeight: 600, textDecoration: learnMoreHovered ? "underline" : "none" }}
        >
          {t("learnMore")}
        </span>
      </p>
    </div>
  );

  const renderLoggedVoucherContent = () => {
    const hasVouchers = voucherPills.length > 0;
    const hasPoints = voucherPoints !== null && voucherPoints > 0;
    const canCreateMoreVoucher = voucherPills.length >= 10 && hasPoints;

    return (
      <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
        <div style={{
          display: "flex", border: `1px solid ${loggedVoucherError ? "#e02424" : "#ddd"}`,
          overflow: "hidden", transition: "border-color 0.15s",
        }}>
          <input
  type="text"
  placeholder={t("enterVoucherCodePlaceholder")}
  value={loggedVoucherInput}
  disabled={loggedVoucherApplied}
  onChange={(e) => {
    setLoggedVoucherInput(e.target.value);
    if (loggedVoucherError) setLoggedVoucherError(null);
    const match = voucherPills.find(p => p.name === e.target.value);
    if (match) setSelectedPill(match.name); else setSelectedPill(null);
  }}
  onKeyDown={(e) => { if (e.key === "Enter") handleLoggedApply(); }}
  title={loggedVoucherApplied ? t("alreadyAddedVoucherCode") : ""}
  style={{
    flex: 1, border: "none", outline: "none", padding: "11px 14px", fontSize: "13px",
    color: loggedVoucherApplied ? "#aaa" : "#111",
    background: loggedVoucherApplied ? "#f9f9f9" : "#fff",
    cursor: loggedVoucherApplied ? "not-allowed" : "text",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  }}
/>
          <button
            onClick={handleLoggedApply}
            disabled={(!selectedPill && !loggedVoucherInput.trim()) || loggedVoucherApplied || loggedVoucherLoading}
            onMouseEnter={() => { if ((selectedPill || loggedVoucherInput.trim()) && !loggedVoucherApplied) setLoggedApplyHovered(true); }}
            onMouseLeave={() => setLoggedApplyHovered(false)}
            style={{
              border: "none", borderLeft: "1px solid #ddd",
              background: ((!selectedPill && !loggedVoucherInput.trim()) || loggedVoucherApplied) ? "#f3f3f3" : loggedApplyHovered ? "#111" : "transparent",
              color: ((!selectedPill && !loggedVoucherInput.trim()) || loggedVoucherApplied) ? "#aaa" : loggedApplyHovered ? "#fff" : "#111",
              padding: "11px 18px", fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: ((!selectedPill && !loggedVoucherInput.trim()) || loggedVoucherApplied) ? "default" : "pointer",
              transition: "background 0.2s, color 0.2s",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "56px",
            }}
          >
            {loggedVoucherLoading ? <ButtonSpinner color={loggedApplyHovered ? "#fff" : "#111"} /> : t("apply")}
          </button>
        </div>

        {selectedPill && !loggedVoucherApplied && voucherPills.some(p => p.name === selectedPill) && (
          <p style={{ margin: "10px 0 6px", fontSize: "12px", color: "#555", lineHeight: 1.5 }}>
            {t("voucherCodeAdded")}
          </p>
        )}

        {loggedVoucherError && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "10px", padding: "10px 12px", background: "#fdecec", border: "1px solid #f5c6c6" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="11" fill="#e02424" />
              <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>{loggedVoucherError}</span>
          </div>
        )}

        {!loggedVoucherApplied && hasVouchers && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", alignItems: "center" }}>
            {voucherPills.map((pill) => {
              const code = pill.name;
              const isSelected = selectedPill === code;
              return (
                <div
                  key={pill.id} onClick={() => handlePillClick(code)}
                  style={{
                    display: "inline-flex", alignItems: "center",
                    border: "1px solid #ccc", overflow: "hidden",
                    cursor: "pointer", background: isSelected ? "#111" : "#fff",
                    transition: "background 0.15s", userSelect: "none",
                  }}
                >
                  <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: isSelected ? "#fff" : "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    {code}
                  </span>
                  {isSelected && (
                    <>
                      <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(255,255,255,0.3)" }} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePillRemove(); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}
                      >
                        <IoClose size={13} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
           {canCreateMoreVoucher && (

              <button
                onClick={() => setIsVoucherModalOpen(true)}
                onMouseEnter={() => setCreateMoreHovered(true)}
                onMouseLeave={() => setCreateMoreHovered(false)}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "7px 14px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em",
                  background: createMoreHovered ? "#222" : "#f3f3f3", color: createMoreHovered ? "#fff" : "#111",
                  border: "1px solid #ccc", cursor: "pointer", transition: "background 0.2s",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", whiteSpace: "nowrap",
                }}
              >
                {t("createMoreVoucher")}
              </button>
            )}
          </div>
        )}

        {!loggedVoucherApplied && !hasVouchers && hasPoints && !loggedVoucherError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", gap: "12px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#111", lineHeight: 1.5 }}>
              <Trans
                i18nKey="modaladdtocart:pointsRedeemMessage"
                values={{ points: voucherPoints, amount: Math.floor(voucherPoints / 10) }}
                components={{ b1: <strong />, b2: <strong /> }}
              />
            </p>
            <button
              onMouseEnter={() => setRedeemHovered(true)}
              onMouseLeave={() => setRedeemHovered(false)}
              onClick={() => setIsVoucherModalOpen(true)}
              style={{
                flexShrink: 0, marginLeft: "12px",
                padding: "8px 16px", fontSize: "12px", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: redeemHovered ? "#333" : "#111", color: "#fff",
                border: "none", cursor: "pointer", transition: "background 0.2s",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              {t("redeem")}
            </button>
          </div>
        )}

        {!selectedPill && !loggedVoucherError && !loggedVoucherApplied && !hasVouchers && !hasPoints && (
          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
            {t("noVouchersYet")}{" "}
            <span
              onClick={() => { onClose(); router.push("/loyalty"); }}
              onMouseEnter={() => setLearnMoreHovered(true)}
              onMouseLeave={() => setLearnMoreHovered(false)}
              style={{ color: "#111", cursor: "pointer", textDecoration: learnMoreHovered ? "underline" : "none" }}
            >
              {t("learnMore")}
            </span>
          </p>
        )}

        {loggedVoucherApplied && selectedPill && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", background: "#111", overflow: "hidden" }}>
              <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                {selectedPill}
              </span>
              <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(255,255,255,0.25)" }} />
              <button
                onClick={handleLoggedRemoveVoucher}
                title={t("removeVoucherCode")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}
              >
                <IoClose size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1000, opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none", transition: "opacity 0.35s ease",
        }}
      />

      {/* Slide-in panel */}
      <div
        onMouseEnter={clearAutoCloseTimer}
        onMouseLeave={startAutoCloseTimer}
        style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "520px",
        backgroundColor: "#fff", zIndex: 1001, display: "flex", flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 20px", borderBottom: "1px solid #e5e5e5", flexShrink: 0,
          height: "68px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {t("yourCart")}
            </span>
            {cartCount > 0 && (
              <div
        style={{
          height: '23px',
          width: cartCount >= 100 ? '53px' : cartCount >= 10 ? '33px' : '23px',
     
          marginLeft: '5px',
          borderRadius: '999px',
          backgroundColor: '#111',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '24px',
        }}
      >
        {cartCount}
      </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-gray-600 z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
            style={{ padding: "4px 0", display: "flex", alignItems: "center" }}
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <style>{`@keyframes cartSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 28, height: 28, border: "3px solid #ddd", borderTopColor: "#111", animation: "cartSpin 0.75s linear infinite" }} />
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "4px" }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#111" }}>{t("emptyCartTitle")}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>{t("emptyCartSubtitle")}</p>
          </div>
        )}

        {/* Removing overlay */}
        {isRemoving && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "all",
          }}>
            <style>{`@keyframes panelSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 32, height: 32, border: "3px solid #ddd", borderTopColor: "#111", borderRadius: "50%", animation: "panelSpin 0.75s linear infinite" }} />
          </div>
        )}

        {/* Body */}
        {!isLoading && !isEmpty && (
          <div style={{
            flex: 1, overflowY: "auto", padding: "0 24px",
            pointerEvents: isRemoving ? "none" : "auto",
            overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
          }}>
            {cartItems.map((item) => {
              const p = item.product || {};
              const firstImage = p.images?.[0]?.media ? `${MEDIA_URL}${p.images[0].media}` : "";
              const name = (lang === "fr" && p.french_name) ? p.french_name : (p.name || "");
              const sizeOptions = p.size_name ? [p.size_name] : [];
              const isSingleSize = sizeOptions.length <= 1;
              const unitPrice = parseFloat(String(item.price ?? "0").replace(",", ".")) || 0;
              const itemTotal = (unitPrice * item.quantity).toFixed(2);
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "20px 0", borderBottom: "1px solid #e5e5e5" }}>
                  <div style={{ width: "64px", height: "80px", flexShrink: 0, backgroundColor: "#f3f3f3", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {firstImage ? <img src={firstImage} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "36px", height: "48px", backgroundColor: "#c8c2b0" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "#111", overflow: "hidden" }}>{name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {/* ✅ NEW quantity dropdown — replaces old CustomDropdown for qty */}
                      <CustomDropdown
                        value={String(item.quantity)}
                        onChange={(val) => handleQtyChange(item.id, val)}
                      />
                      {/* Size dropdown (old style, unchanged) */}
                      {sizeOptions.length > 0 && (
                        <SizeDropdown
                          options={sizeOptions}
                          value={sizeOptions[0]}
                          onChange={() => {}}
                          disabled={isSingleSize}
                        />
                      )}
                      <button onClick={() => handleRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#888", display: "flex", alignItems: "center" }} title={t("removeItem")}>
                        <RiDeleteBinLine className="hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", marginTop: "65px", color: "#555", flexShrink: 0 }}>
                    {formatPrice(itemTotal, lang)} €
                  </div>
                </div>
              );
            })}

            {/* Order Summary */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid #e5e5e5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                <span>{t("subtotal")}</span><span>{formatPrice(subtotal, lang)} €</span>
              </div>
                {appliedPromo && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#555" }}>{t("promoCode")}</span>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "#f0f0f0", overflow: "hidden" }}>
                      <span style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#111", letterSpacing: "0.04em", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                        {appliedPromo.code}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: "#111", fontWeight: 500 }}>-{formatPrice(promoDiscount, lang)} €</span>
                </div>
              )}

              {loggedVoucherApplied && selectedPill && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#555" }}>{t("voucher")}</span>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "#f0f0f0" }}>
                      <span style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{selectedPill}</span>
                    </div>
                  </div>
                  <span style={{ color: "#111", fontWeight: 500 }}>-{formatPrice(appliedVoucherOff, lang)} €</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                <span>{t("deliveryCosts")}</span>
                {subtotal >= 39 ? <span>{t("free")}</span> : <span>{formatPrice(5.90, lang)} €</span>}
              </div>
              <div style={{ marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div ref={deliveryDropdownRef} style={{ position: "relative" }}>
                    <button
                      onClick={() => setDeliveryDropdownOpen((v) => !v)}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                        display: "flex", alignItems: "center", gap: "5px",
                        fontSize: "13px", color: "#555",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#111"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; }}
                    >
                      <span>{deliveryMethod === "home" ? t("homeDelivery") : t("pickupPoint")}</span>
                      <span style={{
                        display: "inline-block", width: 0, height: 0,
                        borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                        borderTop: "5px solid #555", flexShrink: 0,
                        transform: deliveryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }} />
                    </button>
                    {deliveryDropdownOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 6px)", left: 90,
                        background: "#fff", border: "1px solid #ddd",
                        zIndex: 1100, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "140px",
                      }}>
                        {["home", "pickup"].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => {
                              setDeliveryMethod(opt);
                              setDeliveryDropdownOpen(false);
                              try { localStorage.setItem("checkoutDeliveryMethod", opt); } catch { /* ignore */ }
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#111"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => {
                              if (deliveryMethod === opt) { e.currentTarget.style.backgroundColor = "#f3f3f3"; e.currentTarget.style.color = "#111"; }
                              else { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#111"; }
                            }}
                            style={{
                              padding: "9px 14px", fontSize: "13px", cursor: "pointer",
                              background: deliveryMethod === opt ? "#f3f3f3" : "#fff",
                              color: "#111", fontWeight: deliveryMethod === opt ? 600 : 400,
                              transition: "background 0.15s, color 0.15s",
                            }}
                          >
                            {opt === "home" ? t("homeDelivery") : t("pickupPoint")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isFreeDelivery ? <span>{t("free")}</span> : <span>{formatPrice(deliveryCost, lang)} €</span>}
                </div>
              </div>

              

            

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px", fontWeight: 700, color: "#111" }}>
                <span>{t("estimatedTotal")}</span>
                <span>{formatPrice(totalWithDelivery, lang)} €</span>
              </div>
            </div>

            {/* Promo Accordion */}
            <div style={{ borderBottom: "1px solid #e5e5e5" }}>
              <button
                onClick={() => setPromoOpen((v) => !v)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 0", fontSize: "13px", color: "#111",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                <span style={{ fontWeight: 500 }}>{t("giftCardPromoCode")}</span>
                <span style={{ fontSize: "18px", fontWeight: 300, display: "inline-block", transform: promoOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
              </button>
              <div style={{ maxHeight: promoOpen ? "200px" : "0px", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)", opacity: promoOpen ? 1 : 0 }}>
                <div style={{ paddingBottom: "16px" }}>
                  <div style={{ display: "flex", border: `1px solid ${promoError ? "#e02424" : "#ddd"}`, overflow: "hidden", transition: "border-color 0.15s" }}>
                    <div style={{ position: "relative", flex: 1 }}>
  <input
    type="text" placeholder={t("enterYourCodePlaceholder")}
    value={appliedPromo ? appliedPromo.code : promoInput}
    disabled={!!appliedPromo}
    onChange={handlePromoInputChange}
    onKeyDown={(e) => { if (e.key === "Enter") handlePromoApply(); }}
    title={appliedPromo ? t("alreadyAddedPromoCode") : ""}
    style={{
      width: "100%",
      border: "none", outline: "none", padding: "11px 14px", fontSize: "13px",
      color: appliedPromo ? "#aaa" : "#111",
      background: appliedPromo ? "#f9f9f9" : "#fff",
      cursor: appliedPromo ? "not-allowed" : "text",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}
  />
</div>
                    <button
                      onClick={handlePromoApply}
                      disabled={!promoInput.trim() || !!appliedPromo || promoLoading}
                      onMouseEnter={() => { if (promoInput.trim() && !appliedPromo) setPromoHovered(true); }}
                      onMouseLeave={() => setPromoHovered(false)}
                      style={{
                        border: "none", borderLeft: "1px solid #ddd",
                        background: (!promoInput.trim() || appliedPromo) ? "#f3f3f3" : promoHovered ? "#111" : "transparent",
                        color: (!promoInput.trim() || appliedPromo) ? "#aaa" : promoHovered ? "#fff" : "#111",
                        padding: "11px 18px", fontSize: "12px", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        cursor: (!promoInput.trim() || appliedPromo) ? "default" : "pointer",
                        transition: "background 0.2s, color 0.2s",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "56px",
                      }}
                    >
                      {promoLoading ? <ButtonSpinner color={promoHovered ? "#fff" : "#111"} /> : t("apply")}
                    </button>
                  </div>
                  {promoError && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "10px", padding: "10px 12px", background: "#fdecec", border: "1px solid #f5c6c6" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <circle cx="12" cy="12" r="11" fill="#e02424" />
                        <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>{promoError}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", background: "#111", overflow: "hidden" }}>
                        <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{appliedPromo.code}</span>
                        <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(255,255,255,0.25)" }} />
                        <button onClick={handleRemovePromo} title={t("removePromoCode")} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
                          <IoClose size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Voucher Accordion */}
            <div style={{ paddingBottom: "8px" }}>
              <button
                onClick={() => setGiftOpen((v) => !v)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 0", fontSize: "13px", color: "#111",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                <span style={{ fontWeight: 500 }}>{t("applyVoucher")}</span>
                <span style={{ fontSize: "18px", fontWeight: 300, display: "inline-block", transform: giftOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
              </button>
              <div style={{ maxHeight: giftOpen ? `${giftContentHeight + 20}px` : "0px", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                {isLoggedIn ? renderLoggedVoucherContent() : renderGuestVoucherContent()}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ paddingLeft: "15px", paddingRight: "15px", paddingBottom: "15px", borderTop: "1px solid #e5e5e5", backgroundColor: "#f3f3f3", flexShrink: 0 }}>
          {subtotal < freeShippingThreshold && (
            <div style={{ padding: "14px 24px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "7px" }}>
                <span>{t("completeForFreeShipping")}</span>
                <span style={{ fontWeight: 600, color: "#111" }}>
                  {t("remainingAmount", { amount: formatPrice(isEmpty ? 0 : remaining, lang) })}
                </span>
              </div>
              <div style={{ height: "4px", backgroundColor: "#e5e5e5", overflow: "hidden", marginBottom: "14px" }}>
                <div style={{ height: "100%", width: isEmpty ? "0%" : `${progressPercent}%`, backgroundColor: "#111", transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {upsellProducts.length > 0 && (
            <div style={{
              position: "relative", padding: "0 24px",
              marginTop: subtotal >= freeShippingThreshold ? "14px" : "0",
            }}>
              {upsellProducts.length > 1 && upsellIndex > 0 && (
                <button
                  onClick={() => setUpsellIndex(i => i - 1)}
                  style={{
                    position: "absolute", left: "0px", top: "50%", transform: "translateY(-50%)",
                    zIndex: 5, width: "22px", height: "22px",
                    background: "transparent", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                  }}
                >
                  <MdKeyboardArrowLeft size={20} className="text-black" />
                </button>
              )}
              {upsellProducts.length > 1 && upsellIndex < upsellProducts.length - 1 && (
                <button
                  onClick={() => setUpsellIndex(i => i + 1)}
                  style={{
                    position: "absolute", right: "0px", top: "50%", transform: "translateY(-50%)",
                    zIndex: 5, width: "22px", height: "22px",
                    background: "transparent", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                  }}
                >
                  <MdKeyboardArrowRight size={20} className="text-black" />
                </button>
              )}
              <div style={{ overflow: "hidden", backgroundColor: "#fff" }}>
                <div style={{
                  display: "flex",
                  transform: `translateX(-${upsellIndex * 100}%)`,
                  transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}>
                  {upsellProducts.map((item) => (
                    <div key={item.id} style={{ minWidth: "100%" }}>
                      <UpsellCard item={item} onAdd={handleUpsellAdd} isAdding={addingUpsellId === item.id} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "24px 24px 24px", marginBottom: "-12px", marginTop: "-10px" }}>
            <button
              onClick={isEmpty ? undefined : handleCheckout}
              disabled={isEmpty || checkoutLoading}
              onMouseEnter={(e) => { if (!isEmpty) e.currentTarget.style.backgroundColor = "#333"; }}
              onMouseLeave={(e) => { if (!isEmpty) e.currentTarget.style.backgroundColor = checkoutLoading ? "#333" : "#111"; }}
              style={{
                width: "100%", padding: "15px", border: "none",
                backgroundColor: isEmpty ? "#fff" : "#111",
                color: isEmpty ? "#bbb" : "#fff",
                fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: (isEmpty || checkoutLoading) ? "default" : "pointer",
                transition: "background 0.2s",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
            >
              {checkoutLoading ? (
                <>
                  <style>{`@keyframes checkoutSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "checkoutSpin 0.65s linear infinite" }} />
                </>
              ) : t("continueToCheckout")}
            </button>
          </div>
        </div>
      </div>

      <CreateVoucherModal
        isOpen={isVoucherModalOpen}
        loyaltyPoints={voucherPoints || 0}
        onClose={() => { setIsVoucherModalOpen(false); fetchVouchers(); }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}