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
}

const MeetingForm: React.FC<MeetingFormProps> = ({
  mode,
  startDate,
  endDate,
  typeactivity,
  remarks,
  setMode,
  setStartDate,
  setEndDate,
  setTypeactivity,
  setRemarks,
  handleDurationChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-3">
      {/* Duration */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Duration</label>
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

      {/* Start */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border px-2 py-1 rounded text-xs"
          required
          disabled={mode !== "pick"}
        />
      </div>

      {/* End */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">End Date</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border px-2 py-1 rounded text-xs"
          required
          disabled={mode !== "pick"}
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Type</label>
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

      {/* Remarks */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Remarks</label>
        <textarea
          placeholder="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border px-2 py-1 rounded text-xs"
        />
      </div>

      {/* Save */}
      <button
        type="submit"
        className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700"
      >
        Save Meeting
      </button>
    </form>
  );
};

export default MeetingForm;
