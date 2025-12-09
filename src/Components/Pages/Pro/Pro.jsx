"use client"

import React, { useState } from 'react';
import proImg from "../../../../public/proImg.jpg"
import Image from 'next/image';
import Navbar from '../Navbar';
import distributor from "../../../../public/distributorImg.jpg";
import doubleTick from "../../../../public/tick-double-01-stroke-rounded 6.jpg"
import partner from "../../../../public/partnerImg.jpg"
import { useRouter } from 'next/navigation';
import Footer from '../Footer';
import Link from 'next/link';

export function Pro() {
    const [activeTab, setActiveTab] = useState("distributor");
    const router = useRouter();


    return (
        <>

            {/* Hero Section */}
            <div className="relative h-[100vh] w-full ">
                <Navbar />

                <div className="absolute inset-0">
                    <Image
                        src={proImg}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                    <h1 className="text-white mb-3 sm:mb-4 tracking-wide text-center text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight">
                        BECOME PRO MEMBER
                    </h1>

                    <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                        <a href="/" className="hover:underline">Home</a>
                        <span>/</span>
                        <a href="/" className="underline">Pro</a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-12 px-4">
                    <div className="inline-flex rounded-full bg-gray-50 p-1.5 sm:p-2 w-full sm:w-auto max-w-full overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('distributor')}
                            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 text-xs sm:text-sm md:text-[15px] font-semibold whitespace-nowrap ${activeTab === 'distributor'
                                    ? 'bg-white shadow-sm'
                                    : 'bg-transparent text-gray-600'
                                }`}
                                style={{fontSize:'15px', fontWeight:'600', color:'black'}}
                        >
                            Distributor or Retailer
                        </button>

                        <button
                            onClick={() => setActiveTab('partner')}
                            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 text-xs sm:text-sm md:text-[15px] font-bold whitespace-nowrap ${activeTab === 'partner'
                                    ? 'bg-white shadow-sm'
                                    : 'bg-transparent text-gray-600'
                                }`}
                                 style={{fontSize:'15px', fontWeight:'600', color:'black'}}
                        >
                            Partner or an Ambassador
                        </button>
                    </div>
                </div>

                {/* Content Container with Animation */}
                <div className="relative overflow-hidden">
                    {/* Distributor Tab Content */}
                    <div
                        className={`transition-all duration-500 ease-in-out ${activeTab === 'distributor'
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
                            }`}
                    >
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Left Text */}
                            <div className={`transition-all duration-700 delay-100 ${activeTab === 'distributor' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}>
                                <h2 className="mb-2" style={{ fontSize: '32px', fontWeight: 700, lineHeight: '1.3', color:'black' }}>
                                    Resellers & Professionals
                                </h2>
                                <p className="mb-6 text-gray-700" style={{ fontSize: '16px', fontWeight: 600 }}>
                                    Join the Biogance & Ekinat network
                                </p>
                                <p className="mb-4 text-gray-800" style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.5' }}>
                                    Distributor, pet shop, grooming salon, pharmacy, concept store...
                                </p>
                                <p className="mb-4 text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
                                    Joining the Biogance network means choosing products made in France,
                                    using organic and natural ingredients, already available in over 40
                                    countries worldwide.
                                </p>
                                <p className="mb-6 text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
                                    Apply by clicking the link below to open your account. Once your
                                    application is submitted, our sales team will analyze the information
                                    provided and get back to you very soon.
                                </p>
                                <p className="mb-3 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                    We support our resellers with:
                                </p>

                                <div className="space-y-2 mb-8">
                                    <div className="flex items-start gap-2">
                                        <Image
                                            src={doubleTick}
                                            alt="Check"
                                            width={20}
                                            height={20}
                                            className="mt-0.5 flex-shrink-0"
                                        />
                                        <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}>
                                            Preferential offers and advantageous B2B terms (download the catalog)
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Image
                                            src={doubleTick}
                                            alt="Check"
                                            width={20}
                                            height={20}
                                            className="mt-0.5 flex-shrink-0"
                                        />
                                        <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}>
                                            Customized marketing tools (POS materials, visuals, promotional kits)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Link href="/Distributor"  >
                                        <button
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer" style={{ fontSize: '14px', fontWeight: 700 }}>
                                            Distributor Application
                                        </button>
                                    </Link>
                                    <Link href="/Reseller"  >
                                        <button className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: '14px', fontWeight: 700 }}>
                                            Reseller Application
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className={`rounded-lg overflow-hidden transition-all duration-700 delay-200 ${activeTab === 'distributor' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                                }`}>
                                <Image
                                    src={distributor}
                                    alt="Woman with dog in autumn park"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Partner Tab Content */}
                    <div
                        className={`transition-all duration-600 ease-in-out ${activeTab === 'partner'
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
                            }`}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Left Content */}
                            <div className={`space-y-6 transition-all duration-700 delay-100 ${activeTab === 'partner' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}>
                                <h2 className="text-3xl font-bold text-gray-900">Introduction</h2>

                                <p className="text-gray-700 leading-relaxed">
                                    Biogance combines science and nature to create organic, eco-certified,
                                    and environmentally friendly hygiene and care products for animals.
                                </p>

                                <p className="text-gray-700 leading-relaxed">
                                    Founded in France, the brand is committed to animal well-being,
                                    sustainability, and innovation, offering safe, effective, and responsible
                                    formulas designed for the comfort and health of your companions.
                                </p>

                                <p className="text-gray-700 leading-relaxed">
                                    Based in Angers, in the heart of Anjou, Biogance develops and
                                    manufactures its products in France, with a strong commitment to quality
                                    and transparency at every stage — from ingredient selection to the final
                                    formulation.
                                </p>

                                <p className="text-gray-700 leading-relaxed">
                                    Our mission: to offer the best of nature and science for animal well-being.
                                </p>

                                <div className="pt-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        Become an ambassador
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        At Biogance, we believe in authentic and long-lasting collaborations built on
                                        trust, passion, and shared values: respect for animals and the environment, their
                                        well-being, quality, and innovation.
                                    </p>
                                    <Link href="/Ambassador"  >
                                        <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors cursor-pointer" style={{ fontSize: '14px', fontWeight: 700 }}>
                                            Become an Ambassador
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className={`relative transition-all duration-700 delay-200 ${activeTab === 'partner' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                                }`}>
                                <div className="rounded-lg overflow-hidden shadow-lg">
                                    <Image
                                        src={partner}
                                        alt="Person with dog at sunset"
                                        className="w-full h-[650px] object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}