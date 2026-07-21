"use client"

import { useState, useEffect, useRef } from "react"
import { FiUser, FiX } from "react-icons/fi"
import { MdOutlineKeyboardArrowDown } from "react-icons/md"
import { FlagImage, defaultCountries, parseCountry } from 'react-international-phone';
import { RiUserLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import { getPhoneValidationErrorCode } from '../../../utils/phoneValidation';
import toast from 'react-hot-toast';

// Maps getPhoneValidationErrorCode's return value to a myaccount.json
// userProfile.* key.
const PHONE_ERROR_KEYS = {
    required: 'errorPhoneRequired',
    tooShort: 'errorPhoneTooShort',
    tooLong: 'errorPhoneTooLong',
    invalid: 'errorPhoneInvalid',
};

const getDialCodeByIso2 = (iso2) => {
    const country = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
    return country ? `+${parseCountry(country).dialCode}` : '';
};

const getIso2ByDialCode = (dialCode) => {
    if (!dialCode) return 'fr';
    const clean = String(dialCode).replace('+', '').trim();
    const country = defaultCountries.find((c) => parseCountry(c).dialCode === clean);
    return country ? parseCountry(country).iso2 : 'fr';
};

// Flag + dial code box, with a separate number field and a searchable country dropdown
function PhoneFieldBox({ iso2, onCountryChange, value, onChange, onBlur, error, searchPlaceholder, noResultsLabel }) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [search, setSearch] = useState('');
    const wrapRef = useRef(null);
    const dialCode = getDialCodeByIso2(iso2 || 'fr');

    const filteredCountries = defaultCountries
        .map((c) => parseCountry(c))
        .filter((p) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return p.name.toLowerCase().includes(q) || p.dialCode.includes(q);
        });

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div>
        <div
            ref={wrapRef}
            className={`relative flex items-stretch bg-gray-50 border transition-colors ${
                error ? 'border-red-500 ring-2 ring-red-200' : focused ? 'border-gray-400 ring-2 ring-gray-400' : 'border-gray-200'
            }`}
        >
            {/* Flag + dial code */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 h-[42px] border-r border-gray-200 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none"
            >
                <FlagImage iso2={iso2 || 'fr'} size="20px" />
                <span className="text-sm text-gray-700">{dialCode}</span>
                <MdOutlineKeyboardArrowDown
                    className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    size={16}
                />
            </button>

            {/* Number */}
            <div className="relative flex-1">
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        onBlur?.();
                    }}
                    className="w-full h-[42px] px-4 bg-transparent focus:outline-none text-gray-900 text-sm"
                />
            </div>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-lg z-20">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        {filteredCountries.length === 0 ? (
                            <p className="px-3 py-4 text-sm text-gray-400 text-center">{noResultsLabel}</p>
                        ) : (
                            filteredCountries.map((p) => (
                                <button
                                    key={p.iso2}
                                    type="button"
                                    onClick={() => { onCountryChange(p.iso2); setOpen(false); setSearch(''); }}
                                    className={`group w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-900 hover:bg-black hover:text-white transition-colors cursor-pointer ${p.iso2 === iso2 ? 'bg-gray-100' : ''}`}
                                >
                                    <FlagImage iso2={p.iso2} size="18px" />
                                    <span className="flex-1 truncate">{p.name}</span>
                                    <span className="text-gray-400 group-hover:text-gray-300">+{p.dialCode}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
        {error && (
            <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
        </div>
    );
}

export default function UserProfile() {
    const { t } = useTranslation('myaccount');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        country_code: '',
        phone_number: ''
    });
    const [countryIso2, setCountryIso2] = useState('fr');
    const [phoneError, setPhoneError] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const splashData = localStorage.getItem('splashData');
        if (splashData) {
            const user = JSON.parse(splashData)?.user;
            if (user) {
                setFormData({
                    fullName: user.name || '',
                    email: user.email || '',
                    country_code: user.country_code || '',
                    // NOTE: `phone` is the local number without the dial code
                    // (e.g. "743453453"). `phone_number` is the FULL number
                    // with dial code already prefixed (e.g. "+33743453453")
                    // — that one must NOT go into the number input, since the
                    // dial code is already shown separately by the flag box.
                    phone_number: user.phone || ''
                });
                setCountryIso2(getIso2ByDialCode(user.country_code));
                if (user.profile_picture) {
                    setImageLoading(true);
                    setProfileImage(`${MEDIA_URL}${user.profile_picture}`);
                }
            }
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setImageLoading(true);
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        document.getElementById('profile-upload').click();
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setProfileImageFile(null);
        setImageLoading(false);
        setShowPreview(false);
        document.getElementById('profile-upload').value = '';
    };

    const handleCancel = () => {
        const splashData = localStorage.getItem('splashData');
        if (splashData) {
            const user = JSON.parse(splashData)?.user;
            if (user) {
                setFormData({
                    fullName: user.name || '',
                    email: user.email || '',
                    country_code: user.country_code || '',
                    // Same fix as above — use the local `phone`, not the
                    // dial-code-prefixed `phone_number`.
                    phone_number: user.phone || ''
                });
                setCountryIso2(getIso2ByDialCode(user.country_code));
                if (user.profile_picture) {
                    setImageLoading(true);
                    setProfileImage(`${MEDIA_URL}${user.profile_picture}`);
                } else {
                    setProfileImage(null);
                }
            }
        }
        setProfileImageFile(null);
        setShowPreview(false);
    };

    // Validates the phone number's digit count and leading-digit pattern
    // against whichever country is currently selected (e.g. a French number
    // needs 9 digits after +33 starting 6/7; a Pakistani number needs 10
    // digits after +92 starting 3) — returns true when valid.
    const validatePhone = () => {
        const code = getPhoneValidationErrorCode(formData.phone_number, countryIso2 || 'fr');
        setPhoneError(code ? t(`userProfile.${PHONE_ERROR_KEYS[code]}`) : null);
        return !code;
    };

    const handleSubmit = async () => {
        if (!validatePhone()) return;

        const splashData = localStorage.getItem('splashData');
        const token = splashData ? JSON.parse(splashData)?.user?.token : null;

        const body = new FormData();
        body.append('name', formData.fullName);
        body.append('email', formData.email);
        body.append('country_code', formData.country_code);
        body.append('phone', formData.phone_number);
        body.append('phone_number', `${formData.country_code}${formData.phone_number}`);
        if (profileImageFile) body.append('profile_picture', profileImageFile);

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/user/update`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body
            });
            const data = await res.json();
            if (data?.status === false) {
              toast.error(data?.action || 'Something went wrong.');
            } else if (data?.user) {
                const updated = { ...JSON.parse(localStorage.getItem('splashData')), user: data.user };
                localStorage.setItem('splashData', JSON.stringify(updated));
            }
        } catch (e) {
            console.error('Update failed:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = () => {
        if (profileImage) {
            setShowPreview(true);
        }
    };

    // Prevent background scrolling when preview is open
    useEffect(() => {
        if (showPreview) {
            // Save current scroll position
            const scrollY = window.scrollY;
            
            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            
            return () => {
                // Restore scrolling
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                
                // Restore scroll position
                window.scrollTo(0, scrollY);
            };
        }
    }, [showPreview]);

    return(
        <>
            <div className="max-w-10xl mt-9 mx-auto px-4 py-4 sm:px-6 sm:py-8">
                <div className="bg-white  p-4 sm:p-8">
                    {/* Header */}
                    <h2 className="text-2xl text-black font-semibold mb-1">{t('userProfile.title')}</h2>
                    <p className="text-gray-600 text-sm mb-8">{t('userProfile.subtitle')}</p>
                    
                    {/* Form with Upload Image */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        {/* Upload Image Section */}
                        <div className="flex flex-col items-center">
                            <div 
                                onClick={handleImageClick}
                                className={`relative w-24 h-24 sm:w-34 sm:h-34 bg-gray-100  flex items-center justify-center overflow-hidden ${
                                    profileImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                                }`}
                            >
                                {profileImage ? (
                                    <>
                                        {imageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                               <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                        <img
                                            src={profileImage}
                                            alt="Profile"
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                            onLoad={() => setImageLoading(false)}
                                            onError={() => setImageLoading(false)}
                                        />
                                    </>
                                ) : (
                                    <RiUserLine size={110} className="text-gray-200" />
                                )}
                            </div>
                            
                            {profileImage ? (
                                <div className="flex flex-col gap-2 mt-3">
                                    <button
                                        onClick={handleUploadClick}
                                        type="button"
                                        className="text-sm border cursor-pointer border-gray-300 px-4 py-2  text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        {t('userProfile.updateImage')}
                                    </button>
                                    <button
                                        onClick={handleRemoveImage}
                                        type="button"
                                        className="text-sm cursor-pointer text-red-600 font-medium hover:text-red-700 transition-colors"
                                    >
                                        {t('userProfile.remove')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleUploadClick}
                                    type="button"
                                    className="text-sm border cursor-pointer border-gray-300 p-2  text-gray-700 mt-3 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('userProfile.uploadImage')}
                                </button>
                            )}
                            
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-5">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">{t('userProfile.fullName')}</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder={t('userProfile.fullNamePlaceholder')}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200  focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">{t('userProfile.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder={t('userProfile.emailPlaceholder')}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200  focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">{t('userProfile.phoneNumber')}</label>
                                <PhoneFieldBox
                                    iso2={countryIso2}
                                    onCountryChange={(iso2) => {
                                        setCountryIso2(iso2);
                                        setFormData(prev => ({ ...prev, country_code: getDialCodeByIso2(iso2) }));
                                        setPhoneError(null);
                                    }}
                                    value={formData.phone_number}
                                    onChange={(phone_number) => {
                                        setFormData(prev => ({ ...prev, phone_number }));
                                        if (phoneError) setPhoneError(null);
                                    }}
                                    onBlur={validatePhone}
                                    error={phoneError}
                                    searchPlaceholder={t('userProfile.searchCountry')}
                                    noResultsLabel={t('userProfile.noCountryFound')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-900  font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {t('userProfile.cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-black text-white  font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60"
                        >
                            {loading ? 'Updating...' : t('userProfile.updateProfileDetails')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {showPreview && (
               <div 
    className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
    onClick={() => setShowPreview(false)}
>
    <div className="relative">
        <button
            onClick={() => setShowPreview(false)}
            className="absolute top-2 right-2 z-10 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors bg-white  p-1"
        >
            <FiX size={24} />
        </button>
        <img 
            src={profileImage} 
            alt="Profile Preview" 
            className="w-[500px] h-[500px] object-cover "
            onClick={(e) => e.stopPropagation()}
        />
    </div>
</div>
            )}
        </>
    )
}