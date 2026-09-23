"use client"

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";
import Navbar from "../Navbar"
import Footer from "../Footer"
import { Sidebar, MobileAccountNav, ACCOUNT_NAV_ITEMS } from "./Sidebar"
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
    const { t } = useTranslation("sidebar");
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
    const asideRef = useRef(null);

    useEffect(() => {
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

    const activeLabel = t(
        (ACCOUNT_NAV_ITEMS.find((i) => i.key === activeContent) || ACCOUNT_NAV_ITEMS[0]).label,
    );

    return (
        <>
            <Navbar isVideoVisible={!isHeaderTouchingNav} bgWhite={true} />
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes acRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes acSide { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
                        .ac-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
                        .ac-noscroll::-webkit-scrollbar { display: none; }
                        @media (prefers-reduced-motion: reduce) { .ac-anim { animation: none !important; } }
                    `,
                }}
            />

            
            <div className="bg-[#f3f3f3] min-h-screen pt-[104px]">
                <MobileAccountNav activeItem={activeContent} onItemClick={handleSetActiveContent} onDelete={() => setIsLogoutModalOpen(true)} />

                <div className="w-full flex flex-col lg:flex-row lg:items-start">
                    <aside
                        ref={asideRef}
                        className="ac-anim hidden lg:flex w-[300px] xl:w-[320px] shrink-0 sticky top-[104px] h-[calc(100vh-104px)]"
                        style={{ animation: "acSide .6s cubic-bezier(.2,.7,.2,1) backwards" }}
                    >
                        <Sidebar activeItem={activeContent} onItemClick={handleSetActiveContent} onDelete={() => setIsLogoutModalOpen(true)} />
                    </aside>

                    <main className="flex-1 min-w-0 lg:px-8 xl:px-12 lg:pt-8 pb-16 lg:pb-20">
                        <div className="mx-auto w-full max-w-[1480px]">
                        <nav
                            aria-label="Breadcrumb"
                            className="hidden lg:flex items-center gap-2.5 px-6 pb-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#8a8880]"
                        >
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="bg-transparent border-0 p-0 cursor-pointer text-inherit uppercase tracking-[inherit] font-semibold hover:text-[#0b0b0a] transition-colors"
                            >
                                {t('home')}
                            </button>
                            <span aria-hidden="true">/</span>
                            <button
                                type="button"
                                onClick={() => handleSetActiveContent('dashboard')}
                                className="bg-transparent border-0 p-0 cursor-pointer text-inherit uppercase tracking-[inherit] font-semibold hover:text-[#0b0b0a] transition-colors"
                            >
                                {t('myAccount')}
                            </button>
                            <span aria-hidden="true">/</span>
                            <span aria-current="page" className="text-[#0b0b0a]">{activeLabel}</span>
                        </nav>

                        {/* Section content — re-mounts (and rises in) on every tab switch */}
                        <div
                            key={activeContent}
                            className="ac-anim"
                            style={{ animation: "acRise .55s cubic-bezier(.2,.7,.2,1) backwards" }}
                        >
                            {renderContent()}
                        </div>
                        </div>
                    </main>
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
