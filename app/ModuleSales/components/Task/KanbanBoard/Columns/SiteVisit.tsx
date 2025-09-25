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
    date_created: string;
    Email: string;
}

interface SiteVisitProps {
    userDetails: UserDetails | null;
    refreshTrigger: number;
}

// ✅ Static map of TSM → Agents
const tsmAgentMap: Record<string, string[]> = {
    "AB-NCR-288130": [
        "j.puying@ecoshiftcorp.com",
        "v.ortiz@ecoshiftcorp.com",
        "s.rapote@ecoshiftcorp.com",
        "m.quijano@ecoshiftcorp.com",
        "j.candazo@ecoshiftcorp.com",
        "w.ardeloso@ecoshiftcorp.com",
        "a.patelo@ecoshiftcorp.com",
        "c.bobis@ecoshiftcorp.com",
        "c.notob@ecoshiftcorp.com"
    ],
    "JA-NCR-727428": [
        "e.laude@ecoshiftcorp.com",
        "r.barnes@ecoshiftcorp.com",
        "c.acierto@ecoshiftcorp.com",
        "a.panopio@ecoshiftcorp.com",
        "s.santos@ecoshiftcorp.com"
    ],
    "RT-NCR-815758": [
        "r.ico@ecoshiftcorp.com",
        "r.francisco@ecoshiftcorp.com",
        "a.perez@ecoshiftcorp.com",
        "j.lacson@ecoshiftcorp.com",
        "l.deguzman@ecoshiftcorp.com",
        "r.delizo@ecoshiftcorp.com",
        "r.delrosario@ecoshiftcorp.com",
        "g.roxas@ecoshiftcorp.com",
        "d.doyugan@ecoshiftcorp.com",
        "g.aquino@ecoshiftcorp.com"
    ],
    "JM-CBU-702043": [
        "m.villagonzalo@ecoshiftcorp.com",
        "j.tan@ecoshiftcorp.com",
        "m.doroja@ecoshiftcorp.com",
        "f.navarro@ecoshiftcorp.com"
    ],
    "MP-CDO-613398": [
        "j.pinero@ecoshiftcorp.com",
        "k.yango@ecoshiftcorp.com",
        "n.jarabejo@ecoshiftcorp.com",
        "n.maranga@ecoshiftcorp.com",
        "j.jungaya@ecoshiftcorp.com",
        "k.guangco@ecoshiftcorp.com",
        "c.gumapac@ecoshiftcorp.com",
        "v.posadas@ecoshiftcorp.com",
        "r.nocete@ecoshiftcorp.com",
        "a.delute@disruptivesolutionsinc.com"
    ],
    "MF-PH-840897": [
        "r.mendoza@ecoshiftcorp.com",
        "r.binondo@ecoshiftcorp.com",
        "b.lising@ecoshiftcorp.com",
        "j.delacerna@ecoshiftcorp.com",
        "j.soriente@ecoshiftcorp.com",
        "j.clarin@ecoshiftcorp.com",
        "a.estor@ecoshiftcorp.com",
        "m.magdaong@ecoshiftcorp.com"
    ]
};

const SiteVisit: React.FC<SiteVisitProps> = ({ userDetails, refreshTrigger }) => {
    const [siteVisits, setSiteVisits] = useState<SiteVisitItem[]>([]);

    const fetchSiteVisits = async () => {
        if (!userDetails) return;

        try {
            // ✅ Always fetch by ReferenceID
            const res = await fetch(`/api/ModuleSales/Acculog/Fetch?ReferenceID=${userDetails.ReferenceID}`);
            if (!res.ok) throw new Error("Failed to fetch site visits");

            const data: any[] = await res.json();

            const today = new Date();
            const todayStr = today.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

            let filteredData: SiteVisitItem[] = data
                .filter((item) => {
                    const itemDate = new Date(item.date_created).toLocaleDateString("en-CA", {
                        timeZone: "Asia/Manila",
                    });
                    return itemDate === todayStr;
                })
                .map((item) => ({
                    id: item.id,
                    ReferenceID: item.ReferenceID,
                    Remarks: item.Remarks,
                    Location: item.Location,
                    Type: item.Type || "",
                    PhotoURL: item.PhotoURL || "",
                    Email: item.Email || "",
                    date_created: item.date_created,
                }));

            // ✅ Apply filtering kung TSM
            if (userDetails.Role === "Territory Sales Manager") {
                const allowedAgents = tsmAgentMap[userDetails.ReferenceID] || [];
                filteredData = filteredData.filter((visit) =>
                    allowedAgents.includes(visit.Email)
                );
            }

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
                                <span className="font-semibold">Email:</span> {visit.Email}
                            </p>
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
                                {new Date(visit.date_created).toLocaleString("en-PH", {
                                    timeZone: "Asia/Manila",
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SiteVisit;
