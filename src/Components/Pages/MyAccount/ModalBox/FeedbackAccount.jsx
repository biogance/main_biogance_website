import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmDeletionModal from './ConfirmDeleteAccount';

export default function FeedbackForm({ onContinueToDelete, onClose }) {
  const { t } = useTranslation("myaccount");
  const [selectedReason, setSelectedReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [showFeedback, setShowFeedback] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const reasons = [
    t('feedbackForm.reasons.noLongerUse'),
    t('feedbackForm.reasons.betterPrices'),
    t('feedbackForm.reasons.betterAlternatives'),
    t('feedbackForm.reasons.sustainability'),
    t('feedbackForm.reasons.ingredientSafety'),
    t('feedbackForm.reasons.localBrands'),
    t('feedbackForm.reasons.preferInStore'),
    t('feedbackForm.reasons.privacy'),
    t('feedbackForm.reasons.other')
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full p-6 relative">
        {/* Yellow star decoration */}
        

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {t('feedbackForm.title')}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {t('feedbackForm.subtitle')}
        </p>

        {/* Radio options */}
        <div className="space-y-4 mb-8 rounded-lg">
          {reasons.map((reason, index) => (
            <div key={index}>
              <label className="flex items-center cursor-pointer group ">
                <input
                  type="radio"
                  name="feedback"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-5 h-5 text-black border-2 border-gray-300   cursor-pointer accent-black"
                />
                <span className="ml-3 text-gray-700 text-sm group-hover:text-gray-900">
                  {reason}
                </span>
              </label>
              
              {/* Show textarea when "Other" is selected */}
              {reason === t('feedbackForm.reasons.other') && selectedReason === t('feedbackForm.reasons.other') && (
                <div className="mt-3">
                  <p className="text-sm text-black mb-2">{t('feedbackForm.tellUsMore')}</p>
                  <textarea
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder={t('feedbackForm.otherPlaceholder')}
                    className="w-full px-3 py-4 bg-gray-100  rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('feedbackForm.goBackButton')}
          </button>
          <button 
            onClick={onContinueToDelete}
            className="flex-1 px-6 py-3 bg-[#D00416] text-white rounded-xl font-medium hover:bg-red-700 transition-colors cursor-pointer"
          >
            {t('feedbackForm.continueDeleteButton')}
          </button>
        </div>
      </div>
    </div>
  );
}