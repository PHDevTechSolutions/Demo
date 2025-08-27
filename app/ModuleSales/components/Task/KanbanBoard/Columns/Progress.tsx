"use client";

import React, { useEffect, useState } from "react";

// 🔹 Force this page to always be dynamic
export const dynamic = "force-dynamic";

interface ProgressItem {
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  referenceid: string;
  date_created: string;
  remarks: string;
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

interface ProgressProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

// ✅ Safe localStorage setter (auto cleanup kapag puno)
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      console.warn("⚠️ LocalStorage quota exceeded. Cleaning old keys...");
      const keys = Object.keys(localStorage);
      if (keys.length > 0) {
        localStorage.removeItem(keys[0]); // delete pinakauna
        try {
          localStorage.setItem(key, value); // retry
        } catch {
          console.error("Still cannot save to localStorage after cleanup.");
        }
      }
    } else {
      console.error("LocalStorage error:", e);
    }
  }
};

const Progress: React.FC<ProgressProps> = ({ userDetails, refreshTrigger }) => {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const cacheKey = `progress_${userDetails.ReferenceID}`;

    const fetchProgress = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        let progressData: ProgressItem[] = [];
        if (Array.isArray(data)) progressData = data;
        else if (Array.isArray(data?.data)) progressData = data.data;
        else if (Array.isArray(data?.progress)) progressData = data.progress;

        // Filter by current user's ReferenceID
        const myProgress = progressData.filter(
          (p) => p.referenceid === userDetails.ReferenceID
        );

        // Sort newest first
        const sorted = myProgress.sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        );

        setProgress(sorted);
        safeSetItem(cacheKey, JSON.stringify(sorted)); // ✅ Save to cache
      } catch (error) {
        console.error("❌ Error fetching progress:", error);
        setProgress([]);
      } finally {
        setLoading(false);
      }
    };

    // 🔹 Step 1: Try load from cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached && refreshTrigger === 0) {
      try {
        const parsed: ProgressItem[] = JSON.parse(cached);
        setProgress(parsed);
        setLoading(false);
        return; // wag na mag-fetch kung may cache at walang refreshTrigger
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    // 🔹 Step 2: Fetch from API
    fetchProgress();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">⚡</span> In Progress
      </h3>

      {progress.length > 0 ? (
        progress.map((prog, idx) => (
          <div
            key={`prog-${idx}`}
            className="rounded-lg shadow bg-orange-100 overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center p-3">
              <img
                src={userDetails?.profilePicture || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <p className="font-semibold text-[10px] uppercase">
                {prog.companyname}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-3 space-y-1 text-[10px]">
              <p>
                <span className="font-semibold">Contact Person:</span>{" "}
                {prog.contactperson}
              </p>
              <p>
                <span className="font-semibold">Contact #:</span>{" "}
                {prog.contactnumber}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {prog.emailaddress}
              </p>
              <p>
                <span className="font-semibold">Type:</span> {prog.typeclient}
              </p>
              <p>
                <span className="font-semibold">Remarks:</span> {prog.remarks}
              </p>
            </div>

            {/* Card Footer */}
            <div className="p-2 text-gray-500 text-[9px]">
              {prog.date_created
                ? new Date(prog.date_created).toLocaleString()
                : "N/A"}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">No progress found.</p>
      )}
    </div>
  );
};

export default Progress;
