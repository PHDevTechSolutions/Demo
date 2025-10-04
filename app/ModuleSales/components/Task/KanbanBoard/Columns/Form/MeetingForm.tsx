"use client";

import React from "react";

interface MeetingFormProps {
  mode: string;
  startDate: string;
  endDate: string;
  typeactivity: string;
  remarks: string;
  setMode: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setTypeactivity: (value: string) => void;
  setRemarks: (value: string) => void;
  handleDurationChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onClose?: () => void; // optional close handler
}

const MeetingForm: React.FC<MeetingFormProps> = ({
  mode,
  startDate,
  endDate,
  typeactivity,
  remarks,
  setStartDate,
  setEndDate,
  setTypeactivity,
  setRemarks,
  handleDurationChange,
  handleSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-600 to-teal-500">
          <h3 className="text-white font-semibold text-lg">Add / Edit Meeting</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition text-lg"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 text-xs text-gray-700 max-h-[500px] overflow-y-auto"
        >
          <div>
            <label className="block font-semibold mb-1">Duration</label>
            <select
              value={mode}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
            >
              <option value="pick">-- Select Duration --</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="pick">Pick a date</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
              required
              disabled={mode !== "pick"}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
              required
              disabled={mode !== "pick"}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Type</label>
            <select
              value={typeactivity}
              onChange={(e) => setTypeactivity(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
            >
              <option value="">Select Type</option>
              <option value="Client Meeting">Client Meeting</option>
              <option value="Group Meeting">Group Meeting</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Remarks</label>
            <textarea
              placeholder="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border px-2 py-1 rounded text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-xs"
            >
              Save Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;
