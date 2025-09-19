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

interface Props {
  activityData: Record<string, number>;
}

const QuotationProductivityOverview: React.FC<Props> = ({ activityData }) => {
  const dailyAccountDev = activityData["Account Development"] || 0;
  const dailyExistingClient = activityData["Preparation: Preparation of Quote: Existing Client"] || 0;

  const data = [
    {
      category: "New Account Development",
      Daily: dailyAccountDev,
      MTD: dailyAccountDev,
    },
    {
      category: "Existing Client",
      Daily: dailyExistingClient,
      MTD: dailyExistingClient,
    },
  ];

  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow-md">
      <h3 className="font-semibold text-sm mb-2">Quotation Productivity Overview</h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        This grouped bar chart summarizes daily and MTD productivity for new account development and quotations for existing clients.
      </p>

      <div className="w-full h-80">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              contentStyle={{ borderRadius: 10, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
              labelStyle={{ fontSize: 12 }}
            />
            <Legend verticalAlign="top" height={36} />
            <defs>
              <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4C51BF" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#667EEA" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorMTD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E53E3E" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FEB2B2" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <Bar dataKey="Daily" fill="url(#colorDaily)" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="Daily" position="top" fontSize={10} />
            </Bar>
            <Bar dataKey="MTD" fill="url(#colorMTD)" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="MTD" position="top" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QuotationProductivityOverview;
