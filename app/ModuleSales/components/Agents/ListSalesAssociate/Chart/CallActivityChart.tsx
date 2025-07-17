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

interface CallActivityChartProps {
  callData: {
    dailyOutbound?: number;
    dailyInbound?: number;
  };
}

const COLORS = ["#990000", "#000068"];

const CallActivityChart: React.FC<CallActivityChartProps> = ({ callData }) => {
  const data = [
    { name: "Outbound Call", value: callData.dailyOutbound || 0 },
    { name: "Inbound Call", value: callData.dailyInbound || 0 },
  ];

  return (
    <div className="border rounded-lg p-4 text-center shadow bg-white">
      <h3 className="font-semibold text-sm mb-2">Call Activity Chart</h3>
      <p className="text-xs text-gray-600 mb-4">
        This chart provides a visual representation of daily call activities,
        categorized into outbound calls and inbound calls. It helps in analyzing
        call distribution and performance trends.
      </p>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <radialGradient
                  key={index}
                  id={`radial-${index}`}
                  cx="50%"
                  cy="50%"
                  r="65%"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </radialGradient>
              ))}
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="5"
                  floodColor="#000"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={30}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              stroke="#fff"
              isAnimationActive
              filter="url(#shadow)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#radial-${index})`}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallActivityChart;
