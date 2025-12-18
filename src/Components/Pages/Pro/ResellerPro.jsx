"use client"

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useRouter } from 'next/navigation';
import ThankYouModal from './ThankyouModal';

export function ResellerForm() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        companyName: '',
        registrationNumber: '',
        contactName: '',
        jobTitle: '',
        email: '',
        countryCode: '+92',
        phone: '',
        website: '',
        message: '',
        resellerTypes: {
            petShop: false,
            gardenCenter: false,
            groomingSalon: false,
            professionalBreeder: false,
            veterinaryClinic: false,
            onlineStore: false
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Country data with proper mapping - sorted by code
    const countries = [
        { code: '+1', iso: 'us', name: 'United States' },
        { code: '+1', iso: 'ca', name: 'Canada' },
        { code: '+7', iso: 'ru', name: 'Russia' },
        { code: '+7', iso: 'kz', name: 'Kazakhstan' },
        { code: '+20', iso: 'eg', name: 'Egypt' },
        { code: '+27', iso: 'za', name: 'South Africa' },
        { code: '+30', iso: 'gr', name: 'Greece' },
        { code: '+31', iso: 'nl', name: 'Netherlands' },
        { code: '+32', iso: 'be', name: 'Belgium' },
        { code: '+33', iso: 'fr', name: 'France' },
        { code: '+34', iso: 'es', name: 'Spain' },
        { code: '+36', iso: 'hu', name: 'Hungary' },
        { code: '+39', iso: 'it', name: 'Italy' },
        { code: '+40', iso: 'ro', name: 'Romania' },
        { code: '+41', iso: 'ch', name: 'Switzerland' },
        { code: '+43', iso: 'at', name: 'Austria' },
        { code: '+44', iso: 'gb', name: 'United Kingdom' },
        { code: '+45', iso: 'dk', name: 'Denmark' },
        { code: '+46', iso: 'se', name: 'Sweden' },
        { code: '+47', iso: 'no', name: 'Norway' },
        { code: '+48', iso: 'pl', name: 'Poland' },
        { code: '+49', iso: 'de', name: 'Germany' },
        { code: '+51', iso: 'pe', name: 'Peru' },
        { code: '+52', iso: 'mx', name: 'Mexico' },
        { code: '+53', iso: 'cu', name: 'Cuba' },
        { code: '+54', iso: 'ar', name: 'Argentina' },
        { code: '+55', iso: 'br', name: 'Brazil' },
        { code: '+56', iso: 'cl', name: 'Chile' },
        { code: '+57', iso: 'co', name: 'Colombia' },
        { code: '+58', iso: 've', name: 'Venezuela' },
        { code: '+60', iso: 'my', name: 'Malaysia' },
        { code: '+61', iso: 'au', name: 'Australia' },
        { code: '+62', iso: 'id', name: 'Indonesia' },
        { code: '+63', iso: 'ph', name: 'Philippines' },
        { code: '+64', iso: 'nz', name: 'New Zealand' },
        { code: '+65', iso: 'sg', name: 'Singapore' },
        { code: '+66', iso: 'th', name: 'Thailand' },
        { code: '+81', iso: 'jp', name: 'Japan' },
        { code: '+82', iso: 'kr', name: 'South Korea' },
        { code: '+84', iso: 'vn', name: 'Vietnam' },
        { code: '+86', iso: 'cn', name: 'China' },
        { code: '+90', iso: 'tr', name: 'Turkey' },
        { code: '+91', iso: 'in', name: 'India' },
        { code: '+92', iso: 'pk', name: 'Pakistan' },
        { code: '+93', iso: 'af', name: 'Afghanistan' },
        { code: '+94', iso: 'lk', name: 'Sri Lanka' },
        { code: '+95', iso: 'mm', name: 'Myanmar' },
        { code: '+98', iso: 'ir', name: 'Iran' },
        { code: '+211', iso: 'ss', name: 'South Sudan' },
        { code: '+212', iso: 'ma', name: 'Morocco' },
        { code: '+213', iso: 'dz', name: 'Algeria' },
        { code: '+216', iso: 'tn', name: 'Tunisia' },
        { code: '+218', iso: 'ly', name: 'Libya' },
        { code: '+220', iso: 'gm', name: 'Gambia' },
        { code: '+221', iso: 'sn', name: 'Senegal' },
        { code: '+223', iso: 'ml', name: 'Mali' },
        { code: '+224', iso: 'gn', name: 'Guinea' },
        { code: '+226', iso: 'bf', name: 'Burkina Faso' },
        { code: '+227', iso: 'ne', name: 'Niger' },
        { code: '+228', iso: 'tg', name: 'Togo' },
        { code: '+229', iso: 'bj', name: 'Benin' },
        { code: '+234', iso: 'ng', name: 'Nigeria' },
        { code: '+235', iso: 'td', name: 'Chad' },
        { code: '+236', iso: 'cf', name: 'Central African Republic' },
        { code: '+237', iso: 'cm', name: 'Cameroon' },
        { code: '+238', iso: 'cv', name: 'Cape Verde' },
        { code: '+241', iso: 'ga', name: 'Gabon' },
        { code: '+244', iso: 'ao', name: 'Angola' },
        { code: '+249', iso: 'sd', name: 'Sudan' },
        { code: '+250', iso: 'rw', name: 'Rwanda' },
        { code: '+251', iso: 'et', name: 'Ethiopia' },
        { code: '+253', iso: 'dj', name: 'Djibouti' },
        { code: '+254', iso: 'ke', name: 'Kenya' },
        { code: '+255', iso: 'tz', name: 'Tanzania' },
        { code: '+256', iso: 'ug', name: 'Uganda' },
        { code: '+257', iso: 'bi', name: 'Burundi' },
        { code: '+258', iso: 'mz', name: 'Mozambique' },
        { code: '+260', iso: 'zm', name: 'Zambia' },
        { code: '+261', iso: 'mg', name: 'Madagascar' },
        { code: '+263', iso: 'zw', name: 'Zimbabwe' },
        { code: '+264', iso: 'na', name: 'Namibia' },
        { code: '+267', iso: 'bw', name: 'Botswana' },
        { code: '+351', iso: 'pt', name: 'Portugal' },
        { code: '+352', iso: 'lu', name: 'Luxembourg' },
        { code: '+353', iso: 'ie', name: 'Ireland' },
        { code: '+354', iso: 'is', name: 'Iceland' },
        { code: '+355', iso: 'al', name: 'Albania' },
        { code: '+356', iso: 'mt', name: 'Malta' },
        { code: '+357', iso: 'cy', name: 'Cyprus' },
        { code: '+358', iso: 'fi', name: 'Finland' },
        { code: '+359', iso: 'bg', name: 'Bulgaria' },
        { code: '+370', iso: 'lt', name: 'Lithuania' },
        { code: '+371', iso: 'lv', name: 'Latvia' },
        { code: '+372', iso: 'ee', name: 'Estonia' },
        { code: '+373', iso: 'md', name: 'Moldova' },
        { code: '+374', iso: 'am', name: 'Armenia' },
        { code: '+375', iso: 'by', name: 'Belarus' },
        { code: '+376', iso: 'ad', name: 'Andorra' },
        { code: '+377', iso: 'mc', name: 'Monaco' },
        { code: '+380', iso: 'ua', name: 'Ukraine' },
        { code: '+381', iso: 'rs', name: 'Serbia' },
        { code: '+382', iso: 'me', name: 'Montenegro' },
        { code: '+385', iso: 'hr', name: 'Croatia' },
        { code: '+386', iso: 'si', name: 'Slovenia' },
        { code: '+387', iso: 'ba', name: 'Bosnia and Herzegovina' },
        { code: '+420', iso: 'cz', name: 'Czech Republic' },
        { code: '+421', iso: 'sk', name: 'Slovakia' },
        { code: '+501', iso: 'bz', name: 'Belize' },
        { code: '+502', iso: 'gt', name: 'Guatemala' },
        { code: '+503', iso: 'sv', name: 'El Salvador' },
        { code: '+504', iso: 'hn', name: 'Honduras' },
        { code: '+505', iso: 'ni', name: 'Nicaragua' },
        { code: '+506', iso: 'cr', name: 'Costa Rica' },
        { code: '+507', iso: 'pa', name: 'Panama' },
        { code: '+509', iso: 'ht', name: 'Haiti' },
        { code: '+591', iso: 'bo', name: 'Bolivia' },
        { code: '+593', iso: 'ec', name: 'Ecuador' },
        { code: '+595', iso: 'py', name: 'Paraguay' },
        { code: '+598', iso: 'uy', name: 'Uruguay' },
        { code: '+673', iso: 'bn', name: 'Brunei' },
        { code: '+679', iso: 'fj', name: 'Fiji' },
        { code: '+850', iso: 'kp', name: 'North Korea' },
        { code: '+852', iso: 'hk', name: 'Hong Kong' },
        { code: '+853', iso: 'mo', name: 'Macau' },
        { code: '+855', iso: 'kh', name: 'Cambodia' },
        { code: '+856', iso: 'la', name: 'Laos' },
        { code: '+880', iso: 'bd', name: 'Bangladesh' },
        { code: '+886', iso: 'tw', name: 'Taiwan' },
        { code: '+960', iso: 'mv', name: 'Maldives' },
        { code: '+961', iso: 'lb', name: 'Lebanon' },
        { code: '+962', iso: 'jo', name: 'Jordan' },
        { code: '+963', iso: 'sy', name: 'Syria' },
        { code: '+964', iso: 'iq', name: 'Iraq' },
        { code: '+965', iso: 'kw', name: 'Kuwait' },
        { code: '+966', iso: 'sa', name: 'Saudi Arabia' },
        { code: '+967', iso: 'ye', name: 'Yemen' },
        { code: '+968', iso: 'om', name: 'Oman' },
        { code: '+970', iso: 'ps', name: 'Palestine' },
        { code: '+971', iso: 'ae', name: 'United Arab Emirates' },
        { code: '+972', iso: 'il', name: 'Israel' },
        { code: '+973', iso: 'bh', name: 'Bahrain' },
        { code: '+974', iso: 'qa', name: 'Qatar' },
        { code: '+975', iso: 'bt', name: 'Bhutan' },
        { code: '+976', iso: 'mn', name: 'Mongolia' },
        { code: '+977', iso: 'np', name: 'Nepal' },
        { code: '+992', iso: 'tj', name: 'Tajikistan' },
        { code: '+993', iso: 'tm', name: 'Turkmenistan' },
        { code: '+994', iso: 'az', name: 'Azerbaijan' },
        { code: '+995', iso: 'ge', name: 'Georgia' },
        { code: '+996', iso: 'kg', name: 'Kyrgyzstan' },
        { code: '+998', iso: 'uz', name: 'Uzbekistan' }
    ];

    // Get selected country
    const getCountryByCode = (code) => {
        return countries.find(c => c.code === code && c.iso === 'pk') ||
            countries.find(c => c.code === code) ||
            countries[0];
    };

    const selectedCountry = getCountryByCode(formData.countryCode);

    // Filter countries based on search
    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.includes(searchTerm)
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        // Validate required fields
        const newErrors = {};

        if (!formData.companyName || formData.companyName.trim() === '') {
            newErrors.companyName = 'Company name is required';
        }

        if (!formData.registrationNumber || formData.registrationNumber.trim() === '') {
            newErrors.registrationNumber = 'Registration number is required';
        }

        if (!formData.contactName || formData.contactName.trim() === '') {
            newErrors.contactName = 'Contact name is required';
        }

        if (!formData.jobTitle || formData.jobTitle.trim() === '') {
            newErrors.jobTitle = 'Job title is required';
        }

        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'Email is required';
        } else {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        // Check if there are any errors
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Sab kuch sahi hai, modal show karo
        console.log('Form submitted:', formData);
        setShowModal(true);
        setFormData({
            companyName: '',
            registrationNumber: '',
            contactName: '',
            jobTitle: '',
            email: '',
            countryCode: '+92',
            phone: '',
            website: '',
            message: '',
            resellerTypes: {
                petShop: false,
                gardenCenter: false,
                groomingSalon: false,
                professionalBreeder: false,
                veterinaryClinic: false,
                onlineStore: false
            }
        });
    };

    const handleCancel = () => {
        setFormData({
            companyName: '',
            registrationNumber: '',
            contactName: '',
            jobTitle: '',
            email: '',
            countryCode: '+92',
            phone: '',
            website: '',
            message: '',
            resellerTypes: {
                petShop: false,
                gardenCenter: false,
                groomingSalon: false,
                professionalBreeder: false,
                veterinaryClinic: false,
                onlineStore: false
            }
        });
        router.back();
    };


    const handleCheckboxChange = (type) => {
        setFormData({
            ...formData,
            resellerTypes: {
                ...formData.resellerTypes,
                [type]: !formData.resellerTypes[type]
            }
        });
    };

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Form Header */}
                <div className="mb-8">
                    <h2 className="mb-3" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.3', color: "black" }}>
                        Become a Biogance Reseller
                    </h2>
                    <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.6' }}>
                        Offer your customers premium, eco-friendly pet care made in France. Join Biogance's professional network and bring natural, effective grooming and wellness products to pet owners in your community.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Row 1: Company Name & Registration Number */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                Company Name*
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. The Pet Nook"
                                value={formData.companyName}
                                onChange={(e) => {
                                    setFormData({ ...formData, companyName: e.target.value });
                                    if (errors.companyName) {
                                        setErrors({ ...errors, companyName: '' });
                                    }
                                }}
                                className={`w-full px-4 py-3  text-black bg-gray-50 border-0 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                    }`}
                                style={{ fontSize: '14px' }}
                            />
                            {errors.companyName && (
                                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                Company Registration Number (SIRET or VAT)*
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CA9876543210"
                                value={formData.registrationNumber}
                                onChange={(e) => {
                                    setFormData({ ...formData, registrationNumber: e.target.value });
                                    if (errors.registrationNumber) {
                                        setErrors({ ...errors, registrationNumber: '' });
                                    }
                                }}
                                className={`w-full px-4 py-3  text-black bg-gray-50 border-0 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition
                                    }`}
                                style={{ fontSize: '14px' }}
                            />
                            {errors.registrationNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Contact Name & Job Title */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                Contact Name*
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Megan Carter"
                                value={formData.contactName}
                                onChange={(e) => {
                                    setFormData({ ...formData, contactName: e.target.value });
                                    if (errors.contactName) {
                                        setErrors({ ...errors, contactName: '' });
                                    }
                                }}
                                className={`w-full px-4 py-3  text-black bg-gray-50 border-0 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                    }`}
                                style={{ fontSize: '14px' }}
                            />
                            {errors.contactName && (
                                <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                Job Title*
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Owner"
                                value={formData.jobTitle}
                                onChange={(e) => {
                                    setFormData({ ...formData, jobTitle: e.target.value });
                                    if (errors.jobTitle) {
                                        setErrors({ ...errors, jobTitle: '' });
                                    }
                                }}
                                className={`w-full px-4 py-3  text-black bg-gray-50 border-0 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                    }`}
                                style={{ fontSize: '14px' }}
                            />
                            {errors.jobTitle && (
                                <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Email & Phone */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                Email*
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. megan@thetpetnook.com"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) {
                                        setErrors({ ...errors, email: '' });
                                    }
                                }}
                                className={`w-full px-4 py-3  text-black bg-gray-50 border-0 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300  transition'
                                    }`}
                                style={{ fontSize: '14px' }}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                Phone
                            </label>
                            <div className="flex gap-2">
                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        className="flex items-center gap-2 px-3 py-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        <img
                                            src={`https://flagcdn.com/w20/${selectedCountry.iso}.png`}
                                            alt="flag"
                                            className="w-5 h-4"
                                        />
                                        <span className="text-sm font-medium text-black" style={{ fontSize: '14px' }}>{formData.countryCode}</span>
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {isOpen && (
                                        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                                            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                                <input
                                                    type="text"
                                                    placeholder="Search country..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full px-3 placeholder:text-gray-500 text-black py-2 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="overflow-y-auto max-h-60">
                                                {filteredCountries.map((country, index) => (
                                                    <div
                                                        key={`${country.iso}-${index}`}
                                                        className="flex items-center gap-3 text-black px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            setFormData({ ...formData, countryCode: country.code });
                                                            setIsOpen(false);
                                                            setSearchTerm('');
                                                        }}
                                                    >
                                                        <img
                                                            src={`https://flagcdn.com/w20/${country.iso}.png`}
                                                            alt={country.name}
                                                            className="w-5 h-4"
                                                        />
                                                        <span className="text-sm flex-1 text-black">{country.name}</span>
                                                        <span className="text-sm text-gray-500 font-medium">{country.code}</span>
                                                    </div>
                                                ))}
                                                {filteredCountries.length === 0 && (
                                                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                                                        No countries found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="tel"
                                    placeholder="e.g. 555-777-8888"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="flex-1 px-4 py-3 placeholder:text-gray-500 text-black bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    style={{ fontSize: '14px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Website */}
                    <div className="mb-6">
                        <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                            Website
                        </label>
                        <input
                            type="url"
                            placeholder="e.g. www.whitepetcompanies.com"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-4 py-3 placeholder:text-gray-500 text-black bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                            style={{ fontSize: '14px' }}
                        />
                    </div>

                    {/* Row 5: Message / Comments */}
                    <div className="mb-6">
                        <label className="block mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                            Message / Comments
                        </label>
                        <textarea
                            placeholder="e.g. Looking forward to offering Biogance in our boutique."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 placeholder:text-gray-500 text-black bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                            style={{ fontSize: '14px' }}
                        />
                    </div>


                    {/* Reseller Type Checkboxes */}
                    <div className="mb-8">
                        <label className="block mb-3 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                            Become a Biogance Reseller
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.resellerTypes.petShop}
                                    onChange={() => handleCheckboxChange('petShop')}
                                    className="w-5 h-5 rounded border-gray-300 accent-black cursor-pointer"
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: "black" }}>Pet Shop / Specialty Store</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.resellerTypes.gardenCenter}
                                    onChange={() => handleCheckboxChange('gardenCenter')}
                                    className="w-5 h-5 rounded border-gray-300 accent-black cursor-pointer "
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: "black" }}>Garden Center</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.resellerTypes.groomingSalon}
                                    onChange={() => handleCheckboxChange('groomingSalon')}
                                    className="w-5 h-5 rounded border-gray-300 accent-black cursor-pointer  "
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: "black" }}>Grooming Salon</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.resellerTypes.professionalBreeder}
                                    onChange={() => handleCheckboxChange('professionalBreeder')}
                                    className="w-5 h-5 rounded border-gray-300 accent-black cursor-pointer "
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: "black" }}>Professional Breeder</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.resellerTypes.veterinaryClinic}
                                    onChange={() => handleCheckboxChange('veterinaryClinic')}
                                    className="w-5 h-5 rounded border-gray-300 accent-black cursor-pointer "
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: "black" }}>Veterinary Clinic</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.resellerTypes.onlineStore}
                                    onChange={() => handleCheckboxChange('onlineStore')}
                                    className="w-5 h-5 rounded border-gray-300 accent-black cursor-pointer  "
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: "black" }}>Online Store</span>
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            style={{ fontSize: '14px', fontWeight: 600 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"

                            className="flex-1 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                            style={{ fontSize: '14px', fontWeight: 600 }}>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            {/* Thank You Modal */}
            {showModal && (
                <ThankYouModal onClose={() => setShowModal(false)} />
            )}
            <Footer />
        </>
    );
}