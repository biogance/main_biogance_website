"use client";

import { useState, useEffect, useRef } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import {
  HiOutlineCamera,
  HiOutlineInformationCircle,
  HiOutlineTrash,
} from "react-icons/hi2";
import { IoPersonOutline, IoMailOutline, IoCallOutline, IoArrowForward } from "react-icons/io5";
import {
  FlagImage,
  defaultCountries,
  parseCountry,
} from "react-international-phone";
import { RiUserLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getPhoneValidationErrorCode } from "../../../utils/phoneValidation";
import toast from "react-hot-toast";

// Maps getPhoneValidationErrorCode's return value to a myaccount.json
// userProfile.* key.
const PHONE_ERROR_KEYS = {
  required: "errorPhoneRequired",
  tooShort: "errorPhoneTooShort",
  tooLong: "errorPhoneTooLong",
  invalid: "errorPhoneInvalid",
};

const getDialCodeByIso2 = (iso2) => {
  const country = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
  return country ? `+${parseCountry(country).dialCode}` : "";
};

const getIso2ByDialCode = (dialCode) => {
  if (!dialCode) return "fr";
  const clean = String(dialCode).replace("+", "").trim();
  const country = defaultCountries.find(
    (c) => parseCountry(c).dialCode === clean,
  );
  return country ? parseCountry(country).iso2 : "fr";
};

// A text field with a solid icon badge (same graphic weight as the KPI/info
// badges elsewhere in the account section) instead of a faint outlined icon,
// a filled resting state that lifts to white + a shadow on focus, and a
// gradient underline — the whole thing reads as one designed component
// instead of a plain bordered box.
function TextField({ icon: Icon, error, className = "", ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div
        className={`group relative flex items-stretch transition-all duration-200 overflow-hidden ${
          error
            ? "bg-white border border-red-500 ring-2 ring-red-100"
            : focused
              ? "bg-white border border-black/25 shadow-[0_16px_32px_-20px_rgba(0,0,0,.4)]"
              : "bg-black/[0.035] border border-transparent hover:bg-black/[0.055]"
        } ${className}`}
      >
        <span className="grid place-items-center w-12 shrink-0 bg-gradient-to-br from-[#2b2a26] to-[#0b0b0a] text-white transition-transform duration-200 group-focus-within:scale-[1.04]">
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <input
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          className="flex-1 min-w-0 h-[50px] px-4 bg-transparent focus:outline-none text-[15px] font-medium text-[#0b0b0a] placeholder:text-[#8a8880] placeholder:font-normal"
        />
        <span
          aria-hidden="true"
          className={`absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
            focused ? "w-full" : "w-0"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

// Flag + dial code box, with a separate number field and a searchable country dropdown
function PhoneFieldBox({
  iso2,
  onCountryChange,
  value,
  onChange,
  onBlur,
  error,
  searchPlaceholder,
  noResultsLabel,
}) {
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
    <div>
      <div
        ref={wrapRef}
        className={`group relative flex items-stretch transition-all duration-200 overflow-hidden ${
          error
            ? "bg-white border border-red-500 ring-2 ring-red-100"
            : focused
              ? "bg-white border border-black/25 shadow-[0_16px_32px_-20px_rgba(0,0,0,.4)]"
              : "bg-black/[0.035] border border-transparent hover:bg-black/[0.055]"
        }`}
      >
        {/* Leading icon — kept inside the same field as the flag and number,
            so this reads consistently with Full Name/Email (one designed
            component, icon flush at its start). */}
        <span className="grid place-items-center w-12 shrink-0 bg-gradient-to-br from-[#2b2a26] to-[#0b0b0a] text-white transition-transform duration-200 group-focus-within:scale-[1.04]">
          <IoCallOutline className="w-[18px] h-[18px]" />
        </span>

        {/* Flag + dial code */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-[50px] border-r border-black/10 shrink-0 cursor-pointer hover:bg-black/[0.04] transition-colors focus:outline-none"
        >
          <FlagImage iso2={iso2 || "fr"} size="20px" />
          <span className="text-[14px] font-medium text-[#0b0b0a]">{dialCode}</span>
          <MdOutlineKeyboardArrowDown
            className={`text-[#8a8880] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            size={16}
          />
        </button>

        {/* Number */}
        <div className="relative flex-1">
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            className="w-full h-[50px] px-4 bg-transparent focus:outline-none text-[#0b0b0a] text-[15px] font-medium"
          />
        </div>

        <span
          aria-hidden="true"
          className={`absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
            focused ? "w-full" : "w-0"
          }`}
        />

        {open && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)] z-20">
            <div className="p-2 border-b border-black/10">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 text-[13.5px] bg-white border border-black/10 text-[#0b0b0a] focus:outline-none focus:border-black/40"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <p className="px-3 py-4 text-[13px] text-[#8a8880] text-center">
                  {noResultsLabel}
                </p>
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
                    className={`group w-full flex items-center gap-2 px-3 py-2.5 text-[13.5px] text-left text-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white transition-colors cursor-pointer ${p.iso2 === iso2 ? "bg-black/[0.04]" : ""}`}
                  >
                    <FlagImage iso2={p.iso2} size="18px" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-[#8a8880] group-hover:text-white/60">
                      +{p.dialCode}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

export default function UserProfile() {
  const { t } = useTranslation("myaccount");
  const { t: tSidebar } = useTranslation("sidebar");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country_code: "",
    phone_number: "",
  });
  const [countryIso2, setCountryIso2] = useState("fr");
  const [phoneError, setPhoneError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const splashData = localStorage.getItem("splashData");
    if (splashData) {
      const user = JSON.parse(splashData)?.user;
      if (user) {
        setFormData({
          fullName: user.name || "",
          email: user.email || "",
          country_code: user.country_code || "",
          // NOTE: `phone` is the local number without the dial code
          // (e.g. "743453453"). `phone_number` is the FULL number
          // with dial code already prefixed (e.g. "+33743453453")
          // — that one must NOT go into the number input, since the
          // dial code is already shown separately by the flag box.
          phone_number: user.phone || "",
        });
        setCountryIso2(getIso2ByDialCode(user.country_code));
        if (user.profile_picture) {
          setImageLoading(true);
          setProfileImage(`${MEDIA_URL}${user.profile_picture}`);
        }
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImageLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    document.getElementById("profile-upload").click();
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImageFile(null);
    setImageLoading(false);
    setShowPreview(false);
    document.getElementById("profile-upload").value = "";
  };

  const handleCancel = () => {
    const splashData = localStorage.getItem("splashData");
    if (splashData) {
      const user = JSON.parse(splashData)?.user;
      if (user) {
        setFormData({
          fullName: user.name || "",
          email: user.email || "",
          country_code: user.country_code || "",
          // Same fix as above — use the local `phone`, not the
          // dial-code-prefixed `phone_number`.
          phone_number: user.phone || "",
        });
        setCountryIso2(getIso2ByDialCode(user.country_code));
        if (user.profile_picture) {
          setImageLoading(true);
          setProfileImage(`${MEDIA_URL}${user.profile_picture}`);
        } else {
          setProfileImage(null);
        }
      }
    }
    setProfileImageFile(null);
    setShowPreview(false);
  };

  // Validates the phone number's digit count and leading-digit pattern
  // against whichever country is currently selected (e.g. a French number
  // needs 9 digits after +33 starting 6/7; a Pakistani number needs 10
  // digits after +92 starting 3) — returns true when valid.
  const validatePhone = () => {
    const code = getPhoneValidationErrorCode(
      formData.phone_number,
      countryIso2 || "fr",
    );
    setPhoneError(code ? t(`userProfile.${PHONE_ERROR_KEYS[code]}`) : null);
    return !code;
  };

  const handleSubmit = async () => {
    if (!validatePhone()) return;

    const splashData = localStorage.getItem("splashData");
    const token = splashData ? JSON.parse(splashData)?.user?.token : null;

    const body = new FormData();
    body.append("name", formData.fullName);
    body.append("email", formData.email);
    body.append("country_code", formData.country_code);
    body.append("phone", formData.phone_number);
    body.append(
      "phone_number",
      `${formData.country_code}${formData.phone_number}`,
    );
    if (profileImageFile) body.append("profile_picture", profileImageFile);

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || "Something went wrong.");
      } else if (data?.user) {
        const updated = {
          ...JSON.parse(localStorage.getItem("splashData")),
          user: data.user,
        };
        localStorage.setItem("splashData", JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    if (profileImage) {
      setShowPreview(true);
    }
  };

  // Prevent background scrolling when preview is open
  useEffect(() => {
    if (showPreview) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scrolling
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showPreview]);

  return (
    <>
      <div className="bg-[#f3f3f3]">
        <div className="p-4 md:p-8 max-w-10xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-10">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
              {tSidebar("groupAccount")}
            </p>
            <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
              {t("userProfile.title")}
            </h1>
            <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
              {t("userProfile.subtitle")}
            </p>
          </div>

          {/* One card: avatar banner up top, fields in a two-column grid
              below, actions pinned to the bottom — same shape as the
              reference, in our own sharp black/white theme. A monochrome
              gradient (never a colour) is what "premium" means on this
              theme — ink fading to charcoal, not blue-to-purple. */}
          <div className="relative bg-white border border-black/10  overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a]"
            />

            {/* Avatar banner */}
            <div className="p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 bg-gradient-to-br from-black/[0.045] to-black/[0.01] border border-black/10 p-5 sm:p-6">
                <div className="shrink-0 p-[3px] bg-gradient-to-br from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a]">
                <div
                  onClick={handleImageClick}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-white flex items-center justify-center overflow-hidden ${
                    profileImage
                      ? "cursor-pointer hover:opacity-90 transition-opacity"
                      : ""
                  }`}
                >
                  {profileImage ? (
                    <>
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/[0.03]">
                          <div className="w-6 h-6 border-2 border-[#0b0b0a] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <img
                        src={profileImage}
                        alt="Profile"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                    </>
                  ) : (
                    <RiUserLine size={40} className="text-black/15" />
                  )}
                </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#0b0b0a]">
                    {t("userProfile.avatarTitle")}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-[#8a8880]">
                    {t("userProfile.avatarDescription")}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13px] font-medium cursor-pointer border border-[#0b0b0a] shadow-[0_10px_24px_-12px_rgba(0,0,0,.5)] transition-all duration-200 hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,.6)] hover:-translate-y-px"
                  >
                   <FiUploadCloud className="w-4 h-4" />
                    {t("userProfile.uploadNewPhoto")}
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#0b0b0a] text-[13px] font-medium cursor-pointer border border-black/15 hover:bg-black/[0.03] transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      {t("userProfile.remove")}
                    </button>
                  )}
                </div>
              </div>

              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="h-px bg-black/10" />

            {/* Fields — a two-column grid, same as the reference */}
            <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
                  {t("userProfile.fullName")} <span className="text-red-500">*</span>
                </label>
                <TextField
                  icon={IoPersonOutline}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={t("userProfile.fullNamePlaceholder")}
                />
              </div>

              <div>
                <label className="block mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
                  {t("userProfile.phoneNumber")} <span className="text-red-500">*</span>
                </label>
                <PhoneFieldBox
                  iso2={countryIso2}
                  onCountryChange={(iso2) => {
                    setCountryIso2(iso2);
                    setFormData((prev) => ({
                      ...prev,
                      country_code: getDialCodeByIso2(iso2),
                    }));
                    setPhoneError(null);
                  }}
                  value={formData.phone_number}
                  onChange={(phone_number) => {
                    setFormData((prev) => ({ ...prev, phone_number }));
                    if (phoneError) setPhoneError(null);
                  }}
                  onBlur={validatePhone}
                  error={phoneError}
                  searchPlaceholder={t("userProfile.searchCountry")}
                  noResultsLabel={t("userProfile.noCountryFound")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
                  {t("userProfile.email")} <span className="text-red-500">*</span>
                </label>
                <TextField
                  icon={IoMailOutline}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("userProfile.emailPlaceholder")}
                />
              </div>

              <div className="sm:col-span-2 flex items-start gap-4 bg-black/[0.03] border-l-2 border-[#0b0b0a] px-5 py-4">
                <span className="grid place-items-center w-8 h-8 shrink-0 bg-gradient-to-br from-[#2b2a26] to-[#0b0b0a] text-white">
                  <HiOutlineInformationCircle className="w-[18px] h-[18px]" />
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#0b0b0a]">
                    {t("userProfile.keepUpdated")}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-[#8a8880]">
                    {t("userProfile.keepUpdatedHint")}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-black/10" />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-5 sm:px-8 py-6">
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-[230px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {loading ? t("userProfile.updating") : t("userProfile.updateProfileDetails")}
                <IoArrowForward className="w-[15px] h-[15px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-70 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-11 right-0 grid place-items-center w-9 h-9 cursor-pointer text-white border border-white/30 hover:bg-white hover:text-[#0b0b0a] transition-colors"
            >
              <FiX size={20} />
            </button>
            <img
              src={profileImage}
              alt="Profile Preview"
              className="w-[min(500px,80vw)] h-[min(500px,80vw)] object-cover border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
