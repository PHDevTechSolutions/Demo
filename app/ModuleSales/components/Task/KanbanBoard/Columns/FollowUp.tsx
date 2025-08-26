"use client";

import React, { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu"; // 🔹 icon sa footer

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
  date_created?: string;
  typeactivity?: string;
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

interface FollowUpsProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const FollowUps: React.FC<FollowUpsProps> = ({ userDetails, refreshTrigger }) => {
  const [followUps, setFollowUps] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        const activities: Inquiry[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const todayStr = new Date().toISOString().split("T")[0];

        const todayFollowUps = activities
          .filter((act) => act.referenceid === userDetails.ReferenceID)
          .filter((act) => act.typeactivity === "Follow Up")
          .filter((act) => act.date_created?.startsWith(todayStr))
          .sort((a, b) => b.date_created!.localeCompare(a.date_created!));

        setFollowUps(todayFollowUps);
      } catch (error) {
        console.error("❌ Failed to fetch today's follow-ups:", error);
        setFollowUps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading today's follow-ups...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">📌</span> Follow-Ups
      </h3>

      {followUps.length > 0 ? (
        followUps.map((act, idx) => (
          <div key={idx} className="rounded-lg shadow bg-yellow-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center p-3 gap-2">
              <img
                src={userDetails?.profilePicture || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="font-semibold text-[10px] uppercase">{act.companyname}</p>
            </div>

            {/* Body */}
            <div className="p-3 space-y-1 text-[10px]">
              <p><span className="font-semibold">Contact Person:</span> {act.contactperson}</p>
              <p><span className="font-semibold">Contact #:</span> {act.contactnumber}</p>
              <p><span className="font-semibold">Email:</span> {act.emailaddress}</p>
              <p><span className="font-semibold">Address:</span> {act.address}</p>
              <p><span className="font-semibold">Type:</span> {act.typeclient}</p>
              <p><span className="font-semibold">Remarks:</span> {act.remarks || "-"}</p>
            </div>

            {/* Footer */}
            <div className="p-2 text-gray-500 text-[9px] flex items-center gap-1">
              <LuClock className="w-3 h-3" />
              <span>{act.date_created ? act.date_created.split("T")[1]?.slice(0, 5) : "N/A"}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400 italic">No follow-ups scheduled for today.</p>
      )}
    </div>
  );
};

export default FollowUps;
