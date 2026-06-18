import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { saveCartData, getCartData } from "../../../utils/cartStorage";
import { RiDeleteBinLine } from "react-icons/ri";
import CreateVoucherModal from "../MyAccount/ModalBox/CreateVoucherModal";
import LoginModal from "../Onboarding/Login";


const getErrorMsg = (data) => {
  if (data.errors?.length > 0) return data.errors[0].message;
  if (data.action) return data.action;
  if (data.action_message) return data.action_message;
  return null;
};

function CustomDropdown({ options, value, onChange, disabled }) {
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
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          border: "1px solid #ddd", padding: "4px 8px",
          fontSize: "13px", background: "#fff", color: "#111",
          cursor: disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", gap: "8px",
          minWidth: disabled ? "auto" : "42px",
          justifyContent: disabled ? "flex-start" : "space-between",
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
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff",
          border: "1px solid #ddd", minWidth: "100%", zIndex: 1100,
          maxHeight: "calc(10 * 33px)", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          {options.map((opt) => (
            <DropItem key={opt} label={opt} selected={opt === value} onSelect={() => { onChange(opt); setOpen(false); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function DropItem({ label, selected, onSelect }) {
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
      border: "1px solid #ccc", overflow: "hidden",
      background: "#fff",
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
          display: "inline-block",
          width: "13px",
          height: "13px",
          border: `2px solid ${color === "#fff" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.15)"}`,
          borderTopColor: color,
          borderRadius: "50%",
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

const QTY_OPTIONS = Array.from({ length: 30 }, (_, i) => String(i + 1));

// ─── Upsell Product Card ──────────────────────────────────────────────────────
function UpsellCard({ item, onAdd }) {
  const [addHovered, setAddHovered] = useState(false);
  if (!item) return null;

  const imageUrl = item.image ||
    (item.products?.[0]?.images?.[0]?.media
      ? `https://d18f57oyxifcsh.cloudfront.net/${item.products[0].images[0].media}`
      : null);

  const price = parseFloat(String(item.price ?? item.products?.[0]?.price ?? "0").replace(",", ".")) || 0;
  const name = item.name || "";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", backgroundColor: "#fff" }}>
      {/* Image */}
      <div style={{
        width: "64px", height: "72px", flexShrink: 0,
        backgroundColor: "#f3f3f3",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {imageUrl
          ? <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "36px", height: "48px", backgroundColor: "#ddd" }} />
        }
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: "0 0 8px", fontSize: "12px", fontWeight: 600, color: "#111",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          lineHeight: 1.4, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}>
          {name}
        </p>
        <button
          onClick={() => onAdd(item)}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          style={{
            padding: "6px 14px", fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            border: "1px solid #111",
            background: addHovered ? "#111" : "#fff",
            color: addHovered ? "#fff" : "#111",
            cursor: "pointer", transition: "background 0.2s, color 0.2s",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          Add — {price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
        </button>
      </div>
    </div>
  );
}

export default function ModalAddToCart({ isOpen, onClose, product = {} }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Upsell products state
  const [upsellProducts, setUpsellProducts] = useState([]);
  const [upsellIndex, setUpsellIndex] = useState(0);

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

  // Fetch upsell products — localStorage se pehle, phir API
  const fetchUpsellProducts = () => {
    try {
      const cached = localStorage.getItem("homePageData");
      if (cached) {
        const data = JSON.parse(cached);
        const popular = data?.popular || [];
        setUpsellProducts(popular);
        return;
      }
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      fetch(`${BASE_URL}/web/home`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token } : { device_id: getDeviceId() }),
      }).then(r => r.json()).then(data => {
        if (data.status) setUpsellProducts(data.data?.popular || []);
      }).catch(() => {});
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
        const totalPoints = data.data?.total_point !== undefined ? Number(data.data.total_point) : 0;
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
    setGuestVoucherError("Please login first if you want to add a voucher.");
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
        setLoggedVoucherError(getErrorMsg(data) || "Invalid voucher.");
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
      }
    } catch {
      setLoggedVoucherError("Something went wrong.");
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
        setPromoError(getErrorMsg(data) || "Invalid promo code.");
        setPromoLoading(false);
        return;
      }
      setAppliedPromo({ code, off: data.data?.off || 0 });
      setPromoInput("");
    } catch {
      setPromoError("Something went wrong.");
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoInput("");
  };

  const handleUpsellAdd = async (item) => {
    const prod = item.products?.[0] || item;
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
      refreshCartFromServer();
    } catch {}
  };

  const freeShippingThreshold = 39;
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item) return sum;
    const unitPrice = parseFloat(String(item.price ?? "0").replace(",", ".")) || 0;
    return sum + unitPrice * (item.quantity || 0);
  }, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal).toFixed(2);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const totalDiscount = (loggedVoucherApplied ? appliedVoucherOff : 0) + (appliedPromo ? appliedPromo.off : 0);

  const getDeliveryCost = (method, total) => {
    if (total < 39) return method === "pickup" ? 5.90 : 6.90;
    if (total < 59) return method === "pickup" ? 0 : 6.90;
    return method === "pickup" ? 0 : 2.90;
  };
  const deliveryCost = getDeliveryCost(deliveryMethod, subtotal);
  const isFreeDelivery = deliveryCost === 0;
  const totalWithDelivery = Math.max(0, subtotal + deliveryCost - totalDiscount).toFixed(2);

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
          type="text" placeholder="Enter Voucher code"
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
          Apply
        </button>
      </div>

      {guestVoucherError && (
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px",
          marginTop: "10px", padding: "10px 12px", background: "#fdecec", border: "1px solid #f5c6c6",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="11" fill="#e02424" />
              <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>{guestVoucherError}</span>
          </div>
          <span
            onClick={() => setIsLoginModalOpen(true)}
            onMouseEnter={() => setGuestLoginHovered(true)}
            onMouseLeave={() => setGuestLoginHovered(false)}
            style={{
              fontSize: "12px", color: "#c0392b", fontWeight: 700, cursor: "pointer",
              textDecoration: guestLoginHovered ? "underline" : "none",
              flexShrink: 0, whiteSpace: "nowrap", marginTop: "1px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Login
          </span>
        </div>
      )}

      <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
        You don't have any vouchers or reward points yet. Points are earned automatically with every purchase, redeem them for discounts on your next order.{" "}
        <span
          onClick={() => { onClose(); router.push("/loyalty"); }}
          onMouseEnter={() => setLearnMoreHovered(true)}
          onMouseLeave={() => setLearnMoreHovered(false)}
          style={{ color: "#111", cursor: "pointer", textDecoration: learnMoreHovered ? "underline" : "none" }}
        >
          Learn More
        </span>
      </p>
    </div>
  );

  const renderLoggedVoucherContent = () => {
    const hasVouchers = voucherPills.length > 0;
    const hasPoints = voucherPoints !== null && voucherPoints > 0;

    return (
      <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
        <div style={{
          display: "flex", border: `1px solid ${loggedVoucherError ? "#e02424" : "#ddd"}`,
          overflow: "hidden", transition: "border-color 0.15s",
        }}>
          <input
            type="text" placeholder="Enter Voucher code"
            value={loggedVoucherInput} disabled={loggedVoucherApplied}
            onChange={(e) => {
              setLoggedVoucherInput(e.target.value);
              if (loggedVoucherError) setLoggedVoucherError(null);
              const match = voucherPills.find(p => p.name === e.target.value);
              if (match) setSelectedPill(match.name); else setSelectedPill(null);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleLoggedApply(); }}
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
            {loggedVoucherLoading ? <ButtonSpinner color={loggedApplyHovered ? "#fff" : "#111"} /> : "Apply"}
          </button>
        </div>

        {selectedPill && !loggedVoucherApplied && voucherPills.some(p => p.name === selectedPill) && (
          <p style={{ margin: "10px 0 6px", fontSize: "12px", color: "#555", lineHeight: 1.5 }}>
            Voucher code added. Click Apply to redeem it.
          </p>
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
            {hasPoints && (
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                onMouseEnter={() => setCreateMoreHovered(true)}
                onMouseLeave={() => setCreateMoreHovered(false)}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "7px 14px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em",
                  background: createMoreHovered ? "#222" : "#000", color: "#fff",
                  border: "none", cursor: "pointer", transition: "background 0.2s",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", whiteSpace: "nowrap",
                }}
              >
                Create More Voucher
              </button>
            )}
          </div>
        )}

        {!loggedVoucherApplied && !hasVouchers && hasPoints && !loggedVoucherError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", gap: "12px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#111", lineHeight: 1.5 }}>
              You have <strong>{voucherPoints} points</strong> — redeem for a <strong>${Math.floor(voucherPoints / 10)} voucher</strong>
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
              Redeem
            </button>
          </div>
        )}

        {!selectedPill && !loggedVoucherError && !loggedVoucherApplied && !hasVouchers && !hasPoints && (
          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
            You don't have any vouchers or reward points yet. Points are earned automatically with every purchase, redeem them for discounts on your next order.{" "}
            <span
              onClick={() => { onClose(); router.push("/loyalty"); }}
              onMouseEnter={() => setLearnMoreHovered(true)}
              onMouseLeave={() => setLearnMoreHovered(false)}
              style={{ color: "#111", cursor: "pointer", textDecoration: learnMoreHovered ? "underline" : "none" }}
            >
              Learn More
            </span>
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

        {loggedVoucherApplied && selectedPill && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", background: "#111", overflow: "hidden" }}>
              <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                {selectedPill}
              </span>
              <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(255,255,255,0.25)" }} />
              <button
                onClick={handleLoggedRemoveVoucher}
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
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "520px",
        backgroundColor: "#fff", zIndex: 1001, display: "flex", flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}>

       {/* Header */}
<div style={{
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between",
  padding: "20px 24px", 
  borderBottom: "1px solid #e5e5e5", 
  flexShrink: 0,
  height: "68px"   // Fixed height for better vertical centering
}}>
  
  {/* Left Side - Your Cart (with badge) */}
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  }}>
    <span style={{ 
      fontSize: "13px", 
      fontWeight: 600, 
      color: "#111", 
      letterSpacing: "0.08em", 
      textTransform: "uppercase" 
    }}>
      Your Cart
    </span>
    
    {cartCount > 0 && (
      <div style={{
        height: "23px", 
        minWidth: "23px", 
        padding: "0 6px",
        borderRadius: "999px", 
        backgroundColor: "#111",
        color: "#fff", 
        fontSize: "12px", 
        fontWeight: 600,
        boxSizing: "border-box",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        lineHeight: 1,
      }}>
        {cartCount}
      </div>
    )}
  </div>

  {/* Right Side - Close Button with same spacing */}
  <button 
    onClick={onClose} 
    style={{ 
      background: "none", 
      border: "none", 
      cursor: "pointer", 
      padding: "4px 0",        // Balanced padding
      display: "flex", 
      alignItems: "center", 
      color: "#111",
      marginRight: "-4px"      // Fine adjustment for visual balance
    }}
  >
    <IoClose size={22} />       {/* Slightly bigger for better touch/visibility */}
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
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#111" }}>Your cart is empty.</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>Start adding products.</p>
          </div>
        )}

        {/* Body */}
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

        {!isLoading && !isEmpty && (
          <div style={{
            flex: 1, overflowY: "auto", padding: "0 24px",
            pointerEvents: isRemoving ? "none" : "auto",
            overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
          }}>
            {cartItems.map((item) => {
              const p = item.product || {};
              const firstImage = p.images?.[0]?.media ? `${MEDIA_URL}${p.images[0].media}` : "";
              const name = p.name || "";
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
                      <CustomDropdown options={QTY_OPTIONS} value={String(item.quantity)} onChange={(val) => handleQtyChange(item.id, val)} />
                      {sizeOptions.length > 0 && (
                        <CustomDropdown options={sizeOptions} value={sizeOptions[0]} onChange={() => {}} disabled={isSingleSize} />
                      )}
                      <button onClick={() => handleRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#888", display: "flex", alignItems: "center" }} title="Remove item">
                        <RiDeleteBinLine className="hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", marginTop: "65px", color: "#555", flexShrink: 0 }}>
                    {parseFloat(itemTotal).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </div>
                </div>
              );
            })}

            {/* Order Summary */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid #e5e5e5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                <span>Subtotal</span><span>{subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                <span>Delivery costs</span>
                {subtotal >= 39 ? <span>Free</span> : <span>5,90 €</span>}
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
                      <span>{deliveryMethod === "home" ? "Home Delivery" : "Pickup Point"}</span>
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
                            onClick={() => { setDeliveryMethod(opt); setDeliveryDropdownOpen(false); }}
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
                            {opt === "home" ? "Home Delivery" : "Pickup Point"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isFreeDelivery ? <span>Free</span> : <span>{deliveryCost.toFixed(2).replace(".", ",")} €</span>}
                </div>
              </div>

              {loggedVoucherApplied && selectedPill && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#555" }}>Voucher</span>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "#f0f0f0" }}>
                      <span style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{selectedPill}</span>
                    </div>
                  </div>
                  <span style={{ color: "#111", fontWeight: 500 }}>-{appliedVoucherOff.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
              )}

              {appliedPromo && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#555" }}>Promo Code</span>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "#f0f0f0", overflow: "hidden" }}>
                      <span style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#111", letterSpacing: "0.04em", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                        {appliedPromo.code}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: "#111", fontWeight: 500 }}>-{appliedPromo.off.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px", fontWeight: 700, color: "#111" }}>
                <span>Estimated total</span>
                <span>{parseFloat(totalWithDelivery).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
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
                <span style={{ fontWeight: 500 }}>Gift card / promo code</span>
                <span style={{ fontSize: "18px", fontWeight: 300, display: "inline-block", transform: promoOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
              </button>
              <div style={{ maxHeight: promoOpen ? "200px" : "0px", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)", opacity: promoOpen ? 1 : 0 }}>
                <div style={{ paddingBottom: "16px" }}>
                  <div style={{ display: "flex", border: `1px solid ${promoError ? "#e02424" : "#ddd"}`, overflow: "hidden", transition: "border-color 0.15s" }}>
                    <input
                      type="text" placeholder="Enter your code"
                      value={appliedPromo ? appliedPromo.code : promoInput}
                      disabled={!!appliedPromo}
                      onChange={handlePromoInputChange}
                      onKeyDown={(e) => { if (e.key === "Enter") handlePromoApply(); }}
                      style={{
                        flex: 1, border: "none", outline: "none", padding: "11px 14px", fontSize: "13px",
                        color: appliedPromo ? "#aaa" : "#111",
                        background: appliedPromo ? "#f9f9f9" : "#fff",
                        cursor: appliedPromo ? "not-allowed" : "text",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                    />
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
                      {promoLoading ? <ButtonSpinner color={promoHovered ? "#fff" : "#111"} /> : "Apply"}
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
                        <button onClick={handleRemovePromo} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
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
                <span style={{ fontWeight: 500 }}>Apply Voucher</span>
                <span style={{ fontSize: "18px", fontWeight: 300, display: "inline-block", transform: giftOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
              </button>
              <div style={{ maxHeight: giftOpen ? `${giftContentHeight + 20}px` : "0px", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                {isLoggedIn ? renderLoggedVoucherContent() : renderGuestVoucherContent()}
              </div>
            </div>
          </div>
        )}

        {/* ─── Footer ─────────────────────────────────────────────────────────── */}
        {!isEmpty && (
          <div style={{ borderTop: "1px solid #e5e5e5", backgroundColor: "#f3f3f3", flexShrink: 0 }}>

            

            {/* Free shipping progress */}
            {subtotal < freeShippingThreshold && (
              <div style={{ padding: "14px 24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "7px" }}>
                  <span>Complete for free shipping</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{remaining} € remaining</span>
                </div>
                <div style={{ height: "4px", backgroundColor: "#e5e5e5", overflow: "hidden", marginBottom: "14px" }}>
                  <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#111", transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}
{/* ── Upsell Products ── */}
{upsellProducts.length > 0 && (
  <div style={{ position: "relative", padding: "0 24px", borderBottom: "1px solid #e5e5e5" }}>
    {/* Left Arrow */}
    {upsellIndex > 0 && (
      <button
        onClick={() => setUpsellIndex(i => i - 1)}
        style={{
          position: "absolute", left: "0px", top: "50%", transform: "translateY(-50%)",
          zIndex: 5, width: "22px", height: "22px",
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
    )}
    {/* Right Arrow */}
    {upsellIndex < upsellProducts.length - 1 && (
      <button
        onClick={() => setUpsellIndex(i => i + 1)}
        style={{
          position: "absolute", right: "0px", top: "50%", transform: "translateY(-50%)",
          zIndex: 5, width: "22px", height: "22px",
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    )}
    {/* White card box — background lives HERE, inset by parent's padding */}
    <div style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <div style={{
        display: "flex",
        transform: `translateX(-${upsellIndex * 100}%)`,
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {upsellProducts.map((item) => (
          <div key={item.id} style={{ minWidth: "100%" }}>
            <UpsellCard item={item} onAdd={handleUpsellAdd} />
          </div>
        ))}
      </div>
    </div>
  </div>
)}
            {/* Checkout button */}
            <div style={{marginTop:"10px", padding: subtotal < freeShippingThreshold ? "0 24px 24px" : "24px 24px 24px" }}>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#333"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = checkoutLoading ? "#333" : "#111"}
                style={{
                  width: "100%", padding: "15px", backgroundColor: "#111", color: "#fff", border: "none",
                  fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: checkoutLoading ? "default" : "pointer", transition: "background 0.2s",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                }}
              >
                {checkoutLoading ? (
                  <>
                    <style>{`@keyframes checkoutSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "checkoutSpin 0.65s linear infinite" }} />
                  </>
                ) : "Continue to checkout"}
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateVoucherModal
        isOpen={isVoucherModalOpen}
        totalPoints={voucherPoints || 0}
        onClose={() => { setIsVoucherModalOpen(false); fetchVouchers(); }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}