"use client";

import { useState } from "react";

export default function DeletePetModal({
  isOpen,
  onClose,
  onConfirm,
  petName = "this pet",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-7 text-center">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Delete Pet Profile
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            Are you sure you want to delete{" "} this pet profile?
            {/* <span className="font-semibold text-gray-800">{petName}</span>'s */}
           
            <br />
            <span className="text-gray-500 font-medium">
              This action cannot be undone.
            </span>
          </p>

          <div className="flex flex-col gap-4 justify-center">
           

            <button
              type="button"
              onClick={onConfirm}
                
              className={`
                px-8 py-3.5 rounded-xl font-medium text-white
                bg-[#D00416] hover:bg-red-700 active:bg-red-800
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2
                active:scale-[0.98] shadow-sm
              `}
            >
              Yes, Delete
            </button>
             <button
              type="button"
              onClick={onClose}
              className={`
                px-8 py-3.5 rounded-xl font-medium text-gray-800
                border border-gray-300 hover: active:bg-gray-300
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-gray-400/50
                active:scale-[0.98]
              `}
            >
              No, Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}