"use client";

import React, { useState } from "react";

interface Post {
  companyname: string;
  source: string;
  callstatus: string;
  typeactivity: string;
  date_created: string;
}

interface SourceProps {
  filteredAccounts: Post[];
}

interface DataItem {
  source: string;
  count: number;
  color: string;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#ec4899",
  "#22d3ee",
  "#eab308",
];

// ✅ Allowed sources
const ALLOWED_SOURCES = [
  "Existing Client",
  "CSR Inquiry",
  "Outbound - Follow-up",
  "Government",
  "Philgeps- Website",
  "Philgeps",
  "Distributor",
  "Modern Trade",
  "Facebook Marketplace",
  "Walk-in / Showroom",
];

const Source: React.FC<SourceProps> = ({ filteredAccounts }) => {
  // ✅ Filter accounts based on allowed sources OR Outbound Calls typeactivity
  const validAccounts = filteredAccounts.filter((post) => {
    if (!post.source) return false;
    if (post.source.toLowerCase() === "n/a" || post.source.toLowerCase() === "none") {
      return false;
    }

    if (post.source === "Outbound - Touchbase" && post.typeactivity === "Outbound calls") {
      return true;
    }

    if (ALLOWED_SOURCES.includes(post.source)) return true;

    return false;
  });

  // Group by source
  const sourceGroups: Record<string, Post[]> = {};
  validAccounts.forEach((post) => {
    const key = post.source === "Outbound - Touchbase" ? "Outbound - Touchbase" : post.source;
    if (!sourceGroups[key]) sourceGroups[key] = [];
    sourceGroups[key].push(post);
  });

  // Prepare data for graph
  const data: DataItem[] = Object.entries(sourceGroups).map(([source, posts], i) => ({
    source,
    count: posts.length,
    color: COLORS[i % COLORS.length],
  }));
  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const totalCount = data.reduce((acc, cur) => acc + cur.count, 0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const openModal = (source: string) => {
    setSelectedSource(source);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSource(null);
  };

  return (
    <section className="bg-white shadow-md rounded-lg overflow-hidden p-6 select-none">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-800">Source Breakdown</h2>
        <p className="text-xs text-gray-500 mt-1">
          Overview of accounts grouped by their source type for better tracking.
        </p>
        <p className="text-xs text-green-700 mt-1 italic">
          Click a bar to view companies per source
        </p>
      </div>

      {/* Graph + Legend */}
      <div className="flex gap-6 mb-6">
        {/* Graph */}
        <div className="flex-1 relative max-h-[400px]">
          <div className="flex flex-col gap-2 overflow-auto max-h-[400px]">
            {data.map(({ source, count, color }) => {
              const widthPercent = maxCount ? (count / maxCount) * 100 : 0;
              return (
                <div key={source} className="flex items-center justify-between cursor-pointer" onClick={() => openModal(source)}>
                  <div
                    className="flex-1 h-8 rounded overflow-hidden relative"
                    style={{ backgroundColor: "#E5E7EB" }}
                  >
                    <div
                      style={{
                        width: `${widthPercent}%`,
                        height: "100%",
                        backgroundColor: color,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <span className="ml-2 text-xs font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2" style={{ minWidth: 160 }}>
          <h3 className="text-xs text-black font-semibold mb-2">Legend</h3>
          {data.map(({ source, color }) => (
            <div key={source} className="flex items-center gap-2 text-xs text-gray-700">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
              <span>{source}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-gray-300 text-gray-900 font-bold text-sm">
            Total Count: {totalCount}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedSource && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
          onClick={closeModal} // 🔹 Close kapag click sa backdrop
        >
          <div
            className="bg-white rounded-lg p-6 w-11/12 max-w-lg max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()} // 🔹 Prevent close kapag click sa loob
          >
            {/* X button (top-right) */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>

            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Companies for {selectedSource} ({sourceGroups[selectedSource].length})
            </h3>

            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
              {sourceGroups[selectedSource].map((item, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{item.companyname}</span>{" "}
                  <span className="text-gray-400 italic">
                    |{" "}
                    {item.date_created
                      ? new Date(item.date_created).toLocaleDateString()
                      : "No Date"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default Source;
