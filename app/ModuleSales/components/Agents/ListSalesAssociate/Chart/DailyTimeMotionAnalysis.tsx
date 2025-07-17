"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TimeMotionData {
  inbound: number;   // in seconds
  outbound: number;  // in seconds
  others: number;    // in seconds
}

interface Props {
  timeMotionData: TimeMotionData;
}

const COLORS = ["#FF8C00", "#FFA500", "#FFE0B3"];

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

const DailyTimeMotionAnalysis: React.FC<Props> = ({ timeMotionData }) => {
  const data = [
    { name: "Client Engagement", value: timeMotionData.inbound },
    { name: "Outbound Calls", value: timeMotionData.outbound },
    { name: "Other Activities", value: timeMotionData.others },
  ];

  return (
    <div className="border rounded-lg p-6 bg-white shadow-md col-span-2">
      <h3 className="font-semibold text-sm mb-2">
        Daily Time and Motion Analysis
      </h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        This summary provides an overview of time spent on client interactions, outbound calls, and other activities. It helps in assessing productivity and optimizing workflow efficiency.
      </p>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              label={({ name, value }) => `${name}: ${formatDuration(value)}`}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatDuration(value)} />
            <Legend layout="horizontal" verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyTimeMotionAnalysis;
