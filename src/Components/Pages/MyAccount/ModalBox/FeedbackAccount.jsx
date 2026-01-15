import React, { useState } from 'react';

export default function FeedbackForm() {
  const [selectedReason, setSelectedReason] = useState('');

  const [otherText, setOtherText] = useState('');

  const reasons = [
    "I no longer use Biogance products",
    "I found better prices elsewhere",
    "I've found better alternatives for my pet's grooming",
    "I prefer brands that focus on sustainability",
    "I've become more conscious of ingredient safety",
    "I now buy from local, cruelty-free companies",
    "I prefer shopping in-store",
    "Privacy concerns",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
        {/* Yellow star decoration */}
        

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          We'd love your feedback before you go
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Help us improve by telling us why you're leaving.
        </p>

        {/* Radio options */}
        <div className="space-y-4 mb-8 bg-gray-50 p-2 rounded-lg">
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
              {reason === "Other" && selectedReason === "Other" && (
                <div className="mt-3 ml-8">
                  <p className="text-xs text-gray-600 mb-2">Please tell us more</p>
                  <textarea
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="eg. I already have another account, I don't shop online often, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">
            No, Go Back
          </button>
          <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors cursor-pointer">
            Continue to Delete
          </button>
        </div>
      </div>
    </div>
  );
}