"use client";

import { useEffect, useRef, useState } from "react";
import { FlagImage, defaultCountries, parseCountry } from "react-international-phone";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { MEDIA_URL } from "../../API/API";

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

const BUSINESS_TYPE_OPTIONS = [
  "Pet shop",
  "Grooming salon",
  "Veterinary clinic",
  "Breeder",
  "E-commerce retailer",
  "Distributor / wholesaler",
  "Concept store",
  "Other professional activity",
];

const SALES_CHANNEL_OPTIONS = [
  "Physical store",
  "Online store",
  "Marketplace",
  "Grooming salon retail",
  "Veterinary retail",
  "Distribution network",
  "Mixed channels",
];

const INTEREST_OPTIONS = [
  { value: "biogance-dogs-cats", label: "Biogance — Dogs, cats & puppies care" },
  { value: "biogance-small-pets-birds-reptiles", label: "Biogance — Small mammals, birds & reptiles" },
  { value: "organissime", label: "Organissime — Certified organic care" },
  { value: "biospotix", label: "Biospotix — Plant-based anti-parasite protection" },
  { value: "ekinat", label: "Ekinat — Premium horse care" },
  { value: "gamme-pro", label: "Gamme Pro — Professional formats" },
];

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

function progressLabel(percent) {
  if (percent === 100) return "Application ready to submit.";
  if (percent >= 75) return "Almost there — complete the last required details.";
  if (percent >= 45) return "Good progress — keep completing each section.";
  if (percent > 0) return "The reseller profile is being built step by step.";
  return "Start with company information to build your reseller profile.";
}

export default function Reseller() {
  const headerMedia = useSplashMedia("reseller_header");
  const footerMedia = useSplashMedia("reseller_footer");

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

  const setField = (name) => (e) => setFields((prev) => ({ ...prev, [name]: e.target.value }));
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
  const handleStepClick = (index) => () => {
    setOpenIndex((prev) => {
      const next = prev === index ? null : index;
      if (next !== null) {
        // let the slide-down start before scrolling, otherwise the target
        // rect is still the collapsed one and the scroll lands too high.
        setTimeout(() => {
          accordionRefs.current[index]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 140);
      }
      return next;
    });
  };

  // A collapsed panel's inputs are still in the DOM, so native validation can
  // still target them — reopen the owning section when that happens.
  const openStepOnInvalid = (index) => () => setOpenIndex(index);

  return (
    <div className="reseller-landing">
      <Navbar bgWhite={true} />

      <div className="reseller-page-offset">
        <main>
          {/* HERO */}
          <section className="hero" id="top">
            <div className="hero-grid">
              <div className="hero-copy">
                <div>
                  <span className="eyebrow">Biogance Professional</span>
                  <h1 style={{ marginTop: "20px", lineHeight: "1" }} className="hero-title">
                    Become a
                    <br />
                    Biogance
                    <br />
                    Reseller.
                  </h1>
                  <p className="hero-text">
                    Bring naturally inspired, expert-led pet care to your customers. Complete the
                    reseller application form and our sales team will review your request before
                    contacting you with the next steps.
                  </p>
                  <div className="hero-actions">
                    <a style={{ color: "white", hover: { color: "black" } }} className="btn" href="#application">
                      Apply now
                    </a>
                    <a className="btn secondary" href="#catalogue">
                      Download catalogue
                    </a>
                  </div>
                </div>

                <div className="hero-note" aria-label="Reseller benefits">
                  <div>
                    <strong>Expert formulas</strong>
                    <span>Care routines developed with a professional approach to hygiene and well-being.</span>
                  </div>
                  <div>
                    <strong>French laboratory</strong>
                    <span>A brand born in Angers, crafted with precision and long-term trust.</span>
                  </div>
                  <div>
                    <strong>Sales support</strong>
                    <span>Commercial follow-up to help qualified partners build the right assortment.</span>
                  </div>
                </div>
              </div>

              <div className={`hero-visual${headerMedia?.media || (headerMedia?.images && headerMedia.images.length > 0) ? " has-media" : ""}`} aria-label="Natural pet care visual placeholder">
                <SplashMedia data={headerMedia} />
                <div className="glass-card">
                  <h2>Natural care, curated for professionals.</h2>
                  <p>
                    From pet shops and grooming salons to veterinary-led retail environments,
                    Biogance supports partners who share the same ambition: cleaner routines,
                    visible results and trusted care for every companion.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PROOF STRIP */}
          <section className="proof-strip" aria-label="Biogance professional proof points">
            <div className="proof-inner">
              <div className="proof-item">
                <span className="proof-value">2008</span>
                <span className="proof-label">Founded in Angers, France</span>
              </div>
              <div className="proof-item">
                <span className="proof-value">40+</span>
                <span className="proof-label">Countries trusting the brand</span>
              </div>
              <div className="proof-item">
                <span className="proof-value">ISO</span>
                <span className="proof-label">Professional manufacturing standards</span>
              </div>
              <div className="proof-item">
                <span className="proof-value">ECO</span>
                <span className="proof-label">Certified natural pet care expertise</span>
              </div>
            </div>
          </section>

          {/* EXPERIENCE */}
          <section className="section" id="professional-care">
            <div className="section-header">
              <div>
                <span className="eyebrow">Professional partnership</span>
                <h2 style={{ marginTop: "20px", lineHeight: "1" }} className="section-title">
                  A refined
                  <br />
                  B2B
                  <br />
                  experience.
                </h2>
              </div>
              <p className="section-copy">
                The reseller journey has been designed to be clear, selective and efficient. Once
                your information has been submitted, the Biogance sales team can qualify your
                business profile, understand your distribution needs and guide you toward the
                most relevant professional offer.
              </p>
            </div>

            <div className="experience-grid">
              <article className="experience-card">
                <div>
                  <span className="card-number">Step 01</span>
                  <h3>Share your company details</h3>
                  <p>
                    Complete your company, contact and VAT details so our team can identify your
                    professional profile quickly.
                  </p>
                </div>
                <span className="card-line" />
              </article>
              <article className="experience-card">
                <div>
                  <span className="card-number">Step 02</span>
                  <h3>Define your product interests</h3>
                  <p>
                    Select the Biogance categories you would like to distribute, from grooming
                    essentials to certified natural care routines.
                  </p>
                </div>
                <span className="card-line" />
              </article>
              <article className="experience-card">
                <div>
                  <span className="card-number">Step 03</span>
                  <h3>Get contacted by sales</h3>
                  <p>
                    After review, a Biogance sales representative will contact you to discuss
                    reseller conditions, catalogue access and next steps.
                  </p>
                </div>
                <span className="card-line" />
              </article>
            </div>
          </section>

          {/* FORM */}
          <section className="form-section" id="application">
            <div className="form-shell">
              <aside className="form-aside">
                <span className="eyebrow">Reseller application</span>
                <h2 style={{ marginTop: "20px" }}>Apply for professional access.</h2>
                <p>
                  Share a few essential details so our commercial team can qualify your request
                  and contact you with the right B2B conditions.
                </p>

                <ul className="process-list">
                  <li>
                    <span>01</span>
                    <div>
                      <strong>Submit your request</strong>
                      <p>Your business information is sent to the Biogance sales team.</p>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <strong>Commercial review</strong>
                      <p>We check your activity, market and product needs.</p>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <strong>Personal follow-up</strong>
                      <p>A sales representative contacts you with the next steps.</p>
                    </div>
                  </li>
                </ul>

                <div className="form-note">
                  This short form helps our sales team understand your business, your market and
                  the product ranges you are interested in.
                </div>

                <div className="completion-card" aria-live="polite">
                  <div className="completion-row">
                    <b>{overallPercent}%</b>
                    <span>Form completed</span>
                  </div>
                  <div className="completion-meter" aria-hidden="true">
                    <span style={{ width: `${overallPercent}%` }} />
                  </div>
                  <p className="completion-label">{progressLabel(overallPercent)}</p>
                </div>
              </aside>

              <form action="#" method="post">
                <div className="form-progress" aria-label="Application sections">
                  <button
                    type="button"
                    className={`progress-step${openIndex === 0 ? " active" : ""}${
                      step0Percent === 100 ? " is-complete" : ""
                    }`}
                    aria-expanded={openIndex === 0}
                    onClick={handleStepClick(0)}
                  >
                    Company &amp; Contact
                  </button>
                  <button
                    type="button"
                    className={`progress-step${openIndex === 1 ? " active" : ""}${
                      step1Percent === 100 ? " is-complete" : ""
                    }`}
                    aria-expanded={openIndex === 1}
                    onClick={handleStepClick(1)}
                  >
                    Business Needs
                  </button>
                </div>

                <div className="progress-overview" aria-live="polite">
                  <div className="progress-overview-head">
                    <span>Application progress</span>
                    <strong>{overallPercent}% completed</strong>
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
                      <small>01</small>Company &amp; contact
                    </span>
                    <em className="accordion-status">{step0Percent}% complete</em>
                  </button>

                  <div className="accordion-body">
                    <div className="accordion-body-inner">
                      <fieldset>
                        <legend>
                          Company &amp; contact <span>Required</span>
                        </legend>
                        <div className="form-grid">
                          <div className="field full">
                            <label htmlFor="company">
                              <span>
                                <b className="req">*</b> Company
                              </span>
                            </label>
                            <input
                              id="company"
                              name="company"
                              type="text"
                              placeholder="Your company name"
                              required
                              value={fields.company}
                              onChange={setField("company")}
                              onInvalid={openStepOnInvalid(0)}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="business-type">
                              <span>
                                <b className="req">*</b> Type of business
                              </span>
                            </label>
                            <select
                              id="business-type"
                              name="business-type"
                              required
                              value={fields.businessType}
                              onChange={setField("businessType")}
                              onInvalid={openStepOnInvalid(0)}
                            >
                              <option value="">Select your activity</option>
                              {BUSINESS_TYPE_OPTIONS.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <label htmlFor="vat">
                              <span>
                                <b className="req">*</b> VAT
                              </span>
                            </label>
                            <input
                              id="vat"
                              name="vat"
                              type="text"
                              placeholder="VAT number"
                              required
                              value={fields.vat}
                              onChange={setField("vat")}
                              onInvalid={openStepOnInvalid(0)}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="email">
                              <span>
                                <b className="req">*</b> Email
                              </span>
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="name@company.com"
                              required
                              value={fields.email}
                              onChange={setField("email")}
                              onInvalid={openStepOnInvalid(0)}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="phone">
                              <span>
                                <b className="req">*</b> Phone number
                              </span>
                            </label>
                            <PhoneFieldBox
                              iso2={phoneIso2}
                              onCountryChange={(iso2) => {
                                phoneCountryEditedRef.current = true;
                                setPhoneIso2(iso2);
                              }}
                              value={fields.phone}
                              onChange={(phone) => setFields((prev) => ({ ...prev, phone }))}
                              required
                              onInvalid={openStepOnInvalid(0)}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="country">
                              <span>Country</span>
                            </label>
                            <input
                              id="country"
                              name="country"
                              type="text"
                              placeholder="Country"
                              value={fields.country}
                              onChange={setField("country")}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="website">
                              <span>Website or social profile</span>
                            </label>
                            <input
                              id="website"
                              name="website"
                              type="url"
                              placeholder="https://"
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
                      <small>02</small>Business needs
                    </span>
                    <em className="accordion-status">{step1Percent}% complete</em>
                  </button>

                  <div className="accordion-body">
                    <div className="accordion-body-inner">
                      <fieldset>
                        <legend>
                          Business needs <span>Required</span>
                        </legend>
                        <div className="form-grid">
                          <div className="field">
                            <label htmlFor="sales-channel">
                              <span>Main sales channel</span>
                            </label>
                            <select
                              id="sales-channel"
                              name="sales-channel"
                              value={fields.salesChannel}
                              onChange={setField("salesChannel")}
                            >
                              <option value="">Select one option</option>
                              {SALES_CHANNEL_OPTIONS.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <label htmlFor="market">
                              <span>Market covered</span>
                            </label>
                            <input
                              id="market"
                              name="market"
                              type="text"
                              placeholder="France, Portugal, UAE, Singapore…"
                              value={fields.market}
                              onChange={setField("market")}
                            />
                          </div>
                          <div className="field full">
                            <label>
                              Product interests <em>Select at least one</em>
                            </label>
                            <div className="checkbox-grid">
                              {INTEREST_OPTIONS.map((option, index) => (
                                <label className="checkbox-card" key={option.value}>
                                  <input
                                    type="checkbox"
                                    name="interests"
                                    value={option.value}
                                    checked={!!interests[option.value]}
                                    onChange={toggleInterest(option.value)}
                                    required={index === 0 && !anyInterestChecked}
                                    onInvalid={index === 0 ? openStepOnInvalid(1) : undefined}
                                  />{" "}
                                  {option.label}
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
                  <span>
                    I confirm that the information provided is accurate and agree to be contacted
                    by the Biogance sales team regarding my reseller application.
                  </span>
                </label>

                <div className="form-actions">
                  <p className="secure-note">
                    Your request will be reviewed by our commercial team. Submitting this form
                    does not automatically guarantee reseller access.
                  </p>
                  <button style={{fontSize:"10px"}} className="btn" type="submit">
                    Submit application
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* CATALOGUE */}
          <section className="catalogue-band" id="catalogue">
            <div className="catalogue-inner">
              <div className="catalogue-copy">
                <span className="eyebrow">Product catalogue</span>
                <h2 style={{marginTop:"20px", lineHeight:"1"}}>Explore the professional assortment.</h2>
                <p>
                  Download the Biogance product catalogue to discover our care ranges,
                  professional formats and expert routines for dogs, cats and other companions.
                </p>
                <a className="btn white" href="/biogance-professional-catalogue.pdf" download>
                  Download catalogue
                </a>
                <div className="catalogue-tags" aria-label="Catalogue contents">
                  <span>#GroomingCare</span>
                  <span>#NaturalFormulas</span>
                  <span>#CertifiedRanges</span>
                  <span>#ProfessionalFormats</span>
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
          max-width: full;
          margin: 0 auto;
          padding: 96px 22px;
        }

        .section-header {
          display: grid;
          grid-template-columns: minmax(260px, 0.75fr) minmax(320px, 1fr);
          gap: clamp(32px, 7vw, 120px);
          align-items: end;
          margin-bottom: 48px;
          border-top: 1px solid var(--ink);
          padding-top: 22px;
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
          font-size: 15px;
          line-height: 1.75;
        }

        /* HERO */
        .hero {
          max-width: full;
          margin: 0 auto;
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
          max-width: full;
          margin: 0 auto;
          padding: 18px 22px 0;
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
          max-width: full;
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
          font-size: clamp(38px, 5.2vw, 76px);
          line-height: 0.92;
          letter-spacing: -0.075em;
          font-weight: 500;
          text-transform: uppercase;
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
          max-width: full;
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
          font-size: clamp(38px, 4.8vw, 62px);
          line-height: 1;
          letter-spacing: -0.075em;
          font-weight: 500;
          text-transform: uppercase;
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
        }
        /* Once a section is fully open, let its overflow go visible again —
           otherwise the clipping needed for the slide animation permanently
           traps popovers that need to escape it, like the phone field's
           country dropdown. */
        .form-accordion.is-open {
          overflow: visible;
        }
        .form-accordion.is-open .accordion-body-inner {
          overflow: visible;
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
            word-break: break-word;
          }
          .section-title {
            font-size: clamp(30px, 4.6vw, 58px);
            overflow-wrap: break-word;
            word-break: break-word;
          }
          .form-aside :global(h2) {
            font-size: clamp(28px, 4vw, 46px);
          }
          .catalogue-copy :global(h2) {
            font-size: clamp(28px, 4.2vw, 52px);
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
  );
}