// components/Chart/Doughnut.tsx
"use client";

import React from "react";
import { PieChart } from "react-minimal-pie-chart";

interface DoughnutChartProps {
  percent: number; // completed percent
  size?: string; // tailwind width/height (default: w-5 h-5)
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ percent, size = "w-5 h-5" }) => {
  return (
    <PieChart
      data={[
        { title: "Progress", value: percent, color: "#34D399" },
        { title: "Remaining", value: 100 - percent, color: "#E5E7EB" },
      ]}
      totalValue={100}
      lineWidth={40}
      animate
      className={size}
    />
  );
};

export default DoughnutChart;
