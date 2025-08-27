"use client";

import React, { useState } from "react";
import { LuClock, LuCalendarPlus, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";

interface FollowUpCardProps {
  inq: any;
  userDetails: any;
  openFormDrawer: (inq: any) => void;
  onDelete?: (activitynumber: string, referenceid: string) => void; // callback sa parent
}

const FollowUpCard: React.FC<FollowUpCardProps> = ({
  inq,
  userDetails,
  openFormDrawer,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);

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
        if (onDelete) onDelete(inq.activitynumber, inq.referenceid); // notify parent
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
      <div className="flex items-center p-3 gap-2">
        <img
          src={userDetails?.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="font-semibold text-[10px] uppercase">{inq.companyname}</p>
      </div>

      {/* Body */}
      <div className="p-3 space-y-1 text-[10px]">
        <p>
          <span className="font-semibold">Contact Person:</span>{" "}
          {inq.contactperson}
        </p>
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
          <span className="font-semibold">Type:</span> {inq.typeclient}
        </p>
        <p>
          <span className="font-semibold">Remarks:</span> {inq.remarks || "-"}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {inq.activitystatus || "-"}
        </p>
      </div>

      {/* Footer */}
      <div className="p-2 text-gray-500 text-[9px] flex items-center gap-1">
        <LuClock className="w-3 h-3" />
        <span>
          {inq.date_created
            ? new Date(inq.date_created).toLocaleString([], {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "N/A"}
        </span>

        <button
          onClick={() => openFormDrawer(inq)}
          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-2 py-1 rounded flex gap-1"
        >
          <LuCalendarPlus size={15} /> Add
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded flex gap-1 ml-2 disabled:opacity-50"
        >
          <LuTrash2 size={15} /> {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

    </div>
  );
};

export default FollowUpCard;
