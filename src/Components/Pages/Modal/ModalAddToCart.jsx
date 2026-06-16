import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { saveCartData, getCartData } from "../../../utils/cartStorage";
import { RiDeleteBinLine } from "react-icons/ri";
import CreateVoucherModal from "../MyAccount/ModalBox/CreateVoucherModal";

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
          border: "1px solid #ddd", borderRadius: "4px", padding: "4px 8px",
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
          border: "1px solid #ddd", borderRadius: "4px", minWidth: "100%", zIndex: 1100,
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

// Pill chip component (reused in voucher, promo applied areas)
function AppliedPill({ code, label, onRemove }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0",
      border: "1px solid #ccc", borderRadius: "20px", overflow: "hidden",
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

const VOUCHER_KEY = "cartVoucherState";
const getVoucherState = () => { try { return JSON.parse(localStorage.getItem(VOUCHER_KEY) || "null"); } catch { return null; } };
const setVoucherState = (state) => localStorage.setItem(VOUCHER_KEY, JSON.stringify(state));
const removeVoucherState = () => localStorage.removeItem(VOUCHER_KEY);

const QTY_OPTIONS = Array.from({ length: 30 }, (_, i) => String(i + 1));

export default function ModalAddToCart({ isOpen, onClose, product = {} }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [giftOpen, setGiftOpen] = useState(false);
  const [giftContentHeight, setGiftContentHeight] = useState(0);

  // Auth check
  const isLoggedIn = (() => {
    try {
      const d = JSON.parse(localStorage.getItem("LoginData") || "null");
      return !!(d?.data?.token);
    } catch { return false; }
  })();

  // ─── CASE 1: Guest Voucher States ────────────────────────────────────────
  // Flow: type code → pill shown below → remove → same code → error → remove → success cycle
  const [guestVoucherInput, setGuestVoucherInput] = useState("");
  const [guestVoucherError, setGuestVoucherError] = useState(null);
  const [guestVoucherLoading, setGuestVoucherLoading] = useState(false);
  const [guestApplyHovered, setGuestApplyHovered] = useState(false);
  // pendingPill = code shown below input (before apply clicked)
  const [guestPendingPill, setGuestPendingPill] = useState(null);
  // appliedVoucher = successfully applied code shown as pill
  const [guestAppliedVoucher, setGuestAppliedVoucher] = useState(null);
  // Track codes that have already been used once (for alternating success/error cycle)
  const [guestUsedCodes, setGuestUsedCodes] = useState([]);

  // ─── CASE 2: Logged-in Voucher States ────────────────────────────────────
  const [loggedVoucherInput, setLoggedVoucherInput] = useState(() => getVoucherState()?.input || "");
  const [loggedVoucherError, setLoggedVoucherError] = useState(null);
  const [loggedVoucherLoading, setLoggedVoucherLoading] = useState(false);
  const [loggedApplyHovered, setLoggedApplyHovered] = useState(false);
  const [selectedPill, setSelectedPill] = useState(() => getVoucherState()?.selectedPill || null);
  const [loggedVoucherApplied, setLoggedVoucherApplied] = useState(() => getVoucherState()?.applied || false);
  const [appliedVoucherOff, setAppliedVoucherOff] = useState(() => getVoucherState()?.off || 0);
  const [redeemHovered, setRedeemHovered] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherPills, setVoucherPills] = useState([]);
  const [voucherPoints, setVoucherPoints] = useState(null);

  // ─── CASE 3: Promo Code States ────────────────────────────────────────────
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoHovered, setPromoHovered] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, off }
  const [pendingPromoPill, setPendingPromoPill] = useState(null);

  const overlayRef = useRef(null);
  const giftContentRef = useRef(null);

  // Scroll lock
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

  // Cart fetch on open
  useEffect(() => {
    if (!isOpen) return;
    // Step 1: turant localStorage se show karo
    const stored = getCartData();
    if (stored) {
      setCartItems((stored.cartItem || stored.cartItems || []).filter(Boolean));
      setCartCount(stored.cart_count || 0);
    }
    // Step 2: background mein list API hit karo — updated data aane pe refresh
    const fetchLatest = async () => {
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
          // normalize — list API cartItem ya cartItems dono handle karo
          const normalizedData = {
            ...data.data,
            cartItem: (data.data.cartItem || data.data.cartItems || []).filter(Boolean),
          };
          saveCartData(normalizedData);
          setCartItems(normalizedData.cartItem);
          setCartCount(normalizedData.cart_count || 0);
        }
      } catch { /* silent */ }
    };
    fetchLatest();
  }, [isOpen]);

  const voucherFetchedRef = useRef(false);

  // Fetch voucher list — sirf ek baar, har open pe pills refresh karo
  useEffect(() => {
    if (!isOpen) return;
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
        if (data.status && data.data?.data) {
          const list = data.data.data;
          setVoucherPills(list);
          // sirf tab points set karo jab localStorage mein saved state na ho
          if (!getVoucherState()) {
            const totalPoints = list.reduce((sum, v) => sum + (v.point || 0), 0);
            setVoucherPoints(totalPoints);
          }
        }
      } catch { /* silent */ }
    };
    fetchVouchers();
  }, [isOpen]);

  // Recalculate accordion height
  useEffect(() => {
    if (giftContentRef.current) {
      setGiftContentHeight(giftContentRef.current.scrollHeight);
    }
  }, [
    giftOpen, selectedPill, loggedVoucherApplied, loggedVoucherError,
    voucherPills, voucherPoints, guestPendingPill, guestAppliedVoucher, guestVoucherError,
  ]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  // ─── CASE 1 HANDLERS (Guest) ──────────────────────────────────────────────

  // User types in input — pill only appears AFTER Apply is clicked
  const handleGuestInputChange = (e) => {
    const val = e.target.value;
    setGuestVoucherInput(val);
    setGuestVoucherError(null);
    // Do NOT set guestPendingPill here — it's set only on Apply
  };

  // Remove the pending pill (X on pill below input)
  const handleGuestPendingPillRemove = () => {
    setGuestPendingPill(null);
    setGuestVoucherInput("");
    setGuestVoucherError(null);
  };

  // Apply button clicked (guest) — pill appears here (black bg, white text)
  const handleGuestApply = async () => {
    const code = guestVoucherInput.trim().toUpperCase();
    if (!code) return;

    setGuestVoucherLoading(true);
    setGuestVoucherError(null);
    await new Promise((r) => setTimeout(r, 600));

    if (guestUsedCodes.includes(code)) {
      // Error: already used once → show error, clear input, no pill
      setGuestVoucherError("This voucher code is invalid or has already been used.");
      // Remove from used so next try succeeds again (alternating cycle)
      setGuestUsedCodes((prev) => prev.filter((c) => c !== code));
      setGuestVoucherInput("");
    } else {
      // Success: show applied pill (black bg white text), disable input
      setGuestUsedCodes((prev) => [...prev, code]);
      setGuestAppliedVoucher(code);
      setGuestVoucherInput("");
      setGuestVoucherError(null);
    }

    setGuestVoucherLoading(false);
  };

  // Remove applied voucher pill (guest)
  const handleGuestRemoveApplied = () => {
    setGuestAppliedVoucher(null);
    setGuestVoucherError(null);
    setGuestVoucherInput("");
    setGuestPendingPill(null);
  };

  // ─── CASE 2 HANDLERS (Logged-in) ─────────────────────────────────────────

  const handlePillClick = (code) => {
    if (loggedVoucherApplied) return;
    setSelectedPill(code);
    setLoggedVoucherInput(code);
    setLoggedVoucherError(null);
  };

  const handlePillRemove = () => {
    setSelectedPill(null);
    setLoggedVoucherInput("");
    setLoggedVoucherError(null);
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
        setVoucherState({ applied: false, selectedPill: null, input: "", off: 0 });
      } else {
        setLoggedVoucherApplied(true);
        setVoucherState({ applied: true, selectedPill: codeToApply, input: codeToApply, off });
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

  // ─── CASE 3 HANDLERS (Promo) ─────────────────────────────────────────────

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
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await fetch(`${BASE_URL}/user/order/check/promo-code`, {
        method: "POST",
        headers: token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { name: code } : { name: code, device_id: getDeviceId() }),
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

  // Delivery & totals
  const deliveryCost = 5.9;
  const freeShippingThreshold = 50;
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item) return sum;
    const unitPrice = item.original_price || parseFloat(String(item.price ?? "0").replace(",", ".")) || 0;
    return sum + unitPrice * (item.quantity || 0);
  }, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal).toFixed(2);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const totalDiscount = (loggedVoucherApplied ? appliedVoucherOff : 0) + (appliedPromo ? appliedPromo.off : 0);
  const totalWithDelivery = Math.max(0, subtotal + deliveryCost - totalDiscount).toFixed(2);

  const handleCheckout = () => { window.location.href = "/checkout"; };

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
        return;
      }
      const updated = cartItems.filter((item) => item.id !== cartId);
      setCartItems(updated);
      setCartCount((prev) => Math.max(0, prev - 1));
      const existing = getCartData() || {};
      saveCartData({ ...existing, cartItem: updated, cart_count: Math.max(0, (existing.cart_count || 1) - 1) });
    } catch (err) {
      console.error("Cart remove error:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleQtyChange = async (cartId, newQty) => {
    const updatedItems = cartItems.map((item) =>
      item.id === cartId ? { ...item, quantity: parseInt(newQty) } : item
    );
    setCartItems(updatedItems);
    const existing = getCartData() || {};
    saveCartData({ ...existing, cartItem: updatedItems });
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
      }
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  const isEmpty = !isLoading && cartItems.length === 0;

  // ─── CASE 1: Guest Voucher Render ────────────────────────────────────────
  const renderGuestVoucherContent = () => (
    <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
      <div style={{
        display: "flex",
        border: `1px solid ${loggedVoucherError ? "#e02424" : "#ddd"}`,
        borderRadius: "4px", overflow: "hidden", transition: "border-color 0.15s",
      }}>
        <input
          type="text" placeholder="Enter Voucher code"
          value={loggedVoucherInput}
          disabled={loggedVoucherApplied}
          onChange={(e) => {
            setLoggedVoucherInput(e.target.value);
            if (loggedVoucherError) setLoggedVoucherError(null);
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
          disabled={!loggedVoucherInput.trim() || loggedVoucherApplied || loggedVoucherLoading}
          onMouseEnter={() => { if (loggedVoucherInput.trim() && !loggedVoucherApplied) setLoggedApplyHovered(true); }}
          onMouseLeave={() => setLoggedApplyHovered(false)}
          style={{
            border: "none", borderLeft: "1px solid #ddd",
            background: (!loggedVoucherInput.trim() || loggedVoucherApplied) ? "#f3f3f3" : loggedApplyHovered ? "#111" : "transparent",
            color: (!loggedVoucherInput.trim() || loggedVoucherApplied) ? "#aaa" : loggedApplyHovered ? "#fff" : "#111",
            padding: "11px 18px", fontSize: "12px", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: (!loggedVoucherInput.trim() || loggedVoucherApplied) ? "default" : "pointer",
            transition: "background 0.2s, color 0.2s",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {loggedVoucherLoading ? "..." : "Apply"}
        </button>
      </div>

      {/* Error */}
      {loggedVoucherError && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "10px", padding: "10px 12px", background: "#fdecec", border: "1px solid #f5c6c6", borderRadius: "4px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
            <circle cx="12" cy="12" r="11" fill="#e02424" />
            <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>{loggedVoucherError}</span>
        </div>
      )}

      {/* Applied pill */}
      {loggedVoucherApplied && selectedPill && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "#111", borderRadius: "20px", overflow: "hidden" }}>
            <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#fff", letterSpacing: "0.04em", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {selectedPill}
            </span>
            <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(255,255,255,0.25)" }} />
            <button onClick={handleLoggedRemoveVoucher} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
              <IoClose size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Default text */}
      {!loggedVoucherApplied && !loggedVoucherError && !loggedVoucherInput.trim() && (
        <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
          You don't have any vouchers or reward points yet. Points are earned automatically with every purchase, redeem them for discounts on your next order.
        </p>
      )}
    </div>
  );

  // ─── CASE 2: Logged-in Voucher Render ────────────────────────────────────
  const renderLoggedVoucherContent = () => {
    const hasVouchers = voucherPills.length > 0;
    const noVouchersAndNoPoints = !hasVouchers; // extend if points API added
    return (
      <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
        {/* Input row */}
        <div style={{
          display: "flex", border: `1px solid ${loggedVoucherError ? "#e02424" : "#ddd"}`,
          borderRadius: "4px", overflow: "hidden", transition: "border-color 0.15s",
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
            }}
          >
            {loggedVoucherLoading ? "..." : "Apply"}
          </button>
        </div>

        {/* "Voucher code added" hint — sirf pill click se, pills se upar */}
        {selectedPill && !loggedVoucherApplied && voucherPoints !== 0 && voucherPills.some(p => p.name === selectedPill) && (
          <p style={{ margin: "10px 0 6px", fontSize: "12px", color: "#555", lineHeight: 1.5 }}>
            Voucher code added. Click Apply to redeem it.
          </p>
        )}

        {/* Pills from API — hide after apply or when points 0 */}
        {!loggedVoucherApplied && hasVouchers && voucherPoints !== 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {voucherPills.map((pill) => {
              const code = pill.name;
              const isSelected = selectedPill === code;
              return (
                <div
                  key={pill.id} onClick={() => handlePillClick(code)}
                  style={{
                    display: "inline-flex", alignItems: "center",
                    border: "1px solid #ccc", borderRadius: "20px", overflow: "hidden",
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
          </div>
        )}

        {/* Points/Redeem — point exactly 0 ho (null nahi) tab dikhao */}
        {voucherPoints === 0 && !loggedVoucherError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
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
                border: "none", borderRadius: "2px", cursor: "pointer",
                transition: "background 0.2s",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Redeem
            </button>
          </div>
        )}

        {/* Default text — sirf jab list empty ho, points bhi 0 hon, aur koi applied/selected nahi */}
        {!selectedPill && !loggedVoucherError && !loggedVoucherApplied && !hasVouchers && voucherPoints === 0 && (
          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
            You don't have any vouchers or reward points yet. Points are earned automatically with every purchase, redeem them for discounts on your next order.
          </p>
        )}

        {/* Error */}
        {loggedVoucherError && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "10px", padding: "10px 12px", background: "#fdecec", border: "1px solid #f5c6c6", borderRadius: "4px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="11" fill="#e02424" />
              <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>{loggedVoucherError}</span>
          </div>
        )}

        {/* Applied pill */}
        {loggedVoucherApplied && selectedPill && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", background: "#111", borderRadius: "20px", overflow: "hidden" }}>
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 1000, opacity: isOpen ? 1 : 0, backdropFilter: "blur(4px)",
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
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #e5e5e5", flexShrink: 0,
        }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your Cart
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           {cartCount > 0 && (
  <div style={{
    width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#111",
    color: "#fff", fontSize: "14px", fontWeight: 700, border:"2px solid #ffffff21",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    {cartCount}
  </div>
)}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#111" }}>
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Remove overlay */}
        {isRemoving && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "all",
          }}>
            <style>{`@keyframes removeSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #ddd", borderTopColor: "#111", animation: "removeSpin 0.75s linear infinite" }} />
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <style>{`@keyframes cartSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #ddd", borderTopColor: "#111", animation: "cartSpin 0.75s linear infinite" }} />
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
        {!isLoading && !isEmpty && (
          <div style={{
            flex: 1, overflowY: "auto", padding: "0 24px",
            pointerEvents: isRemoving ? "none" : "auto",
            overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
          }}>

            {/* Cart Items */}
            {cartItems.map((item) => {
              const p = item.product || {};
              const firstImage = p.images?.[0]?.media ? `https://d18f57oyxifcsh.cloudfront.net/${p.images[0].media}` : "";
              const name = p.name || "";
              const sizeOptions = p.size_name ? [p.size_name] : [];
              const isSingleSize = sizeOptions.length <= 1;
              const unitPrice = item.original_price || parseFloat(String(item.price).replace(",", ".")) || 0;
              const itemTotal = (unitPrice * item.quantity).toFixed(2);
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "20px 0", borderBottom: "1px solid #e5e5e5" }}>
                  <div style={{ width: "64px", height: "80px", flexShrink: 0, backgroundColor: "#f3f3f3", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {firstImage ? <img src={firstImage} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "36px", height: "48px", backgroundColor: "#c8c2b0", borderRadius: "3px" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "#111", overflow: "hidden", }}>{name}</p>
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
                  <div style={{ fontSize: "13px", marginTop:"65px", color: "#555", flexShrink: 0 }}>
                    {parseFloat(itemTotal).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </div>
                </div>
              );
            })}

            {/* Order Summary */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid #e5e5e5" }}>
              {[
                { label: "Subtotal", value: `${subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €` },
                { label: "Delivery costs", value: `${deliveryCost.toFixed(2).replace(".", ",")} €` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}

              {/* Voucher row */}
              {loggedVoucherApplied && selectedPill && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#555" }}>Voucher</span>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "#f0f0f0", borderRadius: "20px" }}>
                      <span style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{selectedPill}</span>
                    </div>
                  </div>
                  <span style={{ color: "#111", fontWeight: 500 }}>-{appliedVoucherOff.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
              )}

              {/* Promo row */}
              {appliedPromo && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#555" }}>Promo Code</span>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "#111", borderRadius: "20px", overflow: "hidden" }}>
                      <span style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#fff", letterSpacing: "0.04em", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                        {appliedPromo.code}
                      </span>
                      <span style={{ display: "block", width: "1px", height: "22px", background: "rgba(255,255,255,0.25)" }} />
                      <button onClick={handleRemovePromo} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 8px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
                        <IoClose size={11} />
                      </button>
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

            {/* ─── CASE 3: Promo Code Accordion ─────────────────────────────────── */}
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
                <span style={{
                  fontSize: "18px", fontWeight: 300, display: "inline-block",
                  transform: promoOpen ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}>+</span>
              </button>
              <div style={{
                maxHeight: promoOpen ? "200px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                opacity: promoOpen ? 1 : 0,
              }}>
                <div style={{ paddingBottom: "16px" }}>
                  <div style={{
                    display: "flex",
                    border: `1px solid ${promoError ? "#e02424" : "#ddd"}`,
                    borderRadius: "4px", overflow: "hidden", transition: "border-color 0.15s",
                  }}>
                    <input
                      type="text"
                      placeholder="Enter your code"
                      value={appliedPromo ? appliedPromo.code : promoInput}
                      disabled={!!appliedPromo}
                      onChange={handlePromoInputChange}
                      onKeyDown={(e) => { if (e.key === "Enter") handlePromoApply(); }}
                      style={{
                        flex: 1, border: "none", outline: "none", padding: "11px 14px",
                        fontSize: "13px",
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
                      }}
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>

                  {/* Error */}
                  {promoError && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "10px", padding: "10px 12px", background: "#fdecec", border: "1px solid #f5c6c6", borderRadius: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <circle cx="12" cy="12" r="11" fill="#e02424" />
                        <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>{promoError}</span>
                    </div>
                  )}

                  {/* Applied pill inside accordion */}
                  {appliedPromo && (
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", background: "#111", borderRadius: "20px", overflow: "hidden" }}>
                        <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                          {appliedPromo.code}
                        </span>
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

            {/* ─── Apply Voucher Accordion ──────────────────────────────────────── */}
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
                <span style={{
                  fontSize: "18px", fontWeight: 300, display: "inline-block",
                  transform: giftOpen ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}>+</span>
              </button>
              <div style={{
                maxHeight: giftOpen ? `${giftContentHeight + 20}px` : "0px",
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                {isLoggedIn ? renderLoggedVoucherContent() : renderGuestVoucherContent()}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e5e5", backgroundColor: "#fff", flexShrink: 0 }}>
          <div style={{ padding: "14px 24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "7px" }}>
              <span>Complete for free shipping</span>
              <span style={{ fontWeight: 600, color: "#111" }}>{remaining} € remaining</span>
            </div>
            <div style={{ height: "4px", backgroundColor: "#e5e5e5", borderRadius: "2px", overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#111", borderRadius: "2px", transition: "width 0.4s ease" }} />
            </div>
          </div>
          <div style={{ padding: "0 24px 24px" }}>
            <button
              onClick={handleCheckout}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#333"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#111"}
              style={{
                width: "100%", padding: "15px", backgroundColor: "#111", color: "#fff", border: "none",
                fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", borderRadius: "2px", transition: "background 0.2s",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Continue to checkout
            </button>
          </div>
        </div>

      </div>

      <CreateVoucherModal isOpen={isVoucherModalOpen} onClose={() => setIsVoucherModalOpen(false)} />
    </>
  );
}