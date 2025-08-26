"use client";

import React, { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu"; // 🔹 clock icon

export const dynamic = "force-dynamic";

interface Inquiry {
  id?: number;
  ticketreferencenumber: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  address: string;
  wrapup: string;
  inquiries: string;
  typeclient: string;
  remarks?: string;
  referenceid: string;
  status: string;
  callback?: string;
}

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Manager: string;
  TSM: string;
  Role: string;
  profilePicture?: string;
  [key: string]: any;
}

interface CallbacksProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const Callbacks: React.FC<CallbacksProps> = ({ userDetails, refreshTrigger }) => {
  const [callbacks, setCallbacks] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchCallbacks = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        const inquiries: Inquiry[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const todayStr = new Date().toISOString().split("T")[0];

        const todayCallbacks = inquiries
          .filter((inq) => inq.referenceid === userDetails.ReferenceID)
          .filter((inq) => inq.callback?.startsWith(todayStr))
          .sort((a, b) => b.callback!.localeCompare(a.callback!));

        setCallbacks(todayCallbacks);
      } catch (error) {
        console.error("❌ Failed to fetch today's callbacks:", error);
        setCallbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCallbacks();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading today's callbacks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">☎️</span> Callbacks
      </h3>

      {callbacks.length > 0 ? (
        callbacks.map((inq, idx) => (
          <div key={idx} className="rounded-lg shadow bg-stone-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center p-3 gap-2">
              <img
                src={userDetails?.profilePicture || "/default-avatar.png"}
                alt="Profile"
                className="w-5 h-5 rounded-full object-cover"
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
            </div>

            {/* Footer */}
            <div className="p-2 text-gray-500 text-[9px] flex items-center gap-1">
              <LuClock className="w-3 h-3" />
              <span>{inq.callback ? inq.callback.split("T")[1]?.slice(0, 5) : "N/A"}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400 italic">No callbacks scheduled for today.</p>
      )}
    </div>
  );
};

export default Callbacks;
