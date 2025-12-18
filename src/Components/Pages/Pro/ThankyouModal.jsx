"use client"
import { useState } from 'react';

export default function ThankYouModal({ onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 350); // Match animation duration
    };

    return (
        <>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }

                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes zoomOut {
                    from {
                        opacity: 1;
                        transform: scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.25s ease-out forwards;
                }

                .animate-fadeOut {
                    animation: fadeOut 0.25s ease-in forwards;
                }

                .animate-zoomIn {
                    animation: zoomIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .animate-zoomOut {
                    animation: zoomOut 0.35s ease-in forwards;
                }
            `}</style>

            <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                <div className={`bg-white rounded-3xl max-w-md w-full p-8 relative ${isClosing ? 'animate-zoomOut' : 'animate-zoomIn'}`}>
                    {/* Illustration */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/thankyouPic.png"
                            alt="Laboratory workers"
                            className="w-[200px] h-[300px] object-fit"
                        />
                    </div>

                    {/* Text content */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Thank you for your request!
                        </h2>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Our commercial team will review your information and contact you soon to finalize your reseller or distributor account.
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 rounded-xl transition-colors duration-200 cursor-pointer"
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </>
    );
}

