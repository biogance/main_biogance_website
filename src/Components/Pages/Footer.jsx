"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { SlSocialFacebook, SlSocialLinkedin, SlSocialYoutube } from "react-icons/sl";
import { PiTwitterLogo } from 'react-icons/pi';
import { BsTiktok } from "react-icons/bs";
import ContactUs from './Onboarding/ContactUs';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('footer');
  const [showModal, setShowModal] = useState(false);

  // Get arrays from translation
  const dogsItems = t('categories.dogs.items', { returnObjects: true });
  const catsItems = t('categories.cats.items', { returnObjects: true });
  const horsesItems = t('categories.horses.items', { returnObjects: true });
  const smallMammalsItems = t('categories.smallMammals.items', { returnObjects: true });
  const birdsPoultryItems = t('categories.birdsPoultry.items', { returnObjects: true });
  const reptilesItems = t('categories.reptiles.items', { returnObjects: true });
  const productRangesItems = t('productRanges.items', { returnObjects: true });
  const laboratoryItems = t('laboratory.items', { returnObjects: true });
  const professionalItems = t('professional.items', { returnObjects: true });
  const ambassadorItems = t('ambassador.items', { returnObjects: true });
  const newsItems = t('news.items', { returnObjects: true });

  return (
    <footer className="bg-[#2a2a2a] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column - Logo & Contact */}
          <div className="lg:col-span-3 space-y-6 p-8 lg:pr-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
             <img src="/logo2.svg" alt="Biogance Logo" />
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {t('company.description')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">{t('company.address')}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">{t('company.email')}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">{t('company.phone')}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4 ">
              <p className="text-base font-medium">{t('social.title')}</p>
              
              {/* @bioganceofficiel */}
              <div>
                <p className="text-sm text-gray-400 mb-2">{t('social.biogance')}</p>
                <div className="flex gap-2">
                  <a href="#" aria-label="Facebook" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <SlSocialFacebook className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="Instagram" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <FaInstagram className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="YouTube" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <SlSocialYoutube className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="LinkedIn" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                   <SlSocialLinkedin className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="Twitter" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <PiTwitterLogo className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="TikTok" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                   <BsTiktok size={15} className="p-[0.9]  border border gray-200   text-[#E3E3E3] rounded-sm" />
                  </a>
                </div>
              </div>

              {/* @ekinatofficiel */}
              <div>
                <p className="text-sm text-gray-400 mb-2">{t('social.ekinat')}</p>
                <div className="flex gap-2">
                  <a href="#" aria-label="Facebook" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                     <SlSocialFacebook className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="Instagram" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <FaInstagram className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a href="#" aria-label="TikTok" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                  <BsTiktok size={15} className="p-[0.9]  text-[#E3E3E3] border border gray-200   rounded-sm" />
                  </a>
                </div>
              </div> 
            </div>

            {/* Newsletter */}
            <div className="pt-4">
              <p className="text-white font-medium mb-3 text-sm sm:text-base">{t('newsletter.title')}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs sm:text-sm text-white block mb-2">{t('newsletter.emailLabel')}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder={t('newsletter.emailPlaceholder')}
                      className="flex-1 min-w-0 bg-[#393939] border border-[#393939] text-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm rounded-xl placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    />
                    <button className="px-4 sm:px-6 py-2.5 border border-white cursor-pointer text-white text-xs sm:text-sm font-normal rounded-xl hover:bg-black transition whitespace-nowrap">
                      {t('newsletter.subscribeButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Download */}
           <div className="pt-4">
              <p className="text-sm sm:text-base font-medium mb-3">{t('mobileApp.title')}</p>
              <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-2 sm:gap-3">
                <a href="#" className="flex-shrink-0 w-fit" aria-label={t('mobileApp.googlePlay')}>
                  <img src="/play.svg" alt="Google Play" className="h-10 w-auto" />
                </a>
                <a href="#" className="flex-shrink-0 w-fit" aria-label={t('mobileApp.appStore')}>
                  <img src="/app.svg" alt="App Store" className="h-10 w-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* Middle Section - Product Categories */}
          <div className="lg:col-span-6 bg-[#1c1c1c] px-6 sm:px-8 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 pt-4">
              
              {/* Dogs & Puppies */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">{t('categories.dogs.title')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {dogsItems.map((item, index) => (
                    <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                  ))}
                </ul>
              </div>

              {/* Cats & Kittens */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">{t('categories.cats.title')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {catsItems.map((item, index) => (
                    <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                  ))}
                </ul>
              </div>

              {/* Horses */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">{t('categories.horses.title')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {horsesItems.map((item, index) => (
                    <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                  ))}
                </ul>
              </div>

              {/* Empty column for spacing */}
              <div></div>
            </div>

            {/* Bottom row - Small Mammals, Birds & Poultry, Reptiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-4 pt-2 ">
              {/* Small Mammals */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">{t('categories.smallMammals.title')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {smallMammalsItems.map((item, index) => (
                    <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                  ))}
                </ul>
              </div>

              {/* Birds & Poultry */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">{t('categories.birdsPoultry.title')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {birdsPoultryItems.map((item, index) => (
                    <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                  ))}
                </ul>
              </div>

              {/* Reptiles */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">{t('categories.reptiles.title')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-300 mb-4">
                  {reptilesItems.map((item, index) => (
                    <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6 p-8 lg:pl-6">
            
            {/* Our Products Ranges */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">{t('productRanges.title')}</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {productRangesItems.map((item, index) => (
                  <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Our Laboratory */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">{t('laboratory.title')}</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><Link href="/who-are-we" className="hover:text-white transition">{laboratoryItems[0]}</Link></li>
                <li><Link href="/commitments" className="hover:text-white transition">{laboratoryItems[1]}</Link></li>
                <li><Link href="/certifications" className="hover:text-white transition">{laboratoryItems[2]}</Link></li>
                <li><a href="#" className="hover:text-white transition">{laboratoryItems[3]}</a></li>
                <li><Link href="/ingredients" className="hover:text-white transition">{laboratoryItems[4]}</Link></li>
                <li><Link href="loyalty" className="hover:text-white transition">{laboratoryItems[5]}</Link></li>
                <li><button onClick={() => setShowModal(true)} className="hover:text-white transition text-left cursor-pointer">{laboratoryItems[6]}</button></li>
              </ul>
            </div>

            {/* Professional */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">{t('professional.title')}</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {professionalItems.map((item, index) => (
                  <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Ambassador */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">{t('ambassador.title')}</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {ambassadorItems.map((item, index) => (
                  <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* News */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">{t('news.title')}</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {newsItems.map((item, index) => (
                  <li key={index}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center  gap-4 text-xs  text-[14px] text-black">
            <p>{t('bottom.copyright')}</p>
            <div className="flex flex-wrap gap-5 justify-center ">
              <a href="#" className="hover:text-gray-900 transition">{t('bottom.conception')}</a>
              <a href="#" className="hover:text-gray-900 transition">{t('bottom.agency')}</a>
              <Link href="/faq" className="hover:text-gray-900 transition">{t('bottom.faqs')}</Link>
              <Link href="/termsCondition?section=disclaimer" className="hover:text-gray-900 transition cursor-pointer">{t('bottom.disclaimer')}</Link>
              <Link href="/termsCondition?section=shipping" className="hover:text-gray-900 transition cursor-pointer">{t('bottom.shipping')}</Link>
              <Link href="/termsCondition?section=privacy" className="hover:text-gray-900 transition cursor-pointer">{t('bottom.privacy')}</Link>
              <Link href="/termsCondition?section=terms" className="hover:text-gray-900 transition cursor-pointer">{t('bottom.terms')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <ContactUs onClose={() => setShowModal(false)} />
        </div>
      )}
    </footer>
  );
}