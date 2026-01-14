import { useState } from 'react';
import { LuLayoutDashboard } from 'react-icons/lu';
import { TbNotes } from "react-icons/tb";
import { RxRocket } from "react-icons/rx";
import { FaRegHeart } from 'react-icons/fa';
import { IoLocationOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
import { MdLogout } from 'react-icons/md';
import { BsArrowBarLeft } from 'react-icons/bs';
import Link from 'next/link';

export function Sidebar({ activeItem, onItemClick }) {

  return (
    <aside className="w-80 bg-gray-100 flex flex-col p-10">
      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-5">
          <li>
           
              <button
                onClick={() => onItemClick('dashboard')}
                className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                  activeItem === 'dashboard'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#333333] hover:bg-gray-200'
                }`}
              >
                <LuLayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard</span>
              </button>
          
          </li>
          
          <li>
            <button
              onClick={() => onItemClick('orders')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'orders'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <TbNotes className="w-4 h-4 flex-shrink-0" />
              <span>My Orders</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => onItemClick('favorites')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'favorites'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <FaRegHeart className="w-4 h-4 flex-shrink-0" />
              <span>Favorites</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => onItemClick('loyalty')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'loyalty'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <RxRocket className="w-4 h-4 flex-shrink-0" />
              <span>Loyalty & Rewards</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => onItemClick('profile')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'profile'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <IoPersonOutline className="w-4 h-4 flex-shrink-0" />
              <span>User Profile</span>
            </button>
          </li>
          
          <li>
            
              <button
                onClick={() => onItemClick('pet')}
                className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                  activeItem === 'pet'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#333333] hover:bg-gray-200'
                }`}
              >
                <img
                  src="pet.svg"
                  alt=""
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeItem === 'pet' ? 'brightness-0 invert' : ''
                  }`}
                />
                <span>Pet Profile</span>
              </button>
           
          </li>
          
          <li>
            <button 
          onClick={() => onItemClick('addresses')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'addresses' 
                  ? 'bg-[#1A1A1A] text-white' 
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <IoLocationOutline className="w-4 h-4 flex-shrink-0" />
              <span>Addresses</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => onItemClick('settings')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'settings'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <IoSettingsOutline className="w-4 h-4 flex-shrink-0" />
              <span>Settings</span>
            </button>
          </li>
          
          <li>
            
              <button
                onClick={() => onItemClick('support')}
                className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                  activeItem === 'support'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#333333] hover:bg-gray-200'
                }`}
              >
                <img
                  src="refund.svg"
                  alt=""
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeItem === 'support' ? 'brightness-0 invert' : ''
                  }`}
                />
                <span>Support & Refunds</span>
              </button>
           
          </li>
        </ul>
      </nav>

      {/* Log Out at Bottom */}
      <div className="px-5 py-6 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md text-[#333333] hover:bg-gray-200 transition-colors duration-150">
          <BsArrowBarLeft className="w-4 h-4 flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}