"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCountry, defaultCountries } from "react-international-phone";
import { IoClose } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import LoginModal from "../Onboarding/Login";

// ⚠️ Adjust these three import paths to match where Checkout.jsx actually
// lives in your project — they're copied as-is from ModalAddToCart.jsx.
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import CreateVoucherModal from "../MyAccount/ModalBox/CreateVoucherModal";
import ModalPickLocation from "./ModalPickLocation";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const getErrorMsg = (data) => {
  if (data.errors?.length > 0) return data.errors[0].message;
  if (data.action) return data.action;
  if (data.action_message) return data.action_message;
  return null;
};

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

const QTY_OPTIONS = Array.from({ length: 100 }, (_, i) => String(i + 1));

/* ────────────────────────────────────────────────────────────────────────
   Small UI primitives
   ──────────────────────────────────────────────────────────────────────── */

// Custom select dropdown (ported from ModalAddToCart — used for cart item quantity)
function CustomDropdown({ options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <style>{`
        .dropdown-menu-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .dropdown-menu-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "13px",
          background: "#fff",
          color: "#111",
          cursor: disabled ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minWidth: disabled ? "auto" : "42px",
          userSelect: "none",
          transition: "border-color 0.15s",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = "#999";
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = "#ddd";
        }}
      >
        <span>{value}</span>
        {!disabled && (
          <span
            style={{
              display: "inline-block",
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "5px solid #555",
              flexShrink: 0,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        )}
      </div>
      {open && !disabled && (
        <div
          className="dropdown-menu-scrollbar-hide"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            minWidth: "100%",
            zIndex: 1100,
            maxHeight: "calc(10 * 33px)",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {options.map((opt) => (
            <DropItem
              key={opt}
              label={opt}
              selected={opt === value}
              onSelect={() => {
                onChange(opt);
                setOpen(false);
              }}
            />
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
        padding: "8px 12px",
        fontSize: "13px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        background: hovered ? "#111" : "#fff",
        color: hovered ? "#fff" : "#111",
        fontWeight: selected ? 600 : 400,
        transition: "background 0.15s, color 0.15s",
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
}

// Floating-label text input — label floats up on focus or when value exists
function FieldBox({
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  style = {},
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value !== undefined && value !== "");
  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${focused ? "#111" : "#ddd"}`,
        borderRadius: "3px",
        padding: floated ? "18px 14px 6px" : "14px 14px",
        background: disabled ? "#f7f7f7" : "#fff",
        transition: "border-color 0.2s, padding 0.15s",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <label
        style={{
          position: "absolute",
          left: "14px",
          top: floated ? "6px" : "50%",
          transform: floated ? "none" : "translateY(-50%)",
          fontSize: floated ? "10px" : "14px",
          color: focused ? "#111" : "#999",
          transition: "all 0.15s ease",
          pointerEvents: "none",
          fontFamily: FONT,
          lineHeight: 1,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          padding: 0,
          fontSize: "14px",
          color: disabled ? "#888" : "#111",
          background: "transparent",
          fontFamily: FONT,
        }}
      />
    </div>
  );
}

// Floating-label-inside-box country select
function CountryFieldBox({
  label = "Country *",
  iso2,
  onChange,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${focused ? "#111" : "#ddd"}`,
        borderRadius: "3px",
        padding: "8px 34px 9px 14px",
        background: disabled ? "#f7f7f7" : "#fff",
        transition: "border-color 0.2s",
        boxSizing: "border-box",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "10.5px",
          color: "#999",
          marginBottom: "3px",
          fontFamily: FONT,
        }}
      >
        {label}
      </label>
      <select
        value={iso2}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          padding: 0,
          fontSize: "14px",
          color: disabled ? "#888" : "#111",
          background: "transparent",
          appearance: "none",
          cursor: disabled ? "default" : "pointer",
          fontFamily: FONT,
        }}
      >
        <option value="">Select country</option>
        {defaultCountries.map((c) => {
          const p = parseCountry(c);
          return (
            <option key={p.iso2} value={p.iso2}>
              {p.name}
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

// Flag + dial code + number, merged into one bordered box
function PhoneFieldBox({
  iso2,
  onCountryChange,
  value,
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const floatedPhone = focused || (value !== undefined && value !== "");
  const wrapRef = useRef(null);

  const getDialCode = (code) => {
    const c = defaultCountries.find((c) => parseCountry(c).iso2 === code);
    return c ? `+${parseCountry(c).dialCode}` : "";
  };
  const dialCode = getDialCode(iso2 || "fr");
  const flagUrl = (code) =>
    `https://flagcdn.com/24x18/${(code || "fr").toLowerCase()}.png`;

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        border: `1px solid ${focused ? "#111" : "#ddd"}`,
        borderRadius: "3px",
        background: disabled ? "#f7f7f7" : "#fff",
        transition: "border-color 0.2s",
      }}
    >
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 12px",
          borderRight: "1px solid #eee",
          cursor: disabled ? "default" : "pointer",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <img
          src={flagUrl(iso2)}
          alt=""
          style={{
            width: "20px",
            height: "15px",
            objectFit: "cover",
            borderRadius: "1px",
          }}
        />
        <span style={{ fontSize: "13px", color: "#333", fontFamily: FONT }}>
          {dialCode}
        </span>
        <span
          style={{
            width: 0,
            height: 0,
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderTop: "4px solid #888",
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          padding: floatedPhone ? "18px 14px 6px" : "14px 14px",
          transition: "padding 0.15s",
        }}
      >
        <label
          style={{
            position: "absolute",
            left: "14px",
            top: floatedPhone ? "6px" : "50%",
            transform: floatedPhone ? "none" : "translateY(-50%)",
            fontSize: floatedPhone ? "10px" : "14px",
            color: focused ? "#111" : "#999",
            transition: "all 0.15s ease",
            pointerEvents: "none",
            fontFamily: FONT,
            lineHeight: 1,
          }}
        >
          Phone Number
        </label>
        <input
          type="tel"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            padding: 0,
            fontSize: "14px",
            color: disabled ? "#888" : "#111",
            background: "transparent",
            fontFamily: FONT,
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 50,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "3px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: "220px",
            overflowY: "auto",
            minWidth: "240px",
          }}
        >
          {defaultCountries.map((c) => {
            const p = parseCountry(c);
            return (
              <div
                key={p.iso2}
                onClick={() => {
                  onCountryChange(p.iso2);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
                  background: p.iso2 === iso2 ? "#f5f5f5" : "#fff",
                  fontFamily: FONT,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    p.iso2 === iso2 ? "#f5f5f5" : "#fff")
                }
              >
                <span style={{ fontSize: "16px" }}>{p.flag}</span>
                <span style={{ flex: 1, color: "#111" }}>{p.name}</span>
                <span style={{ color: "#888" }}>+{p.dialCode}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        fontSize: "13px",
        color: "#333",
        fontFamily: FONT,
      }}
    >
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: "16px",
          height: "16px",
          border: `1.5px solid ${checked ? "#111" : "#bbb"}`,
          borderRadius: "3px",
          background: checked ? "#111" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8">
            <path
              d="M1 4l3 3 5-6"
              stroke="#fff"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="mt-0.5"> {label}</span>
    </label>
  );
}

function RadioDot({ active }) {
  return (
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        border: `2px solid ${active ? "#111" : "#bbb"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "border-color 0.2s",
      }}
    >
      {active && (
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
  );
}

// ─── Accordion row (Gift card / Voucher) ────────────────────────────────────
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
          fontFamily: FONT,
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

/* ────────────────────────────────────────────────────────────────────────
   Brand badges (simplified, generic placeholders — not official logo art)
   ──────────────────────────────────────────────────────────────────────── */

function CardBrandIcons() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg
        width="34"
        height="22"
        viewBox="0 0 38 24"
        style={{ border: "1px solid #e5e5e5", borderRadius: "3px" }}
      >
        <rect width="38" height="24" fill="#fff" rx="3" />
        <circle cx="14" cy="12" r="7" fill="#eb001b" opacity="0.9" />
        <circle cx="24" cy="12" r="7" fill="#f79e1b" opacity="0.9" />
        <ellipse cx="19" cy="12" rx="3" ry="7" fill="#ff5f00" opacity="0.85" />
      </svg>
      <svg
        width="34"
        height="22"
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
      <svg
        width="34"
        height="22"
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
  );
}

function GooglePayBadge() {
  return (
    <div
      style={{
       
        
        fontSize: "12px",
        fontWeight: 600,
        color: "#5f6368",
        display: "flex",
        alignItems: "center",
        gap: "2px",
        fontFamily: FONT,
      }}
    >
     <img src="GPAY.svg" alt="" />
    </div>
  );
}

function ApplePayBadge() {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "3px",
        padding: "5px 10px",
        fontSize: "12px",
        fontWeight: 500,
        color: "#111",
        display: "flex",
        alignItems: "center",
        gap: "0px",
        fontFamily: FONT,
      }}
    >
      <AppleIcon /> <span className="mt-0.5">Pay</span>
    </div>
  );
}

function PayPalBadge() {
  return (
    <div
      style={{
        
        fontSize: "12px",
        fontWeight: 700,
        color: "#003087",
        fontFamily: FONT,
      }}
    >
      <img src="PPAY.svg" alt="" />
    </div>
  );
}

function AppleIcon({ color = "#111", size = 14 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 14 16" fill="none">
      <path
        d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.5-.8-1.1-1.9-1.3-2.3-1.3-1-.1-1.9.6-2.4.6-.5 0-1.3-.6-2.1-.6-1.1 0-2.1.6-2.7 1.6-1.1 2-.3 5 .8 6.6.5.8 1.1 1.7 1.9 1.6.7 0 1-.5 1.9-.5.9 0 1.1.5 1.9.5.8 0 1.4-.8 1.9-1.6.5-.8.7-1.5.7-1.6 0 0-1.9-.7-1.9-2.8Z"
        fill={color}
      />
      <path
        d="M8.6 3.5c.4-.5.7-1.2.6-1.9-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.8.7.1 1.3-.3 1.7-.8Z"
        fill={color}
      />
    </svg>
  );
}

function CardNumberField({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== "";
  return (
    <div style={{ position: "relative", padding: floated ? "18px 14px 6px" : "14px 14px", transition: "padding 0.15s" }}>
      <label style={{
        position: "absolute", left: "52px",
        top: floated ? "6px" : "50%",
        transform: floated ? "none" : "translateY(-50%)",
        fontSize: floated ? "10px" : "14px",
        color: focused ? "#111" : "#999",
        transition: "all 0.15s ease", pointerEvents: "none", fontFamily: FONT, lineHeight: 1,
      }}>
        Card number
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="34" height="22" viewBox="0 0 38 24" style={{ border: "1px solid #e5e5e5", borderRadius: "3px", flexShrink: 0 }}>
          <rect width="38" height="24" fill="#fff" rx="3" />
          <circle cx="14" cy="12" r="7" fill="#eb001b" opacity="0.9" />
          <circle cx="24" cy="12" r="7" fill="#f79e1b" opacity="0.9" />
          <ellipse cx="19" cy="12" rx="3" ry="7" fill="#ff5f00" opacity="0.85" />
        </svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#111", background: "transparent", fontFamily: FONT, padding: 0 }}
        />
      </div>
    </div>
  );
}

function CardIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect x="0.5" y="0.5" width="19" height="13" rx="2" stroke="#111" />
      <rect x="0.5" y="3.5" width="19" height="2.5" fill="#111" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Layout building blocks
   ──────────────────────────────────────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div
      style={{
        background: "#f3f3f3",
        borderRadius: "2px",
        padding: "26px 30px",
      }}
    >
      <h2
        style={{
          margin: "0 0 18px",
          fontSize: "17px",
          fontWeight: 700,
          color: "#111",
          fontFamily: FONT,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function ExpressPaymentBar({ selectedMethod, onSelect }) {
  const baseBtn = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    width:"50px",
     height:"50px",
    padding: "13px 10px",
  backgroundColor:"#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: FONT,
    color: "#111",
    transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#f3f3f3",
        padding: "26px 30px 24px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "9px",
          left: "8%",
          transform: "translateX(-50%)",
          margin: "10px",
          padding: "0 12px",
          fontSize: "17px",
          fontWeight: 700,
          color: "#111",
          fontFamily: FONT,

          whiteSpace: "nowrap",
        }}
      >
        Payment
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
        <button
          onClick={() => onSelect("card")}
          style={{
            ...baseBtn,
            border: selectedMethod === "card" ? "1px solid #aaa" : "1px solid #f3f3f3",
          }}
          onMouseEnter={(e) => {
            if (selectedMethod !== "card") e.currentTarget.style.borderColor = "#aaa";
          }}
          onMouseLeave={(e) => {
            if (selectedMethod !== "card") e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
         <img src="visa.svg" alt=""style={{width:"120px",  height:"90px"}} />
        </button>
        <button
          onClick={() => onSelect("googlepay")}
          style={{
            ...baseBtn,
            border: selectedMethod === "googlepay" ? "1px solid #aaa" : "1px solid #f3f3f3",
          }}
          onMouseEnter={(e) => {
            if (selectedMethod !== "googlepay") e.currentTarget.style.borderColor = "#aaa";
          }}
          onMouseLeave={(e) => {
            if (selectedMethod !== "googlepay") e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
        <img src="pay-pal.svg" alt="" style={{width:"120px",  height:"100px"}} />
        </button>
        <button
          onClick={() => onSelect("applepay")}
          style={{
            ...baseBtn,
            border: selectedMethod === "applepay" ? "1px solid #aaa" : "1px solid #f3f3f3",
          }}
          onMouseEnter={(e) => {
            if (selectedMethod !== "applepay") e.currentTarget.style.borderColor = "#aaa";
          }}
          onMouseLeave={(e) => {
            if (selectedMethod !== "applepay") e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
         <img src="apple-pay.svg" alt="" style={{width:"120px", height:"80px"}} />
        </button>
        <button
          onClick={() => onSelect("paypal")}
          style={{
            ...baseBtn,
            color: "#003087",
            width:"50px",
            height:"50px",
            border: selectedMethod === "paypal" ? "1px solid #aaa" : "1px solid #f3f3f3",
          }}
          onMouseEnter={(e) => {
            if (selectedMethod !== "paypal") e.currentTarget.style.borderColor = "#aaa";
          }}
          onMouseLeave={(e) => {
            if (selectedMethod !== "paypal") e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
         <img src="google-pay.svg" alt="" style={{width:"100px",  height:"100px"}} />
        </button>
      </div>
    </div>
  );
}

function PaymentMethodRow({ active, onSelect, label, right, children, last }) {
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid #e5e5e5" }}>
      <div
        onClick={onSelect}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          cursor: "pointer",
          background: active ? "#fff" : "#fff",
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <RadioDot active={active} />
          <span style={{ fontSize: "14px", color: "#111", fontFamily: FONT }}>
            {label}
          </span>
        </div>
        {right}
      </div>
      {children && (
        <div
          style={{
            maxHeight: active ? "260px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.35s ease",
            background: "#fff",
          }}
        >
          <div style={{ padding: "0 16px 16px" }}>{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Cart item card (exactly same as ModalAddToCart.jsx) ───────────────────
function CartItemRow({ item, index, onQtyChange, onRemove }) {
  const p = item.product || {};
  const firstImage = p.images?.[0]?.media
    ? `${MEDIA_URL}${p.images[0].media}`
    : "https://placehold.co/64x80/f3f3f3/999?text=IMG";
  const name = p.name || item.name || "";
  // size_name: real API items mein item.product.size_name ya item.size_name hota hai
  const sizeName = p.size_name || item.size_name || null;
  const sizeOptions = sizeName ? [sizeName] : [];
  const isSingleSize = true; // size sirf display ke liye, change nahi hota
  const unitPrice =
    item.original_price ||
    parseFloat(String(item.price ?? "0").replace(",", ".")) ||
    0;
  const qty = item.quantity ?? item.qty ?? 1;
  const itemTotal = (unitPrice * qty).toFixed(2);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "20px 0",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      {/* Image — same 64×80 box as ModalAddToCart */}
      <div
        style={{
          width: "64px",
          height: "80px",
          flexShrink: 0,
          backgroundColor: "#E3E3E3",
          borderRadius: "0px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={firstImage}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Name + controls */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#111",
            overflow: "hidden",
          }}
        >
          {name}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {/* Quantity dropdown */}
          <CustomDropdown
            options={QTY_OPTIONS}
            value={String(qty)}
            onChange={(val) => onQtyChange(index, parseInt(val))}
          />
          {/* Size dropdown */}
          {sizeOptions.length > 0 && (
            <CustomDropdown
              options={sizeOptions}
              value={sizeOptions[0]}
              onChange={() => {}}
              disabled={isSingleSize}
            />
          )}
          {/* Delete icon */}
          <button
            onClick={() => onRemove(index)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#888",
              display: "flex",
              alignItems: "center",
            }}
            title="Remove item"
          >
            <RiDeleteBinLine className="hover:text-gray-600" />
          </button>
        </div>
      </div>

      {/* Price — pushed to bottom-right same as ModalAddToCart */}
      <div
        style={{
          fontSize: "13px",
          marginTop: "65px",
          color: "#555",
          flexShrink: 0,
        }}
      >
        {parseFloat(itemTotal).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
        })}{" "}
        €
      </div>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────
function OrderSummary({
  items,
  onQtyChange,
  onRemoveItem,
  subtotal,
  totalUnits,
}) {
  const [currentShipping, setCurrentShipping] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentShipping((prev) => (prev + 1) % 3),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  const shippingSlides = [
    { title: "Shipping From France", note: "All orders shipped from Paris" },
    { title: "Free Shipping", note: "Free on all orders over €39" },
    { title: "Complimentary Gift", note: "Free gift pouch with every order" },
  ];

  // Auth check
  const isLoggedIn = (() => {
    try {
      const d = JSON.parse(localStorage.getItem("LoginData") || "null");
      return !!d?.data?.token;
    } catch {
      return false;
    }
  })();

  // ─── CASE 1: Guest Voucher States ────────────────────────────────────────
  const [guestVoucherInput, setGuestVoucherInput] = useState("");
  const [guestVoucherError, setGuestVoucherError] = useState(null);
  const [guestVoucherLoading, setGuestVoucherLoading] = useState(false);
  const [guestApplyHovered, setGuestApplyHovered] = useState(false);
  const [guestPendingPill, setGuestPendingPill] = useState(null);
  const [guestAppliedVoucher, setGuestAppliedVoucher] = useState(null);
  const [guestUsedCodes, setGuestUsedCodes] = useState([]);

  // ─── CASE 2: Logged-in Voucher States ────────────────────────────────────
  const [loggedVoucherInput, setLoggedVoucherInput] = useState(
    () => getVoucherState()?.selectedPill || "",
  );
  const [loggedVoucherError, setLoggedVoucherError] = useState(null);
  const [loggedVoucherLoading, setLoggedVoucherLoading] = useState(false);
  const [loggedApplyHovered, setLoggedApplyHovered] = useState(false);
  const [loggedVoucherApplied, setLoggedVoucherApplied] = useState(
    () => getVoucherState()?.applied || false,
  );
  const [appliedVoucherOff, setAppliedVoucherOff] = useState(
    () => getVoucherState()?.off || 0,
  );
  const [selectedPill, setSelectedPill] = useState(
    () => getVoucherState()?.selectedPill || null,
  );
  const [redeemHovered, setRedeemHovered] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherPills, setVoucherPills] = useState([]);
  const [voucherPoints, setVoucherPoints] = useState(() => {
    const saved = getVoucherState();
    return saved?.voucherPoints !== undefined ? saved.voucherPoints : null;
  });

  // ─── CASE 3: Promo Code States ────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState("");
  const [promoHovered, setPromoHovered] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState("home");
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const deliveryDropdownRef = useRef(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("checkoutPickupLocation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist selected pickup location to localStorage whenever it changes
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    try {
      localStorage.setItem("checkoutPickupLocation", JSON.stringify(loc));
    } catch { /* ignore */ }
  };

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

  // Voucher state sync on mount
  useEffect(() => {
    const saved = getVoucherState();
    if (saved) {
      setLoggedVoucherApplied(saved.applied || false);
      setAppliedVoucherOff(saved.off || 0);
      setSelectedPill(saved.selectedPill || null);
      setLoggedVoucherInput(saved.selectedPill || "");
      if (saved.voucherPoints !== undefined) {
        setVoucherPoints(saved.voucherPoints);
      }
    }
  }, []);

  // Reset voucher state if cart becomes empty
  useEffect(() => {
    if (items.length === 0) {
      removeVoucherState();
      setLoggedVoucherApplied(false);
      setAppliedVoucherOff(0);
      setSelectedPill(null);
      setLoggedVoucherInput("");
      setVoucherPoints(null);
    }
  }, [items.length]);

  // Fetch voucher list
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const loginData = JSON.parse(
          localStorage.getItem("LoginData") || "null",
        );
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
        if (data.status && list) {
          setVoucherPills(list);
          const saved = getVoucherState();
          if (!saved || saved.voucherPoints === undefined) {
            const totalPoints =
              data.data?.total_point !== undefined
                ? Number(data.data.total_point)
                : list.reduce((sum, v) => sum + (v.point || 0), 0);
            setVoucherPoints(totalPoints);
            setVoucherState({ ...(saved || {}), voucherPoints: totalPoints });
          }
        }
      } catch {
        /* silent */
      }
    };
    fetchVouchers();
  }, []);

  // ─── CASE 1 HANDLERS (Guest) ──────────────────────────────────────────────

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

  const handleGuestApply = async () => {
    const code = guestVoucherInput.trim().toUpperCase();
    if (!code) return;

    setGuestVoucherLoading(true);
    setGuestVoucherError(null);
    await new Promise((r) => setTimeout(r, 600));

    if (guestUsedCodes.includes(code)) {
      setGuestVoucherError(
        "This voucher code is invalid or has already been used.",
      );
      setGuestUsedCodes((prev) => prev.filter((c) => c !== code));
      setGuestVoucherInput("");
    } else {
      setGuestUsedCodes((prev) => [...prev, code]);
      setGuestAppliedVoucher(code);
      setGuestVoucherInput("");
      setGuestVoucherError(null);
    }

    setGuestVoucherLoading(false);
  };

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

  // Delivery & totals
  const freeShippingThreshold = 39;
  const totalDiscount =
    (loggedVoucherApplied ? appliedVoucherOff : 0) +
    (appliedPromo ? appliedPromo.off : 0);

  const getDeliveryCost = (method, total) => {
    if (total < 39) return method === "pickup" ? 5.9 : 6.9;
    if (total < 59) return method === "pickup" ? 0 : 6.9;
    return method === "pickup" ? 0 : 2.9;
  };
  const deliveryCost = getDeliveryCost(deliveryMethod, subtotal);
  const isFreeDelivery = deliveryCost === 0;
  const total = Math.max(0, subtotal + deliveryCost - totalDiscount);

  // ─── CASE 1: Guest Voucher Render ────────────────────────────────────────
  const renderGuestVoucherContent = () => (
    <>
      <div
        style={{
          display: "flex",
          border: `1px solid ${loggedVoucherError ? "#e02424" : "#ddd"}`,
          borderRadius: "0px",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}
      >
        <input
          type="text"
          placeholder="Enter Voucher code"
          value={loggedVoucherInput}
          disabled={loggedVoucherApplied}
          onChange={(e) => {
            setLoggedVoucherInput(e.target.value);
            if (loggedVoucherError) setLoggedVoucherError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLoggedApply();
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "11px 14px",
            fontSize: "13px",
            color: loggedVoucherApplied ? "#aaa" : "#111",
            background: loggedVoucherApplied ? "#f9f9f9" : "#fff",
            cursor: loggedVoucherApplied ? "not-allowed" : "text",
            fontFamily: FONT,
          }}
        />
        <button
          onClick={handleLoggedApply}
          disabled={
            !loggedVoucherInput.trim() ||
            loggedVoucherApplied ||
            loggedVoucherLoading
          }
          onMouseEnter={() => {
            if (loggedVoucherInput.trim() && !loggedVoucherApplied)
              setLoggedApplyHovered(true);
          }}
          onMouseLeave={() => setLoggedApplyHovered(false)}
          style={{
            border: "none",
            borderLeft: "1px solid #ddd",
            background:
              !loggedVoucherInput.trim() || loggedVoucherApplied
                ? "#f3f3f3"
                : loggedApplyHovered
                  ? "#111"
                  : "transparent",
            color:
              !loggedVoucherInput.trim() || loggedVoucherApplied
                ? "#aaa"
                : loggedApplyHovered
                  ? "#fff"
                  : "#111",
            padding: "11px 18px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor:
              !loggedVoucherInput.trim() || loggedVoucherApplied
                ? "default"
                : "pointer",
            transition: "background 0.2s, color 0.2s",
            fontFamily: FONT,
          }}
        >
          {loggedVoucherLoading ? "..." : "Apply"}
        </button>
      </div>

      {loggedVoucherError && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginTop: "10px",
            padding: "10px 12px",
            background: "#fdecec",
            border: "1px solid #f5c6c6",
            borderRadius: "0px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0, marginTop: "1px" }}
          >
            <circle cx="12" cy="12" r="11" fill="#e02424" />
            <path
              d="M8 8l8 8M16 8l-8 8"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}>
            {loggedVoucherError}
          </span>
        </div>
      )}

      {loggedVoucherApplied && selectedPill && (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#111",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "0.04em",
                fontFamily: FONT,
              }}
            >
              {selectedPill}
            </span>
            <span
              style={{
                display: "block",
                width: "1px",
                height: "28px",
                background: "rgba(255,255,255,0.25)",
              }}
            />
            <button
              onClick={handleLoggedRemoveVoucher}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <IoClose size={13} />
            </button>
          </div>
        </div>
      )}

      {!loggedVoucherApplied &&
        !loggedVoucherError &&
        !loggedVoucherInput.trim() && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: "12px",
              color: "#888",
              lineHeight: 1.5,
            }}
          >
            You don't have any vouchers or reward points yet. Points are earned
            automatically with every purchase, redeem them for discounts on your
            next order.
          </p>
        )}
    </>
  );

  // ─── CASE 2: Logged-in Voucher Render ────────────────────────────────────
  const renderLoggedVoucherContent = () => {
    const hasVouchers = voucherPills.length > 0;
    return (
      <>
        <div
          style={{
            display: "flex",
            border: `1px solid ${loggedVoucherError ? "#e02424" : "#ddd"}`,
            borderRadius: "0px",
            overflow: "hidden",
            transition: "border-color 0.15s",
          }}
        >
          <input
            type="text"
            placeholder="Enter Voucher code"
            value={loggedVoucherInput}
            disabled={loggedVoucherApplied}
            onChange={(e) => {
              setLoggedVoucherInput(e.target.value);
              if (loggedVoucherError) setLoggedVoucherError(null);
              const match = voucherPills.find((p) => p.name === e.target.value);
              if (match) setSelectedPill(match.name);
              else setSelectedPill(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLoggedApply();
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              padding: "11px 14px",
              fontSize: "13px",
              color: loggedVoucherApplied ? "#aaa" : "#111",
              background: loggedVoucherApplied ? "#f9f9f9" : "#fff",
              cursor: loggedVoucherApplied ? "not-allowed" : "text",
              fontFamily: FONT,
            }}
          />
          <button
            onClick={handleLoggedApply}
            disabled={
              (!selectedPill && !loggedVoucherInput.trim()) ||
              loggedVoucherApplied ||
              loggedVoucherLoading
            }
            onMouseEnter={() => {
              if (
                (selectedPill || loggedVoucherInput.trim()) &&
                !loggedVoucherApplied
              )
                setLoggedApplyHovered(true);
            }}
            onMouseLeave={() => setLoggedApplyHovered(false)}
            style={{
              border: "none",
              borderLeft: "1px solid #ddd",
              background:
                (!selectedPill && !loggedVoucherInput.trim()) ||
                loggedVoucherApplied
                  ? "#f3f3f3"
                  : loggedApplyHovered
                    ? "#111"
                    : "transparent",
              color:
                (!selectedPill && !loggedVoucherInput.trim()) ||
                loggedVoucherApplied
                  ? "#aaa"
                  : loggedApplyHovered
                    ? "#fff"
                    : "#111",
              padding: "11px 18px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor:
                (!selectedPill && !loggedVoucherInput.trim()) ||
                loggedVoucherApplied
                  ? "default"
                  : "pointer",
              transition: "background 0.2s, color 0.2s",
              fontFamily: FONT,
            }}
          >
            {loggedVoucherLoading ? "..." : "Apply"}
          </button>
        </div>

        {selectedPill &&
          !loggedVoucherApplied &&
          voucherPills.some((p) => p.name === selectedPill) && (
            <p
              style={{
                margin: "10px 0 6px",
                fontSize: "12px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              Voucher code added. Click Apply to redeem it.
            </p>
          )}

        {!loggedVoucherApplied && hasVouchers && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            {voucherPills.map((pill) => {
              const code = pill.name;
              const isSelected = selectedPill === code;
              return (
                <div
                  key={pill.id}
                  onClick={() => handlePillClick(code)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: isSelected ? "#111" : "#fff",
                    transition: "background 0.15s",
                    userSelect: "none",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isSelected ? "#fff" : "#111",
                      fontFamily: FONT,
                    }}
                  >
                    {code}
                  </span>
                  {isSelected && (
                    <>
                      <span
                        style={{
                          display: "block",
                          width: "1px",
                          height: "28px",
                          background: "rgba(255,255,255,0.3)",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePillRemove();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 10px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#fff",
                        }}
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

        {/* Points/Redeem — show when user has points (not null and > 0) */}
        {/* {voucherPoints !== null && voucherPoints > 0 && !loggedVoucherError && (
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
                border: "none", borderRadius: "0px", cursor: "pointer",
                transition: "background 0.2s",
                fontFamily: FONT,
              }}
            >
              Redeem
            </button>
          </div>
        )} */}

        {!selectedPill &&
          !loggedVoucherError &&
          !loggedVoucherApplied &&
          !hasVouchers &&
          voucherPoints === 0 && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "12px",
                color: "#888",
                lineHeight: 1.5,
              }}
            >
              You don't have any vouchers or reward points yet. Points are
              earned automatically with every purchase, redeem them for
              discounts on your next order.
            </p>
          )}

        {loggedVoucherError && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginTop: "10px",
              padding: "10px 12px",
              background: "#fdecec",
              border: "1px solid #f5c6c6",
              borderRadius: "4px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0, marginTop: "1px" }}
            >
              <circle cx="12" cy="12" r="11" fill="#e02424" />
              <path
                d="M8 8l8 8M16 8l-8 8"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}
            >
              {loggedVoucherError}
            </span>
          </div>
        )}

        {loggedVoucherApplied && selectedPill && (
          <div style={{ marginTop: "10px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#111",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: FONT,
                }}
              >
                {selectedPill}
              </span>
              <span
                style={{
                  display: "block",
                  width: "1px",
                  height: "28px",
                  background: "rgba(255,255,255,0.25)",
                }}
              />
              <button
                onClick={handleLoggedRemoveVoucher}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <IoClose size={13} />
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
     <div
    style={{
      width: "480px",
      flexShrink: 0,
      flex: 1,
      minHeight: 0,        // ← ZARURI hai flex scroll ke liye
      overflowY: "auto",   // ← poora summary scroll hoga
      background: "#f3f3f3",
      borderRadius: "0px",
      padding: "20px 26px 26px",
      scrollbarWidth: "thin",
      scrollbarColor: "#bbb #f3f3f3",
    }}
  >
      {/* Cart items — 3 cards visible, 4th on scroll */}
      <div
        style={{
           maxHeight: "480px", 
          overflowY: "scroll",
          paddingRight: "6px",
          scrollbarWidth: "thin",
          scrollbarColor: "#bbb #f3f3f3",
        }}
      >
        {items.map((item, idx) => (
          <CartItemRow
            key={idx}
            item={item}
            index={idx}
            onQtyChange={onQtyChange}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Shipping carousel */}
      <div
        style={{
          paddingTop: "16px",
          paddingBottom: "16px",
          borderTop: "1px solid #e5e5e5",
          borderBottom: "1px solid #e5e5e5",
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
                fontFamily: FONT,
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
                fontFamily: FONT,
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
                  border: idx === currentShipping ? "none" : "1px solid #111",
                  background: idx === currentShipping ? "#1F2937" : "#fff",
                  width: idx === currentShipping ? "16px" : "6px",
                  height: "6px",
                  padding: 0,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gift card / promo code — same logic as ModalAddToCart.jsx */}
      <AccordionRow label="Gift card / promo code">
        <div
          style={{
            display: "flex",
            border: `1px solid ${promoError ? "#e02424" : "#ddd"}`,
            borderRadius: "0px",
            overflow: "hidden",
            transition: "border-color 0.15s",
          }}
        >
          <input
            type="text"
            placeholder="Enter your code"
            value={appliedPromo ? appliedPromo.code : promoInput}
            disabled={!!appliedPromo}
            onChange={handlePromoInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePromoApply();
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              padding: "11px 14px",
              fontSize: "13px",
              color: appliedPromo ? "#aaa" : "#111",
              background: appliedPromo ? "#f9f9f9" : "#fff",
              cursor: appliedPromo ? "not-allowed" : "text",
              fontFamily: FONT,
            }}
          />
          <button
            onClick={handlePromoApply}
            disabled={!promoInput.trim() || !!appliedPromo || promoLoading}
            onMouseEnter={() => {
              if (promoInput.trim() && !appliedPromo) setPromoHovered(true);
            }}
            onMouseLeave={() => setPromoHovered(false)}
            style={{
              border: "none",
              borderLeft: "1px solid #ddd",
              background:
                !promoInput.trim() || appliedPromo
                  ? "#f3f3f3"
                  : promoHovered
                    ? "#111"
                    : "transparent",
              color:
                !promoInput.trim() || appliedPromo
                  ? "#aaa"
                  : promoHovered
                    ? "#fff"
                    : "#111",
              padding: "11px 18px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor:
                !promoInput.trim() || appliedPromo ? "default" : "pointer",
              transition: "background 0.2s, color 0.2s",
              fontFamily: FONT,
            }}
          >
            {promoLoading ? "..." : "Apply"}
          </button>
        </div>

        {promoError && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginTop: "10px",
              padding: "10px 12px",
              background: "#fdecec",
              border: "1px solid #f5c6c6",
              borderRadius: "0px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0, marginTop: "1px" }}
            >
              <circle cx="12" cy="12" r="11" fill="#e02424" />
              <path
                d="M8 8l8 8M16 8l-8 8"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{ fontSize: "12px", color: "#c0392b", lineHeight: 1.4 }}
            >
              {promoError}
            </span>
          </div>
        )}

        {appliedPromo && (
          <div style={{ marginTop: "10px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#111",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: FONT,
                }}
              >
                {appliedPromo.code}
              </span>
              <span
                style={{
                  display: "block",
                  width: "1px",
                  height: "28px",
                  background: "rgba(255,255,255,0.25)",
                }}
              />
              <button
                onClick={handleRemovePromo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <IoClose size={13} />
              </button>
            </div>
          </div>
        )}
      </AccordionRow>

      {/* Apply Voucher — same logic as ModalAddToCart.jsx (guest vs logged-in) */}
      <AccordionRow label="Apply Voucher">
        {isLoggedIn
          ? renderLoggedVoucherContent()
          : renderGuestVoucherContent()}
      </AccordionRow>

      {/* Totals — stays at the bottom, just before Confirm Order */}
      <div style={{ padding: "16px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#555",
            fontFamily: FONT,
          }}
        >
          <span>Products ({totalUnits})</span>
          <span>
            {subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        </div>

        {/* Delivery costs static row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#555",
            fontFamily: FONT,
          }}
        >
          <span>Delivery costs</span>
          {subtotal >= freeShippingThreshold ? (
            <span>Free</span>
          ) : (
            <span>5,90 €</span>
          )}
        </div>

        {/* Delivery method selector — same dropdown/logic as ModalAddToCart.jsx */}
        <div style={{ marginBottom: "6px", fontSize: "13px", color: "#555" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div ref={deliveryDropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDeliveryDropdownOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "13px",
                  color: "#555",
                  fontFamily: FONT,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#111";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#555";
                }}
              >
                <span>
                  {deliveryMethod === "home" ? "Home Delivery" : "Pickup Point"}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "5px solid #555",
                    flexShrink: 0,
                    transform: deliveryDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {deliveryDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "0px",
                    zIndex: 1100,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    minWidth: "140px",
                  }}
                >
                  {["home", "pickup"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setDeliveryMethod(opt);
                        setDeliveryDropdownOpen(false);
                        if (opt === "pickup") {
                          // Only open modal if no saved location exists
                          if (!selectedLocation) {
                            setIsLocationModalOpen(true);
                          }
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#111";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        if (deliveryMethod === opt) {
                          e.currentTarget.style.backgroundColor = "#f3f3f3";
                          e.currentTarget.style.color = "#111";
                        } else {
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.color = "#111";
                        }
                      }}
                      style={{
                        padding: "9px 14px",
                        fontSize: "13px",
                        cursor: "pointer",
                        background: deliveryMethod === opt ? "#f3f3f3" : "#fff",
                        color: "#111",
                        fontWeight: deliveryMethod === opt ? 600 : 400,
                        transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      {opt === "home" ? "Home Delivery" : "Pickup Point"}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isFreeDelivery ? (
              <span>Free</span>
            ) : (
              <span>{deliveryCost.toFixed(2).replace(".", ",")} €</span>
            )}
          </div>
        </div>

        {/* Voucher row */}
        {loggedVoucherApplied && selectedPill && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#555" }}>Voucher</span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#f0f0f0",
                  borderRadius: "20px",
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#111",
                    fontFamily: FONT,
                  }}
                >
                  {selectedPill}
                </span>
              </div>
            </div>
            <span style={{ color: "#111", fontWeight: 500 }}>
              -
              {appliedVoucherOff.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          </div>
        )}

        {/* Promo row */}
        {appliedPromo && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#555" }}>Promo Code</span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#111",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "0.04em",
                    fontFamily: FONT,
                  }}
                >
                  {appliedPromo.code}
                </span>
                <span
                  style={{
                    display: "block",
                    width: "1px",
                    height: "22px",
                    background: "rgba(255,255,255,0.25)",
                  }}
                />
                <button
                  onClick={handleRemovePromo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <IoClose size={11} />
                </button>
              </div>
            </div>
            <span style={{ color: "#111", fontWeight: 500 }}>
              -
              {appliedPromo.off.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          </div>
        )}

        {deliveryMethod === "pickup" && (
          <div
            style={{
              marginTop: "8px",
              marginBottom: "12px",
              padding: "12px 14px",
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "4px",
              fontFamily: FONT,
              fontSize: "13px",
            }}
          >
            {selectedLocation ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>{selectedLocation.name}</span>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#888",
                      fontSize: "11px",
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Change
                  </button>
                </div>
                <div 
                  style={{ 
                    fontSize: "11px", 
                    color: "#666", 
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }} 
                  title={selectedLocation.address}
                >
                  {selectedLocation.address}
                </div>
                <div style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}>
                  Lat: {selectedLocation.lat}, Lng: {selectedLocation.lng}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888", fontStyle: "italic", fontSize: "11px" }}>No pickup location selected</span>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  style={{
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: "2px",
                  }}
                >
                  Select Location
                </button>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontSize: "15px",
            fontWeight: 700,
            color: "#111",
            fontFamily: FONT,
          }}
        >
          <span>Total</span>
          <span>
            {total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        </div>
      </div>

      <CreateVoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
      <ModalPickLocation
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Checkout
   ──────────────────────────────────────────────────────────────────────── */

export default function Checkout({ cartItems = [] }) {
  const router = useRouter();
  const paymentSectionRef = useRef(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return !!JSON.parse(localStorage.getItem("LoginData") || "null")?.data?.token; }
    catch { return false; }
  });

  const getLoginData = () => { try { return JSON.parse(localStorage.getItem("LoginData") || "null"); } catch { return null; } };

  // Contact — prefill from localStorage if logged in
  const [email, setEmail] = useState(() => getLoginData()?.data?.email || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState(() => getLoginData()?.data?.name || "");
  const [phone, setPhone] = useState(() => getLoginData()?.data?.phone_number || "");
  const [countryIso2, setCountryIso2] = useState(() => {
    const cc = getLoginData()?.data?.country_code || "";
    if (!cc) return "";
    const clean = cc.replace("+", "");
    const found = defaultCountries.find(c => parseCountry(c).dialCode === clean);
    return found ? parseCountry(found).iso2 : "";
  });

  useEffect(() => {
    const handler = () => {
      const d = getLoginData();
      if (d?.data?.token) {
        setIsLoggedIn(true);
        setEmail(d.data.email || "");
        setLastName(d.data.name || "");
        setPhone(d.data.phone_number || "");
        const cc = (d.data.country_code || "").replace("+", "");
        const found = defaultCountries.find(c => parseCountry(c).dialCode === cc);
        if (found) setCountryIso2(parseCountry(found).iso2);
      }
    };
    window.addEventListener("loginStateChange", handler);
    return () => window.removeEventListener("loginStateChange", handler);
  }, []);

  // Delivery
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");

  // Billing
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [billingCountryIso2, setBillingCountryIso2] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");
  const [billingRegion, setBillingRegion] = useState("");
  const [billingCity, setBillingCity] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (useDifferentBilling) {
      setBillingCountryIso2((v) => v || countryIso2);
      setBillingStreet((v) => v || street);
      setBillingPostcode((v) => v || postcode);
      setBillingRegion((v) => v || region);
      setBillingCity((v) => v || city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDifferentBilling]);

  const handleCountryChange = (iso2) => {
    setCountryIso2(iso2);
    setPhone("");
  };

  const handleExpressSelect = (method) => {
    setPaymentMethod(method);
    paymentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Cart items — localStorage se real data lo, fallback dummy
  const [items, setItems] = useState(() => {
    if (cartItems.length > 0) return cartItems;
    try {
      const stored = JSON.parse(localStorage.getItem("cartData") || "null");
      const list = stored?.cartItem || stored?.cartItems || [];
      if (list.length > 0) return list;
    } catch { /* silent */ }
    return [];
  });

  const handleQtyChange = (index, qty) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, qty, quantity: qty } : it)),
    );
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalUnits = items.reduce((s, i) => s + (i.quantity ?? i.qty ?? 0), 0);
  const subtotal = items.reduce((s, i) => {
    const price =
      i.original_price ||
      parseFloat(String(i.price ?? "0").replace(",", ".")) ||
      0;
    const qty = i.quantity ?? i.qty ?? 0;
    return s + price * qty;
  }, 0);

  const placeOrderBtnStyle = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    cursor: "pointer",
    borderRadius: "2px",
    fontFamily: FONT,
    transition: "background 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        fontFamily: FONT,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          padding: "20px 44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          onClick={() => router.back?.()}
          style={{ cursor: "pointer", display: "inline-block" }}
        >
          <img src="logo.svg" alt="" style={{ height: "40px" }} />
        </div>
        {!isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#333" }}>
            <span>Have an account?</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              style={{
                padding: "8px 16px", background: "#FAFAFA",
                border: "1px solid #F0EEEE", fontSize: "12px",
                fontWeight: 600, color: "#111", cursor: "pointer", fontFamily: FONT,
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px",
            border: "1px solid #F0EEEE", background: "#FAFAFA",
          }}>
            <FaRegUser size={16} color="#111" />
          </div>
        )}
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex: 1 }}>
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
            {/* Express Payment — kept, expanded to 4 methods */}
            <ExpressPaymentBar selectedMethod={paymentMethod} onSelect={handleExpressSelect} />

            {/* Contact details */}
            <Section title="Contact Details">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <FieldBox
                  label="Email *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                 
                  <FieldBox
                    label="Full Name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <PhoneFieldBox
                  iso2={countryIso2 || "fr"}
                  onCountryChange={handleCountryChange}
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </Section>

            {/* Delivery */}
            <Section title="Delivery">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <CountryFieldBox
                  iso2={countryIso2}
                  onChange={handleCountryChange}
                />
                <FieldBox
                  label="Full address *"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <FieldBox
                    label="Postcode *"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <FieldBox
                    label="State"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <FieldBox
                    label="Town/city *"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <Checkbox
                  checked={useDifferentBilling}
                  onChange={setUseDifferentBilling}
                  label="Use a different billing address?"
                />
              </div>
            </Section>

            {/* Billing address — only visible when checkbox checked */}
            {useDifferentBilling && (
              <Section title="Billing Address">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <CountryFieldBox
                    iso2={billingCountryIso2 || countryIso2}
                    onChange={setBillingCountryIso2}
                  />
                  <FieldBox
                    label="Full address *"
                    value={billingStreet}
                    onChange={(e) => setBillingStreet(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "12px" }}>
                    <FieldBox
                      label="Postcode *"
                      value={billingPostcode}
                      onChange={(e) => setBillingPostcode(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <FieldBox
                      label="State"
                      value={billingRegion}
                      onChange={(e) => setBillingRegion(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <FieldBox
                      label="Town/city *"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* Payment */}
            <div ref={paymentSectionRef}>
              <Section title="Payment">
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <PaymentMethodRow
                    active={paymentMethod === "card"}
                    onSelect={() => setPaymentMethod("card")}
                    label="Credit card"
                    right={<CardBrandIcons />}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
                      <div style={{ border: "1px solid #ddd", borderRadius: "3px", background: "#fff", overflow: "hidden" }}>
                        <CardNumberField value={cardNumber} onChange={setCardNumber} />
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <FieldBox label="Expiration date" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ flex: 1 }} />
                        <FieldBox label="CVC/CVV" value={cvc} onChange={(e) => setCvc(e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                  </PaymentMethodRow>

                  <PaymentMethodRow
                    active={paymentMethod === "googlepay"}
                    onSelect={() => setPaymentMethod("googlepay")}
                    label="Google Pay"
                    right={<GooglePayBadge />}
                  />
                  <PaymentMethodRow
                    active={paymentMethod === "applepay"}
                    onSelect={() => setPaymentMethod("applepay")}
                    label="Apple Pay"
                    right={<ApplePayBadge />}
                  />
                  <PaymentMethodRow
                    last
                    active={paymentMethod === "paypal"}
                    onSelect={() => setPaymentMethod("paypal")}
                    label="PayPal"
                    right={<PayPalBadge />}
                  />
                </div>

                <p
                  style={{
                    fontSize: "12.5px",
                    color: "#888",
                    margin: "16px 0 8px",
                    lineHeight: 1.6,
                    fontFamily: FONT,
                  }}
                >
                  Your payment is processed securely through Stripe and your
                  card details are never stored on our servers. All transactions
                  are encrypted end-to-end.
                </p>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "#888",
                    margin: 0,
                    lineHeight: 1.6,
                    fontFamily: FONT,
                  }}
                >
                  We respect your privacy. Your personal information is only
                  used to deliver your order, nothing more, nothing less. Read
                  our{" "}
                  <a
                    href="#"
                    style={{
                      color: "#111",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    privacy policy
                  </a>{" "}
                  to learn more.
                </p>
              </Section>
            </div>

            {/* ── Left: Place Order button ── */}
            <button
              style={placeOrderBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
            >
              Confirm Order
            </button>
          </div>

          <div style={{ 
  width: "480px", 
  flexShrink: 0, 
  position: "sticky", 
  top: "80px",
 maxHeight: "calc(100vh - 80px - 40px)", 
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}}>
  <OrderSummary
    items={items}
    onQtyChange={handleQtyChange}
    onRemoveItem={handleRemoveItem}
    subtotal={subtotal}
    totalUnits={totalUnits}
  />
  <button
    style={{
      flexShrink: 0,
      width: "100%",
      padding: "15px",
      backgroundColor: "#111",
      color: "#fff",
      border: "none",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.1em",
      cursor: "pointer",
      borderRadius: "2px",
      fontFamily: FONT,
      transition: "background 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
  >
    Confirm Order
  </button>
</div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
