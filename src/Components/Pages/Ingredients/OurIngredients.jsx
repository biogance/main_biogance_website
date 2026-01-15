"use client"

import React, { useState } from 'react';
import ingredient from "../../../../public/ingredient-img.png"
import { IoSearchOutline, IoChevronDown } from 'react-icons/io5';
import Image from 'next/image';
import Navbar from '../Navbar';
import { IngredientCard } from './IngredientsCard';
import cardImg from "../../../../public/ingredient-cardImg.png"
import garlicImg from "../../../../public/garlicImg.png"
import algeaImg from "../../../../public/algeaImg.png"
import AschophyImg from "../../../../public/AschophyliumImg.png"
import AlmondImg from "../../../../public/AlmondImg.png"
import AltanioImg from "../../../../public/AltanioImg.png"
import Alovera from "../../../../public/AloveraImg.png"
import clay from "../../../../public/clayImg.png"
import Avacado from "../../../../public/AvacadoImg.png"
import Footer from '../Footer';

const OurIngredients = () => {
    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState('All Categories');

    const ingredients = [
        {
            image: cardImg,
            title: 'Hyaluronic Acid',
            tag: 'Hydrating Agent',
            description: 'Hyaluronic acid is a powerful humectant that attracts and binds moisture to the skin. It plumps the skin and protects the dermis. Known for its ability to...'
        },
        {
            image: garlicImg,
            title: 'Garlic',
            tag: 'Nourishing Agent',
            description: 'Garlic has long been used in folk medicine for its various benefits. Its bioactive compounds, like allicin, are believed to provide antioxidants to aid in purifying...'
        },
        {
            image: algeaImg,
            title: "Laminaria algae",
            tag: 'Soothing Agent',
            description: 'A perennial herbaceous plant native to Asia and southern Europe, licorice is valued not just for its sweet, aromatic flavor, but also for its antioxidant and...'
        },
        {
            image: AschophyImg,
            title: 'Acetylcholine algae',
            tag: 'Soothing Agent',
            description: 'Acetylcholine algae is a unique marine organism known for its calming and nourishing properties. Rich in natural moisturizers, amino acids, and antioxidants, it is...'
        },
        {
            image: AltanioImg,
            title: 'Allantoin',
            tag: 'Calming Agent',
            description: 'Allantoin is a botanical extract naturally present in the comfrey plant, known for its soothing and healing properties. It reduces irritation and supports skin barrier...'
        },
        {
            image: Alovera,
            title: 'Aloe Vera',
            tag: 'Hydrating & Soothing Agent',
            description: 'Aloe vera is a succulent plant renowned for its healing and soothing properties. Packed with vitamins, minerals, and antioxidants, its water-rich gel deeply and...'
        },
        {
            image: AlmondImg,
            title: 'Sweet Almond',
            tag: 'Nourishing Oil',
            description: 'Sweet Almond oil is a gentle and nourishing oil extracted from almonds. Packed with vitamins E and A, it provides deep hydration, softens the skin, and calms inflammation...'
        },
        {
            image: clay,
            title: 'Green Clay',
            tag: 'Hydrating & Soothing Agent',
            description: 'Green clay is a mineral-rich substance known for its absorbent properties, making it especially beneficial for oily skin. It gently purifies, removes impurities...'
        },
        {
            image: Avacado,
            title: 'Lawyer (Avocado)',
            tag: 'Nourishing Agent',
            description: 'Avocado oil, known as "Lawyer" in Spanish, supplies vitamins A, D, and E along with essential fatty acids. Its deep penetration helps skin and hair, and curbs moisture...'
        }
    ];


    const [isOpen, setIsOpen] = useState(false);

    const categoryOptions = [
        'All Categories',
        'Hydrating Agents',
        'Soothing Agents',
        'Calming Agents',
        'Nourishing Oils',
        'Nourishing Agents'
    ];
    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            <div className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8 mt-10">
                <div className="max-w-8xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Text Content */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-xs sm:text-sm font-semibold tracking-wider text-gray-500 uppercase">
                                    Our Ingredients.
                                </p>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    For the most natural products
                                </h2>
                            </div>

                            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                                At Biogance, we believe in the power of natural ingredients to care for our four-legged friends. Our products are formulated with carefully selected organic and natural ingredients, specifically tailored to the needs of their skin and coat.
                            </p>
                        </div>

                        <div className="relative ">
                            <Image
                                className='rounded-lg'
                                src={ingredient}

                            />

                        </div>
                    </div>

                    <div className="w-full  py-12 px-4 sm:px-6 lg:px-8 mt-14">
                        <div className="max-w-8xl mx-auto">
                            {/* Header Text */}
                            <div className="text-center mb-8 space-y-3">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                    Biogance Ingredient Library
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                    Discover our premium collection of natural and organic ingredients, carefully selected to nurture your pet's health, well-being, and support a sustainable planet.
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Search Input */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder="Search Ingredients"
                                        className="w-full px-4 py-3 pr-12 text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                                        <IoSearchOutline className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Category Dropdown */}
                                <div className="relative sm:w-56 ">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="w-full px-6 py-3 pr-10 text-sm sm:text-base text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all text-left"
                                    >
                                        {category}
                                    </button>
                                    <IoChevronDown
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                            }`}
                                    />

                                    {isOpen && (
                                        <div className="
                absolute left-0 top-full mt-2 z-20
                w-full max-h-[280px] overflow-auto
                bg-white rounded-lg shadow-2xl border border-gray-200
                py-2 text-sm font-medium
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 
            ">
                                            {categoryOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className={`
                            w-full text-left px-4 py-2.5
                            hover:bg-black hover:text-white
                            transition-colors duration-150
                            cursor-pointer
                            ${category === option
                                                            ? 'bg-gray-100 text-gray-900 font-semibold'
                                                            : 'text-gray-700'
                                                        }
                        `}
                                                    onClick={() => {
                                                        setCategory(option);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12 bg-gray-50 mt-10 p-5  rounded-xl">
                                {ingredients.map((ingredient, index) => (
                                    <IngredientCard
                                        key={index}
                                        image={ingredient.image}
                                        title={ingredient.title}
                                        tag={ingredient.tag}
                                        description={ingredient.description}
                                    />
                                ))}
                            </div>

                            {/* Pagination Info */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600">Showing 1-9 of 124</p>
                            </div>

                            {/* Load More Button */}
                            <div className="flex justify-center">
                                <button className="px-8 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors cursor-pointer rounded-lg">
                                    Load More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OurIngredients;