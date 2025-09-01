"use client";

import React, { useMemo, useState } from "react";
import { CiClock2 } from "react-icons/ci";

interface OutboundTableProps {
  posts: any[];
}

const getTypeOfClientColor = (type: string) => {
  switch (type) {
    case "Successful Call":
      return "bg-green-50";
    case "Unsuccessful Call":
      return "bg-red-50";
    default:
      return "";
  }
};

const calculateTimeConsumed = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return "N/A";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInSeconds = (end.getTime() - start.getTime()) / 1000;

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = Math.floor(diffInSeconds % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;

  const formattedDateStr = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formattedDateStr} ${hours}:${minutesStr} ${ampm}`;
};

const OutboundTable: React.FC<OutboundTableProps> = ({ posts }) => {
  const [search, setSearch] = useState("");
  const [typeClientFilter, setTypeClientFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => post?.typeactivity === "Outbound calls");
  }, [posts]);

  const typeClientOptions = useMemo(() => {
    const unique = new Set<string>();
    filteredPosts.forEach((post) => {
      if (post?.typeclient) unique.add(post.typeclient);
    });
    return Array.from(unique);
  }, [filteredPosts]);

  const searchedPosts = useMemo(() => {
    return filteredPosts.filter((post) => {
      const matchesSearch =
        search === "" ||
        post?.companyname?.toLowerCase().includes(search.toLowerCase()) ||
        post?.contactperson?.toLowerCase().includes(search.toLowerCase()) ||
        post?.emailaddress?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeClientFilter === "" || post?.typeclient === typeClientFilter;

      const postDate = new Date(post?.startdate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // para exact date, gagamit tayo ng toDateString
      const matchesDate =
        (!start || postDate.toDateString() >= start.toDateString()) &&
        (!end || postDate.toDateString() <= end.toDateString());

      return matchesSearch && matchesType && matchesDate;
    });
  }, [filteredPosts, search, typeClientFilter, startDate, endDate]);

  const sortedPosts = useMemo(() => {
    return [...searchedPosts].sort((a, b) => {
      const dateA = a?.startdate ? new Date(a.startdate).getTime() : 0;
      const dateB = b?.startdate ? new Date(b.startdate).getTime() : 0;
      return dateB - dateA;
    });
  }, [searchedPosts]);

  const totalPages = Math.ceil(sortedPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPosts.slice(start, start + pageSize);
  }, [sortedPosts, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded text-xs"
          value={typeClientFilter}
          onChange={(e) => setTypeClientFilter(e.target.value)}
        >
          <option value="">All Clients</option>
          {typeClientOptions.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="border px-3 py-2 rounded text-xs"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>-</span>
          <input
            type="date"
            className="border px-3 py-2 rounded text-xs"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Page length selector */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            className="border px-3 py-2 rounded text-xs"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // reset to first page
            }}
          >
            {[10, 25, 50, 100, 500, 1000].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-md">
        {paginatedPosts.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr className="text-xs text-left whitespace-nowrap border-l-4 border-emerald-400">
                <th className="px-6 py-4 font-semibold text-gray-700">Account Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Contact Person</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Contact Number</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type of Client</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type of Call</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Call Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Remarks</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Agent / TSM</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Call Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPosts.map((post, index) => {
                const timeConsumed = calculateTimeConsumed(
                  post?.startdate,
                  post?.enddate
                );
                return (
                  <tr
                    key={post?._id || `${post?.referenceid}-${index}`}
                    className={`${getTypeOfClientColor(
                      post?.callstatus
                    )} hover:bg-gray-50 border-b whitespace-nowrap`}
                  >
                    <td className="px-6 py-4 text-xs">{post?.companyname || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.contactperson || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.contactnumber || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.emailaddress || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.typeclient || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.typecall || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.callstatus || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{post?.remarks || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">
                      {post?.AgentFirstname} {post?.AgentLastname} /{" "}
                      {post?.ManagerFirstname} {post?.ManagerLastname}
                    </td>
                    <td className="px-6 py-4 text-xs flex items-center gap-2">
                      <CiClock2 size={13} />
                      <span>
                        {formatDate(post.startdate)} - {formatDate(post.enddate)} (
                        {timeConsumed})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-sm">
            No outbound calls available
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="bg-gray-200 text-xs px-4 py-2 rounded"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span className="text-xs">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="bg-gray-200 text-xs px-4 py-2 rounded"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OutboundTable;
