"use client";
import React, { useMemo, useState } from "react";
import GaugeQChart from "./Chart/GaugeQChart";

interface QuotationProps {
  records: any[];
}

const Quotation: React.FC<QuotationProps> = ({ records }) => {
  const [showCharts, setShowCharts] = useState(false);
  const [showComputation, setShowComputation] = useState(false);

  // Filter Quote-Done records
  const quoteDoneRecords = useMemo(() => {
    return records.filter(
      (rec) => (rec.activitystatus || "").trim().toLowerCase() === "quote-done"
    );
  }, [records]);

  const totalQuoteCount = quoteDoneRecords.length;

  // Total quotation amount
  const totalQuoteAmount = useMemo(() => {
    return quoteDoneRecords.reduce(
      (sum, rec) => sum + (Number(rec.quotationamount) || 0),
      0
    );
  }, [quoteDoneRecords]);

  // SO-Done stats
  const soStats = useMemo(() => {
    const filtered = records.filter(
      (rec) => (rec.activitystatus || "").trim().toLowerCase() === "so-done"
    );
    const totalSOAmount = filtered.reduce(
      (sum, rec) => sum + (Number(rec.soamount) || 0),
      0
    );
    return {
      quantity: filtered.length,
      totalSOAmount,
    };
  }, [records]);

  // Actual Sales (paid / delivered)
  const paidActualSalesRecords = useMemo(() => {
    return records.filter(
      (rec) =>
        (rec.activitystatus || "").toLowerCase() === "delivered" &&
        (Number(rec.actualsales) || 0) > 0
    );
  }, [records]);

  const totalPaidActualSales = useMemo(() => {
    return paidActualSalesRecords.reduce(
      (sum, rec) => sum + (Number(rec.actualsales) || 0),
      0
    );
  }, [paidActualSalesRecords]);

  // Calculations
  const quoteToSOCount = soStats.quantity; // QTY
  const quoteToSOAmount = soStats.totalSOAmount; // Peso Value
  const quoteToSOPercent =
    totalQuoteCount > 0 ? (quoteToSOCount / totalQuoteCount) * 100 : 0; // NEW %
  const quoteToSIPercent =
    totalQuoteAmount > 0 ? (totalPaidActualSales / totalQuoteAmount) * 100 : 0;

  // Aggregated quote data for table
  const aggregatedData = useMemo(() => {
    let totalCount = 0;
    let totalAmount = 0;
    let totalHandlingMs = 0;

    quoteDoneRecords.forEach((rec) => {
      const amount = Number(rec.quotationamount) || 0;
      let handlingMs = 0;

      try {
        const start = new Date(rec.startdate);
        const end = new Date(rec.enddate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
          handlingMs = end.getTime() - start.getTime();
        }
      } catch {}

      totalCount += 1;
      totalAmount += amount;
      totalHandlingMs += handlingMs;
    });

    const formatDuration = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    return [
      {
        totalCount,
        totalAmount,
        handlingTimeFormatted: formatDuration(totalHandlingMs),
      },
    ];
  }, [quoteDoneRecords]);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg p-4 font-sans text-black">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-sm font-bold">Quotations</h2>
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
          A record of all customer quotations, including those pending approval,
          approved, or disapproved.
        </p>

        {/* Gauges */}
        {showCharts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
            <div className="p-2 flex flex-col items-center border-r">
              <GaugeQChart
                value={quoteToSOPercent}
                label="Quote to SO Conversion (%)"
                color="#6366F1"
              />
            </div>

            <div className="p-2 flex flex-col items-center">
              <GaugeQChart
                value={quoteToSIPercent}
                label="Quotation to SI Conversion (%)"
                color="#F59E0B"
              />
            </div>
          </div>
        )}

        {/* Computation Details */}
        {showComputation && (
          <div className="bg-gray-50 border rounded-lg p-4 mb-4 text-xs space-y-2">
            <h3 className="font-bold mb-2">Computation Details</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Total Quotations (Quote-Done) = <b>{totalQuoteCount}</b>
              </li>
              <li>
                Total Quotation Amount ={" "}
                <b>
                  ₱
                  {totalQuoteAmount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </b>
              </li>
              <li>
                Total SO Quantity = <b>{quoteToSOCount}</b>
              </li>
              <li>
                Total SO Amount ={" "}
                <b>
                  ₱
                  {quoteToSOAmount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </b>
              </li>
              <li>
                Quote to SO Conversion (%) = (SO Count ÷ Quote Count) × 100 ={" "}
                <b>{quoteToSOPercent.toFixed(2)}%</b>
              </li>
              <li>
                Total Actual Sales (Delivered) ={" "}
                <b>
                  ₱
                  {totalPaidActualSales.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </b>
              </li>
              <li>
                Quotation to SI Conversion (%) = (Total Actual Sales ÷ Total
                Quotation Amount) × 100 ={" "}
                <b>{quoteToSIPercent.toFixed(2)}%</b>
              </li>
            </ul>
          </div>
        )}

        {/* Default Table */}
        {aggregatedData.length === 0 ? (
          <p className="text-gray-500 text-xs">
            No quotations with status "Quote-Done".
          </p>
        ) : (
          <div className="overflow-auto border rounded">
            {!showCharts && !showComputation && (
              <table className="w-full text-xs table-auto">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="px-4 py-2">Total Quote</th>
                    <th className="px-4 py-2">Total Amount</th>
                    <th className="px-4 py-2">Handling Time</th>
                    <th className="px-4 py-2">Quote to SO (QTY)</th>
                    <th className="px-4 py-2">Quote to SO Conversion (Peso Value)</th>
                    <th className="px-4 py-2">Quote to SO Conversion (%)</th>
                    <th className="px-4 py-2">Quotation to SI Conversion (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aggregatedData.map(
                    ({ totalCount, totalAmount, handlingTimeFormatted }, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{totalCount}</td>
                        <td className="px-4 py-2">
                          ₱
                          {totalAmount.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-2">{handlingTimeFormatted}</td>
                        <td className="px-4 py-2">{quoteToSOCount}</td>
                        <td className="px-4 py-2">
                          ₱
                          {quoteToSOAmount.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-2">
                          {quoteToSOPercent.toFixed(2)}%
                        </td>
                        <td className="px-4 py-2">
                          {quoteToSIPercent.toFixed(2)}%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotation;
