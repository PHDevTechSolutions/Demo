"use client";
import React from "react";

interface HorizontalBarProps {
  value: number;
  label: string;
  size?: number; 
  height?: number;
  color?: string;
  backgroundColor?: string;
}

const HorizontalBar: React.FC<HorizontalBarProps> = ({
  value,
  label,
  size = 200,
  height = 20,
  color = "#00C49F",
  backgroundColor = "#E0E0E0",
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div style={{ width: size, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: "500", color: "#444" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: "bold", color: "#111" }}>
          {clampedValue.toFixed(2)}%
        </span>
      </div>
      
      <div
        style={{
          width: "100%",
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: height / 2,
            transition: "width 0.5s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};

export default HorizontalBar;
