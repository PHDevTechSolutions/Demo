"use client";
import React, { useMemo, useState } from "react";
import GaugeChart from "./Chart/GaugeChart";

interface CallRecord {
  quotationnumber?: string;
  activitystatus?: string;
  actualsales?: number | string;
  source?: string;
  typeactivity?: string;
}

interface OutboundCallsProps {
  filteredCalls: CallRecord[];
  dateRange: { start: string; end: string };
}

const OutboundCalls: React.FC<OutboundCallsProps> = ({ filteredCalls, dateRange }) => {
  const [showCharts, setShowCharts] = useState(false);
  const [showComputation, setShowComputation] = useState(false);

  const getWorkingDaysCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) count++; // exclude Sundays
    }
    return count;
  };

  const workingDays = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return 0;
    return getWorkingDaysCount(dateRange.start, dateRange.end);
  }, [dateRange]);

  const totalActualSales = useMemo(() => {
    return filteredCalls.reduce((sum, call) => {
      const value = Number(call.actualsales);
      return isNaN(value) ? sum : sum + value;
    }, 0);
  }, [filteredCalls]);

  // ✅ Hiwalay: lahat ng valid quotations
  const totalQuotations = useMemo(() => {
    return filteredCalls.reduce((count, call) => {
      const value = (call.quotationnumber || "").toString().trim().toLowerCase();
      if (!["n/a", "none", "na", "n.a", "n.a.", "", null, undefined].includes(value)) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [filteredCalls]);

  // ✅ Hiwalay: lahat ng delivered
  const totalDelivered = useMemo(() => {
    return filteredCalls.reduce((count, call) => {
      if ((call.activitystatus || "").toLowerCase() === "delivered") {
        return count + 1;
      }
      return count;
    }, 0);
  }, [filteredCalls]);

  const groupedBySource = useMemo(() => {
    const sourceMap: Record<string, CallRecord[]> = {};

    filteredCalls.forEach((call) => {
      const source = call.source?.trim() || "Unknown";
      const typeActivity = call.typeactivity?.trim().toLowerCase() || "";

      if (source.toLowerCase() === "outbound - touchbase" && typeActivity === "outbound calls") {
        if (!sourceMap[source]) sourceMap[source] = [];
        sourceMap[source].push(call);
      }
    });

    return Object.entries(sourceMap).map(([source, calls]) => {
      const totalOB = calls.length;
      const obTarget = 35 * workingDays;
      const achievement = obTarget > 0 ? (totalOB / obTarget) * 100 : 0;

      const callsToQuote = totalOB > 0 ? (totalQuotations / totalOB) * 100 : 0;
      const outboundToSales = totalOB > 0 ? (totalDelivered / totalOB) * 100 : 0;

      return {
        source,
        obTarget,
        totalOB,
        achievement,
        callsToQuoteConversion: callsToQuote,
        outboundToSalesConversion: outboundToSales,
      };
    });
  }, [filteredCalls, workingDays, totalQuotations, totalDelivered]);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg p-4 font-sans text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold">Outbound Calls (Touch-Based Only)</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCharts((prev) => !prev)}
              className="px-3 py-1 text-xs rounded bg-orange-500 text-white hover:bg-orange-600"
            >
              {showCharts ? "Hide Chart" : "Show Chart"}
            </button>
            <button
              onClick={() => setShowComputation((prev) => !prev)}
              className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {showComputation ? "Hide Computation" : "View Computation"}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Call activities focused on touch-based outbound interactions with clients.
        </p>

        {groupedBySource.length === 0 ? (
          <p className="text-gray-500 text-xs">No calls found in selected date range.</p>
        ) : (
          <>
            {/* Gauge Charts */}
            {showCharts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {groupedBySource.map((item, index) => (
                  <React.Fragment key={`gauge-${index}`}>
                    <div className="p-2 flex flex-col items-center border-r">
                      <GaugeChart value={item.achievement} label="OB Achievement" />
                    </div>
                    <div className="p-2 flex flex-col items-center border-r">
                      <GaugeChart value={item.outboundToSalesConversion} label="Outbound to Sales Conv." />
                    </div>
                    <div className="p-2 flex flex-col items-center">
                      <GaugeChart value={item.callsToQuoteConversion} label="Calls to Quote Conv." />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Computation Details */}
            {showComputation && (
              <div className="bg-gray-50 border rounded-lg p-4 mb-4 text-xs space-y-2">
                <h3 className="font-bold mb-2">Computation Details</h3>
                {groupedBySource.map((item, index) => (
                  <div key={`comp-${index}`} className="mb-3">
                    <p className="font-semibold">Source: {item.source}</p>
                    <ul className="list-disc ml-5">
                      <li>OB Target = 35 × WorkingDays ({workingDays}) = <b>{item.obTarget}</b></li>
                      <li>Total OB = <b>{item.totalOB}</b></li>
                      <li>Achievement = (Total OB ÷ OB Target) × 100 = <b>{item.achievement.toFixed(2)}%</b></li>
                      <li>Total Quote (All Sources) = <b>{totalQuotations}</b></li>
                      <li>Total SI (All Sources) = <b>{totalDelivered}</b></li>
                      <li>Calls to Quote Conversion = (Total Quotations ÷ Total OB) × 100 = <b>{item.callsToQuoteConversion.toFixed(2)}%</b></li>
                      <li>Outbound to Sales Conversion = (Total Delivered ÷ Total OB) × 100 = <b>{item.outboundToSalesConversion.toFixed(2)}%</b></li>
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            {!showCharts && !showComputation && (
              <div className="border rounded mb-4 overflow-x-auto">
                <table className="w-full text-xs table-auto">
                  <thead className="bg-gray-100">
                    <tr className="text-left">
                      <th className="px-4 py-2">OB Target</th>
                      <th className="px-4 py-2">Total OB</th>
                      <th className="px-4 py-2">OB Achievement</th>
                      <th className="px-4 py-2">Calls to Quote Conversion</th>
                      <th className="px-4 py-2">Outbound to Sales Conversion</th>
                      <th className="px-4 py-2">Actual Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedBySource.map((item, index) => (
                      <tr key={`${item.source}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{item.obTarget}</td>
                        <td className="px-4 py-2">{item.totalOB}</td>
                        <td className="px-4 py-2">{item.achievement.toFixed(2)}%</td>
                        <td className="px-4 py-2">{item.callsToQuoteConversion.toFixed(2)}%</td>
                        <td className="px-4 py-2">{item.outboundToSalesConversion.toFixed(2)}%</td>
                        <td className="px-4 py-2 font-bold">
                          ₱{totalActualSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutboundCalls;
