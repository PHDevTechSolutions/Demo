"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearchOutline, IoFilter } from "react-icons/io5";
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

const ITEMS_PER_PAGE = 10;

const Notes: React.FC<NotesProps> = ({ posts = [], userDetails }) => {
    const [notes, setNotes] = useState<Note[]>(posts);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const [activitystatus, setActivityStatus] = useState("");
    const [typeactivity, setTypeActivity] = useState("");
    const [remarks, setRemarks] = useState("");
    const [startdate, setStartDate] = useState("");
    const [enddate, setEndDate] = useState("");

    const [showSearch, setShowSearch] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    const activityTypes = [
        "Assisting Other Agent Clients",
        "Coordination of SO To Warehouse",
        "Coordination of SO to Orders",
        "Updating Reports",
        "Check/Read emails",
        "Documentation",
    ];

    const safeSetItem = (key: string, value: string) => {
        try {
            localStorage.setItem(key, value);
        } catch (e: any) {
            if (e.name === "QuotaExceededError" || e.code === 22) {
                const noteKeys = Object.keys(localStorage).filter(k => k.startsWith("notes_"));
                if (noteKeys.length > 0) {
                    localStorage.removeItem(noteKeys[0]);
                    try {
                        localStorage.setItem(key, value);
                    } catch {
                        console.error("Still cannot save notes after cleanup.");
                    }
                }
            } else {
                console.error("LocalStorage error:", e);
            }
        }
    };

    const syncToCache = (newNotes: Note[]) => {
        setNotes(newNotes);
        safeSetItem(`notes_${userDetails.ReferenceID}`, JSON.stringify(newNotes));
    };

    useEffect(() => {
        const cached = localStorage.getItem(`notes_${userDetails.ReferenceID}`);
        if (cached) setNotes(JSON.parse(cached));

        const fetchNotes = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ModuleSales/Task/Notes/Fetch?referenceid=${userDetails.ReferenceID}`);
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

        syncToCache([payload, ...notes.filter(n => n.id !== payload.id)]);

        try {
            const url = editingId ? "/api/ModuleSales/Task/Notes/Edit" : "/api/ModuleSales/Task/Notes";
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
        setShowDeleteModal(false);
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

    const filteredNotes = notes
        // only show notes within the allowed types
        .filter(note => activityTypes.includes(note.typeactivity))
        // apply dropdown filter
        .filter(note => filterType === "All" || note.typeactivity === filterType)
        // apply search
        .filter(note =>
            note.typeactivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.remarks.toLowerCase().includes(searchTerm.toLowerCase())
        )
        // apply user role visibility
        .filter(note =>
            userDetails.Role === "Super Admin" ||
            note.referenceid === userDetails.ReferenceID
        );

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
            <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-black">Notes</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSearch(prev => !prev)}
                        className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs">
                        <IoSearchOutline
                            className={`cursor-pointer text-xl ${showSearch ? "text-blue-600" : "text-gray-600"}`}
                            title="Search Notes"
                            size={15}
                        />  Search
                    </button>
                    <button
                        onClick={() => setShowFilter(prev => !prev)}
                        className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs">
                        <IoFilter
                            className={`cursor-pointer text-xl ${showFilter ? "text-blue-600" : "text-gray-600"}`}
                            size={15}
                            title="Filter by Type"
                        /> Filter
                    </button>
                </div>
            </div>

            {/* Search bar */}
            {showSearch && (
                <div className="p-3 mb-2 border-b bg-gray-50">
                    <input
                        type="text"
                        placeholder="Search by remarks or type..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </div>
            )}

            {/* Filter dropdown */}
            {showFilter && (
                <div className="p-3 mb-2 border-b bg-gray-50">
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring focus:ring-blue-200"
                    >
                        <option value="All">All Types</option>
                        {activityTypes.map((type, idx) => (
                            <option key={idx} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <p className="text-sm text-gray-500 px-4 mb-4">
                This section allows you to track, manage, and update your daily activities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 border-t">
                <div className="col-span-1">
                    {loading ? (
                        <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                            <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredNotes.length === 0 && !loading && (
                                <div className="text-gray-400 text-center text-xs">No notes yet</div>
                            )}

                            {filteredNotes
                                .slice(0, visibleCount)
                                .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
                                .map(note => (
                                    <div
                                        key={note.id}
                                        className={`p-3 border-b shadow-sm flex justify-between items-start cursor-pointer 
                                            ${editingId === note.id ? "bg-orange-100" : "bg-white dark:bg-gray-800"}`}
                                        onClick={() => handleEdit(note)}
                                    >
                                        <div>
                                            <div className="text-gray-700 text-sm font-semibold p-2">{note.typeactivity}</div>
                                            <div className="text-xs capitalize text-gray-500 p-2">
                                                {note.remarks.length > 60 ? note.remarks.slice(0, 60) + "..." : note.remarks}
                                            </div>

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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTargetId(note.id);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Delete?"
                                            className="bg-red-400 text-white shadow-md rounded text-xs p-2"
                                        >
                                            <AiOutlineDelete />
                                        </button>
                                    </div>
                                ))}

                            {visibleCount < filteredNotes.length && (
                                <div className="flex justify-center mt-2">
                                    <button
                                        className="w-full px-3 py-2 bg-gray-200 text-black rounded text-xs hover:bg-gray-300"
                                        onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                    >
                                        View More
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showDeleteModal && (
                    <div className="fixed inset-0 z-[9999] bg-opacity-[10] flex items-center justify-center bg-black/20 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-500 to-red-600">
                                <h3 className="text-white font-semibold text-lg">Confirm Delete</h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-white hover:text-gray-200 transition text-lg"
                                >
                                    ✖
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 text-xs text-gray-700 space-y-2">
                                <p>
                                    Are you sure you want to delete this note? This action cannot be undone.
                                </p>

                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
                                    disabled={loading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-xs"
                                >
                                    {loading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        dateUpdated={
                            editingId ? notes.find((n) => n.id === editingId)?.date_updated || "" : ""
                        }
                    />
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                className="text-xs z-[99999]"
                toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
                progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
            />
        </div>
    );
};

export default Notes;
