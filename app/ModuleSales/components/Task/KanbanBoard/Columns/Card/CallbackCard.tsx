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
  openFormDrawer: (inq: any) => void;
  agent: AgentData;  
}

const CallbackCard: React.FC<CallbackCardProps> = ({ inq, userDetails, agent, openFormDrawer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(prev => !prev);

  const bgColor =
    inq.activitystatus?.toLowerCase() === "done"
      ? "bg-green-200"
      : inq.activitystatus?.toLowerCase() === "ongoing"
      ? "bg-orange-200"
      : "bg-stone-200";

  const profilePic = agent?.profilePicture || userDetails?.profilePicture || "/taskflow.png";
  const fullName = `${agent?.Firstname || ""} ${agent?.Lastname || ""}`.trim();

  return (
    <div className={`rounded-lg shadow overflow-hidden ${bgColor} mb-2`}>
      <div
        className="w-full flex justify-between items-center px-4 py-4 text-left text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-t-lg cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <img
            src={profilePic}
            alt={fullName || "Profile"}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-[10px] uppercase">{inq.companyname}</p>
            <p className="text-[9px] text-gray-600">{inq.typecall}</p>
            {fullName && <p className="text-[9px] text-gray-500 italic">by {fullName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openFormDrawer(inq);
            }}
            className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-2 py-1 rounded flex gap-1"
          >
            <LuCalendarPlus size={15} /> Add
          </button>
          <span className="ml-2 text-[10px]">{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-1 text-[10px]">
          <p><span className="font-semibold">Contact Person:</span> {inq.contactperson}</p>
          <p><span className="font-semibold">Contact #:</span> {inq.contactnumber}</p>
          <p><span className="font-semibold">Email:</span> {inq.emailaddress}</p>
          <p><span className="font-semibold">Address:</span> {inq.address}</p>
          <p><span className="font-semibold">Type:</span> {inq.typeclient}</p>
          <p><span className="font-semibold">Remarks:</span> {inq.remarks || "-"}</p>
          <p><span className="font-semibold">Status:</span> {inq.activitystatus || "-"}</p>

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

