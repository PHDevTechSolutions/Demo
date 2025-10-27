"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

interface ToDoListFormProps {
  setShowModal: (value: boolean) => void;
  fetchTodos: () => void;
  userDetails: any;
  allowedActivities: string[];
}

const getNowInPH = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ToDoListForm: React.FC<ToDoListFormProps> = ({
  setShowModal,
  fetchTodos,
  userDetails,
  allowedActivities,
}) => {
  const [mode, setMode] = useState("pick");
  const [typeactivity, setTypeactivity] = useState(allowedActivities[0]);
  const [remarks, setRemarks] = useState("");
  const [startDate, setStartDate] = useState(formatDateTimeLocal(getNowInPH()));
  const [endDate, setEndDate] = useState(formatDateTimeLocal(getNowInPH()));

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
          tsm: userDetails?.TSM,
          manager: userDetails?.Manager,
          typeactivity,
          remarks,
          startdate: startDate,
          enddate: endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setShowModal(false);
      fetchTodos();
    } catch (err: any) {
      toast.error(err.message || "Failed to add task.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-600 to-teal-500">
          <h3 className="text-white font-semibold text-lg">Add / Edit Task</h3>
          <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 transition text-lg">
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
              {allowedActivities.map((act) => (
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

          {/* Hide start/end when "Site Visit" */}
          {typeactivity !== "Site Visit" && (
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
          )}

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
  );
};

export default ToDoListForm;
