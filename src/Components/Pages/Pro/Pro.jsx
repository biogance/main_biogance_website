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
import { useTranslation } from 'react-i18next';

export function Pro() {
    const { t } = useTranslation('pro');
    const [activeTab, setActiveTab] = useState("distributor");
    const router = useRouter();

    // Get data from translation
    const benefits = t('distributor.benefits', { returnObjects: true }) || [];
    const introParagraphs = t('partner.introParagraphs', { returnObjects: true }) || [];

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            {/* Hero Section */}
            <div className="relative h-[500px] w-full">
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
                        {t('hero.title')}
                    </h1>

                    <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                        <Link href="/" className="hover:underline">{t('hero.breadcrumb.home')}</Link>
                        <span>/</span>
                        <a className="underline">{t('hero.breadcrumb.pro')}</a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-6 py-16">

                {/* Tabs */}
                <div className="flex justify-center mb-12 px-4">
                    <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 p-1 shadow-inner">
                        <button
                            onClick={() => setActiveTab('distributor')}
                            className={`
                relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full 
                transition-all duration-300 ease-in-out
                text-sm sm:text-base font-semibold cursor-pointer whitespace-nowrap
                ${activeTab === 'distributor'
                                    ? 'bg-black text-white shadow-lg shadow-gray-200/50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }
            `}
                        >
                            <span className="relative z-10">{t('tabs.distributor')}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('partner')}
                            className={`
                relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full 
                transition-all duration-300 ease-in-out
                text-sm sm:text-base font-semibold cursor-pointer whitespace-nowrap
                ${activeTab === 'partner'
                                    ? 'bg-black text-white shadow-lg shadow-gray-200/50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }
            `}
                        >
                            <span className="relative z-10">{t('tabs.partner')}</span>
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
                                <h2 className="mb-2" style={{ fontSize: '32px', fontWeight: 700, lineHeight: '1.3', color: 'black' }}>
                                    {t('distributor.title')}
                                </h2>
                                <p className="mb-6 text-gray-700" style={{ fontSize: '16px', fontWeight: 600 }}>
                                    {t('distributor.subtitle')}
                                </p>
                                <p className="mb-4 text-gray-800" style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.5' }}>
                                    {t('distributor.description')}
                                </p>
                                <p className="mb-4 text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
                                    {t('distributor.paragraph1')}
                                </p>
                                <p className="mb-6 text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
                                    {t('distributor.paragraph2')}
                                </p>
                                <p className="mb-3 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                    {t('distributor.supportTitle')}
                                </p>

                                <div className="space-y-2 mb-8">
                                    {Array.isArray(benefits) && benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Image
                                                src={doubleTick}
                                                alt="Check"
                                                width={20}
                                                height={20}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}>
                                                {benefit}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <Link href="/distributor">
                                        <button
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer" style={{ fontSize: '14px', fontWeight: 700 }}>
                                            {t('distributor.buttons.distributorApp')}
                                        </button>
                                    </Link>
                                    <Link href="/reseller">
                                        <button className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: '14px', fontWeight: 700 }}>
                                            {t('distributor.buttons.resellerApp')}
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
                                <h2 className="text-3xl font-bold text-gray-900">{t('partner.introTitle')}</h2>

                                {Array.isArray(introParagraphs) && introParagraphs.map((paragraph, index) => (
                                    <p key={index} className="text-gray-700 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}

                                <div className="pt-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {t('partner.ambassadorTitle')}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        {t('partner.ambassadorDescription')}
                                    </p>
                                    <Link href="/ambassador">
                                        <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors cursor-pointer" style={{ fontSize: '14px', fontWeight: 700 }}>
                                            {t('partner.button')}
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