// ./Modal/SourceModal.tsx
"use client";

import React from "react";

interface SourceItem {
  companyname: string;
  date_created?: string;
}

interface SourceModalProps {
  selectedSource: string;
  sourceGroups: Record<string, SourceItem[]>;
  onClose: () => void;
}

const SourceModal: React.FC<SourceModalProps> = ({
  selectedSource,
  sourceGroups,
  onClose,
}) => {
  const items = sourceGroups[selectedSource] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            📂 Companies for {selectedSource} ({items.length})
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition p-3 shadow-sm flex justify-between items-center text-xs"
              >
                <span className="font-semibold">{item.companyname}</span>
                <span className="text-gray-400 italic text-[11px]">
                  {item.date_created
                    ? new Date(item.date_created).toLocaleDateString()
                    : "No Date"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">
              No companies found for this source.
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

export default SourceModal;
