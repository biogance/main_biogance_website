import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose, IoPersonRemoveOutline, IoWarningOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Image from 'next/image';
import container from "../../../../../public/DeleteIllustration.svg";
import { BASE_URL } from '../../../API/API';
import { useRouter } from 'next/navigation';
import LoginModal from '../../Onboarding/Login';

export default function ConfirmDeletionModal({ onClose }) {
    const { t } = useTranslation("myaccount");
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const router = useRouter();
    // This modal is mounted/unmounted by its parent (no isOpen prop), so
    // the exit animation is played here before the real onClose actually
    // triggers that unmount — same pop-in/out lifecycle as LogoutModal.jsx.
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => { setIsClosing(false); onClose(); }, 250);
    };

    const getToken = () => {
        try {
            const loginData = JSON.parse(localStorage.getItem('LoginData') || '{}');
            return loginData?.data?.token || loginData?.token || '';
        } catch { return ''; }
    };

    const handleConfirmDelete = async () => {
        if (!password) { setError(t('confirmDeletion.currentPassword') + ' is required'); return; }
        setIsDeleting(true);
        setError('');
        try {
            const res = await fetch(`${BASE_URL}/user/auth/delete/account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (data?.status === true || data?.status === 'true') {
                localStorage.removeItem('LoginData');
                setIsDeleted(true);
            } else {
                setError(data?.action_message || data?.action || data?.message || 'Failed to delete account');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Deleted success state ──────────────────────────────────────────────
    if (isDeleted) {
        return (
            <>
                <div
                    className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
                    onClick={handleClose}
                >
                    <div
                        className={`bg-white w-full max-w-md shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Dark header */}
                        <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 py-5 flex items-center gap-3 border-b border-white/5 overflow-hidden">
                            <IoCheckmarkCircleOutline className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 text-white/[0.05]" />
                            <div className="relative w-9 h-9 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
                                <IoCheckmarkCircleOutline className="w-4 h-4 text-white" />
                            </div>
                            <div className="relative min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
                                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/40">
                                        {t("settings.title")}
                                    </span>
                                </div>
                                <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-white">
                                    {t('confirmDeletion.deleted.title')}
                                </h2>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">
                            <div className="flex justify-center mb-5">
                                <Image src={container} alt="" className="w-32 h-32 object-contain" />
                            </div>
                            <p className="text-[13px] text-[#5c5a54] text-center leading-relaxed mb-6">
                                {t('confirmDeletion.deleted.message')}
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowLogin(true)}
                                    className="w-full flex items-center justify-center py-3.5 text-[13.5px] font-semibold tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px active:translate-y-0 transition-all duration-200 cursor-pointer"
                                >
                                    {t('confirmDeletion.deleted.rejoinButton')}
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
                                >
                                    {t('confirmDeletion.deleted.browseGuestButton')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
            </>
        );
    }

    // ── Confirm deletion form ──────────────────────────────────────────────
    return (
        <div
            className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
            onClick={handleClose}
        >
            <div
                className={`bg-white w-full max-w-lg shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Dark header */}
                <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 py-5 flex items-center gap-3 border-b border-white/5 overflow-hidden">
                    <IoPersonRemoveOutline className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 text-white/[0.05]" />
                    <div className="relative w-9 h-9 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
                        <IoPersonRemoveOutline className="w-4 h-4 text-white" />
                    </div>
                    <div className="relative min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/40">
                                {t("settings.title")}
                            </span>
                        </div>
                        <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-white">
                            {t('confirmDeletion.title')}
                        </h2>
                        <p className="text-[11.5px] text-white/40 mt-0.5 leading-snug">
                            {t('confirmDeletion.subtitle')}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        aria-label="Close"
                        className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center w-8 h-8 border border-white/15 text-white/60 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
                    >
                        <IoClose size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {/* Warning box */}
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 mb-5">
                        <IoWarningOutline className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-600 leading-relaxed">
                            {t('settings.deleteAccount.warning')} {t('settings.deleteAccount.irreversible')}
                        </p>
                    </div>

                    {/* Password field */}
                    <div className="mb-5">
                        <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">
                            {t('confirmDeletion.currentPassword')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmDelete()}
                                placeholder={t('confirmDeletion.passwordPlaceholder')}
                                className={`w-full px-4 py-3 pr-12 text-[14px] text-[#0b0b0a] border outline-none placeholder:text-[#aaa] transition-colors duration-200 ${
                                    error ? 'border-red-400' : 'border-black/10 focus:border-black/30'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8880] hover:text-[#0b0b0a] transition-colors cursor-pointer"
                            >
                                {showPassword
                                    ? <AiOutlineEye className="w-5 h-5" />
                                    : <AiOutlineEyeInvisible className="w-5 h-5" />
                                }
                            </button>
                        </div>
                        {error && (
                            <p className="flex items-center gap-1.5 text-red-500 text-[12px] mt-1.5">
                                <IoWarningOutline className="w-3.5 h-3.5 shrink-0" />
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-semibold tracking-[0.02em] text-white bg-gradient-to-b from-red-500 to-red-700 border border-red-700 hover:from-red-600 hover:to-red-800 hover:shadow-[0_14px_28px_-10px_rgba(220,38,38,.6)] hover:-translate-y-px active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
                        >
                            {isDeleting && (
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            )}
                            {isDeleting ? 'Deleting...' : t('confirmDeletion.confirmButton')}
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
                        >
                            {t('confirmDeletion.goBackButton')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
