"use client";

import React from "react";
import { LuClock, LuCalendarPlus } from "react-icons/lu";

interface CallbackCardProps {
  inq: any;
  userDetails: any;
  openFormDrawer: (inq: any) => void;
}

const CallbackCard: React.FC<CallbackCardProps> = ({ inq, userDetails, openFormDrawer }) => {
  const bgColor =
    inq.activitystatus?.toLowerCase() === "done"
      ? "bg-green-200"
      : inq.activitystatus?.toLowerCase() === "ongoing"
      ? "bg-orange-200"
      : "bg-stone-200"; // default

  return (
    <div className={`rounded-lg shadow overflow-hidden ${bgColor}`}>
      {/* Body */}
      <div className="p-3 space-y-1 text-[10px]">
        <p><span className="font-semibold">Contact Person:</span> {inq.contactperson}</p>
        <p><span className="font-semibold">Contact #:</span> {inq.contactnumber}</p>
        <p><span className="font-semibold">Email:</span> {inq.emailaddress}</p>
        <p><span className="font-semibold">Address:</span> {inq.address}</p>
        <p><span className="font-semibold">Type:</span> {inq.typeclient}</p>
        <p><span className="font-semibold">Remarks:</span> {inq.remarks || "-"}</p>
        <p><span className="font-semibold">Status:</span> {inq.activitystatus || "-"}</p>
      </div>

      {/* Footer */}
      <div className="p-2 text-gray-500 text-[9px] flex items-center gap-1">
        <LuClock className="w-3 h-3" />
        <span>{inq.callback ? inq.callback.split("T")[1]?.slice(0, 5) : "N/A"}</span>
        <button
          onClick={() => openFormDrawer(inq)}
          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-2 py-1 rounded flex gap-1"
        >
          <LuCalendarPlus size={15} /> Add
        </button>
      </div>
    </div>
  );
};

export default CallbackCard;
