"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose, IoChevronDown, IoCheckmark, IoLocationOutline, IoAlertCircleOutline, IoSearch } from "react-icons/io5";
// Real flag SVGs bundled with react-flags-select, keyed by Pascal-case ISO
// code (Us, Fr, Gb, ...). Used directly instead of the package's <select>
// component — Windows doesn't render regional-indicator emoji as flag
// glyphs, it falls back to plain two-letter text, so emoji flags are a
// dead end here and an actual icon is needed.
import * as CountryFlagIcons from "react-flags-select";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../API/API";
import { getDeviceId } from "../../../../utils/deviceId";

const toPascalCase = (code) => code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();

function FlagIcon({ code, className = "" }) {
  const Icon = CountryFlagIcons[toPascalCase(code)];
  if (!Icon) return null;
  return <Icon className={`shrink-0 rounded-[2px] ${className}`} style={{ width: 20, height: 15 }} />;
}

// The full country set the old ReactFlagsSelect instance shipped with
// (unfiltered) — kept as plain data here so the dropdown can be styled
// natively instead of overriding a third-party component's CSS.
const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AX", name: "Åland Islands" }, { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" }, { code: "AS", name: "American Samoa" }, { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" }, { code: "AI", name: "Anguilla" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" }, { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" }, { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" }, { code: "BJ", name: "Benin" }, { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia, Plurinational State of" },
  { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" }, { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" }, { code: "BI", name: "Burundi" }, { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CV", name: "Cape Verde" },
  { code: "KY", name: "Cayman Islands" }, { code: "CF", name: "Central African Republic" }, { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" }, { code: "CN", name: "China" }, { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" }, { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" }, { code: "CI", name: "Côte d'Ivoire" }, { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" }, { code: "CW", name: "Curaçao" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" }, { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" }, { code: "ET", name: "Ethiopia" }, { code: "FK", name: "Falkland Islands (Malvinas)" },
  { code: "FO", name: "Faroe Islands" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "PF", name: "French Polynesia" }, { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" }, { code: "GI", name: "Gibraltar" }, { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" }, { code: "GD", name: "Grenada" }, { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" }, { code: "GG", name: "Guernsey" }, { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" }, { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" }, { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran, Islamic Republic of" },
  { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" }, { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" }, { code: "JE", name: "Jersey" }, { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" },
  { code: "XK", name: "Kosovo" }, { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Lao People's Democratic Republic" }, { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" }, { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia, Federated States of" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" }, { code: "MS", name: "Montserrat" }, { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" }, { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" }, { code: "NU", name: "Niue" }, { code: "NF", name: "Norfolk Island" },
  { code: "KP", name: "North Korea" }, { code: "MP", name: "Northern Mariana Islands" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestinian Territory" }, { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" }, { code: "QA", name: "Qatar" }, { code: "MK", name: "Republic of Macedonia" },
  { code: "MD", name: "Republic of Moldova" }, { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" }, { code: "LC", name: "Saint Lucia" },
  { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten" }, { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" }, { code: "SS", name: "South Sudan" }, { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" },
  { code: "SZ", name: "Swaziland" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" }, { code: "TK", name: "Tokelau" }, { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" }, { code: "TC", name: "Turks and Caicos Islands" }, { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" }, { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela, Bolivarian Republic of" },
  { code: "VN", name: "Viet Nam" }, { code: "VI", name: "Virgin Islands" }, { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" },
];

// Custom country picker — bordered trigger + floating, searchable options
// panel, same visual language as the category dropdown on the Support
// ticket modal. A search box is needed here since the full country list
// runs to 200+ entries.
function CountryDropdown({ value, onSelect, placeholder, hasError }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border text-left text-[14px] transition-colors duration-200 cursor-pointer ${
          hasError ? "border-red-400" : open ? "border-black/30" : "border-black/10 hover:border-black/25"
        }`}
      >
        <span className={`flex items-center gap-2.5 truncate ${selected ? "text-[#0b0b0a] font-medium" : "text-[#8a8880]"}`}>
          {selected && <FlagIcon code={selected.code} />}
          <span className="truncate">{selected ? selected.name : placeholder}</span>
        </span>
        <IoChevronDown className={`w-4 h-4 shrink-0 text-[#8a8880] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)]">
            <div className="relative border-b border-black/10">
              <IoSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#8a8880]" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search country..."
                className="w-full pl-9 pr-3 py-2.5 text-[13.5px] text-[#0b0b0a] outline-none placeholder:text-[#8a8880]"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3.5 text-[13px] text-[#8a8880]">No matches</div>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.code === value;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onSelect(c.code);
                        close();
                      }}
                      className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 text-[13.5px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${
                        isSelected ? "bg-black/[0.04] text-[#0b0b0a] font-semibold" : "text-[#5c5a54]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <FlagIcon code={c.code} />
                        <span className="truncate">{c.name}</span>
                      </span>
                      {isSelected && <IoCheckmark className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
      <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
      {message}
    </span>
  );
}

export function AddAddressModal({ isOpen, onClose, onSave, activeTab, editData }) {
  const { t } = useTranslation("myaccount");

  const [formData, setFormData] = useState({
    addressType: "",
    country: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const modalCardRef = useRef(null);
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant
  // isOpen flips.
  const [isClosing, setIsClosing] = useState(false);

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        addressType: editData.type || "",
        country: editData.country || "",
        fullAddress: editData.full_address || "",
        city: editData.city || "",
        postalCode: editData.postal_code || "",
      });
    }
  }, [editData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add("modal-shake");
      modalCardRef.current.addEventListener("animationend", () => {
        modalCardRef.current?.classList.remove("modal-shake");
      }, { once: true });
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setFormData({
        addressType: "",
        country: "",
        fullAddress: "",
        city: "",
        postalCode: "",
      });
      setFieldErrors({});
      onClose(); // Sirf modal close karega, refresh nahi karega
    }, 250);
  };

  const validateFields = () => {
    const errors = {};
    if (!formData.addressType.trim()) errors.addressType = "Please enter this field.";
    if (!formData.country.trim()) errors.country = "Please enter this field.";
    if (!formData.fullAddress.trim()) errors.fullAddress = "Please enter this field.";
    if (!formData.city.trim()) errors.city = "Please enter this field.";
    if (!formData.postalCode.trim()) errors.postalCode = "Please enter this field.";
    return errors;
  };

  const getApiErrorMessage = (data) => {
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || data.errors[0];
    }
    if (data?.action_message) return data.action_message;
    if (data?.action) return data.action;
    return "Something went wrong";
  };

  const handleSaveAddress = async () => {
    const clientErrors = validateFields();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;

    const body = {
      main_type: activeTab === "invoice" ? "invoice" : "delivery",
      type: formData.addressType,
      full_address: formData.fullAddress,
      country: formData.country,
      city: formData.city,
      postal_code: formData.postalCode,
      ...(!token && { device_id: getDeviceId() }),
      ...(isEditMode && { address_id: editData.id }),
    };

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = isEditMode ? `${BASE_URL}/user/address/edit` : `${BASE_URL}/user/address/create`;

    try {
      const res = await axios.post(url, body, { headers });
      if (res.data.status === false) {
        const apiErrors = res.data.errors;
        if (apiErrors && typeof apiErrors === "object" && !Array.isArray(apiErrors) && Object.keys(apiErrors).length > 0) {
          setFieldErrors(apiErrors);
        } else {
          toast.error(getApiErrorMessage(res.data));
        }
      } else {
        onSave();
        handleCloseModal();
      }
    } catch (err) {
      const errData = err.response?.data;
      const apiErrors = errData?.errors;
      if (apiErrors && typeof apiErrors === "object" && !Array.isArray(apiErrors) && Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
      } else {
        toast.error(getApiErrorMessage(errData));
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[1200] p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalCardRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-[600px] max-h-[90vh] flex flex-col shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
      >
        {/* Dark editorial header band — matches the Support ticket modal */}
        <div className="relative  bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 sm:px-8 pt-7 sm:pt-8 pb-6 sm:pb-7 shrink-0">
          <button
            onClick={handleCloseModal}
            aria-label="Close"
            className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
          >
            <IoClose size={18} />
          </button>

          <div className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
            <IoLocationOutline className="w-5 h-5 text-white" />
          </div>

          <h3 className="text-[22px] sm:text-[24px] font-extrabold leading-[1.05] tracking-tight text-white mb-1.5 pr-12">
            {isEditMode ? "Edit Address" : t("addaddress.addAddress")}
          </h3>
          <p className="text-[13.5px] text-white/50 max-w-[380px] leading-relaxed">
            Fill in the details below to save this {activeTab === "invoice" ? "invoice" : "delivery"} address.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-7 sm:pb-8 flex flex-col gap-5 overflow-y-auto">
          {/* Address Type + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                {t("addaddress.addressType")}
              </label>
              <input
                type="text"
                placeholder={t("addaddress.addressTypePlaceholder")}
                value={formData.addressType}
                onChange={(e) => handleInputChange("addressType", e.target.value)}
                className={`w-full px-4 py-3.5 text-[14px] text-[#0b0b0a] border outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
                  fieldErrors.addressType ? "border-red-400" : "border-black/10 focus:border-black/30"
                }`}
              />
              <FieldError message={fieldErrors.addressType} />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                {t("addaddress.country")}
              </label>
              <CountryDropdown
                value={formData.country}
                onSelect={(code) => handleInputChange("country", code)}
                placeholder={t("addaddress.selectCountryPlaceholder")}
                hasError={!!fieldErrors.country}
              />
              <FieldError message={fieldErrors.country} />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
              {t("addaddress.fullAddress")}
            </label>
            <input
              type="text"
              placeholder={t("addaddress.fullAddressPlaceholder")}
              value={formData.fullAddress}
              onChange={(e) => handleInputChange("fullAddress", e.target.value)}
              className={`w-full px-4 py-3.5 text-[14px] text-[#0b0b0a] border outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
                fieldErrors.fullAddress || fieldErrors.full_address ? "border-red-400" : "border-black/10 focus:border-black/30"
              }`}
            />
            <FieldError message={fieldErrors.fullAddress || fieldErrors.full_address} />
          </div>

          {/* City + Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                {t("addaddress.city")}
              </label>
              <input
                type="text"
                placeholder={t("addaddress.cityPlaceholder")}
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`w-full px-4 py-3.5 text-[14px] text-[#0b0b0a] border outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
                  fieldErrors.city ? "border-red-400" : "border-black/10 focus:border-black/30"
                }`}
              />
              <FieldError message={fieldErrors.city} />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                {t("addaddress.postalCode")}
              </label>
              <input
                type="text"
                placeholder={t("addaddress.postalCodePlaceholder")}
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className={`w-full px-4 py-3.5 text-[14px] text-[#0b0b0a] border outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
                  fieldErrors.postalCode || fieldErrors.postal_code ? "border-red-400" : "border-black/10 focus:border-black/30"
                }`}
              />
              <FieldError message={fieldErrors.postalCode || fieldErrors.postal_code} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-1">
            <button
              onClick={handleCloseModal}
              className="flex-1 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
            >
              {t("addaddress.cancel")}
            </button>
            <button
              onClick={handleSaveAddress}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
            >
              {isSaving && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {isSaving
                ? (isEditMode ? "Updating..." : "Saving...")
                : (isEditMode ? "Update Address" : t("addaddress.saveAddress"))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
