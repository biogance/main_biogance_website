"use client";

import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function ModalAddNewAddress({
  isOpen,
  onClose,
  onSave,
  activeTab,
  editData,
}) {
  const [formData, setFormData] = useState({
    addressType: "Home",
    streetAddress: "",
    country: "",
    city: "",
    postalCode: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        addressType: editData.type || "Home",
        streetAddress: editData.full_address || "",
        country: editData.country || "",
        city: editData.city || "",
        postalCode: editData.postal_code || "",
      });
    } else {
      setFormData({
        addressType: "Home",
        streetAddress: "",
        country: "",
        city: "",
        postalCode: "",
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors = {};
    if (!formData.addressType)
      tempErrors.addressType = "Address type is required";
    if (!formData.streetAddress.trim())
      tempErrors.streetAddress = "Street address is required";
    if (!formData.country.trim()) tempErrors.country = "Country is required";
    if (!formData.city.trim()) tempErrors.city = "City is required";
    if (!formData.postalCode.trim())
      tempErrors.postalCode = "Postal code is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);

    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;

    const body = {
      main_type: activeTab === "invoice" ? "invoice" : "delivery",
      type: formData.addressType,
      full_address: formData.streetAddress,
      country: formData.country,
      city: formData.city,
      postal_code: formData.postalCode,
      ...(!token && { device_id: getDeviceId() }),
      ...(isEditMode && { address_id: editData.id }),
    };

    const headers = token
      ? { Authorization: `Bearer ${token}`, token: token }
      : {};

    const url = isEditMode
      ? `${BASE_URL}/user/address/edit`
      : `${BASE_URL}/user/address/create`;

    try {
      const res = await axios.post(url, body, { headers });
      if (res.data.status === false) {
        toast.error(
          res.data.action_message ||
            res.data.action ||
            "Failed to save address",
        );
      } else {
        onSave();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving the address");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        fontFamily: FONT,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",

          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          overflow: "hidden",
          animation: "modalFadeIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 16px",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>
            {isEditMode ? "Edit Address" : "Add New Address"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#4B5563",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div
          style={{
            padding: "0 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Address Type */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "#4B5563",
                marginBottom: "6px",
              }}
            >
              Address type
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={formData.addressType}
                onChange={(e) =>
                  setFormData({ ...formData, addressType: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",

                  border: `1px solid ${errors.addressType ? "#EF4444" : "#D1D5DB"}`,
                  outline: "none",
                  backgroundColor: "#fff",
                  appearance: "none",
                  cursor: "pointer",
                  color: "#111",
                }}
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
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
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "6px solid #4B5563",
                }}
              />
            </div>
            {errors.addressType && (
              <span
                style={{
                  color: "#EF4444",
                  fontSize: "11px",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.addressType}
              </span>
            )}
          </div>

          {/* Street Address */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "#4B5563",
                marginBottom: "6px",
              }}
            >
              Street address
            </label>
            <input
              type="text"
              placeholder="e.g. 2972 Westheimer Rd."
              value={formData.streetAddress}
              onChange={(e) =>
                setFormData({ ...formData, streetAddress: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",

                border: `1px solid ${errors.streetAddress ? "#EF4444" : "#D1D5DB"}`,
                outline: "none",
                color: "#111",
              }}
            />
            {errors.streetAddress && (
              <span
                style={{
                  color: "#EF4444",
                  fontSize: "11px",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.streetAddress}
              </span>
            )}
          </div>

          {/* Country & City (Side by Side) */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#4B5563",
                  marginBottom: "6px",
                }}
              >
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. United State"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",

                  border: `1px solid ${errors.country ? "#EF4444" : "#D1D5DB"}`,
                  outline: "none",
                  color: "#111",
                }}
              />
              {errors.country && (
                <span
                  style={{
                    color: "#EF4444",
                    fontSize: "11px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.country}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#4B5563",
                  marginBottom: "6px",
                }}
              >
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Los Angeles"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",

                  border: `1px solid ${errors.city ? "#EF4444" : "#D1D5DB"}`,
                  outline: "none",
                  color: "#111",
                }}
              />
              {errors.city && (
                <span
                  style={{
                    color: "#EF4444",
                    fontSize: "11px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.city}
                </span>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "#4B5563",
                marginBottom: "6px",
              }}
            >
              Postal Code
            </label>
            <input
              type="text"
              placeholder="e.g. 7500"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",

                border: `1px solid ${errors.postalCode ? "#EF4444" : "#D1D5DB"}`,
                outline: "none",
                color: "#111",
              }}
            />
            {errors.postalCode && (
              <span
                style={{
                  color: "#EF4444",
                  fontSize: "11px",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.postalCode}
              </span>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#111",
              color: "#fff",
              border: "none",

              fontSize: "14px",
              fontWeight: 600,
              cursor: isSaving ? "not-allowed" : "pointer",
              marginTop: "8px",
              transition: "background 0.2s",
              opacity: isSaving ? 0.75 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = "#333";
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = "#111";
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
