"use client";

import React, { useState } from "react";
import { LuClock, LuCalendarPlus } from "react-icons/lu";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

interface FollowUpCardProps {
  inq: any;
  userDetails: any;
  openFormDrawer: (inq: any) => void;
  onDelete?: (activitynumber: string, referenceid: string) => void;
}

const FollowUpCard: React.FC<FollowUpCardProps> = ({
  inq,
  userDetails,
  openFormDrawer,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const bgColor =
    inq.activitystatus?.toLowerCase() === "done"
      ? "bg-green-200"
      : inq.activitystatus?.toLowerCase() === "ongoing"
        ? "bg-orange-200"
        : "bg-stone-200";

  const handleDelete = async () => {
    if (!inq.activitynumber || !inq.referenceid) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      setDeleting(true);
      const res = await fetch(
        "/api/ModuleSales/Task/ActivityPlanner/DeleteProgress",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activitynumber: inq.activitynumber,
            referenceid: inq.referenceid,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Activity deleted successfully!");
        if (onDelete) onDelete(inq.activitynumber, inq.referenceid);
      } else {
        toast.error(data.error || "Failed to delete activity.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`rounded-lg shadow overflow-hidden ${bgColor}`}>
      {/* Header */}
      <div
        className="flex items-center p-3 gap-2 cursor-pointer select-none"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <img
          src={userDetails?.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-[10px] uppercase">{inq.companyname}</p>
          <p className="text-[9px] text-gray-600">{inq.typecall}</p>
        </div>
        <button
          onClick={() => openFormDrawer(inq)}
          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-2 py-1 rounded flex gap-1"
        >
          <LuCalendarPlus size={15} /> Add
        </button>
        <span className="ml-2 text-[10px]">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      {/* Body (Collapsible) */}
      {expanded && (
        <>
          <div className="p-3 space-y-1 text-[10px] border-t">
            <p>
              <span className="font-semibold">Contact #:</span>{" "}
              {inq.contactnumber}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {inq.emailaddress}
            </p>
            <p>
              <span className="font-semibold">Address:</span> {inq.address}
            </p>
            <p>
              <span className="font-semibold">Type of Client:</span>{" "}
              {inq.typeclient}
            </p>
            <p>
              <span className="font-semibold">Remarks:</span>{" "}
              {inq.remarks || "-"}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {inq.activitystatus || "-"}
            </p>
          </div>

          {/* Footer */}
          <div className="p-2 text-gray-500 text-[9px] flex items-center justify-between border-t">
            {/* Clock + Time */}
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

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded flex gap-1 disabled:opacity-50 items-center"
              >
                <FaTrash size={10} /> {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default FollowUpCard;
