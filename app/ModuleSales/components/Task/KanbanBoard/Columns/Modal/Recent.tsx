"use client";

import React from "react";

interface Activity {
  companyname: string;
  date_created: string;
  typeactivity?: string;
  remarks?: string;
  activitystatus: string;
  quotationnumber?: string;
  quotationamount?: string;
  sonumber?: string;
  soamount?: string;
}

interface RecentProps {
  show: boolean;
  onClose: () => void;
  activities: Activity[];
}

const Recent: React.FC<RecentProps> = ({ show, onClose, activities }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            🕒 Yesterday’s Activities
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((act, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {act.companyname}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {new Date(act.date_created).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    📌 <span className="font-medium">Activity:</span>{" "}
                    {act.typeactivity || "N/A"}
                  </p>
                  <p>
                    📝 <span className="font-medium">Remarks:</span>{" "}
                    {act.remarks || "None"}
                  </p>
                  <p>
                    💼 <span className="font-medium">Status:</span>{" "}
                    {act.activitystatus}
                  </p>
                  <div className="border-t border-gray-200 my-2"></div>
                  <p>
                    💰 <span className="font-medium">Quote:</span>{" "}
                    {act.quotationnumber || "-"} | {act.quotationamount || "-"}
                  </p>
                  <p>
                    📦 <span className="font-medium">SO:</span>{" "}
                    {act.sonumber || "-"} | {act.soamount || "-"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">
              No recent activities found.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recent;
