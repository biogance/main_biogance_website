"use client"

import { LuLayoutDashboard } from 'react-icons/lu';
import { TbNotes } from "react-icons/tb";
import { RxRocket } from "react-icons/rx";
import { FaRegHeart } from 'react-icons/fa';
import { IoLocationOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
import { BsArrowBarLeft } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

export function Sidebar({ activeItem, onItemClick, onDelete }) {
  const { t } = useTranslation('sidebar');

  return (
    <div className="w-full lg:w-80 bg-gray-100 flex flex-col p-4 lg:p-10 lg:flex-shrink-0">
      {/* Menu Items */}
      <nav className="flex-1">
        <ul className="flex overflow-x-auto lg:flex-col lg:overflow-visible px-4 py-6 lg:px-0 lg:py-6 space-x-2 lg:space-x-0 lg:space-y-5">
          <li>
            <button
              onClick={() => onItemClick('dashboard')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'dashboard'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white  lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <LuLayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('dashboard')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('orders')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'orders'
                  ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white  lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <TbNotes className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('orders')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('favorites')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'favorites'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A]  lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <FaRegHeart className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('favorites')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('loyalty')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'loyalty'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A]  lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <RxRocket className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('loyalty')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('profile')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'profile'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A]  lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <IoPersonOutline className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('profile')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('pet')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'pet'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white lg:border-b-0'
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
              <span className="whitespace-nowrap">{t('petProfile')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('addresses')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'addresses'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A]  lg:text-white lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <IoLocationOutline className="w-4 h-4 flex-shrink-0" />
              <span>{t('addresses')}</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onItemClick('settings')}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
                activeItem === 'settings'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white  lg:border-b-0'
                  : 'text-[#333333] hover:bg-gray-200 '
              }`}
            >
              <IoSettingsOutline className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('settings')}</span>
            </button>
          </li>

       <li>
  <button
    onClick={() => onItemClick('support')}
    className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md transition-colors duration-150 ${
      activeItem === 'support'
        ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A] lg:bg-[#1A1A1A] lg:text-white lg:border-b-0'
        : 'text-[#333333] hover:bg-gray-200 '
    }`}
  >
    <img
      src="refund.svg"
      alt=""
      className={`w-4 h-4 flex-shrink-0 ${
        activeItem === 'support' ? 'brightness-0 invert' : ''
      }`}
    />
    <span className="flex-1 text-left break-words">{t('support')}</span>
  </button>
</li>

          {/* Logout - Only visible on small screens (as tab) */}
          <li className="lg:hidden">
            <button
               onClick={onDelete}
              className={`w-full flex items-center gap-3 cursor-pointer px-3 py-2.5  text-md transition-colors duration-150 ${
                activeItem === 'logout'
                  ? 'border-b-2 border-[#1A1A1A]  text-[#1A1A1A]'
                  : 'text-[#333333] hover:bg-gray-200'
              }`}
            >
              <BsArrowBarLeft className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('logout')}</span>
            </button>
          </li>

          {/* Logout - Only visible on large screens (same list, same spacing as other items) */}
          <li className="hidden lg:block">
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 text-md text-[#333333] hover:bg-gray-200 transition-colors duration-150"
            >
              <BsArrowBarLeft className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('logout')}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}