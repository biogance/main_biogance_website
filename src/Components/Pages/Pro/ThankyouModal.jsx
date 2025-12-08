"use client"
import Image from "next/image";
import ThankYou from "../../../../public/thankyouPic.png"

export default function ThankYouModal() {
    return (
        <div className=" bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl   max-w-md w-full p-8 relative">
                {/* Illustration */}
                <div className="flex justify-center mb-6">
                    <Image
                        src={ThankYou}
                        alt="Laboratory workers"
                        className="w-full h-[300px] object-fit"
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
                    onClick={() => console.log('Got it clicked')}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors duration-200 cursor-pointer"
                >
                    Got It!
                </button>
            </div>
        </div>
    );
}