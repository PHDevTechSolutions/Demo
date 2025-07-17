"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  timeMotionData: Record<string, number>;
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
};

const COLORS = ["#FF8C00", "#FFA500", "#FFB84D", "#FFD280", "#FFE0B3"];

const validActivities = new Set([
  "Customer Order",
  "Customer Inquiry Sales",
  "Follow Up",
  "FB-Marketplace",
  "After Sales-Refund",
  "After Sales-Repair/Replacement",
  "Quotation Preparation",
  "Sales Order Preparation",
  "Delivery Concern",
  "Accounting Concern",
  "Admin- Supplier Accreditation",
  "Admin- Credit Terms Application",
  "Inbound Call",
  "Outbound calls",
  "Site Visit",
  "Check/Read emails",
  "Bidding Preperation",
  "Viber Replies",
  "Technical Concern",
  "Sample Request"
]);

const DailyActivitySummary: React.FC<Props> = ({ timeMotionData }) => {
  const data = Object.entries(timeMotionData)
    .filter(([activity]) => validActivities.has(activity))
    .map(([activity, duration]) => ({
      name: activity,
      duration,
    }))
    .sort((a, b) => b.duration - a.duration);

  const dynamicHeight = Math.max(data.length * 40, 400); // 40px per row, min 400px

  return (
    <div className="border rounded-lg p-6 col-span-2 bg-white shadow-md">
      <h3 className="font-semibold text-sm mb-2">Daily Activity Summary</h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        A detailed breakdown of time spent on various daily activities, providing insights into productivity and task distribution.
      </p>

      <div style={{ width: "100%", height: dynamicHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          >
            <defs>
              <linearGradient id="bar3d" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF8C00" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#FFA500" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatDuration} />
            <YAxis dataKey="name" type="category" width={200} />
            <Tooltip formatter={(value: number) => formatDuration(value)} />
            <Bar
              dataKey="duration"
              fill="url(#bar3d)"
              barSize={20}
              // removed radius here
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyActivitySummary;
