"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Note {
  id: number;
  companyname: string;
  activitynumber: string;
  referenceid: string;
  manager: string;
  tsm: string;
  activitystatus: string;
  typeactivity: string;
  remarks: string;
  startdate: string;
  enddate: string;
  date_created: string;
  date_updated?: string;
  quotationnumber: string;
  sonumber: string;
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

interface TaskProps {
  posts?: Note[];
  userDetails: UserDetails;
}

const TaskList: React.FC<TaskProps> = ({ posts = [], userDetails }) => {
  const [tasks, setTasks] = useState<Note[]>(Array.isArray(posts) ? posts : []);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails?.ReferenceID}`
        );
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        let fetchedTasks: Note[] = [];
        if (Array.isArray(data.data)) {
          fetchedTasks = data.data;
        } else {
          console.warn("Fetched data is not an array", data);
        }

        const userTasks = fetchedTasks.filter(
          (task) => String(task.referenceid) === String(userDetails.ReferenceID)
        );

        // Sort by latest first
        userTasks.sort(
          (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );

        setTasks(userTasks);
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userDetails?.ReferenceID]);

  // Badge colors
  const getBadgeColor = (status: string | null | undefined) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "cold": return "bg-blue-500 text-white";
      case "warm": return "bg-yellow-400 text-black";
      case "assisted": return "bg-blue-300 text-black";
      case "paid": return "bg-green-500 text-white";
      case "delivered": return "bg-cyan-400 text-black";
      case "collected": return "bg-indigo-500 text-white";
      case "quote-done": return "bg-slate-400 text-white";
      case "so-done": return "bg-violet-500 text-white";
      case "cancelled": return "bg-red-500 text-white";
      case "loss": return "bg-orange-800 text-white";
      default: return "bg-gray-300 text-black";
    }
  };

  // Filtered tasks based on search and date
  const filteredTasks = tasks.filter((task) => {
    const remarks = (task.remarks || "").toLowerCase();
    const company = (task.companyname || "").toLowerCase();
    const status = (task.activitystatus || "").toLowerCase();

    const searchMatch =
      remarks.includes(searchTerm.toLowerCase()) ||
      company.includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter ? status === statusFilter.toLowerCase() : true;

    const fromMatch = dateFrom ? new Date(task.date_created) >= new Date(dateFrom) : true;
    const toMatch = dateTo ? new Date(task.date_created) <= new Date(dateTo) : true;

    return searchMatch && statusMatch && fromMatch && toMatch;
  });

  // Group active and completed
  const activeTasks = filteredTasks.filter(
    (task) => !["so-done", "quote-done", "delivered"].includes((task.activitystatus || "").toLowerCase())
  );

  const completedTasks = filteredTasks.filter(
    (task) => ["so-done", "quote-done", "delivered", "done", "completed"].includes((task.activitystatus || "").toLowerCase())
  );

  const renderTaskRow = (task: Note) => (
    <tr key={task.id} className="hover:bg-gray-50 border-b whitespace-nowrap">
      <td className="px-6 py-4 text-xs capitalize whitespace-normal break-words max-w-xs">{task.remarks}</td>
      <td className="px-6 py-4 text-xs uppercase">{task.companyname}</td>
      <td className="px-6 py-4 text-xs">
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getBadgeColor(task.activitystatus)}`}
        >
          {task.activitystatus || "N/A"}
        </span>
      </td>
      <td className="px-6 py-4 text-xs">{task.typeactivity}</td>
      <td className="px-6 py-4 text-xs">{task.quotationnumber}</td>
      <td className="px-6 py-4 text-xs">{task.sonumber}</td>
      <td className="px-6 py-4 text-xs">{new Date(task.date_created).toLocaleString()}</td>
      <td className="px-6 py-4 text-xs">
        <div className="flex items-center gap-2">
          <img
            src={userDetails.profilePicture || "/taskflow.png"}
            alt="Responsible"
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs">
            {userDetails.Firstname} {userDetails.Lastname}
          </span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full bg-white p-4">
      <h2 className="text-lg font-semibold text-black mb-2">Task List</h2>
      <p className="text-sm text-gray-500 mb-4">
        Track, manage, and update your daily activities.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="border px-2 py-1 rounded text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border px-2 py-1 rounded text-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {[
            "cold", "warm", "assisted", "paid", "delivered", "collected",
            "quote-done", "so-done", "cancelled", "loss"
          ].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          type="date"
          className="border px-2 py-1 rounded text-xs"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="border px-2 py-1 rounded text-xs"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="ml-2 text-xs text-gray-500">Loading data...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks found.</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Active Tasks</h3>
              <table className="min-w-full table-auto mb-2">
                <thead className="">
                  <tr className="text-xs text-left whitespace-nowrap border-b">
                    <th className="px-6 py-4 font-semibold text-gray-700"></th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Quotation Number</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">SO Number</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Responsible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeTasks.map(renderTaskRow)}
                </tbody>
              </table>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Completed Tasks</h3>
              <table className="min-w-full table-auto">
                <thead className="">
                  <tr className="text-xs text-left whitespace-nowrap border-b">
                    <th className="px-6 py-4 font-semibold text-gray-700"></th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Quotation Number</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">SO Number</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Responsible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedTasks.map(renderTaskRow)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ToastContainer className="text-xs" autoClose={1000} />
    </div>
  );
};

export default TaskList;
