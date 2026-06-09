"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PhoneInput as IntlPhoneInput,
  parseCountry,
  defaultCountries,
} from "react-international-phone";
import "react-international-phone/style.css";
import { CiCircleInfo } from "react-icons/ci";

// ─── Reusable Input ──────────────────────────────────────────────────────────
function Input({ placeholder, type = "text", value, onChange, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 14px",
        fontSize: "13px",
        border: `1px solid ${focused ? "#111" : "#ddd"}`,
        borderRadius: "2px",
        outline: "none",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#111",
        background: "#fff",
        transition: "border-color 0.2s",
        ...style,
      }}
    />
  );
}

// ─── Country list from react-international-phone ─────────────────────────────
function CountrySelect({ iso2, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={iso2}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "14px 40px 14px 14px",
          fontSize: "13px",
          border: `1px solid ${focused ? "#111" : "#ddd"}`,
          borderRadius: "2px",
          outline: "none",
          appearance: "none",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: iso2 ? "#111" : "#888",
          background: "#fff",
          cursor: "pointer",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
        }}
      >
        <option value="">Country *</option>
        {defaultCountries.map((c) => {
          const parsed = parseCountry(c);
          return (
            <option key={parsed.iso2} value={parsed.iso2}>
              {parsed.name}
            </option>
          );
        })}
      </select>
      <div
        style={{
          position: "absolute",
          right: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "5px solid #555",
        }}
      />
    </div>
  );
}

// ─── Phone Input from react-international-phone ───────────────────────────────
function PhoneInput({ phone, onChange, defaultCountry }) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || "fr",
  );
  const [numberOnly, setNumberOnly] = useState("");
  const wrapRef = useRef(null);

  // Get dial code from iso2
  const getDialCode = (iso2) => {
    const c = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
    return c ? `+${parseCountry(c).dialCode}` : "";
  };

  // getFlagFromLibrary hatao, yeh use karo:
  const getFlagUrl = (iso2) =>
    `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`;

  const dialCode = getDialCode(selectedCountry);

  // Sync when parent changes country
  useEffect(() => {
    setSelectedCountry(defaultCountry || "fr");
    setNumberOnly("");
    onChange("");
  }, [defaultCountry]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = (iso2) => {
    setSelectedCountry(iso2);
    setNumberOnly("");
    onChange(getDialCode(iso2));
    setOpen(false);
  };

  const handleNumberChange = (e) => {
    setNumberOnly(e.target.value);
    onChange(`${dialCode}${e.target.value}`);
  };

  return (
    <div ref={wrapRef} style={{ display: "flex", position: "relative" }}>
      {/* Flag + dial code button */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 10px",
          border: "1px solid #ddd",
          borderRight: "none",
          borderRadius: "2px 0 0 2px",
          height: "48px",
          background: "#fff",
          cursor: "pointer",
          fontSize: "13px",
          flexShrink: 0,
          userSelect: "none",
          minWidth: "80px",
          boxSizing: "border-box",
        }}
      >
        {/* Flag + dial code button ke andar — span hatao, img lagao */}
        <img
          src={getFlagUrl(selectedCountry)}
          alt={selectedCountry}
          style={{
            width: "24px",
            height: "18px",
            objectFit: "cover",
            borderRadius: "1px",
          }}
        />

        <span style={{ color: "#555" }}>{dialCode}</span>
        <span
          style={{
            width: 0,
            height: 0,
            marginLeft: "auto",
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderTop: "4px solid #555",
          }}
        />
      </div>

      {/* Number input */}
      <input
        type="tel"
        placeholder="Phone *"
        value={numberOnly}
        onChange={handleNumberChange}
        style={{
          flex: 1,
          padding: "14px",
          fontSize: "13px",
          border: "1px solid #ddd",
          borderLeft: "none",
          borderRadius: "0 2px 2px 0",
          outline: "none",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#111",
          background: "#fff",
          height: "48px",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#111";
          e.currentTarget.previousSibling.style.borderColor = "#111";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#ddd";
          e.currentTarget.previousSibling.style.borderColor = "#ddd";
        }}
      />

      {/* Dropdown — position absolute, floats outside */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "2px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: "220px",
            overflowY: "auto",
            minWidth: "240px",
          }}
        >
          {defaultCountries.map((c) => {
            const parsed = parseCountry(c);
            return (
              <div
                key={parsed.iso2}
                onClick={() => handleSelect(parsed.iso2)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
                  background:
                    parsed.iso2 === selectedCountry ? "#f5f5f5" : "#fff",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    parsed.iso2 === selectedCountry ? "#f5f5f5" : "#fff")
                }
              >
                <span style={{ fontSize: "18px" }}>{parsed.flag}</span>
                <span style={{ flex: 1, color: "#111" }}>{parsed.name}</span>
                <span style={{ color: "#888" }}>+{parsed.dialCode}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ─── Promo Code Input ─────────────────────────────────────────────────────────
function PromoInput() {
  const [code, setCode] = useState("");
  const hasValue = code.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        border: "1px solid #ddd",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      <input
        type="text"
        placeholder="Enter your code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          flex: 1,
          padding: "13px 14px",
          fontSize: "13px",
          border: "none",
          outline: "none",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#111",
          background: "#fff",
        }}
      />
      <button
        disabled={!hasValue}
        style={{
          padding: "13px 18px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          border: "none",
          borderLeft: "1px solid #ddd",
          cursor: hasValue ? "pointer" : "default",
          background: hasValue ? "transparent" : "#f5f5f5",
          color: hasValue ? "#111" : "#aaa",
          transition: "background 0.2s, color 0.2s",
        }}
        onMouseEnter={(e) => {
          if (hasValue) {
            e.currentTarget.style.background = "#111";
            e.currentTarget.style.color = "#fff";
          }
        }}
        onMouseLeave={(e) => {
          if (hasValue) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#111";
          }
        }}
      >
        Apply
      </button>
    </div>
  );
}
// ─── Accordion row (Gift / Promo) ────────────────────────────────────────────
function AccordionRow({ label, children }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [open, children]);

  return (
    <div style={{ borderBottom: "1px solid #e5e5e5" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          cursor: "pointer",
          fontSize: "13px",
          color: "#111",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <span>{label}</span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 300,
            display: "inline-block",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? `${height + 40}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: "16px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummary({ items = [], deliveryFree = false, deliveryValidated = false, paymentMethod = "card" }) {

  const [currentShipping, setCurrentShipping] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShipping((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const shippingSlides = [
    { title: "Shipping from France", note: "All orders shipped from Paris" },
    { title: "Free Shipping", note: "Free on all orders over €50" },
    { title: "Complimentary Gift", note: "Free gift pouch with every order" },
  ];
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const delivery = deliveryFree ? 0 : 5.9;
  const total = subtotal + delivery;

  return (
    <div
      style={{
        width: "380px",
        flexShrink: 0,
        background: "#fff",
        borderRadius: "2px",
        padding: "24px 28px",
        position: "sticky",
        top: "40px",
        alignSelf: "flex-start",
      }}
    >
  {deliveryValidated ? (
  paymentMethod === "paypal" ? (
    <button
      style={{
        width: "100%", padding: "13px 15px",
        backgroundColor: "#fff", color: "#003087",
        border: "2px solid #003087", fontSize: "14px", fontWeight: 700,
        cursor: "pointer", borderRadius: "2px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transition: "background 0.2s", display: "flex",
        alignItems: "center", justifyContent: "center", gap: "6px",
        marginBottom: "16px",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#003087"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#003087"; }}
    >
      Pay with <span>Pay<span style={{ color: "#009cde" }}>Pal</span></span>
    </button>
  ) : (
    <button
      style={{
        width: "100%", padding: "15px", backgroundColor: "#111", color: "#fff",
        border: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
        marginBottom: "16px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
    >
      ORDER — {(subtotal + (deliveryFree ? 0 : 5.9)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
    </button>
  )
) : (
  <button
    style={{
      width: "100%", padding: "15px", backgroundColor: "#111", color: "#fff",
      border: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
      marginBottom: "16px",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      transition: "background 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
  >
    NEXT
  </button>
)}

      {/* Shipping Titles — same as ProductDetail.jsx */}
      <div
        style={{
          paddingTop: "16px",
          marginBottom: "20px",
          marginBottom: "-1px",
          borderBottom: "1px solid #e5e5e5",
          paddingBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#1C1C1C",
                margin: 0,
              }}
            >
              {shippingSlides[currentShipping].title}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#9CA3AF",
                marginTop: "2px",
                marginBottom: 0,
              }}
            >
              {shippingSlides[currentShipping].note}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {shippingSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentShipping(idx)}
                style={{
                  borderRadius: "9999px",
                  cursor: "pointer",
                  border: idx === currentShipping ? "none" : "1px solid black",
                  background: idx === currentShipping ? "#1F2937" : "white",
                  width: idx === currentShipping ? "16px" : "6px",
                  height: idx === currentShipping ? "6px" : "6px",
                  padding: 0,
                  transition: "all 0.7s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Promo & Gift */}
      <AccordionRow label="Gift card / promo code">
        <PromoInput />
      </AccordionRow>
      <AccordionRow label="Add a gift pouch">
        <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}>
          Choose your gift pouch option at checkout.
        </p>
      </AccordionRow>

      {/* Totals */}
      <div style={{ padding: "16px 0", borderBottom: "1px solid #e5e5e5" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#555",
          }}
        >
          <span>Products ({items.length})</span>
          <span>
            {subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#555",
          }}
        >
          <span>Delivery cost</span>
          <span
            style={{
              color: deliveryFree ? "#2a7a2a" : "#555",
              fontWeight: deliveryFree ? 600 : 400,
            }}
          >
            {deliveryFree ? "Free" : `${delivery.toFixed(2)} €`}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#111",
          }}
        >
          <span>Total</span>
          <span>
            {total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        </div>
      </div>

      {/* Cart items */}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ number, title, children, disabled, rightContent }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "2px",
        padding: "28px 32px",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "opacity 0.3s",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#111",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {number}. {title}
        </h2>
        {rightContent && <div>{rightContent}</div>}
      </div>
      {children && <div style={{ marginTop: "20px" }}>{children}</div>}
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
export default function Checkout({ cartItems = [] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  // Add this state in Checkout component
  const [deliveryValidated, setDeliveryValidated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [saveCard, setSaveCard] = useState(null); 

  // Delivery fields
  const [countryIso2, setCountryIso2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [showAdditional, setShowAdditional] = useState(false);
  const [additionalAddress, setAdditionalAddress] = useState("");

  // When country changes → sync phone input country
  const handleCountryChange = (iso2) => {
    setCountryIso2(iso2);
    // reset phone so IntlPhoneInput picks up new country dial code
    setPhone("");
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const deliveryUnlocked = emailSubmitted && emailValid;

  // Sample items if none passed
  const items =
    cartItems.length > 0
      ? cartItems
      : [
          {
            name: "Mark-Fading Serum L64",
            subtitle: "— 30 ml · 14% PHA + Centella Asiatica",
            price: 51.0,
            qty: 2,
          },
          {
            name: "9-Ingredient Face Moisturiser D41",
            subtitle: "— 50 ml",
            price: 22.5,
            qty: 1,
          },
        ];

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const deliveryFree = subtotal >= 50;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f3f3",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── Top Logo ── */}
      <div
        style={{
          textAlign: "center",
          padding: "28px 0 20px",

          background: "#f3f3f3",
        }}
      >
        <div
        //   onClick={() => router.back()}
          style={{
            cursor: "pointer",
            display: "inline-block",
            marginTop: "20px",
          }}
        >
          <img src="logo.svg" alt="" />
        </div>
      </div>

      {/* ── Main layout ── */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 44px",
          display: "flex",
          gap: "32px",
          alignItems: "flex-start",
        }}
      >
        {/* ── Left column ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Express Payment */}
          <div style={{ position: "relative", padding: "28px 32px 24px" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: "1px solid #aaa",
                borderRadius: "2px",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-9px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#f3f3f3",
                padding: "0 12px",
                fontSize: "11px",
                letterSpacing: "0.12em",
                color: "#111",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Express Payment
            </div>
            <button
              style={{
                width: "50%",
                padding: "4px",
                border: "1.5px solid #2e2d2d",
                borderRadius: "4px",
                background: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
                color: "#003087",
                margin: "0 auto",
                transition: "border-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#003087")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#2e2d2d")
              }
            >
              <img src="pay.png" alt="PayPal" style={{ height: "38px" }} />
            </button>
          </div>

          {/* OR divider — BAHAR box ke */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#aaa" }} />
            <span
              style={{
                fontSize: "11px",
                color: "#111",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: "1px", background: "#aaa " }} />
          </div>

          {/* 1. Contact Information */}
         
<Section
  number="1"
  title="Contact Information"
  rightContent={
    emailSubmitted && (
      <button
        onClick={() => setEmailSubmitted(false)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#111", textDecoration: "underline",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        EDIT
      </button>
    )
  }
>
  {emailSubmitted ? (
    // ── Confirmed state ──
    <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>{email}</p>
  ) : (
    // ── Input state ──
    <>
      <Input
        placeholder="Email *"
        type="email"
        value={email}
        style={{ width: "50%" }}
        onChange={(e) => { setEmail(e.target.value); setEmailSubmitted(false); }}
      />
      <button
        onClick={() => { if (emailValid) setEmailSubmitted(true); }}
        style={{
          width: "100%", marginTop: "12px", padding: "15px",
          backgroundColor: emailValid ? "#111" : "#ccc", color: "#fff",
          border: "none", fontSize: "12px", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          cursor: emailValid ? "pointer" : "not-allowed", borderRadius: "2px",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { if (emailValid) e.currentTarget.style.background = "#333"; }}
        onMouseLeave={(e) => { if (emailValid) e.currentTarget.style.background = "#111"; }}
      >
        NEXT
      </button>
    </>
  )}
</Section>

          {/* 2. Delivery */}
        
<div>
  <Section
    number="2"
    title="Delivery"
   
    rightContent={
      deliveryValidated && (
        <button
          onClick={() => setDeliveryValidated(false)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#111", textDecoration: "underline",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          EDIT
        </button>
      )
    }
  >
    <div
      style={{
        maxHeight: deliveryUnlocked ? "1200px" : "0px",
        overflow: deliveryUnlocked ? "visible" : "hidden",
        transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {deliveryValidated ? (
        <>
          <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 600, color: "#111" }}>
            Delivery address
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#888" }}>
            {firstName} {lastName}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#888" }}>
            {street}{additionalAddress ? `, ${additionalAddress}` : ""}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#888" }}>
            {[postcode, state, city].filter(Boolean).join(", ")}
            {countryIso2
              ? `, ${(() => {
                  const found = defaultCountries.find(
                    (c) => parseCountry(c).iso2 === countryIso2
                  );
                  return found ? parseCountry(found).name : "";
                })()}`
              : ""}
          </p>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#888" }}>{phone}</p>

          {/* Customs notice */}
          <div
            style={{
              display: "flex", alignItems: "center",  justifyContent: "space-between",
              background: "#f3f3f3", borderRadius: "2px", padding: "12px 16px",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#555", marginLeft:"240px" }}>
              Any customs charges are at your charge.
            </span>
           
                <CiCircleInfo style={{color:"#999"}} size={20} />

           
            
          </div>

          {/* Delivery method row */}
          <div
            style={{
              border: "1px solid #ddd", borderRadius: "2px", padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "18px", height: "18px", borderRadius: "50%",
                  border: "2px solid #111", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#111" }} />
              </div>
              <span style={{ fontSize: "13px", color: "#111" }}>
                Standard Delivery - Custom fees at your charge
              </span>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#2a7a2a" }}>
              {deliveryFree ? "FREE" : "€5.90"}
            </span>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", margin: "0 0 16px" }}>
            Delivery address
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <CountrySelect iso2={countryIso2} onChange={handleCountryChange} />

            <div style={{ display: "flex", gap: "10px" }}>
              <Input
                placeholder="First name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Full last name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <Input
              placeholder="Street address *"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />

            {/* Additional fields toggle */}
            <button
              onClick={() => setShowAdditional((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", color: "#111", textDecoration: "underline",
                padding: "2px 0", textAlign: "left", fontFamily: "inherit",
              }}
            >
              {showAdditional ? "− Hide additional fields" : "+ Additional Fields (optional)"}
            </button>
            <div
              style={{
                maxHeight: showAdditional ? "80px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.35s ease",
              }}
            >
              <Input
                placeholder="Apartment, suite, etc. (optional)"
                value={additionalAddress}
                onChange={(e) => setAdditionalAddress(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Input
                placeholder="Postcode *"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="Town/city *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <PhoneInput
              key={countryIso2}
              phone={phone}
              onChange={setPhone}
              defaultCountry={countryIso2 || "fr"}
            />

            <button
              onClick={() => setDeliveryValidated(true)}
              style={{
                width: "100%", marginTop: "4px", padding: "15px",
                backgroundColor: "#111", color: "#fff", border: "none",
                fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
            >
              VALIDATE
            </button>
          </div>
        </>
      )}
    </div>
  </Section>
</div>

          {/* 3. Payment */}
        
          <Section
            number="3"
            title="Payment"
            rightContent={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {/* Visa */}
                <svg
                  width="38"
                  height="24"
                  viewBox="0 0 38 24"
                  style={{ border: "1px solid #e5e5e5", borderRadius: "3px" }}
                >
                  <rect width="38" height="24" fill="#fff" rx="3" />    
                  <text
                    x="50%"
                    y="16"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#1a1f71"
                    fontFamily="Arial"
                  >
                    VISA
                  </text>
                </svg>
                {/* Mastercard */}
                <svg
                  width="38"
                  height="24"
                  viewBox="0 0 38 24"
                  style={{ border: "1px solid #e5e5e5", borderRadius: "3px" }}
                >
                  <rect width="38" height="24" fill="#fff" rx="3" />
                  <circle cx="14" cy="12" r="7" fill="#eb001b" opacity="0.9" />
                  <circle cx="24" cy="12" r="7" fill="#f79e1b" opacity="0.9" />
                  <ellipse
                    cx="19"
                    cy="12"
                    rx="3"
                    ry="7"
                    fill="#ff5f00"
                    opacity="0.85"
                  />
                </svg>
                {/* Amex */}
                <svg
                  width="38"
                  height="24"
                  viewBox="0 0 38 24"
                  style={{ border: "1px solid #e5e5e5", borderRadius: "3px" }}
                >
                  <rect width="38" height="24" fill="#2557d6" rx="3" />
                  <text
                    x="50%"
                    y="15"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#fff"
                    fontFamily="Arial"
                  >
                    AMEX
                  </text>
                </svg>
              </div>
            }
          >
            {/* Payment body — only renders after delivery validated */}
            <div
              style={{
                maxHeight: deliveryValidated ? "600px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {/* ── Add a card option ── */}
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "2px",
                  marginBottom: "8px",
                  overflow: "hidden",
                  background: paymentMethod === "card" ? "#f3f3f3" : "#fff",
                }}
              >
                {/* Radio row */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    background: paymentMethod === "card" ? "#f3f3f3" : "#fff",
                  }}
                >
                  {/* Custom radio */}
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `2px solid ${paymentMethod === "card" ? "#111" : "#bbb"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "border-color 0.2s",
                    }}
                  >
                    {paymentMethod === "card" && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#111",
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{ fontSize: "13px", color: "#111", fontWeight: 500 }}
                  >
                    Add a card
                  </span>
                </div>

                {/* Card fields — expand when selected */}
                <div
                  style={{
                    maxHeight: paymentMethod === "card" ? "200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div
                    style={{
                      padding: "0 16px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {/* Card inputs row */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      {/* Card number */}
                      <div
                        style={{
                          flex: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "2px",
                          background: "#fff",
                          padding: "12px 14px",
                        }}
                      >
                        {/* Card icon */}
                        <svg
                          width="22"
                          height="16"
                          viewBox="0 0 22 16"
                          fill="none"
                        >
                          <rect
                            x="0.5"
                            y="0.5"
                            width="21"
                            height="15"
                            rx="1.5"
                            stroke="#bbb"
                            fill="#fff"
                          />
                          <rect y="3" width="22" height="3" fill="#bbb" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Card number"
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            fontFamily:
                              "'Helvetica Neue', Helvetica, Arial, sans-serif",
                            color: "#111",
                            flex: 1,
                            background: "transparent",
                          }}
                        />
                      </div>
                      {/* Expiry */}
                      <input
                        type="text"
                        placeholder="Expiration date"
                        style={{
                          flex: 1,
                          border: "1px solid #ddd",
                          borderRadius: "2px",
                          padding: "12px 14px",
                          fontSize: "13px",
                          background: "#fff",
                          outline: "none",
                          fontFamily:
                            "'Helvetica Neue', Helvetica, Arial, sans-serif",
                          color: "#111",
                        }}
                      />
                      {/* CVC */}
                      <input
                        type="text"
                        placeholder="CVC/CVV"
                        style={{
                          flex: 1,
                          border: "1px solid #ddd",
                          borderRadius: "2px",
                          padding: "12px 14px",
                          background: "#fff",
                          fontSize: "13px",
                          outline: "none",
                          fontFamily:
                            "'Helvetica Neue', Helvetica, Arial, sans-serif",
                          color: "#111",
                        }}
                      />
                    </div>

                    {/* Save card radio */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        fontSize: "13px",
                        color: "#111",
                      }}
                    >
                      <span>Save this card for future orders?*</span>
                      {["yes", "no"].map((opt) => (
                        <label
                          key={opt}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            onClick={() => setSaveCard(opt)}
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              border: `2px solid ${saveCard === opt ? "#111" : "#bbb"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "border-color 0.2s",
                            }}
                          >
                            {saveCard === opt && (
                              <div
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  background: "#111",
                                }}
                              />
                            )}
                          </div>
                          <span style={{ textTransform: "capitalize" }}>
                            {opt === "yes" ? "Yes" : "No"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PayPal option ── */}
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                {/* Radio row */}
                <div
                  onClick={() => setPaymentMethod("paypal")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    cursor: "pointer",
                    background: paymentMethod === "paypal" ? "#f3f3f3" : "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {/* Custom radio */}
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: `2px solid ${paymentMethod === "paypal" ? "#111" : "#bbb"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "border-color 0.2s",
                      }}
                    >
                      {paymentMethod === "paypal" && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#111",
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#111",
                        fontWeight: 500,
                      }}
                    >
                      Paypal
                    </span>
                  </div>
                  {/* PayPal logo */}
                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: "3px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#003087",
                    }}
                  >
                    Pay<span style={{ color: "#009cde" }}>Pal</span>
                  </div>
                </div>

                {/* PayPal message — expand when selected */}
                <div
                  style={{
                    maxHeight: paymentMethod === "paypal" ? "80px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                    background: "#f3f3f3",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#555",
                    }}
                  >
                    Please confirm your shipping address in the Paypal window
                    when entering payment details.
                  </p>
                </div>
              </div>

              {/* Billing address note */}
              <p style={{ fontSize: "12px", color: "#888", margin: "12px 0" }}>
                <span style={{ textDecoration: "underline", color: "#555" }}>
                  Billing address:
                </span>{" "}
                Same as the delivery address
              </p>

              {/* Order / Pay button */}
              {paymentMethod === "card" ? (
                <button
                  style={{
                    width: "100%",
                    padding: "15px",
                    backgroundColor: "#111",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: "2px",
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#111")
                  }
                >
                  ORDER —{" "}
                  {(subtotal + (deliveryFree ? 0 : 5.9)).toLocaleString(
                    "fr-FR",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}{" "}
                  €
                </button>
              ) : (
                <button
                  style={{
                    width: "100%",
                    padding: "15px",
                    backgroundColor: "#fff",
                    color: "#003087",
                    border: "2px solid #003087",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: "2px",
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#003087";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#003087";
                  }}
                >
                  Pay with{" "}
                  <span>
                    Pay<span style={{ color: "#009cde" }}>Pal</span>
                  </span>
                </button>
              )}
            </div>
          </Section>

          {/* Legal footer */}
          <div
            style={{
              fontSize: "11px",
              color: "#888",
              lineHeight: "1.7",
              padding: "4px 0 32px",
            }}
          >
            <p style={{ margin: "0 0 8px" }}>
              By creating a password, you're accepting our{" "}
              <a href="#" style={{ color: "#111" }}>
                Terms of Sale
              </a>{" "}
              and consent to the processing of your data in accordance with the{" "}
              <a href="#" style={{ color: "#111" }}>
                privacy policy
              </a>{" "}
              of Typology.
            </p>
            <p style={{ margin: 0 }}>
              Your information is intended for use by Good Brands SAS in the
              processing of your orders, and to send you offers and
              communications by email or SMS. In accordance with the Regulation
              on Personal Data, you have the right to access, rectify and oppose
              the processing of your data. To exercise your rights, simply write
              to us{" "}
              <a
                href="mailto:hello+global@biogance.com"
                style={{ color: "#111" }}
              >
                hello+global@biogance.com
              </a>
              . Please find all the information detailed on our FAQ page{" "}
              <a href="#" style={{ color: "#111" }}>
                here
              </a>
              .
            </p>
          </div>
        </div>

        {/* ── Right sidebar ── */}
       <OrderSummary items={items} deliveryFree={deliveryFree} deliveryValidated={deliveryValidated} paymentMethod={paymentMethod}  />

      </div>
    </div>
  );
}
