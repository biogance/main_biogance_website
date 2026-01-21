"use client"

import { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useRouter } from 'next/navigation';
import ThankYouModal from './ThankyouModal';
import { useTranslation } from 'react-i18next';

export default function BioganceAmbassadorForm() {
    const { t } = useTranslation('pro');
    const [selectedTab, setSelectedTab] = useState(t('ambassador.tabs.contentCreator'));
    const [formData, setFormData] = useState({
        // Common Fields (All Tabs)
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        cityRegion1: '',
        cityRegion2: '',

        // Content Creator fields
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

        // Breeder fields
        speciesBreed: '',
        breedName: '',
        mainBreedId: '',
        breedingDuration: '',
        breedingSize: '',
        familiarWithProducts: '',
        idealPartnership: '',

        // Groomer fields
        businessName: '',
        groomingExperience: '',
        servicesOffered: '',
        mainSpeciality: '',
        otherSpeciality: '',
        onlinePresenceLink: '',
        shareContent: '',

        // Club or Association fields
        organizationType: '',
        organizationName: '',
        memberCount: '',
        organizeEvents: '',
        breedSpecies: '',
        mainBreeds: '',
        collaborationReason: '',
        promotionActions: '',
        otherPromotionActions: '',

        // Health Professional fields
        profession: '',
        otherProfession: '',
        clinicName: '',
        yearsExperience: '',
        mainWorkWith: '',
        familiarWithBiogance: '',
        participateIn: '',
        expertTopics: '',

        // Animal Welfare Organization or Shelter fields
        shelterName: '',
        legalStatus: '',
        rinaSirenNumber: '',
        animalsInCare: '',
        speciesConcerned: '',
        hearAboutBiogance: '',
        usefulProducts: '',
        otherProducts: '',
        shareInitiatives: '',
        shelterMessage: ''
    });
    const tabs = [
        t('ambassador.tabs.contentCreator'),
        t('ambassador.tabs.breeder'),
        t('ambassador.tabs.groomer'),
        t('ambassador.tabs.clubAssociation'),
        t('ambassador.tabs.healthProfessional'),
        t('ambassador.tabs.animalWelfare')
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


    const handleCancel = () => {
        router.back();
    };
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        // Validate required fields
        const newErrors = {};

        // ===== COMMON FIELDS (All Tabs) =====
        if (!formData.firstName || formData.firstName.trim() === '') {
            newErrors.firstName = 'First name is required';
        }

        if (selectedTab !== 'Animal welfare organization or shelter' &&
            selectedTab !== 'Club or Association') {
            if (!formData.lastName || formData.lastName.trim() === '') {
                newErrors.lastName = 'Last name is required';
            }
        }

        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        if (!formData.contact || formData.contact.trim() === '') {
            newErrors.contact = 'Contact is required';
        }

        if (!formData.cityRegion2 || formData.cityRegion2.trim() === '') {
            newErrors.cityRegion2 = 'City/Region is required';
        }

        // ===== TAB-SPECIFIC VALIDATION =====

        // Content Creator Tab
        if (selectedTab === 'Content Creator') {
            // Your Universe validation
            if (!formData.socialMediaLink || formData.socialMediaLink.trim() === '') {
                newErrors.socialMediaLink = 'Main social media link is required';
            }

            if (!formData.mainTheme || formData.mainTheme.trim() === '') {
                newErrors.mainTheme = 'Main theme is required';
            }

            if (!formData.hasMultipleAnimals || formData.hasMultipleAnimals.trim() === '') {
                newErrors.hasMultipleAnimals = 'Please select if you have one or more animals';
            }


            // Animal validation (at least first animal's species is required)
            if (animalForms && animalForms.length > 0 && (!animalForms[0].species || animalForms[0].species === '')) {
                newErrors.animalSpecies = 'Species for Animal 1 is required';
            }

            // Collaboration validation

        }

        // Breeder Tab
        else if (selectedTab === 'Breeder') {
            // Your Activity validation
            if (!formData.speciesBreed || formData.speciesBreed.trim() === '') {
                newErrors.speciesBreed = 'Species Breed is required';
            }

            if (!formData.breedingDuration || formData.breedingDuration.trim() === '') {
                newErrors.breedingDuration = 'Breeding duration is required';
            }

            // Your Collaboration with Biogance validation
            if (!formData.familiarWithProducts || formData.familiarWithProducts.trim() === '') {
                newErrors.familiarWithProducts = 'Please select if you are familiar with our products';
            }
        }

        // Groomer Tab
        else if (selectedTab === 'Groomer') {
            // Grooming business validation
            if (!formData.speciesBreed || formData.speciesBreed.trim() === '') {
                newErrors.speciesBreed = 'Speciality is required';
            }


        }

        // Club or Association Tab
        else if (selectedTab === 'Club or Association') {
            // Basic Information validation
            if (!formData.firstName || formData.firstName.trim() === '') {
                newErrors.firstName = 'Name of Association/Club is required';
            }

            if (!formData.contact || formData.contact.trim() === '') {
                newErrors.contact = 'Contact name is required';
            }

            if (!formData.email || formData.email.trim() === '') {
                newErrors.email = 'Professional email address is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }

            if (!formData.cityRegion2 || formData.cityRegion2.trim() === '') {
                newErrors.cityRegion2 = 'City / Region is required';
            }

            // Organization validation
            if (!formData.organizationType || formData.organizationType.trim() === '') {
                newErrors.organizationType = 'Organization type is required';
            }

            if (!formData.memberCount || formData.memberCount.trim() === '') {
                newErrors.memberCount = 'Number of active members is required';
            }

            if (!formData.organizeEvents || formData.organizeEvents.trim() === '') {
                newErrors.organizeEvents = 'Please select if you organize events';
            }

            // Collaboration validation
            if (!formData.collaborationReason || formData.collaborationReason.trim() === '') {
                newErrors.collaborationReason = 'Please tell us why you want to collaborate';
            }

            if (!formData.promotionActions || formData.promotionActions.trim() === '') {
                newErrors.promotionActions = 'Please select promotion actions';
            }

            // Agreement validation
            if (!agreeToReview) {
                newErrors.agreeToReview = 'You must agree to the review of your application';
            }
        }

        // Health Professional Tab
        else if (selectedTab === 'Health Professional') {
            // Professional information validation
            if (!formData.profession || formData.profession.trim() === '') {
                newErrors.profession = 'Profession/Speciality is required';
            }

            if (!formData.yearsExperience || formData.yearsExperience.trim() === '') {
                newErrors.yearsExperience = 'Years of experience is required';
            }
        }

        // Animal Welfare Organization or Shelter Tab
        else if (selectedTab === 'Animal welfare organization or shelter') {
            // Legal status validation
            if (!formData.legalStatus || formData.legalStatus.trim() === '') {
                newErrors.legalStatus = 'Legal status is required';
            }
        }

        // Agreement checkbox validation (Common for all tabs)
        if (!agreeToReview) {
            newErrors.agreeToReview = 'You must agree to the information review to submit';
        }

        // Check if there are any errors
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll to first error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // All validation passed, show modal
        console.log('Form submitted:', {
            tab: selectedTab,
            formData: formData,
            motivation: motivation,
            animals: animalForms
        });
        console.log('Form submitted successfully for tab:', selectedTab);
        console.log('Form Data:', formData);
        console.log('Motivation:', motivation);
        setShowModal(true);

        // Reset form after successful submission
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            contact: '',
            cityRegion1: '',
            cityRegion2: '',

            // Content Creator fields
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

            // Breeder fields
            speciesBreed: '',
            breedName: '',
            mainBreedId: '',
            breedingDuration: '',
            breedingSize: '',

            // Groomer fields
            businessName: '',
            groomingExperience: '',
            servicesOffered: '',

            // Club or Association fields
            organizationName: '',
            organizationType: '',
            memberCount: '',

            // Health Professional fields
            clinicName: '',
            profession: '',
            yearsOfExperience: '',

            // Animal Welfare fields
            shelterName: '',
            shelterType: '',
            animalsRescued: '',

            // Common collaboration field
            familiarWithProducts: '',
            idealPartnership: ''
        });

        setMotivation('');
        setAgreeToReview(false);
        if (setAnimalForms) {
            setAnimalForms([]);
        }
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
    const router = useRouter();



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

                .scrollbar-hide {
                    -ms-overflow-style: none;  /* Internet Explorer 10+ */
                    scrollbar-width: none;  /* Firefox */
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;  /* Safari and Chrome */
                }
            `}</style>
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            <div className=" bg-white p-12 mt-10">

                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-black mb-2">
                            {t('ambassador.title')}
                        </h1>
                        <p className="text-sm text-black leading-relaxed">
                            {t('ambassador.description')}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-300 mb-6">
                        <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex lg:gap-7 gap-1 min-w-max">
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
                    {/* Content Creator Tab - UPDATED WITH TRANSLATIONS */}
                    {selectedTab === t('ambassador.tabs.contentCreator') && (
                        <>
                            <div className="animate-fadeIn">
                                {/* Basic Information - Already translated in common section */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            {t('ambassador.common.basicInformation')}
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.firstName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.firstName) {
                                                            setErrors({ ...errors, firstName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.firstName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.firstNameRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.lastName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.lastName) {
                                                            setErrors({ ...errors, lastName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.lastName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.lastNameRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.email')}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.email) {
                                                            setErrors({ ...errors, email: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.email')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.contact')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.contact) {
                                                            setErrors({ ...errors, contact: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.contact')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.contactRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Third Row */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.cityRegion')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.cityRegion')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.cityRegionRequired')}</p>
                                                )}
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Universe Section */}
                                <div className="py-8">
                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 rounded-lg border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">{t('ambassador.contentCreator.yourUniverse')}</h2>
                                            </div>

                                            <div className="p-6 space-y-7">
                                                {/* Main Social Media Link */}
                                                <div>
                                                    <label className="block text-[14px] font-[520] text-[#393939] mb-2">
                                                        {t('ambassador.contentCreator.mainSocialMediaLink')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="socialMediaLink"
                                                        value={formData.socialMediaLink}
                                                        onChange={(e) => {
                                                            handleInputChange(e);
                                                            if (errors.socialMediaLink) {
                                                                setErrors({ ...errors, socialMediaLink: '' });
                                                            }
                                                        }}
                                                        placeholder={t('ambassador.contentCreator.placeholders.socialMediaLink')}
                                                        className="w-[50%] px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                    />
                                                    {errors.socialMediaLink && (
                                                        <p className="mt-1 text-xs text-red-600">{t('ambassador.contentCreator.errors.socialMediaLinkRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Number of Followers */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        {t('ambassador.contentCreator.numberOfFollowers')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.contentCreator.options.followers', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="followers"
                                                                    value={option}
                                                                    checked={formData.followers === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-3 text-xs text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Theme */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        {t('ambassador.contentCreator.mainTheme')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.contentCreator.options.mainThemes', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="mainTheme"
                                                                    value={option}
                                                                    checked={formData.mainTheme === option}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e);
                                                                        if (errors.mainTheme) {
                                                                            setErrors({ ...errors, mainTheme: '' });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-xs text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {errors.mainTheme && (
                                                        <p className="mt-1 text-xs text-red-600">{t('ambassador.contentCreator.errors.mainThemeRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Main Theme Text Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                                        {t('ambassador.contentCreator.mainThemeText')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="mainThemeText"
                                                        value={formData.mainThemeText || ''}
                                                        onChange={handleInputChange}
                                                        placeholder={t('ambassador.contentCreator.placeholders.mainThemeText')}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                    />
                                                </div>

                                                {/* Type of content */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        {t('ambassador.contentCreator.typeOfContent')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.contentCreator.options.contentTypes', { returnObjects: true }).map((option) => (
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
                                                        {t('ambassador.contentCreator.yourPets')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.contentCreator.options.petTypes', { returnObjects: true }).map((option) => (
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
                                                        {t('ambassador.contentCreator.mainThemeForPet')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="petMainTheme"
                                                        value={formData.petMainTheme || ''}
                                                        onChange={handleInputChange}
                                                        placeholder={t('ambassador.contentCreator.placeholders.petMainTheme')}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                    />
                                                </div>

                                                {/* Multiple Animals */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                                        {t('ambassador.contentCreator.doYouHaveMultipleAnimals')}
                                                    </label>
                                                    <p className="text-xs text-gray-500 mb-4">
                                                        {t('ambassador.contentCreator.multipleAnimalsNote')}
                                                    </p>
                                                    <div className="space-y-3">
                                                        {t('ambassador.contentCreator.options.multipleAnimals', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="hasMultipleAnimals"
                                                                    value={option}
                                                                    checked={formData.hasMultipleAnimals === option}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e);
                                                                        if (errors.hasMultipleAnimals) {
                                                                            setErrors({ ...errors, hasMultipleAnimals: '' });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                        {errors.hasMultipleAnimals && (
                                                            <p className="mt-1 text-xs text-red-600">{t('ambassador.contentCreator.errors.hasMultipleAnimalsRequired')}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Dynamic Animal Forms */}
                                                {animalForms.map((animal, index) => (
                                                    <div key={animal.id} className="border-t border-gray-300 pt-7 pb-4">
                                                        <h3 className="text-sm font-semibold text-gray-900 mb-5">
                                                            {t('ambassador.contentCreator.animalNumber')} {index + 1} {index > 0 && t('ambassador.contentCreator.optional')}
                                                        </h3>

                                                        {/* Species */}
                                                        <div className="mb-6">
                                                            <label className="block text-sm font-medium text-gray-900 mb-3">{t('ambassador.contentCreator.animalSpecies')}</label>
                                                            <div className="flex flex-wrap gap-4">
                                                                {t('ambassador.contentCreator.options.species', { returnObjects: true }).map((opt) => (
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
                                                            {errors.animalSpecies && (
                                                                <p className="text-xs text-red-600 mt-2">{t('ambassador.contentCreator.errors.animalSpeciesRequired')}</p>
                                                            )}
                                                        </div>

                                                        {animal.species === 'Others' && (
                                                            <div className="mb-6">
                                                                <input
                                                                    type="text"
                                                                    value={animal.otherSpecies}
                                                                    onChange={(e) => handleAnimalChange(animal.id, 'otherSpecies', e.target.value)}
                                                                    placeholder={t('ambassador.contentCreator.pleaseSpecifySpecies')}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Breed */}
                                                        <div className="mb-6">
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">{t('ambassador.contentCreator.breed')}</label>
                                                            <input
                                                                type="text"
                                                                value={animal.breed}
                                                                onChange={(e) => handleAnimalChange(animal.id, 'breed', e.target.value)}
                                                                placeholder={t('ambassador.contentCreator.placeholders.breed')}
                                                                className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
                                                            />
                                                        </div>

                                                        {/* Coat Type */}
                                                        <div className="mb-6">
                                                            <label className="block text-sm font-medium text-gray-900 mb-3">{t('ambassador.contentCreator.coatType')}</label>
                                                            <div className="flex flex-wrap gap-4">
                                                                {t('ambassador.contentCreator.options.coatTypes', { returnObjects: true }).map((opt) => (
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
                                                                {t('ambassador.contentCreator.specialCharacteristics')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={animal.characteristics}
                                                                onChange={(e) => handleAnimalChange(animal.id, 'characteristics', e.target.value)}
                                                                placeholder={t('ambassador.contentCreator.placeholders.characteristics')}
                                                                className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
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
                                                        {t('ambassador.contentCreator.addAnotherAnimal')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivation Section */}
                                <div className="py-8">
                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-lg mb-6">
                                            <div className="px-6 py-4 rounded-lg border-b border-gray-300 bg-gray-50">
                                                <h3 className="text-sm font-semibold text-black">{t('ambassador.common.motivation')}</h3>
                                            </div>

                                            <div className='p-6'>
                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                    {t('ambassador.common.motivationQuestion')}
                                                </label>
                                                <textarea
                                                    value={motivation}
                                                    onChange={(e) => setMotivation(e.target.value)}
                                                    placeholder={t('ambassador.common.motivationQuestion')}
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
                                                    {t('ambassador.common.agreement')}
                                                </span>
                                            </label>
                                            {errors.agreeToReview && (
                                                <p className="text-red-500 text-xs mt-1">{t('ambassador.common.errors.agreementRequired')}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-4">
                                            <button onClick={handleSubmit} type="button" className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                {t('ambassador.common.submit')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* BreederTab */}
                    {/* Breeder Tab - UPDATED WITH TRANSLATIONS */}
                    {selectedTab === t('ambassador.tabs.breeder') && (
                        <>
                            <div className="animate-fadeIn">
                                {/* Basic Information */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            {t('ambassador.common.basicInformation')}
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.firstName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.firstName) {
                                                            setErrors({ ...errors, firstName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.firstName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.firstNameRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.lastName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.lastName) {
                                                            setErrors({ ...errors, lastName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.lastName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.lastNameRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and Contact */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.email')}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.email) {
                                                            setErrors({ ...errors, email: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.email')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.contact')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.contact) {
                                                            setErrors({ ...errors, contact: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.contact')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.contactRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Third Row - City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.cityRegion')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.cityRegion')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.cityRegionRequired')}</p>
                                                )}
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Activity Section */}
                                <div className="py-8">
                                    <div className="max-w-5xl mx-auto space-y-6">
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black rounded-lg">
                                                    {t('ambassador.breeder.yourActivity')}
                                                </h2>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Species Breed */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.breeder.speciesBreed')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.breeder.options.speciesBreeds', { returnObjects: true }).map((option) => (
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
                                                    {errors.speciesBreed && (
                                                        <p className="text-red-500 text-xs mt-1">{t('ambassador.breeder.errors.speciesBreedRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Breed Name and Main Breed(s) */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-900 mb-2">
                                                            {t('ambassador.breeder.breedName')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="breedName"
                                                            value={formData.breedName}
                                                            onChange={handleInputChange}
                                                            placeholder={t('ambassador.breeder.placeholders.breedName')}
                                                            className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-900 mb-2">
                                                            {t('ambassador.breeder.mainBreeds')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="mainBreedId"
                                                            value={formData.mainBreedId}
                                                            onChange={handleInputChange}
                                                            placeholder={t('ambassador.breeder.placeholders.mainBreeds')}
                                                            className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                        />
                                                    </div>
                                                </div>

                                                {/* How long have you been breeding? */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.breeder.howLongBreeding')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.breeder.options.breedingDuration', { returnObjects: true }).map((option) => (
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
                                                    {errors.breedingDuration && (
                                                        <p className="text-red-500 text-xs mt-1">{t('ambassador.breeder.errors.breedingDurationRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Breeding size */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.breeder.breedingSize')}
                                                    </label>
                                                    <div className="space-y-3">
                                                        {t('ambassador.breeder.options.breedingSizes', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="breedingSize"
                                                                    value={option}
                                                                    checked={formData.breedingSize === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 text-black border-2 border-black accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-800">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Your Collaboration with Biogance */}
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">
                                                    {t('ambassador.breeder.yourCollaboration')}
                                                </h2>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Are you already familiar with our products? */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.breeder.familiarWithProducts')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.breeder.options.familiarity', { returnObjects: true }).map((option) => (
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
                                                    {errors.familiarWithProducts && (
                                                        <p className="text-red-500 text-xs mt-1">{t('ambassador.breeder.errors.familiarWithProductsRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Would you like to */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.breeder.wouldYouLikeTo')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.breeder.options.collaborationTypes', { returnObjects: true }).map((option) => (
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

                                {/* Motivation Section */}
                                <div className="py-8">
                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-lg mb-6">
                                            <div className="px-6 py-4 rounded-lg border-b border-gray-300 bg-gray-50">
                                                <h3 className="text-sm font-semibold text-black">
                                                    {t('ambassador.common.motivation')}
                                                </h3>
                                            </div>

                                            <div className='p-6'>
                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                    {t('ambassador.common.motivationQuestion')}
                                                </label>
                                                <textarea
                                                    value={motivation}
                                                    onChange={(e) => setMotivation(e.target.value)}
                                                    placeholder={t('ambassador.common.motivationQuestion')}
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
                                                    {t('ambassador.common.agreement')}
                                                </span>
                                            </label>
                                            {errors.agreeToReview && (
                                                <p className="text-red-500 text-xs mt-1">{t('ambassador.common.errors.agreementRequired')}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-4">
                                            <button onClick={handleSubmit} type="button" className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                {t('ambassador.common.submit')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Groomer Tab - UPDATED WITH TRANSLATIONS */}
                    {selectedTab === t('ambassador.tabs.groomer') && (
                        <>
                            <div className="animate-fadeIn">
                                {/* Basic Information */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            {t('ambassador.common.basicInformation')}
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.firstName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('ambassador.common.placeholders.firstName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.firstNameRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.lastName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('ambassador.common.placeholders.lastName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.lastNameRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and Contact */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.email')}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.email) {
                                                            setErrors({ ...errors, email: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.email')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.contact')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.contact) {
                                                            setErrors({ ...errors, contact: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.contact')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.contactRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Third Row - City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.cityRegion')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.cityRegion')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.cityRegionRequired')}</p>
                                                )}
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Activity Section */}
                                <div className="py-8">
                                    <div className="max-w-5xl mx-auto space-y-6">
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black rounded-lg">
                                                    {t('ambassador.breeder.yourActivity')}
                                                </h2>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Main Speciality */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.groomer.mainSpeciality')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.groomer.options.specialities', { returnObjects: true }).map((option) => (
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
                                                    {errors.speciesBreed && (
                                                        <p className="mt-1 text-xs text-red-600">{t('ambassador.groomer.errors.specialityRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Main Other Speciality */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-900 mb-2">
                                                            {t('ambassador.groomer.mainOtherSpeciality')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="breedName"
                                                            value={formData.breedName}
                                                            onChange={handleInputChange}
                                                            placeholder={t('ambassador.groomer.placeholders.mainOtherSpeciality')}
                                                            className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Online Presence Section */}
                                        <div className="bg-white border border-gray-300 rounded-lg">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                                                <h2 className="text-sm font-semibold text-black">
                                                    {t('ambassador.groomer.onlinePresence')}
                                                </h2>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Link to Your main account */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-2">
                                                        {t('ambassador.groomer.linkToMainAccount')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="breedName"
                                                        value={formData.breedName}
                                                        onChange={handleInputChange}
                                                        placeholder={t('ambassador.groomer.placeholders.linkToMainAccount')}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                    />
                                                </div>

                                                {/* Would you like to share */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-900 mb-3">
                                                        {t('ambassador.groomer.wouldYouLikeToShare')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.groomer.options.shareOptions', { returnObjects: true }).map((option) => (
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

                                        {/* Motivation Section */}
                                        <div className="py-8">
                                            <div className="max-w-5xl mx-auto">
                                                <div className="bg-white border border-gray-300 rounded-lg mb-6">
                                                    <div className="px-6 py-4 rounded-lg border-b border-gray-300 bg-gray-50">
                                                        <h3 className="text-sm font-semibold text-black">
                                                            {t('ambassador.common.motivation')}
                                                        </h3>
                                                    </div>

                                                    <div className='p-6'>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                                            {t('ambassador.common.motivationQuestion')}
                                                        </label>
                                                        <textarea
                                                            value={motivation}
                                                            onChange={(e) => setMotivation(e.target.value)}
                                                            placeholder={t('ambassador.common.motivationQuestion')}
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
                                                            {t('ambassador.common.agreement')}
                                                        </span>
                                                    </label>
                                                    {errors.agreeToReview && (
                                                        <p className="text-red-500 text-xs mt-1">{t('ambassador.common.errors.agreementRequired')}</p>
                                                    )}
                                                </div>

                                                {/* Submit Button */}
                                                <div className="flex gap-4">
                                                    <button type="button" onClick={handleSubmit}
                                                        className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                        {t('ambassador.common.submit')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Club or Association Tab - UPDATED WITH TRANSLATIONS */}
                    {selectedTab === t('ambassador.tabs.clubAssociation') && (
                        <>
                            <div className="animate-fadeIn">
                                {/* Basic Information */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            {t('ambassador.common.basicInformation')}
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - Organization Name and Contact Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.organizationName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.firstName) {
                                                            setErrors({ ...errors, firstName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.organizationName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.organizationNameRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.contactName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.contact) {
                                                            setErrors({ ...errors, contact: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.contactName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.contactNameRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.professionalEmail')}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.email) {
                                                            setErrors({ ...errors, email: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.professionalEmail')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.cityRegion')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.common.placeholders.cityRegion')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.cityRegionRequired')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Structure Section */}
                                <div className="max-w-5xl mx-auto space-y-6 py-8">
                                    <div className="bg-white rounded-lg border border-gray-300">
                                        <h2 className="text-md font-semibold border-b border-gray-200 bg-gray-50 text-gray-900 p-4 rounded-lg">
                                            {t('ambassador.clubAssociation.yourStructure')}
                                        </h2>

                                        <div className="p-6 space-y-5">
                                            {/* Type of organization */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    {t('ambassador.clubAssociation.typeOfOrganization')}
                                                </label>
                                                <div className="space-y-2">
                                                    {t('ambassador.clubAssociation.options.organizationTypes', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="organizationType"
                                                                value={option}
                                                                checked={formData.organizationType === option}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.organizationType) {
                                                                        setErrors({ ...errors, organizationType: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.organizationType && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.clubAssociation.errors.organizationTypeRequired')}</p>
                                                )}
                                            </div>

                                            {/* Organization name */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('ambassador.clubAssociation.organizationName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="organizationName"
                                                    value={formData.organizationName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('ambassador.clubAssociation.placeholders.organizationName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            {/* Number of active members */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    {t('ambassador.clubAssociation.numberOfActiveMembers')}
                                                </label>
                                                <div className="space-y-2">
                                                    {t('ambassador.clubAssociation.options.memberCounts', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="memberCount"
                                                                value={option}
                                                                checked={formData.memberCount === option}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.memberCount) {
                                                                        setErrors({ ...errors, memberCount: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.memberCount && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.clubAssociation.errors.memberCountRequired')}</p>
                                                )}
                                            </div>

                                            {/* Do you organize events */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    {t('ambassador.clubAssociation.doYouOrganizeEvents')}
                                                </label>
                                                <div className="space-y-2">
                                                    {t('ambassador.clubAssociation.options.events', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="organizeEvents"
                                                                value={option}
                                                                checked={formData.organizeEvents === option}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.organizeEvents) {
                                                                        setErrors({ ...errors, organizeEvents: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.organizeEvents && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.clubAssociation.errors.organizeEventsRequired')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breeds Represented Section */}
                                    <div className="bg-white rounded-lg border border-gray-300">
                                        <h2 className="text-md font-semibold text-gray-900 mb-2 p-4 bg-gray-50">
                                            {t('ambassador.clubAssociation.breedsRepresented')}
                                        </h2>
                                        <div className="p-6">
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                                    {t('ambassador.clubAssociation.breedGroup1')}
                                                </h3>

                                                {/* Species */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        {t('ambassador.clubAssociation.species')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {t('ambassador.clubAssociation.options.species', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="breedSpecies"
                                                                    value={option}
                                                                    checked={formData.breedSpecies === option}
                                                                    onChange={handleInputChange}
                                                                    className="w-4 h-4 accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Breed(s) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {t('ambassador.clubAssociation.mainBreeds')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="mainBreeds"
                                                        value={formData.mainBreeds}
                                                        onChange={handleInputChange}
                                                        placeholder={t('ambassador.clubAssociation.placeholders.mainBreeds')}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                    />
                                                </div>
                                            </div>

                                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition">
                                                <span className="text-lg">+</span>
                                                {t('ambassador.clubAssociation.addAnotherBreedGroup')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Collaboration with Biogance Section */}
                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white rounded-lg border border-gray-300">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6 p-4 bg-gray-50">
                                                {t('ambassador.clubAssociation.collaborationWithBiogance')}
                                            </h2>

                                            <div className="p-6">
                                                {/* Why would you like to collaborate */}
                                                <div className="mb-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {t('ambassador.clubAssociation.whyCollaborate')}
                                                    </label>
                                                    <div className="relative">
                                                        <textarea
                                                            name="collaborationReason"
                                                            value={formData.collaborationReason}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.collaborationReason) {
                                                                    setErrors({ ...errors, collaborationReason: '' });
                                                                }
                                                            }}
                                                            placeholder={t('ambassador.common.motivationQuestion')}
                                                            rows="4"
                                                            maxLength={250}
                                                            className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1"
                                                        />
                                                        <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                                                            {formData.collaborationReason?.length || 0}/250 characters
                                                        </div>
                                                    </div>
                                                    {errors.collaborationReason && (
                                                        <p className="mt-1 text-xs text-red-600">{t('ambassador.clubAssociation.errors.collaborationReasonRequired')}</p>
                                                    )}
                                                </div>

                                                {/* What types of actions */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        {t('ambassador.clubAssociation.promotionActions')}
                                                    </label>
                                                    <div className="space-y-2 mb-4">
                                                        {t('ambassador.clubAssociation.options.promotionActions', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="promotionActions"
                                                                    value={option}
                                                                    checked={formData.promotionActions === option}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e);
                                                                        if (errors.promotionActions) {
                                                                            setErrors({ ...errors, promotionActions: '' });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 accent-black cursor-pointer"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {errors.promotionActions && (
                                                        <p className="mt-1 text-xs text-red-600">{t('ambassador.clubAssociation.errors.promotionActionsRequired')}</p>
                                                    )}

                                                    {/* Other type of actions */}
                                                    <div>
                                                        <label className="block text-sm text-gray-700 mb-2">
                                                            {t('ambassador.clubAssociation.otherTypeOfActions')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="otherPromotionActions"
                                                            value={formData.otherPromotionActions}
                                                            onChange={handleInputChange}
                                                            placeholder={t('ambassador.clubAssociation.placeholders.otherPromotionActions')}
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
                                                onChange={(e) => {
                                                    setAgreeToReview(e.target.checked);
                                                    if (errors.agreeToReview) {
                                                        setErrors({ ...errors, agreeToReview: '' });
                                                    }
                                                }}
                                                className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm text-gray-800">
                                                {t('ambassador.common.agreement')}
                                            </span>
                                        </label>
                                        {errors.agreeToReview && (
                                            <p className="text-red-500 text-xs mt-1">{t('ambassador.common.errors.agreementRequired')}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-4">
                                        <button type="button"
                                            onClick={handleSubmit}
                                            className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                            {t('ambassador.common.submit')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Health Professional Tab - UPDATED WITH TRANSLATIONS */}
                    {selectedTab === t('ambassador.tabs.healthProfessional') && (
                        <>
                            <div className="animate-fadeIn">
                                {/* Basic Information */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            {t('ambassador.common.basicInformation')}
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - First Name and Last Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.firstName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.firstName) {
                                                            setErrors({ ...errors, firstName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.healthProfessional.placeholders.contact').split(' ')[0]}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.firstNameRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.lastName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.lastName) {
                                                            setErrors({ ...errors, lastName: '' });
                                                        }
                                                    }}
                                                    placeholder="e.g. Doe"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.lastNameRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Professional/Speciality */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                                {t('ambassador.healthProfessional.professionSpeciality')}
                                            </label>
                                            <div className="flex flex-wrap gap-4">
                                                {t('ambassador.healthProfessional.options.professions', { returnObjects: true }).map((option) => (
                                                    <label key={option} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="profession"
                                                            value={option}
                                                            checked={formData.profession === option}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.profession) {
                                                                    setErrors({ ...errors, profession: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 text-black accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-800">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.profession && (
                                                <p className="mt-1 text-xs text-red-600">{t('ambassador.healthProfessional.errors.professionRequired')}</p>
                                            )}
                                        </div>

                                        {/* Other Profession/Speciality */}
                                        <div>
                                            <label className="block text-sm font-lg text-black mb-2">
                                                {t('ambassador.healthProfessional.otherProfessionSpeciality')}
                                            </label>
                                            <input
                                                type="text"
                                                name="otherProfession"
                                                value={formData.otherProfession}
                                                onChange={handleInputChange}
                                                placeholder={t('ambassador.healthProfessional.placeholders.otherProfessionSpeciality')}
                                                className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            />
                                        </div>

                                        {/* Second Row - Clinic Name and Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.healthProfessional.nameOfClinic')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="clinicName"
                                                    value={formData.clinicName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('ambassador.healthProfessional.placeholders.nameOfClinic')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.professionalEmail')}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.email) {
                                                            setErrors({ ...errors, email: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.healthProfessional.placeholders.professionalEmail')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Third Row - Contact and City/Region */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.contact')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.contact) {
                                                            setErrors({ ...errors, contact: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.healthProfessional.placeholders.contact')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.contactRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.cityRegion')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.healthProfessional.placeholders.cityRegion')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.cityRegionRequired')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Activity Section */}
                                <div className="py-6">
                                    <div className="max-w-5xl mx-auto space-y-6">
                                        <div className="bg-white rounded-lg border border-gray-300">
                                            <h2 className="p-6 bg-gray-50 text-md font-bold text-black rounded-lg">
                                                {t('ambassador.healthProfessional.yourActivity')}
                                            </h2>

                                            <div className="p-6">
                                                {/* How long have you been practicing */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        {t('ambassador.healthProfessional.howLongPracticing')}
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        {t('ambassador.healthProfessional.options.practicingYears', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="yearsExperience"
                                                                    value={option}
                                                                    checked={formData.yearsExperience === option}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e);
                                                                        if (errors.yearsExperience) {
                                                                            setErrors({ ...errors, yearsExperience: '' });
                                                                        }
                                                                    }}
                                                                    className="accent-black cursor-pointer"
                                                                />
                                                                <span style={{ color: "black" }}>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {errors.yearsExperience && (
                                                        <p className="mt-1 text-xs text-red-600">{t('ambassador.healthProfessional.errors.yearsExperienceRequired')}</p>
                                                    )}
                                                </div>

                                                {/* You mainly work with */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        {t('ambassador.healthProfessional.youMainlyWorkWith')}
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        {t('ambassador.healthProfessional.options.workWith', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="mainWorkWith"
                                                                    value={option}
                                                                    checked={formData.mainWorkWith === option}
                                                                    onChange={handleInputChange}
                                                                    className="accent-black cursor-pointer"
                                                                />
                                                                <span style={{ color: "black" }}>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Are you already familiar with Biogance or Eskadron? */}
                                                <div>
                                                    <label className="block mb-3 text-black">
                                                        {t('ambassador.healthProfessional.familiarWithBiogance')}
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        {t('ambassador.healthProfessional.options.familiarity', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="familiarWithBiogance"
                                                                    value={option}
                                                                    checked={formData.familiarWithBiogance === option}
                                                                    onChange={handleInputChange}
                                                                    className="accent-black cursor-pointer"
                                                                />
                                                                <span style={{ color: "black" }}>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collaboration Opportunities Section */}
                                        <div className="bg-white rounded-lg border border-gray-200">
                                            <h2 className="p-6 bg-gray-50 text-md font-bold text-black">
                                                {t('ambassador.healthProfessional.collaborationOpportunities')}
                                            </h2>

                                            <div className="p-6">
                                                {/* Would you like to participate in */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        {t('ambassador.healthProfessional.wouldYouLikeToParticipate')}
                                                    </label>
                                                    <div className="space-y-2">
                                                        {t('ambassador.healthProfessional.options.participateIn', { returnObjects: true }).map((option) => (
                                                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="participateIn"
                                                                    value={option}
                                                                    checked={formData.participateIn === option}
                                                                    onChange={handleInputChange}
                                                                    className="accent-black cursor-pointer"
                                                                />
                                                                <span style={{ color: "black" }}>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* What topics could you cover in an expert article? */}
                                                <div>
                                                    <label className="block mb-3 text-black">
                                                        {t('ambassador.healthProfessional.expertArticleTopics')}
                                                    </label>
                                                    <div className="relative">
                                                        <textarea
                                                            name="expertTopics"
                                                            value={formData.expertTopics}
                                                            onChange={handleInputChange}
                                                            placeholder={t('ambassador.common.motivationQuestion')}
                                                            maxLength={250}
                                                            rows={4}
                                                            className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                                                        />
                                                        <div className="text-right text-gray-500 mt-1">
                                                            {formData.expertTopics?.length || 0}/250 characters
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
                                                    onChange={(e) => {
                                                        setAgreeToReview(e.target.checked);
                                                        if (errors.agreeToReview) {
                                                            setErrors({ ...errors, agreeToReview: '' });
                                                        }
                                                    }}
                                                    className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                                />
                                                <span className="ml-3 text-sm text-gray-800">
                                                    {t('ambassador.common.agreement')}
                                                </span>
                                            </label>
                                            {errors.agreeToReview && (
                                                <p className="text-red-500 text-xs mt-1">{t('ambassador.common.errors.agreementRequired')}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-4">
                                            <button onClick={handleSubmit}
                                                type="button"
                                                className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                                {t('ambassador.common.submit')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}



                    {/* Animal Welfare Organization or Shelter Tab - UPDATED WITH TRANSLATIONS */}
                    {selectedTab === t('ambassador.tabs.animalWelfare') && (
                        <>
                            <div className="animate-fadeIn">
                                {/* Basic Information */}
                                <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-sm font-semibold text-black">
                                            {t('ambassador.common.basicInformation')}
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* First Row - Organization Name and Contact Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.organizationName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.firstName) {
                                                            setErrors({ ...errors, firstName: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.animalWelfare.placeholders.organizationName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.organizationNameRequired')}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.contactName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.contact) {
                                                            setErrors({ ...errors, contact: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.animalWelfare.placeholders.contactName')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.contactNameRequired')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.professionalEmail')}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.email) {
                                                            setErrors({ ...errors, email: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.animalWelfare.placeholders.professionalEmail')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    {t('ambassador.common.cityRegion')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cityRegion2"
                                                    value={formData.cityRegion2}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder={t('ambassador.animalWelfare.placeholders.cityRegion')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.common.errors.cityRegionRequired')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Structure Section */}
                                <div className="max-w-5xl mx-auto space-y-6 py-8">
                                    <div className="bg-white rounded-lg border border-gray-300">
                                        <h2 className="p-6 bg-gray-50 text-black text-sm font-bold rounded-lg">
                                            {t('ambassador.animalWelfare.yourStructure')}
                                        </h2>

                                        <div className="p-6 space-y-5">
                                            {/* Legal Status */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    {t('ambassador.animalWelfare.legalStatus')}
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {t('ambassador.animalWelfare.options.legalStatus', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="legalStatus"
                                                                value={option}
                                                                checked={formData.legalStatus === option}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.legalStatus) {
                                                                        setErrors({ ...errors, legalStatus: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.legalStatus && (
                                                    <p className="mt-1 text-xs text-red-600">{t('ambassador.animalWelfare.errors.legalStatusRequired')}</p>
                                                )}
                                            </div>

                                            {/* RINA or SIREN number */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('ambassador.animalWelfare.rinaSirenNumber')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="rinaSirenNumber"
                                                    value={formData.rinaSirenNumber}
                                                    onChange={handleInputChange}
                                                    placeholder={t('ambassador.animalWelfare.placeholders.rinaSirenNumber')}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            {/* Number of animals currently in care */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    {t('ambassador.animalWelfare.animalsInCare')}
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {t('ambassador.animalWelfare.options.animalsInCare', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="animalsInCare"
                                                                value={option}
                                                                checked={formData.animalsInCare === option}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Species Concerned */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    {t('ambassador.animalWelfare.speciesConcerned')}
                                                </label>
                                                <div className="gap-3 flex flex-wrap">
                                                    {t('ambassador.animalWelfare.options.speciesConcerned', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="speciesConcerned"
                                                                value={option}
                                                                checked={formData.speciesConcerned === option}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Your Collaboration with Biogance Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 mb-8">
                                        <h2 className="p-6 bg-gray-50 text-black text-sm font-bold rounded-lg">
                                            {t('ambassador.animalWelfare.yourCollaboration')}
                                        </h2>

                                        <div className="p-6">
                                            {/* How did you hear about Biogance? */}
                                            <div className="mb-6">
                                                <label className="block mb-3 text-black">
                                                    {t('ambassador.animalWelfare.hearAboutBiogance')}
                                                </label>
                                                <div className="flex gap-6 flex-wrap">
                                                    {t('ambassador.animalWelfare.options.hearAboutBiogance', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="hearAboutBiogance"
                                                                value={option}
                                                                checked={formData.hearAboutBiogance === option}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span className='text-sm text-gray-700'>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Which products would be most useful to you? */}
                                            <div className="mb-6">
                                                <label className="block mb-3 text-black">
                                                    {t('ambassador.animalWelfare.usefulProducts')}
                                                </label>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                                                    {t('ambassador.animalWelfare.options.usefulProducts', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="usefulProducts"
                                                                value={option}
                                                                checked={formData.usefulProducts === option}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span className='text-sm text-gray-700'>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Other Product */}
                                                <div>
                                                    <label className="block mb-2 text-black">
                                                        {t('ambassador.animalWelfare.otherProducts')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="otherProducts"
                                                        value={formData.otherProducts}
                                                        onChange={handleInputChange}
                                                        placeholder={t('ambassador.animalWelfare.placeholders.otherProducts')}
                                                        className="w-full text-black px-3 py-2 rounded bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                    />
                                                </div>
                                            </div>

                                            {/* Would you like to share your initiatives */}
                                            <div>
                                                <label className="block mb-3 text-black">
                                                    {t('ambassador.animalWelfare.shareInitiatives')}
                                                </label>
                                                <div className="flex gap-6">
                                                    {t('ambassador.animalWelfare.options.shareInitiatives', { returnObjects: true }).map((option) => (
                                                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="shareInitiatives"
                                                                value={option}
                                                                checked={formData.shareInitiatives === option}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span className='text-sm text-gray-700'>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Your Message Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 mb-6">
                                        <h2 className="p-6 bg-gray-50 text-sm font-bold text-black rounded-lg">
                                            {t('ambassador.animalWelfare.yourMessage')}
                                        </h2>

                                        <div className="p-6">
                                            <label className="block mb-3 text-black">
                                                {t('ambassador.animalWelfare.shelterMessage')}
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    name="shelterMessage"
                                                    value={formData.shelterMessage}
                                                    onChange={handleInputChange}
                                                    placeholder={t('ambassador.animalWelfare.placeholders.shelterMessage')}
                                                    maxLength={250}
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition resize-none"
                                                />
                                                <div className="text-right text-gray-500 mt-1">
                                                    {formData.shelterMessage?.length || 0}/250 characters
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
                                                onChange={(e) => {
                                                    setAgreeToReview(e.target.checked);
                                                    if (errors.agreeToReview) {
                                                        setErrors({ ...errors, agreeToReview: '' });
                                                    }
                                                }}
                                                className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm text-gray-800">
                                                {t('ambassador.common.agreement')}
                                            </span>
                                        </label>
                                        {errors.agreeToReview && (
                                            <p className="text-red-500 text-xs mt-1">{t('ambassador.common.errors.agreementRequired')}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-4">
                                        <button onClick={handleSubmit}
                                            type="button"
                                            className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                            {t('ambassador.common.submit')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div >
            {/* Thank You Modal */}
            {showModal && (
                <ThankYouModal onClose={() => setShowModal(false)} />
            )}
            <Footer />
        </>
    );
}