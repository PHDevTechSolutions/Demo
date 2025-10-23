"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FollowUpCard from "./Card/FollowUpCard";

export const dynamic = "force-dynamic";

interface Inquiry {
  id: number;
  companyname: string;
  scheduled_status?: string;
  referenceid: string;
  followup_date: string;
  typecall?: string;
  contactnumber?: string;
  emailaddress?: string;
  address?: string;
  typeclient?: string;
  remarks?: string;
}

interface UserDetails {
  ReferenceID: string;
  Role: string;
  profilePicture?: string;
  Manager?: string;
  TSM?: string;
}

interface FollowUpsProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
  selectedTSA?: string;
}

const FollowUps: React.FC<FollowUpsProps> = ({
  userDetails,
  refreshTrigger,
  selectedTSA,
}) => {
  const [followUps, setFollowUps] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchFollowUp?referenceid=${userDetails.ReferenceID}`
        );
        const result = await res.json();

        const activities: Inquiry[] = Array.isArray(result.data)
          ? result.data
          : [];

        const today = new Date().toISOString().split("T")[0];
        const filtered = activities.filter((a) =>
          a.followup_date?.startsWith(today)
        );

        setFollowUps(filtered);
      } catch (e) {
        console.error("❌ Fetch error:", e);
        setFollowUps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [userDetails?.ReferenceID, refreshTrigger, localRefresh, selectedTSA]);

  // ✅ Update scheduled_status via API and reflect instantly
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scheduled_status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setFollowUps((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, scheduled_status: newStatus } : item
          )
        );
        toast.success(`✅ Status updated to ${newStatus}`);
      } else {
        toast.error(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating.");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
        <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      <h3 className="text-xs font-bold text-gray-600 mb-2">
        📌 Follow-Ups:{" "}
        <span className="text-orange-500">{followUps.length}</span>
      </h3>
      <span className="text-xs italic">Verify follow-ups and update the status once the activity is completed.</span>

      {followUps.length > 0 ? (
        followUps.map((inq, idx) => (
          <FollowUpCard
            key={inq.id || idx}
            inq={inq}
            userDetails={userDetails}
            onStatusChange={handleStatusChange}
          />
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">
          No callbacks scheduled for today.
        </p>
      )}
    </div>
  );
};

export default FollowUps;
