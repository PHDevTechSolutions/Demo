"use client";

import React from "react";

interface CallbackFormProps {
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
  typecall: string;
  onChangeField: (field: string, value: any) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const CallbackForm: React.FC<CallbackFormProps> = ({
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
  onChangeField,
  onClose,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={`fixed bottom-0 left-0 w-full z-[9999] bg-white shadow-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ${
        activitynumber ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-xs font-semibold">Update Activity</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <input type="hidden" value={activitynumber} />
        <input type="hidden" value={companyname} />
        <input type="hidden" value={contactperson} />
        <input type="hidden" value={typeclient} />
        <input type="hidden" value={typeactivity} />
        <input type="hidden" value={referenceid} />
        <input type="hidden" value={tsm} />
        <input type="hidden" value={manager} />

        <div className="flex flex-col sm:col-span-2">
          <label className="font-semibold text-xs mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => onChangeField("remarks", e.target.value)}
            rows={3}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={startdate}
            onChange={(e) => onChangeField("startdate", e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">End Date</label>
          <input
            type="datetime-local"
            value={enddate}
            onChange={(e) => onChangeField("enddate", e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-xs mb-1">Status</label>
          <select
            value={activitystatus}
            onChange={(e) => onChangeField("activitystatus", e.target.value)}
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
            value={typecall}
            onChange={(e) => onChangeField("typecall", e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Call Status</option>
            <option value="Successful">Successful</option>
            <option value="Unsucessful">Unsucessful</option>
          </select>
        </div>
      </div>
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
