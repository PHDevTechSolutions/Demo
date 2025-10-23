"use client";

import React, { useState } from "react";
import { LuClock, LuCalendarPlus } from "react-icons/lu";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface AgentData {
  Firstname: string;
  Lastname: string;
  profilePicture: string;
}

interface CallbackCardProps {
  inq: any;
  userDetails: any;
  onStatusChange: (id: number, newStatus: string) => void;
  agent: AgentData;
}

const CallbackCard: React.FC<CallbackCardProps> = ({ inq, userDetails, agent, onStatusChange, }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(prev => !prev);

  const bgColor =
    inq.scheduled_status?.toLowerCase() === "done"
      ? "bg-green-200"
      : "bg-stone-200";

  const profilePic = agent?.profilePicture || userDetails?.profilePicture || "/taskflow.png";
  const fullName = `${agent?.Firstname || ""} ${agent?.Lastname || ""}`.trim();

  return (
    <div className={`rounded-lg shadow overflow-hidden ${bgColor} mb-2`}>
      <div
        className="flex items-center p-3 gap-2 cursor-pointer select-none"
        onClick={toggleExpand}
      >

        <img
          src={profilePic}
          alt={fullName || "Profile"}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-[10px] uppercase">{inq.companyname}</p>
          <p className="text-[9px] text-gray-600">{inq.typecall}</p>
          {fullName && <p className="text-[9px] text-gray-500 italic">by {fullName}</p>}
        </div>

        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={inq.scheduled_status === "Done"}
            onChange={() =>
              onStatusChange(inq.id, inq.scheduled_status === "Done" ? "Pending" : "Done")
            }
            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
          />

        </div>
        <span className="text-[10px] ml-1">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-1 text-[10px]">
          <p><span className="font-semibold">Contact Person:</span> {inq.contactperson}</p>
          <p><span className="font-semibold">Contact #:</span> {inq.contactnumber}</p>
          <p><span className="font-semibold">Email:</span> {inq.emailaddress}</p>
          <p><span className="font-semibold">Address:</span> {inq.address}</p>
          <p><span className="font-semibold">Type:</span> {inq.typeclient}</p>
          <p><span className="font-semibold">Remarks:</span> {inq.remarks || "-"}</p>
          <p><span className="font-semibold">Status:</span> {inq.scheduled_status || "-"}</p>

          <div className="p-2 text-gray-500 text-[9px] flex items-center gap-1">
            <LuClock className="w-3 h-3" />
            <span>{inq.callback ? new Date(inq.callback).toLocaleString("en-PH") : "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallbackCard;

