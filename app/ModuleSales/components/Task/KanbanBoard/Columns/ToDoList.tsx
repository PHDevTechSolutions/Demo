"use client";

import React, { useState, useEffect, useRef } from "react";
import ToDoListCard from "./Card/ToDoListCard";
import ToDoListForm from "./Form/ToDoListForm";
import { IoFilter } from "react-icons/io5";

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getNowInPH = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

interface UserDetails {
  ReferenceID: string;
  TSM: string;
  Manager: string;
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
  "Admin- Supplier Accreditation",
  "Admin- Credit Terms Application",
  "Accounting Concern",
  "After Sales-Refund",
  "After Sales-Repair/Replacement",
  "Bidding Preperation",
  "Customer Order",
  "Customer Inquiry Sales",
  "Delivery Concern",
  "Sample Request",
  "Site Visit",
  "Technical Concern",
  "Viber Replies",
  "Check/Read emails",
  "Outbound calls",
];

// ✅ Regex helper for detecting Site Visit pattern
const isSiteVisitRemark = (text: string) => /Site Visit on .* at .*(AM|PM)/i.test(text);

const TodoList: React.FC<{ userDetails: UserDetails | null; refreshTrigger: number }> = ({
  userDetails,
  refreshTrigger,
}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [tab, setTab] = useState<"Pending" | "Done">("Pending");
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

  // 🔹 Filtering
  const filteredTodos = todos
    // 1️⃣ Base filter by selected type
    .filter((t) =>
      filterType === "All"
        ? ALLOWED_ACTIVITIES.includes(t.typeactivity)
        : t.typeactivity === filterType
    )

    // 2️⃣ Show only "Outbound calls" with valid Site Visit remark
    .filter((t) => {
      if (t.typeactivity === "Outbound calls") {
        return isSiteVisitRemark(t.remarks || "");
      }
      return true; // keep others
    })

    // 3️⃣ Filter by tab: Pending or Completed
    .filter((t) =>
      tab === "Pending" ? t.scheduled_status !== "Done" : t.scheduled_status === "Done"
    );

  // ✅ Extract only the "Site Visit on ... at ... AM/PM" portion
  const extractSiteVisitRemark = (text: string) => {
    const match = text.match(/Site Visit on .* at .*?(AM|PM)/i);
    return match ? match[0] : text; // return the matched part only
  };

  // ✅ Convert UTC date string to Manila timezone
  const formatToManilaTime = (utcString: string) => {
    if (!utcString) return "";
    const date = new Date(utcString);
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-3 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-gray-600">
          ✅ Todo List:{" "}
          <span className="text-blue-500">{loading ? "Loading..." : filteredTodos.length}</span>
        </h3>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="flex items-center gap-1 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
          >
            <IoFilter size={15} /> Filter
          </button>

          {showFilter && (
            <div className="absolute right-16 top-8 bg-white border rounded-md shadow-md z-10 p-2">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setShowFilter(false);
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

          <button
            onClick={() => setShowModal(true)}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-2">
        {["Pending", "Done"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "Pending" | "Done")}
            className={`flex-1 text-xs py-1.5 font-semibold border-b-2 transition-all ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-500"
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
            <ToDoListCard
              key={todo.id}
              todo={todo}
              editingId={editingId}
              editingValue={editingValue}
              textareaRef={textareaRef}
              setEditingId={setEditingId}
              setEditingValue={setEditingValue}
              handleUpdateRemarks={handleUpdateRemarks}
              toggleComplete={toggleComplete}
              isSiteVisitRemark={isSiteVisitRemark}
              extractSiteVisitRemark={extractSiteVisitRemark}
              formatToManilaTime={formatToManilaTime}
            />
          ))
        )}
      </div>

      {/* ✅ Modal (Add Task) */}
      {showModal && (
        <ToDoListForm
          setShowModal={setShowModal}
          fetchTodos={fetchTodos}
          userDetails={userDetails}
          allowedActivities={ALLOWED_ACTIVITIES}
        />
      )}
    </div>
  );
};

export default TodoList;
