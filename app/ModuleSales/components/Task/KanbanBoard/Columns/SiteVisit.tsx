"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

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

interface SiteVisitItem {
    id: string;
    ReferenceID: string;
    Remarks: string;
    Location: string;
    Type: string;
    PhotoURL: string;
    date_created: string; // for filtering today
}

interface SiteVisitProps {
    userDetails: UserDetails | null;
    refreshTrigger: number;
}

const SiteVisit: React.FC<SiteVisitProps> = ({ userDetails, refreshTrigger }) => {
    const [siteVisits, setSiteVisits] = useState<SiteVisitItem[]>([]);

    const fetchSiteVisits = async () => {
        if (!userDetails?.ReferenceID) return;

        try {
            const res = await fetch(
                `/api/ModuleSales/Acculog/Fetch?ReferenceID=${userDetails.ReferenceID}`
            );
            const data: any[] = await res.json();

            if (!res.ok) throw new Error("Failed to fetch site visits");

            const today = new Date();
            const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

            const filteredData: SiteVisitItem[] = data
                .filter(
                    (item) =>
                        item.ReferenceID === userDetails.ReferenceID &&
                        item.date_created?.split("T")[0] === todayStr
                )
                .map((item) => ({
                    id: item.id,
                    ReferenceID: item.ReferenceID,
                    Remarks: item.Remarks,
                    Location: item.Location,
                    Type: item.Type || "",
                    PhotoURL: item.PhotoURL || "",
                    date_created: item.date_created,
                }));

            setSiteVisits(filteredData);
        } catch (err: any) {
            console.error("❌ Fetch error:", err);
            toast.error(err.message || "Failed to load site visits");
        }
    };

    useEffect(() => {
        fetchSiteVisits();
    }, [userDetails?.ReferenceID, refreshTrigger]);

    return (
        <div className="space-y-1 overflow-y-auto">
            <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
                <span className="mr-1">📍</span>
                Total Site Visits Today:{" "}
                <span className="ml-1 text-red-500">{siteVisits.length}</span>
            </h3>

            <div className="space-y-1">
                {siteVisits.map((visit) => (
                    <div
                        key={`${visit.id || visit.ReferenceID}-${visit.date_created}`}
                        className="p-2 shadow-md rounded-md text-[10px] bg-gray-50 flex items-start gap-2"
                    >
                        {visit.PhotoURL && (
                            <img
                                src={visit.PhotoURL}
                                alt="Visit"
                                className="w-8 h-8 rounded-full object-cover mt-1"
                            />
                        )}
                        <div className="flex-1">
                            <p>
                                <span className="font-semibold">Remarks:</span> {visit.Remarks}
                            </p>
                            <p>
                                <span className="font-semibold">Location:</span> {visit.Location}
                            </p>
                            <p>
                                <span className="font-semibold">Type:</span> {visit.Type}
                            </p>
                            <p className="text-gray-500 text-[10px]">
                                {new Date(visit.date_created).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SiteVisit;
