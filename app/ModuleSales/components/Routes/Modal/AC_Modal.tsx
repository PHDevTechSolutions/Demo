// ./Modal/AC_MODAL.tsx
"use client";

import React from "react";
import { format } from "date-fns";

interface Post {
  companyname: string;
  typeactivity: string;
  remarks: string;
  contactperson: string;
  contactnumber: string;
  date_created: string;
}

interface ModalProps {
  selectedDate: Date;
  selectedPosts: Post[];
  onClose: () => void;
}

const Tools: React.FC<ModalProps> = ({ selectedDate, selectedPosts, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            🕒 Activities on {format(selectedDate, "MMMM dd, yyyy")} ({selectedPosts.length})
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
          {selectedPosts.length > 0 ? (
            selectedPosts.map((post, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {post.companyname}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {new Date(post.date_created).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    📌 <span className="font-medium">Activity:</span> {post.typeactivity || "N/A"}
                  </p>
                  <p>
                    📝 <span className="font-medium">Remarks:</span> {post.remarks || "None"}
                  </p>
                  <p>
                    📞 <span className="font-medium">Contact:</span> {post.contactperson} ({post.contactnumber})
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">
              No activities found on this day.
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

export default Tools;
