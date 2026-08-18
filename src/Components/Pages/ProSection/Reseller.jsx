"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlagImage, defaultCountries, parseCountry } from "react-international-phone";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import toast from "react-hot-toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getPhoneValidationErrorCode } from "../../../utils/phoneValidation";

// Ported 1:1 from the "contact distributeurs & revendeurs" reseller mockup —
// same fonts/colors/layout, scoped to this component via styled-jsx so it
// never leaks into (or gets overridden by) the site's global Tailwind/Inter
// styles. The mockup's own promo-bar/site-header/site-footer markup is
// dropped in favor of the site's real Navbar/Footer, same as ProSection.jsx.
//
// NOTE: the two form sections used to be native <details> elements. Native
// <details> cannot be height-animated, so they are now plain divs driven by
// `openIndex` state with a grid-template-rows 0fr -> 1fr transition, which
// gives a real slide-down / slide-up. Only one section is open at a time and
// section 01 (Company & contact) is open on first render.

// Only the stable identifiers live in code — their labels are translated
// (reseller.businessTypeOptions/salesChannelOptions/interests) and read via
// t() at render time so the option text follows the active language.
const INTEREST_VALUES = [
  "biogance-dogs-cats",
  "biogance-small-pets-birds-reptiles",
  "organissime",
  "biospotix",
  "ekinat",
  "gamme-pro",
];

// Maps getPhoneValidationErrorCode's return value to a reseller.json
// errors.* key — same codes CheckOut.jsx and UserProfile.jsx map through
// their own translation files.
const PHONE_ERROR_KEYS = {
  required: "errors.phoneRequired",
  tooShort: "errors.phoneTooShort",
  tooLong: "errors.phoneTooLong",
  invalid: "errors.phoneInvalid",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function useSplashMedia(key) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const read = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem("splashData") || "null");
        setData(parsed?.[key] ?? null);
      } catch {
        /* silent */
      }
    };
    read();
    window.addEventListener("splashDataReady", read);
    return () => window.removeEventListener("splashDataReady", read);
  }, [key]);
  return data;
}

function SplashMedia({ data }) {
  const [loaded, setLoaded] = useState(false);
  const rawPath = data?.media || (Array.isArray(data?.images) && data.images.length > 0 ? data.images[0] : null);
  if (!rawPath) return null;
  const mediaStr = typeof rawPath === "string" ? rawPath : (rawPath?.media || rawPath?.url || "");
  if (!mediaStr) return null;
  const src = mediaStr.startsWith("http") ? mediaStr : `${MEDIA_URL}${mediaStr}`;
  const isVideo = data?.media_type === "video" || mediaStr.match(/\.(mp4|webm|ogg|mov)$/i);
  const mediaStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.5s ease",
    objectFit: "cover",
  };
  return (
    <>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(0,0,0,.15)",
              borderTopColor: "#000",
              borderRadius: "50%",
              animation: "pro-media-spin 0.8s linear infinite",
            }}
          />
        </div>
      )}
      {isVideo ? (
        <video
          className="pro-splash-media"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
          style={mediaStyle}
        />
      ) : (
        <img className="pro-splash-media" src={src} alt="" onLoad={() => setLoaded(true)} style={mediaStyle} />
      )}
    </>
  );
}

const getDialCodeByIso2 = (iso2) => {
  const country = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
  return country ? `+${parseCountry(country).dialCode}` : "";
};

// Same flag + dial-code dropdown design as the phone field on the account
// profile page (src/Components/Pages/MyAccount/UserProfile.jsx's
// PhoneFieldBox), ported here so both phone inputs share one look.
function PhoneFieldBox({ iso2, onCountryChange, value, onChange, onBlur, required, onInvalid }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const dialCode = getDialCodeByIso2(iso2 || "fr");

  const filteredCountries = defaultCountries
    .map((c) => parseCountry(c))
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.dialCode.includes(q);
    });

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`phone-field-box relative flex items-stretch bg-gray-50 border transition-colors ${
        focused ? "border-gray-400 ring-2 ring-gray-400" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="phone-country-button flex items-center gap-1.5 px-3 h-[48px] border-r border-gray-200 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <FlagImage iso2={iso2 || "fr"} size="20px" />
        <span className="text-sm text-gray-700">{dialCode}</span>
        <MdOutlineKeyboardArrowDown
          className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          size={16}
        />
      </button>

      <div className="relative flex-1">
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="555 777 888"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onInvalid={onInvalid}
          className="phone-number-input w-full h-[48px] px-4 bg-transparent focus:outline-none text-gray-900 text-sm"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-lg z-20">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="phone-search-input w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400 text-center">No country found</p>
            ) : (
              filteredCountries.map((p) => (
                <button
                  key={p.iso2}
                  type="button"
                  onClick={() => {
                    onCountryChange(p.iso2);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`group w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-900 hover:bg-black hover:text-white transition-colors cursor-pointer ${
                    p.iso2 === iso2 ? "bg-gray-100" : ""
                  }`}
                >
                  <FlagImage iso2={p.iso2} size="18px" />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-gray-400 group-hover:text-gray-300">+{p.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function progressLabel(t, percent) {
  if (percent === 100) return t("progress.ready");
  if (percent >= 75) return t("progress.almost");
  if (percent >= 45) return t("progress.good");
  if (percent > 0) return t("progress.started");
  return t("progress.start");
}

export default function Reseller() {
  const { t } = useTranslation("reseller");
  const headerMedia = useSplashMedia("reseller_header");
  const footerMedia = useSplashMedia("reseller_footer");
  const pdfData = useSplashMedia("reseller_pdf");
  const catalogueFilename = "biogance-reseller-catalogue.pdf";
  // Routed through the same-origin /api/download-file proxy rather than a
  // direct link to MEDIA_URL (CloudFront): a cross-origin <a download>
  // is silently ignored by browsers, so it just opens the PDF in a new tab
  // instead of downloading it. The proxy fetches it server-side and replies
  // with Content-Disposition: attachment, so the plain <a download> below
  // works natively. The static /public fallback is already same-origin, so
  // it's used directly without going through the proxy.
  const catalogueUrl = pdfData?.media
    ? `/api/download-file?${new URLSearchParams({ path: pdfData.media, filename: catalogueFilename }).toString()}`
    : "/biogance-professional-catalogue.pdf";

  const [fields, setFields] = useState({
    company: "",
    businessType: "",
    vat: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    salesChannel: "",
    market: "",
  });
  const [interests, setInterests] = useState({});
  const [privacy, setPrivacy] = useState(false);
  const [phoneIso2, setPhoneIso2] = useState("fr");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Section 01 open by default.
  const [openIndex, setOpenIndex] = useState(0);
  const accordionRefs = useRef([]);

  // "Apply now" / "Download catalogue" are plain #hash anchors — without
  // this they jump instantly, same pattern as ProSection.jsx.
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  // Default the phone dial-code to the visitor's own country on first load,
  // same /api/visitor-locale geoip lookup CheckOut.jsx uses — falls back to
  // the "fr" default above if it fails. Never overrides a country the user
  // already picked themselves (phoneCountryEditedRef).
  const phoneCountryEditedRef = useRef(false);
  useEffect(() => {
    let cancelled = false;

    const applyDetectedCountry = (code) => {
      if (cancelled || phoneCountryEditedRef.current) return;
      const matched = defaultCountries.find((c) => parseCountry(c).iso2 === code);
      if (matched) setPhoneIso2(code);
    };

    const cached = sessionStorage.getItem("_visitorCountry");
    if (cached) {
      applyDetectedCountry(cached);
      return;
    }

    // Firefox ETP / uBlock can block fetch() to same-origin API routes with
    // geo-related path segments — XHR goes through a different pipeline and
    // isn't caught by the same filter lists (same fallback as CheckOut.jsx).
    const fetchLocaleViaXhr = () =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/visitor-locale", true);
        xhr.timeout = 5000;
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid JSON"));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("XHR network error"));
        xhr.ontimeout = () => reject(new Error("XHR timeout"));
        xhr.send();
      });

    (async () => {
      try {
        let data;
        try {
          const res = await fetch("/api/visitor-locale", { credentials: "same-origin" });
          data = await res.json();
        } catch {
          data = await fetchLocaleViaXhr();
        }
        const code = (data?.countryCode || "").toLowerCase();
        if (!code) return;
        try {
          sessionStorage.setItem("_visitorCountry", code);
        } catch {
          /* ignore */
        }
        applyDetectedCountry(code);
      } catch {
        /* silent — the "fr" default still applies */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (name) => (e) => {
    setFields((prev) => ({ ...prev, [name]: e.target.value }));
    // Clear that field's error the moment the user starts fixing it, rather
    // than making them re-submit before the red border/message goes away.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  // Validates the phone number's digit count and leading-digit pattern
  // against whichever country is currently selected — same
  // libphonenumber-js-backed check CheckOut.jsx and UserProfile.jsx use.
  // Returns true when valid.
  const validatePhone = () => {
    const code = getPhoneValidationErrorCode(fields.phone, phoneIso2 || "fr");
    setErrors((prev) => ({ ...prev, phone: code ? t(PHONE_ERROR_KEYS[code]) : "" }));
    return !code;
  };
  const toggleInterest = (value) => () =>
    setInterests((prev) => ({ ...prev, [value]: !prev[value] }));

  const anyInterestChecked = Object.values(interests).some(Boolean);

  // Mirrors the mockup's trackedGroups()/isGroupComplete()/completionFor():
  // each entry below is one "required group" — text/select fields complete
  // when non-empty (and, for email, format-valid), the interests checkboxes
  // count as a single group complete when any one is checked.
  const step0Complete = [
    fields.company.trim().length > 0,
    fields.businessType.trim().length > 0,
    fields.vat.trim().length > 0,
    isValidEmail(fields.email),
    fields.phone.trim().length > 0,
  ];
  const step0Percent = Math.round(
    (step0Complete.filter(Boolean).length / step0Complete.length) * 100
  );
  const step1Percent = anyInterestChecked ? 100 : 0;

  const overallComplete = [...step0Complete, anyInterestChecked, privacy];
  const overallPercent = Math.round(
    (overallComplete.filter(Boolean).length / overallComplete.length) * 100
  );

  // Single source of truth for both the tabs and the accordions: clicking
  // either one toggles the same `openIndex`, so only one panel is ever open.
  // Just toggles in place — no auto-scroll, so switching tabs doesn't yank
  // the page away from wherever the user was looking.
  const handleStepClick = (index) => () => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom validation instead of native `required` — the 5 fields below
    // no longer carry the `required` attribute (see their JSX), so this is
    // the only thing gating submission for them, and it drives the red
    // border/message UI instead of the browser's own validation popup.
    const newErrors = {};
    if (!fields.company.trim()) newErrors.company = t("errors.company");
    if (!fields.businessType.trim()) newErrors.businessType = t("errors.businessType");
    if (!fields.vat.trim()) newErrors.vat = t("errors.vat");
    if (!fields.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!isValidEmail(fields.email)) {
      newErrors.email = t("errors.emailInvalid");
    }
    const phoneErrorCode = getPhoneValidationErrorCode(fields.phone, phoneIso2 || "fr");
    if (phoneErrorCode) newErrors.phone = t(PHONE_ERROR_KEYS[phoneErrorCode]);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // All 5 required fields live in accordion step 0 — make sure it's
      // open so the red-bordered fields are actually visible.
      setOpenIndex(0);
      setTimeout(() => {
        accordionRefs.current[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 140);
      return;
    }

    // country_code: dial code alone ("+33"). phone: the raw number alone.
    // phone_number: the two combined — same three pieces ResellerPro.jsx
    // sends, just under swapped phone/phone_number names.
    const dialCode = getDialCodeByIso2(phoneIso2);
    const interestValue = INTEREST_VALUES.filter((value) => interests[value])
      .map((value) => t(`interests.${value}`))
      .join(",");

    try {
      setIsSubmitting(true);
      const res = await fetch(`${BASE_URL}/app/reseller`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: fields.company,
          name: fields.company,
          email: fields.email,
          country_code: dialCode,
          phone: fields.phone,
          phone_number: `${dialCode}${fields.phone}`,
          country: fields.country,
          website: fields.website,
          job_title: fields.businessType,
          register_number: fields.vat,
          reseller: fields.salesChannel,
          message: fields.market,
          interest: interestValue,
        }),
      });
      const data = await res.json();
    
      if (data.status === false || data.status === "false" || !res.ok) {
        const msg =
          data.errors?.length > 0
            ? data.errors[0].message
            : data.action || data.title || t("errors.genericSubmit");
       
        const toastId = toast.error(msg);
       
        return;
      }

      setShowSuccessModal(true);
      document.body.style.overflow = "hidden";
      setFields({
        company: "",
        businessType: "",
        vat: "",
        email: "",
        phone: "",
        country: "",
        website: "",
        salesChannel: "",
        market: "",
      });
      setInterests({});
      setPrivacy(false);
      setErrors({});
    } catch (err) {
      console.error("Reseller form error:", err);
      toast.error(t("errors.genericSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      {/* Rendered outside .reseller-landing on purpose: that wrapper sets its
          own font-family/color via CSS custom properties below, and since
          Navbar is a real child component (not styled-jsx-scoped content),
          those properties would otherwise inherit straight into Navbar's
          own text through normal CSS inheritance, overriding its intended
          site-wide styling. */}
      <Navbar bgWhite={true} />

      {showSuccessModal && (
        <div
          onClick={() => closeSuccessModal()}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
            animation: "smBackdropIn 0.3s ease both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              maxWidth: "480px", width: "100%",
              padding: "0",
              position: "relative",
              animation: "smPopIn 0.4s cubic-bezier(0.34,1.45,0.64,1) both",
              overflow: "hidden",
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: "4px", background: "#111" }} />

            <div style={{ padding: "44px 40px 40px" }}>
              {/* Icon */}
              <div style={{
                width: "56px", height: "56px",
                border: "1px solid #111",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "28px",
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 11.5L8.5 17L19 6" stroke="#111" strokeWidth="1.8" strokeLinecap="square"/>
                </svg>
              </div>

              <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#888", margin: "0 0 12px" }}>
                {t("successModal.eyebrow")}
              </p>
              <h2 style={{
                margin: "0 0 16px",
                fontSize: "clamp(28px,5vw,38px)",
                lineHeight: 1, letterSpacing: "-0.055em",
                fontWeight: 700, textTransform: "uppercase", color: "#111",
              }}>
                {t("successModal.titleLine1")}<br />{t("successModal.titleLine2")}
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: "14px", lineHeight: 1.75, color: "#555" }}>
                {t("successModal.message")}
              </p>

              <div style={{
                borderTop: "1px solid #e8e8e4",
                paddingTop: "24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
              }}>
                <div style={{ padding: "16px", background: "#f8f8f6", borderLeft: "2px solid #111" }}>
                  <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>{t("successModal.nextStepLabel")}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: "#111" }}>{t("successModal.nextStepValue")}</p>
                </div>
                <div style={{ padding: "16px", background: "#f8f8f6", borderLeft: "2px solid #111" }}>
                  <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>{t("successModal.responseTimeLabel")}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: "#111" }}>{t("successModal.responseTimeValue")}</p>
                </div>
              </div>

              <button
                onClick={() => closeSuccessModal()}
                style={{
                  marginTop: "28px", width: "100%",
                  height: "48px", background: "#111", color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
                  fontWeight: 700, fontFamily: "inherit",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#000"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#111"}
              >
                {t("successModal.close")}
              </button>
            </div>

            <style>{`
              @keyframes smBackdropIn { from { opacity: 0 } to { opacity: 1 } }
              @keyframes smPopIn { from { opacity: 0; transform: scale(0.88) translateY(16px) } to { opacity: 1; transform: scale(1) translateY(0) } }
            `}</style>
          </div>
        </div>
      )}

      <div className="reseller-landing">
      <div className="reseller-page-offset">
        <main>
          {/* HERO */}
          <section className="hero" id="top">
            <div className="hero-grid">
              <div className="hero-copy">
                <div>
                  <span className="eyebrow">{t("hero.eyebrow")}</span>
                  <h1 style={{ marginTop: "20px", lineHeight: "1" }} className="hero-title">
                    {t("hero.titleLine1")}
                    <br />
                    {t("hero.titleLine2")}
                    <br />
                    {t("hero.titleLine3")}
                  </h1>
                  <p className="hero-text">{t("hero.text")}</p>
                  <div className="hero-actions">
                    <a style={{ color: "white", hover: { color: "black" } }} className="btn" href="#application">
                      {t("hero.applyNow")}
                    </a>
                    <a className="btn secondary" href={catalogueUrl} download={catalogueFilename}>
                      {t("hero.downloadCatalogue")}
                    </a>
                  </div>
                </div>

                <div className="hero-note" aria-label="Reseller benefits">
                  {t("hero.notes", { returnObjects: true }).map((note) => (
                    <div key={note.title}>
                      <strong>{note.title}</strong>
                      <span>{note.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`hero-visual${headerMedia?.media || (headerMedia?.images && headerMedia.images.length > 0) ? " has-media" : ""}`} aria-label="Natural pet care visual placeholder">
                <SplashMedia data={headerMedia} />
                <div className="glass-card">
                  <h2>{t("hero.glassCard.title")}</h2>
                  <p>{t("hero.glassCard.text")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* PROOF STRIP */}
          <section className="proof-strip" aria-label="Biogance professional proof points">
            <div className="proof-inner">
              {t("proof.items", { returnObjects: true }).map((item) => (
                <div className="proof-item" key={item.label}>
                  <span className="proof-value">{item.value}</span>
                  <span className="proof-label">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* EXPERIENCE */}
          <section className="section" id="professional-care">
            <div className="section-header">
              <div>
                <span className="eyebrow">{t("experience.eyebrow")}</span>
                <h2 style={{ marginTop: "20px", lineHeight: "1" }} className="section-title">
                  {t("experience.titleLine1")}
                  <br />
                  {t("experience.titleLine2")}
                  <br />
                  {t("experience.titleLine3")}
                </h2>
              </div>
              <p className="section-copy">{t("experience.copy")}</p>
            </div>

            <div className="experience-grid">
              {t("experience.cards", { returnObjects: true }).map((card) => (
                <article className="experience-card" key={card.step}>
                  <div>
                    <span className="card-number">{card.step}</span>
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </div>
                  <span className="card-line" />
                </article>
              ))}
            </div>
          </section>

          {/* FORM */}
          <section className="form-section" id="application">
            <div className="form-shell">
              <aside className="form-aside">
                <span className="eyebrow">{t("form.aside.eyebrow")}</span>
                <h2 style={{ marginTop: "20px" }}>{t("form.aside.title")}</h2>
                <p>{t("form.aside.intro")}</p>

                <ul className="process-list">
                  {t("form.aside.process", { returnObjects: true }).map((item, index) => (
                    <li key={item.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="form-note">{t("form.aside.note")}</div>

                <div className="completion-card" aria-live="polite">
                  <div className="completion-row">
                    <b>{overallPercent}%</b>
                    <span>{t("form.aside.completed")}</span>
                  </div>
                  <div className="completion-meter" aria-hidden="true">
                    <span style={{ width: `${overallPercent}%` }} />
                  </div>
                  <p className="completion-label">{progressLabel(t, overallPercent)}</p>
                </div>
              </aside>

              <form action="#" method="post" onSubmit={handleSubmit}>
                <div className="form-progress" aria-label="Application sections">
                  <button
                    type="button"
                    className={`progress-step${openIndex === 0 ? " active" : ""}${
                      step0Percent === 100 ? " is-complete" : ""
                    }`}
                    aria-expanded={openIndex === 0}
                    onClick={handleStepClick(0)}
                  >
                    {t("form.steps.companyContact")}
                  </button>
                  <button
                    type="button"
                    className={`progress-step${openIndex === 1 ? " active" : ""}${
                      step1Percent === 100 ? " is-complete" : ""
                    }`}
                    aria-expanded={openIndex === 1}
                    onClick={handleStepClick(1)}
                  >
                    {t("form.steps.businessNeeds")}
                  </button>
                </div>

                <div className="progress-overview" aria-live="polite">
                  <div className="progress-overview-head">
                    <span>{t("form.overview.label")}</span>
                    <strong>{overallPercent}{t("form.overview.completedSuffix")}</strong>
                  </div>
                  <div className="progress-overview-meter" aria-hidden="true">
                    <span style={{ width: `${overallPercent}%` }} />
                  </div>
                </div>

                {/* ACCORDION 01 */}
                <div
                  className={`form-accordion${step0Percent === 100 ? " is-complete" : ""}${
                    openIndex === 0 ? " is-open" : ""
                  }`}
                  data-accordion-step="0"
                  ref={(el) => (accordionRefs.current[0] = el)}
                >
                  <button
                    type="button"
                    className="accordion-summary"
                    aria-expanded={openIndex === 0}
                    onClick={handleStepClick(0)}
                  >
                    <span className="summary-title">
                      <small>01</small>{t("form.accordion1.summaryTitle")}
                    </span>
                    <em className="accordion-status">{step0Percent}{t("form.percentCompleteSuffix")}</em>
                  </button>

                  <div className="accordion-body">
                    <div className="accordion-body-inner">
                      <fieldset>
                        <legend>
                          {t("form.accordion1.legend")} <span>{t("form.accordion1.required")}</span>
                        </legend>
                        <div className="form-grid">
                          <div className={`field full${errors.company ? " has-error" : ""}`}>
                            <label htmlFor="company">
                              <span>
                                <b className="req">*</b> {t("form.accordion1.company.label")}
                              </span>
                            </label>
                            <input
                              id="company"
                              name="company"
                              type="text"
                              placeholder={t("form.accordion1.company.placeholder")}
                              value={fields.company}
                              onChange={setField("company")}
                            />
                            {errors.company && <p className="field-error">{errors.company}</p>}
                          </div>
                          <div className={`field${errors.businessType ? " has-error" : ""}`}>
                            <label htmlFor="business-type">
                              <span>
                                <b className="req">*</b> {t("form.accordion1.businessType.label")}
                              </span>
                            </label>
                            <select
                              id="business-type"
                              name="business-type"
                              value={fields.businessType}
                              onChange={setField("businessType")}
                            >
                              <option value="">{t("form.accordion1.businessType.placeholder")}</option>
                              {t("businessTypeOptions", { returnObjects: true }).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                            {errors.businessType && <p className="field-error">{errors.businessType}</p>}
                          </div>
                          <div className={`field${errors.vat ? " has-error" : ""}`}>
                            <label htmlFor="vat">
                              <span>
                                <b className="req">*</b> {t("form.accordion1.vat.label")}
                              </span>
                            </label>
                            <input
                              id="vat"
                              name="vat"
                              type="text"
                              placeholder={t("form.accordion1.vat.placeholder")}
                              value={fields.vat}
                              onChange={setField("vat")}
                            />
                            {errors.vat && <p className="field-error">{errors.vat}</p>}
                          </div>
                          <div className={`field${errors.email ? " has-error" : ""}`}>
                            <label htmlFor="email">
                              <span>
                                <b className="req">*</b> {t("form.accordion1.email.label")}
                              </span>
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              placeholder={t("form.accordion1.email.placeholder")}
                              value={fields.email}
                              onChange={setField("email")}
                            />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                          </div>
                          <div className={`field${errors.phone ? " has-error" : ""}`}>
                            <label htmlFor="phone">
                              <span>
                                <b className="req">*</b> {t("form.accordion1.phone.label")}
                              </span>
                            </label>
                            <PhoneFieldBox
                              iso2={phoneIso2}
                              onCountryChange={(iso2) => {
                                phoneCountryEditedRef.current = true;
                                setPhoneIso2(iso2);
                                setErrors((prev) => (prev.phone ? { ...prev, phone: "" } : prev));
                              }}
                              value={fields.phone}
                              onChange={(phone) => {
                                setFields((prev) => ({ ...prev, phone }));
                                setErrors((prev) => (prev.phone ? { ...prev, phone: "" } : prev));
                              }}
                              onBlur={validatePhone}
                            />
                            {errors.phone && <p className="field-error">{errors.phone}</p>}
                          </div>
                          <div className="field">
                            <label htmlFor="country">
                              <span>{t("form.accordion1.country.label")}</span>
                            </label>
                            <input
                              id="country"
                              name="country"
                              type="text"
                              placeholder={t("form.accordion1.country.placeholder")}
                              value={fields.country}
                              onChange={setField("country")}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="website">
                              <span>{t("form.accordion1.website.label")}</span>
                            </label>
                            <input
                              id="website"
                              name="website"
                              type="url"
                              placeholder={t("form.accordion1.website.placeholder")}
                              value={fields.website}
                              onChange={setField("website")}
                            />
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>

                {/* ACCORDION 02 */}
                <div
                  className={`form-accordion${step1Percent === 100 ? " is-complete" : ""}${
                    openIndex === 1 ? " is-open" : ""
                  }`}
                  data-accordion-step="1"
                  ref={(el) => (accordionRefs.current[1] = el)}
                >
                  <button
                    type="button"
                    className="accordion-summary"
                    aria-expanded={openIndex === 1}
                    onClick={handleStepClick(1)}
                  >
                    <span className="summary-title">
                      <small>02</small>{t("form.accordion2.summaryTitle")}
                    </span>
                    <em className="accordion-status">{step1Percent}{t("form.percentCompleteSuffix")}</em>
                  </button>

                  <div className="accordion-body">
                    <div className="accordion-body-inner">
                      <fieldset>
                        <legend>
                          {t("form.accordion2.legend")} <span>{t("form.accordion1.required")}</span>
                        </legend>
                        <div className="form-grid">
                          <div className="field">
                            <label htmlFor="sales-channel">
                              <span>{t("form.accordion2.salesChannel.label")}</span>
                            </label>
                            <select
                              id="sales-channel"
                              name="sales-channel"
                              value={fields.salesChannel}
                              onChange={setField("salesChannel")}
                            >
                              <option value="">{t("form.accordion2.salesChannel.placeholder")}</option>
                              {t("salesChannelOptions", { returnObjects: true }).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <label htmlFor="market">
                              <span>{t("form.accordion2.market.label")}</span>
                            </label>
                            <input
                              id="market"
                              name="market"
                              type="text"
                              placeholder={t("form.accordion2.market.placeholder")}
                              value={fields.market}
                              onChange={setField("market")}
                            />
                          </div>
                          <div className="field full">
                            <label>
                              {t("form.accordion2.interests.label")} <em>{t("form.accordion2.interests.hint")}</em>
                            </label>
                            <div className="checkbox-grid">
                              {INTEREST_VALUES.map((value) => (
                                <label className="checkbox-card" key={value}>
                                  <input
                                    type="checkbox"
                                    name="interests"
                                    value={value}
                                    checked={!!interests[value]}
                                    onChange={toggleInterest(value)}
                                  />{" "}
                                  {t(`interests.${value}`)}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>

                <label className="consent-box">
                  <input
                    type="checkbox"
                    name="privacy"
                    required
                    checked={privacy}
                    onChange={() => setPrivacy((prev) => !prev)}
                  />
                  <span>{t("form.consent")}</span>
                </label>

                <div className="form-actions">
                  <p className="secure-note">{t("form.actions.secureNote")}</p>
                  <button style={{fontSize:"10px"}} className="btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t("form.actions.submitting") : t("form.actions.submit")}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* CATALOGUE */}
          <section className="catalogue-band" id="catalogue">
            <div className="catalogue-inner">
              <div className="catalogue-copy">
                <span className="eyebrow">{t("catalogue.eyebrow")}</span>
                <h2 style={{marginTop:"20px", lineHeight:"1"}}>{t("catalogue.title")}</h2>
                <p>{t("catalogue.text")}</p>
                <a className="btn white" href={catalogueUrl} download={catalogueFilename}>
                  {t("catalogue.cta")}
                </a>
                <div className="catalogue-tags" aria-label="Catalogue contents">
                  {t("catalogue.tags", { returnObjects: true }).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className={`catalogue-preview${footerMedia?.media || (footerMedia?.images && footerMedia.images.length > 0) ? " has-media" : ""}`} aria-label="Catalogue preview placeholder">
                <SplashMedia data={footerMedia} />
                
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />

      <style jsx>{`
        .reseller-landing {
          --black: #111111;
          --ink: #1d1d1d;
          --charcoal: #2a2a2a;
          --white: #ffffff;
          --paper: #f8f8f6;
          --soft: #f1f1ee;
          --soft-2: #e9e9e5;
          --line: #d7d7d3;
          --line-soft: #e7e7e2;
          --muted: #707070;
          --muted-2: #9a9a9a;
          --sage: #edf1eb;
          --green: #5d7a62;
          --max: 1440px;
          --sans: Arial, Helvetica, sans-serif;

          overflow-x: hidden;
          font-family: var(--sans);
          color: var(--ink);
          background: var(--paper);
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }
        .reseller-landing :global(a) {
          color: inherit;
          text-decoration: none;
        }
        .reseller-landing p,
        .reseller-landing h1,
        .reseller-landing h2,
        .reseller-landing h3 {
          margin-top: 0;
        }
        .reseller-landing img {
          display: block;
          max-width: 100%;
        }
        .reseller-landing button,
        .reseller-landing input,
        .reseller-landing select,
        .reseller-landing textarea {
          font-family: inherit;
        }

        /* Navbar is fixed (104px desktop / 64px mobile) — same offset used
           across the rest of the site (see ProSection.jsx etc). */
        .reseller-page-offset {
          padding-top: 104px;
        }
        @media (max-width: 1023px) {
          .reseller-page-offset {
            padding-top: 64px;
          }
        }
        #application,
        #catalogue {
          scroll-margin-top: 104px;
        }
        @media (max-width: 1023px) {
          #application,
          #catalogue {
            scroll-margin-top: 64px;
          }
        }

        /* BASIC COMPONENTS */
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .eyebrow::before {
          content: "";
          width: 30px;
          height: 1px;
          background: var(--ink);
          opacity: 0.75;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 30px;
          border: 1px solid var(--ink);
          background: var(--ink);
          color: var(--white);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease,
            transform 0.2s ease;
        }
       .btn:hover {
  background: transparent !important;
  color: #000 !important;
  border-color: #000 !important;
}
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn:disabled:hover {
          background: var(--ink) !important;
          color: var(--white) !important;
          border-color: var(--ink) !important;
        }
        .btn.secondary {
          background: transparent;
          color: var(--ink);
        }
        .btn.secondary:hover {
          background: black !important;
          color: white !important;
        }
        .btn.white {
          background: var(--white);
          color: var(--ink);
          border-color: var(--white);
        }
        .btn.white:hover {
          background: lightgray !important;
          color: black !important;
        }

        .section {
          max-width: var(--max);
          margin: 0 auto;
          padding: 96px 22px;
        }

        .section-header {
          display: grid;
          grid-template-columns: minmax(260px, 0.75fr) minmax(320px, 1fr);
          gap: clamp(32px, 7vw, 120px);
          align-items: end;
          margin-bottom: 48px;
          
         
        }
        .section-title {
          margin: 18px 0 0;
          max-width: 100%;
          font-size: clamp(40px, 6vw, 92px);
          line-height: 0.92;
          letter-spacing: -0.075em;
          font-weight: 500;
          text-transform: uppercase;
        }
        .section-copy {
          max-width: 650px;
          color: #4f4f4f;
          font-size: 17px;
          line-height: 1.6;
        }

        /* HERO */
        .hero {
          padding: 26px 22px 0;
        }
        .hero-grid {
          min-height: 660px;
          display: grid;
          grid-template-columns: minmax(500px, 1.08fr) minmax(420px, 0.92fr);
          border: 1px solid var(--line);
          background: var(--white);
          overflow: hidden;
        }
        .hero-grid > :global(*) {
          min-width: 0;
        }
        .hero-copy {
          padding: clamp(34px, 4.6vw, 62px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 64px;
          border-right: 1px solid var(--line);
          min-width: 0;
        }
        .hero-title {
          margin: 24px 0 22px;
          max-width: 100%;
          font-size: clamp(52px, 6.8vw, 96px);
          line-height: 0.9;
          letter-spacing: -0.078em;
          font-weight: 500;
          text-transform: uppercase;
          overflow-wrap: normal;
        }
        .hero-text {
          max-width: 610px;
          color: #4d4d4d;
          font-size: 16px;
          line-height: 1.78;
          margin-bottom: 28px;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .hero-note {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          border-top: 1px solid var(--line);
          padding-top: 18px;
        }
        .hero-note strong {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .hero-note span {
          display: block;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
        }

        .hero-visual {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(17, 17, 17, 0.08), rgba(17, 17, 17, 0.04)),
            linear-gradient(135deg, var(--soft) 0%, var(--soft-2) 100%);
        }
        .hero-visual::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.04), rgba(17, 17, 17, 0.34));
        }
        .hero-visual.has-media::before {
          display: none;
        }
        .glass-card {
          position: absolute;
          left: clamp(22px, 4vw, 54px);
          right: clamp(22px, 4vw, 54px);
          bottom: clamp(22px, 4vw, 54px);
          border: 1px solid rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(18px);
          color: var(--white);
          padding: 28px;
        }
        .glass-card :global(h2) {
          margin: 0 0 12px;
          max-width: 620px;
          font-size: clamp(24px, 3vw, 48px);
          line-height: 1;
          letter-spacing: -0.06em;
          font-weight: 500;
          text-transform: uppercase;
          overflow-wrap: break-word;
        }
        .glass-card :global(p) {
          max-width: 680px;
          margin: 0;
          font-size: 14px;
          line-height: 1.7;
          opacity: 0.9;
        }

        /* PARTNER PROOF STRIP */
        .proof-strip {
          max-width: var(--max);
          margin: 0 auto;
          padding: 78px 22px 0px;
        }
        .proof-inner {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border: 1px solid var(--line);
          background: var(--white);
        }
        .proof-item {
          padding: 26px 24px;
          border-right: 1px solid var(--line);
        }
        .proof-item:last-child {
          border-right: 0;
        }
        .proof-value {
          display: block;
          margin-bottom: 8px;
          font-size: 28px;
          letter-spacing: -0.055em;
          font-weight: 500;
        }
        .proof-label {
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* EXPERIENCE */
        .experience-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--line);
          background: var(--white);
        }
        .experience-card {
          min-height: 330px;
          padding: 34px;
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .experience-card:hover {
          background: black;
          color: white;
          cursor: pointer;
        }

        .experience-card:hover .card-number,
.experience-card:hover :global(h3),
.experience-card:hover :global(p) {
  color: #fff !important;
}

.experience-card:hover .card-line {
  background: #fff !important;
}
        .experience-card:last-child {
          border-right: 0;
        }
        .experience-card :global(h3) {
          margin: 20px 0 14px;
          font-size: 24px;
          line-height: 1.05;
          letter-spacing: -0.045em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .experience-card :global(p) {
          margin: 0;
          color: #5a5a5a;
          font-size: 14px;
          line-height: 1.7;
        }
        .card-number {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted-2);
        }
        .card-line {
          display: block;
          width: 48px;
          height: 1px;
          background: var(--ink);
          margin-top: 20px;
        }

        /* CATALOGUE */
        .catalogue-band {
          max-width: var(--max);
          margin: 0 auto;
          padding: 100px 22px;
        }
        .catalogue-inner {
          display: grid;
          grid-template-columns: minmax(300px, 0.82fr) minmax(320px, 1fr);
          border: 1px solid var(--line);
          background: var(--black);
          color: var(--white);
        }
        .catalogue-copy {
          padding: clamp(34px, 5vw, 70px);
          border-right: 1px solid rgba(255, 255, 255, 0.18);
        }
        .catalogue-copy :global(h2) {
          max-width: 620px;
          margin: 18px 0 22px;
          /* Was clamp(38px, 5.2vw, 76px) — sized off full viewport width,
             but this heading actually renders inside the narrower
             .catalogue-copy grid column (minmax(300px, 0.82fr) of
             .catalogue-inner), not the full viewport. At that real column
             width a single long French word (e.g. "PROFESSIONNEL.") was
             wider than the box, so overflow-wrap: break-word above was
             splitting it mid-word across two lines instead of ever fitting
             on one. Sized down so the longest realistic word fits within
             the column without needing to break. */
          font-size: clamp(30px, 3.6vw, 54px);
          line-height: 0.92;
          letter-spacing: -0.075em;
          font-weight: 500;
          text-transform: uppercase;
          overflow-wrap: break-word;
        }
        .catalogue-copy :global(p) {
          max-width: 620px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 15px;
          line-height: 1.75;
          margin-bottom: 28px;
        }
        .catalogue-preview {
          position: relative;
          min-height: 420px;
          padding: clamp(30px, 5vw, 64px);
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.14), transparent 28%),
            linear-gradient(135deg, #222, #111 70%);
          overflow: hidden;
        }
        .catalogue-sheet {
          position: absolute;
          inset: auto clamp(28px, 6vw, 80px) clamp(28px, 5vw, 58px) auto;
          width: min(360px, 62%);
          aspect-ratio: 3 / 4;
          background: var(--paper);
          color: var(--ink);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 34px 70px rgba(0, 0, 0, 0.35);
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transform: rotate(-2deg);
        }
        .catalogue-sheet::before {
          content: "";
          position: absolute;
          inset: 18px;
          border: 1px solid var(--line);
          pointer-events: none;
        }
        .catalogue-sheet :global(small) {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .catalogue-sheet :global(strong) {
          font-size: 42px;
          line-height: 0.9;
          letter-spacing: -0.075em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .catalogue-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 20px;
        }
        .catalogue-tags :global(span) {
          border: 0;
          padding: 0;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        /* FORM */
        .form-section {
          max-width: var(--max);
          margin: 0 auto;
          padding: 10px 22px;
        }
        .form-shell {
          display: grid;
          grid-template-columns: minmax(320px, 0.58fr) minmax(420px, 1fr);
          border: 1px solid var(--line);
          background: var(--white);
        }
        .form-aside {
          padding: clamp(34px, 5vw, 70px);
          border-right: 1px solid var(--line);
          background: var(--soft);
          position: relative;
        }
        .form-aside :global(h2) {
          margin: 20px 0 22px;
          max-width: 100%;
          /* Was clamp(38px, 4.8vw, 62px) — same viewport-vs-column mismatch
             as .catalogue-copy h2 above: .form-aside is an even narrower
             column (minmax(320px, 0.58fr) of .form-shell), so a long French
             word overflowed and got split mid-word by overflow-wrap below.
             Sized down to actually fit the column. */
          font-size: clamp(30px, 3.2vw, 44px);
          line-height: 1;
          letter-spacing: -0.075em;
          font-weight: 500;
          text-transform: uppercase;
          overflow-wrap: break-word;
        }
        .form-aside :global(p) {
          color: #555;
          font-size: 15px;
          line-height: 1.76;
          max-width: 520px;
        }
        .process-list {
          margin: 48px 0 0;
          padding: 0;
          list-style: none;
          border-top: 1px solid var(--line);
        }
        .process-list li {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 18px;
          padding: 20px 0;
          border-bottom: 1px solid var(--line);
        }
        .process-list span {
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .process-list strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .process-list p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }
        .form-note {
          margin-top: 34px;
          padding: 18px;
          border: 1px solid var(--line);
          background: var(--white);
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .reseller-landing :global(form) {
          padding: clamp(30px, 5vw, 70px);
        }
        .form-progress {
          margin-bottom: 34px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border: 1px solid var(--line);
        }
        .progress-step {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-right: 1px solid var(--line);
          background: transparent;
          font: inherit;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          text-align: center;
          padding: 0 8px;
          position: relative;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .progress-step:last-child {
          border-right: 0;
        }
        .progress-step.is-complete {
          background: var(--soft);
          color: var(--ink);
        }
        .progress-step.is-complete::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 8px;
          width: 5px;
          height: 9px;
          border-right: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
          transform: translateX(-50%) rotate(45deg);
          opacity: 0.65;
        }
        .progress-step.active {
          background: var(--ink);
          color: var(--white);
        }
        .progress-step.active::after {
          display: none;
        }

        .reseller-landing :global(fieldset) {
          border: 0;
          padding: 0;
          margin: 0 0 42px;
        }
        .reseller-landing :global(legend) {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding-bottom: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--ink);
          font-size: 12px;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .reseller-landing :global(legend span) {
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.14em;
          font-weight: 400;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 18px;
        }
        .field.full {
          grid-column: 1 / -1;
        }
        .field label {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .field label :global(em) {
          font-style: normal;
          color: var(--muted-2);
          letter-spacing: 0.1em;
        }

        .req {
          font-style: normal;
          font-weight: 700;
          color: var(--ink);
          margin-right: 4px;
        }
        .field :global(input),
        .field :global(select),
        .field :global(textarea) {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          min-height: 48px;
          padding: 0 14px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
          border-radius: 0;
        }
        .field :global(textarea) {
          min-height: 126px;
          padding: 14px;
          resize: vertical;
          line-height: 1.6;
        }
        .field :global(input:focus),
        .field :global(select:focus),
        .field :global(textarea:focus) {
          border-color: var(--ink);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.045);
        }
        .field :global(input::placeholder),
        .field :global(textarea::placeholder) {
          color: #aaa;
        }

        /* PhoneFieldBox (same flag/dial-code dropdown behaviour as
           UserProfile.jsx) sits inside a .field, so the generic ".field
           input" rules above would otherwise stamp their own border/
           background/padding onto its two inputs. Re-declared after those
           rules (same specificity, so source order decides) — using the
           same var(--paper)/var(--line) tokens as every other field here,
           so the phone box matches the rest of the form instead of
           standing out with Tailwind's gray palette. */
        .field :global(.phone-field-box) {
          width: 100%;
          min-height: 48px;
          padding: 0;
          border: 1px solid var(--line);
          background: var(--paper);
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        .field :global(.phone-field-box:focus-within) {
          border-color: var(--ink);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.045);
        }
        .field :global(.phone-country-button) {
          border-right: 1px solid var(--line);
          color: var(--ink);
        }
        .field :global(.phone-country-button:hover) {
          background: var(--soft);
        }
        .field :global(.phone-number-input),
        .field :global(.phone-number-input:focus) {
          border: 0;
          background: transparent;
          min-height: 46px;
          padding: 0 16px;
          font-size: 13px;
          color: var(--ink);
          box-shadow: none;
        }
        .field :global(.phone-search-input),
        .field :global(.phone-search-input:focus) {
          border: 1px solid var(--line);
          background: var(--paper);
          min-height: 0;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--ink);
          box-shadow: none;
        }

        /* Required-field validation state — a field goes red the moment its
           submit-time error is set, and clears back to normal on the next
           keystroke/selection (see setField/clearFieldError below). */
        .field.has-error :global(input),
        .field.has-error :global(select),
        .field.has-error :global(.phone-field-box) {
          border-color: #dc2626;
        }
        .field-error {
          margin: 6px 0 0;
          color: #dc2626;
          font-size: 11px;
          line-height: 1.5;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          border: 1px solid var(--line);
          background: var(--paper);
        }
        .checkbox-card {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border-right: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-size: 12px;
          color: #444;
          cursor: pointer;
        }
        .checkbox-card:nth-child(2n) {
          border-right: 0;
        }
        .checkbox-card:nth-last-child(-n + 2) {
          border-bottom: 0;
        }
        .checkbox-card :global(input) {
          /* The checkbox <input> is a descendant of .field, so the generic
             ".field input" rule further down (border/background/min-height:
             48px/padding, meant for text fields) also matches it — its
             min-height:48px overrides this 14px height, stretching the box
             into a tall thin rectangle instead of a square checkbox.
             Reset every one of those leaked properties back to a plain
             native checkbox here. */
          width: 14px;
          height: 14px;
          min-height: 0;
          min-width: 0;
          padding: 0;
          margin: 0;
          border: 0;
          background: none;
          accent-color: var(--ink);
          flex: 0 0 auto;
        }

        .consent-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 24px 0;
          padding: 18px;
          border: 1px solid var(--line);
          background: var(--soft);
          color: #535353;
          font-size: 12px;
          line-height: 1.6;
        }
        .consent-box :global(input) {
          margin-top: 2px;
          accent-color: var(--ink);
        }

        .form-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding-top: 26px;
          border-top: 1px solid var(--line);
        }
        .secure-note {
          max-width: 360px;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
        }

        /* PRODUCTS INTEREST (unused in current markup, kept for 1:1 CSS parity) */
        .interest-strip {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border: 1px solid var(--line);
          background: var(--white);
        }
        .interest-item {
          min-height: 180px;
          padding: 24px;
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .interest-item:last-child {
          border-right: 0;
        }
        .interest-item :global(small) {
          color: var(--muted-2);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .interest-item :global(h3) {
          margin: 20px 0 0;
          font-size: 22px;
          line-height: 1.05;
          letter-spacing: -0.04em;
          font-weight: 500;
          text-transform: uppercase;
        }

        /* FORM PROGRESS + ACCORDION UX */
        .completion-card {
          margin-top: 24px;
          padding: 22px;
          border: 1px solid rgba(17, 17, 17, 0.18);
          background: var(--ink);
          color: var(--white);
        }
        .completion-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }
        .completion-row :global(b) {
          font-size: 44px;
          line-height: 1;
          letter-spacing: -0.06em;
          font-weight: 500;
        }
        .completion-row :global(span) {
          color: rgba(255, 255, 255, 0.62);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-align: right;
        }
        .completion-meter,
        .progress-overview-meter {
          height: 6px;
          background: rgba(17, 17, 17, 0.12);
          overflow: hidden;
        }
        .completion-meter {
          background: rgba(255, 255, 255, 0.18);
        }
        .completion-meter :global(span),
        .progress-overview-meter :global(span) {
          display: block;
          height: 100%;
          width: 0%;
          background: currentColor;
          transition: width 0.35s ease;
        }
        .completion-meter :global(span) {
          background: var(--white);
        }
        .completion-label {
          margin: 14px 0 0 !important;
          color: rgba(255, 255, 255, 0.74) !important;
          font-size: 12px !important;
          line-height: 1.55 !important;
        }

        .progress-overview {
          margin: -18px 0 30px;
          padding: 16px 18px;
          border: 1px solid var(--line);
          border-top: 0;
          background: var(--paper);
          color: var(--ink);
        }
        .progress-overview-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 12px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .progress-overview-head :global(strong) {
          color: var(--ink);
          font-weight: 700;
        }

        /* ── ANIMATED ACCORDION ───────────────────────────────────────── */
        .form-accordion {
          display: block;
          margin: 0 0 14px;
          padding: 0;
          border: 1px solid var(--line) !important;
          background: var(--white);
          overflow: hidden;
        }
        .accordion-summary {
          width: 100%;
          cursor: pointer;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 18px;
          align-items: center;
          padding: 20px 22px;
          margin: 0;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          text-align: left;
          transition: background 0.28s ease, color 0.28s ease;
        }
        .accordion-summary::after {
          content: "+";
          font-size: 22px;
          font-weight: 400;
          line-height: 1;
          justify-self: end;
        }
        .form-accordion.is-open .accordion-summary::after {
          content: "−";
        }
        .form-accordion.is-open .accordion-summary {
          background: var(--ink);
          color: var(--white);
        }
        .form-accordion.is-open .accordion-summary :global(.summary-title small),
        .form-accordion.is-open .accordion-summary :global(.accordion-status) {
          color: rgba(255, 255, 255, 0.7);
        }

        /* the actual slide down / slide up */
        .accordion-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.42s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-accordion.is-open .accordion-body {
          grid-template-rows: 1fr;
        }
        .accordion-body-inner {
          overflow: hidden;
          min-height: 0;
          /* Closing: snap back to overflow:hidden immediately (0s delay)
             so the slide-up is clipped from the very first frame. */
          transition: overflow 0s linear 0s;
        }
        /* Once a section is fully open, let its overflow go visible again —
           otherwise the clipping needed for the slide animation permanently
           traps popovers that need to escape it, like the phone field's
           country dropdown. The transition-delay below (matching the
           grid-template-rows duration) is the important part: without it,
           overflow flips to visible the instant .is-open is added — i.e. at
           the START of the slide-down, not the end — which strips the
           clipping the 0fr→1fr grid trick depends on for its whole
           duration and makes the open/close look like an instant snap
           instead of a smooth slide. */
        .form-accordion.is-open {
          overflow: visible;
          transition: overflow 0s linear 0.42s;
        }
        .form-accordion.is-open .accordion-body-inner {
          overflow: visible;
          transition: overflow 0s linear 0.42s;
        }

        .form-accordion :global(.summary-title) {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .form-accordion :global(.summary-title small) {
          color: var(--muted-2);
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 400;
          transition: color 0.28s ease;
        }
        .form-accordion :global(.accordion-status) {
          justify-self: end;
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.14em;
          font-style: normal;
          font-weight: 400;
          white-space: nowrap;
          transition: color 0.28s ease;
        }
        .form-accordion.is-complete .accordion-summary {
          background: var(--soft);
        }
        .form-accordion.is-complete.is-open .accordion-summary {
          background: var(--ink);
        }
        .form-accordion.is-complete :global(.accordion-status) {
          color: var(--ink);
        }
        .form-accordion.is-complete.is-open :global(.accordion-status) {
          color: rgba(255, 255, 255, 0.7);
        }
        .form-accordion :global(fieldset) {
          margin: 0;
          padding: 24px 22px 26px;
          border: 0;
        }
        .form-accordion :global(legend) {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .accordion-body {
            transition: none;
          }
        }

        /* Small/medium screens — gentler heading sizes than the desktop
           clamp()s above (tuned for wide screens, left untouched there),
           same pattern used in ProSection.jsx. Kept as its own pass so
           nothing above 1440px changes. */
        @media (max-width: 1440px) {
          .hero-title {
            font-size: clamp(34px, 5.4vw, 64px);
            overflow-wrap: break-word;
          }
          .section-title {
            font-size: clamp(30px, 4.6vw, 58px);
            overflow-wrap: break-word;
          }
          .form-aside :global(h2) {
            font-size: clamp(24px, 3vw, 36px);
          }
          .catalogue-copy :global(h2) {
            font-size: clamp(26px, 3.2vw, 40px);
          }
          .glass-card :global(h2) {
            font-size: clamp(20px, 2.6vw, 34px);
          }
        }

        /* Checkbox cards: on tablet the grid is still 2 columns, so a row
           with one 2-line label and one 1-line label share a stretched row
           height — align-items:center then centers the short label's
           checkbox against that taller row instead of its own text,
           making checkboxes drift out of alignment between rows. Top-align
           instead so every checkbox sits flush with the first line of its
           own label, on both the 2-col tablet grid and the 1-col mobile
           grid. */
        @media (max-width: 900px) {
          .checkbox-card {
            align-items: flex-start;
            line-height: 1.45;
          }
          .checkbox-card :global(input) {
            margin-top: 3px;
            flex-shrink: 0;
          }
        }

        @media (max-width: 1180px) {
          .hero-grid,
          .form-shell,
          .catalogue-inner,
          .section-header {
            grid-template-columns: 1fr;
          }
          .hero-copy,
          .form-aside,
          .catalogue-copy {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }
          .hero-note,
          .proof-inner,
          .experience-grid,
          .interest-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .experience-card:nth-child(2) {
            border-right: 0;
          }
          .experience-card:nth-child(3) {
            grid-column: 1 / -1;
            border-top: 1px solid var(--line);
          }
        }

        @media (min-width: 1181px) and (max-width: 1320px) {
          .hero-grid {
            grid-template-columns: minmax(470px, 1fr) minmax(390px, 0.9fr);
          }
          .hero-title {
            font-size: clamp(50px, 6.3vw, 84px);
          }
          .hero-copy {
            padding: 44px;
          }
          .hero-note {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .hero,
          .proof-strip,
          .catalogue-band,
          .section,
          .form-section {
            padding-left: 14px;
            padding-right: 14px;
          }
          .hero-grid {
            min-height: 0;
          }
          .hero-copy,
          .form-aside,
          .catalogue-copy {
            padding: 30px 22px;
          }
          .reseller-landing :global(form) {
            padding: 30px 22px;
          }
          .hero-visual {
            min-height: 420px;
          }
          .hero-title,
          .section-title,
          .form-aside :global(h2),
          .catalogue-copy :global(h2) {
            letter-spacing: -0.07em;
          }
          .hero-note,
          .proof-inner,
          .experience-grid,
          .interest-strip,
          .form-grid,
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          .proof-item,
          .experience-card,
          .interest-item,
          .form-accordion,
          .checkbox-card {
            border-right: 0 !important;
          }
          .experience-card:nth-child(3) {
            grid-column: auto;
          }
          .checkbox-card:nth-last-child(-n + 2) {
            border-bottom: 1px solid var(--line);
          }
          .checkbox-card:last-child {
            border-bottom: 0;
          }
          .form-progress {
            grid-template-columns: 1fr 1fr;
          }
          .progress-step {
            font-size: 8.5px;
            letter-spacing: 0.1em;
            line-height: 1.35;
            padding: 6px;
          }
          .form-actions {
            align-items: flex-start;
          }
          .btn {
            width: 100%;
          }
        }

        @media (max-width: 720px) {
          .accordion-summary {
            grid-template-columns: 1fr auto;
            padding: 18px;
            row-gap: 8px;
          }
          .accordion-summary::after {
            grid-column: 2;
            grid-row: 1;
          }
          .form-accordion :global(.summary-title) {
            align-items: flex-start;
          }
          .form-accordion :global(.accordion-status) {
            grid-column: 1;
            grid-row: 2;
            justify-self: start;
          }
          .progress-overview {
            margin-top: -18px;
          }
        }

        :global(.pro-splash-media) {
          width: 100%;
          height: 100%;
          object-fit: cover !important;
          display: block;
        }

        @keyframes pro-media-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      </div>
    </>
  );
}