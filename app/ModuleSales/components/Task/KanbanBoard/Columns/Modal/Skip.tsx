"use client";

import React from "react";

interface SkipModalProps {
  show: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  handleSkipSubmit: () => void;
}

const SkipModal: React.FC<SkipModalProps> = ({
  show,
  onClose,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handleSkipSubmit,
}) => {
  if (!show) return null;

  // get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-yellow-500 to-yellow-600">
          <h3 className="text-white font-semibold text-lg">Set Skip Period</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition text-lg"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[400px] overflow-y-auto">
          <div>
            <label className="block font-semibold mb-1">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
              min={today} // disable past dates
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
              min={today} // disable past dates
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={handleSkipSubmit}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-xs"
          >
            Submit Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkipModal;
