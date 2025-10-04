// File: ./Form/Callback.tsx
"use client";

import React from "react";

interface CallbackFormProps {
  selectedInquiry: any;
  handleUpdate: () => void;
  closeFormDrawer: () => void;
  activitynumber: string;
  companyname: string;
  contactperson: string;
  typeclient: string;
  typeactivity: string;
  referenceid: string;
  tsm: string;
  manager: string;
  remarks: string;
  startdate: string;
  enddate: string;
  activitystatus: string;
  typecall: "Successful" | "Unsucessful";
  setActivityNumber: (val: string) => void;
  setCompanyName: (val: string) => void;
  setContactPerson: (val: string) => void;
  setTypeClient: (val: string) => void;
  setTypeActivity: (val: string) => void;
  setReferenceid: (val: string) => void;
  setTsm: (val: string) => void;
  setManager: (val: string) => void;
  setRemarks: (val: string) => void;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  setActivityStatus: (val: string) => void;
  setTypeCall: (val: "Successful" | "Unsucessful") => void;
}

const CallbackForm: React.FC<CallbackFormProps> = ({
  selectedInquiry,
  handleUpdate,
  closeFormDrawer,
  activitynumber,
  companyname,
  contactperson,
  typeclient,
  typeactivity,
  referenceid,
  tsm,
  manager,
  remarks,
  startdate,
  enddate,
  activitystatus,
  typecall,
  setActivityNumber,
  setCompanyName,
  setContactPerson,
  setTypeClient,
  setTypeActivity,
  setReferenceid,
  setTsm,
  setManager,
  setRemarks,
  setStartDate,
  setEndDate,
  setActivityStatus,
  setTypeCall,
}) => {
  if (!selectedInquiry) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleUpdate();
      }}
      className={`fixed bottom-0 left-0 w-full z-[9999] bg-white shadow-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ${
        selectedInquiry ? "translate-y-0" : "translate-y-full"
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
        {/* Hidden Inputs */}
        <input type="hidden" value={activitynumber} onChange={(e) => setActivityNumber(e.target.value)} />
        <input type="hidden" value={companyname} onChange={(e) => setCompanyName(e.target.value)} />
        <input type="hidden" value={contactperson} onChange={(e) => setContactPerson(e.target.value)} />
        <input type="hidden" value={typeclient} onChange={(e) => setTypeClient(e.target.value)} />
        <input type="hidden" value={typeactivity} onChange={(e) => setTypeActivity(e.target.value)} />
        <input type="hidden" value={referenceid} onChange={(e) => setReferenceid(e.target.value)} />
        <input type="hidden" value={tsm} onChange={(e) => setTsm(e.target.value)} />
        <input type="hidden" value={manager} onChange={(e) => setManager(e.target.value)} />

        {/* Remarks */}
        <div className="flex flex-col sm:col-span-2">
          <label className="font-semibold text-xs mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={startdate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            required
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">End Date</label>
          <input
            type="datetime-local"
            value={enddate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
        </div>

        {/* Status */}
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

        {/* Call Status */}
        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Call Status</label>
          <select
            value={typecall}
            onChange={(e) => setTypeCall(e.target.value as "Successful" | "Unsucessful")}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Call Status</option>
            <option value="Successful">Successful</option>
            <option value="Unsucessful">Unsucessful</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-semibold shadow"
        >
          Save Update
        </button>
      </div>
    </form>
  );
};

export default CallbackForm;
