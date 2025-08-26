// app/ModuleSales/KanbanBoard/page.tsx (Next.js App Router)
"use client";

export const dynamic = "force-dynamic"; // 🔹 Force dynamic rendering

import React, { useEffect, useState } from "react";
import Inquiries from "./Columns/Inquiries";
import Companies from "./Columns/Companies";
import Progress from "./Columns/Progress";

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
  referenceid: string;
  status: string;
  date_created?: string;
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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🔹 Load from localStorage initially
  useEffect(() => {
    if (!userDetails) return;
    const cached = localStorage.getItem(`inquiries_${userDetails.ReferenceID}`);
    if (cached) setInquiries(JSON.parse(cached));
  }, [userDetails?.ReferenceID]);

  // 🔹 Fetch inquiries from server (always latest)
  useEffect(() => {
    if (!userDetails) return;
    const fetchInquiries = async () => {
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchInquiries?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();
        const inquiriesData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setInquiries(inquiriesData);
        localStorage.setItem(
          `inquiries_${userDetails.ReferenceID}`,
          JSON.stringify(inquiriesData)
        );
      } catch (error) {
        console.error("❌ Failed to fetch inquiries:", error);
      }
    };
    fetchInquiries();
  }, [userDetails?.ReferenceID, refreshTrigger]);

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

      // Update status if it's an inquiry
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

      // 🔹 Trigger refresh for Progress and Inquiries
      setRefreshTrigger((prev) => prev + 1);

      alert("Activity successfully added!");
    } catch (error) {
      console.error("❌ Error submitting activity:", error);
      alert("Failed to add activity");
    }
  };

  return (
    <div className="w-full p-4">
      {/* User header */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-3">
        {userDetails?.profilePicture && (
          <img
            src={userDetails.profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Welcome, {userDetails?.Firstname || "User"} 👋
          </h2>
          <p className="text-sm text-gray-500">{userDetails?.Email || ""}</p>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-gray-100 rounded-xl p-4 shadow-md flex flex-col"
          >
            <h2 className="font-semibold text-gray-700 mb-3">{col.title}</h2>

            {col.id === "new-task" ? (
              <div className="space-y-6">
                <Companies
                  expandedIdx={expandedIdx}
                  setExpandedIdx={setExpandedIdx}
                  handleSubmit={handleSubmit}
                  userDetails={userDetails}
                />
                <Inquiries
                  expandedIdx={expandedIdx}
                  setExpandedIdx={setExpandedIdx}
                  handleSubmit={handleSubmit}
                  userDetails={userDetails}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            ) : col.id === "in-progress" ? (
              <Progress
                userDetails={userDetails}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                No tasks yet
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
