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
  Legend,
  LabelList,
} from "recharts";

// Props interface
interface Props {
  countsales: {
    MonthToDateSales?: number;
    YearToDateSales?: number;
    TotalActualSales?: number;
  };
}

const SalesPerformanceSummary: React.FC<Props> = ({ countsales }) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    });

  const data = [
    {
      name: "Sales Performance",
      "Month to Date": countsales.MonthToDateSales || 0,
      "Year to Date": countsales.YearToDateSales || 0,
      "Total Actual Sales": countsales.TotalActualSales || 0,
    },
  ];

  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow-md">
      <h3 className="font-semibold text-sm mb-2">Sales Performance Summary</h3>
      <p className="text-gray-600 mt-1 mb-4 text-xs">
        This chart provides an overview of sales performance, from Sales Orders (SO) to Delivery Receipts (DR), including Month-to-Date, Year-to-Date, and total sales.
      </p>

      <div className="w-full h-80">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: 10, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
            />
            <Legend verticalAlign="top" height={36} />
            <defs>
              <linearGradient id="colorMTD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2B6CB0" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#90CDF4" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorYTD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38A169" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#C6F6D5" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DD6B20" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FBD38D" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <Bar dataKey="Month to Date" fill="url(#colorMTD)" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="Month to Date"
                content={({ value }) => formatCurrency(Number(value))}
                position="top"
                fontSize={10}
              />
            </Bar>
            <Bar dataKey="Year to Date" fill="url(#colorYTD)" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="Year to Date"
                content={({ value }) => formatCurrency(Number(value))}
                position="top"
                fontSize={10}
              />
            </Bar>
            <Bar dataKey="Total Actual Sales" fill="url(#colorTotal)" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="Total Actual Sales"
                content={({ value }) => formatCurrency(Number(value))}
                position="top"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesPerformanceSummary;
