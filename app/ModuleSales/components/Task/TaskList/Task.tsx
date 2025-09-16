"use client";

import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "./Table/Table";

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
  quotationamount: string;
  soamount: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeLimit, setActiveLimit] = useState(PAGE_SIZE);
  const [completedLimit, setCompletedLimit] = useState(PAGE_SIZE);

  const lastTaskCount = useRef(0);
  const pollTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = async () => {
    if (!userDetails?.ReferenceID) return;

    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchTask?referenceid=${userDetails.ReferenceID}`
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      const fetchedTasks: Note[] = Array.isArray(data.data) ? data.data : [];

      const userTasks = fetchedTasks
        .filter(task => task.referenceid === userDetails.ReferenceID)
        .sort((a, b) => {
          const dateA = a.date_updated ? new Date(a.date_updated) : new Date(a.date_created);
          const dateB = b.date_updated ? new Date(b.date_updated) : new Date(b.date_created);
          return dateB.getTime() - dateA.getTime();
        });

      // Update only if there is new data
      if (userTasks.length !== lastTaskCount.current) {
        setTasks(userTasks);
        lastTaskCount.current = userTasks.length;
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong while fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (interval: number = 5000) => {
    if (pollTimeout.current) clearTimeout(pollTimeout.current);

    const poll = async () => {
      // Only poll if page is visible
      if (document.visibilityState === "visible") {
        await fetchTasks();
      }

      // Adjust next interval: increase slightly if no new tasks
      const nextInterval = lastTaskCount.current === tasks.length ? Math.min(interval * 1.5, 30000) : 5000;
      pollTimeout.current = setTimeout(poll, nextInterval);
    };

    pollTimeout.current = setTimeout(poll, interval);
  };

  useEffect(() => {
    fetchTasks(); // Initial fetch
    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTasks(); // Fetch immediately when tab becomes active
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userDetails?.ReferenceID]);

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    const term = searchTerm.toLowerCase();
    const searchMatch = Object.values(task).some(
      val => val && val.toString().toLowerCase().includes(term)
    );
    const statusMatch = statusFilter
      ? (task.activitystatus || "").toLowerCase() === statusFilter.toLowerCase()
      : true;
    const fromMatch = dateFrom ? new Date(task.date_created) >= new Date(dateFrom) : true;
    const toMatch = dateTo ? new Date(task.date_created) <= new Date(dateTo) : true;
    return searchMatch && statusMatch && fromMatch && toMatch;
  });

  const activeTasks = filteredTasks.filter(
    task =>
      !["so-done", "quote-done", "delivered"].includes(
        (task.activitystatus || "").toLowerCase()
      )
  );
  const completedTasks = filteredTasks.filter(task =>
    ["so-done", "quote-done", "delivered", "done", "completed"].includes(
      (task.activitystatus || "").toLowerCase()
    )
  );

  return (
    <div className="w-full bg-white p-4">
      <h2 className="text-lg font-semibold text-black mb-2">Task List</h2>
      <p className="text-sm text-gray-500 mb-4">Track, manage, and update your daily activities.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {["cold", "warm", "assisted", "paid", "delivered", "collected", "quote-done", "so-done", "cancelled", "loss"].map(status => (
            <option className="capitalize" key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          type="date"
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
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
            />
          )}
          {completedTasks.length > 0 && (
            <Table
              title="Completed Tasks"
              tasks={completedTasks}
              userDetails={userDetails}
              limit={completedLimit}
              setLimit={setCompletedLimit}
            />
          )}
        </div>
      )}

      <ToastContainer className="text-xs" autoClose={1000} />
    </div>
  );
};

export default TaskList;
