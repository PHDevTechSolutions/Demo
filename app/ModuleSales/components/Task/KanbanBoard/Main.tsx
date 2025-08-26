// app/ModuleSales/KanbanBoard/page.tsx (Next.js App Router)
"use client";

export const dynamic = "force-dynamic"; // 🔹 Force dynamic rendering

import React, { useEffect, useState } from "react";
import Inquiries from "./Columns/Inquiries";
import Companies from "./Columns/Companies";
import Progress from "./Columns/Progress";
import Callbacks from "./Columns/Callbacks";
import FollowUp from "./Columns/FollowUp";

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

            setRefreshTrigger((prev) => prev + 1);
            alert("Activity successfully added!");
        } catch (error) {
            console.error("❌ Error submitting activity:", error);
            alert("Failed to add activity");
        }
    };

    return (
        <div className="w-full p-4">
            {/* Kanban columns */}
            <div className="grid grid-cols-4">
                {columns.map((col) => (
                    <div
                        key={col.id}
                        className="flex flex-col"
                    >
                        <h2 className="font-semibold text-gray-700 text-center mb-3 border-b">{col.title}</h2>
                        {col.id === "new-task" ? (
                            <div className="space-y-4 border-r p-4">
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
                        ) : col.id === "scheduled" ? (
                            <div className="space-y-4 border-r p-4">
                                <Callbacks
                                    userDetails={userDetails}
                                    refreshTrigger={refreshTrigger}
                                />
                                <FollowUp
                                    userDetails={userDetails}
                                    refreshTrigger={refreshTrigger}
                                />
                            </div>
                        ) : col.id === "in-progress" ? (
                            <div className="space-y-4 border-r p-4">
                                <Progress
                                    userDetails={userDetails}
                                    refreshTrigger={refreshTrigger}
                                />
                            </div>
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
