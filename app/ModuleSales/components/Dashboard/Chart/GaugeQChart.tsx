"use client";
import React from "react";

interface HorizontalBarProps {
  value: number;   // 📊 percentage (0–100)
  label: string;
  color?: string;
  backgroundColor?: string;
  height?: number;
}

const HorizontalBar: React.FC<HorizontalBarProps> = ({
  value,
  label,
  color = "#00C49F",
  backgroundColor = "#E0E0E0",
  height = 20,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs font-bold text-gray-800">{clampedValue.toFixed(1)}%</span>
      </div>
      <div
        className="w-full rounded-full"
        style={{ backgroundColor, height }}
      >
        <div
          className="rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
            height,
          }}
        />
      </div>
    </div>
  );
};

export default HorizontalBar;
