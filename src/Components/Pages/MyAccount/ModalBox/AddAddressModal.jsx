"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import ReactFlagsSelect from "react-flags-select";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "../../../API/API";
import { getDeviceId } from "../../../../utils/deviceId";

export function AddAddressModal({ isOpen, onClose, onSave, activeTab, editData }) {
  const { t } = useTranslation("myaccount");

  const [formData, setFormData] = useState({
    addressType: "",
    country: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const modalCardRef = useRef(null);

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
    modalCardRef.current.classList.add('modal-shake');
    modalCardRef.current.addEventListener('animationend', () => {
      modalCardRef.current?.classList.remove('modal-shake');
    }, { once: true });
  }
 };

 const handleCloseModal = () => {
  setFormData({
    addressType: "",
    country: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });
  setIsDropdownOpen(false);
  setFieldErrors({});
  onClose();        // Sirf modal close karega, refresh nahi karega
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

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <style jsx global>{`
        .custom-country-select button::after {
          display: none !important;
        }
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li {
          color: black !important;
        }
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li:hover {
          background-color: black !important;
          color: white !important;
        }
        .custom-country-select input[type="text"]::placeholder {
          color: black !important;
          opacity: 0.6;
        }
        .custom-country-select input[type="text"] {
          color: black !important;
        }
        .custom-country-select button {
          color: #9ca3af !important;
        }
        .custom-country-select button[aria-label]:not([aria-label=""]) {
          color: black !important;
        }
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li[aria-selected="true"] {
          color: black !important;
        }
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li[aria-selected="true"]:hover {
          background-color: black !important;
          color: white !important;
        }
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ {
          border: 1px solid #e5e7eb !important;
          border-radius 0px;
        }
        .custom-country-select .ReactFlagsSelect-module_filterBox__3m8EU {
          border-bottom: 1px solid #e5e7eb !important;
        }
        .custom-country-select button {
          position: relative !important;
        }
        .custom-arrow-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: black;
          font-size: 24px;
          z-index: 20;
        }
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ {
          z-index: 30 !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
        <div
          ref={modalCardRef}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-4xl p-8 relative"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-black font-semibold">
              {t("addaddress.addAddress")}
            </h2>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Address Type + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Address Type */}
              <div className="relative">
                {fieldErrors.addressType && (
                  <span className="absolute -top-2 right-0 text-xs text-red-500">
                    {fieldErrors.addressType}
                  </span>
                )}
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.addressType")}
                </label>
                <input
                  type="text"
                  placeholder={t("addaddress.addressTypePlaceholder")}
                  value={formData.addressType}
                  onChange={(e) => handleInputChange("addressType", e.target.value)}
                  className={`w-full px-4 py-4 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black ${
                    fieldErrors.addressType ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>

              {/* Country */}
              <div className="relative">
                {fieldErrors.country && (
                  <span className="absolute -top-2 right-0 text-xs text-red-500">
                    {fieldErrors.country}
                  </span>
                )}
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.country")}
                </label>
                <div className="relative">
                  {isDropdownOpen && (
                    <div
                      className="fixed inset-0 bg-black/20 z-[15]"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                  <div className="relative z-20">
                    <ReactFlagsSelect
                      selected={formData.country}
                      onSelect={(code) => {
                        handleInputChange("country", code);
                        setIsDropdownOpen(false);
                      }}
                      placeholder={t("addaddress.selectCountryPlaceholder")}
                      searchable={true}
                      showSelectedLabel={true}
                      showOptionLabel={true}
                      className="w-full custom-country-select"
                      selectButtonClassName={`!w-full !px-4 !py-3 !bg-gray-50 !border hover:!bg-gray-100 focus:!ring-2 focus:!ring-gray-200 !text-left !pr-12 placeholder:!text-gray-400 ${
                        fieldErrors.country ? "!border-red-400" : "!border-gray-200"
                      }`}
                      optionsFilter={(countryCode) =>
                        ["US", "FR", "GB", "DE", "CA", "PK"].includes(countryCode)
                      }
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    />
                    {isDropdownOpen ? (
                      <MdOutlineKeyboardArrowUp className="custom-arrow-icon" />
                    ) : (
                      <MdKeyboardArrowDown className="custom-arrow-icon" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div className="relative">
              {fieldErrors.fullAddress && (
                <span className="absolute -top-2 right-0 text-xs text-red-500">
                  {fieldErrors.fullAddress}
                </span>
              )}
              {fieldErrors.full_address && (
                <span className="absolute -top-2 right-0 text-xs text-red-500">
                  {fieldErrors.full_address}
                </span>
              )}
              <label className="block text-black text-sm font-medium mb-2">
                {t("addaddress.fullAddress")}
              </label>
              <input
                type="text"
                placeholder={t("addaddress.fullAddressPlaceholder")}
                value={formData.fullAddress}
                onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                className={`w-full px-4 py-4 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black ${
                  fieldErrors.fullAddress || fieldErrors.full_address ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>

            {/* City + Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* City */}
              <div className="relative">
                {fieldErrors.city && (
                  <span className="absolute -top-2 right-0 text-xs text-red-500">
                    {fieldErrors.city}
                  </span>
                )}
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.city")}
                </label>
                <input
                  type="text"
                  placeholder={t("addaddress.cityPlaceholder")}
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full px-4 py-4 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black ${
                    fieldErrors.city ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>

              {/* Postal Code */}
              <div className="relative">
                {(fieldErrors.postalCode || fieldErrors.postal_code) && (
                  <span className="absolute -top-2 right-0 text-xs text-red-500">
                    {fieldErrors.postalCode || fieldErrors.postal_code}
                  </span>
                )}
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.postalCode")}
                </label>
                <input
                  type="text"
                  placeholder={t("addaddress.postalCodePlaceholder")}
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  className={`w-full px-4 py-4 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black ${
                    fieldErrors.postalCode || fieldErrors.postal_code ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={handleCloseModal}
              className="flex-1 py-3.5 px-6 cursor-pointer border-2 border-gray-300 text-black hover:bg-gray-50 transition-colors font-medium"
            >
              {t("addaddress.cancel")}
            </button>
            <button
              onClick={handleSaveAddress}
              disabled={isSaving}
              className="flex-1 py-3.5 px-6 cursor-pointer bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving
                ? isEditMode ? "Updating..." : "Saving..."
                : isEditMode ? "Update Address" : t("addaddress.saveAddress")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}