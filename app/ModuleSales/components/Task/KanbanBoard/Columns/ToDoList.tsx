"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getNowInPH = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Manager: string;
  TSM: string;
  Role: string;
  profilePicture?: string;
  [key: string]: any;
}

interface TodoItem {
  id: string;
  typeactivity: string;
  remarks: string;
  startdate: string;
  enddate: string;
  scheduled_status: string;
}

interface MeetingsProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const TodoList: React.FC<MeetingsProps> = ({ userDetails, refreshTrigger }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [typeactivity, setTypeactivity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [startDate, setStartDate] = useState(formatDateTimeLocal(getNowInPH()));
  const [endDate, setEndDate] = useState(formatDateTimeLocal(getNowInPH()));
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch available activities
  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/GetActivities");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setActivities(data.activities || []);
      if (data.activities?.length) setTypeactivity(data.activities[0]);
    } catch (err: any) {
      console.error("❌ Fetch activities error:", err);
      toast.error("Failed to load activity types.");
    }
  };

  // 🔹 Fetch Todos
  const fetchTodos = async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/GetTodos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceid: userDetails.ReferenceID }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setTodos(data.todos || []);
    } catch (err: any) {
      console.error("❌ Fetch todos error:", err);
      toast.error(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Initial load
  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [userDetails, refreshTrigger]);

  // 🔹 Add New Todo
  const handleAddTodo = async () => {
    if (!remarks.trim()) {
      toast.warning("⚠️ Please enter remarks.");
      return;
    }

    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/AddTodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceid: userDetails?.ReferenceID,
          typeactivity,
          remarks,
          startdate: startDate,
          enddate: endDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message || "✅ Task added successfully!");
      setShowModal(false);
      setRemarks("");
      fetchTodos();
    } catch (err: any) {
      console.error("❌ Add todo error:", err);
      toast.error(err.message || "Failed to add task.");
    }
  };

  // 🔹 Toggle Completion
  const toggleComplete = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Done" ? "Pending" : "Done";
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scheduled_status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("✅ Task status updated!");
      fetchTodos();
    } catch (error: any) {
      console.error("❌ Update status error:", error);
      toast.error(error.message || "Failed to update task status.");
    }
  };

  return (
    <div className="space-y-2 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-gray-600">
          ✅ Todo List:{" "}
          <span className="text-blue-500">{loading ? "Loading..." : todos.length}</span>
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md"
        >
          + Add Task
        </button>
      </div>

      {/* Todo Items */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-gray-400 italic text-center py-3">Fetching tasks...</p>
        ) : todos.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-3">
            No tasks yet. Add one above.
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-2 border rounded-md flex justify-between items-center transition-all ${
                todo.scheduled_status === "Done" ? "bg-green-100" : "bg-gray-50"
              }`}
            >
              <div>
                <p className="text-[11px] font-semibold">{todo.typeactivity}</p>
                <p className="text-[10px] text-gray-600">{todo.remarks}</p>
                <p className="text-[9px] text-gray-500">
                  {new Date(todo.startdate).toLocaleString()} →{" "}
                  {new Date(todo.enddate).toLocaleString()}
                </p>
                <span className="text-[9px] text-blue-500">
                  Please check callbacks if done call.
                </span>
              </div>
              <input
                type="checkbox"
                checked={todo.scheduled_status === "Done"}
                onChange={() => toggleComplete(todo.id, todo.scheduled_status)}
                className="w-4 h-4 accent-green-600"
              />
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[999]">
          <div className="bg-white rounded-lg shadow-lg w-80 p-4 space-y-3">
            <h2 className="text-sm font-bold text-gray-700 text-center mb-2">
              ➕ Add New Task
            </h2>

            {/* Type */}
            <div>
              <label className="text-[11px] font-semibold text-gray-600">
                Type of Activity
              </label>
              <select
                value={typeactivity}
                onChange={(e) => setTypeactivity(e.target.value)}
                className="w-full text-[11px] mt-1 border rounded-md p-1"
              >
                {activities.map((act) => (
                  <option key={act}>{act}</option>
                ))}
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="text-[11px] font-semibold text-gray-600">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks..."
                className="w-full text-[11px] border rounded-md p-1 mt-1 h-14 resize-none"
              />
            </div>

            {/* Dates */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-gray-600">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-[11px] border rounded-md p-1 mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-gray-600">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-[11px] border rounded-md p-1 mt-1"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="text-[11px] px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTodo}
                className="text-[11px] px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
