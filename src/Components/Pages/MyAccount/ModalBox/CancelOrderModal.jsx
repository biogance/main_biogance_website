import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CancelOrderModal({ isOpen, onClose, onConfirm }) {
  const { t } = useTranslation("myaccount");
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant
  // isOpen flips.
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 250);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
          {t('cancelOrder.title')}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 text-center mb-8">
          {t('cancelOrder.description')}
        </p>

        {/* Reason Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('cancelOrder.reasonLabel')}
          </label>
          <select className="w-full cursor-pointer px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option>{t('cancelOrder.reasonPlaceholder')}</option>
            <option>{t('cancelOrder.reasons.changedMind')}</option>
            <option>{t('cancelOrder.reasons.betterPrice')}</option>
            <option>{t('cancelOrder.reasons.orderedByMistake')}</option>
            <option>{t('cancelOrder.reasons.deliveryTooLong')}</option>
            <option>{t('cancelOrder.reasons.other')}</option>
          </select>
        </div>

        {/* Tell us more */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('cancelOrder.tellUsMoreLabel')}
          </label>
          <textarea
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            rows={4}
            placeholder={t('cancelOrder.tellUsMorePlaceholder')}
          />
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 cursor-pointer text-white py-3.5 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            {t('cancelOrder.confirmButton')}
          </button>
          <button
            onClick={handleClose}
            className="w-full bg-white cursor-pointer border-2 border-gray-200 text-gray-900 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            {t('cancelOrder.keepOrderButton')}
          </button>
        </div>
      </div>
    </div>
  );
}