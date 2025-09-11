"use client";
import React, { useMemo, useState } from "react";

interface RecordType {
  activitystatus?: string;
  soamount?: number | string;
  actualsales?: number | string;
  date?: string;
}

interface SalesOrderProps {
  records: RecordType[];
}

const SalesOrder: React.FC<SalesOrderProps> = ({ records }) => {
  const [showComputation, setShowComputation] = useState(false);

  // SO-Done summary
  const soDoneSummary = useMemo(() => {
    const soDoneRecords = records.filter(
      (rec) => (rec.activitystatus || "").toLowerCase() === "so-done"
    );
    const totalCount = soDoneRecords.length;
    const totalAmount = soDoneRecords.reduce(
      (sum, rec) => sum + (Number(rec.soamount) || 0),
      0
    );
    return { totalCount, totalAmount };
  }, [records]);

  // Actual delivered sales summary
  const actualSalesSummary = useMemo(() => {
    const deliveredRecords = records.filter(
      (rec) => (rec.activitystatus || "").toLowerCase() === "delivered"
    );
    const count = deliveredRecords.length;
    const totalActualSales = deliveredRecords.reduce(
      (sum, rec) => sum + (Number(rec.actualsales) || 0),
      0
    );
    return { count, totalActualSales };
  }, [records]);

  // Conversion calculations
  const soToSICount = actualSalesSummary.count; // QTY
  const soToSIAmount = actualSalesSummary.totalActualSales; // Peso value
  const soToSIPercent =
    soDoneSummary.totalAmount > 0
      ? (actualSalesSummary.totalActualSales / soDoneSummary.totalAmount) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg p-4 font-sans text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold">Sales Orders Summary</h2>
          <button
            onClick={() => setShowComputation((prev) => !prev)}
            className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            {showComputation ? "Hide Computation" : "View Computation"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Overview of all sales orders, showing completed and delivered transactions.
        </p>

        {/* Computation Details */}
        {showComputation && (
          <div className="bg-gray-50 border rounded-lg p-4 mb-4 text-xs space-y-2">
            <h3 className="font-bold mb-2">Computation Details</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Total SO Count = Count of records with status = SO-Done →{" "}
                <b>{soDoneSummary.totalCount}</b>
              </li>
              <li>
                Total SO Amount = Sum of SO Amounts (SO-Done) →{" "}
                <b>
                  ₱{soDoneSummary.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </b>
              </li>
              <li>
                Total Delivered Count = Count of records with status = Delivered →{" "}
                <b>{soToSICount}</b>
              </li>
              <li>
                Total Delivered Sales = Sum of Actual Sales (Delivered) →{" "}
                <b>
                  ₱{soToSIAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </b>
              </li>
              <li>
                SO to SI Conversion (%) = (Total Delivered Sales ÷ Total SO Amount) × 100 →{" "}
                <b>{soToSIPercent.toFixed(2)}%</b>
              </li>
            </ul>
          </div>
        )}

        {soDoneSummary.totalCount === 0 ? (
          <p className="text-gray-500 text-xs">No Sales Orders with status "SO-Done".</p>
        ) : (
          <div className="mb-6 border rounded-md overflow-auto">
            {!showComputation && (
            <table className="w-full text-xs table-auto">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="px-4 py-2">Total SO</th>
                  <th className="px-4 py-2">SO Amount</th>
                  <th className="px-4 py-2">SO to SI Conversion (QTY)</th>
                  <th className="px-4 py-2">SO to SI Conversion (Peso Value)</th>
                  <th className="px-4 py-2">SO to SI Conversion (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-bold">{soDoneSummary.totalCount}</td>
                  <td className="px-4 py-2">
                    ₱{soDoneSummary.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2">{soToSICount}</td>
                  <td className="px-4 py-2">
                    ₱{soToSIAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2">{soToSIPercent.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrder;
