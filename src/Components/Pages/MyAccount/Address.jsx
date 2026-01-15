"use client";

import React, { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbPencil } from "react-icons/tb";
import { AddAddressModal } from "./ModalBox/AddAddressModal";

export default function Address() {
  const [activeTab, setActiveTab] = useState("delivery");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [addresses, setAddresses] = useState([
    {
      id: "home",
      type: "Home",
      street: "123 Avenue des Champs-Élysées, Apt 12B",
      city: "Paris",
      postalCode: "75008",
      country: "France",
    },
    {
      id: "office",
      type: "Office",
      street: "456 Rue de Rivoli, Suite 300",
      city: "Paris",
      postalCode: "75001",
      country: "France",
    },
    {
      id: "vacation",
      type: "Vacation Home",
      street: "789 Boulevard Saint-Germain, 2nd Floor",
      city: "Paris",
      postalCode: "75006",
      country: "France",
    },
  ]);

  const handleDelete = (id) => {
    const newAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(newAddresses);

    if (selectedAddress === id) {
      setSelectedAddress(newAddresses[0]?.id || null);
    }
  };

  const handleEdit = (id) => {
    console.log("Edit address:", id);
    // Add edit modal/logic here
  };

  const handleAddAddress = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAddress = (newAddress) => {
    // Here you can add logic to save the address to the state or API
    console.log("Saving new address:", newAddress);
    // For now, just add it to the addresses array
    const addressToAdd = {
      id: Date.now().toString(), // Simple ID generation
      type: newAddress.addressType,
      street: newAddress.fullAddress,
      city: newAddress.city,
      postalCode: newAddress.postalCode,
      country: newAddress.country,
    };
    setAddresses([...addresses, addressToAdd]);
  };

  const hasAddresses = addresses.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="bg-white rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your addresses for faster checkout.
              </p>
            </div>

            {hasAddresses && (
              <button
                onClick={handleAddAddress}
                className="
                  bg-gray-900 text-white
                  px-6 py-3 rounded-xl
                  text-base font-medium
                  hover:bg-gray-800 cursor-pointer
                  transition-colors duration-200
                  shadow-sm
                "
              >
                Add Address
              </button>
            )}
          </div>

          {/* Tabs - only show when there are addresses */}
          {hasAddresses && (
            <div className="flex gap-3 mb-6 md:mb-8">
              <button
                onClick={() => setActiveTab("delivery")}
                className={`px-5 py-2 cursor-pointer rounded-full border-2 text-sm md:text-base font-medium transition-all ${
                  activeTab === "delivery"
                    ? "border-gray-900  text-black"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                Delivery Address
              </button>

              <button
                onClick={() => setActiveTab("invoice")}
                className={`px-5 py-2 cursor-pointer rounded-full border-2 text-sm md:text-base font-medium transition-all ${
                  activeTab === "invoice"
                    ? "border-gray-900  text-black"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                Invoice Address
              </button>
            </div>
          )}

          {/* Main Content */}
          {hasAddresses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedAddress(address.id)}
                        className="relative w-5 h-5 flex-shrink-0 mt-0.5"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          {selectedAddress === address.id && (
                            <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                          )}
                        </div>
                      </button>
                      <h3 className="font-semibold text-gray-900">{address.type}</h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address.id)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Edit"
                      >
                        <TbPencil className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <RiDeleteBin6Line size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed -mx-4 px-4 pb-4 mb-6 border-b border-gray-200">
                    {address.street}
                  </p>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">City</span>
                      <span className="text-gray-900 font-medium">{address.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Postal Code</span>
                      <span className="text-gray-900 font-medium">{address.postalCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Country</span>
                      <span className="text-gray-900 font-medium">{address.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-24">
              <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                <img
                  src="/address.svg"
                  alt="Empty addresses illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                You Haven't Added Any Address
              </h3>

              <p className="text-gray-500 text-base text-center max-w-md md:max-w-xl mb-8 leading-relaxed">
                You haven't saved any shipping or billing addresses yet. Add one now to speed up checkout and manage your orders more easily.
              </p>

              <button
                onClick={handleAddAddress}
                className="
                  bg-gray-900 text-white
                  px-8 py-3.5 rounded-lg
                  text-base font-medium
                  hover:bg-gray-800 cursor-pointer
                  transition-colors duration-200
                  shadow-sm
                "
              >
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      </div>

      <AddAddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
