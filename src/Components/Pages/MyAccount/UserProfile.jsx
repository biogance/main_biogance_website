"use client"

import { useState } from "react"
import { FiUser } from "react-icons/fi"
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { RiUserLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';


export default function UserProfile() {
    const { t } = useTranslation('myaccount');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: ''
    });
    const [profileImage, setProfileImage] = useState(null);

    // Custom styles for phone input
    const phoneInputStyles = `
        .react-international-phone-input-container {
            background-color: #F9FAFB !important;
            border: 1px solid #E5E7EB !important;
            border-radius: 8px !important;
            height: 42px !important;
            display: flex !important;
            align-items: center !important;
        }
        .react-international-phone-input-container .react-international-phone-country-selector-button {
            border: none !important;
            background-color: transparent !important;
            padding: 0 8px 0 12px !important;
            height: 100% !important;
        }
        .react-international-phone-input-container .react-international-phone-country-selector-button__button-content {
            gap: 6px !important;
        }
        .react-international-phone-input-container input {
            border: none !important;
            background-color: transparent !important;
            height: 100% !important;
            padding: 0 16px !important;
            border-radius: 0 !important;
        }
        .react-international-phone-input-container input:focus {
            outline: none !important;
            box-shadow: none !important;
        }
        .react-international-phone-input-container:focus-within {
            ring: 2px !important;
            ring-color: #9CA3AF !important;
        }
    `;

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        document.getElementById('profile-upload').click();
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        document.getElementById('profile-upload').value = '';
    };

    const handleCancel = () => {
        setFormData({
            fullName: '',
            email: '',
            phoneNumber: ''
        });
        setProfileImage(null);
    };

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        // Add your submit logic here
    };

    return(
        <>
            <style>{phoneInputStyles}</style>
            <div className="max-w-10xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
                <div className="bg-white rounded-xl p-4 sm:p-8">
                    {/* Header */}
                    <h2 className="text-2xl text-black font-semibold mb-1">{t('userProfile.title')}</h2>
                    <p className="text-gray-600 text-sm mb-8">{t('userProfile.subtitle')}</p>
                    
                    {/* Form with Upload Image */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        {/* Upload Image Section */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 sm:w-34 sm:h-34 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <RiUserLine size={110} className="text-gray-200" />
                                )}
                            </div>
                            
                            {profileImage ? (
                                <div className="flex flex-col gap-2 mt-3">
                                    <button
                                        onClick={handleUploadClick}
                                        type="button"
                                        className="text-sm border cursor-pointer border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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
                                    className="text-sm border cursor-pointer border-gray-300 p-2 rounded-lg text-gray-700 mt-3 font-medium hover:bg-gray-50 transition-colors"
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
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
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
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">{t('userProfile.phoneNumber')}</label>
                                <PhoneInput
                                    defaultCountry="gb"
                                    value={formData.phoneNumber}
                                    onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {t('userProfile.cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            {t('userProfile.updateProfileDetails')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}