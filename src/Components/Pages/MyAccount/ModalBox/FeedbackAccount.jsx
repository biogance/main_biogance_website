import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose, IoChatbubbleOutline } from 'react-icons/io5';

export default function FeedbackForm({ onContinueToDelete, onClose }) {
  const { t } = useTranslation("myaccount");
  const [selectedReason, setSelectedReason] = useState('');
  const [otherText, setOtherText] = useState('');
  // This modal is mounted/unmounted by its parent (no isOpen prop), so the
  // exit animation is played here before the real onClose actually
  // triggers that unmount — same pop-in/out lifecycle as LogoutModal.jsx.
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (after) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      after?.();
    }, 250);
  };

  const reasons = [
    t('feedbackForm.reasons.noLongerUse'),
    t('feedbackForm.reasons.betterPrices'),
    t('feedbackForm.reasons.betterAlternatives'),
    t('feedbackForm.reasons.sustainability'),
    t('feedbackForm.reasons.ingredientSafety'),
    t('feedbackForm.reasons.localBrands'),
    t('feedbackForm.reasons.preferInStore'),
    t('feedbackForm.reasons.privacy'),
    t('feedbackForm.reasons.other'),
  ];

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={() => handleClose()}
    >
      <div
        className={`bg-white w-full max-w-lg shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark header */}
        <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 py-5 flex items-center gap-3 border-b border-white/5 overflow-hidden">
          <IoChatbubbleOutline className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 text-white/[0.05]" />
          <div className="relative w-9 h-9 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
            <IoChatbubbleOutline className="w-4 h-4 text-white" />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/40">
                {t("settings.title")}
              </span>
            </div>
            <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-white">
              {t('feedbackForm.title')}
            </h2>
            <p className="text-[11.5px] text-white/40 mt-0.5 leading-snug">
              {t('feedbackForm.subtitle')}
            </p>
          </div>
          <button
            onClick={() => handleClose()}
            aria-label="Close"
            className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center w-8 h-8 border border-white/15 text-white/60 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
          >
            <IoClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            {reasons.map((reason, index) => (
              <div key={index}>
                <label
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border transition-colors duration-150 ${
                    selectedReason === reason
                      ? 'border-[#0b0b0a] bg-[#0b0b0a]'
                      : 'border-black/8 bg-white hover:border-black/20 hover:bg-black/[0.02]'
                  }`}
                >
                  {/* Custom radio */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    selectedReason === reason ? 'border-white' : 'border-black/25'
                  }`}>
                    {selectedReason === reason && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="feedback"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="hidden"
                  />
                  <span className={`text-[13.5px] leading-snug ${
                    selectedReason === reason ? 'text-white font-medium' : 'text-[#3a3835]'
                  }`}>
                    {reason}
                  </span>
                </label>

                {/* Other textarea */}
                {reason === t('feedbackForm.reasons.other') && selectedReason === t('feedbackForm.reasons.other') && (
                  <div className="px-4 py-3 bg-black/[0.03] border border-t-0 border-black/10">
                    <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8a8880] mb-2">
                      {t('feedbackForm.tellUsMore')}
                    </p>
                    <textarea
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder={t('feedbackForm.otherPlaceholder')}
                      className="w-full px-3 py-3 bg-white border border-black/10 text-[13px] text-[#0b0b0a] placeholder-[#aaa] focus:outline-none focus:border-black/30 resize-none transition-colors duration-150"
                      rows="3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-black/8 bg-white flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleClose()}
            className="flex-1 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
          >
            {t('feedbackForm.goBackButton')}
          </button>
          <button
            onClick={() => handleClose(onContinueToDelete)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-semibold tracking-[0.02em] text-white bg-gradient-to-b from-red-500 to-red-700 border border-red-700 hover:from-red-600 hover:to-red-800 hover:shadow-[0_14px_28px_-10px_rgba(220,38,38,.6)] hover:-translate-y-px active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            {t('feedbackForm.continueDeleteButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
