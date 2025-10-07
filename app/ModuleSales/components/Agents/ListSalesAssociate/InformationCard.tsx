"use client";

import React from "react";

interface InformationCardProps {
  Firstname: string;
  Lastname: string;
  ReferenceID: string;
  Email: string;
  userName: string;
  Status: string;
  TargetQuota: string;
  startdate: string;
  enddate: string;
  setStatus: (val: string) => void;
  setTargetQuota: (val: string) => void;
  setStartdate: (val: string) => void;
  setEnddate: (val: string) => void;
}

const InformationCard: React.FC<InformationCardProps> = ({
  Firstname,
  Lastname,
  ReferenceID,
  Email,
  userName,
  Status,
  TargetQuota,
  startdate,
  enddate,
  setStatus,
  setTargetQuota,
  setStartdate,
  setEnddate,
}) => {
  return (
    <div className="border bg-white shadow-md p-6 w-full rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Agent Profile Overview</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-700">
        <div>
          <span className="font-bold block mb-1">Full Name</span>
          <p className="capitalize">
            {Lastname}, {Firstname} ({ReferenceID})
          </p>
        </div>
        <div>
          <span className="font-bold block mb-1">Email Address</span>
          <p>{Email}</p>
        </div>
        <div>
          <span className="font-bold block mb-1">Username</span>
          <p className="capitalize">{userName}</p>
        </div>
        <div>
          <span className="font-bold block mb-1">Account Status</span>
          <span
            className={`inline-block px-3 py-1 text-[10px] font-semibold rounded-full
              ${Status === "Active" ? "bg-green-500 text-white" : ""}
              ${Status === "Resigned" ? "bg-red-400 text-white" : ""}
              ${Status === "Terminated" ? "bg-red-500 text-white" : ""}
              ${Status === "Inactive" || Status === "Locked" ? "bg-red-100 text-red-800" : ""}
              ${!Status ? "bg-gray-100 text-gray-600" : ""}`}
          >
            {Status || "N/A"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-sm">
        <div>
          <label className="block text-xs font-bold mb-1" htmlFor="TargetQuota">
            Sales Target Quota
          </label>
          <input
            type="text"
            id="TargetQuota"
            value={TargetQuota}
            onChange={(e) => setTargetQuota(e.target.value)}
            className="w-full px-3 py-2 border-b text-xs capitalize"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Specify the sales goal assigned to the agent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startdate}
            onChange={(e) => setStartdate(e.target.value)}
            className="w-full px-3 py-2 border-b bg-gray-50 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={enddate}
            onChange={(e) => setEnddate(e.target.value)}
            className="w-full px-3 py-2 border-b bg-gray-50 text-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default InformationCard;