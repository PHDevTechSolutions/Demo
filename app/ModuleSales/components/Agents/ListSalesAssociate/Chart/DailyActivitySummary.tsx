"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  timeMotionData: Record<string, number>;
}

const COLORS = [
  "#FF8C00",
  "#FFA500",
  "#FFB84D",
  "#FFD280",
  "#FFE0B3",
  "#FFD966",
  "#FF9933",
  "#FFCC80",
  "#FFE6B3",
];

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
  "Sample Request",
]);

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
};

const DailyActivitySummary: React.FC<Props> = ({ timeMotionData }) => {
  const data = Object.entries(timeMotionData)
    .filter(([activity]) => validActivities.has(activity))
    .map(([activity, duration]) => ({ name: activity, value: duration }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percentageData = data.map((item) => ({
    ...item,
    value: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <div className="border rounded-lg p-6 col-span-2 bg-white shadow-md">
      <h3 className="font-semibold text-sm mb-2">Daily Activity Summary</h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        A percentage breakdown of time spent on various daily activities, showing distribution out of 100%.
      </p>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={percentageData}
              dataKey="value"
              nameKey="name"
              outerRadius={150}
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              {percentageData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm font-semibold">Total Work Hours: </span>
        <span className="text-sm text-gray-700">{formatDuration(total)}</span>
      </div>
    </div>
  );
};

export default DailyActivitySummary;
