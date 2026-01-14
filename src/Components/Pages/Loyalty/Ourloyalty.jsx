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
// import { FaCheck } from 'react-icons/fa';

export default function Loyalty() {
    return (
        <>
        <div className="fixed top-0 left-0 right-0 z-50 ">
            <Navbar />
        </div>
       
    <div className="relative h-[400px] w-[95%] mx-auto rounded-3xl overflow-hidden mt-20 ">
        <div className="absolute inset-0 rounded-2xl">
            <Image
                src={dog}
                alt="Background"
                className="w-full h-full object-cover"
            />
           <div className="absolute inset-0 bg-gradient-to-r from-black/100 via-black/40 to-transparent"></div>
        </div>

        <div className="relative h-full flex flex-col  justify-center text-white px-4 ml-6">
            <h1 className="text-white mb-3 sm:mb-4 tracking-wide  text-2xl sm:text-3xl md:text-4xl lg:text-[32px] font-bold leading-tight">
                Join the Biogance Loyalty Program
            </h1>

            <div className="flex items-center gap-2 text-white text-xs sm:text-sm w-[50%]">
                <p>Give your pet the best care—while we reward your trust. With Biogance Loyalty, every purchase brings you closer to exclusive savings, special bonuses, and member-only rewards.</p>
            </div>

            <div className="space-y-3 mb-8 mt-8">
              <div className="flex items-center gap-3 text-white">
             <img src="doubleTick (2).svg " alt="" className="w-6 h-6 text-white" />
                <span>Register</span>
              </div>
              <div className="flex items-center gap-3 text-white">
              <img src="doubleTick (2).svg " alt="" className="w-6 h-6 text-white" />
                <span>Earn Points</span>
              </div>
              <div className="flex items-center gap-3 text-white">
             <img src="doubleTick (2).svg " alt="" className="w-6 h-6 text-white" />
                <span>Get Rewards</span>
              </div>
            </div>


            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold cursor-pointer">
                Register Now
              </button>
              <button className="bg-transparent text-white border border-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold cursor-pointer">
                Discover Products
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
          JOIN THE LOYALTY PROGRAM
        </p>
        
        <h1 className="text-4xl mb-6 text-gray-900">
          Rewarding Your Loyalty with Biogance
        </h1>
        
        <p className="text-gray-700 leading-relaxed mb-6">
          To reward your loyalty, we are pleased to present our Biogance loyalty program valid on all our products. To become a member, simply create an account at{' '}
          <a href="https://website-dev.biogance.com/" className="text-gray-900 underline">
            www.biogance.com
          </a>
          {' '}or log in if you already have one.
        </p>
        
        {/* Bullet Points List */}
        <ul className="space-y-3 mb-6 list-disc pl-5">
          <li className="text-gray-700 leading-relaxed">
            Earn 1 point for every 10 euros spent*
          </li>
          <li className="text-gray-700 leading-relaxed">
            Collect or convert to a discount voucher from the first point earned. 1 point gives you an immediate €1 discount.
          </li>
          <li className="text-gray-700 leading-relaxed">
            Bonus: Collect points for your birthday, subscribing to our newsletter, responding to our satisfaction survey or even during competitions or social media events!
          </li>
        </ul>
        
        <p className="text-gray-700 leading-relaxed mb-6 italic">
          *Excluding shipping costs / points are accumulated for all orders placed from September 4, 2021. Orders previously placed on the site are not eligible to accumulate points.
        </p>
        
        {/* Summary Box */}
        <div className="bg-gray-100 p-6 mb-6">
          <p className="text-gray-900 mb-3">
            In Summary:
          </p>
          
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-gray-700">
              10 euros spent = 1 point earned
            </li>
            <li className="text-gray-700">
              1 point used = 1 euro saved
            </li>
          </ul>
        </div>
        
        {/* Button */}
        <button className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          Manage Loyalty Points
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
