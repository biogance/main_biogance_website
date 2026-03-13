
"use client"

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function TermsCondition() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TermsConditionContent />
    </Suspense>
  );
}

function TermsConditionContent() {
  const { t } = useTranslation('termscondition');
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(section || 'disclaimer');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const currentSection = searchParams.get('section');
    if (currentSection && currentSection !== activeSection) {
      setActiveSection(currentSection);
    }
  }, [searchParams]);

  const handleSectionChange = (newSection) => {
    if (newSection === activeSection) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(newSection);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar/>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden lg:top-0 sticky top-16 bg-white z-100">
        <div className="overflow-x-auto">
          <nav className="flex space-x-2 px-4 py-3 min-w-max">
            <button
              onClick={() => handleSectionChange('disclaimer')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg transition-all duration-300 transform ${
                activeSection === 'disclaimer'
                  ? 'bg-gray-900 text-white font-medium scale-105 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              {t('nav.disclaimer')}
            </button>

            <button
              onClick={() => handleSectionChange('shipping')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg transition-all duration-300 transform ${
                activeSection === 'shipping'
                  ? 'bg-gray-900 text-white font-medium scale-105 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              {t('nav.shipping')}
            </button>

            <button
              onClick={() => handleSectionChange('privacy')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg transition-all duration-300 transform ${
                activeSection === 'privacy'
                  ? 'bg-gray-900 text-white font-medium scale-105 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              {t('nav.privacy')}
            </button>

            <button
              onClick={() => handleSectionChange('terms')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg transition-all duration-300 transform ${
                activeSection === 'terms'
                  ? 'bg-gray-900 text-white font-medium scale-105 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              {t('nav.terms')}
            </button>
          </nav>
        </div>
      </div>
      
      <h1 className={`text-2xl lg:text-2xl font-bold text-gray-900 mb-2 mt-20 px-8 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
      }`}>
        {activeSection === 'disclaimer' && t('sections.disclaimer')}
        {activeSection === 'shipping' && t('sections.shipping')}
        {activeSection === 'privacy' && t('sections.privacy')}
        {activeSection === 'terms' && t('sections.terms')}
      </h1>

      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-6 mt-6 lg:mt-6 ml-6 mr-6 px-4 lg:px-0">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-20 self-start">
          <nav className="space-y-2">
            <button
              onClick={() => handleSectionChange('disclaimer')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer transition-all duration-300 transform ${
                activeSection === 'disclaimer'
                  ? 'bg-gray-100 text-gray-900 font-medium shadow-sm scale-102'
                  : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
              }`}
            >
              {t('sections.disclaimer')}
            </button>

            <button
              onClick={() => handleSectionChange('shipping')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer transition-all duration-300 transform ${
                activeSection === 'shipping'
                  ? 'bg-gray-100 text-gray-900 font-medium shadow-sm scale-102'
                  : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
              }`}
            >
              {t('sections.shipping')}
            </button>

            <button
              onClick={() => handleSectionChange('privacy')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer transition-all duration-300 transform ${
                activeSection === 'privacy'
                  ? 'bg-gray-100 text-gray-900 font-medium shadow-sm scale-102'
                  : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
              }`}
            >
              {t('sections.privacy')}
            </button>

            <button
              onClick={() => handleSectionChange('terms')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer transition-all duration-300 transform ${
                activeSection === 'terms'
                  ? 'bg-gray-100 text-gray-900 font-medium shadow-sm scale-102'
                  : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
              }`}
            >
              {t('sections.terms')}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`flex-1 pb-8 transition-all duration-300 ${
          isTransitioning 
            ? 'opacity-0 transform translate-y-4' 
            : 'opacity-100 transform translate-y-0'
        }`}>
         
          {/* DISCLAIMER SECTION */}
          {activeSection === 'disclaimer' && (
            <div className="space-y-6 lg:space-y-8">
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.presentation.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.presentation.intro')}</p>
                  <ul className="list-disc space-y-1 lg:space-y-2 ml-3 lg:ml-4">
                    <li>
                      {t('disclaimer.presentation.owner')} <br /> 
                      {t('disclaimer.presentation.ownerDetails')}<br />
                      {t('disclaimer.presentation.address')}
                    </li>
                    <li>{t('disclaimer.presentation.publisher')}</li>
                    <li>{t('disclaimer.presentation.creator')}</li>
                    <li>
                      {t('disclaimer.presentation.host')} <br /> 
                      {t('disclaimer.presentation.hostDetails')}<br />
                      {t('disclaimer.presentation.hostAddress')}<br />
                      {t('disclaimer.presentation.hostPhone')}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.generalConditions.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.generalConditions.paragraph1')}</p>
                  <p>{t('disclaimer.generalConditions.paragraph2')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.servicesProvided.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.servicesProvided.paragraph1')}</p>
                  <p>{t('disclaimer.servicesProvided.paragraph2')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.technicalLimitations.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.technicalLimitations.paragraph1')}</p>
                  <p>{t('disclaimer.technicalLimitations.paragraph2')}</p>
                  <p>{t('disclaimer.technicalLimitations.paragraph3')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.intellectualProperty.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.intellectualProperty.paragraph1')}</p>
                  <p>{t('disclaimer.intellectualProperty.paragraph2')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.liability.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.liability.paragraph1')}</p>
                  <p>{t('disclaimer.liability.paragraph2')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.personalData.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.personalData.paragraph1')}</p>
                  <p>{t('disclaimer.personalData.paragraph2')}</p>
                  <p>{t('disclaimer.personalData.paragraph3')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('disclaimer.personalData.right1')}</li>
                  </ul>
                  <p>{t('disclaimer.personalData.paragraph4')}</p>
                  <p>{t('disclaimer.personalData.paragraph5')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.cookies.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.cookies.paragraph1')}</p>
                  <p>{t('disclaimer.cookies.paragraph2')}</p>
                  <p>{t('disclaimer.cookies.paragraph3')}</p>
                  <p>{t('disclaimer.cookies.paragraph4')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.applicableLaw.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('disclaimer.applicableLaw.paragraph1')}</p>
                  <p>
                    {t('disclaimer.applicableLaw.mediator')} <br />
                    {t('disclaimer.applicableLaw.mediatorAddress')} <br />
                    {t('disclaimer.applicableLaw.mediatorWebsite')}
                  </p>
                  <p>{t('disclaimer.applicableLaw.paragraph2')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.referenceText.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-1 lg:space-y-2">
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('disclaimer.referenceText.item1')}</li>
                    <li>{t('disclaimer.referenceText.item2')}</li>
                    <li>{t('disclaimer.referenceText.item3')}</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('disclaimer.glossary.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-1 lg:space-y-2">
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('disclaimer.glossary.user')}</li>
                    <li>{t('disclaimer.glossary.personalData')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SHIPPING SECTION */}
          {activeSection === 'shipping' && (
            <div className="space-y-6 lg:space-y-8">
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('shipping.orderValidation.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('shipping.orderValidation.paragraph1')}</p>
                  <p>{t('shipping.orderValidation.paragraph2')}</p>
                  <p>{t('shipping.orderValidation.paragraph3')}</p>
                  <p>{t('shipping.orderValidation.paragraph4')}</p>
                  <p>{t('shipping.orderValidation.paragraph5')}</p>
                  <p>{t('shipping.orderValidation.paragraph6')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('shipping.orderValidation.timing1')}</li>
                    <li>{t('shipping.orderValidation.timing2')}</li>
                  </ul>
                  <p>{t('shipping.orderValidation.paragraph7')}</p>
                  <p>{t('shipping.orderValidation.paragraph8')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('shipping.delivery.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p><strong>{t('shipping.delivery.areaTitle')}</strong></p>
                  <p>{t('shipping.delivery.area')}</p>
                  
                  <p><strong>{t('shipping.delivery.modesTitle')}</strong></p>
                  <p>{t('shipping.delivery.modes')}</p>
                  
                  <p><strong>{t('shipping.delivery.feesTitle')}</strong></p>
                  <p>{t('shipping.delivery.fees')}</p>
                  
                  <p><strong>{t('shipping.delivery.problemsTitle')}</strong></p>
                  <p>{t('shipping.delivery.problems1')}</p>
                  <p>{t('shipping.delivery.problems2')}</p>
                  <p>{t('shipping.delivery.problems3')}</p>
                  
                  <p><strong>{t('shipping.delivery.forceMajeureTitle')}</strong></p>
                  <p>{t('shipping.delivery.forceMajeure1')}</p>
                  <p>{t('shipping.delivery.forceMajeure2')}</p>
                  <p>{t('shipping.delivery.forceMajeure3')}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('shipping.withdrawal.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('shipping.withdrawal.paragraph1')}</p>
                  <p>{t('shipping.withdrawal.paragraph2')}</p>
                  <p>{t('shipping.withdrawal.paragraph3')}</p>
                  <p>{t('shipping.withdrawal.paragraph4')}</p>
                  <p><strong>{t('shipping.withdrawal.exceptionsTitle')}</strong></p>
                  <p>{t('shipping.withdrawal.exceptions')}</p>
                  <p>{t('shipping.withdrawal.paragraph5')}</p>
                  <p>{t('shipping.withdrawal.paragraph6')}</p>
                  <p><strong>{t('shipping.withdrawal.formTitle')}</strong></p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('shipping.claims.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('shipping.claims.paragraph1')}</p>
                  <p>{t('shipping.claims.paragraph2')}</p>
                  <p>{t('shipping.claims.paragraph3')}</p>
                  <p>{t('shipping.claims.paragraph4')}</p>
                  <p>{t('shipping.claims.paragraph5')}</p>
                  <p>{t('shipping.claims.paragraph6')}</p>
                </div>
              </div>
            </div>
          )}

         {/* PRIVACY SECTION - COMPLETE WITH i18n */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Privacy Policy Header */}
              <div className="rounded-lg p-4 lg:p-2">
                <h2 className="text-base lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.header.title')}
                </h2>
                <p className="text-xs lg:text-sm text-gray-700 mb-2">
                  {t('privacy.header.lastUpdated')}
                </p>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.header.intro')}</p>
                </div>
              </div>

              {/* Who are we? */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.whoAreWe.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.whoAreWe.company')}</p>
                  <p>{t('privacy.whoAreWe.address')}</p>
                  <p>{t('privacy.whoAreWe.email')}</p>
                </div>
              </div>

              {/* Comments */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.comments.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.comments.paragraph1')}</p>
                  <p>{t('privacy.comments.paragraph2')}</p>
                </div>
              </div>

              {/* Media */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.media.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.media.paragraph1')}</p>
                </div>
              </div>

              {/* Cookies */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.cookies.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.cookies.paragraph1')}</p>
                  <p>{t('privacy.cookies.paragraph2')}</p>
                  <p>{t('privacy.cookies.paragraph3')}</p>
                  <p>{t('privacy.cookies.paragraph4')}</p>
                </div>
              </div>

              {/* Embedded content from other sites */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.embeddedContent.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.embeddedContent.paragraph1')}</p>
                  <p>{t('privacy.embeddedContent.paragraph2')}</p>
                </div>
              </div>

              {/* Use and transmission of your personal data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.useAndTransmission.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.useAndTransmission.paragraph1')}</p>
                </div>
              </div>

              {/* Services used */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.servicesUsed.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.servicesUsed.paragraph1')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('privacy.servicesUsed.service1')}</li>
                    <li>{t('privacy.servicesUsed.service2')}</li>
                  </ul>
                  <p>{t('privacy.servicesUsed.paragraph2')}</p>
                </div>
              </div>

              {/* Storage durations of your data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.storageDuration.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.storageDuration.paragraph1')}</p>
                  <p>{t('privacy.storageDuration.paragraph2')}</p>
                </div>
              </div>

              {/* Security of your data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.security.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.security.paragraph1')}</p>
                </div>
              </div>

              {/* The rights you have over your data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.rights.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.rights.paragraph1')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('privacy.rights.right1')}</li>
                    <li>{t('privacy.rights.right2')}</li>
                    <li>{t('privacy.rights.right3')}</li>
                    <li>{t('privacy.rights.right4')}</li>
                    <li>{t('privacy.rights.right5')}</li>
                  </ul>
                  <p>{t('privacy.rights.paragraph2')}</p>
                </div>
              </div>

              {/* Transmission of your personal data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('privacy.transmission.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('privacy.transmission.paragraph1')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TERMS SECTION - COMPLETE WITH i18n */}
          {activeSection === 'terms' && (
            <div className="space-y-6 lg:space-y-8">
              {/* SCOPE OF APPLICATION */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.scope.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('terms.scope.paragraph1')}</p>
                  <p>{t('terms.scope.paragraph2')}</p>
                  <p>{t('terms.scope.paragraph3')}</p>
                  <p>{t('terms.scope.paragraph4')}</p>
                </div>
              </div>

              {/* PRODUCTS & PRICE */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.products.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('terms.products.paragraph1')}</p>
                  <p>{t('terms.products.paragraph2')}</p>
                  <p>{t('terms.products.paragraph3')}</p>
                  <p>{t('terms.products.paragraph4')}</p>
                  <p>{t('terms.products.paragraph5')}</p>
                  <p>{t('terms.products.paragraph6')}</p>
                </div>
              </div>

              {/* PAYMENT AND SECURITY */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.payment.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p><strong>{t('terms.payment.methodsTitle')}</strong></p>
                  <p>{t('terms.payment.methods')}</p>
                  
                  <p><strong>{t('terms.payment.individualsTitle')}</strong></p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.payment.individual1')}</li>
                    <li>{t('terms.payment.individual2')}</li>
                  </ul>

                  <p><strong>{t('terms.payment.professionalsTitle')}</strong></p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.payment.professional1')}</li>
                    <li>{t('terms.payment.professional2')}</li>
                    <li>{t('terms.payment.professional3')}</li>
                    <li>{t('terms.payment.professional4')}</li>
                  </ul>

                  <p>{t('terms.payment.checkInfo')}</p>
                  
                  <p><strong>{t('terms.payment.secureTitle')}</strong></p>
                  <p>{t('terms.payment.secure1')}</p>
                  <p>{t('terms.payment.secure2')}</p>
                  <p>{t('terms.payment.secure3')}</p>
                </div>
              </div>

              {/* RESERVATION OF OWNERSHIP */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.ownership.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('terms.ownership.paragraph1')}</p>
                  <p>{t('terms.ownership.paragraph2')}</p>
                  <p>{t('terms.ownership.paragraph3')}</p>
                </div>
              </div>

              {/* LEGAL GUARANTEES */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.guarantees.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('terms.guarantees.intro')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.guarantees.guarantee1')}</li>
                    <li>{t('terms.guarantees.guarantee2')}</li>
                  </ul>

                  <p><strong>{t('terms.guarantees.conformityTitle')}</strong></p>
                  <p>{t('terms.guarantees.conformity1')}</p>
                  <p>{t('terms.guarantees.conformity2')}</p>
                  <p>{t('terms.guarantees.conformity3')}</p>
                  <p>{t('terms.guarantees.conformity4')}</p>

                  <p><strong>{t('terms.guarantees.hiddenDefectsTitle')}</strong></p>
                  <p>{t('terms.guarantees.hiddenDefects1')}</p>
                  <p>{t('terms.guarantees.hiddenDefects2')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.guarantees.hiddenDefect1')}</li>
                    <li>{t('terms.guarantees.hiddenDefect2')}</li>
                  </ul>

                  <p><strong>{t('terms.guarantees.implementationTitle')}</strong></p>
                  <p>{t('terms.guarantees.implementation')}</p>
                  <p>{t('terms.guarantees.note')}</p>
                </div>
              </div>

              {/* APPLICABLE LAW AND LANGUAGE OF THE CONTRACT */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.law.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('terms.law.paragraph1')}</p>
                  <p>{t('terms.law.paragraph2')}</p>
                </div>
              </div>

              {/* PERSONAL DATA SCOPE */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                  {t('terms.personalDataScope.title')}
                </h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>{t('terms.personalDataScope.paragraph1')}</p>
                  <p>{t('terms.personalDataScope.paragraph2')}</p>

                  <p><strong>{t('terms.personalDataScope.rightsTitle')}</strong></p>
                  <p>{t('terms.personalDataScope.rights')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.personalDataScope.right1')}</li>
                    <li>{t('terms.personalDataScope.right2')}</li>
                    <li>{t('terms.personalDataScope.right3')}</li>
                  </ul>

                  <p>{t('terms.personalDataScope.exercise')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.personalDataScope.exerciseMethod1')}</li>
                    <li>{t('terms.personalDataScope.exerciseMethod2')}</li>
                  </ul>

                  <p>{t('terms.personalDataScope.response')}</p>

                  <p><strong>{t('terms.personalDataScope.marketingTitle')}</strong></p>
                  <p>{t('terms.personalDataScope.marketing')}</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>{t('terms.personalDataScope.marketing1')}</li>
                    <li>{t('terms.personalDataScope.marketing2')}</li>
                    <li>{t('terms.personalDataScope.marketing3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}