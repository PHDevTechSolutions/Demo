"use client";

import React, { useState } from "react";
import { FiChevronRight } from "react-icons/fi";

interface Note {
  id: number;
  companyname: string;
  activitystatus: string;
  typeactivity: string;
  remarks: string;
  date_created: string;
  quotationnumber: string;
  sonumber: string;
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

const Table: React.FC<TableProps> = ({ title, tasks, userDetails, limit, setLimit }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const renderTaskRow = (task: Note) => (
    <tr key={task.id} className="hover:bg-gray-50 border-b">
      {/* 🔹 Remarks fixed wide column */}
      <td className="px-2 py-6 text-xs capitalize w-[300px] whitespace-normal break-words">
        {task.remarks}
      </td>
      <td className="px-6 py-6 text-xs uppercase">{task.companyname}</td>
      <td className="px-6 py-6 text-xs">{task.typeactivity}</td>
      <td className="px-6 py-6 text-xs">{task.quotationnumber}</td>
      <td className="px-6 py-6 text-xs">{task.sonumber}</td>
      <td className="px-6 py-6 text-xs">{new Date(task.date_created).toLocaleString()}</td>
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
    <div className="mb-4 border-b">
      <h3
        className="text-xs font-semibold text-gray-700 mb-4 mt-4 pb-1 flex items-center gap-2 cursor-pointer select-none"
        onClick={toggleCollapse}
      >
        <FiChevronRight
          className={`transition-transform duration-200 ${
            collapsed ? "rotate-0" : "rotate-90"
          }`}
        />
        <span>{title}</span>
        <span className="bg-gray-200 px-2 py-0.5 text-[10px] rounded-full">
          {tasks.length}
        </span>
      </h3>

      {!collapsed && (
        <>
          {/* 🔹 Use table-fixed so Remarks width is respected */}
          <table className="min-w-full table-fixed mb-2">
            <thead>
              <tr className="text-xs text-left whitespace-nowrap border-b">
                {/* 🔹 Fixed wide header for remarks */}
                <th className="px-2 py-4 font-semibold text-gray-700 w-[300px]">
                  Remarks
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Quotation Number</th>
                <th className="px-6 py-4 font-semibold text-gray-700">SO Number</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Responsible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.slice(0, limit).map(renderTaskRow)}
            </tbody>
          </table>
          {tasks.length > 5 && (
            <div className="flex justify-center mt-2">
              <button
                className="w-full px-3 py-2 bg-gray-200 text-black rounded text-xs hover:bg-gray-300"
                onClick={() => setLimit(limit === 5 ? tasks.length : 5)}
              >
                {limit === 5 ? "Show All" : "Show Less"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;
