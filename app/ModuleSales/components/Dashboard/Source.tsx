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

const CustomTooltip = ({
  visible,
  x,
  y,
  source,
  count,
}: {
  visible: boolean;
  x: number;
  y: number;
  source: string;
  count: number;
}) => {
  if (!visible) return null;
  return (
    <div
      className="bg-white border border-gray-200 rounded-md shadow-md p-2 text-xs z-50 pointer-events-none"
      style={{
        position: "fixed",
        top: y - 50,
        left: x + 20,
      }}
    >
      <p className="font-semibold text-gray-800 text-xs">{source}</p>
      <p className="text-cyan-500 font-semibold text-xs">Count: {count}</p>
    </div>
  );
};

const Source: React.FC<SourceProps> = ({ filteredAccounts }) => {
  // ✅ Filter accounts based on allowed sources OR Outbound Calls typeactivity
  const validAccounts = filteredAccounts.filter((post) => {
    if (!post.source) return false;
    if (post.source.toLowerCase() === "n/a" || post.source.toLowerCase() === "none") {
      return false;
    }

    // If source = "Outbound - Touchbase" -> replace with typeactivity if Outbound Calls
    if (post.source === "Outbound - Touchbase" && post.typeactivity === "Outbound calls") {
      return true;
    }

    // If source is in allowed sources
    if (ALLOWED_SOURCES.includes(post.source)) {
      return true;
    }

    return false;
  });

  // ✅ Normalize Outbound - Touchbase → Outbound Calls
  const normalizedAccounts = validAccounts.map((post) => ({
    ...post,
    source: post.source === "Outbound - Touchbase" ? "Outbound - Touchbase" : post.source,
  }));

  // Group by source and count
  const sourceCount: Record<string, number> = {};
  const sourceGroups: Record<string, Post[]> = {};

  normalizedAccounts.forEach((post) => {
    // Count
    sourceCount[post.source] = (sourceCount[post.source] || 0) + 1;

    // Group
    if (!sourceGroups[post.source]) {
      sourceGroups[post.source] = [];
    }
    sourceGroups[post.source].push(post);
  });

  // Transform to array and assign colors
  const data: DataItem[] = Object.entries(sourceCount).map(([source, count], i) => ({
    source,
    count,
    color: COLORS[i % COLORS.length],
  }));

  // Max count for bar width scaling
  const maxCount = Math.max(...data.map((d) => d.count), 0);

  // Total count of all sources
  const totalCount = data.reduce((acc, cur) => acc + cur.count, 0);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    source: string;
    count: number;
  }>({ visible: false, x: 0, y: 0, source: "", count: 0 });

  return (
    <section className="bg-white shadow-md rounded-lg overflow-hidden p-6 select-none">
      {/* Header / Title */}
      <h2 className="text-sm font-bold text-gray-800 mb-4">Source Breakdown</h2>
      <p className="text-xs text-gray-500 mb-4">
        Overview of accounts grouped by their source type for better tracking.
      </p>

      {/* Row 1: Graph + Legend */}
      <div className="flex gap-6 mb-6">
        {/* Graph */}
        <div className="flex-1 relative max-h-[400px]">
          {/* Bars */}
          <div className="flex flex-col gap-2 overflow-auto max-h-[400px]">
            {data.map(({ source, count, color }) => {
              const widthPercent = maxCount ? (count / maxCount) * 100 : 0;
              return (
                <div key={source} className="flex items-center" style={{ cursor: "pointer" }}>
                  <div
                    style={{
                      flexGrow: 1,
                      height: 30,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 6,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPercent}%`,
                        height: "100%",
                        backgroundColor: color,
                        transition: "width 0.5s ease",
                      }}
                    />
                    {widthPercent > 15 && (
                      <span
                        style={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "white",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                  {widthPercent <= 15 && (
                    <div style={{ marginLeft: 8, minWidth: 24, color: "#374151", fontWeight: 600, fontSize: 12 }}>
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <CustomTooltip {...tooltip} />
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

      {/* Row 2: Detailed Companies */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 mb-2">Companies by Source</h3>
        {Object.entries(sourceGroups).map(([source, posts]) => (
          <div key={source} className="mb-3">
            <h4 className="text-xs font-semibold text-gray-800 mb-1">
              {source} ({posts.length})
            </h4>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {posts.map((item, idx) => {
                const formattedDate = item.date_created
                  ? new Date(item.date_created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                  : "No Date";

                return (
                  <li key={idx}>
                    <span className="font-semibold text-gray-700">{item.companyname}</span>{" "}
                    <span className="text-gray-400 italic">| {formattedDate}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {validAccounts.length === 0 && (
          <p className="text-center text-gray-400 text-xs">No data available</p>
        )}
      </div>
    </section>
  );
};

export default Source;
