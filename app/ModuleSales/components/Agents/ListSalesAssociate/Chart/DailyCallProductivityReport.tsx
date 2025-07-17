"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface CallData {
  dailyOutbound: number;
  mtdOutbound: number;
  dailySuccessful: number;
  mtdSuccessful: number;
  dailyUnsuccessful: number;
  mtdUnsuccessful: number;
  dailyInbound: number;
  mtdInbound: number;
}

interface Props {
  callData: CallData;
}

const DailyCallProductivityReport: React.FC<Props> = ({ callData }) => {
  const chartData = [
    {
      name: "Outbound Calls",
      Daily: callData.dailyOutbound || 0,
      MTD: callData.mtdOutbound || 0,
    },
    {
      name: "Successful Calls",
      Daily: callData.dailySuccessful || 0,
      MTD: callData.mtdSuccessful || 0,
    },
    {
      name: "Unsuccessful Calls",
      Daily: callData.dailyUnsuccessful || 0,
      MTD: callData.mtdUnsuccessful || 0,
    },
    {
      name: "Inbound Calls",
      Daily: callData.dailyInbound || 0,
      MTD: callData.mtdInbound || 0,
    },
  ];

  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow-md">
      <h3 className="font-semibold text-sm mb-2">Daily Call Productivity Report</h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        This 3D-styled chart shows daily and month-to-date (MTD) call productivity including outbound, successful, unsuccessful, and inbound calls.
      </p>

      <div className="w-full h-80">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            barCategoryGap="25%"
          >
            <defs>
              {/* Gradient for Daily */}
              <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0077B6" stopOpacity={1} />
              </linearGradient>

              {/* Gradient for MTD */}
              <linearGradient id="mtdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB347" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FF8000" stopOpacity={1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />

            <Bar
              dataKey="Daily"
              fill="url(#dailyGradient)"
              radius={[6, 6, 0, 0]}
              barSize={20}
            >
              <LabelList dataKey="Daily" position="top" fontSize={10} />
            </Bar>

            <Bar
              dataKey="MTD"
              fill="url(#mtdGradient)"
              radius={[6, 6, 0, 0]}
              barSize={20}
            >
              <LabelList dataKey="MTD" position="top" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyCallProductivityReport;
