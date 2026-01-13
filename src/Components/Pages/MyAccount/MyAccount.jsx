"use client"

import { useState } from 'react';
import Navbar from "../Navbar"
import Footer from "../Footer"
import Link from "next/link"
import Image from "next/image"
import { Sidebar } from "./Sidebar"
import Dashboard from './Dashboard';
import MyOrder from './MyOrder';
import Favourite from './Favourite';


export default function MyAccount() {
    const [activeContent, setActiveContent] = useState('dashboard');

    const renderContent = () => {
        switch (activeContent) {
            case 'dashboard':
                return <Dashboard />;
            case 'orders':
                return <MyOrder />;
            case 'favorites':
                return <Favourite />;
            // Add cases for other components like 'orders' in the future
            default:
                return <Dashboard />;
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
             {/* Hero Section */}
                <div className="relative h-[500px] w-full">
                    <div className="absolute inset-0">
                        <img
                            src="account.svg"
                            alt="Background"
                            className="w-full h-full object-cover"
                        />

                    </div>

                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <h1 className="text-white mb-3 sm:mb-4 tracking-wide text-center text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight">
                            My Account
                        </h1>

                        <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                            <Link href="/" className="hover:underline">Home</Link>
                            <span>/</span>
                            <a className="underline">My Account</a>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 flex">
                    <Sidebar activeItem={activeContent} onItemClick={setActiveContent} />
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>

            <Footer />
        </>
    )
}
