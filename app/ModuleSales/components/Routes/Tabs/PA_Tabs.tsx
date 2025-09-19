import React, { useMemo, useState } from "react";
import QuotationActualSales from "../../Routes/Charts/QAS_Chart";
import TrendAnalysis from "../../Routes/Charts/TAS_Chart";
import SOAmountQuotation from "../../Routes/Charts/SAQ_Chart";
import SOAmountActualSales from "../../Routes/Charts/SAA_Chart";
import SalesGrowthRate from "../../Routes/Charts/SGR_Chart";
import LeadTimeResponseAnalysis from "../../Routes/Charts/LTR_Chart";
import CallStatusBreakDown from "../../Routes/Charts/CSB_Chart";
import Seasonality from "../../Routes/Charts/SSY_Chart";
import ProjectAnalysis from "../../Routes/Charts/PAS_Chart";
import SalesPipeline from "../../Routes/Charts/SPL_Chart";
import DropOffRate from "../../Routes/Charts/DOR_Chart";

export interface SalesRecord {
  project: string;
  date_created: string;
  startdate?: string;
  enddate?: string;
  quotationamount: number;
  soamount: number;
  actualsales: number;
  targetquota: number;
  csragent: string;
  callstatus: string;
  callback: string;
  projectname: string;
}

interface PerformanceAnalyticsProps {
  groupedPosts: Record<string, SalesRecord[]>;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ groupedPosts }) => {
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const records: SalesRecord[] = useMemo(() => {
    return Object.values(groupedPosts).flat();
  }, [groupedPosts]);

  const filteredRecords = useMemo(() => {
    if (!startDateFilter && !endDateFilter) return records;

    const startFilter = startDateFilter ? new Date(startDateFilter) : null;
    const endFilter = endDateFilter ? new Date(endDateFilter) : null;

    return records.filter(({ startdate, enddate, date_created }) => {
      const recordStart = startdate ? new Date(startdate) : new Date(date_created);
      const recordEnd = enddate ? new Date(enddate) : new Date(date_created);

      const filterStart = startFilter || new Date(-8640000000000000);
      const filterEnd = endFilter || new Date(8640000000000000);

      return recordStart <= filterEnd && recordEnd >= filterStart;
    });
  }, [records, startDateFilter, endDateFilter]);

  return (
    <div className="space-y-8 p-4">
      <section className="mb-6 flex gap-4 items-center">
        <label className="text-xs">
          Start Date:{" "}
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            max={endDateFilter || undefined}
            className="border rounded px-2 py-1 text-xs"
          />
        </label>
        <label className="text-xs">
          End Date:{" "}
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            min={startDateFilter || undefined}
            className="border rounded px-2 py-1 text-xs"
          />
        </label>
        <button
          className="text-xs"
          onClick={() => {
            setStartDateFilter("");
            setEndDateFilter("");
          }}
        >
          Clear Filter
        </button>
      </section>

      <QuotationActualSales records={filteredRecords} />
      <TrendAnalysis records={filteredRecords} />
      <SOAmountQuotation records={filteredRecords} />
      <SOAmountActualSales records={filteredRecords} />
      <SalesGrowthRate records={filteredRecords} />
      <LeadTimeResponseAnalysis records={filteredRecords} />
      <CallStatusBreakDown records={filteredRecords} />
      <Seasonality records={filteredRecords} />
      <ProjectAnalysis records={filteredRecords} />
      <SalesPipeline records={filteredRecords} />
      <DropOffRate records={filteredRecords} />
    </div>
  );
};

export default PerformanceAnalytics;
