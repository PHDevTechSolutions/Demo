"use client";

import React, { useEffect, useState } from "react";

interface Company {
    id?: number;
    companyname: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    typeclient: string;
    address?: string;
}

interface CompaniesProps {
    expandedIdx: string | null;
    setExpandedIdx: (id: string | null) => void;
    handleSubmit: (data: Partial<Company>, isInquiry: boolean) => void;
    userDetails: { ReferenceID?: string } | null;
}

const Companies: React.FC<CompaniesProps> = ({
    expandedIdx,
    setExpandedIdx,
    handleSubmit,
    userDetails,
}) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!userDetails?.ReferenceID) return;

        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
                );
                const data = await res.json();

                let companiesData: Company[] = [];
                if (Array.isArray(data)) companiesData = data;
                else if (Array.isArray(data?.data)) companiesData = data.data;
                else if (Array.isArray(data?.companies)) companiesData = data.companies;

                const shuffled = [...companiesData].sort(() => 0.5 - Math.random());
                setCompanies(shuffled.slice(0, 5));
            } catch (error) {
                console.error("Error fetching companies:", error);
                setCompanies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, [userDetails?.ReferenceID]);

    return (
        <div className="space-y-4 overflow-y-auto">
            <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
                <span className="mr-1">🏢</span> Companies
            </h3>

            {companies.length > 0 ? (
                companies.map((comp, idx) => {
                    const key = `comp-${idx}`;
                    const isExpanded = expandedIdx === key;

                    return (
                        <div
                            key={key}
                            className="rounded-lg border bg-blue-100 shadow transition text-[10px] mb-2"
                        >
                            {/* Header row */}
                            <div
                                className="cursor-pointer flex justify-between items-center p-3"
                                onClick={() => setExpandedIdx(isExpanded ? null : key)}
                            >
                                <p className="font-semibold uppercase">{comp.companyname}</p>

                                {/* Actions: Add + Collapse */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubmit(comp, false);
                                        }}
                                        className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600"
                                    >
                                        Add
                                    </button>
                                    <span className="text-gray-400">
                                        {isExpanded ? "▲" : "▼"}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div className="p-3 space-y-1">
                                    <p>
                                        <span className="font-semibold">Contact Person:</span>{" "}
                                        {comp.contactperson}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Contact #:</span>{" "}
                                        {comp.contactnumber}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Email:</span>{" "}
                                        {comp.emailaddress}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Type:</span>{" "}
                                        {comp.typeclient}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Address:</span>{" "}
                                        {comp.address || "N/A"}
                                    </p>
                                </div>
                            )}
                            {/* Footer timestamp */}
                            <div className="p-2 text-gray-500 text-[9px]">
                                {comp.typeclient}
                            </div>
                        </div>
                    );
                })
            ) : (
                <p className="text-xs text-gray-400">No companies found.</p>
            )}
        </div>
    );
};

export default Companies;
