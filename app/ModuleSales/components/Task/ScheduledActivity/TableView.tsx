import React, { useMemo, useCallback } from "react";
import { IoIosSettings } from "react-icons/io";
import { RiEditCircleLine } from "react-icons/ri";

export interface Post {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  typeclient: string;
  activitystatus: string;
  ticketreferencenumber: string;
  date_created: string;
  date_updated: string | null;
  activitynumber: string;
  startdate: string;
  enddate: string;
}

interface TableViewProps {
  posts: Post[];
  handleEdit: (post: Post) => void;
  refreshPosts: () => void;
}

const statusColors: Record<string, string> = {
  Assisted: "bg-blue-400 text-white",
  Paid: "bg-green-500 text-white",
  Delivered: "bg-cyan-400 text-white",
  Collected: "bg-indigo-500 text-white",
  "Quote-Done": "bg-slate-500 text-white",
  "SO-Done": "bg-purple-500 text-white",
  Cancelled: "bg-red-500 text-white",
  Loss: "bg-red-800 text-white",
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const TableView: React.FC<TableViewProps> = ({ posts, handleEdit }) => {
  const groupedPosts = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const post of posts) {
      const dateKey = formatDate(post.date_created);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(post);
    }
    return map;
  }, [posts]);

  const onEdit = useCallback((post: Post) => {
    handleEdit(post);
  }, [handleEdit]);

  const renderedRows = useMemo(() => {
    if (posts.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-4 text-xs">
            No records available
          </td>
        </tr>
      );
    }

    return Object.entries(groupedPosts).map(([date, postsForDate]) => {
      const showColdTag = postsForDate.some((p) => p.activitystatus === "Cold");

      return (
        <React.Fragment key={date}>
          <tr className="bg-gray-200 font-semibold text-[10px] text-gray-600">
            <td colSpan={9} className="px-6 py-2 sticky top-10 z-10">
              <div className="flex items-center gap-2">
                <span>{date}</span>
                {showColdTag && (
                  <span className="bg-orange-500 pl-2 pr-2 rounded-full flex items-center text-white text-[10px] font-semibold">
                    <IoIosSettings className="animate-spin mr-1" />
                    On Progress
                  </span>
                )}
              </div>
            </td>
          </tr>

          {postsForDate.map((post) => (
            <tr
              key={post.id}
              className="whitespace-nowrap hover:bg-gray-100 cursor-pointer"
              onClick={() => onEdit(post)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onEdit(post)}
            >
              <td
                className="px-6 py-4 text-xs sticky left-0 bg-white border-r border-gray-200 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                  className="flex items-center shadow-md gap-1 bg-blue-500 text-white text-[10px] px-2 py-1 rounded hover:bg-blue-700 hover:rounded-full transition-colors"
                >
                  <RiEditCircleLine size={12} /> Update
                </button>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-[8px] rounded-full shadow-md font-semibold ${statusColors[post.activitystatus] || "bg-gray-300 text-black"
                    }`}
                >
                  {post.activitystatus}
                </span>
              </td>

              <td className="px-6 py-4 text-[10px]">{formatDate(post.date_created)} / &nbsp;
                {(() => {
                  const start = new Date(post.startdate);
                  const end = new Date(post.enddate);
                  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const diffMs = end.getTime() - start.getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                    return `${hours}h ${minutes}m ${seconds}s`;
                  }
                  return "Invalid date";
                })()}
              </td>
              <td className="px-6 py-4 text-[10px] uppercase">{post.companyname}</td>
              <td className="px-6 py-4 text-[10px] capitalize">{post.contactperson}</td>
              <td className="px-6 py-4 text-[10px]">{post.contactnumber}</td>
              <td className="px-6 py-4 text-[10px]">{post.typeclient}</td>
              <td className="px-6 py-4 text-[10px]">{post.ticketreferencenumber}</td>
              <td className="px-6 py-4 text-[10px]">{formatDate(post.date_updated)}</td>
            </tr>
          ))}
        </React.Fragment>
      );
    });
  }, [groupedPosts, onEdit]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-gray-100 border-r border-gray-200 z-20">
              Actions
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Time Spent</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Contact Person</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Contact Number</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Type of Client</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Ticket Reference</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Date Updated</th>
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
      </table>
    </div>
  );
};

export default TableView;
