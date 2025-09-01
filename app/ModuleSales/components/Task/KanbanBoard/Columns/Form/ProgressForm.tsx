"use client";

import React from "react";

interface ProgressFormProps {
  formData: {
    status: string;
    source: string;
    typeactivity: string;
    remarks: string;
    typecall?: string; // 🔹 dagdag field for FB-Marketplace
  };
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ProgressForm: React.FC<ProgressFormProps> = ({
  formData,
  handleFormChange,
  handleFormSubmit,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg z-50">
      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          {/* Source */}
          <div className="flex flex-col">
            <label className="font-semibold">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleFormChange}
              className="border px-3 py-2 rounded text-xs"
              placeholder="Enter source"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="font-semibold">Status</label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="border px-3 py-2 rounded text-xs"
              placeholder="Enter status"
            />
          </div>

          {/* Type of Activity */}
          <div className="flex flex-col">
            <label className="font-semibold">Type of Activity</label>
            <select
              name="typeactivity"
              value={formData.typeactivity}
              onChange={handleFormChange}
              className="border px-3 py-2 rounded text-xs"
            >
              <option value="">Select Activity</option>
              <option value="Admin- Supplier Accreditation">Admin- Supplier Accreditation</option>
              <option value="Admin- Credit Terms Application">Admin- Credit Terms Application</option>
              <option value="Accounting Concern">Accounting Concern</option>
              <option value="After Sales-Refund">After Sales-Refund</option>
              <option value="After Sales-Repair/Replacement">After Sales-Repair/Replacement</option>
              <option value="Bidding Preperation">Bidding Preperation</option>
              <option value="Customer Order">Customer Order</option>
              <option value="Customer Inquiry Sales">Customer Inquiry Sales</option>
              <option value="Delivery Concern">Delivery Concern</option>
              <option value="FB-Marketplace">FB-Marketplace</option>
              <option value="Follow Up">Follow-Up</option>
              <option value="Inbound Call">Inbound Calls</option>
              <option value="Outbound calls">Outbound Calls</option>
              <option value="Quotation Preparation">Quotation Preparation</option>
              <option value="Sales Order Preparation">Sales Order Preparation</option>
              <option value="Sample Request">Sample Request</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Technical Concern">Technical Concern</option>
              <option value="Viber Replies">Viber Replies</option>
            </select>
          </div>

          {/* 🔹 Conditionally show Typecall if FB-Marketplace is selected */}
          {formData.typeactivity === "FB-Marketplace" && (
            <div className="flex flex-col">
              <label className="font-semibold">Type</label>
              <select
                name="typecall"
                value={formData.typecall || "Reply Message"} // default value
                onChange={handleFormChange}
                className="border px-3 py-2 rounded text-xs"
              >
                <option value="Posing">Select Type</option>
                <option value="Posting">Posting</option>
                <option value="Reply Message">Reply Message</option>
              </select>
            </div>
          )}

          {/* Remarks */}
          <div className="flex flex-col col-span-2">
            <label className="font-semibold">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleFormChange}
              className="border px-3 py-2 rounded text-xs resize-none h-20"
              placeholder="Enter remarks"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgressForm;
