import React, { useMemo, useRef, useState, useEffect } from "react";

interface SalesRecord {
  activitystatus?: string;
  date_created: string;
}

interface DropOffRateProps {
  records: SalesRecord[];
}

const CHART_HEIGHT = 300;
const MARGIN = { top: 20, right: 60, bottom: 40, left: 40 };

const DropOffRate: React.FC<DropOffRateProps> = ({ records }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    month?: string;
    rate?: number;
  }>({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const monthlyRates = useMemo(() => {
    const monthlyTotals: Record<string, { total: number; dropped: number }> = {};

    records.forEach(({ date_created, activitystatus }) => {
      if (!date_created) return;
      const month = new Date(date_created).toISOString().slice(0, 7);

      if (!monthlyTotals[month]) monthlyTotals[month] = { total: 0, dropped: 0 };
      monthlyTotals[month].total += 1;

      const lowerStatus = (activitystatus || "").toLowerCase();
      if (lowerStatus === "cancelled" || lowerStatus === "loss") {
        monthlyTotals[month].dropped += 1;
      }
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();

    return sortedMonths.map((month) => {
      const { total, dropped } = monthlyTotals[month];
      const dropOffRate = total > 0 ? (dropped / total) * 100 : 0;
      return {
        month,
        dropOffRate: Number(dropOffRate.toFixed(2)),
      };
    });
  }, [records]);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxY = 100;

  const xStep = monthlyRates.length > 1 ? innerWidth / (monthlyRates.length - 1) : innerWidth;

  const buildPath = () => {
    if (monthlyRates.length === 0) return "";

    const points = monthlyRates.map((d, i) => {
      const x = MARGIN.left + i * xStep;
      const y = MARGIN.top + innerHeight * (1 - d.dropOffRate / maxY);
      return { x, y };
    });

    if (points.length === 1) {
      const p = points[0];
      return `M${p.x},${p.y}`;
    }

    let path = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      path += ` C${midX},${curr.y} ${midX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  };

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    +(maxY * (i / yTicks)).toFixed(0)
  );

  const handleMouseMove = (e: React.MouseEvent, d: typeof monthlyRates[0], index: number) => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = MARGIN.left + index * xStep;
    const y = MARGIN.top + innerHeight * (1 - d.dropOffRate / maxY);
    setTooltip({
      visible: true,
      x: x + bounds.left,
      y: y + bounds.top,
      month: d.month,
      rate: d.dropOffRate,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <section className="border p-4 rounded-md shadow-md">
      <h2 className="text-sm font-semibold mb-4">Cancellation / Drop-off Rate (Monthly %)</h2>
      <div
        ref={containerRef}
        style={{ width: "100%", position: "relative", height: CHART_HEIGHT }}
      >
        <svg width={width} height={CHART_HEIGHT}>
          {yTickValues.map((val) => {
            const y = MARGIN.top + innerHeight * (1 - val / maxY);
            return (
              <g key={`y-tick-${val}`}>
                <line
                  x1={MARGIN.left}
                  y1={y}
                  x2={width - MARGIN.right}
                  y2={y}
                  stroke="#eee"
                />
                <text
                  x={MARGIN.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#666"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {monthlyRates.map((d, i) => {
            const x = MARGIN.left + i * xStep;
            const label = d.month;
            return (
              <text
                key={`x-label-${label}`}
                x={x}
                y={CHART_HEIGHT - MARGIN.bottom + 15}
                textAnchor="middle"
                fontSize={10}
                fill="#666"
              >
                {label}
              </text>
            );
          })}

          <line
            x1={MARGIN.left}
            y1={CHART_HEIGHT - MARGIN.bottom}
            x2={width - MARGIN.right}
            y2={CHART_HEIGHT - MARGIN.bottom}
            stroke="#bbb"
          />

          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={CHART_HEIGHT - MARGIN.bottom}
            stroke="#bbb"
          />

          <path
            d={buildPath()}
            fill="none"
            stroke="#ff4d4f"
            strokeWidth={2}
          />

          {monthlyRates.map((d, i) => {
            const cx = MARGIN.left + i * xStep;
            const cy = MARGIN.top + innerHeight * (1 - d.dropOffRate / maxY);
            return (
              <circle
                key={`point-${d.month}`}
                cx={cx}
                cy={cy}
                r={5}
                fill="#ff4d4f"
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onMouseMove={(e) => handleMouseMove(e, d, i)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>

        {tooltip.visible && (
          <div
            style={{
              position: "fixed",
              top: tooltip.y - 40,
              left: tooltip.x + 10,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "6px 10px",
              fontSize: 12,
              pointerEvents: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 1000,
              whiteSpace: "nowrap",
            }}
          >
            <div><strong>Month:</strong> {tooltip.month}</div>
            <div><strong>Drop-off Rate:</strong> {tooltip.rate}%</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DropOffRate;
