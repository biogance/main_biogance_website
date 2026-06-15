import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

// ─── Error Message Helper ─────────────────────────────────────────────────────
const getErrorMsg = (data) => {
  if (data.errors?.length > 0) return data.errors[0].message;
  if (data.action) return data.action;
  if (data.action_message) return data.action_message;
  return null;
};

// ─── Custom Dropdown ─────────────────────────────────────────────────────────
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
          display: "flex", alignItems: "center", gap: "8px", minWidth: "72px",
          justifyContent: "space-between", userSelect: "none", transition: "border-color 0.15s",
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

const QTY_OPTIONS = Array.from({ length: 30 }, (_, i) => String(i + 1));

export default function ModalAddToCart({ isOpen, onClose, product = {}, initialCartData = null }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const overlayRef = useRef(null);
  const giftContentRef = useRef(null);
  const [giftContentHeight, setGiftContentHeight] = useState(0);
  const [giftChoice, setGiftChoice] = useState("none");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialCartData) {
      setCartItems(initialCartData.cartItem || []);
      setCartCount(initialCartData.cart_count || 0);
    }
  }, [isOpen, initialCartData]);

  useEffect(() => {
    if (giftContentRef.current) setGiftContentHeight(giftContentRef.current.scrollHeight);
  }, [giftOpen, giftChoice]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

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
      if (updated.length === 0) onClose();
    } catch (err) {
      console.error("Cart remove error:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleQtyChange = async (cartId, newQty) => {
    setCartItems((prev) =>
      prev.map((item) => item.id === cartId ? { ...item, quantity: parseInt(newQty) } : item)
    );
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
      <div
        ref={overlayRef} onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 1000, opacity: isOpen ? 1 : 0, backdropFilter: "blur(4px)",
          pointerEvents: isOpen ? "auto" : "none", transition: "opacity 0.35s ease",
        }}
      />
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e5e5e5", flexShrink: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your Cart
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#111", color: "#fff", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

        {/* ── LOADING ── */}
        {isLoading && (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #ddd", borderTopColor: "#111", animation: "cartSpin 0.75s linear infinite" }} />
            <style>{`@keyframes cartSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* ── EMPTY STATE — centered between header and footer ── */}
        {isEmpty && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "4px" }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#111", letterSpacing: "0.01em" }}>
              Your cart is empty.
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#999", fontWeight: 400 }}>
              Start adding products.
            </p>
          </div>
        )}

        {/* ── BODY — items, summary, gift ── */}
        {!isLoading && !isEmpty && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px", pointerEvents: isRemoving ? "none" : "auto" }}>
            {cartItems.map((item) => {
              const p = item.product || {};
              const firstImage = p.images?.[0]?.media
                ? `https://d18f57oyxifcsh.cloudfront.net/${p.images[0].media}`
                : "";
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
                    {p.french_name && (
                      <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.french_name}</p>
                    )}
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
                      <button onClick={() => handleRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#888", display: "flex", alignItems: "center" }} title="Remove item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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

            {/* Summary */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid #e5e5e5" }}>
              {[{ label: "Subtotal", value: `${subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €` }, { label: "Delivery costs", value: `${deliveryCost.toFixed(2).replace(".", ",")} €` }].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px", fontWeight: 700, color: "#111" }}>
                <span>Estimated total</span>
                <span>{parseFloat(totalWithDelivery).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            {/* Gift accordion */}
            <div>
              <button onClick={() => setGiftOpen((v) => !v)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", fontSize: "13px", color: "#111" }}>
                <span style={{ fontWeight: 500 }}>Add a gift pouch</span>
                <span style={{ fontSize: "18px", fontWeight: 300, display: "inline-block", transform: giftOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
              </button>
              <div style={{ maxHeight: giftOpen ? `${giftContentHeight}px` : "0px", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div ref={giftContentRef} style={{ paddingBottom: "16px" }}>
                  {["none", "large"].map((val) => (
                    <label key={val} onClick={() => setGiftChoice(val)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", cursor: "pointer", borderBottom: val === "none" ? "1px solid #f0f0f0" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${giftChoice === val ? "#111" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.2s ease" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#111", opacity: giftChoice === val ? 1 : 0, transition: "opacity 0.2s ease" }} />
                        </div>
                        <span style={{ fontSize: "13px", color: "#111" }}>{val === "none" ? "I don't want gift pouch" : "Large size - more than 3 products"}</span>
                      </div>
                      {val === "large" && <span style={{ fontSize: "13px", color: "#111", fontWeight: 500, marginLeft: "12px" }}>5,00 €</span>}
                    </label>
                  ))}
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
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111")}
            >
              Continue to checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}