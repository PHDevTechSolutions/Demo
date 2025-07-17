"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ClientEngagementOverviewProps {
  touchbaseData: Record<string, number>;
}

const COLORS = ["#FF6B00", "#FF9F40", "#FFC107", "#FFB74D", "#FF8A65", "#FFA726"];

const ClientEngagementOverview: React.FC<ClientEngagementOverviewProps> = ({ touchbaseData }) => {
  const data = Object.entries(touchbaseData).map(([key, value]) => {
    const [typeclient] = key.split("-");
    return { name: typeclient, count: value };
  });

  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow-md">
      <h3 className="font-semibold text-sm mb-2">Client Engagement Overview</h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        This chart provides a summary of client interactions by client type. It helps track engagement levels and patterns.
      </p>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <defs>
              {data.map((_, index) => (
                <linearGradient id={`barColor-${index}`} key={index} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#barColor-${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientEngagementOverview;
