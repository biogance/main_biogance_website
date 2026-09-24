import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import {
  IoClose,
  IoBagHandleOutline,
  IoTrashOutline,
  IoChevronBack,
  IoChevronForward,
  IoAdd,
  IoRemove,
  IoArrowForward,
  IoPricetagOutline,
  IoTicketOutline,
  IoCubeOutline,
  IoCheckmarkCircle,
  IoHomeOutline,
  IoStorefrontOutline,
  IoAlertCircleOutline,
  IoBagAddOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { saveCartData, getCartData } from "../../../utils/cartStorage";
import CreateVoucherModal from "../MyAccount/ModalBox/CreateVoucherModal";
import LoginModal from "../Onboarding/Login";
import { FiShoppingCart } from "react-icons/fi";

const getErrorMsg = (data) => {
  if (data.errors?.length > 0) return data.errors[0].message;
  if (data.action_message) return data.action_message;
  if (data.action) return data.action;
  return null;
};

// ─── Small UI pieces used only by this panel ─────────────────────────────────
const toCleanAmount = (val) => {
  if (typeof val === "number") return val;
  return parseFloat(String(val ?? "0").replace(",", ".")) || 0;
};

const formatPrice = (val, lang) => {
  const num = toCleanAmount(val);
  const locale = lang && lang.startsWith("fr") ? "fr-FR" : "en-US";
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
};

// ─── Small pieces ─────────────────────────────────────────────────────────────
function Spinner({ light = false, size = 14 }) {
  return (
    <span
      className={`inline-block rounded-full border-2 animate-spin ${
        light ? "border-white/40 border-t-white" : "border-black/15 border-t-[#0b0b0a]"
      }`}
      style={{ width: size, height: size }}
    />
  );
}

function ErrorNote({ children }) {
  return (
    <div className="flex items-start gap-2 mt-3 px-3.5 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px] leading-snug">
      <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" />
      <span>{children}</span>
    </div>
  );
}

// A code input joined to its Apply button; a black gradient bar grows along
// the bottom edge on focus, same treatment as the account/auth inputs.
function CodeField({
  value,
  onChange,
  onEnter,
  placeholder,
  disabled,
  title,
  hasError,
  onApply,
  applyDisabled,
  loading,
  applyLabel,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={`relative flex items-stretch bg-white border transition-colors duration-200 ${
        hasError ? "border-red-400" : focused ? "border-black/40" : "border-black/10"
      }`}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        title={title}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`flex-1 min-w-0 h-11 px-4 text-[13px] outline-none placeholder:text-[#8a8880] ${
          disabled ? "bg-black/[0.02] text-[#8a8880] cursor-not-allowed" : "bg-white text-[#0b0b0a]"
        }`}
      />
      <button
        type="button"
        onClick={onApply}
        disabled={applyDisabled}
        className={`min-w-[84px] px-4 inline-flex items-center justify-center text-[12px] font-bold tracking-[0.1em] uppercase transition-colors duration-200 ${
          applyDisabled
            ? "bg-black/[0.04] text-[#8a8880] cursor-default"
            : "bg-[#0b0b0a] text-white hover:bg-[#25221e] cursor-pointer"
        }`}
      >
        {loading ? <Spinner light size={13} /> : applyLabel}
      </button>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
          focused ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}

// A black "applied" chip with an optional remove button.
function CodeChip({ code, onRemove, removeTitle }) {
  return (
    <div className="inline-flex items-stretch bg-[#0b0b0a] text-white">
      <span className="px-3 py-1.5 text-[12px] font-semibold tracking-[0.04em]">{code}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={removeTitle}
          className="flex items-center justify-center px-2.5 border-l border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <IoClose size={13} />
        </button>
      )}
    </div>
  );
}

// A selectable saved-voucher chip.
function VoucherOption({ code, selected, onClick, onRemove }) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-stretch border cursor-pointer select-none transition-colors duration-150 ${
        selected
          ? "bg-[#0b0b0a] border-[#0b0b0a] text-white"
          : "bg-white border-black/15 text-[#0b0b0a] hover:border-black/40"
      }`}
    >
      <span className="px-3 py-1.5 text-[12px] font-semibold tracking-[0.04em]">{code}</span>
      {selected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex items-center justify-center px-2.5 border-l border-white/20 text-white/80 hover:text-white cursor-pointer"
        >
          <IoClose size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Upsell product row ───────────────────────────────────────────────────────
function UpsellCard({ item, onAdd, isAdding }) {
  const { t, i18n } = useTranslation("modaladdtocart");
  const lang = i18n.language;
  if (!item) return null;

  const imageUrl =
    item.image ||
    (item.products?.[0]?.images?.[0]?.media
      ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}`
      : null);

  const price =
    parseFloat(
      String(item.price ?? item.products?.[0]?.price ?? "0").replace(",", "."),
    ) || 0;
  const name =
    lang === "fr" && item.french_name ? item.french_name : item.name || "";

  return (
    <div className="flex items-center gap-3 p-2.5">
      <div className="w-[46px] h-[56px] shrink-0 bg-white overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-9 h-12 bg-black/10" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="mb-1.5 text-[12px] font-semibold leading-snug text-[#0b0b0a] line-clamp-2">
          {name}
        </p>
        <button
          type="button"
          onClick={() => !isAdding && onAdd(item)}
          disabled={isAdding}
          className={`inline-flex items-center justify-center gap-1.5 min-w-[92px] h-7 px-2.5 border text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 ${
            isAdding
              ? "bg-[#0b0b0a] border-[#0b0b0a] text-white cursor-default"
              : "bg-white border-black/15 text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white hover:border-[#0b0b0a] cursor-pointer"
          }`}
        >
          {isAdding ? (
            <Spinner light size={11} />
          ) : (
            <>
             <FiShoppingCart className="w-3.5 h-3.5" />
              {`${t("add")} — ${formatPrice(price, lang)} €`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const VOUCHER_KEY = "cartVoucherState";
const getVoucherState = () => {
  try {
    return JSON.parse(localStorage.getItem(VOUCHER_KEY) || "null");
  } catch {
    return null;
  }
};
const setVoucherState = (state) =>
  localStorage.setItem(VOUCHER_KEY, JSON.stringify(state));
const removeVoucherState = () => localStorage.removeItem(VOUCHER_KEY);

// Promo code — same cross-page persistence as the voucher above. Unlike
// the voucher, `appliedPromo` used to be plain useState(null) here *and*
// in CheckOut.jsx with nothing tying the two together, so a promo code
// applied here was simply gone once the user reached checkout. Same
// localStorage key/shape CheckOut.jsx reads.
const PROMO_KEY = "cartPromoState";
const getPromoState = () => {
  try {
    return JSON.parse(localStorage.getItem(PROMO_KEY) || "null");
  } catch {
    return null;
  }
};
const setPromoState = (state) =>
  localStorage.setItem(PROMO_KEY, JSON.stringify(state));
const removePromoState = () => localStorage.removeItem(PROMO_KEY);

export default function ModalAddToCart({
  isOpen,
  onClose,
  product = {},
  autoCloseOnLeave = false,
}) {
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
      return !!d?.data?.token;
    } catch {
      return false;
    }
  })();

  const [guestVoucherInput, setGuestVoucherInput] = useState("");
  const [guestVoucherError, setGuestVoucherError] = useState(null);
  const [guestVoucherLoading, setGuestVoucherLoading] = useState(false);
  const [guestPendingPill, setGuestPendingPill] = useState(null);
  const [guestAppliedVoucher, setGuestAppliedVoucher] = useState(null);
  const [guestUsedCodes, setGuestUsedCodes] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [loggedVoucherInput, setLoggedVoucherInput] = useState(
    () => getVoucherState()?.selectedPill || "",
  );
  const [loggedVoucherError, setLoggedVoucherError] = useState(null);
  const [loggedVoucherLoading, setLoggedVoucherLoading] = useState(false);
  const [loggedVoucherApplied, setLoggedVoucherApplied] = useState(
    () => getVoucherState()?.applied || false,
  );
  const [appliedVoucherOff, setAppliedVoucherOff] = useState(
    () => getVoucherState()?.off || 0,
  );
  const [selectedPill, setSelectedPill] = useState(
    () => getVoucherState()?.selectedPill || null,
  );
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherPills, setVoucherPills] = useState([]);
  const [voucherPoints, setVoucherPoints] = useState(() => {
    const saved = getVoucherState();
    return saved?.voucherPoints !== undefined ? saved.voucherPoints : null;
  });

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState(null);
  // Reads whatever CheckOut.jsx (or a previous visit here) last saved (see
  // PROMO_KEY above) instead of always starting blank.
  const [appliedPromo, setAppliedPromo] = useState(() => getPromoState());
  const [pendingPromoPill, setPendingPromoPill] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("home");
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const deliveryDropdownRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkoutDeliveryMethod");
      if (saved === "home" || saved === "pickup") setDeliveryMethod(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        deliveryDropdownRef.current &&
        !deliveryDropdownRef.current.contains(e.target)
      )
        setDeliveryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const router = useRouter();
  const overlayRef = useRef(null);
  const giftContentRef = useRef(null);

  
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
      if (saved.voucherPoints !== undefined)
        setVoucherPoints(saved.voucherPoints);
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
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token ? {} : { device_id: getDeviceId() }),
      });
      const data = await res.json();
      if (data.status) {
        const normalizedData = {
          ...data.data,
          cartItem: (data.data.cartItem || data.data.cartItems || []).filter(
            Boolean,
          ),
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
    } catch {
    } finally {
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

  // Login hone ke baad server se fresh merged cart fetch karo
  useEffect(() => {
    const handleLoginChange = () => refreshCartFromServer();
    window.addEventListener("loginStateChange", handleLoginChange);
    return () =>
      window.removeEventListener("loginStateChange", handleLoginChange);
  }, []);

  // Order place hone ke baad cart clear karo
  useEffect(() => {
    const handleOrderPlaced = () => {
      saveCartData({ cartItem: [], cart_count: 0 });
      setCartItems([]);
      setCartCount(0);
      removeVoucherState();
      setLoggedVoucherApplied(false);
      setAppliedVoucherOff(0);
      setSelectedPill(null);
      setLoggedVoucherInput("");
      setVoucherPoints(null);
      setAppliedPromo(null);
      removePromoState();
    };
    window.addEventListener("cartOrderPlaced", handleOrderPlaced);
    return () =>
      window.removeEventListener("cartOrderPlaced", handleOrderPlaced);
  }, []);

  // Logout hone ke baad guest cart data se update karo
  useEffect(() => {
    const handleLogoutChange = () => {
      const stored = getCartData();
      if (stored) {
        setCartItems(
          (stored.cartItem || stored.cartItems || []).filter(Boolean),
        );
        setCartCount(stored.cart_count || 0);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    };
    window.addEventListener("logoutStateChange", handleLogoutChange);
    return () =>
      window.removeEventListener("logoutStateChange", handleLogoutChange);
  }, []);

  const fetchUpsellProducts = () => {
    try {
      const cached = localStorage.getItem("splashData");
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
        ...(token
          ? {}
          : { body: JSON.stringify({ device_id: getDeviceId() }) }),
      });
      const data = await res.json();
      const list = data.data?.vouchers?.data || data.data?.data;
      if (data.status) {
        setVoucherPills(list || []);
        const totalPoints =
          data.data?.loyalty_points !== undefined
            ? Number(data.data.loyalty_points)
            : 0;
        setVoucherPoints(totalPoints);
        const saved = getVoucherState();
        setVoucherState({ ...(saved || {}), voucherPoints: totalPoints });
      }
    } catch {}
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
    giftOpen,
    selectedPill,
    loggedVoucherApplied,
    loggedVoucherError,
    voucherPills,
    voucherPoints,
    guestPendingPill,
    guestAppliedVoucher,
    guestVoucherError,
  ]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

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
    setVoucherState({
      ...getVoucherState(),
      selectedPill: code,
      applied: false,
    });
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
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(
          token
            ? { name: codeToApply }
            : { name: codeToApply, device_id: getDeviceId() },
        ),
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
        setVoucherState({
          applied: false,
          selectedPill: null,
          input: "",
          off: 0,
          voucherPoints: 0,
        });
      } else {
        setLoggedVoucherApplied(true);
        setVoucherState({
          applied: true,
          selectedPill: codeToApply,
          input: codeToApply,
          off,
          voucherPoints: point,
        });
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
      const applied = { code, off: data.data?.off || 0 };
      setAppliedPromo(applied);
      setPromoState(applied);
      setPromoInput("");
    } catch {
      setPromoError(t("somethingWentWrong"));
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    removePromoState();
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
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(
          token
            ? { product_id: prod.id, quantity: 1 }
            : { device_id: getDeviceId(), product_id: prod.id, quantity: 1 },
        ),
      });
      await refreshCartFromServer(true);
    } catch {
    } finally {
      setAddingUpsellId(null);
      setIsRemoving(false);
    }
  };

  const freeShippingThreshold = 39;
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item) return sum;
    const unitPrice =
      parseFloat(String(item.price ?? "0").replace(",", ".")) || 0;
    return sum + unitPrice * (item.quantity || 0);
  }, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal).toFixed(2);
  const progressPercent = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100,
  );
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.off) / 100 : 0;
  const totalDiscount =
    (loggedVoucherApplied ? appliedVoucherOff : 0) + promoDiscount;

  const getDeliveryCost = (method, total) => {
    if (total < 39) return method === "pickup" ? 5.9 : 6.9;
    if (total < 59) return method === "pickup" ? 0 : 6.9;
    return method === "pickup" ? 0 : 2.9;
  };
  const deliveryCost = getDeliveryCost(deliveryMethod, subtotal);
  const isFreeDelivery = deliveryCost === 0;
  const deliveryCostsCharge = subtotal >= 39 ? 0 : 5.9;
  const totalWithDelivery = Math.max(
    0,
    subtotal + deliveryCostsCharge + deliveryCost - totalDiscount,
  ).toFixed(2);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 600);
  };

  const handleRemove = async (cartId) => {
    setIsRemoving(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/cart/remove`, {
        method: "POST",
        headers: token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(
          token ? { cartId } : { device_id: getDeviceId(), cartId },
        ),
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
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(
          token
            ? { quantity: parseInt(newQty), cartId }
            : { device_id: getDeviceId(), quantity: parseInt(newQty), cartId },
        ),
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
  const unlocked = !isEmpty && subtotal >= freeShippingThreshold;

  // Which discount input (promo code / voucher) is open — both start closed,
  // clicking the open one again collapses it.
  const [discountTab, setDiscountTab] = useState(null);

  const renderGuestVoucherContent = () => (
    <div ref={giftContentRef}>
      <CodeField
        placeholder={t("enterVoucherCodePlaceholder")}
        value={guestVoucherInput}
        onChange={handleGuestInputChange}
        onEnter={handleGuestApply}
        hasError={!!guestVoucherError}
        onApply={handleGuestApply}
        applyDisabled={!guestVoucherInput.trim()}
        applyLabel={t("apply")}
      />

      {guestVoucherError && (
        <ErrorNote>
          {guestVoucherError}{" "}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="font-bold hover:underline underline-offset-2 cursor-pointer"
          >
            {t("login")}
          </button>
        </ErrorNote>
      )}

      <p className="mt-3 text-[12px] text-[#8a8880] leading-relaxed">
        {t("noVouchersYet")}{" "}
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/loyalty");
          }}
          className="text-[#0b0b0a] font-semibold hover:underline underline-offset-2 cursor-pointer"
        >
          {t("learnMore")}
        </button>
      </p>
    </div>
  );

  const renderLoggedVoucherContent = () => {
    const hasVouchers = voucherPills.length > 0;
    const hasPoints = voucherPoints !== null && voucherPoints > 0;

    const canCreateMoreVoucher = hasPoints;

    return (
      <div ref={giftContentRef}>
        <CodeField
          placeholder={t("enterVoucherCodePlaceholder")}
          value={loggedVoucherInput}
          disabled={loggedVoucherApplied}
          title={loggedVoucherApplied ? t("alreadyAddedVoucherCode") : ""}
          onChange={(e) => {
            setLoggedVoucherInput(e.target.value);
            if (loggedVoucherError) setLoggedVoucherError(null);
            const match = voucherPills.find((p) => p.name === e.target.value);
            if (match) setSelectedPill(match.name);
            else setSelectedPill(null);
          }}
          onEnter={handleLoggedApply}
          hasError={!!loggedVoucherError}
          onApply={handleLoggedApply}
          applyDisabled={
            (!selectedPill && !loggedVoucherInput.trim()) ||
            loggedVoucherApplied ||
            loggedVoucherLoading
          }
          loading={loggedVoucherLoading}
          applyLabel={t("apply")}
        />

        {selectedPill &&
          !loggedVoucherApplied &&
          voucherPills.some((p) => p.name === selectedPill) && (
            <p className="mt-3 text-[12px] text-[#5c5a54] leading-relaxed">
              {t("voucherCodeAdded")}
            </p>
          )}

        {loggedVoucherError && <ErrorNote>{loggedVoucherError}</ErrorNote>}

        {!loggedVoucherApplied && hasVouchers && (
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            {voucherPills.map((pill) => {
              const code = pill.name;
              return (
                <VoucherOption
                  key={pill.id}
                  code={code}
                  selected={selectedPill === code}
                  onClick={() => handlePillClick(code)}
                  onRemove={handlePillRemove}
                />
              );
            })}
            {canCreateMoreVoucher && (
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(true)}
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.02em] whitespace-nowrap border border-dashed border-black/30 text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white hover:border-[#0b0b0a] transition-colors duration-200 cursor-pointer"
              >
                {t("createMoreVoucher")}
              </button>
            )}
          </div>
        )}

        {!loggedVoucherApplied &&
          !hasVouchers &&
          hasPoints &&
          !loggedVoucherError && (
            <div className="flex items-center justify-between gap-4 mt-3.5 px-4 py-3.5 bg-black/[0.03] border border-black/10">
              <p className="text-[12px] text-[#0b0b0a] leading-relaxed">
                <Trans
                  i18nKey="modaladdtocart:pointsRedeemMessage"
                  values={{
                    points: voucherPoints,
                    amount: Math.floor(voucherPoints / 10),
                  }}
                  components={{ b1: <strong />, b2: <strong /> }}
                />
              </p>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(true)}
                className="shrink-0 px-4 py-2 text-[11.5px] font-semibold tracking-[0.1em] uppercase text-white bg-[#0b0b0a] hover:bg-[#25221e] transition-colors duration-200 cursor-pointer"
              >
                {t("redeem")}
              </button>
            </div>
          )}

        {!selectedPill &&
          !loggedVoucherError &&
          !loggedVoucherApplied &&
          !hasVouchers &&
          !hasPoints && (
            <p className="mt-3 text-[12px] text-[#8a8880] leading-relaxed">
              {t("noVouchersYet")}{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/loyalty");
                }}
                className="text-[#0b0b0a] font-semibold hover:underline underline-offset-2 cursor-pointer"
              >
                {t("learnMore")}
              </button>
            </p>
          )}

        {loggedVoucherApplied && selectedPill && (
          <div className="mt-3.5">
            <CodeChip
              code={selectedPill}
              onRemove={handleLoggedRemoveVoucher}
              removeTitle={t("removeVoucherCode")}
            />
          </div>
        )}
      </div>
    );
  };

  // One line of the receipt: label ········· value, with an optional chip.
  const receiptRow = (label, value, chip) => (
    <div className="flex items-baseline gap-2 text-[13px]">
      <span className="flex items-center gap-2 text-[#5c5a54] shrink-0">
        {label}
        {chip && (
          <span className="px-1.5 py-0.5 bg-[#0b0b0a] text-white text-[10.5px] font-semibold tracking-[0.06em]">
            {chip}
          </span>
        )}
      </span>
      <span className="flex-1 border-b border-dotted border-black/25 translate-y-[-3px]" />
      <span className="text-[#0b0b0a] font-semibold tabular-nums shrink-0">{value}</span>
    </div>
  );

  const stepBtn =
    "w-9 h-full grid place-items-center text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:pointer-events-none";

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in drawer — light grey canvas, white cards */}
      <div
        onMouseEnter={clearAutoCloseTimer}
        onMouseLeave={startAutoCloseTimer}
        className={`fixed top-0 right-0 bottom-0 z-[1001] w-full max-w-[520px] bg-[#f3f3f3] flex flex-col  transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header — same dark gradient band as the Login/auth modals */}
        <div className="relative shrink-0 bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] border-b border-white/5 px-5 sm:px-6 pt-5 pb-5 overflow-hidden">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
              maskImage: "linear-gradient(to left, black, transparent 75%)",
              WebkitMaskImage: "linear-gradient(to left, black, transparent 75%)",
            }}
          />
          <span aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-20 bg-[#DFB400]" />
          <IoBagHandleOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
                <IoBagHandleOutline className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
                  <span className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-white/40">
                    Biogance
                  </span>
                </div>
                <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
                  {t("yourCart")}
                  {cartCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[23px] h-[23px] px-1.5 bg-white text-[#0b0b0a] text-[12px] font-semibold tracking-normal">
                      {cartCount}
                    </span>
                  )}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
            >
              <IoClose size={18} />
            </button>
          </div>

        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size={28} />
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="relative w-24 h-24 grid place-items-center bg-white border border-black/10 mb-4 shadow-[0_24px_50px_-28px_rgba(0,0,0,.35)]">
              <IoBagHandleOutline className="w-10 h-10 text-black/20" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#DFB400]" />
            </div>
            <p className="text-[14px] font-semibold text-[#0b0b0a]">{t("emptyCartTitle")}</p>
            <p className="text-[13px] text-[#8a8880] max-w-[260px] leading-relaxed">
              {t("emptyCartSubtitle")}
            </p>
          </div>
        )}

        {/* Removing overlay */}
        {isRemoving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] pointer-events-auto">
            <Spinner size={30} />
          </div>
        )}

        {/* Body */}
        {!isLoading && !isEmpty && (
          <div
            className={`flex-1 overflow-y-auto px-5 sm:px-6 py-5 flex flex-col gap-4 ${
              isRemoving ? "pointer-events-none" : "pointer-events-auto"
            }`}
            style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
          >
            {/* Item cards — compact, borderless, soft-shadow */}
            {cartItems.map((item) => {
              const p = item.product || {};
              const firstImage = p.images?.[0]?.media
                ? `${MEDIA_URL}${p.images[0].media}`
                : "";
              const name =
                lang === "fr" && p.french_name ? p.french_name : p.name || "";
              const sizeLabel = p.size_name || "";
              const unitPrice =
                parseFloat(String(item.price ?? "0").replace(",", ".")) || 0;
              const itemTotal = (unitPrice * item.quantity).toFixed(2);
              const qty = parseInt(item.quantity) || 1;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 bg-white shadow-[0_1px_2px_rgba(0,0,0,.04),0_14px_30px_-22px_rgba(0,0,0,.3)] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(0,0,0,.04),0_22px_40px_-22px_rgba(0,0,0,.4)]"
                >
                  <div className="relative w-[68px] h-[84px] shrink-0 bg-[#f3f3f3] overflow-hidden flex items-center justify-center">
                    {firstImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firstImage} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-11 bg-black/10" />
                    )}
                    <span className="absolute bottom-0 left-0 px-1.5 py-0.5 bg-[#0b0b0a] text-white text-[10.5px] font-semibold tabular-nums">
                      ×{qty}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-snug text-[#0b0b0a] line-clamp-2">
                          {name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        title={t("removeItem")}
                        aria-label={t("removeItem")}
                        className="shrink-0 grid place-items-center w-6 h-6 text-[#a8a69f] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <IoTrashOutline className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                      <div className="inline-flex items-stretch h-7 bg-black/[0.05]">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.id, qty - 1)}
                          disabled={qty <= 1}
                          aria-label="Decrease quantity"
                          className="w-7 h-full grid place-items-center text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <IoRemove className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[26px] px-1 grid place-items-center text-[12px] font-semibold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.id, qty + 1)}
                          disabled={qty >= 100}
                          aria-label="Increase quantity"
                          className="w-7 h-full grid place-items-center text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <IoAdd className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {sizeLabel && (
                        <span className="text-[12px] text-[#8a8880] truncate">{sizeLabel}</span>
                      )}
                      </div>
                      <span className="text-[13px] font-semibold text-[#0b0b0a] tabular-nums">
                        {formatPrice(itemTotal, lang)} €
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Discounts — promo code / voucher as two tabs of one card */}
            <div className="bg-white border border-black/[0.06]">
              <div className="grid grid-cols-2">
                {[
                  { id: "promo", label: t("giftCardPromoCode"), icon: IoPricetagOutline, applied: !!appliedPromo },
                  { id: "voucher", label: t("applyVoucher"), icon: IoTicketOutline, applied: loggedVoucherApplied && !!selectedPill },
                ].map((tab) => {
                  const active = discountTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDiscountTab(active ? null : tab.id)}
                      className={`relative flex items-center justify-center gap-2 px-3 py-3.5 text-[12px] font-semibold border-b transition-colors duration-200 cursor-pointer ${
                        active
                          ? "text-[#0b0b0a] bg-white border-transparent"
                          : "text-[#8a8880] bg-black/[0.03] border-black/10 hover:text-[#0b0b0a]"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                      {tab.applied && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                      {active && <span className="absolute left-0 right-0 top-0 h-[2px] bg-[#0b0b0a]" />}
                    </button>
                  );
                })}
              </div>
              {discountTab && (
              <div className="p-4">
                {discountTab === "promo" ? (
                  <>
                    <CodeField
                      placeholder={t("enterYourCodePlaceholder")}
                      value={appliedPromo ? appliedPromo.code : promoInput}
                      disabled={!!appliedPromo}
                      title={appliedPromo ? t("alreadyAddedPromoCode") : ""}
                      onChange={handlePromoInputChange}
                      onEnter={handlePromoApply}
                      hasError={!!promoError}
                      onApply={handlePromoApply}
                      applyDisabled={!promoInput.trim() || !!appliedPromo || promoLoading}
                      loading={promoLoading}
                      applyLabel={t("apply")}
                    />
                    {promoError && <ErrorNote>{promoError}</ErrorNote>}
                    {appliedPromo && (
                      <div className="mt-3.5">
                        <CodeChip
                          code={appliedPromo.code}
                          onRemove={handleRemovePromo}
                          removeTitle={t("removePromoCode")}
                        />
                      </div>
                    )}
                  </>
                ) : isLoggedIn ? (
                  renderLoggedVoucherContent()
                ) : (
                  renderGuestVoucherContent()
                )}
              </div>
              )}
            </div>

            {/* Receipt-style summary */}
            <div className="relative mb-2">
              <div className="bg-white border border-black/[0.06] border-b-0 p-5 flex flex-col gap-3">
                {receiptRow(t("subtotal"), `${formatPrice(subtotal, lang)} €`)}
                {appliedPromo &&
                  receiptRow(t("promoCode"), `-${formatPrice(promoDiscount, lang)} €`, appliedPromo.code)}
                {loggedVoucherApplied &&
                  selectedPill &&
                  receiptRow(t("voucher"), `-${formatPrice(appliedVoucherOff, lang)} €`, selectedPill)}
                {receiptRow(
                  t("deliveryCosts"),
                  subtotal >= 39 ? t("free") : `${formatPrice(5.9, lang)} €`,
                )}

                {/* Delivery method — segmented toggle */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: "home", label: t("homeDelivery"), icon: IoHomeOutline },
                    { id: "pickup", label: t("pickupPoint"), icon: IoStorefrontOutline },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setDeliveryMethod(opt.id);
                        try {
                          localStorage.setItem("checkoutDeliveryMethod", opt.id);
                        } catch {
                          /* ignore */
                        }
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold border transition-colors duration-200 cursor-pointer ${
                        deliveryMethod === opt.id
                          ? "bg-[#0b0b0a] border-[#0b0b0a] text-white"
                          : "bg-white border-black/15 text-[#5c5a54] hover:border-black/40"
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
                {receiptRow(
                  deliveryMethod === "home" ? t("homeDelivery") : t("pickupPoint"),
                  isFreeDelivery ? t("free") : `${formatPrice(deliveryCost, lang)} €`,
                )}
              </div>
              {/* torn-paper bottom edge */}
              <div
                aria-hidden="true"
                className="h-[7px]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #fff 6px, transparent 0), linear-gradient(225deg, #fff 6px, transparent 0)",
                  backgroundSize: "12px 12px",
                  backgroundPosition: "left top",
                  backgroundRepeat: "repeat-x",
                }}
              />
            </div>
          </div>
        )}

        {/* Free-shipping progress — stays visible; text flips once unlocked */}
        <div className="shrink-0 bg-white border-t border-black/10 px-5 sm:px-6 pt-3.5 pb-3.5">
          <div className="flex items-center justify-between gap-3 text-[12px] mb-2.5">
            {unlocked ? (
              <span className="flex items-center gap-1.5 font-semibold text-[#0b0b0a]">
                <IoCheckmarkCircle className="w-4 h-4 shrink-0" />
                {t("freeShippingUnlocked")}
              </span>
            ) : (
              <>
                <span className="text-[#5c5a54]">{t("completeForFreeShipping")}</span>
                <span className="font-bold text-[#0b0b0a]">
                  {t("remainingAmount", {
                    amount: formatPrice(isEmpty ? 0 : remaining, lang),
                  })}
                </span>
              </>
            )}
          </div>
          <div className="relative h-1.5 bg-black/10">
            <div
              className={`absolute left-0 top-0 h-full transition-[width] duration-500 ease-out bg-[#0b0b0a]`}
              style={{ width: isEmpty ? "0%" : `${progressPercent}%` }}
            />
            <span
              className={`absolute top-1/2 grid place-items-center w-6 h-6 -translate-y-1/2 -translate-x-1/2 bg-white border transition-[left] duration-500 ease-out border-[#0b0b0a] text-[#0b0b0a]`}
              style={{ left: isEmpty ? "0%" : `${Math.min(progressPercent, 97)}%` }}
            >
              {unlocked ? <IoCheckmarkCircle className="w-3.5 h-3.5" /> : <IoCubeOutline className="w-3.5 h-3.5" />}
            </span>
          </div>
        </div>

        {/* Upsell strip — sits right above the checkout row */}
        {upsellProducts.length > 0 && (
          <div className="shrink-0 bg-white border-t border-black/10 px-5 sm:px-6 pt-3.5 pb-3.5">
            <div className="relative overflow-hidden bg-[#f3f3f3] border-l-2 border-[#DFB400]">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${upsellIndex * 100}%)`,
                  transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {upsellProducts.map((item) => (
                  <div key={item.id} className="pr-[76px]" style={{ minWidth: "100%" }}>
                    <UpsellCard
                      item={item}
                      onAdd={handleUpsellAdd}
                      isAdding={addingUpsellId === item.id}
                    />
                  </div>
                ))}
              </div>

              {upsellProducts.length > 1 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUpsellIndex((i) => i - 1)}
                    disabled={upsellIndex === 0}
                    aria-label="Previous"
                    className="grid place-items-center w-6 h-6 bg-white border border-black/10 text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <IoChevronBack size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpsellIndex((i) => i + 1)}
                    disabled={upsellIndex >= upsellProducts.length - 1}
                    aria-label="Next"
                    className="grid place-items-center w-6 h-6 bg-white border border-black/10 text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <IoChevronForward size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer — total on the left, CTA on the right */}
        <div className="shrink-0 bg-white border-t border-black/10 px-5 sm:px-6 py-4 flex items-center gap-4">
          <div className="min-w-0 shrink-0">
            <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
              {t("estimatedTotal")}
            </p>
            <p className="text-[16px] font-bold leading-tight text-[#0b0b0a] tabular-nums">
              {formatPrice(isEmpty ? 0 : totalWithDelivery, lang)} €
            </p>
          </div>
          <button
            type="button"
            onClick={isEmpty ? undefined : handleCheckout}
            disabled={isEmpty || checkoutLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2.5 h-[48px] text-[12px] font-bold tracking-[0.1em] uppercase border transition-all duration-200 ${
              isEmpty
                ? "bg-black/[0.04] text-[#8a8880] border-black/10 cursor-default"
                : "text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border-[#0b0b0a] hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:cursor-default disabled:translate-y-0 disabled:shadow-none"
            }`}
          >
            {checkoutLoading ? (
              <Spinner light size={16} />
            ) : (
              <>
                {t("continueToCheckout")}
                {!isEmpty && <IoArrowForward className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>

      <CreateVoucherModal
        isOpen={isVoucherModalOpen}
        loyaltyPoints={voucherPoints || 0}
        onClose={() => {
          setIsVoucherModalOpen(false);
          fetchVouchers();
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
