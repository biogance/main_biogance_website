"use client";

import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import ReactFlagsSelect from "react-flags-select";

export function AddAddressModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    addressType: "",
    country: "", 
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Country selection is handled by ReactFlagsSelect

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
    // Optional: Convert country code to full name if needed
    // const fullCountryName = countryList().getLabel(formData.country) || formData.country;
    // Then use fullCountryName in onSave if required

    console.log("Saving address:", formData);
    onSave(formData);
    handleCloseModal();
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx global>{`
        /* Country Select Custom Styles */

        /* Hide default arrow icon */
        .custom-country-select button::after {
          display: none !important;
        }

        /* Dropdown list items text color black */
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li {
          color: black !important;
        }

        /* Hover effect - black background with white text */
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li:hover {
          background-color: black !important;
          color: white !important;
        }

        /* Search input placeholder color black */
        .custom-country-select input[type="text"]::placeholder {
          color: black !important;
          opacity: 0.6;
        }

        /* Search input text color */
        .custom-country-select input[type="text"] {
          color: black !important;
        }

        /* Keep button placeholder gray like other inputs */
        .custom-country-select button {
          color: #9ca3af !important;
        }

        /* When country is selected, text should be black */
        .custom-country-select button[aria-label]:not([aria-label=""]) {
          color: black !important;
        }

        /* Selected option in dropdown */
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li[aria-selected="true"] {
          color: black !important;
        }

        /* Selected option on hover */
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ li[aria-selected="true"]:hover {
          background-color: black !important;
          color: white !important;
        }

        /* Additional styling for better appearance */
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ {
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
        }

        .custom-country-select .ReactFlagsSelect-module_filterBox__3m8EU {
          border-bottom: 1px solid #e5e7eb !important;
        }

        /* Custom arrow icon positioning */
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

        /* Dropdown options z-index */
        .custom-country-select .ReactFlagsSelect-module_selectOptions__3LNBJ {
          z-index: 30 !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-8 relative">
          {/* Modal Header */}
          <h2 className="text-2xl text-black font-semibold mb-6">Add Address</h2>

          {/* Form */}
          <div className="space-y-4">
            {/* Address Type and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-black text-sm mb-2">Address Type</label>
                <input
                  type="text"
                  placeholder="eg: Home"
                  value={formData.addressType}
                  onChange={(e) => handleInputChange("addressType", e.target.value)}
                  className="w-full px-4 text-black py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-black text-sm mb-2">Country</label>
                <div className="relative">
                  {/* Backdrop for dropdown */}
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
                      placeholder="eg: USA"
                      searchable={true}
                      showSelectedLabel={true}
                      showOptionLabel={true}
                      className="w-full custom-country-select"
                      selectButtonClassName="!w-full !px-4 !py-2  !bg-gray-50 !border-0 hover:!bg-gray-100 focus:!ring-2 focus:!ring-gray-200 !text-left !pr-12 !rounded-md placeholder:!text-gray-400"
                      optionsFilter={(countryCode) => ["US", "FR", "GB", "DE", "CA", "PK"].includes(countryCode)}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    />
                    
                    {/* Custom Arrow Icon - Changes based on dropdown state */}
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
              <label className="block text-black text-sm mb-2">Full Address</label>
              <input
                type="text"
                placeholder="eg: 123 Highland Rd, Someplace, CA 91234"
                value={formData.fullAddress}
                onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                className="w-full px-4 text-black py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
              />
            </div>

            {/* City and Postal/Zip Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-black text-sm mb-2">City</label>
                <input
                  type="text"
                  placeholder="eg: New York"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-4 text-black py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-black text-sm mb-2">Postal/Zip Code</label>
                <input
                  type="text"
                  placeholder="eg: 90210"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  className="w-full px-4 text-black py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCloseModal}
              className="flex-1 cursor-pointer text-black px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAddress}
              className="flex-1 cursor-pointer px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>
    </>
  );
}