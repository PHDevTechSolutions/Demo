"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Inquiries from "./Columns/Inquiries";
import Companies from "./Columns/Companies";
import Progress from "./Columns/Progress";
import Callbacks from "./Columns/Callbacks";
import FollowUp from "./Columns/FollowUp";
import Completed from "./Columns/Completed";
import { FiSearch } from "react-icons/fi";

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

const columns: Column[] = [
  { id: "new-task", title: "New Task" },
  { id: "scheduled", title: "Scheduled" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];
 
const KanbanBoard: React.FC<KanbanBoardProps> = ({ userDetails }) => {
  const [expandedIdx, setExpandedIdx] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      typeclient: isInquiry ? "CSR Client" : (data as Company).typeclient,
      address: data.address || "",
    };

    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit activity");
      await res.json();

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

      // 🔹 Trigger refresh sa Progress at iba pang columns
      setRefreshTrigger((prev) => prev + 1);

      toast.success("Activity successfully added!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } catch (error) {
      console.error("❌ Error submitting activity:", error);
      toast.error("Failed to add activity", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col border-l pl-2 pr-0 py-2 relative">
            <div className="flex justify-center items-center mb-2">
              <h2 className="font-semibold text-gray-700 text-center border-b w-full">{col.title}</h2>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[600px]">
              {col.id === "new-task" ? (
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
              ) : col.id === "scheduled" ? (
                <>
                  <Callbacks
                    userDetails={userDetails}
                    refreshTrigger={refreshTrigger}
                  />
                  <FollowUp
                    userDetails={userDetails}
                    refreshTrigger={refreshTrigger}
                  />
                </>
              ) : col.id === "in-progress" ? (
                <Progress
                  userDetails={userDetails}
                  refreshTrigger={refreshTrigger}
                />
              ) : col.id === "completed" ? (
                <Completed
                  userDetails={userDetails}
                  refreshTrigger={refreshTrigger}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                  No tasks yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <ToastContainer className="text-xs" autoClose={1000} />
    </div>
  );
};

export default KanbanBoard;
