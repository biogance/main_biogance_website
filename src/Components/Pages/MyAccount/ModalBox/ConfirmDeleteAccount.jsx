import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import container from "../../../../../public/DeleteIllustration.svg"
import Image from 'next/image';


export default function ConfirmDeletionModal({ onClose }) {
    const [password, setPassword] = useState('Joh@1234');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleConfirmDelete = () => {
        setIsDeleted(true);
    };

    if (isDeleted) {
        return (
            <div className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">

                    {/* Illustration Placeholder */}
                    <div className="flex justify-center mb-6">
                        <div className="  rounded-lg flex items-center justify-center">
                            <Image
                                src={container}
                                alt="Laboratory workers"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                        Your account has been deleted
                    </h2>
                    <p className="text-gray-600 text-center mb-8 text-sm px-4">
                        We're sorry to see you go. Thank you for being part of the Biogance community.
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <button className="w-full px-6 py-3.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer">
                            Rejoin Biogance
                        </button>
                        <button className="w-full px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                            Browse as Guest
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                    Confirm Account Deletion
                </h2>
                <p className="text-gray-600 text-center mb-6 text-sm">
                    To protect your account, please enter your password to confirm.
                </p>

                {/* Password Input */}
                <div className="mb-6">
                    <label className="block text-gray-800 font-medium mb-2 text-sm">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                            placeholder="Enter password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                        >
                            {showPassword ? (
                                 <AiOutlineEye className="w-5 h-5 cursor-pointer" />
                            ) : (
                                <AiOutlineEyeInvisible className="w-5 h-5 cursor-pointer" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleConfirmDelete}
                        className="w-full px-6 py-3.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                    >
                        Confirm Delete My Account
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        No, Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}