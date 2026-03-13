"use client"
import React from 'react';
import Navbar from '../Navbar';
import commitment from "../../../../public/commitmentMain.png"
import Image from 'next/image';
import { useState } from 'react';
import respect from "../../../../public/Respectimg.png"
import respecttwo from "../../../../public/respectTwo.png"
import quality from "../../../../public/quality.png"
import innovation from "../../../../public/innovation.png"
import sharing from "../../../../public/sharing.png"
import Footer from '../Footer';
import container from "../../../../public/ImageContainer.svg"
import { useTranslation } from 'react-i18next';

export default function Commitments() {
     const { t } = useTranslation('commitment');
    const [activeTab, setActiveTab] = useState('animal');
    return (
        <>
         <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
            <div className="fixed top-0 left-0 right-0 z-50">
                               <Navbar />
                             </div>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center mt-16 ">
                <div className="max-w-7xl w-full   overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                        {/* Left Side - Image */}
                        <div className="relative">

                            {/* Main Image */}
                            <div className="relative rounded-lg overflow-hidden  ">
                                <Image
                                    src={container}
                                    alt="Laboratory workers"
                                    className="w-full h-full object-cover"
                                />


                            </div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                                    {t('subtitle')}
                                </p>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                {t('title')}
                            </h1>

                            <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                                <p>
                                    {t('description1')}
                                </p>

                                <p>
                                    {t('description2')}
                                </p>

                                <p>
                                    {t('description3')}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                    {t('shopNow')}
                                </button>
                                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors cursor-pointer">
                                    {t('discover')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


           <div className="min-h-screen bg-white py-18 px-4">
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('pillarsTitle')}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-sm">
                {t('pillarsDescription')}
            </p>
        </div>

        {/* Tabs */}
       <div className="flex justify-center mb-12 px-4">
    <div className="inline-flex rounded-full bg-gray-50 p-2  max-w-6xl overflow-x-auto">
        <div className="flex gap-2 min-w-max lg:min-w-0 lg:flex-wrap lg:justify-center">
            <button
                onClick={() => setActiveTab('animal')}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'animal'
                        ? 'text-white bg-black'
                        : 'text-gray-700'
                }`}
                style={{ fontWeight: 600 }}
            >
                {t('tab1')}
            </button>
            <button
                onClick={() => setActiveTab('environment')}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'environment'
                        ? 'text-white bg-black'
                        : 'text-gray-700'
                }`}
                style={{ fontWeight: 700 }}
            >
                {t('tab2')}
            </button>
            <button
                onClick={() => setActiveTab('innovation')}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'innovation'
                        ? 'text-white bg-black'
                        : 'text-gray-700'
                }`}
                style={{ fontWeight: 700 }}
            >
                {t('tab3')}
            </button>
            <button
                onClick={() => setActiveTab('quality')}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'quality'
                        ? 'text-white bg-black'
                        : 'text-gray-700'
                }`}
                style={{ fontWeight: 700 }}
            >
                {t('tab4')}
            </button>
            <button
                onClick={() => setActiveTab('sharing')}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'sharing'
                        ? 'text-white bg-black'
                        : 'text-gray-700'
                }`}
                style={{ fontWeight: 700 }}
            >
                {t('tab5')}
            </button>
        </div>
    </div>
</div>
        {/* Content Container with Animation */}
        <div className="relative overflow-hidden">
            {/* respect for animal */}
            <div
                className={`transition-all duration-500 ease-in-out ${
                    activeTab === 'animal'
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
                }`}
            >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left - Text Content */}
                    <div className={`space-y-4 transition-all duration-700 delay-100 ${
                        activeTab === 'animal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('animalTitle')}
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('animalText1')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('animalText2')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('animalText3')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('animalText4')}
                        </p>
                    </div>

                    {/* Right - Image */}
                    <div className={`rounded-lg overflow-hidden transition-all duration-700 delay-200 ${
                        activeTab === 'animal' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}>
                        <Image
                            src={respect}
                            alt="Dog in nature"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* respect for environment */}
            <div
                className={`transition-all duration-500 ease-in-out ${
                    activeTab === 'environment'
                        ? 'opacity-100 translate-x-0'
                        : activeTab === 'animal' ? 'opacity-0 translate-x-full absolute inset-0 pointer-events-none' : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
                }`}
            >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left - Text Content */}
                    <div className={`space-y-4 transition-all duration-700 delay-100 ${
                        activeTab === 'environment' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('environmentTitle')}
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('environmentText1')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('environmentText2')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('environmentText3')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('environmentText4')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('environmentText5')}
                        </p>
                    </div>
                    {/* Right - Image */}
                    <div className={`rounded-lg overflow-hidden transition-all duration-700 delay-200 ${
                        activeTab === 'environment' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}>
                        <Image
                            src={respecttwo}
                            alt="Dog in nature"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* innovation */}
            <div
                className={`transition-all duration-500 ease-in-out ${
                    activeTab === 'innovation'
                        ? 'opacity-100 translate-x-0'
                        : activeTab === 'animal' || activeTab === 'environment' ? 'opacity-0 translate-x-full absolute inset-0 pointer-events-none' : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
                }`}
            >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left - Text Content */}
                    <div className={`space-y-4 transition-all duration-700 delay-100 ${
                        activeTab === 'innovation' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('innovationTitle')}
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('innovationText1')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('innovationText2')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('innovationText3')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('innovationText4')}
                        </p>
                    </div>
                    {/* Right - Image */}
                    <div className={`rounded-lg overflow-hidden transition-all duration-700 delay-200 ${
                        activeTab === 'innovation' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}>
                        <Image
                            src={innovation}
                            alt="Dog in nature"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* quality */}
            <div
                className={`transition-all duration-500 ease-in-out ${
                    activeTab === 'quality'
                        ? 'opacity-100 translate-x-0'
                        : activeTab === 'sharing' ? 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none' : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
                }`}
            >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left - Text Content */}
                    <div className={`space-y-4 transition-all duration-700 delay-100 ${
                        activeTab === 'quality' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('qualityTitle')}
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('qualityText1')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('qualityText2')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('qualityText3')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('qualityText4')}
                        </p>
                    </div>

                    {/* Right - Image */}
                    <div className={`rounded-lg overflow-hidden transition-all duration-700 delay-200 ${
                        activeTab === 'quality' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}>
                        <Image
                            src={quality}
                            alt="Dog in nature"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* sharing */}
            <div
                className={`transition-all duration-500 ease-in-out ${
                    activeTab === 'sharing'
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
                }`}
            >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left - Text Content */}
                    <div className={`space-y-4 transition-all duration-700 delay-100 ${
                        activeTab === 'sharing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('sharingTitle')}
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('sharingText1')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('sharingText2')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('sharingText3')}
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            {t('sharingText4')}
                        </p>
                    </div>

                    {/* Right - Image */}
                    <div className={`rounded-lg overflow-hidden transition-all duration-700 delay-200 ${
                        activeTab === 'sharing' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}>
                        <Image
                            src={sharing}
                            alt="Dog in nature"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<Footer/>
        </>
    );
}