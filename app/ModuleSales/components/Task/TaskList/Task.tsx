"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { IoSync } from "react-icons/io5";
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
    toast.info("Refreshing data...");
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
          className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 transition"
          title="Refresh"
        >
          <IoSync size={18} className={refreshing ? "animate-spin text-blue-500" : "text-white"} />
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
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="ml-2 text-xs text-gray-500">Loading data...</span>
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
