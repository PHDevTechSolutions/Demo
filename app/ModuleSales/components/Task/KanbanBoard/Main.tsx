"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsArrowsCollapseVertical } from 'react-icons/bs';
import Inquiries from "./Columns/Inquiries";
import Companies from "./Columns/Companies";
import Progress from "./Columns/Progress";
import Callbacks from "./Columns/Callbacks";
import FollowUp from "./Columns/FollowUp";
import Meetings from "./Columns/Meetings";
import Completed from "./Columns/Completed";

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
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);

  // Submit handler
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

      setRefreshTrigger(prev => prev + 1);

      toast.success("Activity successfully added!", { autoClose: 2000 });
    } catch (error) {
      console.error("❌ Error submitting activity:", error);
      toast.error("Failed to add activity", { autoClose: 2000 });
    }
  };

  // Toggle column collapse
  const toggleCollapse = (id: string) => {
    setCollapsedColumns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full p-4">
      <div className="flex gap-4">
        {columns.map(col => {
          const isCollapsed = collapsedColumns.includes(col.id);
          const isSchedOrCompleted = col.id === "scheduled" || col.id === "completed";

          return (
            <div
              key={col.id}
              className={`flex flex-col border-l pl-2 pr-0 py-2 relative transition-all duration-300 ${isCollapsed ? "w-12" : "flex-1"}`}
            >
              {/* Header */}
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

              {/* Column Content */}
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
                {col.id === "scheduled" && !isCollapsed && (
                  <>
                    <Callbacks userDetails={userDetails} refreshTrigger={refreshTrigger} />
                    <FollowUp userDetails={userDetails} refreshTrigger={refreshTrigger} />
                    <Meetings userDetails={userDetails} refreshTrigger={refreshTrigger} />
                  </>
                )}
                {col.id === "in-progress" && !isCollapsed && (
                  <Progress userDetails={userDetails} refreshTrigger={refreshTrigger} />
                )}
                {col.id === "completed" && !isCollapsed && (
                  <Completed userDetails={userDetails} refreshTrigger={refreshTrigger} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ToastContainer className="text-xs" autoClose={1000} />
    </div>
  );
};

export default KanbanBoard;
