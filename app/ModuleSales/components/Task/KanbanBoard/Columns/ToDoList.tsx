"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { IoFilter } from "react-icons/io5";

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getNowInPH = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

interface UserDetails {
  ReferenceID: string;
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

const ALLOWED_ACTIVITIES = [
  "Accounting Concern",
  "Client Meeting",
  "Follow-up Call",
  "Document Preparation",
];

const TodoList: React.FC<{ userDetails: UserDetails | null; refreshTrigger: number }> = ({
  userDetails,
  refreshTrigger,
}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [tab, setTab] = useState<"Pending" | "Done">("Pending"); // ✅ New tab state
  const [showModal, setShowModal] = useState(false);
  const [typeactivity, setTypeactivity] = useState(ALLOWED_ACTIVITIES[0]);
  const [remarks, setRemarks] = useState("");
  const [mode, setMode] = useState("pick");
  const [startDate, setStartDate] = useState(formatDateTimeLocal(getNowInPH()));
  const [endDate, setEndDate] = useState(formatDateTimeLocal(getNowInPH()));
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editingValue]);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [userDetails, refreshTrigger]);

  // 🔹 Add Todo
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
      setShowModal(false);
      setRemarks("");
      fetchTodos();
    } catch (err: any) {
      toast.error(err.message || "Failed to add task.");
    }
  };

  // 🔹 Toggle Done/Pending
  const toggleComplete = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Done" ? "Pending" : "Done";
      await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateTodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scheduled_status: newStatus }),
      });
      fetchTodos();
    } catch (error) {
      console.error("❌ Update status error:", error);
    }
  };

  // 🔹 Update Remarks Inline
  const handleUpdateRemarks = async (id: string, newRemarks: string) => {
    try {
      await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateTodoRemarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, remarks: newRemarks }),
      });
      setEditingId(null);
      fetchTodos();
    } catch (error) {
      console.error("❌ Failed to update remarks:", error);
    }
  };

  // 🔹 Auto duration
  const handleDurationChange = (value: string) => {
    setMode(value);
    const start = new Date();
    let end = new Date(start);
    if (value !== "pick") {
      end.setMinutes(end.getMinutes() + parseInt(value));
      setStartDate(formatDateTimeLocal(start));
      setEndDate(formatDateTimeLocal(end));
    }
  };

  // 🔹 Filter
  const filteredTodos = todos
    .filter((t) => (filterType === "All" ? ALLOWED_ACTIVITIES.includes(t.typeactivity) : t.typeactivity === filterType))
    .filter((t) => (tab === "Pending" ? t.scheduled_status !== "Done" : t.scheduled_status === "Done"));

  return (
    <div className="space-y-2 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-gray-600">
          ✅ Todo List:{" "}
          <span className="text-blue-500">
            {loading ? "Loading..." : filteredTodos.length}
          </span>
        </h3>

        <div className="flex items-center gap-2 relative">
          {/* 🔹 Filter Button */}
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="flex items-center gap-1 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs items-center"
          >
            <IoFilter size={15} /> Filter
          </button>

          {/* 🔹 Filter Dropdown (toggles on button click) */}
          {showFilter && (
            <div className="absolute right-16 top-8 bg-white border rounded-md shadow-md z-10 p-2">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setShowFilter(false); // auto-hide after selecting
                }}
                className="text-[11px] border rounded px-3 py-1.5 w-36"
              >
                <option value="All">All</option>
                {ALLOWED_ACTIVITIES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          )}

          {/* 🔹 Add Task Button */}
          <button
            onClick={() => setShowModal(true)}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded"
          >
            + Add Task
          </button>
        </div>
      </div>


      {/* ✅ Tabs (Pending / Completed) */}
      <div className="flex border-b mb-2">
        {["Pending", "Done"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "Pending" | "Done")}
            className={`flex-1 text-xs py-1.5 font-semibold border-b-2 transition-all ${tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
              }`}
          >
            {t === "Pending" ? "🕐 Pending" : "✅ Completed"}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-3">
            No {tab === "Pending" ? "pending" : "completed"} tasks found.
          </p>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                setEditingId(todo.id);
                setEditingValue(todo.remarks);
              }}
              className={`p-2 border rounded-md cursor-pointer transition-all ${todo.scheduled_status === "Done"
                  ? "bg-green-100"
                  : "bg-gray-50 hover:bg-gray-100"
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 relative">
                  <p className="text-[11px] font-semibold mb-0.5">
                    {todo.typeactivity}
                  </p>

                  {editingId === todo.id ? (
                    <div className="relative">
                      <textarea
                        className="text-[10px] border rounded-md p-1 w-full resize-none pr-12"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleUpdateRemarks(todo.id, editingValue.trim())}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateRemarks(todo.id, editingValue.trim())}
                        className="absolute bottom-1 right-1 bg-green-600 text-white text-[9px] px-2 py-0.5 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-600">{todo.remarks}</p>
                  )}

                  <p className="text-[9px] text-gray-500">
                    {new Date(todo.startdate).toLocaleString()} →{" "}
                    {new Date(todo.enddate).toLocaleString()}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={todo.scheduled_status === "Done"}
                  onChange={() => toggleComplete(todo.id, todo.scheduled_status)}
                  className="w-4 h-4 accent-green-600 mt-1 ml-2 cursor-pointer"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Modal (Add Task) — unchanged */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-600 to-teal-500">
              <h3 className="text-white font-semibold text-lg">Add / Edit Task</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 transition text-lg"
              >
                ✖
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[500px] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1">Duration</label>
                <select
                  value={mode}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full border px-2 py-1 rounded text-xs"
                >
                  <option value="pick">-- Select Duration --</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="pick">Pick manually</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Type of Activity</label>
                <select
                  value={typeactivity}
                  onChange={(e) => setTypeactivity(e.target.value)}
                  className="w-full border px-2 py-1 rounded text-xs"
                >
                  {ALLOWED_ACTIVITIES.map((act) => (
                    <option key={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full border px-2 py-1 rounded text-xs resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border px-2 py-1 rounded text-xs"
                    disabled={mode !== "pick"}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border px-2 py-1 rounded text-xs"
                    disabled={mode !== "pick"}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xs px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTodo}
                  className="text-xs px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
