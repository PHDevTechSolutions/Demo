"use client";

import React, { useEffect, useState } from "react";

interface ProgressItem {
    companyname: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    typeclient: string;
    referenceid: string;
    date_created: string;
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

interface ProgressProps {
    userDetails: UserDetails | null;
    refreshTrigger: number;
}

const Progress: React.FC<ProgressProps> = ({ userDetails, refreshTrigger }) => {
    const [progress, setProgress] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userDetails?.ReferenceID) return;

        const fetchProgress = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
                );
                const data = await res.json();

                let progressData: ProgressItem[] = [];
                if (Array.isArray(data)) progressData = data;
                else if (Array.isArray(data?.data)) progressData = data.data;
                else if (Array.isArray(data?.progress)) progressData = data.progress;

                const filteredByRef = progressData.filter(
                    (p) => p.referenceid === userDetails.ReferenceID
                );

                const today = new Date();
                const filteredToday = filteredByRef.filter((p) => {
                    const createdDate = new Date(p.date_created);
                    return (
                        createdDate.getFullYear() === today.getFullYear() &&
                        createdDate.getMonth() === today.getMonth() &&
                        createdDate.getDate() === today.getDate()
                    );
                });

                const sorted = filteredToday.sort(
                    (a, b) =>
                        new Date(b.date_created).getTime() -
                        new Date(a.date_created).getTime()
                );

                setProgress(sorted);
            } catch (error) {
                console.error("❌ Error fetching progress:", error);
                setProgress([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [userDetails?.ReferenceID, refreshTrigger]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-xs text-gray-500">Loading data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {progress.length > 0 ? (
                progress.map((prog, idx) => (
                    <div
                        key={`prog-${idx}`}
                        className="rounded-lg shadow bg-white p-3 text-[10px]"
                    >
                        <p className="font-semibold uppercase">{prog.companyname}</p>
                        <p><span className="font-semibold">Contact Person:</span> {prog.contactperson}</p>
                        <p><span className="font-semibold">Contact #:</span> {prog.contactnumber}</p>
                        <p><span className="font-semibold">Email:</span> {prog.emailaddress}</p>
                        <p><span className="font-semibold">Type:</span> {prog.typeclient}</p>
                        <p><span className="font-semibold">Created:</span> {new Date(prog.date_created).toLocaleString()}</p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-400">No progress found for today.</p>
            )}
        </div>
    );
};

export default Progress;
