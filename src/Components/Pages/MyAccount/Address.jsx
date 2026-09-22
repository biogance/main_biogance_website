"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbPencil, TbMapPin, TbBuildingSkyscraper, TbWorld } from "react-icons/tb";
import { AddAddressModal } from "./ModalBox/AddAddressModal";
import DeleteAddressModal from "./ModalBox/DeleteAddressModal";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

// One shimmer block — every skeleton on this page is built from this.
const Bone = ({ className = "" }) => (
  <div
    className={`bg-black/[0.06] ${className}`}
    style={{ animation: "addrShimmer 1.5s ease-in-out infinite" }}
  />
);

// A compact stat tile — a glossy icon badge (same family as the icon
// buttons elsewhere in the account section) plus a label/value pair.
const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 border border-black/10 bg-black/[0.02] px-4 py-3.5">
    <span className="relative grid h-9 w-9 shrink-0 place-items-center bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)]">
      <Icon
        className="h-4 w-4"
        style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
      />
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#8a8880] uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[14px] font-semibold text-[#0b0b0a]">
        {value || "—"}
      </p>
    </div>
  </div>
);

// A glossy icon button — same treatment as Edit/Delete elsewhere in the
// account section (PetProfile). Delete turns red on hover, icon stays white.
function IconButton({ icon: Icon, danger = false, ...props }) {
  return (
    <button
      type="button"
      className={`relative grid h-10 w-10 shrink-0 cursor-pointer place-items-center overflow-hidden bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] hover:-translate-y-px active:translate-y-0 ${
        danger ? "hover:from-red-600 hover:to-red-700" : ""
      }`}
      {...props}
    >
      <Icon
        className="h-[18px] w-[18px]"
        style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
      />
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    </button>
  );
}

function AddressCard({
  address,
  isDefault,
  onSetDefault,
  onEdit,
  onDelete,
  t,
}) {
  const typeLabel = address.type || "Address";

  return (
    <article className="relative overflow-hidden border border-black/10 bg-white transition-shadow duration-300 hover:shadow-[0_30px_60px_-32px_rgba(0,0,0,.3)]">
      <span
        className={`absolute left-0 top-8 bottom-8 w-[3px] bg-gradient-to-b ${
          isDefault ? "from-[#403e38] to-[#0b0b0a]" : "bg-black/10"
        }`}
      />

      <div className="px-6 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onSetDefault}
            className="min-w-0 flex-1 text-left cursor-pointer"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex bg-[#0b0b0a] px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-white uppercase">
                {typeLabel}
              </span>
              {isDefault && (
                <span className="text-[11px] font-medium text-[#8a8880]">
                  {t('address.default')}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#0b0b0a] sm:text-[22px]">
              {typeLabel} {t('address.addressWord')}
            </h3>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <IconButton icon={TbPencil} aria-label="Edit address" onClick={onEdit} />
            <IconButton icon={RiDeleteBin6Line} danger aria-label="Delete address" onClick={onDelete} />
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#8a8880]">
          {address.full_address}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile icon={TbMapPin} label={t("address.city")} value={address.city} />
          <InfoTile
            icon={TbBuildingSkyscraper}
            label={t("address.postalCode")}
            value={address.postal_code}
          />
          <InfoTile icon={TbWorld} label={t("address.country")} value={address.country} />
        </div>
      </div>
    </article>
  );
}

const AddressCardShimmer = () => (
  <div className="relative overflow-hidden border border-black/10 bg-white">
    <Bone className="absolute left-0 top-8 bottom-8 w-[3px]" />
    <div className="px-6 py-5 sm:px-7 sm:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Bone className="h-6 w-20" />
          <Bone className="mt-3 h-7 w-48" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-10 w-10" />
          <Bone className="h-10 w-10" />
        </div>
      </div>
      <Bone className="mt-4 h-4 w-full max-w-xl" />
      <Bone className="mt-2 h-4 w-2/3 max-w-md" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Bone className="h-[72px]" />
        <Bone className="h-[72px]" />
        <Bone className="h-[72px]" />
      </div>
    </div>
  </div>
);

export default function Address() {
  const { t } = useTranslation('myaccount');
  const { t: tSidebar } = useTranslation('sidebar');
  const [activeTab, setActiveTab] = useState("delivery");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Same error handler as AddAddressModal
  const getApiErrorMessage = (data) => {
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || data.errors[0];
    }
    if (data?.action_message) return data.action_message;
    if (data?.action) return data.action;
    return "Something went wrong";
  };

  const fetchAddresses = useCallback(async (tab) => {
    setIsLoading(true);
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const body = token ? {} : { device_id: getDeviceId() };
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await axios.post(`${BASE_URL}/user/address/list/${tab}`, body, { headers });

      if (res.data.status === false) {
        toast.error(getApiErrorMessage(res.data));
        setAddresses([]);
      } else {
        setAddresses(res.data.data || []);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err.response?.data));
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses(activeTab);
  }, [activeTab, fetchAddresses]);

  const handleEdit = (address) => {
    setEditAddress(address);
    setIsModalOpen(true);
  };

  const handleAddAddress = () => {
    setEditAddress(null);
    setIsModalOpen(true);
  };

 const handleCloseModal = (shouldRefresh = true) => {
  setIsModalOpen(false);
  setEditAddress(null);

  if (shouldRefresh) {
    fetchAddresses(activeTab);
  }
};

  const handleSaveAddress = () => handleCloseModal(true);

  const handleSetDefault = async (address) => {
    setSelectedAddress(address.id);
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const body = {
      address_id: address.id,
      main_type: activeTab === "invoice" ? "invoice" : "delivery",
      type: address.type,
      full_address: address.full_address,
      country: address.country,
      city: address.city,
      postal_code: address.postal_code,
      is_default: 1,
      ...(!token && { device_id: getDeviceId() }),
    };
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await axios.post(`${BASE_URL}/user/address/edit`, body, { headers });
      if (res.data.status === false) {
        toast.error(getApiErrorMessage(res.data));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err.response?.data));
    }
  };

  const handleDeleteClick = (id) => setDeleteAddressId(id);

  const handleDeleteClose = () => setDeleteAddressId(null);

  const handleDeleted = () => {
    setDeleteAddressId(null);
    fetchAddresses(activeTab);
  };

  const hasAddresses = addresses.length > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes addrShimmer { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
      `}} />

      {/* No min-h-screen — MyAccount.jsx's wrapper already provides a full
          viewport (navbar clearance included); stacking another one here
          forced this tab an extra viewport tall even on short/empty
          content, causing a page scrollbar on the empty state at any
          screen size or zoom level. */}
      <div className="bg-[#f3f3f3]">
        {/* mt-2 on mobile, not mt-9 — that was stacking on top of
            Sidebar.jsx's own bottom padding on the mobile tab row, leaving
            a big empty gap before this card started. md:mt-9 keeps desktop
            unchanged, same pattern as Dashboard.jsx's mt-2 md:mt-10 fix. */}
        <div className="p-4 sm:p-6 md:p-8 mt-2 md:mt-9 max-w-10xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 md:mb-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
                {tSidebar('groupAccount')}
              </p>
              <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
                {t('address.title')}
              </h1>
              <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
                {t('address.subtitle')}
              </p>
            </div>

            <button
              onClick={handleAddAddress}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer whitespace-nowrap"
            >
              {t('address.addAddress')}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2.5 mb-8 md:mb-10">
            <button
              onClick={() => setActiveTab("delivery")}
              className={`px-5 py-2.5 cursor-pointer border text-[13.5px] font-medium tracking-[0.02em] transition-colors duration-200 ${
                activeTab === "delivery"
                  ? "bg-[#0b0b0a] text-white border-[#0b0b0a]"
                  : "bg-white text-[#5c5a54] border-black/10 hover:border-black/25"
              }`}
            >
              {t('address.deliveryAddress')}
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={`px-5 py-2.5 cursor-pointer border text-[13.5px] font-medium tracking-[0.02em] transition-colors duration-200 ${
                activeTab === "invoice"
                  ? "bg-[#0b0b0a] text-white border-[#0b0b0a]"
                  : "bg-white text-[#5c5a54] border-black/10 hover:border-black/25"
              }`}
            >
              {t('address.invoiceAddress')}
            </button>
          </div>

          {/* Main Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 2 }).map((_, i) => <AddressCardShimmer key={i} />)}
            </div>
          ) : hasAddresses ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isDefault={selectedAddress === address.id || address.is_default == 1}
                  onSetDefault={() => handleSetDefault(address)}
                  onEdit={() => handleEdit(address)}
                  onDelete={() => handleDeleteClick(address.id)}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-black/10 flex flex-col items-center justify-center min-h-[40vh] py-12 px-4">
              <div className="w-48 h-48 md:w-64 md:h-64 mb-6">
                <img src="/address.svg" alt={t('address.emptyAlt')} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0b0b0a] mb-2">
                {t('address.emptyTitle')}
              </h3>
              <p className="text-[13.5px] text-[#8a8880] text-center max-w-md mb-6 leading-relaxed">
                {t('address.emptyDescription')}
              </p>
              <button
                onClick={handleAddAddress}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
              >
                {t('address.addFirstAddress')}
              </button>
            </div>
          )}
        </div>

        <DeleteAddressModal
          isOpen={!!deleteAddressId}
          onClose={handleDeleteClose}
          onDeleted={handleDeleted}
          addressId={deleteAddressId}
        />

        <AddAddressModal
          activeTab={activeTab}
          isOpen={isModalOpen}
         onClose={() => handleCloseModal(false)}
          onSave={handleSaveAddress}
          editData={editAddress}
        />
      </div>
    </>
  );
}
