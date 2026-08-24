"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbPencil } from "react-icons/tb";
import { AddAddressModal } from "./ModalBox/AddAddressModal";
import DeleteAddressModal from "./ModalBox/DeleteAddressModal";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";
import { getDeviceId } from "../../../utils/deviceId";

// Address Card Shimmer Component
const AddressCardShimmer = () => (
  <div className="bg-white p-4 border border-gray-200">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {/* Radio button shimmer */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        {/* Type shimmer */}
        <div
          style={{
            width: '60px',
            height: '20px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>

      <div className="flex gap-2">
        {/* Edit button shimmer */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        {/* Delete button shimmer */}
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
    </div>

    {/* Street address shimmer */}
    <div
      style={{
        width: '100%',
        height: '40px',
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: 'shimmer 1.5s infinite',
        marginBottom: '24px'
      }}
      className="pb-4 mb-6 border-b border-gray-200"
    />

    {/* Details shimmer */}
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">City</span>
        <div
          style={{
            width: '80px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Postal Code</span>
        <div
          style={{
            width: '70px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Country</span>
        <div
          style={{
            width: '60px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
    </div>
  </div>
);

export default function Address() {
  const { t } = useTranslation('myaccount');
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
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}} />

      {/* No min-h-screen — MyAccount.jsx's wrapper already provides a full
          viewport (navbar clearance included); stacking another one here
          forced this tab an extra viewport tall even on short/empty
          content, causing a page scrollbar on the empty state at any
          screen size or zoom level. */}
      <div className="bg-gray-100">
        {/* mt-2 on mobile, not mt-9 — that was stacking on top of
            Sidebar.jsx's own bottom padding on the mobile tab row, leaving
            a big empty gap before this card started. md:mt-9 keeps desktop
            unchanged, same pattern as Dashboard.jsx's mt-2 md:mt-10 fix. */}
        <div className="p-4 sm:p-6 md:p-8 mt-2 md:mt-9 max-w-10xl mx-auto">
          <div className="bg-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('address.title')}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t('address.subtitle')}
                </p>
              </div>

              <button
                onClick={handleAddAddress}
                className="bg-gray-900 text-white px-6 py-3 text-base font-medium hover:bg-gray-800 cursor-pointer transition-colors duration-200 shadow-sm"
              >
                {t('address.addAddress')}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 md:mb-8">
              <button
                onClick={() => setActiveTab("delivery")}
                className={`px-5 py-2 cursor-pointer border-2 text-sm md:text-base font-medium transition-all ${
                  activeTab === "delivery"
                    ? "border-gray-900 text-black"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                {t('address.deliveryAddress')}
              </button>
              <button
                onClick={() => setActiveTab("invoice")}
                className={`px-5 py-2 cursor-pointer border-2 text-sm md:text-base font-medium transition-all ${
                  activeTab === "invoice"
                    ? "border-gray-900 text-black"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                {t('address.invoiceAddress')}
              </button>
            </div>

            {/* Main Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {Array.from({ length: 3 }).map((_, i) => <AddressCardShimmer key={i} />)}
              </div>
            ) : hasAddresses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white p-4 border border-gray-200 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleSetDefault(address)} 
                          className="relative w-5 h-5 flex-shrink-0 mt-0.5"
                        >
                          <div className="w-5 h-5 cursor-pointer border-2 border-gray-400 flex items-center justify-center">
                            {(selectedAddress === address.id || address.is_default == 1) && <div className="w-3 h-3 bg-gray-900 rounded-full" />}
                          </div>
                        </button>
                        <h3 
                          onClick={() => handleSetDefault(address)} 
                          className="font-semibold text-gray-900 cursor-pointer"
                        >
                          {address.type}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(address)} 
                          className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                        >
                          <TbPencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(address.id)} 
                          className="text-red-500 cursor-pointer hover:text-red-600 transition-colors"
                        >
                          <RiDeleteBin6Line size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed -mx-4 px-4 pb-4 mb-4 border-b border-gray-200">
                      {address.full_address}
                    </p>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('address.city')}</span>
                        <span className="text-gray-900 font-medium">{address.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('address.postalCode')}</span>
                        <span className="text-gray-900 font-medium">{address.postal_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('address.country')}</span>
                        <span className="text-gray-900 font-medium">{address.country}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                  <img src="/address.svg" alt={t('address.emptyAlt')} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  You Haven't Added Any Address
                </h3>
                <p className="text-gray-500 text-base text-center max-w-md md:max-w-xl mb-8 leading-relaxed">
                  {t('address.emptyDescription')}
                </p>
                <button
                  onClick={handleAddAddress}
                  className="bg-gray-900 text-white px-8 py-3.5 text-base font-medium hover:bg-gray-800 cursor-pointer transition-colors duration-200 shadow-sm"
                >
                  {t('address.addFirstAddress')}
                </button>
              </div>
            )}
          </div>
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