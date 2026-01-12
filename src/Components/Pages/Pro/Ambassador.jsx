"use client"

import { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useRouter } from 'next/navigation';
import ThankYouModal from './ThankyouModal';

export default function BioganceAmbassadorForm() {
    const [selectedTab, setSelectedTab] = useState('Content Creator');
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
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
                                                    placeholder="e.g. The Pet Nook"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition  '
                                                        }`}
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
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
                                                    placeholder="e.g. CA987654321"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Email*
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
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact*
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
                                                    placeholder="e.g. CA124653"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                                                )}
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
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.cityRegion2}</p>
                                                )}
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
                                                        onChange={(e) => {
                                                            handleInputChange(e);
                                                            if (errors.socialMediaLink) {
                                                                setErrors({ ...errors, socialMediaLink: '' });
                                                            }
                                                        }}
                                                        placeholder="e.g. https://instagram.com/yourpage"
                                                        className={`w-[50%] px-4 py-3 bg-gray-50 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                            }`}
                                                    />
                                                    {errors.socialMediaLink && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.socialMediaLink}</p>
                                                    )}
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
                                                        <p className="mt-1 text-xs text-red-600">{errors.mainTheme}</p>
                                                    )}
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
                                                            <p className="mt-1 text-xs text-red-600">{errors.hasMultipleAnimals}</p>
                                                        )}
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
                                                            {errors.animalSpecies && (
                                                                <div className="mt-2 p rounded-md">
                                                                    <p className="text-xs text-red-600">{errors.animalSpecies}</p>
                                                                </div>
                                                            )}
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
                                            {errors.agreeToReview && (
                                                <p className="text-red-500 text-xs mt-1">{errors.agreeToReview}</p>
                                            )}
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            {/* <button onClick={handleCancel}
                                                className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button> */}
                                            <button onClick={handleSubmit} type="button" className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
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
                                                    placeholder="e.g. The Pet Nook"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400  focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}

                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
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
                                                    placeholder="e.g. CA987654321"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Email*
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
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact*
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
                                                    placeholder="e.g. CA124653"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                                                )}
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
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.cityRegion2}</p>
                                                )}
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
                                                <h2 className="text-sm font-semibold text-black rounded-lg">Your Activity</h2>
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
                                                    {errors.speciesBreed && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.speciesBreed}</p>
                                                    )}
                                                </div>

                                                {/* Breed Name and Main Breed(s) */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                    {errors.breedingDuration && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.breedingDuration}</p>
                                                    )}
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
                                                    {errors.familiarWithProducts && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.familiarWithProducts}</p>
                                                    )}
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
                                            {errors.agreeToReview && (
                                                <p className="text-red-500 text-xs mt-1">{errors.agreeToReview}</p>
                                            )}
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            <button onClick={handleCancel} className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button>
                                            <button onClick={handleSubmit} type="button" className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
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
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Email*
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
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact*
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
                                                    placeholder="e.g. CA124653"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                                                )}
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
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        if (errors.cityRegion2) {
                                                            setErrors({ ...errors, cityRegion2: '' });
                                                        }
                                                    }}
                                                    placeholder="e.g. megan@whiskersnwags.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.cityRegion2}</p>
                                                )}
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
                                                <h2 className="text-sm font-semibold text-black rounded-lg">Your Activity</h2>
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
                                                    {errors.speciesBreed && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.speciesBreed}</p>
                                                    )}
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
                                                    {errors.agreeToReview && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.agreeToReview}</p>
                                                    )}
                                                </div>

                                                {/* Cancel and Submit Buttons */}
                                                <div className="flex gap-4">
                                                    <button onClick={handleCancel}
                                                        className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                        Cancel
                                                    </button>
                                                    <button type="button" onClick={handleSubmit}
                                                        className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
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
                                        {/* First Row - Organization Name and Contact Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Name of Organization/Shelter*
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
                                                    placeholder="e.g. Happy Paws Shelter"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact name*
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
                                                    placeholder="e.g. John Smith"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Professional email address*
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
                                                    placeholder="e.g. contact@shelter.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
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
                                                    placeholder="e.g. Los Angeles"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.cityRegion2}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-5xl mx-auto space-y-6 py-8">
                                    {/* Your Structure Section */}
                                    <div className="bg-white rounded-lg border border-gray-300">
                                        <h2 className="text-md font-semibold border-b border-gray-200 bg-gray-50 text-gray-900 p-4 rounded-lg">Your Structure</h2>

                                        {/* Type of organization */}
                                        <div className="p-6 space-y-5">
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Type of organization*
                                                </label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="organizationType"
                                                            value="Leisure club / association"
                                                            checked={formData.organizationType === 'Leisure club / association'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.organizationType) {
                                                                    setErrors({ ...errors, organizationType: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Leisure club / association</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="organizationType"
                                                            value="Competition / show club / association"
                                                            checked={formData.organizationType === 'Competition / show club / association'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.organizationType) {
                                                                    setErrors({ ...errors, organizationType: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Competition / show club / association</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="organizationType"
                                                            value="Others"
                                                            checked={formData.organizationType === 'Others'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.organizationType) {
                                                                    setErrors({ ...errors, organizationType: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Others</span>
                                                    </label>
                                                </div>
                                                {errors.organizationType && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.organizationType}</p>
                                                )}
                                            </div>

                                            {/* Organization name */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Organization
                                                </label>
                                                <input
                                                    type="text"
                                                    name="organizationName"
                                                    value={formData.organizationName}
                                                    onChange={handleInputChange}
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
                                                        <input
                                                            type="radio"
                                                            name="memberCount"
                                                            value="Less than 50"
                                                            checked={formData.memberCount === 'Less than 50'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.memberCount) {
                                                                    setErrors({ ...errors, memberCount: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Less than 50</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="memberCount"
                                                            value="50 - 200"
                                                            checked={formData.memberCount === '50 - 200'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.memberCount) {
                                                                    setErrors({ ...errors, memberCount: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">50 - 200</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="memberCount"
                                                            value="More than 200"
                                                            checked={formData.memberCount === 'More than 200'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.memberCount) {
                                                                    setErrors({ ...errors, memberCount: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">More than 200</span>
                                                    </label>
                                                </div>
                                                {errors.memberCount && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.memberCount}</p>
                                                )}
                                            </div>

                                            {/* Do you organize events */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Do you organize events (competitions, shows, awareness days)?*
                                                </label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="organizeEvents"
                                                            value="Yes"
                                                            checked={formData.organizeEvents === 'Yes'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.organizeEvents) {
                                                                    setErrors({ ...errors, organizeEvents: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="organizeEvents"
                                                            value="No"
                                                            checked={formData.organizeEvents === 'No'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.organizeEvents) {
                                                                    setErrors({ ...errors, organizeEvents: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">No</span>
                                                    </label>
                                                </div>
                                                {errors.organizeEvents && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.organizeEvents}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breeds Represented Section */}
                                    <div className="bg-white rounded-lg border border-gray-300">
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
                                                            <input
                                                                type="radio"
                                                                name="breedSpecies"
                                                                value="Dog"
                                                                checked={formData.breedSpecies === 'Dog'}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Dog</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="breedSpecies"
                                                                value="Cat"
                                                                checked={formData.breedSpecies === 'Cat'}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Cat</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="breedSpecies"
                                                                value="Horse"
                                                                checked={formData.breedSpecies === 'Horse'}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Horse</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="breedSpecies"
                                                                value="Others"
                                                                checked={formData.breedSpecies === 'Others'}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
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
                                                        name="mainBreeds"
                                                        value={formData.mainBreeds}
                                                        onChange={handleInputChange}
                                                        placeholder="eg: Border Collie, Maine Coon, Selle Français"
                                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                    />
                                                </div>
                                            </div>

                                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition">
                                                <span className="text-lg">+</span>
                                                Add Another Breed Group
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-w-5xl mx-auto">
                                        <div className="bg-white rounded-lg border border-gray-300">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6 p-4 bg-gray-50">Collaboration with Biogance</h2>

                                            {/* Why would you like to collaborate */}
                                            <div className="p-6">
                                                <div className="mb-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Why would you like to collaborate with Biogance?*
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
                                                            placeholder="In a few words, why would you like to become a Biogance ambassador?"
                                                            rows="4"
                                                            maxLength={250}
                                                            className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 '
                                        }`}
                                                        />
                                                        <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                                                            {formData.collaborationReason?.length || 0}/250 characters
                                                        </div>
                                                    </div>
                                                    {errors.collaborationReason && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.collaborationReason}</p>
                                                    )}
                                                </div>

                                                {/* What types of actions */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        What types of actions would you be willing to implement to promote Biogance?*
                                                    </label>
                                                    <div className="space-y-2 mb-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="promotionActions"
                                                                value="Offer a promo code to your members"
                                                                checked={formData.promotionActions === 'Offer a promo code to your members'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.promotionActions) {
                                                                        setErrors({ ...errors, promotionActions: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Offer a promo code to your members</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="promotionActions"
                                                                value="Distribute Biogance prizes during your contests / events"
                                                                checked={formData.promotionActions === 'Distribute Biogance prizes during your contests / events'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.promotionActions) {
                                                                        setErrors({ ...errors, promotionActions: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Distribute Biogance prizes during your contests / events</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="promotionActions"
                                                                value="Publish articles / posts on your social media / website"
                                                                checked={formData.promotionActions === 'Publish articles / posts on your social media / website'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.promotionActions) {
                                                                        setErrors({ ...errors, promotionActions: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Publish articles / posts on your social media / website</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="promotionActions"
                                                                value="Others"
                                                                checked={formData.promotionActions === 'Others'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.promotionActions) {
                                                                        setErrors({ ...errors, promotionActions: '' });
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-black cursor-pointer"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Others</span>
                                                        </label>
                                                    </div>
                                                    {errors.promotionActions && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.promotionActions}</p>
                                                    )}

                                                    {/* Other type of actions */}
                                                    <div>
                                                        <label className="block text-sm text-gray-700 mb-2">
                                                            Other type of actions
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="otherPromotionActions"
                                                            value={formData.otherPromotionActions}
                                                            onChange={handleInputChange}
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
                                                onChange={(e) => {
                                                    setAgreeToReview(e.target.checked);
                                                    if (errors.agreeToReview) {
                                                        setErrors({ ...errors, agreeToReview: '' });
                                                    }
                                                }}
                                                className="w-4 h-4 mt-0.5 text-black border-2 border-gray-300 rounded accent-black cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm text-gray-800">
                                                I agree that my information may be used to review my application.
                                            </span>
                                        </label>
                                        {errors.agreeToReview && (
                                            <p className="text-red-500 text-xs mt-1">{errors.agreeToReview}</p>
                                        )}
                                    </div>

                                    {/* Cancel and Submit Buttons */}
                                    <div className="flex gap-4">
                                        <button onClick={handleCancel}
                                            className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                            Cancel
                                        </button>
                                        <button type="button"
                                            onClick={handleSubmit}
                                            className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    First Name*
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
                                                    placeholder="e.g. John"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Last Name*
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
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Professional/Speciality */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                                Professional/Speciality*
                                            </label>
                                            <div className="flex flex-wrap gap-4">
                                                {['Veterinarian', 'Osteopath', 'Nutritionist', 'Behaviorist', 'Others'].map((option) => (
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
                                                <p className="mt-1 text-xs text-red-600">{errors.profession}</p>
                                            )}
                                        </div>

                                        {/* Other Profession/Speciality */}
                                        <div>
                                            <label className="block text-sm font-lg text-black mb-2">
                                                Other Profession/Speciality
                                            </label>
                                            <input
                                                type="text"
                                                name="otherProfession"
                                                value={formData.otherProfession}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Type here"
                                                className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            />
                                        </div>

                                        {/* Second Row - Clinic Name and Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Name of Clinic/Practice/Organization
                                                </label>
                                                <input
                                                    type="text"
                                                    name="clinicName"
                                                    value={formData.clinicName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Pet Health Clinic"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Professional email address*
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
                                                    placeholder="e.g. john@clinic.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
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
                                                    Contact*
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
                                                    placeholder="e.g. +1234567890"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
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
                                                    placeholder="e.g. New York"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.cityRegion2}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-6">
                                    <div className="max-w-5xl mx-auto space-y-6">
                                        {/* Your Activity Section */}
                                        <div className="bg-white rounded-lg border border-gray-300">
                                            <h2 className="p-6 bg-gray-50 text-md font-bold text-black rounded-lg">Your Activity</h2>

                                            <div className="p-6">
                                                {/* How long have you been practicing */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        How long have you been practicing?*
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="yearsExperience"
                                                                value="Less than 5 years"
                                                                checked={formData.yearsExperience === 'Less than 5 years'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.yearsExperience) {
                                                                        setErrors({ ...errors, yearsExperience: '' });
                                                                    }
                                                                }}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Less than 5 years</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="yearsExperience"
                                                                value="5 to 10 years"
                                                                checked={formData.yearsExperience === '5 to 10 years'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.yearsExperience) {
                                                                        setErrors({ ...errors, yearsExperience: '' });
                                                                    }
                                                                }}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>5 to 10 years</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="yearsExperience"
                                                                value="More than 10 years"
                                                                checked={formData.yearsExperience === 'More than 10 years'}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.yearsExperience) {
                                                                        setErrors({ ...errors, yearsExperience: '' });
                                                                    }
                                                                }}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>More than 10 years</span>
                                                        </label>
                                                    </div>
                                                    {errors.yearsExperience && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.yearsExperience}</p>
                                                    )}
                                                </div>

                                                {/* You mainly work with */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        You mainly work with
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="mainWorkWith"
                                                                value="Dogs"
                                                                checked={formData.mainWorkWith === 'Dogs'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Dogs</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="mainWorkWith"
                                                                value="Cats"
                                                                checked={formData.mainWorkWith === 'Cats'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Cats</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="mainWorkWith"
                                                                value="Horses"
                                                                checked={formData.mainWorkWith === 'Horses'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Horses</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="mainWorkWith"
                                                                value="Other Animals"
                                                                checked={formData.mainWorkWith === 'Other Animals'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Other Animals</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Are you already familiar with Biogance or Eskadron? */}
                                                <div>
                                                    <label className="block mb-3 text-black">
                                                        Are you already familiar with Biogance or Eskadron?
                                                    </label>
                                                    <div className="flex gap-6 flex-wrap">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="familiarWithBiogance"
                                                                value="Yes, I use your products"
                                                                checked={formData.familiarWithBiogance === 'Yes, I use your products'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Yes, I use your products</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="familiarWithBiogance"
                                                                value="Yes, I know the brand"
                                                                checked={formData.familiarWithBiogance === 'Yes, I know the brand'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Yes, I know the brand</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="familiarWithBiogance"
                                                                value="No, I'm discovering it"
                                                                checked={formData.familiarWithBiogance === "No, I'm discovering it"}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>No, I&apos;m discovering it</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collaboration Opportunities Section */}
                                        <div className="bg-white rounded-lg border border-gray-200">
                                            <h2 className="p-6 bg-gray-50 text-md font-bold text-black">Collaboration Opportunities</h2>

                                            <div className="p-6">
                                                {/* Would you like to participate in */}
                                                <div className="mb-6">
                                                    <label className="block mb-3 text-black">
                                                        Would you like to participate in
                                                    </label>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="Writing articles / expert advice"
                                                                checked={formData.participateIn === 'Writing articles / expert advice'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Writing articles / expert advice</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="Product testing / technical feedback"
                                                                checked={formData.participateIn === 'Product testing / technical feedback'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Product testing / technical feedback</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="Conferences or interviews"
                                                                checked={formData.participateIn === 'Conferences or interviews'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Conferences or interviews</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="participateIn"
                                                                value="Field collaborations (clinics, fairs, etc.)"
                                                                checked={formData.participateIn === 'Field collaborations (clinics, fairs, etc.)'}
                                                                onChange={handleInputChange}
                                                                className="accent-black cursor-pointer"
                                                            />
                                                            <span style={{ color: "black" }}>Field collaborations (clinics, fairs, etc.)</span>
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
                                                            name="expertTopics"
                                                            value={formData.expertTopics}
                                                            onChange={handleInputChange}
                                                            placeholder="In a few words, why would you like to become a Biogance ambassador?"
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
                                                    I agree that my information may be used to review my application.
                                                </span>
                                            </label>
                                            {errors.agreeToReview && (
                                                <p className="text-red-500 text-xs mt-1">{errors.agreeToReview}</p>
                                            )}
                                        </div>

                                        {/* Cancel and Submit Buttons */}
                                        <div className="flex gap-4">
                                            <button onClick={handleCancel}
                                                className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                                Cancel
                                            </button>
                                            <button onClick={handleSubmit}
                                                type="button"
                                                className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
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
                                        {/* First Row - Organization Name and Contact Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Name of Organization/Shelter*
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
                                                    placeholder="e.g. Happy Paws Shelter"
                                                    className={`w-full px-3 py-2.5 bg-gray-50  rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Contact name*
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
                                                    placeholder="e.g. John Smith"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row - Email and City/Region */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    Professional email address*
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
                                                    placeholder="e.g. contact@shelter.com"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-lg text-black mb-2">
                                                    City / Region*
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
                                                    placeholder="e.g. Los Angeles"
                                                    className={`w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                                        }`}
                                                />
                                                {errors.cityRegion2 && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.cityRegion2}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-5xl mx-auto space-y-6 py-8">
                                    {/* Your Structure Section */}
                                    <div className="bg-white rounded-lg border border-gray-300">
                                        <h2 className="p-6 bg-gray-50 text-black text-sm font-bold rounded-lg">Your Structure</h2>

                                        <div className="p-6 space-y-5">
                                            {/* Legal Status */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Legal Status*
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="legalStatus"
                                                            value="Non profit association"
                                                            checked={formData.legalStatus === 'Non profit association'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.legalStatus) {
                                                                    setErrors({ ...errors, legalStatus: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Non profit association</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="legalStatus"
                                                            value="Foundation"
                                                            checked={formData.legalStatus === 'Foundation'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.legalStatus) {
                                                                    setErrors({ ...errors, legalStatus: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Foundation</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="legalStatus"
                                                            value="Others"
                                                            checked={formData.legalStatus === 'Others'}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.legalStatus) {
                                                                    setErrors({ ...errors, legalStatus: '' });
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Others</span>
                                                    </label>
                                                </div>
                                                {errors.legalStatus && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.legalStatus}</p>
                                                )}
                                            </div>

                                            {/* RINA or SIREN number */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    RINA or SIREN number (if applicable)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="rinaSirenNumber"
                                                    value={formData.rinaSirenNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="eg: Type here"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>

                                            {/* Number of animals currently in care */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Number of animals currently in care
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="animalsInCare"
                                                            value="Less than 20"
                                                            checked={formData.animalsInCare === 'Less than 20'}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Less than 20</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="animalsInCare"
                                                            value="20 - 50"
                                                            checked={formData.animalsInCare === '20 - 50'}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">20 - 50</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="animalsInCare"
                                                            value="More than 50"
                                                            checked={formData.animalsInCare === 'More than 50'}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">More than 50</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Species Concerned */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Species Concerned
                                                </label>
                                                <div className="gap-3 flex flex-wrap">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="speciesConcerned"
                                                            value="Dogs"
                                                            checked={formData.speciesConcerned === 'Dogs'}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Dogs</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="speciesConcerned"
                                                            value="Cats"
                                                            checked={formData.speciesConcerned === 'Cats'}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Cats</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="speciesConcerned"
                                                            value="Small pets/Others"
                                                            checked={formData.speciesConcerned === 'Small pets/Others'}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 accent-black cursor-pointer"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Small pets/Others</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Your Collaboration with Biogance Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 mb-8">
                                        <h2 className="p-6 bg-gray-50 text-black text-sm font-bold rounded-lg">Your Collaboration with Biogance</h2>

                                        <div className="p-6">
                                            {/* How did you hear about Biogance? */}
                                            <div className="mb-6">
                                                <label className="block mb-3 text-black">
                                                    How did you hear about Biogance?
                                                </label>
                                                <div className="flex gap-6 flex-wrap">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="hearAboutBiogance"
                                                            value="Social media"
                                                            checked={formData.hearAboutBiogance === 'Social media'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Social media</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="hearAboutBiogance"
                                                            value="Recommendation"
                                                            checked={formData.hearAboutBiogance === 'Recommendation'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Recommendation</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="hearAboutBiogance"
                                                            value="Trade show / event"
                                                            checked={formData.hearAboutBiogance === 'Trade show / event'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Trade show / event</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="hearAboutBiogance"
                                                            value="Others"
                                                            checked={formData.hearAboutBiogance === 'Others'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Others</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Which products would be most useful to you? */}
                                            <div className="mb-6">
                                                <label className="block mb-3 text-black">
                                                    Which products would be most useful to you?
                                                </label>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="usefulProducts"
                                                            value="Shampoos and hygiene care"
                                                            checked={formData.usefulProducts === 'Shampoos and hygiene care'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Shampoos and hygiene care</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="usefulProducts"
                                                            value="Anti-parasitic products"
                                                            checked={formData.usefulProducts === 'Anti-parasitic products'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Anti-parasitic products</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="usefulProducts"
                                                            value="Cleaning / disinfection products"
                                                            checked={formData.usefulProducts === 'Cleaning / disinfection products'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Cleaning / disinfection products</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="usefulProducts"
                                                            value="Others"
                                                            checked={formData.usefulProducts === 'Others'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Others</span>
                                                    </label>
                                                </div>

                                                {/* Other Product */}
                                                <div>
                                                    <label className="block mb-2 text-black">
                                                        Other Product
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="otherProducts"
                                                        value={formData.otherProducts}
                                                        onChange={handleInputChange}
                                                        placeholder="eg: type here"
                                                        className="w-full text-black px-3 py-2 rounded bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
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
                                                            value="Yes"
                                                            checked={formData.shareInitiatives === 'Yes'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>Yes</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="shareInitiatives"
                                                            value="No"
                                                            checked={formData.shareInitiatives === 'No'}
                                                            onChange={handleInputChange}
                                                            className="accent-black cursor-pointer"
                                                        />
                                                        <span className='text-sm text-gray-700'>No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Your Message Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 mb-6">
                                        <h2 className="p-6 bg-gray-50 text-sm font-bold text-black rounded-lg">Your Message</h2>

                                        <div className="p-6">
                                            <label className="block mb-3 text-black">
                                                In a few words, tell us about your organization and mission
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    name="shelterMessage"
                                                    value={formData.shelterMessage}
                                                    onChange={handleInputChange}
                                                    placeholder="In a few words, tell us about your organization..."
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
                                                I agree that my information may be used to review my application.
                                            </span>
                                        </label>
                                        {errors.agreeToReview && (
                                            <p className="text-red-500 text-xs mt-1">{errors.agreeToReview}</p>
                                        )}
                                    </div>

                                    {/* Cancel and Submit Buttons */}
                                    <div className="flex gap-4">
                                        <button onClick={handleCancel}
                                            className="flex-1 bg-white text-black py-4 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                            Cancel
                                        </button>
                                        <button onClick={handleSubmit}
                                            type="button"
                                            className="flex-1 bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                                            Submit
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