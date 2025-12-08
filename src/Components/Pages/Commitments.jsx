"use client"
import React from 'react';
import Navbar from './Navbar';
import commitment from "../../../public/commitmentMain.png"
import Image from 'next/image';
import { useState } from 'react';
import respect from "../../../public/Respectimg.png"
import respecttwo from "../../../public/respectTwo.png"
import quality from "../../../public/quality.png"
import innovation from "../../../public/innovation.png"
import sharing from "../../../public/sharing.png"

export default function Commitments() {
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
            <Navbar />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
                <div className="max-w-7xl w-full   overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                        {/* Left Side - Image */}
                        <div className="relative">

                            {/* Main Image */}
                            <div className="relative rounded-lg overflow-hidden  ">
                                <Image
                                    src={commitment}
                                    alt="Laboratory workers"
                                    className="w-full h-full object-cover"
                                />


                            </div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                                    More than a brand, a mission
                                </p>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                Biogance, the laboratory committed to animal welfare
                            </h1>

                            <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                                <p>
                                    BIOGANCE is an independent, family-run laboratory, a pioneer in organic and
                                    natural hygiene and care for animals.
                                </p>

                                <p>
                                    An expert in its field, the laboratory relies on GMP (ISO 22716) certified
                                    production units and a team dedicated to Research & Innovation, drawing
                                    inspiration from the secrets of aromatic and medicinal plants.
                                </p>

                                <p>
                                    Driven by strong social and environmental values, BIOGANCE® is much more
                                    than a brand: it is a committed laboratory, determined to have a positive impact
                                    and to offer the best to our companions.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                                    Shop Now
                                </button>
                                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors">
                                    Discover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


           <div className="min-h-screen bg-white py-18 px-4">
    <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Pillars of Our Commitment
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-sm">
                At Biogance, our values guide everything we do. From respect for animals and the environment to innovation, quality, and
                teamwork, these pillars shape our mission to create safe, natural, and ethical care for pets worldwide.
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
                Respect for the Animal
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
                Respect for the environment
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
                Innovation
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
                Quality
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
                Sharing and respect
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
                            Respect for the Animal
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            At <span className="font-bold">BIOGANCE</span>, respect for animal welfare is at the heart of everything we do.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            This is why we develop <span className="font-semibold">organic and natural animal care products</span>, formulated
                            with <span className="font-semibold">certified organic active ingredients</span> and carefully selected <span className="font-semibold">ingredients of
                                natural origin</span>.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Our formulas are designed to <span className="font-semibold">meet the specific needs of each animal</span>: whether
                            dogs, cats, NACs, or other companions. <span className="font-semibold">Paraben-free, phenoxyethanol-free,
                                animal oil-free</span>, and of course <span className="font-semibold">not tested on animals</span>, our products
                            combine <span className="font-semibold">effectiveness, safety and respect for nature</span>.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            By choosing Biogance, you are opting for a <span className="font-semibold">committed French brand</span>, a pioneer
                            in <span className="font-semibold">natural animal care</span>, which places <span className="font-semibold">ethics, quality and the health of your
                                companion</span> at the forefront.
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
                            Respect for the Environment
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Quality care should never come at the expense of the planet.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            This is why we have chosen to develop <span className="font-semibold">environmentally friendly hygiene and care
                                products for animals</span>, through a rigorous selection of <span className="font-semibold">non-polluting raw
                                    materials</span> and a <span className="font-semibold">global eco-responsible approach</span>.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Our <span className="font-semibold">packaging is recyclable</span> and designed to minimize its environmental impact,
                            while ensuring the safety and optimal conservation of the formulas.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            This commitment is fully in line with our <span className="font-semibold">CSR commitment</span>, which places
                            environmental ethics at the heart of our creative process.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            By choosing Biogance, you are supporting an <span className="font-semibold">independent French laboratory</span> that
                            works every day to combine <span className="font-semibold">animal well-being and respect for the planet</span>,
                            through <span className="font-semibold">organic, sustainable and responsible</span> care.
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
                            Innovation
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            A pioneer in <span className="font-semibold">organic and natural animal care</span>, <span className="font-semibold">Biogance</span> places <span className="font-semibold">innovation</span> at the
                            heart of its development.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Since our beginnings, we have been imagining unique solutions that respect
                            animals and their environment, by combining <span className="font-semibold">technology, science and nature</span>.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Our <span className="font-semibold">Research & Development team</span> is constantly working to improve our
                            formulas and create <span className="font-semibold">new, ever more effective treatments</span>, in line with <span className="font-semibold">market
                                developments</span>, consumer expectations and the specific needs of pets.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Thanks to our constant monitoring and our ability to adapt, we offer products that
                            combine <span className="font-semibold">innovation, naturalness and effectiveness</span>, in an ever more responsible
                            approach. With Biogance, you choose a <span className="font-semibold">visionary brand</span>, at the forefront of
                            innovation in the field of <span className="font-semibold">organic and ethical petcare</span>.
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
                            Quality
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Quality is more than just a commitment: it's a daily requirement. Our
                            quality department <span className="font-semibold">monitors</span> every step, from ingredient selection to
                            manufacturing, to ensure <span className="font-semibold">safe, effective care that meets the real needs of
                                animals</span>.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            In collaboration with the <span className="font-semibold">ECOCERT</span> label, in 2017 we launched <span className="font-semibold">Organissime</span>,
                            the <span className="font-semibold">first range labeled "Ecocare for animals"</span>, proof of our commitment to animal
                            cosmetics that are natural, ethical and rigorous.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Our <span className="font-semibold">production site is ISO 22716 certified</span>, a guarantee of <span className="font-semibold">Good Manufacturing
                                Practices (GMP)</span> and optimal traceability.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            With Biogance, you can be sure of choosing an <span className="font-semibold">expert French brand</span>, which
                            combines <span className="font-semibold">transparency, safety and high quality</span> in all its products.
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
                            Sharing & Respect
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            Our greatest asset is the <span className="font-semibold">women and men</span> who work every day in our laboratory.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            We believe that it is thanks to a <span className="font-semibold">cross-functional, fluid and caring
                                collaboration</span> between all departments—R&D, quality, production, logistics,
                            marketing—that we can move forward with consistency and efficiency.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            We cultivate a <span className="font-semibold">team spirit</span> based on <span className="font-semibold">respect, dynamism and trust</span>, in
                            a <span className="font-semibold">professional, pleasant and stimulating</span> work environment.
                            This strong corporate culture allows us to build a lasting, innovative and human
                            brand, where each employee is a player in the success of Biogance.
                        </p>

                        <p className="text-gray-700 leading-relaxed text-sm">
                            For us, <span className="font-semibold">respect for humans is inseparable from respect for animals</span>.
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
        </>
    );
}