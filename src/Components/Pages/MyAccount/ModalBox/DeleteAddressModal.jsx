"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../API/API";
import { getDeviceId } from "../../../../utils/deviceId";

export default function DeleteAddressModal({ isOpen, onClose, onDeleted, addressId }) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
    const token = loginData?.data?.token;
    const headers = token ? { token } : {};
    const body = token ? {} : { device_id: getDeviceId() };
    try {
      const res = await axios.get(`${BASE_URL}/user/address/delete/${addressId}`, { headers, params: body });
      if (res.data.status === false) {
        toast.error(res.data.action || "Something went wrong");
      } else {
        onDeleted();
      }
    } catch (err) {
      toast.error(err.response?.data?.action || "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-7 text-center">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Delete Address
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Are you sure you want to delete this address?
          </p>
          <div className="flex flex-col gap-4 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-8 py-3.5  font-medium text-gray-800 border border-gray-300 hover:bg-gray-100 active:bg-gray-300 transition-colors duration-150 cursor-pointer focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
             <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-8 py-3.5  font-medium text-white bg-[#111] hover:bg-gray-800 transition-colors duration-150 cursor-pointer focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
