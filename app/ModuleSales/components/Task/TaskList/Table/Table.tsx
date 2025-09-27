"use client";

import React, { useState } from "react";
import { FiChevronRight } from "react-icons/fi";

interface Note {
  id: number;
  companyname: string;
  contactnumber: string;
  emailaddress: string;
  activitystatus: string;
  typeactivity: string;
  remarks: string;
  date_created: string;
  quotationnumber: string;
  quotationamount: string;
  sonumber: string;
  soamount: string;
  projectcategory?: string;
}

interface UserDetails {
  Firstname: string;
  Lastname: string;
  profilePicture?: string;
}

interface TableProps {
  title: string;
  tasks: Note[];
  userDetails: UserDetails;
  limit: number;
  setLimit: (limit: number) => void;
}

const ITEMS_PER_PAGE = 10;

const Table: React.FC<TableProps> = ({ title, tasks, userDetails, limit, setLimit }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Note | null>(null);
  const [formData, setFormData] = useState<Partial<Note>>({});
  const [loading, setLoading] = useState(false);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleRowClick = (task: Note) => {
    setSelectedTask(task);
    setFormData({
      typeactivity: task.typeactivity,
      sonumber: task.sonumber,
      quotationnumber: task.quotationnumber,
      soamount: task.soamount,
      quotationamount: task.quotationamount,
      projectcategory: task.projectcategory,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Save handler → calls API to update progress table
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/ModuleSales/Task/ActivityPlanner/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // backend will set date_updated = now() Manila
        }),
      });

      if (!res.ok) throw new Error("Failed to update progress");

      alert("✅ Progress updated successfully!");
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update progress.");
    } finally {
      setLoading(false);
    }
  };

  const renderTaskRow = (task: Note) => (
    <tr
      key={task.id}
      className="hover:bg-gray-50 border-b cursor-pointer"
      onClick={() => handleRowClick(task)}
    >
      <td className="px-2 py-6 text-xs capitalize w-[300px] whitespace-normal break-words">
        {task.remarks}
      </td>
      <td className="px-6 py-6 text-xs uppercase">
        {task.companyname}
        <br />
        {task.contactnumber}
        <span className="lowercase ml-1 text-gray-500 italic text-[10px]">
          {task.emailaddress}
        </span>
      </td>
      <td className="px-6 py-6 text-xs">{task.typeactivity}</td>
      <td className="px-6 py-6 text-xs">
        <div className="flex flex-col">
          <span>{task.quotationnumber}</span>
          <span className="text-gray-500 text-[11px]">
            {task.quotationamount ? `₱${task.quotationamount}` : ""}
          </span>
        </div>
      </td>
      <td className="px-6 py-6 text-xs">
        <div className="flex flex-col">
          <span>{task.sonumber}</span>
          <span className="text-gray-500 text-[11px]">
            {task.soamount ? `₱${task.soamount}` : ""}
          </span>
        </div>
      </td>
      <td className="px-6 py-6 text-xs">
        {new Date(task.date_created).toLocaleString()}
      </td>
      <td className="px-6 py-6 text-xs">
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
    <div className="mb-4 border-b relative">
      <h3
        className="text-xs font-semibold text-gray-700 mb-4 mt-4 pb-1 flex items-center gap-2 cursor-pointer select-none"
        onClick={toggleCollapse}
      >
        <FiChevronRight
          className={`transition-transform duration-200 ${collapsed ? "rotate-0" : "rotate-90"
            }`}
        />
        <span>{title}</span>
        <span className="bg-gray-200 px-2 py-0.5 text-[10px] rounded-full">
          {tasks.length}
        </span>
      </h3>

      {!collapsed && (
        <>
          <table className="min-w-full table-fixed mb-2">
            <thead>
              <tr className="text-xs text-left whitespace-nowrap border-b">
                <th className="px-2 py-4 font-semibold text-gray-700 w-[300px]">
                  Remarks
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Company Name
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Quotation
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">SO</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Responsible
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.slice(0, limit).map(renderTaskRow)}
            </tbody>
          </table>

          {limit < tasks.length && (
            <div className="flex justify-center mt-2">
              <button
                className="w-full px-3 py-2 bg-gray-200 text-black rounded text-xs hover:bg-gray-300"
                onClick={() => setLimit(limit + ITEMS_PER_PAGE)}
              >
                View More
              </button>
            </div>
          )}
        </>
      )}

      {/* Slide-up edit form */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t transform transition-transform duration-300 z-[999] ${selectedTask ? "translate-y-0" : "translate-y-full"
          }`}
      >
        {selectedTask && (
          <form className="p-4 grid grid-cols-2 gap-4" onSubmit={handleSave}>
            <h4 className="col-span-2 text-sm font-semibold mb-2">
              Edit Task for {selectedTask.companyname}
            </h4>

            <div>
              <label className="text-xs text-gray-600">Type Activity</label>
              <input
                name="typeactivity"
                value={formData.typeactivity || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">SO Number</label>
              <input
                name="sonumber"
                value={formData.sonumber || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Quotation Number</label>
              <input
                name="quotationnumber"
                value={formData.quotationnumber || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">SO Amount</label>
              <input
                name="soamount"
                value={formData.soamount || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Quotation Amount</label>
              <input
                name="quotationamount"
                value={formData.quotationamount || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Project Category</label>
              <input
                name="projectcategory"
                value={formData.projectcategory || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded text-xs"
              />
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-2 bg-gray-200 text-xs rounded hover:bg-gray-300"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Table;
