"use client";

import React, { useEffect, useState } from "react";
import { MdEdit, MdOutlineClose, MdDelete } from 'react-icons/md';

interface FormProps {
    editingId: number | null;
    activitystatus: string;
    typeactivity: string;
    remarks: string;
    startdate: string;
    enddate: string;
    activityTypes: string[];
    setActivityStatus: (value: string) => void;
    setTypeActivity: (value: string) => void;
    setRemarks: (value: string) => void;
    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
    handleSubmit: () => void;
    resetForm: () => void;
    handleDelete: (id: number) => void;
    dateUpdated?: string;
}

const Form: React.FC<FormProps> = ({
    editingId,
    activitystatus,
    typeactivity,
    remarks,
    startdate,
    enddate,
    activityTypes,
    setActivityStatus,
    setTypeActivity,
    setRemarks,
    setStartDate,
    setEndDate,
    handleSubmit,
    resetForm,
    handleDelete,
    dateUpdated,
}) => {
    const [relativeTime, setRelativeTime] = useState("");

    const formatRelativeTime = (date: string) => {
        if (!date) return "";
        const now = new Date();
        const updated = new Date(date);
        const diffMs = now.getTime() - updated.getTime();

        if (isNaN(updated.getTime())) return "";

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (seconds < 60)
            return `Last edited ${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
        if (minutes < 60)
            return `Last edited ${minutes} min${minutes !== 1 ? "s" : ""} ago`;
        if (hours < 24)
            return `Last edited ${hours} hour${hours !== 1 ? "s" : ""} ago`;
        if (days === 1) return "Last edited yesterday";
        if (days < 7) return `Last edited ${days} days ago`;
        if (weeks < 4)
            return `Last edited ${weeks} week${weeks !== 1 ? "s" : ""} ago`;
        return `Last edited ${months} month${months !== 1 ? "s" : ""} ago`;
    };

    useEffect(() => {
        if (dateUpdated) {
            setRelativeTime(formatRelativeTime(dateUpdated));
            const interval = setInterval(() => {
                setRelativeTime(formatRelativeTime(dateUpdated));
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [dateUpdated]);

    const formatTimeAgo = (dateStr?: string) => {
        if (!dateStr) return "";
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();

        const seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;

        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setRelativeTime(formatTimeAgo(dateUpdated));
        }, 1000);
        return () => clearInterval(interval);
    }, [dateUpdated]);


    return (
        <div className="p-4 border-l flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-semibold">
                    {editingId ? "Edit Activity" : "New Activity"}
                </h3>

                {dateUpdated && (
                    <p className="text-xs text-gray-400 italic">
                        Last edited {formatTimeAgo(dateUpdated)}
                    </p>
                )}
            </div>

            <div className="flex gap-2 border-b border-t p-2">
                <select
                    value={activitystatus}
                    onChange={(e) => setActivityStatus(e.target.value)}
                    className="flex-1 p-2 text-xs focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                </select>

                <select
                    value={typeactivity}
                    onChange={(e) => setTypeActivity(e.target.value)}
                    className="flex-1 p-2 text-xs focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option value="">Select Activity</option>
                    {activityTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                placeholder="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={30}
                className="w-full p-2 border-b text-xs focus:outline-none focus:ring focus:ring-blue-300"
            />

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-xs mb-1">Start Date</label>
                    <input
                        type="datetime-local"
                        value={startdate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border-b text-xs focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs mb-1">End Date</label>
                    <input
                        type="datetime-local"
                        value={enddate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border-b text-xs focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-1"
                    >
                        <MdEdit size={18} /> {editingId ? "Update" : "Submit"}
                    </button>

                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition flex items-center gap-1"
                        >
                            <MdOutlineClose size={18} /> Cancel
                        </button>
                    )}
                </div>

                {editingId && (
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this activity?")) {
                                handleDelete(editingId);
                                resetForm();
                            }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center gap-1"
                    >
                        <MdDelete size={18} /> Delete
                    </button>
                )}
            </div>

        </div>
    );
};

export default Form;
