import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaTwitter, FaTiktok } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#2a2a2a] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column - Logo & Contact */}
          <div className="lg:col-span-3 space-y-6 p-8 lg:pr-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
             <img src="logo2.svg" alt="" />
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              Biogance blends science and nature to craft eco-certified pet care made in France — promoting animal well-being, sustainability, and safe, effective care for your companions.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">ZI Anjou Atlantique, Angers, France</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">info@biogance.fr</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">+33 2 41 73 15 15</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4 ">
              <p className="text-base font-medium">Share your experience</p>
              
              {/* @bioganceofficiel */}
              <div>
                <p className="text-sm text-gray-400 mb-2">@bioganceofficiel</p>
                <div className="flex gap-2">
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="facebook.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="instagram.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="Youtube.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="LinkdIn.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="Twiter.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="tiktok.svg" alt=""className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* @ekinatofficiel */}
              <div>
                <p className="text-sm text-gray-400 mb-2">@ekinatofficiel</p>
                <div className="flex gap-2">
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="facebook.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="instagram.svg" alt=""className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#373737] rounded-lg flex items-center justify-center hover:bg-[#5a5a5a] transition">
                    <img src="tiktok.svg" alt=""className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-4">
              <p className="text-white font-medium mb-3">Subscribe to our newsletter</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white block mb-2">Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="eg: john_doe@gmail.com"
                      className="flex-1 bg-[#393939] border border-[#393939] text-white px-4 py-2.5 text-sm rounded-xl placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    />
                    <button className="px-2 border border-white cursor-pointer text-white text-sm font-normal rounded-xl hover:bg-black transition whitespace-nowrap">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Download */}
           <div className="pt-4">
  <p className="text-base font-medium mb-3">Download App on Mobile</p>
  <div className="flex gap-3">
    <a href="#" className="flex-shrink-0">
      <img src="play.svg" alt="Google Play" className="h-12 w-auto" />
    </a>
    <a href="#" className="flex-shrink-0">
      <img src="app.svg" alt="App Store" className="h-12 w-auto" />
    </a>
  </div>
</div>
          </div>

          {/* Middle Section - Product Categories */}
          <div className="lg:col-span-6 bg-[#1c1c1c] px-6 sm:px-8 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 pt-4">
              
              {/* Dogs & Puppies */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">Dogs & Puppies</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition">Shampoos & Conditioners</a></li>
                  <li><a href="#" className="hover:text-white transition">Dry & No-Rinse Shampoos</a></li>
                  <li><a href="#" className="hover:text-white transition">Detanglers & brushes</a></li>
                  <li><a href="#" className="hover:text-white transition">Care for sensitive areas</a></li>
                  <li><a href="#" className="hover:text-white transition">Skin & Coat Care</a></li>
                  <li><a href="#" className="hover:text-white transition">Parasite control treatment</a></li>
                  <li><a href="#" className="hover:text-white transition">Anti-free radical treatment</a></li>
                  <li><a href="#" className="hover:text-white transition">Shedding care</a></li>
                  <li><a href="#" className="hover:text-white transition">Clean up and protect your environment</a></li>
                  <li><a href="#" className="hover:text-white transition">Dietary supplements</a></li>
                  <li><a href="#" className="hover:text-white transition">Relaxation & unwinding</a></li>
                  <li><a href="#" className="hover:text-white transition">Preparation for exertion & recovery</a></li>
                  <li><a href="#" className="hover:text-white transition">Perfumed waters</a></li>
                  <li><a href="#" className="hover:text-white transition">Toys & treats</a></li>
                  <li><a href="#" className="hover:text-white transition">Bath accessories</a></li>
                  <li><a href="#" className="hover:text-white transition">Our selection</a></li>
                  <li><a href="#" className="hover:text-white transition">What's new</a></li>
                </ul>
              </div>

              {/* Cats & Kittens */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">Cats & Kittens</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition">Shampoos & Conditioners</a></li>
                  <li><a href="#" className="hover:text-white transition">Dry & No-Rinse Shampoos</a></li>
                  <li><a href="#" className="hover:text-white transition">Detanglers & brushes</a></li>
                  <li><a href="#" className="hover:text-white transition">Care for sensitive areas</a></li>
                  <li><a href="#" className="hover:text-white transition">Skin & Coat Care</a></li>
                  <li><a href="#" className="hover:text-white transition">Parasite control treatment</a></li>
                  <li><a href="#" className="hover:text-white transition">Anti-free radical treatment</a></li>
                  <li><a href="#" className="hover:text-white transition">Shedding care</a></li>
                  <li><a href="#" className="hover:text-white transition">Clean up and protect your environment</a></li>
                  <li><a href="#" className="hover:text-white transition">Dietary supplements</a></li>
                  <li><a href="#" className="hover:text-white transition">Relaxation & unwinding</a></li>
                  <li><a href="#" className="hover:text-white transition">Perfumed waters</a></li>
                  <li><a href="#" className="hover:text-white transition">Bath accessories</a></li>
                  <li><a href="#" className="hover:text-white transition">Our selection</a></li>
                  <li><a href="#" className="hover:text-white transition">What's new</a></li>
                </ul>
              </div>

              {/* Horses */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">Horses</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition">Dress care</a></li>
                  <li><a href="#" className="hover:text-white transition">Limb care</a></li>
                  <li><a href="#" className="hover:text-white transition">Foot care</a></li>
                  <li><a href="#" className="hover:text-white transition">Back care</a></li>
                  <li><a href="#" className="hover:text-white transition">Preparation for exertion & recovery</a></li>
                  <li><a href="#" className="hover:text-white transition">Accessories</a></li>
                  <li><a href="#" className="hover:text-white transition">Our selection</a></li>
                  <li><a href="#" className="hover:text-white transition">What's new</a></li>
                  <li><a href="#" className="hover:text-white transition">Follow the Ekinat adventures</a></li>
                </ul>
              </div>

              {/* Empty column for spacing */}
              <div></div>
            </div>

            {/* Bottom row - Small Mammals, Birds & Poultry, Reptiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-4 pt-2 ">
              {/* Small Mammals */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">Small Mammals</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition">Rabbits</a></li>
                  <li><a href="#" className="hover:text-white transition">Ferrets</a></li>
                  <li><a href="#" className="hover:text-white transition">Hamster</a></li>
                  <li><a href="#" className="hover:text-white transition">Accessories and textiles</a></li>
                  <li><a href="#" className="hover:text-white transition">Our selection</a></li>
                  <li><a href="#" className="hover:text-white transition">What's new</a></li>
                </ul>
              </div>

              {/* Birds & Poultry */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">Birds & Poultry</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition">Bird</a></li>
                  <li><a href="#" className="hover:text-white transition">Farmyard</a></li>
                  <li><a href="#" className="hover:text-white transition">Dietary supplements</a></li>
                  <li><a href="#" className="hover:text-white transition">What's new</a></li>
                </ul>
              </div>

              {/* Reptiles */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-md">Reptiles</h3>
                <ul className="space-y-2.5 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition">Tortoise</a></li>
                  <li><a href="#" className="hover:text-white transition">Terrarium maintenance</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6 p-8 lg:pl-6">
            
            {/* Our Products Ranges */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">Our Products Ranges</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">BIOGANCE, premium et naturel</a></li>
                <li><a href="#" className="hover:text-white transition">ORGANISSIME, botany</a></li>
                <li><a href="#" className="hover:text-white transition">PLOUIF, fruity at a low price</a></li>
                <li><a href="#" className="hover:text-white transition">DERMOCARE, veterinary pharmacy</a></li>
                <li><a href="#" className="hover:text-white transition">EKINAT, natural equine</a></li>
                <li><a href="#" className="hover:text-white transition">BIOSPOTIX, repellent</a></li>
                <li><a href="#" className="hover:text-white transition">PHYTOCARE, food supplements</a></li>
                <li><a href="#" className="hover:text-white transition">SPA, for a targeted treatment ritual</a></li>
                <li><a href="#" className="hover:text-white transition">ERGOLANCE, ergonomic brushes</a></li>
                <li><a href="#" className="hover:text-white transition">TRIANDISES, official Ossobello reseller</a></li>
                <li><a href="#" className="hover:text-white transition">TOYS, exclusive West Paw retailer</a></li>
              </ul>
            </div>

            {/* Our Laboratory */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">Our Laboratory</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><Link href="/who-we" className="hover:text-white transition">Who are we?</Link></li>
                <li><a href="#" className="hover:text-white transition">Nos engagements</a></li>
                <li><Link href="/certifications" className="hover:text-white transition">Nos certifications</Link></li>
                <li><a href="#" className="hover:text-white transition">Our expert tips</a></li>
                <li><a href="#" className="hover:text-white transition">Our ingredients</a></li>
                <li><a href="#" className="hover:text-white transition">Join the loyalty program</a></li>
                <li><a href="#" className="hover:text-white transition">Write to us</a></li>
              </ul>
            </div>

            {/* Professional */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">Professional</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">Groomers & other Professionals</a></li>
                <li><a href="#" className="hover:text-white transition">Become one of our Ambassadors</a></li>
              </ul>
            </div>

            {/* Ambassador */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">Ambassador</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">To become a Biogance ambassador</a></li>
                <li><a href="#" className="hover:text-white transition">Join the Biogance partners</a></li>
                <li><a href="#" className="hover:text-white transition">Become an Ekinat partner</a></li>
              </ul>
            </div>

            {/* News */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-md">News</h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">News</a></li>
                <li><a href="#" className="hover:text-white transition">The latest expert advice</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center  gap-4 text-xs  text-[14px] text-black">
            <p>© 2025 Biogance. All rights reserved.</p>
            <div className="flex flex-wrap gap-5 justify-center ">
              <a href="#" className="hover:text-gray-900 transition">Conception</a>
              <a href="#" className="hover:text-gray-900 transition">Agency Fifteen</a>
              <a href="#" className="hover:text-gray-900 transition">FAQs</a>
              <a href="#" className="hover:text-gray-900 transition">Disclaimer for BIOGANCE</a>
              <a href="#" className="hover:text-gray-900 transition">Shipping & Return</a>
              <a href="#" className="hover:text-gray-900 transition">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}