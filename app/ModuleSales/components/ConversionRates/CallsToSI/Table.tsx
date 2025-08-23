"use client";
import React, { useEffect, useState } from "react";

interface Post {
    id: string;
    AgentFirstname: string;
    AgentLastname: string;
    referenceid: string;
    companyname: string;
    date_created: string;
    targetquota: number;
    soamount: number;
    actualsales: number;
    typeactivity: string;
    source: string;
    activitystatus: string; // <-- dito gagamitin natin
}

interface GroupedData {
    AgentFirstname?: string;
    AgentLastname?: string;
    ReferenceID: string;
    CompanyName?: string;
    date_created: string;
    targetQuota: number;
    OutboundCalls: number;
    totalSI: number;
    records: Post[];
}

interface UsersCardProps {
    posts: Post[];
}

const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-US", { minimumFractionDigits: 0 });

const UsersCard: React.FC<UsersCardProps> = ({ posts }) => {
    const [mainTab, setMainTab] = useState<"PerAgent" | "PerCompany">("PerAgent");
    const [groupedData, setGroupedData] = useState<{ [key: string]: GroupedData }>(
        {}
    );
    const [activeTab, setActiveTab] = useState<"MTD" | "YTD">("MTD");
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = Array.from(
        new Array(10),
        (_, index) => new Date().getFullYear() - index
    );

    useEffect(() => {
        const filteredPosts = posts.filter((post) => {
            const postDate = new Date(post.date_created);
            return (
                (selectedMonth === postDate.getMonth() + 1 &&
                    selectedYear === postDate.getFullYear()) ||
                (activeTab === "YTD" && postDate.getFullYear() === selectedYear)
            );
        });

        const grouped = filteredPosts.reduce(
            (acc: { [key: string]: GroupedData }, post: Post) => {
                const date = new Date(post.date_created);
                const year = date.getFullYear();
                const monthName = date.toLocaleString("en-US", { month: "long" });

                let key = "";
                if (mainTab === "PerAgent") {
                    key =
                        activeTab === "MTD"
                            ? `${post.AgentFirstname} ${post.AgentLastname} ${monthName} ${year}`
                            : `${post.AgentFirstname} ${post.AgentLastname} ${year}`;
                } else {
                    key =
                        activeTab === "MTD"
                            ? `${post.companyname} ${monthName} ${year}`
                            : `${post.companyname} ${year}`;
                }

                if (!acc[key]) {
                    acc[key] = {
                        AgentFirstname: mainTab === "PerAgent" ? post.AgentFirstname : undefined,
                        AgentLastname: mainTab === "PerAgent" ? post.AgentLastname : undefined,
                        ReferenceID: post.referenceid,
                        CompanyName: mainTab === "PerCompany" ? post.companyname : undefined,
                        date_created: activeTab === "MTD" ? `${monthName} ${year}` : `${year}`,
                        targetQuota: post.targetquota * (activeTab === "YTD" ? 12 : 1),
                        OutboundCalls: 0,
                        totalSI: 0,
                        records: [],
                    };
                }

                acc[key].records.push(post);

                // Outbound calls
                if (post.source === "Outbound - Touchbase") acc[key].OutboundCalls += 1;

                // SI count based on activitystatus === "Delivered"
                acc[key].totalSI += post.activitystatus === "Delivered" ? 1 : 0;

                return acc;
            },
            {}
        );

        setGroupedData(grouped);
    }, [posts, activeTab, selectedMonth, selectedYear, mainTab]);

    return (
        <div className="overflow-x-auto">
            {/* Main Tabs */}
            <div className="mb-4 border-b border-gray-300">
                <nav className="flex space-x-4">
                    <button
                        onClick={() => setMainTab("PerAgent")}
                        className={`py-2 px-4 text-xs font-medium ${mainTab === "PerAgent" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                            }`}
                    >
                        Per Agent
                    </button>
                    <button
                        onClick={() => setMainTab("PerCompany")}
                        className={`py-2 px-4 text-xs font-medium ${mainTab === "PerCompany" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                            }`}
                    >
                        Per Company
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="mb-4 flex items-center gap-4">
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="py-2 px-4 text-xs border shadow-md"
                >
                    {months.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                    ))}
                </select>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="py-2 px-4 text-xs border shadow-md"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Sub Tabs */}
            <div className="mb-4 border-b border-gray-200">
                <nav className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab("MTD")}
                        className={`py-2 px-4 text-xs font-medium ${activeTab === "MTD" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                            }`}
                    >
                        MTD
                    </button>
                    <button
                        onClick={() => setActiveTab("YTD")}
                        className={`py-2 px-4 text-xs font-medium ${activeTab === "YTD" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                            }`}
                    >
                        YTD
                    </button>
                </nav>
            </div>

            {/* Table */}
            <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                    <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
                        <th className="px-6 py-4 font-semibold text-gray-700">{mainTab === "PerAgent" ? "Agent" : "Company"}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">{activeTab === "MTD" ? "Month" : "Year"}</th>
                        {mainTab === "PerAgent" && <th className="px-6 py-4 font-semibold text-gray-700">Target</th>}
                        <th className="px-6 py-4 font-semibold text-gray-700"># of Calls</th>
                        <th className="px-6 py-4 font-semibold text-gray-700"># of SI</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">% Calls to SI</th>
                    </tr>
                </thead>
                {/* TOTAL Row */}
                <thead className="bg-gray-50 font-semibold text-xs">
                    <tr>
                        <td className="px-6 py-4">TOTAL</td>
                        <td></td>
                        {mainTab === "PerAgent" && (
                            <td className="px-6 py-4">
                                ₱{formatCurrency(
                                    Object.values(groupedData).reduce((sum, g) => sum + g.targetQuota, 0)
                                )}
                            </td>
                        )}
                        <td className="px-6 py-4">
                            {Object.values(groupedData).reduce((sum, g) => sum + g.OutboundCalls, 0)}
                        </td>
                        <td className="px-6 py-4">
                            {Object.values(groupedData).reduce((sum, g) => sum + g.totalSI, 0)}
                        </td>
                        <td className="px-6 py-4">
                            {(() => {
                                const totalCalls = Object.values(groupedData).reduce((sum, g) => sum + g.OutboundCalls, 0);
                                const totalSI = Object.values(groupedData).reduce((sum, g) => sum + g.totalSI, 0);
                                return totalCalls > 0 ? ((totalSI / totalCalls) * 100).toFixed(2) + "%" : "0%";
                            })()}
                        </td>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {Object.values(groupedData).length > 0 ? Object.values(groupedData).map((group, idx) => {
                        const percentageCalls = group.OutboundCalls > 0 ? (group.totalSI / group.OutboundCalls) * 100 : 0;

                        return (
                            <tr key={`${group.ReferenceID}-${group.date_created}-${idx}`} className="border-b whitespace-nowrap">
                                <td className="px-6 py-4 text-xs font-bold">
                                    {mainTab === "PerAgent" ? `${group.AgentFirstname} ${group.AgentLastname}` : group.CompanyName || "Unknown Company"}
                                    <br />
                                    <span className="text-gray-900 text-[8px]">({group.ReferenceID})</span>
                                </td>
                                <td className="px-6 py-4 text-xs">{group.date_created}</td>
                                {mainTab === "PerAgent" && <td className="px-6 py-4 text-xs">₱{formatCurrency(group.targetQuota)}</td>}
                                <td className="px-6 py-4 text-xs">{group.OutboundCalls}</td>
                                <td className="px-6 py-4 text-xs">{group.totalSI}</td>
                                <td className="px-6 py-4 text-xs">{percentageCalls.toFixed(2)}%</td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={mainTab === "PerAgent" ? 6 : 5} className="text-center text-xs py-4 border">No accounts available</td>
                        </tr>
                    )}
                </tbody>

            </table>
        </div>
    );
};

export default React.memo(UsersCard);
