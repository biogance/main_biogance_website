"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import ReactFlagsSelect from "react-flags-select";

export function AddAddressModal({ isOpen, onClose, onSave }) {
  const { t } = useTranslation("myaccount"); // ← use your namespace here

  const [formData, setFormData] = useState({
    addressType: "",
    country: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    onClose();
  };

  const handleSaveAddress = () => {
    // You can optionally map country code → full translated name here
    // Example: const countryName = t(`countries.${formData.country}`);
    console.log("Saving address:", formData);
    onSave(formData);
    handleCloseModal();
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
      <style jsx global>{`
        /* Your existing custom styles remain unchanged */
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
          border-radius: 0.5rem !important;
        }
        .custom-country-select .ReactFlagsSelect-module_filterBox__3m8EU {
          border-bottom: 1px solid #e5e7eb !important;
        }
        .custom-country-select button {
          position: relative !important;
          border-radius: 0.5rem !important;
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

      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-8 relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-black font-semibold">
              {t("addaddress.addAddress")}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700"
              aria-label={t("common.close")}
            >
              <IoClose size={28} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Address Type + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.addressType")}
                </label>
                <input
                  type="text"
                  placeholder={t("addaddress.addressTypePlaceholder")}
                  value={formData.addressType}
                  onChange={(e) => handleInputChange("addressType", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black"
                />
              </div>

              <div>
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
                      selectButtonClassName="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 hover:!bg-gray-100 focus:!ring-2 focus:!ring-gray-200 !text-left !pr-12 !rounded-lg placeholder:!text-gray-400"
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
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                {t("addaddress.fullAddress")}
              </label>
              <input
                type="text"
                placeholder={t("addaddress.fullAddressPlaceholder")}
                value={formData.fullAddress}
                onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black"
              />
            </div>

            {/* City + Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.city")}
                </label>
                <input
                  type="text"
                  placeholder={t("addaddress.cityPlaceholder")}
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black"
                />
              </div>

              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  {t("addaddress.postalCode")}
                </label>
                <input
                  type="text"
                  placeholder={t("addaddress.postalCodePlaceholder")}
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 text-black"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={handleCloseModal}
              className="flex-1 py-3.5 px-6 cursor-pointer border-2 border-gray-300 text-black rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t("addaddress.cancel")}
            </button>
            <button
              onClick={handleSaveAddress}
              className="flex-1 py-3.5 px-6 cursor-pointer bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              {t("addaddress.saveAddress")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}