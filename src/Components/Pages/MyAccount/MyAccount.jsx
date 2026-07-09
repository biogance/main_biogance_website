"use client"

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from "../Navbar"
import Footer from "../Footer"
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

    const [isHeaderTouchingNav, setIsHeaderTouchingNav] = useState(false);

    useEffect(() => {
        // Content sits flush against the navbar (no hero/gap), so as soon as
        // the page scrolls the content is being pulled up under the navbar.
        const handleScroll = () => {
            setIsHeaderTouchingNav(window.scrollY > 0);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            <Navbar isVideoVisible={!isHeaderTouchingNav} bgWhite={true} />

            <div className="bg-gray-100 flex flex-col lg:flex-row pt-[104px] lg:h-screen lg:overflow-hidden">
                <Sidebar activeItem={activeContent} onItemClick={handleSetActiveContent} onDelete={() => setIsLogoutModalOpen(true)} />
                <div className="flex-1 lg:h-full lg:overflow-y-scroll">
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