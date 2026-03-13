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
import { useTranslation } from 'react-i18next';

const OurIngredients = () => {
    const { t } = useTranslation('ingredients');
    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState(t('allCategories'));

    const ingredients = [
        {
            image: cardImg,
            title: t('ingredients.hyaluronicAcid.title'),
            tag: t('ingredients.hyaluronicAcid.tag'),
            description: t('ingredients.hyaluronicAcid.description')
        },
        {
            image: garlicImg,
            title: t('ingredients.garlic.title'),
            tag: t('ingredients.garlic.tag'),
            description: t('ingredients.garlic.description')
        },
        {
            image: algeaImg,
            title: t('ingredients.laminariaAlgae.title'),
            tag: t('ingredients.laminariaAlgae.tag'),
            description: t('ingredients.laminariaAlgae.description')
        },
        {
            image: AschophyImg,
            title: t('ingredients.acetylcholineAlgae.title'),
            tag: t('ingredients.acetylcholineAlgae.tag'),
            description: t('ingredients.acetylcholineAlgae.description')
        },
        {
            image: AltanioImg,
            title: t('ingredients.allantoin.title'),
            tag: t('ingredients.allantoin.tag'),
            description: t('ingredients.allantoin.description')
        },
        {
            image: Alovera,
            title: t('ingredients.aloeVera.title'),
            tag: t('ingredients.aloeVera.tag'),
            description: t('ingredients.aloeVera.description')
        },
        {
            image: AlmondImg,
            title: t('ingredients.sweetAlmond.title'),
            tag: t('ingredients.sweetAlmond.tag'),
            description: t('ingredients.sweetAlmond.description')
        },
        {
            image: clay,
            title: t('ingredients.greenClay.title'),
            tag: t('ingredients.greenClay.tag'),
            description: t('ingredients.greenClay.description')
        },
        {
            image: Avacado,
            title: t('ingredients.lawyerAvocado.title'),
            tag: t('ingredients.lawyerAvocado.tag'),
            description: t('ingredients.lawyerAvocado.description')
        }
    ];


    const [isOpen, setIsOpen] = useState(false);

    const categoryOptions = [
        t('allCategories'),
        t('hydratingAgents'),
        t('soothingAgents'),
        t('calmingAgents'),
        t('nourishingOils'),
        t('nourishingAgents')
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
                                    {t('ourIngredients')}
                                </p>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    {t('forTheMostNaturalProducts')}
                                </h2>
                            </div>

                            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                                {t('ingredientsDescription')}
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
                                    {t('bioganceIngredientLibrary')}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                    {t('libraryDescription')}
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
                                        placeholder={t('searchIngredients')}
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
                                  {t('Loadmore')}
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