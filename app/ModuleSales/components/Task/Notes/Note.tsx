"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Form from "./Form";

interface Note {
    id: number;
    activitynumber: string;
    referenceid: string;
    manager: string;
    tsm: string;
    activitystatus: string;
    typeactivity: string;
    remarks: string;
    startdate: string;
    enddate: string;
    date_created: string;
    date_updated?: string;
}

interface UserDetails {
    ReferenceID: string;
    Firstname: string;
    Lastname: string;
    Manager: string;
    TSM: string;
    Role: string;
    [key: string]: any;
}

interface NotesProps {
    posts?: Note[];
    userDetails: UserDetails;
}

const Notes: React.FC<NotesProps> = ({ posts = [], userDetails }) => {
    const [notes, setNotes] = useState<Note[]>(posts);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [activitystatus, setActivityStatus] = useState("");
    const [typeactivity, setTypeActivity] = useState("");
    const [remarks, setRemarks] = useState("");
    const [startdate, setStartDate] = useState("");
    const [enddate, setEndDate] = useState("");

    const activityTypes = [
        "Assisting Other Agent Clients",
        "Coordination of SO To Warehouse",
        "Coordination of SO to Orders",
        "Updating Reports",
        "Check/Read emails",
        "Documentation",
    ];

    // ✅ Safe setItem with cleanup for notes only
    const safeSetItem = (key: string, value: string) => {
        try {
            localStorage.setItem(key, value);
        } catch (e: any) {
            if (e.name === "QuotaExceededError" || e.code === 22) {
                console.warn("⚠️ LocalStorage quota exceeded. Cleaning up old notes...");
                // Hanapin lahat ng `notes_` keys at burahin yung pinakauna
                const noteKeys = Object.keys(localStorage).filter(k => k.startsWith("notes_"));
                if (noteKeys.length > 0) {
                    localStorage.removeItem(noteKeys[0]);
                    try {
                        localStorage.setItem(key, value); // retry
                    } catch {
                        console.error("Still cannot save notes after cleanup.");
                    }
                }
            } else {
                console.error("LocalStorage error:", e);
            }
        }
    };

    // 🔹 Wrapper for notes sync
    const syncToCache = (newNotes: Note[]) => {
        setNotes(newNotes);
        safeSetItem(`notes_${userDetails.ReferenceID}`, JSON.stringify(newNotes));
    };

    // ⏬ Fetch + cache sa localStorage
    useEffect(() => {
        const cached = localStorage.getItem(`notes_${userDetails.ReferenceID}`);
        if (cached) {
            setNotes(JSON.parse(cached));
        }

        const fetchNotes = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/ModuleSales/Task/Notes/Fetch?referenceid=${userDetails.ReferenceID}`
                );
                if (!res.ok) throw new Error("Failed to fetch notes");
                const data = await res.json();
                if (data.success && data.data) {
                    setNotes(data.data);
                    safeSetItem(`notes_${userDetails.ReferenceID}`, JSON.stringify(data.data));
                }
            } catch (err) {
                toast.error("Error fetching notes");
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [userDetails.ReferenceID]);

    // 🔹 Generate ID
    const generateActivityNumber = () => `ACT-${Date.now()}`;

    const resetForm = () => {
        setEditingId(null);
        setActivityStatus("");
        setTypeActivity("");
        setRemarks("");
        setStartDate("");
        setEndDate("");
    };

    const handleSubmit = async () => {
        if (!activitystatus || !typeactivity || !startdate || !enddate) {
            toast.warning("Please fill all required fields!");
            return;
        }

        const activityNumber = editingId
            ? notes.find(n => n.id === editingId)?.activitynumber || generateActivityNumber()
            : generateActivityNumber();

        const payload: Note = {
            id: editingId || Date.now(),
            activitynumber: activityNumber,
            referenceid: userDetails.ReferenceID,
            manager: userDetails.Manager,
            tsm: userDetails.TSM,
            activitystatus,
            typeactivity,
            remarks,
            startdate,
            enddate,
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString(),
        };

        // 🔹 Optimistic update
        syncToCache([payload, ...notes.filter(n => n.id !== payload.id)]);

        try {
            const url = editingId
                ? "/api/ModuleSales/Task/Notes/Edit"
                : "/api/ModuleSales/Task/Notes";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to submit activity");

            await res.json();

            resetForm();
            toast.success(editingId ? "Activity updated!" : "Activity submitted successfully!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong!");
        }
    };

    const handleEdit = (note: Note) => {
        setEditingId(note.id);
        setActivityStatus(note.activitystatus);
        setTypeActivity(note.typeactivity);
        setRemarks(note.remarks);
        setStartDate(formatForInput(note.startdate));
        setEndDate(formatForInput(note.enddate));
    };

    const handleDelete = async (id: number) => {
        syncToCache(notes.filter(n => n.id !== id));

        try {
            const res = await fetch("/api/ModuleSales/Task/DailyActivity/DeleteProgress", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Failed to delete activity");
            await res.json();

            toast.success("Activity deleted successfully!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong while deleting!");
        }
    };

    const filteredNotes = notes.filter(note => {
        if (!activityTypes.includes(note.typeactivity)) return false;
        if (userDetails.Role === "Super Admin") return true;
        return note.referenceid === userDetails.ReferenceID;
    });

    const formatRelativeDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays === 2) return "Last 2 Days";
        if (diffDays === 3) return "Last 3 Days";
        return date.toLocaleDateString();
    };

    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    return (
        <div className="w-full bg-white">
            <h2 className="text-lg p-4 font-semibold text-black">Notes</h2>
            <p className="text-sm text-gray-500 px-4 mb-4">
                This section allows you to track, manage, and update your daily activities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 border-t">
                <div className="col-span-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                            <span className="ml-2 text-xs text-gray-500">Loading data...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredNotes.length === 0 && !loading && (
                                <div className="text-gray-400 text-center">No notes yet</div>
                            )}

                            {filteredNotes
                                .slice()
                                .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
                                .map(note => (
                                    <div
                                        key={note.id}
                                        className={`p-3 border-b shadow-sm flex justify-between items-start cursor-pointer 
                                            ${editingId === note.id ? "bg-orange-100" : "bg-white dark:bg-gray-800"}`}
                                        onClick={() => handleEdit(note)}
                                    >
                                        <div>
                                            <div className="text-gray-700 text-sm font-semibold p-2">
                                                {note.typeactivity}
                                            </div>
                                            <div className="text-xs capitalize text-gray-500 p-2">
                                                {note.remarks.length > 60
                                                    ? note.remarks.slice(0, 60) + "..."
                                                    : note.remarks}
                                            </div>

                                            {/* 🔹 Activity Status Badge */}
                                            <div className="px-2">
                                                <span
                                                    className={`inline-block px-2 py-1 text-[8px] font-medium rounded-full mb-2
                                                        ${note.activitystatus === "Completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : note.activitystatus === "Pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : note.activitystatus === "In Progress"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-gray-200 text-gray-600"
                                                        }`}
                                                >
                                                    {note.activitystatus}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-gray-400 italic font-semibold px-2">
                                                {formatRelativeDate(note.date_created)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="col-span-3">
                    <Form
                        editingId={editingId}
                        activitystatus={activitystatus}
                        typeactivity={typeactivity}
                        remarks={remarks}
                        startdate={startdate}
                        enddate={enddate}
                        activityTypes={activityTypes}
                        setActivityStatus={setActivityStatus}
                        setTypeActivity={setTypeActivity}
                        setRemarks={setRemarks}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        handleDelete={handleDelete}
                        dateUpdated={editingId ? notes.find(n => n.id === editingId)?.date_updated || "" : ""}
                    />
                </div>
            </div>
            <ToastContainer className="text-xs" autoClose={1000} />
        </div>
    );
};

export default Notes;
