import React, { useState, useMemo, useEffect } from "react";

interface Post {
    id: string;
    referenceid: string;
    date_created: string;
    companyname: string;
    contactperson: string;
    ticketreferencenumber: string;
    activitystatus: string;
    quotationamount: number;
    remarks: string;
}

interface TableProps {
    posts: Post[];
    handleEdit: (post: any) => void;
}

const Table: React.FC<TableProps> = ({ posts, handleEdit }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [agentData, setAgentData] = useState<
        Record<string, { name: string; profilePicture: string }>
    >({});
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const parseDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const filteredPosts = useMemo(() => {
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        return posts.filter((post) => {
            const postDate = parseDate(post.date_created);
            return (!start || !postDate || postDate >= start) &&
                (!end || !postDate || postDate <= end);
        });
    }, [posts, startDate, endDate]);

    const sortedPosts = useMemo(() => {
        return [...filteredPosts].sort((a, b) => {
            const dateA = new Date(a.date_created).getTime();
            const dateB = new Date(b.date_created).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });
    }, [filteredPosts, sortOrder]);

    const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        return sortedPosts.slice(startIdx, startIdx + itemsPerPage);
    }, [sortedPosts, currentPage, itemsPerPage]);

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Manila",
        });
    };

    const formatCurrency = (value: number | string) => {
        const number = typeof value === "string" ? parseFloat(value) || 0 : value || 0;
        return number.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
        });
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    };

    useEffect(() => {
        const fetchAgents = async () => {
            const uniqueReferenceIds = Array.from(new Set(posts.map((p) => p.referenceid)));
            const dataMap: Record<string, { name: string; profilePicture: string }> = {};

            await Promise.all(
                uniqueReferenceIds.map(async (id) => {
                    try {
                        const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(id)}`);
                        const data = await res.json();

                        dataMap[id] = {
                            name: `${data.Lastname || ""}, ${data.Firstname || ""}`.trim(),
                            profilePicture: data.profilePicture || "/taskflow.png",
                        };
                    } catch (error) {
                        console.error(`Error fetching user ${id}`, error);
                        dataMap[id] = { name: "", profilePicture: "/taskflow.png" };
                    }
                })
            );

            setAgentData(dataMap);
        };

        if (posts.length > 0) {
            fetchAgents();
        }
    }, [posts]);

    const totalQuotationAmount = useMemo(() => {
        return filteredPosts.reduce((sum, p) => sum + (Number(p.quotationamount) || 0), 0);
    }, [filteredPosts]);

    const totalQuotationCount = useMemo(() => filteredPosts.length, [filteredPosts]);

    return (
        <div>
            <div className="mb-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold">Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                        className="border px-3 py-2 rounded text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                        className="border px-3 py-2 rounded text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold">Items per page:</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="border px-3 py-2 rounded text-xs"
                    >
                        {[10, 25, 50, 100].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto relative">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
                            <th
                                className="px-6 py-4 font-semibold text-gray-700 cursor-pointer select-none"
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            >
                                Date {sortOrder === "desc" ? "▼" : "▲"}
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Ticket Reference Number</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Amount</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
                            <th className="px-6 py-3 font-semibold text-gray-700">Agent Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Contact Person</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4 text-xs">No records available</td>
                            </tr>
                        ) : (
                            paginatedData.map((post) => (
                                <tr key={post.id} className="border-b whitespace-nowrap">
                                    <td className="px-6 py-4 text-xs">{post.date_created}</td>
                                    <td className="px-6 py-4 text-xs">{post.ticketreferencenumber}</td>
                                    <td className="px-6 py-4 text-xs">{formatCurrency(post.quotationamount)}</td>
                                    <td className="px-6 py-4 text-xs uppercase">{post.companyname}</td>
                                    <td className="px-6 py-4 text-xs capitalize text-orange-700">
                                        {agentData[post.referenceid] ? (
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={agentData[post.referenceid].profilePicture}
                                                    alt={agentData[post.referenceid].name || "Agent"}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                                                />
                                                <span>{agentData[post.referenceid].name || "Unknown"}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Loading...</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs capitalize">{post.contactperson}</td>
                                    <td className="px-6 py-4 text-xs capitalize">{post.remarks}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-gray-200 sticky bottom-0 z-10 font-bold text-gray-700 text-xs">
                        <tr>
                            <td colSpan={1}></td>
                            <td className="px-6 py-3 text-green-700">Total Quotation Amount</td>
                            <td className="px-6 py-3">{formatCurrency(totalQuotationAmount)}</td>
                            <td className="px-6 py-3">Quantity: {totalQuotationCount}</td>
                            <td colSpan={3}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-200 text-xs px-4 py-2 rounded"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="bg-gray-200 text-xs px-4 py-2 rounded"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Table;
