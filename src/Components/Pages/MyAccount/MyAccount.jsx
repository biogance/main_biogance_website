"use client"

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from "../Navbar"
import Footer from "../Footer"
import Link from "next/link"
import { Sidebar } from "./Sidebar"
import Dashboard from './Dashboard';
import MyOrder from './MyOrder';
import Favourite from './Favourite';
import Loyalty from './Loyalty';
import UserProfile from './UserProfile';
import PetProfile from './PetProfile';
import Address from './Address';
import Settings from './Setting';
import Support from './Support/Support';
import LogoutModal from './ModalBox/LogoutModal';


export default function MyAccount() {
    const { t } = useTranslation("myaccount");
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Valid tabs ki list
    const validTabs = ['dashboard', 'orders', 'favorites', 'loyalty', 'profile', 'pet', 'addresses', 'settings', 'support'];
    
    // Initial state mein hi URL se tab get karo
    const getInitialTab = () => {
        const tab = searchParams.get('tab');
        return tab && validTabs.includes(tab) ? tab : 'dashboard';
    };
    
    const [activeContent, setActiveContent] = useState(getInitialTab);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // URL change hone par update karo (optional, agar browser back/forward use karo)
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && validTabs.includes(tab) && tab !== activeContent) {
            setActiveContent(tab);
        }
    }, [searchParams]);

    const handleSetActiveContent = (content) => {
        setActiveContent(content);
        const params = new URLSearchParams(searchParams);
        params.set('tab', content);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleOpenChat = (ticket) => {
        setSelectedTicket(ticket);
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setSelectedTicket(null); 
    };

    const renderContent = () => {
        switch (activeContent) {
            case 'dashboard':
                return <Dashboard />;
            case 'orders':
                return <MyOrder />;
            case 'favorites':
                return <Favourite />;
            case 'loyalty':
                return <Loyalty/>;
            case 'profile':
                return <UserProfile/>;
            case 'pet':
                return <PetProfile/>;
            case 'addresses':
                return <Address/>;
            case 'settings':
                return <Settings/>;
            case 'support':
                return <Support onOpenChat={handleOpenChat} />;
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
                        {t('common.myAccount')}
                    </h1>

                    <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                        <Link href="/" className="hover:underline">{t('common.home')}</Link>
                        <span>/</span>
                        <a className="underline">{t('common.myAccount')}</a>
                    </div>
                </div>
            </div>

            <div className="bg-gray-100 flex flex-col lg:flex-row">
                <Sidebar activeItem={activeContent} onItemClick={handleSetActiveContent} onDelete={() => setIsLogoutModalOpen(true)} />
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>

            <Footer />
            <LogoutModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </>
    )
}