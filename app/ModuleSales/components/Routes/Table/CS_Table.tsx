"use client";
import React, { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
    activitystatus: string;
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
    const [mainTab, setMainTab] = useState<"PerAgent" | "PerCompany" | "Statistics">("PerAgent");
    const [groupedData, setGroupedData] = useState<{ [key: string]: GroupedData }>({});
    const [activeTab, setActiveTab] = useState<"MTD" | "YTD">("MTD");
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = Array.from(new Array(10), (_, index) => new Date().getFullYear() - index);

    // 🟢 Grouped Data
    useEffect(() => {
        const filteredPosts = posts.filter((post) => {
            const postDate = new Date(post.date_created);
            return (
                (selectedMonth === postDate.getMonth() + 1 && selectedYear === postDate.getFullYear()) ||
                (activeTab === "YTD" && postDate.getFullYear() === selectedYear)
            );
        });

        const grouped = filteredPosts.reduce((acc: { [key: string]: GroupedData }, post: Post) => {
            const date = new Date(post.date_created);
            const year = date.getFullYear();
            const monthName = date.toLocaleString("en-US", { month: "long" });

            let key = "";
            if (mainTab === "PerAgent" || mainTab === "Statistics") {
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
                    AgentFirstname: post.AgentFirstname,
                    AgentLastname: post.AgentLastname,
                    ReferenceID: post.referenceid,
                    CompanyName: post.companyname,
                    date_created: activeTab === "MTD" ? `${monthName} ${year}` : `${year}`,
                    targetQuota: post.targetquota * (activeTab === "YTD" ? 12 : 1),
                    OutboundCalls: 0,
                    totalSI: 0,
                    records: [],
                };
            }

            acc[key].records.push(post);
            if (post.source === "Outbound - Touchbase") acc[key].OutboundCalls += 1;
            acc[key].totalSI += post.activitystatus === "Delivered" ? 1 : 0;

            return acc;
        }, {});

        setGroupedData(grouped);
    }, [posts, activeTab, selectedMonth, selectedYear, mainTab]);

    // 🟢 Chart Data for Statistics
    const chartData = useMemo(() => {
        const currentMonth = selectedMonth;
        const currentYear = selectedYear;
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const currentCalls = posts.filter((p) => {
            const d = new Date(p.date_created);
            return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && p.source === "Outbound - Touchbase";
        }).length;

        const prevCalls = posts.filter((p) => {
            const d = new Date(p.date_created);
            return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear && p.source === "Outbound - Touchbase";
        }).length;

        return [
            {
                name: months[currentMonth - 1],
                Calls: currentCalls,
            },
            {
                name: months[prevMonth - 1],
                Calls: prevCalls,
            },
        ];
    }, [posts, selectedMonth, selectedYear]);

    return (
        <div className="overflow-x-auto">
            {/* 🟢 Main Tabs */}
            <div className="mb-4 border-b border-gray-300">
                <nav className="flex space-x-4">
                    <button
                        onClick={() => setMainTab("PerAgent")}
                        className={`py-2 px-4 text-xs font-medium ${mainTab === "PerAgent" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                    >
                        Per Agent
                    </button>
                    <button
                        onClick={() => setMainTab("PerCompany")}
                        className={`py-2 px-4 text-xs font-medium ${mainTab === "PerCompany" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                    >
                        Per Company
                    </button>
                    <button
                        onClick={() => setMainTab("Statistics")}
                        className={`py-2 px-4 text-xs font-medium ${mainTab === "Statistics" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"}`}
                    >
                        Statistics
                    </button>
                </nav>
            </div>

            {/* 🟢 Month & Year Selectors */}
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

            {/* 🟢 Statistics Chart Tab */}
            {mainTab === "Statistics" ? (
                <div className="w-full h-96 p-4 bg-white shadow-md rounded-2xl">
                    <ResponsiveContainer>
                        <BarChart data={chartData} barCategoryGap="20%">
                            {/* Grid */}
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                            {/* Axis */}
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

                            {/* Custom Tooltip */}
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number, name: string) =>
                                    name === "Sales" ? "₱" + value.toLocaleString() : value
                                }
                            />

                            <Legend wrapperStyle={{ fontSize: "12px" }} />

                            {/* Calls Bar */}
                            <Bar
                                dataKey="Calls"
                                fill="url(#colorCalls)"
                                radius={[8, 8, 0, 0]}
                                animationDuration={1200}
                            />

                            {/* Sales Bar */}
                            <Bar
                                dataKey="Sales"
                                fill="url(#colorSales)"
                                radius={[8, 8, 0, 0]}
                                animationDuration={1200}
                            />

                            {/* Gradients */}
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
                                </linearGradient>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            ) : (
                // 🟢 Existing Table (PerAgent / PerCompany)
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
                            <th className="px-6 py-4 font-semibold text-gray-700">
                                {mainTab === "PerAgent" ? "Agent" : "Company"}
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-700">{activeTab === "MTD" ? "Month" : "Year"}</th>
                            {mainTab === "PerAgent" && <th className="px-6 py-4 font-semibold text-gray-700">Target</th>}
                            <th className="px-6 py-4 font-semibold text-gray-700"># of Calls</th>
                            <th className="px-6 py-4 font-semibold text-gray-700"># of SI</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">% Calls to SI</th>
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
            )}
        </div>
    );
};

export default React.memo(UsersCard);
