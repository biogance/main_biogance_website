"use client";

import React, { useEffect, useState, useCallback } from "react";
import { IoAddOutline } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";
import ModalAddNewAddress from "./ModalAddNewAddress";
import { BiEditAlt } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function ModalChangeAddress({
  isOpen,
  onClose,
  onSelect,
  activeTab,
}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const body = token ? {} : { device_id: getDeviceId() };
    const headers = token
      ? { Authorization: `Bearer ${token}`, token: token }
      : {};

    const apiTab = activeTab === "invoice" ? "invoice" : "delivery";

    try {
      const res = await axios.post(
        `${BASE_URL}/user/address/list/${apiTab}`,
        body,
        { headers },
      );
      if (res.data.status !== false) {
        const list = res.data.data || [];
        setAddresses(list);

        if (list.length > 0) {
          const defaultAddr = list.find(
            (a) => a.is_default === 1 || a.is_default === "1",
          );
          if (defaultAddr) {
            setSelectedId(defaultAddr.id);
          } else {
            setSelectedId(list[0].id);
          }
        }
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error(err);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen, fetchAddresses]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    if (!deleteAddressId) return;

    setIsDeleting(true);

    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const headers = token
      ? { Authorization: `Bearer ${token}`, token: token }
      : {};
    const body = token ? {} : { device_id: getDeviceId() };

    try {
      const res = await axios.get(
        `${BASE_URL}/user/address/delete/${deleteAddressId}`,
        { headers, params: body },
      );
      if (res.data.status !== false) {
        if (selectedId === deleteAddressId) {
          setSelectedId(null);
        }
        setDeleteAddressId(null);
        fetchAddresses();
      } else {
        toast.error(res.data.action || "Failed to delete address");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (address, e) => {
    e.stopPropagation();
    setEditData(address);
    setIsAddNewOpen(true);
  };

  const handleAddNewClick = () => {
    setEditData(null);
    setIsAddNewOpen(true);
  };

  const handleAddressSelect = async (addressId) => {
    if (addressId === selectedId) return;

    setSelectedId(addressId);

    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const body = {
      id: addressId,
      ...(!token && { device_id: getDeviceId() }),
    };
    const headers = token
      ? { Authorization: `Bearer ${token}`, token: token }
      : {};

    try {
      setIsSaving(true);
      const res = await axios.post(`${BASE_URL}/user/address/default`, body, {
        headers,
      });

      if (res.data.status === false) {
        toast.error(res.data.action || "Failed to set default address");
      } else {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            is_default: addr.id === addressId ? 1 : 0,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to set default address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSelection = () => {
    const selectedAddress = addresses.find((a) => a.id === selectedId);
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    onSelect(selectedAddress);
    onClose();
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
        zIndex: 1100,
        fontFamily: FONT,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",

          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
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
            padding: "24px 24px 12px",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>
            Select {activeTab === "invoice" ? "Billing" : "Delivery"} Address
          </span>
          <button
            onClick={handleAddNewClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              border: "1px solid #D1D5DB",

              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#F9FAFB")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            <IoAddOutline size={20} />
            Add new Address
          </button>
        </div>

        {/* Subtitle */}
        <div
          style={{ padding: "0 24px 16px", fontSize: "13px", color: "#6B7280" }}
        >
          Choose where you{"'"}d like us to{" "}
          {activeTab === "invoice" ? "bill" : "deliver"} your order.
        </div>

        {/* Address Cards List */}
       <div
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "0 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }}
>
  {isLoading ? (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
      }}
    >
      <CgSpinner
        size={38}
        style={{
          color: "#000000",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  ) : addresses.length === 0 ? (
    <div
      style={{ 
        padding: "60px 20px", 
        textAlign: "center", 
        color: "#6B7280" 
      }}
    >
      No addresses saved. Please add a new address.
    </div>
          ) : (
            addresses.map((address) => {
              const isSelected = address.id === selectedId;
              return (
                <div
                  key={address.id}
                  onClick={() => handleAddressSelect(address.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "18px",

                    border: isSelected
                      ? "1.5px solid #111"
                      : "1.5px solid #E5E7EB",
                    backgroundColor: isSelected ? "#FAFBFB" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Custom Radio Button */}
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#111" : "#D1D5DB"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "3px",
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#111",
                        }}
                      />
                    )}
                  </div>

                  {/* Address Content */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#4B5563",
                          backgroundColor: "#F3F4F6",
                          padding: "2px 8px",

                          border: "1px solid #E5E7EB",
                          textTransform: "capitalize",
                        }}
                      >
                        {address.type}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#1F2937",
                        lineHeight: 1.5,
                      }}
                    >
                      {address.full_address && `${address.full_address}, `}
                      {address.city && `${address.city}, `}
                      {address.country}
                      {address.postal_code && ` ${address.postal_code}`}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignSelf: "center",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteAddressId(address.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9CA3AF",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#EF4444")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#9CA3AF")
                      }
                    >
                      <RiDeleteBinLine size={18} />
                    </button>
                    <button
                      onClick={(e) => handleEdit(address, e)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9CA3AF",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#111")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#9CA3AF")
                      }
                    >
                      <BiEditAlt size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px 24px 24px",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #D1D5DB",

              backgroundColor: "#fff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#F9FAFB")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            Cancel
          </button>
          <button
       
            disabled={addresses.length === 0 || isSaving}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              backgroundColor:
                addresses.length === 0 || isSaving ? "#9CA3AF" : "#111",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor:
                addresses.length === 0 || isSaving ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              opacity: isSaving ? 0.85 : 1,
            }}
            onMouseEnter={(e) => {
              if (addresses.length > 0 && !isSaving) {
                e.currentTarget.style.backgroundColor = "#333";
              }
            }}
            onMouseLeave={(e) => {
              if (addresses.length > 0 && !isSaving) {
                e.currentTarget.style.backgroundColor = "#111";
              }
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Nesting AddNew/Edit Modal on Top */}
      <ModalAddNewAddress
        isOpen={isAddNewOpen}
        onClose={() => setIsAddNewOpen(false)}
        onSave={fetchAddresses}
        activeTab={activeTab}
        editData={editData}
      />

      {/* Delete Confirmation Modal */}
      {deleteAddressId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            fontFamily: FONT,
            padding: "16px",
          }}
          onClick={() => {
            if (!isDeleting) setDeleteAddressId(null);
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",

              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              overflow: "hidden",
              padding: "24px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 12px",
              }}
            >
              Delete Address
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6B7280",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete this address?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setDeleteAddressId(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #D1D5DB",

                  backgroundColor: "#fff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.6 : 1,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting)
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting)
                    e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",

                  backgroundColor: isDeleting ? "#6B7280" : "#111",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting)
                    e.currentTarget.style.backgroundColor = "#333";
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting)
                    e.currentTarget.style.backgroundColor = "#111";
                }}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
