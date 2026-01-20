"use client"

import { LuLayoutDashboard } from 'react-icons/lu';
import { TbNotes } from "react-icons/tb";
import { RxRocket } from "react-icons/rx";
import { FaRegHeart } from 'react-icons/fa';
import { IoLocationOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
import { BsArrowBarLeft } from 'react-icons/bs';

export function Sidebar({ activeItem, onItemClick, onDelete }) {

  return (
    <div className="w-full lg:w-80 bg-gray-100 flex flex-col p-4 lg:p-10">
      {/* Menu Items */}
      <nav className="flex-1">
        <ul className="flex overflow-x-auto lg:flex-col lg:overflow-visible px-4 py-6 lg:px-0 lg:py-6 space-x-2 lg:space-x-0 lg:space-y-5">
          <li>
            <button
              onClick={() => onItemClick('dashboard')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'dashboard'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white lg:rounded-lg lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <LuLayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Dashboard</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('orders')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'orders'
                  ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white lg:rounded-lg lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <TbNotes className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">My Orders</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('favorites')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'favorites'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:rounded-lg lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <FaRegHeart className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Favorites</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('loyalty')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'loyalty'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:rounded-lg lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <RxRocket className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Loyalty & Rewards</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('profile')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'profile'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:rounded-lg lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <IoPersonOutline className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">User Profile</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('pet')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'pet'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:rounded-lg lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
               <img
                  src="pet.svg"
                  alt=""
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeItem === 'pet' ? 'brightness-0 invert' : ''
                  }`}
                />
              <span className="whitespace-nowrap">Pet Profile</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('addresses')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'addresses'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:rounded-lg lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <IoLocationOutline className="w-4 h-4 flex-shrink-0" />
              <span>Addresses</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('settings')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'settings'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white lg:rounded-lg lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <IoSettingsOutline className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Settings</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('support')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5  text-md transition-colors duration-150 ${
               activeItem === 'support'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white lg:rounded-lg lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <img
                  src="refund.svg"
                  alt=""
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeItem === 'support' ? 'brightness-0 invert' : ''
                  }`}
                  />
              <span className="whitespace-nowrap">Support & Refunds</span>
            </button>
          </li>

          {/* Logout - Only visible on small screens (as tab) */}
          <li className="lg:hidden">
            <button
               onClick={onDelete}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md transition-colors duration-150 ${
                activeItem === 'logout'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A]'
                  : 'text-[#333333] hover:bg-gray-200 rounded-lg'
              }`}
            >
              <BsArrowBarLeft className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Log Out</span>
            </button>
          </li>
        </ul> 
      </nav>

      {/* Logout - Only visible on large screens (outside nav) */}
      <div className="hidden lg:block px-5 py-6 border-t border-gray-200">
        <button 
            onClick={onDelete}
          className="w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-md text-[#333333] hover:bg-gray-200 transition-colors duration-150"
        >
          <BsArrowBarLeft className="w-4 h-4 flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
