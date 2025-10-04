import React, { useState, useMemo, useEffect } from "react";

interface Post {
    id: string;
    referenceid: string;
    date_created: string;
    companyname: string;
    contactperson: string;
    actualsales: string;
    activitystatus: string;
    remarks: string;
}

interface TableProps {
    posts: Post[];
}

const Table: React.FC<TableProps> = ({ posts }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [agentNames, setAgentNames] = useState<Record<string, string>>({});

    const parseDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const filteredPosts = useMemo(() => {
        const start = parseDate(startDate);
        const end = parseDate(endDate);

        return posts.filter((post) => {
            const postDate = parseDate(post.date_created);
            const matchesDateRange =
                (!start || !postDate || postDate >= start) &&
                (!end || !postDate || postDate <= end);
            return matchesDateRange;
        });
    }, [posts, startDate, endDate]);

    const sortedPosts = useMemo(() => {
        return [...filteredPosts].sort((a, b) => {
            const dateA = new Date(a.date_created).getTime();
            const dateB = new Date(b.date_created).getTime();
            return dateSortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });
    }, [filteredPosts, dateSortOrder]);

    const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedPosts.slice(start, start + itemsPerPage);
    }, [sortedPosts, currentPage, itemsPerPage]);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        if (page < 1) page = 1;
        else if (page > totalPages) page = totalPages;
        setCurrentPage(page);
    };

    const formatCurrency = (value: number | string) => {
        const number =
            typeof value === "string" ? parseFloat(value) || 0 : value || 0;
        return number.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
        });
    };

    const totalActualSales = useMemo(() => {
        return filteredPosts.reduce((sum, post) => {
            const amount =
                typeof post.actualsales === "string"
                    ? parseFloat(post.actualsales)
                    : post.actualsales;
            return sum + (amount || 0);
        }, 0);
    }, [filteredPosts]);

    const totalActualSalesCount = useMemo(() => {
        return filteredPosts.length;
    }, [filteredPosts]);

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? "0" + minutes : minutes;
        const formattedDateStr = date.toLocaleDateString("en-US", {
            timeZone: "UTC",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        return `${formattedDateStr} ${hours}:${minutesStr} ${ampm}`;
    };

    useEffect(() => {
        const fetchAgents = async () => {
            const uniqueReferenceIds = Array.from(new Set(posts.map((p) => p.referenceid)));
            const nameMap: Record<string, string> = {};

            await Promise.all(
                uniqueReferenceIds.map(async (id) => {
                    try {
                        const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(id)}`);
                        const data = await res.json();
                        nameMap[id] = `${data.Lastname || ""}, ${data.Firstname || ""}`.trim();
                    } catch (error) {
                        console.error(`Error fetching user ${id}`, error);
                        nameMap[id] = "";
                    }
                })
            );

            setAgentNames(nameMap);
        };

        if (posts.length > 0) {
            fetchAgents();
        }
    }, [posts]);

    return (
        <div>
            <div className="mb-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-xs whitespace-nowrap">Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border px-3 py-2 rounded text-xs"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-semibold text-xs whitespace-nowrap">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border px-3 py-2 rounded text-xs"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-semibold text-xs whitespace-nowrap">Items per page:</label>
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="border px-3 py-2 rounded text-xs"
                    >
                        {[10, 25, 50, 100].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto relative">
                <table className="min-w-full table-auto text-xs">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr className="text-left border-l-4 border-orange-400">
                            <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                            <th
                                className="px-6 py-3 font-semibold text-gray-700 cursor-pointer select-none"
                                onClick={() =>
                                    setDateSortOrder(dateSortOrder === "desc" ? "asc" : "desc")
                                }
                            >
                                Date{" "}
                                <span className="text-[10px] text-gray-500">
                                    {dateSortOrder === "desc" ? "▼" : "▲"}
                                </span>
                            </th>
                            <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                            <th className="px-6 py-3 font-semibold text-gray-700">Company Name</th>
                            <th className="px-6 py-3 font-semibold text-gray-700">Agent Name</th>
                            <th className="px-6 py-3 font-semibold text-gray-700">Contact Person</th>
                            <th className="px-6 py-3 font-semibold text-gray-700">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4">
                                    No records available
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((post) => (
                                <tr key={post.id} className="bg-white hover:bg-gray-50 whitespace-nowrap">
                                    <td className="px-6 py-3">
                                        <span
                                            className={`inline-block px-2 py-1 text-[8px] font-semibold rounded-full
                                                ${post.activitystatus.toLowerCase() === "delivered"
                                                    ? "bg-green-800 text-white"
                                                    : "bg-gray-200 text-gray-800"
                                                }`}
                                        >
                                            {post.activitystatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">{post.date_created}</td>
                                    <td className="px-6 py-3">{formatCurrency(post.actualsales)}</td>
                                    <td className="px-6 py-3 uppercase">{post.companyname}</td>
                                    <td className="px-6 py-4 text-xs capitalize text-orange-700">
                                        {agentNames[post.referenceid] || "N/A"}
                                    </td>
                                    <td className="px-6 py-3 capitalize">{post.contactperson}</td>
                                    <td className="px-6 py-3 capitalize">{post.remarks}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-gray-200 sticky bottom-0 z-10 font-bold text-gray-700">
                        <tr>
                            <td className="px-6 py-3" colSpan={2}></td>
                            <td className="px-6 py-3 text-green-700">Total Actual Sales (SI)</td>
                            <td className="px-6 py-3">{formatCurrency(totalActualSales)}</td>
                            <td className="px-6 py-3">Quantity: {totalActualSalesCount}</td>
                            <td className="px-6 py-3" colSpan={2}></td>
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
                <span>
                    Page {currentPage} of {totalPages || 1}
                </span>
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
