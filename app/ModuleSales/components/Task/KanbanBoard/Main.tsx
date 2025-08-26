"use client";

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

    // 🔹 LocalStorage key
    const storageKey = `kanban_inquiries_${userDetails?.ReferenceID}`;

    const fetchInquiries = async () => {
        if (!userDetails) return;

        try {
            const res = await fetch(
                `/api/ModuleSales/Task/ActivityPlanner/FetchInquiries?referenceid=${userDetails.ReferenceID}`
            );
            const data = await res.json();
            let fetched: Inquiry[] = [];
            if (Array.isArray(data)) fetched = data;
            else if (Array.isArray(data?.data)) fetched = data.data;

            setInquiries(fetched);
            // 🔹 Save to LocalStorage
            localStorage.setItem(storageKey, JSON.stringify(fetched));
        } catch (error) {
            console.error("❌ Failed to fetch inquiries:", error);
        }
    };

    useEffect(() => {
        if (!userDetails?.ReferenceID) return;

        // 🔹 Try to load from LocalStorage first
        const cached = localStorage.getItem(storageKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached) as Inquiry[];
                setInquiries(parsed);
            } catch {
                localStorage.removeItem(storageKey);
            }
        }

        // 🔹 Fetch if refreshTrigger or no cache
        if (!cached || refreshTrigger > 0) {
            fetchInquiries();
        }
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
            const result = await res.json();
            console.log("✅ Submitted:", result);

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

            // 🔹 Refresh and update LocalStorage
            setRefreshTrigger(prev => prev + 1);

            alert("Activity successfully added!");
        } catch (error) {
            console.error("❌ Error submitting activity:", error);
            alert("Failed to add activity");
        }
    };

    return (
        <div className="w-full p-4">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">
                    Welcome, {userDetails?.Firstname || "User"} 👋
                </h2>
                <p className="text-sm text-gray-500">
                    {userDetails?.Email || "No email available"}
                </p>
            </div>

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
