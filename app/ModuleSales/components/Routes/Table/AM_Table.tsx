"use client";

import React, { useState, useMemo, useEffect } from "react";
import Pagination from "../../Routes/Pagination/AM_Pagination";
import Export from "../../Routes/Tools/AM_Export";

interface Post {
  id: string;
  referenceid: string;
  companyname: string;
  typeclient: string;
  actualsales: number | string;
  date_created: string;
  targetquota: number;
}

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Manager: string;
  TSM: string;
  Role: string;
  profilePicture?: string;
  [key: string]: any;
}

interface UsersCardProps {
  posts: Post[];
  userDetails: UserDetails;
}

const UsersTable: React.FC<UsersCardProps> = ({ posts, userDetails }) => {
  const [filterTypeClient, setFilterTypeClient] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ✅ Store both name and profile picture per agent
  const [agentData, setAgentData] = useState<
    Record<string, { name: string; profilePicture: string }>
  >({});

  // 🔧 Helper to safely parse dates
  const parseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // ✅ Fetch agent info (name + photo)
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

  // ✅ Group by company name
  const groupedData: Record<string, Post[]> = posts.reduce(
    (acc: Record<string, Post[]>, post: Post) => {
      const company = post.companyname || "Unknown Company";
      if (!acc[company]) acc[company] = [];
      acc[company].push(post);
      return acc;
    },
    {}
  );

  // ✅ Format PHP currency
  const formatSales = (value: number | string | null | undefined) => {
    const parsed =
      typeof value === "string"
        ? parseFloat(value)
        : typeof value === "number"
        ? value
        : 0;
    const number = isNaN(parsed) ? 0 : parsed;
    return number.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  // ✅ Unique typeclient list
  const uniqueTypeClients = useMemo(() => {
    const allTypes = posts.map((p) => p.typeclient.toUpperCase());
    return ["All", ...Array.from(new Set(allTypes))];
  }, [posts]);

  // ✅ Apply filters + sort
  const filteredAndSortedData = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const filteredGroups = Object.entries(groupedData).filter(([_, entries]) => {
      const filteredEntries = entries.filter((post) => {
        const matchesTypeClient =
          filterTypeClient === "All" ||
          post.typeclient.toUpperCase() === filterTypeClient.toUpperCase();

        const postDate = parseDate(post.date_created);
        const matchesDateRange =
          (!start || !postDate || postDate >= start) &&
          (!end || !postDate || postDate <= end);

        return matchesTypeClient && matchesDateRange;
      });

      return filteredEntries.length > 0;
    });

    const mapped = filteredGroups.map(([companyName, entries]) => {
      const filteredEntries = entries.filter((post) => {
        const matchesTypeClient =
          filterTypeClient === "All" ||
          post.typeclient.toUpperCase() === filterTypeClient.toUpperCase();

        const postDate = parseDate(post.date_created);
        const matchesDateRange =
          (!start || !postDate || postDate >= start) &&
          (!end || !postDate || postDate <= end);

        return matchesTypeClient && matchesDateRange;
      });

      const totalSales = filteredEntries.reduce((sum, post) => {
        const value =
          typeof post.actualsales === "string"
            ? parseFloat(post.actualsales)
            : post.actualsales;
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      const averageSales =
        filteredEntries.length > 0 ? totalSales / filteredEntries.length : 0;

      const latestDate = filteredEntries
        .map((p) => parseDate(p.date_created))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      const targetQuota = filteredEntries[0]?.targetquota || 0;
      const typeClients = Array.from(
        new Set(filteredEntries.map((e) => e.typeclient.toUpperCase()))
      ).join(", ");
      const referenceid = filteredEntries[0]?.referenceid || "";
      const agent = agentData[referenceid] || {
        name: "Unknown",
        profilePicture: "/taskflow.png",
      };

      return {
        companyName,
        totalSales,
        averageSales,
        typeClients,
        targetQuota,
        referenceid,
        agent,
        latestDate: latestDate ? latestDate.toISOString().split("T")[0] : "",
      };
    });

    mapped.sort((a, b) => b.totalSales - a.totalSales);

    return mapped;
  }, [groupedData, filterTypeClient, startDate, endDate, agentData]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const grandTotal = filteredAndSortedData.reduce(
    (sum, item) => sum + item.totalSales,
    0
  );

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // ✅ Render
  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter Type */}
          <div className="flex items-center gap-2">
            <label htmlFor="typeClientFilter" className="font-semibold text-xs">
              Filter by Type of Client:
            </label>
            <select
              id="typeClientFilter"
              value={filterTypeClient}
              onChange={(e) => {
                setFilterTypeClient(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded text-xs"
            >
              {uniqueTypeClients.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="font-semibold text-xs">Start Date:</label>
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
            <label className="font-semibold text-xs">End Date:</label>
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
        </div>

        {/* Items per page + Export */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border px-3 py-2 rounded text-xs"
          >
            {[10, 25, 50, 100, 500, 1000].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <Export data={filteredAndSortedData} grandTotal={grandTotal} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
              <th className="px-6 py-4 font-semibold text-gray-700">Agent</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Company</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Client Type</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Actual Sales</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-xs">
                  No records available
                </td>
              </tr>
            ) : (
              paginatedData.map(({ companyName, totalSales, typeClients, agent, latestDate }) => (
                <tr key={companyName} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs text-orange-700">
                    <div className="flex items-center gap-2">
                      <img
                        src={agent.profilePicture}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs uppercase">{companyName}</td>
                  <td className="px-6 py-4 text-xs">{typeClients}</td>
                  <td className="px-6 py-4 text-xs">{formatSales(totalSales)}</td>
                  <td className="px-6 py-4 text-xs">{latestDate}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-200 sticky bottom-0 z-10">
            <tr className="text-xs font-bold text-gray-700">
              <td className="px-6 py-3 uppercase">Grand Total</td>
              <td></td>
              <td></td>
              <td className="px-6 py-3">{formatSales(grandTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} />
    </div>
  );
};

export default UsersTable;
