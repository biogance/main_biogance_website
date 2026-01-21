"use client"

import { FaCheck } from 'react-icons/fa';
import dog from "../../../../public/loyaltyMain.png"
import main from "../../../../public/loyaltyvec.svg"
import Image from 'next/image';
import Navbar from '../Navbar';
import Link from 'next/link';
import tick from "../../../../public/tick.svg"
import { BsTicket } from 'react-icons/bs';
import Footer from '../Footer';
import Forgotpassword from '../Onboarding/ForgetPassword';
import { useTranslation } from 'react-i18next';
// import { FaCheck } from 'react-icons/fa';

export default function Loyalty() {
    const { t } = useTranslation('ourloyalty');
    return (
        <>
        <div className="fixed top-0 left-0 right-0 z-50 ">
            <Navbar />
        </div>
       
   <div className="relative h-[450px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-[95%] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden mt-12 sm:mt-16 md:mt-20">
    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
        <Image
            src={dog}
            alt="Background"
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30 sm:from-black/100 sm:via-black/40 sm:to-transparent"></div>
    </div>

    <div className="relative h-full flex flex-col justify-center text-white px-5 sm:px-6 md:px-8 lg:px-12 py-8">
        <h1 className="text-white mb-4 sm:mb-4 tracking-wide text-[22px] sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight max-w-full sm:max-w-[90%] md:max-w-[70%] lg:max-w-[600px]">
            {t('joinLoyaltyProgram')}
        </h1>

        <p className="text-white/90 text-[13px] sm:text-sm md:text-base mb-5 sm:mb-6 md:mb-8 max-w-full sm:max-w-[85%] md:max-w-[65%] lg:max-w-[55%] leading-relaxed pr-4 sm:pr-0">
            {t('loyaltyDescription')}
        </p>

        <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-7 md:mb-8">
            <div className="flex items-center gap-2.5 sm:gap-3 text-white">
                <img src="doubleTick (2).svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="text-[13px] sm:text-sm md:text-base font-medium">{t('register')}</span>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 text-white">
                <img src="doubleTick (2).svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="text-[13px] sm:text-sm md:text-base font-medium">{t('earnPoints')}</span>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 text-white">
                <img src="doubleTick (2).svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="text-[13px] sm:text-sm md:text-base font-medium">{t('getRewards')}</span>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-full sm:max-w-[500px]">
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold cursor-pointer text-[13px] sm:text-sm md:text-base w-full sm:w-auto whitespace-nowrap">
                {t('Registernow')}
            </button>
            <button className="bg-transparent text-white border-2 border-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold cursor-pointer text-[13px] sm:text-sm md:text-base w-full sm:w-auto whitespace-nowrap">
                 {t('discoverproduct')}
            </button>
        </div>
    </div>
</div>


     <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-8xl w-full">
        <div className="grid md:grid-cols-2  items-center">
          {/* Left Image */}
          <div className="flex justify-center">
            <Image
              src={main} 
              alt="Treasure chest with coins illustration" 
              className="w-[70%] "
            />
          </div>
          
          {/* Right Content */}
         <div className=" bg-white p-2 md:p-12">
      <div className="max-w-7xl">
        <p className="text-xs tracking-widest text-gray-500 mb-4">
          {t('joinLoyaltyProgramTitle')}
        </p>

        <h1 className="text-4xl mb-6 text-gray-900">
          {t('rewardingLoyaltyTitle')}
        </h1>

        <p className="text-gray-700 leading-relaxed mb-6">
          {t('loyaltyProgramDescription')}
        </p>
        
        {/* Bullet Points List */}
        <ul className="space-y-3 mb-6 list-disc pl-5">
          <li className="text-gray-700 leading-relaxed">
            {t('earnPointsDescription')}
          </li>
          <li className="text-gray-700 leading-relaxed">
            {t('discountVoucherDescription')}
          </li>
          <li className="text-gray-700 leading-relaxed">
            {t('bonusDescription')}
          </li>
        </ul>
        
        <p className="text-gray-700 leading-relaxed mb-6 italic">
          {t('exclusionNote')}
        </p>

        {/* Summary Box */}
        <div className="bg-gray-100 p-6 mb-6">
          <p className="text-gray-900 mb-3">
            {t('inSummary')}
          </p>

          <ul className="space-y-2 list-disc pl-5">
            <li className="text-gray-700">
              {t('summaryPoint1')}
            </li>
            <li className="text-gray-700">
              {t('summaryPoint2')}
            </li>
          </ul>
        </div>

        {/* Button */}
        <button className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          {t('manageLoyaltyPoints')}
        </button>
      </div>
    </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
    );
}
