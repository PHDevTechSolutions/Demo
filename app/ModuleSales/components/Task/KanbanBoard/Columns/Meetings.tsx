"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MeetingForm from "./Form/MeetingForm";

// ✅ Helper: format Date -> datetime-local string
const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// ✅ Helper: current PH time
const getNowInPH = () => {
    const now = new Date();
    const phTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    return phTime;
};

// ✅ Helper: PH time + X minutes
const getNowInPHPlusMinutes = (minutes: number) => {
    const base = getNowInPH();
    base.setMinutes(base.getMinutes() + minutes);
    return base;
};

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

interface MeetingItem {
    id: string;
    referenceid: string;
    tsm: string;
    manager: string;
    startdate: string;
    enddate: string;
    typeactivity: string;
    remarks: string;
    date_created: string;
}

interface MeetingsProps {
    userDetails: UserDetails | null;
    refreshTrigger: number;
}

const Meetings: React.FC<MeetingsProps> = ({ userDetails, refreshTrigger }) => {
    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState("pick");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [typeactivity, setTypeactivity] = useState("Client Meeting");
    const [remarks, setRemarks] = useState("");

    // ✅ New: fetched meetings
    const [meetings, setMeetings] = useState<MeetingItem[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    // ✅ Handle duration selection
    const handleDurationChange = (value: string) => {
        setMode(value);

        if (value !== "pick") {
            const minutes =
                value === "30" ? 30 : value === "60" ? 60 : value === "120" ? 120 : 180;

            const start = getNowInPH();
            const end = getNowInPHPlusMinutes(minutes);

            setStartDate(formatDateTimeLocal(start));
            setEndDate(formatDateTimeLocal(end));
        } else {
            setStartDate("");
            setEndDate("");
        }
    };

    // ✅ Fetch meetings
    const fetchMeetings = async () => {
        try {
            if (!userDetails) return;
            const res = await fetch(
                `/api/ModuleSales/Task/ActivityPlanner/FetchMeeting?referenceid=${userDetails.ReferenceID}`
            );
            const data = await res.json();

            if (!res.ok || !data.success)
                throw new Error(data.error || "Failed to fetch meetings");

            // 🔹 Filter only "Client Meeting" and "Group Meeting"
            const filteredMeetings = data.meetings.filter(
                (m: MeetingItem) =>
                    m.referenceid === userDetails.ReferenceID &&
                    (m.typeactivity === "Client Meeting" ||
                        m.typeactivity === "Group Meeting")
            );

            setMeetings(filteredMeetings);
        } catch (err: any) {
            console.error("❌ Fetch error:", err);
            toast.error(err.message || "Failed to load meetings");
        }
    };


    useEffect(() => {
        fetchMeetings();
    }, [userDetails, refreshTrigger]);

    // ✅ Submit to API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate) {
            toast.error("Please select a start date");
            return;
        }

        if (mode !== "pick" && !startDate) {
            toast.error("Please select a duration");
            return;
        }

        if (mode === "pick" && !endDate) {
            toast.error("Please select an end date");
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            toast.error("End date must be later than start date");
            return;
        }

        try {
            if (!userDetails) throw new Error("User details missing");

            const payload = {
                referenceid: userDetails.ReferenceID,
                tsm: userDetails.TSM,
                manager: userDetails.Manager,
                startdate: new Date(startDate).toISOString(), // ✅ ISO timestamp
                enddate: new Date(endDate).toISOString(),
                typeactivity,
                remarks,
            };

            // 🔹 Debug toast
            toast.info(`📤 Sending: ${JSON.stringify(payload)}`);

            const res = await fetch(
                "/api/ModuleSales/Task/ActivityPlanner/SubmitMeeting",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to save meeting");
            }

            toast.success("✅ Meeting saved successfully!");
            setShowForm(false);
            setStartDate("");
            setEndDate("");
            setMode("pick");
            setTypeactivity("Client Meeting");
            setRemarks("");
        } catch (err: any) {
            console.error("❌ Submit error:", err);
            toast.error(err.message || "Something went wrong");
        }
    };

    return (
        <div className="space-y-1 overflow-y-auto">
            <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
                <span className="mr-1">☎️</span>Total Meetings: <span className="ml-1 text-red-500">{meetings.length}</span>
            </h3>

            {/* 🔹 Form */}
            {showForm && userDetails && (
                <MeetingForm
                    mode={mode}
                    startDate={startDate}
                    endDate={endDate}
                    typeactivity={typeactivity}
                    remarks={remarks}
                    setMode={setMode}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setTypeactivity={setTypeactivity}
                    setRemarks={setRemarks}
                    handleDurationChange={handleDurationChange}
                    handleSubmit={handleSubmit}
                />
            )}

            {/* 🔹 Meetings List */}
            <div className="space-y-2">
                {meetings.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No meetings found</p>
                )}
                {meetings.map((m) => {
                    const isExpanded = expanded === m.id;
                    return (
                        <div key={m.id} className="rounded-lg shadow bg-stone-200">
                            <div
                                className="flex justify-between items-center px-4 py-4 cursor-pointer bg-gray-50"
                                onClick={() => setExpanded(isExpanded ? null : m.id)}
                            >
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-700">{m.typeactivity}</p>
                                    <p className="text-[10px] text-gray-500">
                                        {new Date(m.startdate).toLocaleString("en-PH")} → {new Date(m.enddate).toLocaleString("en-PH")}
                                    </p>
                                </div>
                                <span className="ml-2 text-[10px]">
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                </span>
                            </div>

                            {isExpanded && (
                                <div className="p-3 space-y-1 text-[10px]">
                                    <p><span className="font-semibold">Remarks:</span> {m.remarks || "-"}</p>
                                    <p><span className="font-semibold">TSM:</span> {m.tsm}</p>
                                    <p><span className="font-semibold">Manager:</span> {m.manager}</p>
                                    <p><span className="font-semibold">Created:</span> {new Date(m.date_created).toLocaleString("en-PH")}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 🔹 Header */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowForm((prev) => !prev)}
                    className="border border-blue-500 text-black text-xs px-3 py-2 w-full rounded-md hover:bg-blue-400 hover:text-white mt-2"
                >
                    {showForm ? "Cancel" : "+ Add Meeting"}
                </button>
            </div>
        </div>
    );
};

export default Meetings;
