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
        "Email and Viber Checking",
        "Documentation",
    ];

    useEffect(() => {
        const cachedData = localStorage.getItem(`notes_${userDetails.ReferenceID}`);
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData) as Note[];
                setNotes(parsed);
                setLoading(false); // ✅ agad mawawala yung spinner
            } catch {
                localStorage.removeItem(`notes_${userDetails.ReferenceID}`);
            }
        }
    }, [userDetails.ReferenceID]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch(
                    `/api/ModuleSales/Task/DailyActivity/FetchProgress?referenceid=${userDetails.ReferenceID}`
                );
                if (!res.ok) throw new Error("Failed to fetch notes");

                const data = await res.json();
                if (data.success && data.data) {
                    setNotes(data.data);
                    localStorage.setItem(
                        `notes_${userDetails.ReferenceID}`,
                        JSON.stringify(data.data)
                    );
                }
            } catch (err: any) {
                toast.error("Error fetching notes");
            }
        };

        // 🔹 run fetch in background, huwag setLoading(true) kung may cache na
        fetchNotes();
    }, [userDetails.ReferenceID]);


    const filteredNotes = notes.filter(note => {
        if (!activityTypes.includes(note.typeactivity)) return false;
        if (userDetails.Role === "Super Admin") return true;
        return note.referenceid === userDetails.ReferenceID;
    });

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
            ? notes.find((n) => n.id === editingId)?.activitynumber ||
            generateActivityNumber()
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

            const result = await res.json();
            console.log("API response:", result);

            setNotes((prev) => {
                const filteredPrev = prev.filter((n) => n.id !== payload.id);
                const updated = [payload, ...filteredPrev];
                localStorage.setItem(
                    `notes_${userDetails.ReferenceID}`,
                    JSON.stringify(updated)
                );
                return updated;
            });

            resetForm();
            toast.success(
                editingId ? "Activity updated!" : "Activity submitted successfully!"
            );
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
        try {
            const res = await fetch(
                "/api/ModuleSales/Task/DailyActivity/DeleteProgress",
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                }
            );

            if (!res.ok) throw new Error("Failed to delete activity");

            const result = await res.json();
            console.log("Delete response:", result);

            setNotes((prev) => {
                const updated = prev.filter((n) => n.id !== id);
                localStorage.setItem(
                    `notes_${userDetails.ReferenceID}`,
                    JSON.stringify(updated)
                );
                return updated;
            });

            toast.success("Activity deleted successfully!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong while deleting!");
        }
    };

    // Format ng relative date
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
        // YYYY-MM-DDTHH:MM
        const pad = (n: number) => n.toString().padStart(2, "0");
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="w-full bg-white">
            <h2 className="text-lg p-4 font-semibold text-black">Notes</h2>
            <p className="text-sm text-gray-500 px-4 mb-4">
                This section allows you to track, manage, and update your daily activities.
                Click on an activity from the left to view or edit details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 border-t">
                {/* Left Column */}
                <div className="col-span-1">
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
                                            <div className="text-[11px] text-gray-400 italic px-2">
                                                {formatRelativeDate(note.date_created)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                </div>

                {/* Right Column */}
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
                        dateUpdated={
                            editingId
                                ? notes.find(n => n.id === editingId)?.date_updated || ""
                                : ""
                        }
                    />
                </div>

                {/* Mobile Modal */}
                {editingId && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/40 z-40 md:hidden"
                            onClick={resetForm}
                        ></div>

                        <div className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden shadow-lg bg-white transition-transform duration-300 ease-in-out">
                            <div className="flex justify-end p-2 border-b">
                                <button
                                    onClick={resetForm}
                                    className="text-gray-500 hover:text-gray-800 text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>
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
                                dateUpdated={editingId ? notes.find((n) => n.id === editingId)?.date_updated || "" : ""}
                            />
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default Notes;
