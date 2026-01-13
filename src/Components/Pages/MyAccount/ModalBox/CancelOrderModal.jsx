import { MdKeyboardArrowRight } from 'react-icons/md';

export function CancelOrderModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
          Confirm Cancellation
        </h2>
        
        {/* Description */}
        <p className="text-sm text-gray-600 text-center mb-8">
          Are you sure you want to cancel this order? Once canceled, we'll create a support ticket to handle your refund.
        </p>

        {/* Reason Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Reason to Cancel Order
          </label>
          <select className="w-full cursor-pointer px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option>eg; Cancel Order</option>
            <option>Changed my mind</option>
            <option>Found a better price</option>
            <option>Ordered by mistake</option>
            <option>Delivery taking too long</option>
            <option>Other</option>
          </select>
        </div>

        {/* Tell us more */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tell us more
          </label>
          <textarea 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            rows={4}
            placeholder="eg; I purchased the 250ml shampoo bottle last week, but the pump isn't working properly and it's difficult to get the product out."
          />
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full bg-red-600 cursor-pointer text-white py-3.5 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            Cancel This Order
          
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-white cursor-pointer border-2 border-gray-200 text-gray-900 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Keep My Order
          </button>
        </div>
      </div>
    </div>
  );
}