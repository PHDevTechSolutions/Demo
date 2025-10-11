"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineLoading, AiOutlineReload } from 'react-icons/ai';
import "react-toastify/dist/ReactToastify.css";
import Table from "./Table/Table";

interface Note {
  id: number;
  companyname: string;
  contactnumber: string;
  emailaddress: string;
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
  quotationamount: string;
  soamount: string;
  callstatus: string;
  source: string;
  typecall: string;
}

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Manager: string;
  TSM: string;
  Role: string;
  profilePicture?: string;
}

interface TaskProps {
  userDetails: UserDetails;
}

const PAGE_SIZE = 5;

const TaskList: React.FC<TaskProps> = ({ userDetails }) => {
  const [tasks, setTasks] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeLimit, setActiveLimit] = useState(PAGE_SIZE);
  const [completedLimit, setCompletedLimit] = useState(PAGE_SIZE);

  // ✅ Fetch tasks directly from API (no localStorage)
  const fetchTasks = async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchTask?referenceid=${userDetails.ReferenceID}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      const fetchedTasks: Note[] = Array.isArray(data.data) ? data.data : [];

      const userTasks = fetchedTasks
        .filter((task) => task.referenceid === userDetails.ReferenceID)
        .sort((a, b) => {
          const dateA = a.date_updated ? new Date(a.date_updated) : new Date(a.date_created);
          const dateB = b.date_updated ? new Date(b.date_updated) : new Date(b.date_created);
          return dateB.getTime() - dateA.getTime();
        });

      setTasks(userTasks);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong while fetching tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userDetails?.ReferenceID]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    const searchMatch = Object.values(task).some(
      (val) => val && val.toString().toLowerCase().includes(term)
    );
    const statusMatch = statusFilter
      ? (task.activitystatus || "").toLowerCase() === statusFilter.toLowerCase()
      : true;
    const fromMatch = dateFrom ? new Date(task.date_created) >= new Date(dateFrom) : true;
    const toMatch = dateTo ? new Date(task.date_created) <= new Date(dateTo) : true;
    return searchMatch && statusMatch && fromMatch && toMatch;
  });

  const activeTasks = filteredTasks.filter(
    (task) => !["delivered"].includes((task.activitystatus || "").toLowerCase())
  );
  const completedTasks = filteredTasks.filter((task) =>
    ["delivered", "done", "completed"].includes((task.activitystatus || "").toLowerCase())
  );

  return (
    <div className="w-full bg-white p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-black">Task List</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center bg-gray-100 gap-2 text-xs px-3 py-2 rounded transition"
        >
          {refreshing ? (
            <>
              <AiOutlineLoading size={14} className="animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <AiOutlineReload size={14} className="text-gray-700" />
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Track, manage, and update your daily activities.
      </p>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {[
            "cold",
            "warm",
            "assisted",
            "paid",
            "delivered",
            "collected",
            "quote-done",
            "so-done",
            "cancelled",
            "loss",
          ].map((status) => (
            <option className="capitalize" key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks found.</p>
      ) : (
        <div className="overflow-x-auto">
          {activeTasks.length > 0 && (
            <Table
              title="Active Tasks"
              tasks={activeTasks}
              userDetails={userDetails}
              limit={activeLimit}
              setLimit={setActiveLimit}
              onRefresh={handleRefresh}
            />
          )}
          {completedTasks.length > 0 && (
            <Table
              title="Completed Tasks"
              tasks={completedTasks}
              userDetails={userDetails}
              limit={completedLimit}
              setLimit={setCompletedLimit}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="text-xs z-[99999]"
        toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
        progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
      />
    </div>
  );
};

export default TaskList;
