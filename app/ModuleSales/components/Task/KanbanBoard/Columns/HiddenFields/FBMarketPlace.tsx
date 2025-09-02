"use client";

import React from "react";

interface FBMarketPlaceProps {
  typecall: string;
  handleFormChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FBMarketPlace: React.FC<FBMarketPlaceProps> = ({ typecall, handleFormChange }) => {
  return (
    <div className="flex flex-col">
      <label className="font-semibold">Type <span className="text-[8px] text-green-700">* Required Fields</span></label>
      <select
        name="typecall"
        value={typecall || "Reply Message"}
        onChange={handleFormChange}
        className="border-b px-3 py-6 rounded text-xs"
        required
      >
        <option value="">Select Type</option>
        <option value="Posting">Posting</option>
        <option value="Reply Message">Reply Message</option>
      </select>
    </div>
  );
};

export default FBMarketPlace;
