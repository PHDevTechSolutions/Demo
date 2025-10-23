"use client";

import React, { useEffect, useState, useCallback } from "react";
import CallbackCard from "./Card/CallbackCard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Inquiry {
  id?: number;
  tsm: string;
  manager: string;
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
  activitynumber: string;
  activitystatus: string;
  typecall: string;
  callback?: string;
  typeactivity: string;
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
  selectedTSA?: string;
}

const Callbacks: React.FC<CallbacksProps> = ({ userDetails, refreshTrigger, selectedTSA }) => {
  const [callbacks, setCallbacks] = useState<Inquiry[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState<
    Record<string, { Firstname: string; Lastname: string; profilePicture: string }>
  >({});

  const fetchAgents = useCallback(async (referenceIds: string[]) => {
    const map: Record<string, { Firstname: string; Lastname: string; profilePicture: string }> = {};

    await Promise.all(
      referenceIds.map(async (ref) => {
        try {
          const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(ref)}`);
          const data = await res.json();
          map[ref] = {
            Firstname: data.Firstname || "",
            Lastname: data.Lastname || "",
            profilePicture: data.profilePicture || "/taskflow.png",
          };
        } catch {
          map[ref] = {
            Firstname: "",
            Lastname: "",
            profilePicture: "/taskflow.png",
          };
        }
      })
    );

    setAgentData(map);
  }, []);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchCallbacks = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchCallback?referenceid=${userDetails.ReferenceID}`
        );
        const result = await res.json();

        const inquiries: Inquiry[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        let filtered: Inquiry[] = [];

        switch (userDetails.Role) {
          case "Territory Sales Manager":
            filtered = inquiries.filter(
              (inq) =>
                inq.tsm === userDetails.ReferenceID &&
                ["Ringing Only", "Cannot Be Reached", "Not Connected With The Company"].includes(
                  inq.typecall || ""
                )
            );
            break;
          case "Manager":
            filtered = inquiries.filter((inq) => inq.manager === userDetails.ReferenceID);
            break;
          default:
            filtered = inquiries.filter((inq) => inq.referenceid === userDetails.ReferenceID);
        }

        const tsaFiltered = selectedTSA
          ? filtered.filter((inq) => inq.referenceid === selectedTSA)
          : filtered;

        const todayCallbacks = tsaFiltered
          .filter((inq) => {
            if (!inq.callback) return false;
            const cbDate = new Date(inq.callback);
            return cbDate >= startOfDay && cbDate <= endOfDay;
          })
          .sort((a, b) => (b.callback || "").localeCompare(a.callback || ""));

        setCallbacks(todayCallbacks);

        // ✅ Fetch agent data for all reference IDs
        const uniqueRefs = Array.from(
          new Set(todayCallbacks.map((inq) => inq.referenceid).filter(Boolean))
        );
        if (uniqueRefs.length > 0) await fetchAgents(uniqueRefs);
      } catch (error) {
        console.error("❌ Failed to fetch today's callbacks:", error);
        toast.error("Failed to fetch today's callbacks.");
        setCallbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCallbacks();
  }, [userDetails?.ReferenceID, userDetails?.Role, refreshTrigger, selectedTSA, fetchAgents]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scheduled_status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setCallbacks((prev) =>
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
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">☎️</span>Total Callbacks: <span className="ml-1 text-red-500">{callbacks.length}</span>
      </h3>
      <span className="text-[10px]">Verify callbacks and update the status once the call is completed.</span>

      {callbacks.length > 0 ? (
        <>
          {callbacks.slice(0, visibleCount).map((inq, index) => {
            const agent = agentData[inq.referenceid] || {
              Firstname: "",
              Lastname: "",
              profilePicture: "/taskflow.png",
            };
            return (
              <CallbackCard
                key={inq.id ?? `${inq.activitynumber}-${inq.referenceid}-${index}`}
                inq={inq}
                userDetails={userDetails || { ReferenceID: "" }}
                agent={agent}
                onStatusChange={handleStatusChange}
              />
            );
          })}

          {visibleCount < callbacks.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="px-4 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                View More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 italic">No callbacks scheduled for today.</p>
      )}

    </div>
  );
};

export default Callbacks;