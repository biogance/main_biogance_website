import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import { saveCartData, getCartData } from "../../../utils/cartStorage";


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
    minWidth: disabled ? "auto" : "72px",
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

function GiftDropItem({ gift, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", fontSize: "13px", cursor: "pointer",
        background: hovered ? "#111" : "#fff",
        color: hovered ? "#fff" : "#111",
        transition: "background 0.15s, color 0.15s",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${selected ? (hovered ? "#fff" : "#111") : (hovered ? "#fff" : "#ccc")}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border-color 0.15s",
        }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: hovered ? "#fff" : "#111",
            opacity: selected ? 1 : 0, transition: "opacity 0.15s",
          }} />
        </div>
        <span>{gift.label}</span>
      </div>
      <span style={{ fontWeight: 500, flexShrink: 0, marginLeft: "12px" }}>{gift.price}</span>
    </div>
  );
}

const QTY_OPTIONS = Array.from({ length: 30 }, (_, i) => String(i + 1));

const GIFT_OPTIONS = [
  { id: "small", label: "Small gift card", price: "Free" },
  { id: "medium", label: "Medium gift card", price: "2,50 €" },
  { id: "large", label: "Large gift card (3+ products)", price: "5,00 €" },
  { id: "premium", label: "Premium gift card", price: "8,00 €" },
];

export default function ModalAddToCart({ isOpen, onClose, product = {} }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftDropOpen, setGiftDropOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoHovered, setPromoHovered] = useState(false);
  const [giftContentHeight, setGiftContentHeight] = useState(0);
  const [giftDropPos, setGiftDropPos] = useState({ top: 0, left: 0, width: 0 });

  const overlayRef = useRef(null);
  const giftContentRef = useRef(null);
  const giftDropRef = useRef(null);
  const giftTriggerRef = useRef(null);

  // Close gift portal dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        giftDropRef.current && !giftDropRef.current.contains(e.target) &&
        giftTriggerRef.current && !giftTriggerRef.current.contains(e.target)
      ) {
        setGiftDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  // Cart list fetch on open
  useEffect(() => {
    if (!isOpen) return;
    const stored = getCartData();
    if (stored) {
      setCartItems(stored.cartItem || []);
      setCartCount(stored.cart_count || 0);
    }
    const fetchLatest = async () => {
      try {
        const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
        const payload = loginData?.data?.token
          ? { token: loginData.data.token }
          : { device_id: getDeviceId() };
        const res = await fetch(`${BASE_URL}/user/cart/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status === false) {
          
          const msg = getErrorMsg(data);
          if (msg) toast.error(msg);
          return;
        }
        if (data.status) {
          saveCartData(data.data);
          setCartItems(data.data.cartItem || []);
          setCartCount(data.data.cart_count || 0);
        }
      } catch {
        // network error — silent
      }
    };
    fetchLatest();
  }, [isOpen]);

  // Recalculate accordion height when gift section changes
  useEffect(() => {
    if (giftContentRef.current) {
      setGiftContentHeight(giftContentRef.current.scrollHeight);
    }
  }, [giftOpen, selectedGift, giftDropOpen]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  const handlePromoApply = async () => {
    if (!promoCode.trim()) return;
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const payload = loginData?.data?.token
        ? { token: loginData.data.token, promo_code: promoCode.trim() }
        : { device_id: getDeviceId(), promo_code: promoCode.trim() };
      const res = await fetch(`${BASE_URL}/user/promo/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === false) {
        // ✅ errors array pehle check karo, phir action
        const msg = getErrorMsg(data);
        if (msg) toast.error(msg);
        return;
      }
      toast.success("Promo code applied!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Portal dropdown position from trigger element
  const handleGiftDropToggle = () => {
    if (!giftDropOpen && giftTriggerRef.current) {
      const rect = giftTriggerRef.current.getBoundingClientRect();
      setGiftDropPos({ top: rect.bottom, left: rect.left, width: rect.width });
    }
    setGiftDropOpen((v) => !v);
  };

  const deliveryCost = 5.9;
  const freeShippingThreshold = 50;
  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.original_price || parseFloat(String(item.price).replace(",", ".")) || 0;
    return sum + unitPrice * item.quantity;
  }, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal).toFixed(2);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const totalWithDelivery = (subtotal + deliveryCost).toFixed(2);

  const handleCheckout = () => { window.location.href = "/checkout"; };

  const handleRemove = async (cartId) => {
    setIsRemoving(true);
    try {
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const payload = loginData?.data?.token
        ? { token: loginData.data.token, cartId }
        : { device_id: getDeviceId(), cartId };
      const res = await fetch(`${BASE_URL}/user/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      // if (updated.length === 0) onClose();
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
      const payload = loginData?.data?.token
        ? { token: loginData.data.token, quantity: parseInt(newQty), cartId }
        : { device_id: getDeviceId(), quantity: parseInt(newQty), cartId };
      const res = await fetch(`${BASE_URL}/user/cart/update/quantity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  return (
    <>
      {/* Backdrop overlay */}
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
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "520px",
          backgroundColor: "#fff", zIndex: 1001, display: "flex", flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #e5e5e5", flexShrink: 0,
        }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your Cart
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#111",
              color: "#fff", fontSize: "12px", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cartCount}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#111" }}>
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Remove loader overlay */}
        {isRemoving && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "all",
          }}>
            <style>{`@keyframes removeSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #ddd", borderTopColor: "#111", animation: "removeSpin 0.75s linear infinite" }} />
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <style>{`@keyframes cartSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #ddd", borderTopColor: "#111", animation: "cartSpin 0.75s linear infinite" }} />
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "4px" }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#111", letterSpacing: "0.01em" }}>Your cart is empty.</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#999", fontWeight: 400 }}>Start adding products.</p>
          </div>
        )}

        {/* Body — scrollable */}
        {!isLoading && !isEmpty && (
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 24px",
            pointerEvents: isRemoving ? "none" : "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
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
                    {firstImage
                      ? <img src={firstImage} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "36px", height: "48px", backgroundColor: "#c8c2b0", borderRadius: "3px" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                    {/* {p.french_name && (
                      <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.french_name}</p>
                    )} */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <CustomDropdown
                        options={QTY_OPTIONS}
                        value={String(item.quantity)}
                        onChange={(val) => handleQtyChange(item.id, val)}
                      />
                      {sizeOptions.length > 0 && (
                        <CustomDropdown
                          options={sizeOptions}
                          value={sizeOptions[0]}
                          onChange={() => {}}
                          disabled={isSingleSize}
                        />
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#888", display: "flex", alignItems: "center" }}
                        title="Remove item"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", flexShrink: 0 }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px", fontWeight: 700, color: "#111" }}>
                <span>Estimated total</span>
                <span>{parseFloat(totalWithDelivery).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            {/* Promo Code Accordion */}
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
                maxHeight: promoOpen ? "80px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: promoOpen ? 1 : 0,
              }}>
                <div style={{ paddingBottom: "16px" }}>
                  <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
                    <input
                      type="text"
                      placeholder="Enter your code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      style={{
                        flex: 1, border: "none", outline: "none", padding: "11px 14px",
                        fontSize: "13px", color: "#111", background: "#fff",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                    />
                    <button
                      onClick={handlePromoApply}
                      disabled={!promoCode.trim()}
                      style={{
                        border: "none", borderLeft: "1px solid #ddd",
                        background: !promoCode.trim() ? "#f3f3f3" : promoHovered ? "#111" : "transparent",
                        color: !promoCode.trim() ? "#aaa" : promoHovered ? "#fff" : "#111",
                        padding: "11px 18px", fontSize: "12px", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        cursor: !promoCode.trim() ? "default" : "pointer",
                        transition: "background 0.2s, color 0.2s",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                      onMouseEnter={() => { if (promoCode.trim()) setPromoHovered(true); }}
                      onMouseLeave={() => setPromoHovered(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Pouch Accordion */}
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
                <span style={{ fontWeight: 500 }}>Add a gift pouch</span>
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
                <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
                  <div
                    ref={giftTriggerRef}
                    onClick={handleGiftDropToggle}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "11px 14px", fontSize: "13px",
                      color: selectedGift ? "#111" : "#aaa",
                      cursor: "pointer", background: "#fff", userSelect: "none",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#999"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#ddd"}
                  >
                    <span>{selectedGift ? selectedGift.label : "Select a gift card"}</span>
                    <span style={{
                      display: "inline-block", width: 0, height: 0,
                      borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                      borderTop: "5px solid #888", flexShrink: 0,
                      transform: giftDropOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }} />
                  </div>
                </div>
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
              style={{
                width: "100%", padding: "15px", backgroundColor: "#111", color: "#fff", border: "none",
                fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", borderRadius: "2px", transition: "background 0.2s",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#333"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#111"}
            >
              Continue to checkout
            </button>
          </div>
        </div>
      </div>

      {/* Gift dropdown portal */}
      {giftDropOpen && createPortal(
        <div
          ref={giftDropRef}
          style={{
            position: "fixed",
            top: giftDropPos.top,
            left: giftDropPos.left,
            width: giftDropPos.width,
            background: "#fff",
            border: "1px solid #ddd",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            zIndex: 1200,
            overflow: "hidden",
          }}
        >
          {GIFT_OPTIONS.map((gift) => (
            <GiftDropItem
              key={gift.id}
              gift={gift}
              selected={selectedGift?.id === gift.id}
              onSelect={() => { setSelectedGift(gift); setGiftDropOpen(false); }}
            />
          ))}
        </div>,
        document.body
      )}
    </>
  );
}