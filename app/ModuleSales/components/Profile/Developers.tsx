"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

type Contributor = {
    name: string;
    role: string;
    roleTag: string;
};

// Current contributors
const currentContributors: Contributor[] = [
    { name: "Liesther Roluna | Leroux Y Xchire", role: "Senior Fullstack Developer", roleTag: "Fullstack" },
    { name: "Babyrose Nebril", role: "Junior Developer", roleTag: "Frontend" },
    { name: "Bryan Menor", role: "Database Coordinator", roleTag: "Database" },
    { name: "Jeff Camagong", role: "Taskflow Trainer", roleTag: "Trainer" },
    { name: "Jomelee Merencillo", role: "Project Manager", roleTag: "PM" },
];

// Previous contributors
const previousContributors: Contributor[] = [
    { name: "Mark Rivera", role: "Project Supervisor", roleTag: "Previous" },
    { name: "Anthony Melgarejo", role: "Network and Securities", roleTag: "Previous" },
];

const roleColors: Record<string, string> = {
    PM: "bg-blue-100 text-blue-800",
    Fullstack: "bg-green-100 text-green-800",
    Frontend: "bg-purple-100 text-purple-800",
    Database: "bg-yellow-100 text-yellow-800",
    Trainer: "bg-orange-100 text-orange-800",
    Previous: "bg-gray-100 text-gray-800",
};

const versionLogs = [
    { version: "v4.3", date: "2025-08-16", change: "New Features Updated | Session Logs, Conversion Rates | Sales Performance" },
    { version: "v3.1", date: "2025-07-15", change: "Revamp" },
    { version: "v2.3", date: "2025-07-15", change: "Adjustment" },
    { version: "v1.0", date: "2025-05-30", change: "Initial contributor list created" },
    { version: "v1.1", date: "2025-05-30", change: "Enhanced UI with tags, animation, and log section" },
];

const Developer: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 p-6 bg-white shadow-lg rounded-2xl text-gray-800"
        >
            <h2 className="text-2xl font-bold text-center mb-6">Project Contributors</h2>

            {/* Current Contributors */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Current Contributors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {currentContributors.map((c, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium">{c.role}</label>
                                <span className={`text-xs px-2 py-1 rounded-full ${roleColors[c.roleTag]}`}>
                                    {c.roleTag}
                                </span>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={c.name}
                                readOnly
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Previous Contributors */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Previous Contributors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {previousContributors.map((c, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium">{c.role}</label>
                                <span className={`text-xs px-2 py-1 rounded-full ${roleColors[c.roleTag]}`}>
                                    {c.roleTag}
                                </span>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={c.name}
                                readOnly
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Version History */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Version History</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                    {versionLogs.map((log, i) => (
                        <li
                            key={i}
                            className="flex justify-between bg-gray-50 p-2 rounded-md items-center"
                        >
                            <div className="flex gap-2">
                                <span className="font-medium">{log.version}</span>
                                <span>{log.change}</span>
                            </div>
                            <span className="text-xs text-gray-400">{log.date}</span>
                        </li>
                    ))}
                </ul>
            </div>


            <p className="text-right text-xs text-gray-500 italic mt-4">
                Contributors: Maricris Mercado, Betty Rodriguez
            </p>
        </motion.div>
    );
};

export default Developer;
