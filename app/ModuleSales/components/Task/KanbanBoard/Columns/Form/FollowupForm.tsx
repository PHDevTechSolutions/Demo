"use client";

import React from "react";

interface FollowUpFormProps {
  remarks: string;
  setRemarks: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  activitystatus: string;
  setActivityStatus: (value: string) => void;
  typeCall: "Successful" | "Unsuccessful" | "";
  setTypeCall: (value: "Successful" | "Unsuccessful" | "") => void;
  handleUpdate: () => void;
  closeFormDrawer: () => void;
  updating: boolean;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({
  remarks,
  setRemarks,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  activitystatus,
  setActivityStatus,
  typeCall,
  setTypeCall,
  handleUpdate,
  closeFormDrawer,
  updating,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleUpdate();
      }}
      className={`fixed bottom-0 left-0 w-full z-[9999] bg-white shadow-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ${
        true ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-lg font-semibold">Update Activity</h3>
        <button
          type="button"
          onClick={closeFormDrawer}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col sm:col-span-2">
          <label className="font-semibold text-xs mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Status</label>
          <select
            value={activitystatus}
            onChange={(e) => setActivityStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Call Status</label>
          <select
            value={typeCall}
            onChange={(e) =>
              setTypeCall(e.target.value as "Successful" | "Unsuccessful" | "")
            }
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Call Status</option>
            <option value="Successful">Successful</option>
            <option value="Unsuccessful">Unsuccessful</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={updating}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-semibold shadow disabled:opacity-50"
        >
          {updating ? "Saving..." : "Save Update"}
        </button>
      </div>
    </form>
  );
};

export default FollowUpForm;
