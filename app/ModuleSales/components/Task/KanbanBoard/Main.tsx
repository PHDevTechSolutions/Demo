"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsArrowsCollapseVertical } from 'react-icons/bs';
// Routes
import Inquiries from "./Columns/Inquiries";
import Companies from "./Columns/Companies";
import Progress from "./Columns/Progress";
import Callbacks from "./Columns/Callbacks";
import FollowUp from "./Columns/FollowUp";
import Meetings from "./Columns/Meetings";
import Completed from "./Columns/Completed";
import SiteVisit from "./Columns/SiteVisit";
import Recent from "./Columns/Modal/Recent";

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
  callback?: string;
}

interface Company {
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address?: string;
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
  TargetQuota: string;
  [key: string]: any;
}

interface Column {
  id: string;
  title: string;
}

interface KanbanBoardProps {
  userDetails: UserDetails | null;
}

const allColumns: Column[] = [
  { id: "new-task", title: "New Task" },
  { id: "in-progress", title: "In Progress" },
  { id: "scheduled", title: "Scheduled" },
  { id: "completed", title: "Completed" },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ userDetails }) => {
  const [expandedIdx, setExpandedIdx] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);
  // ✅ State for modal
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  // ✅ States for Progress
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const welcomeAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const played = localStorage.getItem("welcomePlayed");
    if (!played && welcomeAudioRef.current) {
      welcomeAudioRef.current.play().catch(() => {});
      localStorage.setItem("welcomePlayed", "true");
    }
  }, []);

  // ✅ Play Message handler (manual)
  const handlePlayMessage = () => {
    if (welcomeAudioRef.current) {
      welcomeAudioRef.current.currentTime = 0;
      welcomeAudioRef.current.play().catch(() => {});
    }
  };

  // ✅ Fetch Progress directly here
  const fetchProgress = async () => {
    if (!userDetails?.ReferenceID) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchInProgress?referenceid=${userDetails.ReferenceID}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProgress(data?.data || []);
    } catch (err) {
      console.error("❌ Error fetching progress:", err);
      toast.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userDetails?.ReferenceID]);

  const fetchProgressData = useCallback(async () => {
    if (!userDetails?.ReferenceID) return;
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchTask?referenceid=${userDetails.ReferenceID}`
      );
      if (!res.ok) return;

      const result = await res.json();
      let activities = result?.data || [];

      // ✅ compute kahapon range
      const today = new Date();
      const yesterdayStart = new Date(today);
      yesterdayStart.setDate(today.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(today);
      yesterdayEnd.setDate(today.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // ✅ filter by date_updated
      activities = activities.filter((act: any) => {
        if (!act.date_created) return false;
        const updated = new Date(act.date_created);
        return updated >= yesterdayStart && updated <= yesterdayEnd;
      });

      setRecentActivities(activities);
    } catch (err) {
      console.error("❌ Error fetchProgressData:", err);
    }
  }, [userDetails?.ReferenceID]);

  useEffect(() => {
    const hasSeenRecent = localStorage.getItem("hasSeenRecentActivities");
    if (!hasSeenRecent && userDetails?.ReferenceID) {
      // auto-open modal one-time
      fetchProgressData();
      setShowRecentModal(true);
      localStorage.setItem("hasSeenRecentActivities", "true");
    }
  }, [userDetails?.ReferenceID, fetchProgressData]);


  const handleSubmit = async (data: Partial<Company | Inquiry>, isInquiry: boolean) => {
    if (!userDetails) return;

    const payload = {
      referenceid: userDetails.ReferenceID,
      manager: userDetails.Manager,
      tsm: userDetails.TSM,
      companyname: data.companyname,
      contactperson: data.contactperson,
      contactnumber: data.contactnumber,
      emailaddress: data.emailaddress,
      typeclient: data.typeclient,
      address: data.address || "",
    };

    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // ✅ basahin body kahit error status
      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = { error: "No response body from server" };
      }

      if (!res.ok) {
        console.error("❌ Backend error:", result);
        throw new Error(result.error || "Failed to submit activity");
      }

      // ✅ update status kung inquiry
      if (isInquiry && "ticketreferencenumber" in data) {
        await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketreferencenumber: data.ticketreferencenumber,
            status: "used",
          }),
        });
      }

      // ✅ trigger reloading state bago mag-fetchProgress
      setLoading(true);
      await fetchProgress();
      setRefreshTrigger(prev => prev + 1);

      toast.success("Activity successfully added!", { autoClose: 2000 });
    } catch (error: any) {
      console.error("❌ Error submitting activity:", error);
      toast.error(error.message || "Failed to add activity", { autoClose: 2000 });
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedColumns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // ✅ Filter columns based on Role
  const filteredColumns = allColumns.filter(col => {
    if (userDetails?.Role === "Territory Sales Manager") {
      return col.id !== "new-task" && col.id !== "in-progress";
    }
    return true;
  });

  return (
    <div className="w-full p-4">
      <audio ref={welcomeAudioRef} src="/welcome.mp3" preload="auto" />
      <div className="flex justify-end gap-2 mb-3">
        <button
          onClick={() => {
            fetchProgressData();
            setShowRecentModal(true);
          }}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          📌 View Recent Activities
        </button>
        <button
          onClick={handlePlayMessage}
          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          ▶ Play Message
        </button>
      </div>
      <div className="flex gap-4">
        {filteredColumns.map(col => {
          const isCollapsed = collapsedColumns.includes(col.id);
          const isSchedOrCompleted = col.id === "scheduled" || col.id === "completed";

          return (
            <div
              key={col.id}
              className={`flex flex-col border-l pl-2 pr-0 py-2 relative transition-all duration-300 ${isCollapsed ? "w-12" : "flex-1"}`}
            >
              <div className="flex justify-between items-center mb-2">
                {!isCollapsed && (
                  <h2 className="font-semibold text-gray-700 text-center border-b w-full">
                    {col.title}
                  </h2>
                )}
                {isSchedOrCompleted && (
                  <button
                    onClick={() => toggleCollapse(col.id)}
                    className="ml-2 text-gray-600 hover:text-gray-900"
                    title={isCollapsed ? "Show Column" : "Collapse Column"}
                  >
                    <BsArrowsCollapseVertical size={15} />
                  </button>
                )}
              </div>

              <div className={`space-y-4 overflow-y-auto max-h-[600px] ${isCollapsed ? "hidden" : ""}`}>
                {col.id === "new-task" && !isCollapsed && (
                  <>
                    <Inquiries
                      expandedIdx={expandedIdx}
                      setExpandedIdx={setExpandedIdx}
                      handleSubmit={handleSubmit}
                      userDetails={userDetails}
                      refreshTrigger={refreshTrigger}
                    />
                    <Companies
                      expandedIdx={expandedIdx}
                      setExpandedIdx={setExpandedIdx}
                      handleSubmit={handleSubmit}
                      userDetails={userDetails}
                    />
                  </>
                )}

                {col.id === "in-progress" && !isCollapsed && (
                  loading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="ml-2 text-xs text-gray-500">Loading in-progress tasks...</span>
                    </div>
                  ) : (
                    <Progress
                      userDetails={userDetails}
                      progress={progress}
                      loading={loading}
                    />
                  )
                )}

                {col.id === "scheduled" && !isCollapsed && (
                  <>
                    <Callbacks userDetails={userDetails} refreshTrigger={refreshTrigger} />
                    <FollowUp userDetails={userDetails} refreshTrigger={refreshTrigger} />
                    <Meetings userDetails={userDetails} refreshTrigger={refreshTrigger} />
                    <SiteVisit userDetails={userDetails} refreshTrigger={refreshTrigger} />
                  </>
                )}
                {col.id === "completed" && !isCollapsed && (
                  <Completed userDetails={userDetails} refreshTrigger={refreshTrigger} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Recent
        show={showRecentModal}
        onClose={() => setShowRecentModal(false)}
        activities={recentActivities}
      />
    </div>
  );
};

export default KanbanBoard;
