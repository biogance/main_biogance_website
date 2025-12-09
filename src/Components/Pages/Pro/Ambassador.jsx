"use client"

import { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function BioganceAmbassadorForm() {
    const [selectedTab, setSelectedTab] = useState('Content Creator');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact:'',
        cityRegion1: '',
        cityRegion2: '',
        socialMediaLink: '',
        followers: '',
        mainName: '',
        mainTheme: '',
        mainThemeText: '',
        contentType: '',
        petType: '',
        contentRanking: [],
        pets: [],
        petMainTheme: '',
        hasMultipleAnimals: '',
        animals: [],
        speciesBreed: '',
        breedName: '',
        mainBreedId: '',
        breedingDuration: '',
        breedingSize: '',
        familiarWithProducts: '',
        idealPartnership: ''
    });

    const tabs = [
        'Content Creator',
        'Breeder',
        'Groomer',
        'Club or Association',
        'Health Professional',
        'Animal welfare organization or shelter'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [animalForms, setAnimalForms] = useState([
        { id: 1, species: '', otherSpecies: '', breed: '', otherBreed: '', coatType: '', characteristics: '' }
    ]);

    const handleAnimalChange = (id, field, value) => {
        setAnimalForms(prev =>
            prev.map(animal =>
                animal.id === id ? { ...animal, [field]: value } : animal
            )
        );
    };

    const addAnimal = () => {
        const newId = animalForms.length + 1;
        setAnimalForms(prev => [
            ...prev,
            { id: newId, species: '', otherSpecies: '', breed: '', otherBreed: '', coatType: '', characteristics: '' }
        ]);
    };

    const [motivation, setMotivation] = useState('');
    const [agreeToReview, setAgreeToReview] = useState(false);
    const maxChars = 250;
    const [practicingYears, setPracticingYears] = useState('');
    const [workWith, setWorkWith] = useState('');
    const [familiarWith, setFamiliarWith] = useState('');
    const [participateIn, setParticipateIn] = useState('');
    const [expertTopics, setExpertTopics] = useState('');
    const [hearAbout, setHearAbout] = useState('');
    const [usefulProducts, setUsefulProducts] = useState('');
    const [otherProduct, setOtherProduct] = useState('');
    const [shareInitiatives, setShareInitiatives] = useState('');
    const [message, setMessage] = useState('');



    return (
        <>
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-in-out;
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
            `}</style>
            <Navbar />
            <div className=" bg-white p-12">

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-black mb-2">
                            Become a Biogance Ambassador
                        </h1>
                        <p className="text-sm text-black leading-relaxed">
                            Join our community of pet lovers and represent Biogance's natural, eco-certified care. Share our values of wellness, innovation, and sustainability with pet owners worldwide.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-300 mb-6">
                        <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-1 min-w-max">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`px-3 sm:px-4 md:px-3 py-2 text-xs sm:text-sm md:text-[14px] font-[550] rounded-t-lg cursor-pointer whitespace-nowrap ${selectedTab === tab
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Creator Tab */}
                    {selectedTab === 'Content Creator' && (

                        <>
                            <div className="animate-fadeIn">
                                {/* Form Container */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. The Pet Nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  "
                                                    
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. CA987654321"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Email*
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion1"
                                                    value={formData.cityRegion1}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Third Row - City/Region (half width) */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                                <div className=" py-8">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 rounded-lg border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">Your Universe</h2>
                                            </div>

                                            <div className="p-6 space-y-7">
                                                {/* Main Social Media Link */}
                                                <div>
                                                    <label className="block text-[14px] font-[520] text-[#393939] mb-2">
                                                        Main Social Media Link*
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="socialMediaLink"
                                                        value={formData.socialMediaLink}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. https://instagram.com/yourpage"
                                                        className="w-[50%] px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition"
                                                    />
                                                </div>

                                                {/* Number of Followers */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        Number of Followers
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['< 1,000', '1,000 - 5,000', '5,000 - 10,000', '10,000 - 50,000', '50,000+'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="followers"
                                                                    value={option}
                                                                    checked={formData.followers === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black  accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-3 text-xs text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Theme */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        Main theme*
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Animals', 'Lifestyle / Family', 'Beauty / Pet Care', 'Others'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="mainTheme"
                                                                    value={option}
                                                                    checked={formData.mainTheme === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-xs text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Theme Text Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                                        Main theme
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="mainThemeText"
                                                        value={formData.mainThemeText || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="eg: Type here"
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition"
                                                    />
                                                </div>

                                                {/* Type of content you enjoy creating */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        Type of content you enjoy creating
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Reels / Before-After videos', 'Creative photos', 'Tips or product reviews'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="contentType"
                                                                    value={option}
                                                                    checked={formData.contentType === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-xs text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Your pets */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        Your pets
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Dog', 'Cat', 'Horse', 'Others'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="petType"
                                                                    value={option}
                                                                    checked={formData.petType === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-xs text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Theme for Pet */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                                        Main theme
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="petMainTheme"
                                                        value={formData.petMainTheme || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="eg: Other pet"
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition"
                                                    />
                                                </div>

                                                {/* Do you have one or more animals? */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                                        Do you have one or more animals?*
                                                    </label>
                                                    <p className="text-xs text-gray-500 mb-4">
                                                        For several animals, please fill the form below for each one (max 3 animals)
                                                    </p>
                                                    <div className="space-y-3">
                                                        {['One', 'Several'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="hasMultipleAnimals"
                                                                    value={option}
                                                                    checked={formData.hasMultipleAnimals === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Dynamic Animal Forms */}
                                                {animalForms.map((animal, index) => (
                                                    <div key={animal.id} className="border-t border-gray-300 pt-7 pb-4">
                                                        <h3 className="text-sm font-semibold text-gray-900 mb-5">
                                                            Animal {index + 1} {index > 0 && `(optional)`}
                                                        </h3>

                                                        {/* Species */}
                                                        <div className="mb-6">
                                                            <label className="block text-sm font-medium text-gray-900 mb-3">Species*</label>
                                                            <div className="flex flex-wrap gap-4">
                                                                {['Dog', 'Cat', 'Horse', 'Rabbit', 'Others'].map((opt) => (
                                                                    <label key={opt} className="flex items-center cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`species-${animal.id}`}
                                                                            value={opt}
                                                                            checked={animal.species === opt}
                                                                            onChange={(e) => handleAnimalChange(animal.id, 'species', e.target.value)}
                                                                            className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                        />
                                                                        <span className="ml-3 text-xs text-gray-800">{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {animal.species === 'Others' && (
                                                            <div className="mb-6">
                                                                <input
                                                                    type="text"
                                                                    value={animal.otherSpecies}
                                                                    onChange={(e) => handleAnimalChange(animal.id, 'otherSpecies', e.target.value)}
                                                                    placeholder="Please specify species"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Breed */}
                                                        <div className="mb-6">
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">Breed</label>
                                                            <input
                                                                type="text"
                                                                value={animal.breed}
                                                                onChange={(e) => handleAnimalChange(animal.id, 'breed', e.target.value)}
                                                                placeholder="e.g. Golden Retriever, Persian, etc."
                                                                className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                            />
                                                        </div>

                                                        {/* Coat Type */}
                                                        <div className="mb-6">
                                                            <label className="block text-sm font-medium text-gray-900 mb-3">Coat Type</label>
                                                            <div className="flex flex-wrap gap-4">
                                                                {['Short', 'Medium', 'Long', 'Curly', 'Hairless'].map((opt) => (
                                                                    <label key={opt} className="flex items-center cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`coatType-${animal.id}`}
                                                                            value={opt}
                                                                            checked={animal.coatType === opt}
                                                                            onChange={(e) => handleAnimalChange(animal.id, 'coatType', e.target.value)}
                                                                            className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                        />
                                                                        <span className="ml-3 text-xs text-gray-800">{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Special Characteristics */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                Special characteristics or needs (optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={animal.characteristics}
                                                                onChange={(e) => handleAnimalChange(animal.id, 'characteristics', e.target.value)}
                                                                placeholder="e.g. Sensitive skin, allergies, rescue animal, senior, etc."
                                                                className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Another Animal Button */}
                                                {animalForms.length < 3 && (
                                                    <button
                                                        onClick={addAnimal}
                                                        className="mt-6 flex items-center gap-2 px-5 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
                                                    >
                                                        <span className="text-lg">+</span>
                                                        Add Another Animal
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className=" py-8">
                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-lg mb-6">
                                            <div className="px-6 py-4 rounded-lg border-b border-gray-300 bg-gray-50">
                                                <h3 className="text-sm font-semibold text-black">Your Motivation</h3>
                                            </div>

                                            <div className='p-6'>
                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                    In a few words, why would you like to become a Biogance ambassador?
                                                </label>
                                                <textarea
                                                    value={motivation}
                                                    onChange={(e) => setMotivation(e.target.value)}
                                                    placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                    maxLength={maxChars}
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition resize-none"
                                                />
                                                <div className="text-right mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {motivation.length}/{maxChars} characters
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Agreement Checkbox */}
                                        <div className="mb-6">
                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeToReview}
                                                    onChange={(e) => setAgreeToReview(e.target.checked)}
                                                    className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                                />
                                                <span className="ml-3 text-sm text-gray-800">
                                                    I agree that my information may be used to review my application.
                                                </span>
                                            </label>
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            <button className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button>
                                            <button type="submit" className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* BreederTab */}
                    {selectedTab === 'Breeder' && (
                        <>
                            <div className="animate-fadeIn">
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. The Pet Nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. CA987654321"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Email*
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion1"
                                                    value={formData.cityRegion1}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Third Row - City/Region (half width) */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="  py-8">
                                    <div className="max-w-5xl mx-auto space-y-6">

                                        {/* Your Activity */}
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">Your Activity</h2>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {/* Species Breed */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        Species Breed*
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Dog', 'Cat', 'Horse', 'Others'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="speciesBreed"
                                                                    value={option}
                                                                    checked={formData.speciesBreed === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Breed Name and Main Breed(s) */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-900 mb-2">
                                                            Breed Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="breedName"
                                                            value={formData.breedName}
                                                            onChange={handleInputChange}
                                                            placeholder="eg: Type here"
                                                            className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-900 mb-2">
                                                            Main Breed(s)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="mainBreedId"
                                                            value={formData.mainBreedId}
                                                            onChange={handleInputChange}
                                                            placeholder="eg: Type here"
                                                            className="w-full px-4 py-3 bg-gray-50  rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                        />
                                                    </div>
                                                </div>

                                                {/* How long have you been breeding? */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        How long have you been breeding?*
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Less than 5 years', '5 to 10 years', 'More than 10 years'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="breedingDuration"
                                                                    value={option}
                                                                    checked={formData.breedingDuration === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Breeding size */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        Breeding size
                                                    </label>
                                                    <div className="space-y-3">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="breedingSize"
                                                                value="Family breeder (1 - 3 litters / year)"
                                                                checked={formData.breedingSize === 'Family breeder (1 - 3 litters / year)'}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-3 text-sm text-gray-800">Family breeder (1 - 3 litters / year)</span>
                                                        </label>
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="breedingSize"
                                                                value="Professional breeder (more than 3 litters / year)"
                                                                checked={formData.breedingSize === 'Professional breeder (more than 3 litters / year)'}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-3 text-sm text-gray-800">Professional breeder (more than 3 litters / year)</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Your Collaboration with Biogance */}
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">Your Collaboration with Biogance</h2>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {/* Are you already familiar with our products? */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        Are you already familiar with our products?*
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Yes, I use them regularly', 'Yes, I know the brand', 'No, I\'m discovering it'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="familiarWithProducts"
                                                                    value={option}
                                                                    checked={formData.familiarWithProducts === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Would you like to */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        Would you like to
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Participate in product testing', 'Write articles or expert tips', 'Receive our puppy / kitten kits'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="idealPartnership"
                                                                    value={option}
                                                                    checked={formData.idealPartnership === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="  py-8 ">
                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-lg mb-6">
                                            <div className="px-6 py-4 rounded-lg border-b border-gray-300 bg-gray-50">
                                                <h3 className="text-sm font-semibold text-black">Your Motivation</h3>
                                            </div>

                                            <div className='p-6'>
                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                    In a few words, why would you like to become a Biogance ambassador?
                                                </label>
                                                <textarea
                                                    value={motivation}
                                                    onChange={(e) => setMotivation(e.target.value)}
                                                    placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                    maxLength={maxChars}
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition resize-none"
                                                />
                                                <div className="text-right mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {motivation.length}/{maxChars} characters
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Agreement Checkbox */}
                                        <div className="mb-6">
                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeToReview}
                                                    onChange={(e) => setAgreeToReview(e.target.checked)}
                                                    className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                                />
                                                <span className="ml-3 text-sm text-gray-800">
                                                    I agree that my information may be used to review my application.
                                                </span>
                                            </label>
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            <button className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button>
                                            <button className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {selectedTab === 'Groomer' && (
                        <>
                            <div className="animate-fadeIn">
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. The Pet Nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. CA987654321"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Email*
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion1"
                                                    value={formData.cityRegion1}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Third Row - City/Region (half width) */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="  py-8">
                                    <div className="max-w-5xl mx-auto space-y-6">

                                        {/* Your Activity */}
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">Your Activity</h2>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {/* Species Breed */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        Main Speciality*
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Dog Grooming', 'Cat Grooming', 'Equine Grooming', 'Others'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="speciesBreed"
                                                                    value={option}
                                                                    checked={formData.speciesBreed === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Breed Name and Main Breed(s) */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-900 mb-2">
                                                            Main Other Speciality
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="breedName"
                                                            value={formData.breedName}
                                                            onChange={handleInputChange}
                                                            placeholder="eg: Type here"
                                                            className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                        />
                                                    </div>

                                                </div>

                                            </div>
                                        </div>

                                        {/* Your Collaboration with Biogance */}
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">Online Presence</h2>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {/* Are you already familiar with our products? */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-2">
                                                        Link to Your main account
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="breedName"
                                                        value={formData.breedName}
                                                        onChange={handleInputChange}
                                                        placeholder="eg: Type here"
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                    />
                                                </div>

                                                {/* Would you like to */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        Would you like to share
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Before/After grooming vedios', 'Full routine featuring our products', 'Professional photos of the final result'].map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="idealPartnership"
                                                                    value={option}
                                                                    checked={formData.idealPartnership === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="  py-8 ">
                                            <div className="max-w-5xl mx-auto">
                                                <div className="bg-white border border-gray-300 rounded-lg mb-6">
                                                    <div className="px-6 py-4 rounded-lg border-b border-gray-300 bg-gray-50">
                                                        <h3 className="text-sm font-semibold text-black">Your Motivation</h3>
                                                    </div>

                                                    <div className='p-6'>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                                            In a few words, why would you like to become a Biogance ambassador?
                                                        </label>
                                                        <textarea
                                                            value={motivation}
                                                            onChange={(e) => setMotivation(e.target.value)}
                                                            placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                            maxLength={maxChars}
                                                            rows={4}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition resize-none"
                                                        />
                                                        <div className="text-right mt-2">
                                                            <span className="text-xs text-gray-500">
                                                                {motivation.length}/{maxChars} characters
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Agreement Checkbox */}
                                                <div className="mb-6">
                                                    <label className="flex items-start cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={agreeToReview}
                                                            onChange={(e) => setAgreeToReview(e.target.checked)}
                                                            className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-800">
                                                            I agree that my information may be used to review my application.
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Cancel and Submit Buttons */}
                                                <div className="flex gap-4">
                                                    <button className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                        Cancel
                                                    </button>
                                                    <button className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {selectedTab === 'Club or Association' && (
                        <>
                            <div className="animate-fadeIn">
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Name of Association/Club*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. The Pet Nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                          <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. pet nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Professional email address*
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion1"
                                                    value={formData.cityRegion1}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>


                                    </div>
                                </div>

                                <div className="max-w-5xl mx-auto  space-y-6  py-8">
                                    {/* Your Structure Section */}
                                    <div className="bg-white rounded-lg border border-gray-300 ">
                                        <h2 className="text-md font-semibold border-b border-gray-200 bg-gray-50 text-gray-900  p-4">Your Structure</h2>

                                        {/* Type of organization */}
                                        <div className="p-6 space-y-5">
                                            <div className="mb-6 ">
                                                <label className="block text-sm font-medium text-gray-700 mb-3 ">
                                                    Type of organization*
                                                </label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="structure" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Leisure club / association</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="structure" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Competition / show club / association</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="structure" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Others</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Organization name */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Organization
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="eg: Type here"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            {/* Number of active members */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Number of active members*
                                                </label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="members" className="w-4 h-4" />
                                                        <span className="ml-2 text-sm text-gray-700">Less than 50</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="members" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">50 - 200</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="members" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">More than 200</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Do you organize events */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Do you organize events (competitions, shows, awareness days)?*
                                                </label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="events" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="events" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Breeds Represented Section */}
                                    <div className="bg-white rounded-lg border border-gray-300 ">
                                        <h2 className="text-md font-semibold text-gray-900 mb-2 p-4 bg-gray-50">Breeds Represented</h2>
                                        <div className="p-6">
                                            <p className="text-sm text-gray-600 mb-6">
                                                Indicate the species and the breeds your club/association represents. Start with one breed, you can add up to 3 breed groups.
                                            </p>

                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                                    Breed Group #1
                                                </h3>

                                                {/* Species */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Species
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        <label className="flex items-center">
                                                            <input type="radio" name="species" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Dog</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="species" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Cat</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="species" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Horse</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="species" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Others</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Main Breed(s) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Main Breed(s)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="eg: Border Collie, Maine Coon, Selle Français"
                                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                    />
                                                </div>
                                            </div>

                                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md">
                                                <span className="text-lg">+</span>
                                                Add Another Breed Group
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-w-5xl mx-auto ">
                                        <div className="bg-white rounded-lg border border-gray-300 ">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6 p-4 bg-gray-50">Collaboration with Biogance</h2>

                                            {/* Why would you like to collaborate */}
                                            <div className="p-6">
                                                <div className="mb-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Why would you like to collaborate with Biogance?*
                                                    </label>
                                                    <div className="relative">
                                                        <textarea
                                                            placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                            rows="4"
                                                            className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                        />
                                                        <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                                                            0/250 characters
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* What types of actions */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        What types of actions would you be willing to implement to promote Biogance?*
                                                    </label>
                                                    <div className="space-y-2 mb-4">
                                                        <label className="flex items-center">
                                                            <input type="radio" name="actions" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Offer a promo code to your members</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="actions" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Distribute Biogance prizes during your contests / events</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="actions" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Publish articles / posts on your social media / website</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="actions" className="w-4 h-4 accent-black cursor-pointer" />
                                                            <span className="ml-2 text-sm text-gray-700">Others</span>
                                                        </label>
                                                    </div>

                                                    {/* Other type of actions */}
                                                    <div>
                                                        <label className="block text-sm text-gray-700 mb-2">
                                                            Other type of actions
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="eg: Border Collie, Maine Coon, Selle Français"
                                                            className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agreement Checkbox */}
                                    <div className="mb-6">
                                        <label className="flex items-start cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={agreeToReview}
                                                onChange={(e) => setAgreeToReview(e.target.checked)}
                                                className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm text-gray-800">
                                                I agree that my information may be used to review my application.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Cancel and Submit Buttons */}
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                            Cancel
                                        </button>
                                        <button className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}




                    {selectedTab === 'Health Professional' && (
                        <>
                            <div className="animate-fadeIn">
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. The Pet Nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. CA987654321"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                                Professional/Speciality
                                            </label>
                                            <div className="flex flex-wrap gap-4">
                                                {['Vetrinian', 'Osteopath', 'Nutritionist', 'Behaviorist', 'Others'].map((option) => (
                                                    <label key={option} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="speciesBreed"
                                                            value={option}
                                                            checked={formData.speciesBreed === option}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 text-black accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-lg text-black mb-2">
                                                Other Profession/Speciality
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                onChange={handleInputChange}
                                                placeholder="e.g. Type here"
                                                className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            />
                                        </div>


                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Name of Clinic/paractice/organization
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. pet net"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Professional email address*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion1"
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. pet net"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Third Row - City/Region (half width) */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className=" py-6 ">
                                    <div className="max-w-5xl mx-auto space-y-6">
                                        {/* Your Activity Section */}
                                        <div className="bg-white rounded-lg border border-gray-300 ">
                                            <h2 className=" p-6 bg-gray-50 text-md font-bold text-black">Your Activity</h2>

                                            {/* How long have you been practicing */}
                                            <div className="p-6">
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        How long have you been practicing?
                                                    </label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="practicingYears"
                                                                value="less5"
                                                                checked={practicingYears === 'less5'}
                                                                onChange={(e) => setPracticingYears(e.target.value)}
                                                                className=" accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Less than 5 years</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="practicingYears"
                                                                value="5-10"
                                                                checked={practicingYears === '5-10'}
                                                                onChange={(e) => setPracticingYears(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>5 to 10 years</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="practicingYears"
                                                                value="more10"
                                                                checked={practicingYears === 'more10'}
                                                                onChange={(e) => setPracticingYears(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>More than 10 years</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* You mainly work with */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        You mainly work with
                                                    </label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="workWith"
                                                                value="dogs"
                                                                checked={workWith === 'dogs'}
                                                                onChange={(e) => setWorkWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Dogs</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="workWith"
                                                                value="cats"
                                                                checked={workWith === 'cats'}
                                                                onChange={(e) => setWorkWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Cats</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="workWith"
                                                                value="horses"
                                                                checked={workWith === 'horses'}
                                                                onChange={(e) => setWorkWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Horses</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="workWith"
                                                                value="other"
                                                                checked={workWith === 'other'}
                                                                onChange={(e) => setWorkWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Other Animals</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Are you already familiar with Biogance or Eskadron? */}
                                                <div>
                                                    <label className="block mb-3 text-black">
                                                        Are you already familiar with Biogance or Eskadron?
                                                    </label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="familiarWith"
                                                                value="use"
                                                                checked={familiarWith === 'use'}
                                                                onChange={(e) => setFamiliarWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Yes, I use your products</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="familiarWith"
                                                                value="know"
                                                                checked={familiarWith === 'know'}
                                                                onChange={(e) => setFamiliarWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Yes, I know the brand</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="familiarWith"
                                                                value="discovering"
                                                                checked={familiarWith === 'discovering'}
                                                                onChange={(e) => setFamiliarWith(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>No, I&apos;m discovering it</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collaboration Opportunities Section */}
                                        <div className="bg-white rounded-lg border border-gray-200 ">
                                            <h2 className="p-6 bg-gray-50 text-md font-bold text-black">Collaboration Opportunities</h2>

                                            {/* Would you like to participate in */}
                                            <div className="p-6">
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        Would you like to participate in
                                                    </label>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="articles"
                                                                checked={participateIn === 'articles'}
                                                                onChange={(e) => setParticipateIn(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Writing articles / expert advice</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="testing"
                                                                checked={participateIn === 'testing'}
                                                                onChange={(e) => setParticipateIn(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Product testing / technical feedback</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="conferences"
                                                                checked={participateIn === 'conferences'}
                                                                onChange={(e) => setParticipateIn(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Conferences or interviews</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="field"
                                                                checked={participateIn === 'field'}
                                                                onChange={(e) => setParticipateIn(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Field collaborations (clinics, fairs, etc.)</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* What topics could you cover in an expert article? */}
                                                <div>
                                                    <label className="block mb-3 text-black">
                                                        What topics could you cover in an expert article?
                                                    </label>
                                                    <div className="relative">
                                                        <textarea
                                                            placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                            value={expertTopics}
                                                            onChange={(e) => {
                                                                if (e.target.value.length <= maxChars) {
                                                                    setExpertTopics(e.target.value);
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                        />
                                                        <div className="text-right text-gray-500 mt-1">
                                                            {expertTopics.length}/{maxChars} characters
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                        {/* Agreement Checkbox */}
                                        <div className="mb-6">
                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeToReview}
                                                    onChange={(e) => setAgreeToReview(e.target.checked)}
                                                    className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                                />
                                                <span className="ml-3 text-sm text-gray-800">
                                                    I agree that my information may be used to review my application.
                                                </span>
                                            </label>
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            <button className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button>
                                            <button className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>


                            </div>

                        </>
                    )}



                    {selectedTab === 'Animal welfare organization or shelter' && (

                        <>

                            <div className="animate-fadeIn">
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Name of Association/Club*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. The Pet Nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                           <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact name*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. pet nook"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Professional email address*
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion1"
                                                    value={formData.cityRegion1}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>


                                    </div>
                                </div>


                                <div className="max-w-5xl mx-auto  space-y-6  py-8">
                                    {/* Your Structure Section */}
                                    <div className="bg-white rounded-lg border border-gray-300 ">
                                        <h2 className="p-6 bg-gray-50 text-black text-sm font-bold">Your Structure</h2>

                                        {/* Type of organization */}
                                        <div className="p-6 space-y-5">
                                            <div className="mb-6 ">
                                                <label className="block text-sm font-medium text-gray-700 mb-3 ">
                                                    Legal Status*
                                                </label>
                                                <div className=" flex gap-3">
                                                    <label className="flex  items-center">
                                                        <input type="radio" name="structure" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Non profit association</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="structure" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Foundation</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="structure" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Others</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Organization name */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    RINA or SIREN number (if applicable)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="eg: Type here"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            {/* Number of active members */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Number of animals currently in care
                                                </label>
                                                <div className="flex gap-3">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="members" className="w-4 h-4" />
                                                        <span className="ml-2 text-sm text-gray-700">Less than 20</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="members" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">20 - 50</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="members" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">More than 50</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Do you organize events */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Species Concerned
                                                </label>
                                                <div className="gap-3 flex">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="events" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Dogs</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="events" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Cats</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="events" className="w-4 h-4 accent-black cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-700">Small pets/Others</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="   ">
                                    <div className="max-w-5xl mx-auto">
                                        {/* Your Collaboration with Biogance Section */}
                                        <div className="bg-white rounded-lg border border-gray-200 mb-8 ">
                                            <h2 className="p-6 bg-gray-50 text-black text-sm font-bold ">Your Collaboration with Biogance</h2>

                                            {/* How did you hear about Biogance? */}
                                            <div className="p-6">
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        How did you hear about Biogance?
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="hearAbout"
                                                                value="social"
                                                                checked={hearAbout === 'social'}
                                                                onChange={(e) => setHearAbout(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span  style={{color:"black"}}>Social media</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="hearAbout"
                                                                value="recommendation"
                                                                checked={hearAbout === 'recommendation'}
                                                                onChange={(e) => setHearAbout(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Recommendation</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="hearAbout"
                                                                value="trade"
                                                                checked={hearAbout === 'trade'}
                                                                onChange={(e) => setHearAbout(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Trade show / event</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="hearAbout"
                                                                value="others"
                                                                checked={hearAbout === 'others'}
                                                                onChange={(e) => setHearAbout(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Others</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Which products would be most useful you? */}
                                                <div className=" ">
                                                    <label className="block mb-3 text-black">
                                                        Which products would be most useful you?
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="usefulProducts"
                                                                value="shampoos"
                                                                checked={usefulProducts === 'shampoos'}
                                                                onChange={(e) => setUsefulProducts(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Shampoos and hygiene care</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="usefulProducts"
                                                                value="antiparasitic"
                                                                checked={usefulProducts === 'antiparasitic'}
                                                                onChange={(e) => setUsefulProducts(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Anti-parasitic products</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="usefulProducts"
                                                                value="cleaning"
                                                                checked={usefulProducts === 'cleaning'}
                                                                onChange={(e) => setUsefulProducts(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Cleaning / disinfection products</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="usefulProducts"
                                                                value="others"
                                                                checked={usefulProducts === 'others'}
                                                                onChange={(e) => setUsefulProducts(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Others</span>
                                                        </label>
                                                    </div>

                                                    {/* Other Product */}
                                                    <div>
                                                        <label className="block mb-2 text-gray-700 text-black">
                                                            Other Product
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="eg: Type here"
                                                            value={otherProduct}
                                                            onChange={(e) => setOtherProduct(e.target.value)}
                                                            className="w-full text-black px-3 py-2 border border-gray-300 rounded bg-gray-50 placeholder:text-gray-400"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Would you like to share your initiatives */}
                                                <div>
                                                    <label className="block mb-3 text-black">
                                                        Would you like to share your initiatives on our social media (photos, testimonials, acknowledgements)?
                                                    </label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="shareInitiatives"
                                                                value="yes"
                                                                checked={shareInitiatives === 'yes'}
                                                                onChange={(e) => setShareInitiatives(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>Yes</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="shareInitiatives"
                                                                value="no"
                                                                checked={shareInitiatives === 'no'}
                                                                onChange={(e) => setShareInitiatives(e.target.value)}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{color:"black"}}>No</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Your Message Section */}
                                        <div className="bg-white rounded-lg border border-gray-200 mb-6 ">
                                            <h2 className="p-6 bg-gray-50 text-sm font-bold text-black">Your Message</h2>

                                            {/* What topics could you cover in an expert article? */}
                                            <div className="p-6">
                                                <label className="block mb-3 text-black ">
                                                    What topics could you cover in an expert article?
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        value={motivation}
                                                        onChange={(e) => setMotivation(e.target.value)}
                                                        placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                        maxLength={maxChars}
                                                        rows={4}
                                                        className="w-full px-4 py-3 bg-grey-50 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition resize-none"
                                                    />
                                                    <div className="text-right text-gray-500 mt-1">
                                                        {message.length}/{maxChars} characters
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Agreement Checkbox */}
                                        <div className="mb-6">
                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeToReview}
                                                    onChange={(e) => setAgreeToReview(e.target.checked)}
                                                    className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                                />
                                                <span className="ml-3 text-sm text-gray-800">
                                                    I agree that my information may be used to review my application.
                                                </span>
                                            </label>
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            <button className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button>
                                            <button className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div >
            <Footer/>
        </>
    );
}