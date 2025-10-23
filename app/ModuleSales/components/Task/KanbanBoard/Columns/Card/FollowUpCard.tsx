"use client";

import React, { useState } from "react";
import { LuClock } from "react-icons/lu";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FollowUpCardProps {
  inq: any;
  userDetails: any;
  onStatusChange: (id: number, newStatus: string) => void;
}

const FollowUpCard: React.FC<FollowUpCardProps> = ({
  inq,
  userDetails,
  onStatusChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const bgColor =
    inq.scheduled_status === "Done"
      ? "bg-green-200"
      : "bg-stone-200";

  return (
    <div className={`rounded-lg shadow overflow-hidden ${bgColor}`}>
      <div
        className="flex items-center p-3 gap-2 cursor-pointer select-none"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <img
          src={userDetails?.profilePicture || "/taskflow.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-[10px] uppercase">
            {inq.companyname}
          </p>
          <p className="text-[9px] text-gray-600">{inq.typecall}</p>
        </div>

        {/* ✅ Checkbox replaces Add button */}
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
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      {expanded && (
        <>
          <div className="p-3 space-y-1 text-[10px] border-t">
            <p><span className="font-semibold">Contact #:</span> {inq.contactnumber}</p>
            <p><span className="font-semibold">Email:</span> {inq.emailaddress}</p>
            <p><span className="font-semibold">Address:</span> {inq.address}</p>
            <p><span className="font-semibold">Type of Client:</span> {inq.typeclient}</p>
            <p><span className="font-semibold">Remarks:</span> {inq.remarks || "-"}</p>
            <p><span className="font-semibold">Status:</span> {inq.scheduled_status || "-"}</p>
          </div>

          <div className="p-2 text-gray-500 text-[9px] flex items-center justify-between border-t">
            <div className="flex items-center gap-1">
              <LuClock className="w-3 h-3" />
              <span>
                {inq.followup_date
                  ? new Date(inq.followup_date).toLocaleString([], {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FollowUpCard;
