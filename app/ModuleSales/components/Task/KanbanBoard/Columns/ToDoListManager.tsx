"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface UserDetails {
  ReferenceID: string;
  Role?: string;
  [key: string]: any;
}

interface TodoItem {
  id: string;
  typeactivity: string;
  remarks: string;
  startdate: string;
  enddate: string;
  referenceid: string;
  scheduled_status: string;
}

interface AgentData {
  Firstname: string;
  Lastname: string;
  profilePicture: string;
}

const allowedTypeActivities = [
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
];

const TodoListManager: React.FC<{
  userDetails: UserDetails | null;
  refreshTrigger: number;
  selectedTSA?: string | null;
}> = ({ userDetails, refreshTrigger, selectedTSA }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState<Record<string, AgentData>>({});
  const [selectedTab, setSelectedTab] = useState<"pending" | "done">("pending");

  // Use a ref as persistent cache to prevent re-fetching
  const agentCache = useRef<Record<string, AgentData>>({});

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";

    const date = new Date(timestamp);

    // Use toLocaleString with Manila time zone
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-500 text-white";
      case "in progress":
        return "bg-blue-500 text-white";
      case "pending":
        return "bg-yellow-500 text-black";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    const referenceId =
      selectedTSA && selectedTSA.trim() !== ""
        ? selectedTSA
        : userDetails?.ReferenceID;

    if (!referenceId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/GetTodoManager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceid: referenceId, role: userDetails?.Role }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch");

      const filtered = (data.todos || []).filter((t: TodoItem) =>
        allowedTypeActivities.includes(t.typeactivity)
      );
      setTodos(filtered);
    } catch (err) {
      console.error("❌ Fetch todos error:", err);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [userDetails?.ReferenceID, selectedTSA, userDetails?.Role]);

  // Fetch agent data for missing references only
  const fetchAgents = useCallback(async (referenceIds: string[]) => {
    const uniqueMissing = referenceIds.filter((ref) => !agentCache.current[ref]);
    if (uniqueMissing.length === 0) return;

    try {
      const results = await Promise.all(
        uniqueMissing.map(async (ref) => {
          try {
            const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(ref)}`);
            const data = await res.json();
            return {
              ref,
              data: {
                Firstname: data.Firstname || "",
                Lastname: data.Lastname || "",
                profilePicture: data.profilePicture || "/taskflow.png",
              },
            };
          } catch {
            return {
              ref,
              data: {
                Firstname: "",
                Lastname: "",
                profilePicture: "/taskflow.png",
              },
            };
          }
        })
      );

      const newMap: Record<string, AgentData> = {};
      results.forEach(({ ref, data }) => {
        agentCache.current[ref] = data;
        newMap[ref] = data;
      });

      setAgentData((prev) => ({ ...prev, ...newMap }));
    } catch (e) {
      console.error("Agent fetch error:", e);
    }
  }, []);

  // Fetch todos on changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos, refreshTrigger]);

  // Fetch agents after todos loaded
  useEffect(() => {
    const ids = [...new Set(todos.map((t) => t.referenceid).filter(Boolean))];
    if (ids.length > 0) fetchAgents(ids);
  }, [todos, fetchAgents]);

  // Memoize filtered todos to prevent re-renders
  const filteredTodos = useMemo(
    () =>
      todos.filter((t) =>
        selectedTab === "pending"
          ? t.scheduled_status?.toLowerCase() === "pending"
          : t.scheduled_status?.toLowerCase() === "done"
      ),
    [todos, selectedTab]
  );

  const pendingCount = useMemo(
    () => todos.filter((t) => t.scheduled_status?.toLowerCase() === "pending").length,
    [todos]
  );

  const completedCount = useMemo(
    () => todos.filter((t) => t.scheduled_status?.toLowerCase() === "done").length,
    [todos]
  );

  return (
    <div className="space-y-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 To-Do List</h3>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-300 mb-2 text-xs">
        <button
          className={`pb-2 ${selectedTab === "pending"
              ? "border-b-2 border-yellow-500 font-semibold"
              : "text-gray-500"
            }`}
          onClick={() => setSelectedTab("pending")}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`pb-2 ${selectedTab === "done"
              ? "border-b-2 border-green-500 font-semibold"
              : "text-gray-500"
            }`}
          onClick={() => setSelectedTab("done")}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Todo List */}
      {loading ? (
        <p className="text-xs text-gray-400 italic">Loading tasks...</p>
      ) : filteredTodos.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No tasks found.</p>
      ) : (
        filteredTodos.map((todo) => {
          const agent = agentData[todo.referenceid] || agentCache.current[todo.referenceid];
          return (
            <div
              key={todo.id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition text-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={agent?.profilePicture || "/taskflow.png"}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover border"
                />
                <p className="font-semibold text-gray-800">
                  {agent
                    ? `${agent.Firstname} ${agent.Lastname}`
                    : "Loading user..."}
                </p>
              </div>

              <p className="font-semibold text-gray-800">{todo.typeactivity}</p>
              <p className="text-gray-600 text-[11px] mt-1 italic">
                {todo.remarks || "No remarks available."}
              </p>

              <div className="flex justify-between mt-2 text-[11px] text-gray-500">
                <p>📅 Start: {formatDate(todo.startdate)}</p>
                <p>🕓 End: {formatDate(todo.enddate)}</p>
              </div>

              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                    todo.scheduled_status
                  )}`}
                >
                  {todo.scheduled_status || "No Status"}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TodoListManager;
