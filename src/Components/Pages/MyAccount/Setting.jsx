"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { BASE_URL } from '../../API/API';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiLock, FiEye, FiEyeOff, FiMail, FiTrash2 } from 'react-icons/fi';
import { MdLockOutline, MdOutlineWarningAmber } from 'react-icons/md';
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';
import DeleteMyAccount from './ModalBox/DeleteMyAccount';
import FeedbackAccount from './ModalBox/FeedbackAccount';
import ConfirmDeletionModal from './ModalBox/ConfirmDeleteAccount';

// Tab entries — one panel visible at a time, same underline-tab shape as
// Favourite.jsx's Products/Blogs/Breeds switcher.
const TABS = [
  { id: 'password', label: 'Password', icon: MdLockOutline },
  { id: 'notifications', label: 'Notifications', icon: FiMail },
  { id: 'danger', label: 'Danger Zone', icon: FiTrash2 },
];

// A glossy icon badge — same family used for every icon in the account
// section (Dashboard's KPIs, PetProfile's rows, Address's tiles).
function IconBadge({ icon: Icon, danger = false }) {
  return (
    <span
      className={`relative grid place-items-center w-11 h-11 shrink-0 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] bg-gradient-to-b ${
        danger ? "from-red-500 to-red-700" : "from-[#403e38] to-[#0b0b0a]"
      }`}
    >
      <Icon
        className="w-[19px] h-[19px]"
        style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
      />
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    </span>
  );
}

// A card's header — icon badge + title/subtitle, same shape everywhere.
function SectionHeader({ icon, title, subtitle, danger = false }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 sm:px-8 sm:py-6 border-b border-black/10">
      <IconBadge icon={icon} danger={danger} />
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold tracking-[0.01em] text-[#0b0b0a]">{title}</h2>
        <p className="mt-0.5 text-[13px] text-[#8a8880]">{subtitle}</p>
      </div>
    </div>
  );
}

// A password field with its own icon compartment (matching UserProfile's
// text fields) and a show/hide toggle. A gradient underline grows in on
// focus, same accent used across the account section.
function PasswordField({ label, placeholder, value, onChange, error, visible, onToggleVisibility }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">
        {label}
      </label>
      <div
        className={`relative flex items-stretch bg-white border shadow-[inset_0_1px_3px_rgba(0,0,0,.04)] transition-colors overflow-hidden ${
          error ? "border-red-500 ring-2 ring-red-100" : focused ? "border-black/40" : "border-black/10"
        }`}
      >
        <span className="grid place-items-center w-11 shrink-0 border-r border-black/10 bg-black/[0.02] text-[#8a8880]">
          <FiLock className="w-[17px] h-[17px]" />
        </span>
        <input
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-w-0 h-[48px] px-4 bg-transparent focus:outline-none text-[14.5px] text-[#0b0b0a] placeholder:text-[#8a8880]"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="px-3.5 text-[#8a8880] hover:text-[#0b0b0a] transition-colors cursor-pointer"
        >
          {visible ? <FiEye className="w-[17px] h-[17px]" /> : <FiEyeOff className="w-[17px] h-[17px]" />}
        </button>
        <span
          aria-hidden="true"
          className={`absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
            focused ? "w-full" : "w-0"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

// One line in the live password checklist — filled dot once its rule is
// satisfied, so the side panel updates as the person types instead of
// just listing static requirements.
function ChecklistItem({ met, children }) {
  return (
    <li className="flex items-center gap-2 text-[12.5px]">
      {met ? (
        <IoCheckmarkCircle className="w-4 h-4 shrink-0 text-emerald-600" />
      ) : (
        <IoEllipseOutline className="w-4 h-4 shrink-0 text-black/20" />
      )}
      <span className={met ? "text-[#0b0b0a]" : "text-[#8a8880]"}>{children}</span>
    </li>
  );
}

// One notification preference — title/description left, toggle right, a
// hairline under each row instead of a boxed grid cell.
function NotificationRow({ title, description, checked, onChange, last = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-5 ${last ? "" : "border-b border-black/[0.06]"}`}>
      <div className="min-w-0 pr-4">
        <h3 className="text-[14px] font-semibold text-[#0b0b0a] mb-1">{title}</h3>
        <p className="text-[12.5px] text-[#8a8880] leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">
        <CustomToggle checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

// Uiverse.io (Praashoo7) switch — recoloured to this app's black/white
// palette. Kept as scoped styled-jsx since the inset shadow + thin
// rotating bar knob aren't practical as Tailwind utilities.
const CustomToggle = ({ checked, onChange }) => {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider" />
      <style jsx>{`
        .switch {
          font-size: 13px;
          position: relative;
          display: inline-block;
          width: 3.5em;
          height: 2em;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #e5e5e0;
          box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.15);
          transition: 0.4s;
        
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 1.4em;
          width: 0.12em;
          border-radius: 0px;
          left: 0.3em;
          bottom: 0.3em;
          background-color: white;
          transition: 0.4s;
        }
        input:checked + .slider {
          background-color: #0b0b0a;
          box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.6);
        }
        input:checked + .slider:before {
          transform: translateX(2.8em) rotate(360deg);
        }
      `}</style>
    </label>
  );
};

export default function Settings() {
  const { t } = useTranslation('myaccount');
  const { t: tSidebar } = useTranslation('sidebar');
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    loyaltyProgram: true,
    refundStatus: true,
    promotions: true,
    productRecommendations: false,
    tipsArticles: false
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  // ─── Tabs — Password / Notifications / Danger Zone, one panel shown at
  // a time. Sliding underline indicator measured off the active button,
  // same approach as Favourite.jsx's tab switcher. ─────────────────────
  const [activeTab, setActiveTab] = useState('password');
  const tabRefs = useRef({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  const measureTabIndicator = () => {
    const el = tabRefs.current[activeTab];
    if (el) setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  };

  useLayoutEffect(measureTabIndicator, [activeTab]);

  useEffect(() => {
    window.addEventListener('resize', measureTabIndicator);
    return () => window.removeEventListener('resize', measureTabIndicator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePasswordChange = (field, value) => {
    setPasswords({
      ...passwords,
      [field]: value
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const toggleNotification = (field) => {
    setNotifications({
      ...notifications,
      [field]: !notifications[field]
    });
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const getToken = () => {
    try {
      const loginData = JSON.parse(localStorage.getItem('LoginData') || '{}');
      return loginData?.data?.token || loginData?.token || '';
    } catch { return ''; }
  };

  const validatePasswords = () => {
    const newErrors = { current: '', new: '', confirm: '' };
    let isValid = true;

    if (!passwords.current) {
      newErrors.current = t('settings.updatePassword.errors.currentRequired');
      isValid = false;
    } else if (passwords.current.length < 6) {
      newErrors.current = t('settings.updatePassword.errors.currentIncorrect');
      isValid = false;
    }

    if (!passwords.new) {
      newErrors.new = t('settings.updatePassword.errors.newRequired');
      isValid = false;
    } else if (passwords.new.length < 6) {
      newErrors.new = t('settings.updatePassword.errors.newTooShort');
      isValid = false;
    }

    if (!passwords.confirm) {
      newErrors.confirm = t('settings.updatePassword.errors.confirmRequired');
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = t('settings.updatePassword.errors.confirmMismatch');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/user/auth/change/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          old_password: passwords.current,
          new_password: passwords.new,
        }),
      });
      const data = await res.json();
      const decodeHtml = (str) => str?.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'") || '';
      if (data?.status === true || data?.status === 'true') {
        setPasswords({ current: '', new: '', confirm: '' });
        toast.success(decodeHtml(data?.action) || 'Password updated successfully');
      } else {
        const errMsg = decodeHtml(data?.action_message) || decodeHtml(data?.action) || decodeHtml(data?.message) || t('settings.updatePassword.genericError');
        toast.error(errMsg);
        setErrors(prev => ({ ...prev, current: errMsg }));
      }
    } catch (e) {
      toast.error(t('settings.updatePassword.genericError'));
      setErrors(prev => ({ ...prev, current: t('settings.updatePassword.genericError') }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openFeedbackModal = () => {
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
  };

  const openConfirmDeleteModal = () => {
    setIsConfirmDeleteModalOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false);
  };

  return (
    // No min-h-screen — MyAccount.jsx's wrapper already provides a full
    // viewport (navbar clearance included); stacking another one here
    // forced this tab an extra viewport tall even on short/empty content,
    // causing a page scrollbar on the empty state at any screen size or
    // zoom level.
    <div className="bg-[#f3f3f3]">
      {/* mt-2 on mobile, not mt-9 — that was stacking on top of
          Sidebar.jsx's own bottom padding on the mobile tab row, leaving a
          big empty gap before this card started. md:mt-9 keeps desktop
          unchanged, same pattern as Dashboard.jsx's mt-2 md:mt-10 fix. */}
      <div className="p-4 mt-2 md:mt-9 sm:p-6 md:p-8 max-w-10xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
            {tSidebar('groupAccount')}
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
            {t('settings.title')}
          </h1>
          <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="relative flex items-center gap-6 sm:gap-8 border-b border-black/10 mb-8 md:mb-10 overflow-x-auto">
          <span
            className="absolute bottom-0 h-[2px] bg-[#0b0b0a] transition-[left,width] duration-300 ease-out"
            style={{ left: tabIndicator.left, width: tabIndicator.width }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 flex items-center gap-2 text-[13.5px] sm:text-[14px] font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? (tab.id === 'danger' ? 'text-red-600' : 'text-[#0b0b0a]')
                  : 'text-[#8a8880] hover:text-[#0b0b0a]'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'password' && (
          <div className="bg-white border border-black/10">
            <SectionHeader
              icon={MdLockOutline}
              title={t('settings.updatePassword.title')}
              subtitle={t('settings.updatePassword.description')}
            />

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 flex flex-col gap-5">
                <PasswordField
                  label={t('settings.updatePassword.currentPassword')}
                  placeholder={t('settings.updatePassword.currentPasswordPlaceholder')}
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  error={errors.current}
                  visible={showPassword.current}
                  onToggleVisibility={() => togglePasswordVisibility('current')}
                />
                <PasswordField
                  label={t('settings.updatePassword.newPassword')}
                  placeholder={t('settings.updatePassword.newPasswordPlaceholder')}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  error={errors.new}
                  visible={showPassword.new}
                  onToggleVisibility={() => togglePasswordVisibility('new')}
                />
                <PasswordField
                  label={t('settings.updatePassword.confirmNewPassword')}
                  placeholder={t('settings.updatePassword.confirmNewPasswordPlaceholder')}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  error={errors.confirm}
                  visible={showPassword.confirm}
                  onToggleVisibility={() => togglePasswordVisibility('confirm')}
                />

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-1">
                    <button className="px-6 py-3 cursor-pointer text-[#0b0b0a] text-[13.5px] font-medium tracking-[0.02em] bg-white border border-black/15 hover:bg-black/[0.03] transition-colors">
                      {t('settings.updatePassword.cancel')}
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={isUpdating}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 cursor-pointer bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                    >
                      {isUpdating ? t('settings.updatePassword.updating') : t('settings.updatePassword.updatePassword')}
                    </button>
                  </div>
                </div>

                {/* Live checklist + heads-up notes — was a plain banner below the fields, now a side panel that reacts as you type */}
                <div className="xl:col-span-1">
                  <div className="bg-black/[0.02] border border-black/10 p-5">
                    <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8a8880] mb-3">
                      {t('settings.updatePassword.note')}
                    </p>
                    <ul className="space-y-2 mb-5">
                      <ChecklistItem met={passwords.new.length >= 6}>
                        At least 6 characters
                      </ChecklistItem>
                      <ChecklistItem met={passwords.confirm.length > 0 && passwords.new === passwords.confirm}>
                        Passwords match
                      </ChecklistItem>
                    </ul>
                    <div className="pt-4 border-t border-black/10">
                      <ul className="text-[12.5px] text-[#5c5a54] space-y-1.5 ml-4">
                        <li className="list-disc">{t('settings.updatePassword.note1')}</li>
                        <li className="list-disc">{t('settings.updatePassword.note2')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white border border-black/10">
            <SectionHeader
              icon={FiMail}
              title={t('settings.emailNotifications.title')}
              subtitle={t('settings.emailNotifications.description')}
            />

            <div className="px-6 sm:px-8">
              <NotificationRow
                title={t('settings.emailNotifications.orderUpdates.title')}
                description={t('settings.emailNotifications.orderUpdates.description')}
                checked={notifications.orderUpdates}
                onChange={() => toggleNotification('orderUpdates')}
              />
              <NotificationRow
                title={t('settings.emailNotifications.loyaltyProgram.title')}
                description={t('settings.emailNotifications.loyaltyProgram.description')}
                checked={notifications.loyaltyProgram}
                onChange={() => toggleNotification('loyaltyProgram')}
              />
              <NotificationRow
                title={t('settings.emailNotifications.refundStatus.title')}
                description={t('settings.emailNotifications.refundStatus.description')}
                checked={notifications.refundStatus}
                onChange={() => toggleNotification('refundStatus')}
              />
              <NotificationRow
                title={t('settings.emailNotifications.promotions.title')}
                description={t('settings.emailNotifications.promotions.description')}
                checked={notifications.promotions}
                onChange={() => toggleNotification('promotions')}
              />
              <NotificationRow
                title={t('settings.emailNotifications.productRecommendations.title')}
                description={t('settings.emailNotifications.productRecommendations.description')}
                checked={notifications.productRecommendations}
                onChange={() => toggleNotification('productRecommendations')}
              />
              <NotificationRow
                title={t('settings.emailNotifications.tipsArticles.title')}
                description={t('settings.emailNotifications.tipsArticles.description')}
                checked={notifications.tipsArticles}
                onChange={() => toggleNotification('tipsArticles')}
                last
              />
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="bg-white border border-red-200">
            <SectionHeader
              icon={FiTrash2}
              title={t('settings.deleteAccount.title')}
              subtitle={t('settings.deleteAccount.irreversible')}
              danger
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 sm:px-8 bg-red-50/60">
              <div className="flex items-start gap-3">
                <MdOutlineWarningAmber className="w-5 h-5 shrink-0 text-red-600" />
                <p className="text-[13.5px] text-red-700 leading-relaxed">
                  {t('settings.deleteAccount.warning')}
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 cursor-pointer bg-gradient-to-b from-red-500 to-red-700 text-white text-[13.5px] font-medium tracking-[0.02em] border border-red-700 shadow-[0_14px_30px_-14px_rgba(220,38,38,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(220,38,38,.65)] hover:-translate-y-px whitespace-nowrap"
              >
                {t('settings.deleteAccount.deleteButton')}
              </button>
            </div>
          </div>
        )}
      </div>

      {isDeleteModalOpen && <DeleteMyAccount isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onFeedback={openFeedbackModal} />}
      {isFeedbackModalOpen && <FeedbackAccount isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} onContinueToDelete={openConfirmDeleteModal} />}
      {isConfirmDeleteModalOpen && <ConfirmDeletionModal onClose={closeConfirmDeleteModal} />}
    </div>
  );
}
