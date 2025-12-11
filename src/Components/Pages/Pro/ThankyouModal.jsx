"use client"
import Image from "next/image";
import ThankYou from "../../../../public/thankyouPic.png"

export default function ThankYouModal({ onClose }) {
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

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }
            `}</style>

            <div className="fixed inset-0 z-50 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-slideDown">
                    {/* Close Button (X) */}
                    

                    {/* Illustration */}
                    <div className="flex justify-center mb-6">
                        <Image
                            src={ThankYou}
                            alt="Laboratory workers"
                            className="w-full h-[300px] object-cover"
                        />
                    </div>

                    {/* Text content */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Thank you for your request!
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Our commercial team will review your information and contact you soon to finalize your reseller or distributor account.
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors duration-200 cursor-pointer "
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </>
    );
}