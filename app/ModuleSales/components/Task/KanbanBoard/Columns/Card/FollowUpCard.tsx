"use client";

import React, { useState } from "react";
import { LuClock, LuCalendarPlus, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";

interface FolloUpCardProps {
  inq: any;
  userDetails: any;
  openFormDrawer: (inq: any) => void;
  onDelete?: (activitynumber: string) => void; // callback para tanggalin sa parent state
}

const FollowUpCard: React.FC<FolloUpCardProps> = ({
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
      : "bg-stone-200"; // default

  // ✅ Handle Delete
  const handleDelete = async () => {
    if (!confirm("❗ Are you sure you want to delete this activity?")) return;

    try {
      setDeleting(true);
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/DeleteProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitynumber: inq.activitynumber,
          referenceid: inq.referenceid,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🗑️ Activity deleted successfully!");
        onDelete?.(inq.activitynumber); // call parent para alisin sa list
      } else {
        console.error("❌ Delete failed:", data);
        toast.error("Failed to delete activity.");
      }
    } catch (error) {
      console.error("❌ Error deleting activity:", error);
      toast.error("An error occurred while deleting.");
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
        <span>{inq.date_created ? inq.date_created.split("T")[1]?.slice(0, 5) : "N/A"}</span>

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
