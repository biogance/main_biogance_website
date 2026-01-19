import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiMail, FiTrash2 } from 'react-icons/fi';
import { MdLockOutline } from 'react-icons/md';
import DeleteMyAccount from './ModalBox/DeleteMyAccount';
import FeedbackAccount from './ModalBox/FeedbackAccount';
import ConfirmDeletionModal from './ModalBox/ConfirmDeleteAccount';

// Custom Toggle Component
const CustomToggle = ({ checked, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`relative h-6 px-1 py-1 w-12 rounded-full transition-all duration-500 ease-out ${
          checked ? 'bg-black' : 'bg-gray-300'
        }`}
        style={{ 
          aspectRatio: '212.4992/84.4688',
         
        }}
      >
        <svg
          viewBox="0 0 212.4992 84.4688"
          className="h-full"
          style={{ overflow: 'visible' }}
        >
          <path
            pathLength="360"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white transition-all duration-500 ease-out`}
            style={{
              strokeDasharray: '136 224',
              strokeDashoffset: checked ? '180' : '0',
              transformOrigin: 'center',
              transform: checked ? 'scaleY(-1)' : 'scaleY(1)',
            }}
            d="M 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 A 42.24 42.24 90 0 0 84.4992 42.2496 A 42.24 42.24 90 0 0 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 L 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 A 42.24 42.24 90 0 0 128 42.2496 A 42.24 42.24 90 0 0 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 L 42.2496 0"
          />
        </svg>
      </div>
    </label>
  );
};

export default function Settings() {
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

  const validatePasswords = () => {
    const newErrors = {
      current: '',
      new: '',
      confirm: ''
    };

    let isValid = true;

    if (!passwords.current) {
      newErrors.current = 'Current password is required.';
      isValid = false;
    } else if (passwords.current.length < 6) {
      newErrors.current = 'Current password is incorrect.';
      isValid = false;
    }

    if (!passwords.new) {
      newErrors.new = 'New password is required.';
      isValid = false;
    } else if (passwords.new === passwords.current) {
      newErrors.new = 'New password must differ from current.';
      isValid = false;
    } else if (passwords.new.length < 8) {
      newErrors.confirm = 'At least 8 characters, 1 number, 1 special character';
      isValid = false;
    } else {
      const hasNumber = /\d/.test(passwords.new);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new);
      
      if (!hasNumber || !hasSpecial) {
        newErrors.confirm = 'At least 8 characters, 1 number, 1 special character';
        isValid = false;
      }
    }

    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your new password.';
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'At least 8 characters, 1 number, 1 special character';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdatePassword = () => {
    if (validatePasswords()) {
      console.log('Password validation passed. Updating password...');
    } else {
      console.log('Password validation failed');
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
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">Settings</h1>
          <p className="text-gray-600">Manage your account preferences.</p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-start gap-3 mb-6">
            <MdLockOutline className="text-gray-700 mt-3" size={20} />
            <div>
              <h2 className="font-medium text-black">Update Password</h2>
              <p className="text-sm text-gray-600">Keep your account secure by setting a new password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-black text-sm mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  placeholder="eg: *********"
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  className={`w-full px-4 text-black py-3 bg-gray-100 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 pr-10 ${
                    errors.current ? 'border-red-500 bg-red-50' : 'border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword.current ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
              </div>
              {errors.current && (
                <p className="text-red-500 text-sm mt-1">{errors.current}</p>
              )}
            </div>

            <div>
              <label className="block text-black text-sm mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  placeholder="eg:*********"
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  className={`w-full text-black px-4 py-3 bg-gray-100 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 pr-10 ${
                    errors.new ? 'border-red-500 bg-red-50' : 'border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword.new ? <FiEye size={18} /> :  <FiEyeOff size={18} />}
                </button>
              </div>
              {errors.new && (
                <p className="text-red-500 text-sm mt-1">{errors.new}</p>
              )}
            </div>

            <div>
              <label className="block text-black text-sm mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  placeholder="eg: Abc112z#"
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  className={`w-full text-black px-4 py-3 bg-gray-100 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400 pr-10 ${
                    errors.confirm ? 'border-red-500 bg-red-50' : 'border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword.confirm ? <FiEye size={18} /> :  <FiEyeOff size={18} />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
              )}
            </div>
          </div>

          <div className="bg-[#E9F9F0] rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-black mb-2">Before you continue, please note:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li className="list-disc text-black">You'll be logged out from all other devices.</li>
              <li className="list-disc text-black">You'll need to sign in again with your new password.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button className="px-6 py-3 cursor-pointer text-black border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUpdatePassword}
              className="px-6 py-3 cursor-pointer bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-start gap-3 mb-6">
            <FiMail className="text-gray-700 mt-3 w-16 h-16 sm:w-5 sm:h-5" />

            <div>
              <h2 className="font-medium text-black">Email Notification Preferences</h2>
              <p className="text-sm text-gray-600">
                Tell us what you'd like to hear from us. Stay updated with order alerts, promotions, and pet care tips — or keep it quiet. It's totally up to you.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start justify-between rounded-xl p-3 mb-6 border border-gray-200">
                <div>
                  <h3 className="font-medium text-black mb-1">Order Updates</h3>
                  <p className="text-sm text-gray-600">Get important info like order confirmation, shipping, and delivery status. (Required)</p>
                </div>
                <CustomToggle
                  checked={notifications.orderUpdates}
                  onChange={() => toggleNotification('orderUpdates')}
                />
              </div>

              <div className="flex items-start justify-between rounded-xl p-3 mb-6 border border-gray-200">
                <div>
                  <h3 className="font-medium text-black mb-1">Loyalty Program Updates</h3>
                  <p className="text-sm text-gray-600">Points balance and reward opportunities</p>
                </div>
                <CustomToggle
                  checked={notifications.loyaltyProgram}
                  onChange={() => toggleNotification('loyaltyProgram')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start justify-between rounded-xl p-3 mb-6 border border-gray-200">
                <div>
                  <h3 className="font-medium text-black mb-1">Refund Status</h3>
                  <p className="text-sm text-gray-600">Stay updated on the progress of your refund request</p>
                </div>
                <CustomToggle
                  checked={notifications.refundStatus}
                  onChange={() => toggleNotification('refundStatus')}
                />
              </div>

              <div className="flex items-start justify-between rounded-xl p-3 mb-6 border border-gray-200">
                <div>
                  <h3 className="font-medium text-black mb-1">Promotions & Offers</h3>
                  <p className="text-sm text-gray-600">Receive special deals, discounts, and exclusive member offers</p>
                </div>
                <CustomToggle
                  checked={notifications.promotions}
                  onChange={() => toggleNotification('promotions')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start justify-between rounded-xl p-3 mb-6 border border-gray-200">
                <div>
                  <h3 className="font-medium text-black mb-1">Product Recommendations</h3>
                  <p className="text-sm text-gray-600">Get personalized suggestions on your pet's needs and past purchases</p>
                </div>
                <CustomToggle
                  checked={notifications.productRecommendations}
                  onChange={() => toggleNotification('productRecommendations')}
                />
              </div>

              <div className="flex items-start justify-between rounded-xl p-3 mb-6 border border-gray-200">
                <div>
                  <h3 className="font-medium text-black mb-1">Tips & Articles</h3>
                  <p className="text-sm text-gray-600">Receive expert advice, grooming guides, and pet wellness content</p>
                </div>
                <CustomToggle
                  checked={notifications.tipsArticles}
                  onChange={() => toggleNotification('tipsArticles')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 rounded-xl mb-6 border border-gray-200">
          <div className="flex items-start gap-1 mb-4">
            <FiTrash2 className="text-gray-700 mt-1" size={20} />
            <div className="flex-1">
              <h2 className="font-medium text-black mb-4">Delete My Account</h2>
              
             <div className="bg-red-50 rounded-xl p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm font-semibold text-red-600">
                    <span className="font-semibold">Deleting your account will remove all your data permanently.</span>
                    <br />
                    This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto sm:flex-shrink-0 px-6 py-3 cursor-pointer bg-[#D00416] text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    Delete Elegance Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {isDeleteModalOpen && <DeleteMyAccount isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onFeedback={openFeedbackModal} />}
    {isFeedbackModalOpen && <FeedbackAccount isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} onContinueToDelete={openConfirmDeleteModal} />}
    {isConfirmDeleteModalOpen && <ConfirmDeletionModal onClose={closeConfirmDeleteModal} />}
     </div>
  );
}
