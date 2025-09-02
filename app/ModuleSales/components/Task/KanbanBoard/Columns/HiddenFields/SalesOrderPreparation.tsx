"use client";

import React from "react";

interface SalesOrderPreparationProps {
  sonumber: string;
  soamount: string;
  typecall: string;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const SalesOrderPreparation: React.FC<SalesOrderPreparationProps> = ({
  sonumber,
  soamount,
  typecall,
  handleFormChange,
}) => {
  return (
    <>
      <div className="flex flex-col">
        <label className="font-semibold">SO Number <span className="text-[8px] text-green-700">* Required Fields</span></label>
        <input
          type="text"
          name="sonumber"
          value={sonumber || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          placeholder="Enter SO Number"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">SO Amount <span className="text-[8px] text-green-700">* Required Fields</span></label>
        <input
          type="number"
          name="soamount"
          value={soamount || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          placeholder="Enter SO Amount"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">Type <span className="text-[8px] text-green-700">* Required Fields</span></label>
        <select
          name="typecall"
          value={typecall || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          required
        >
          <option value="">Select Type</option>
          <option value="Regular SO">Regular SO</option>
          <option value="Willing to Wait">Willing to Wait</option>
          <option value="SPF - Special Project">SPF - Special Project</option>
          <option value="Local SPF">Local SPF</option>
          <option value="SPF - Local">SPF - Local</option>
          <option value="SPF - Foreign">SPF - Foreign</option>
          <option value="Promo">Promo</option>
          <option value="FB Marketplace">FB Marketplace</option>
          <option value="Internal Order">Internal Order</option>
        </select>
      </div>
    </>
  );
};

export default SalesOrderPreparation;
