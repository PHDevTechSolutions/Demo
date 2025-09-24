import React from "react";

interface DeliveredProps {
  formData: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const Delivered: React.FC<DeliveredProps> = ({ formData, handleFormChange }) => {
  return (
    <>
      {/* Existing Delivered fields */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Payment Terms <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <select
          name="paymentterm"
          value={formData.paymentterm || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
        >
          <option value="">Select Payment Term</option>
          <option value="COD">COD</option>
          <option value="Check">Check</option>
          <option value="Cash">Cash</option>
          <option value="Bank Deposit">Bank Deposit</option>
          <option value="GCash">GCash</option>
          <option value="Terms">Terms</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">
          SI (Actual Sales) <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <input
          type="number"
          name="actualsales"
          value={formData.actualsales || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">
          DR Number <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <input
          type="text"
          name="drnumber"
          value={formData.drnumber || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">
          Delivery Date <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <input
          type="date"
          name="deliverydate"
          value={formData.deliverydate || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
          required
        />
      </div>
    </>
  );
};

export default Delivered;
