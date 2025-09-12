"use client";
import { useMemo, useState, useEffect } from "react";
import CompaniesCard from "./Companies";
import Card from "./Card";
import Source from "./Source";
import CSRMetrics from "./CSRMetrics";
import OutboundCalls from "./OutboundCalls";
import Quotation from "./Quotation";
import SalesOrder from "./SalesOrder";

interface MainContainerProps {
  filteredAccounts: any[];
  userDetails: {
    Role: string;
    ReferenceID: string;
  };
  selectedAgent: string;
  setSelectedAgent: (value: string) => void;
  tsaOptions: { value: string; label: string }[];
  tsmOptions: { value: string; label: string }[];
}

const STORAGE_KEY = "mainContainerDateRange";

const presets = {
  today: () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return { start: `${yyyy}-${mm}-${dd}`, end: `${yyyy}-${mm}-${dd}` };
  },
  yesterday: () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().slice(0, 10);
    return { start: y, end: y };
  },
  last7Days: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  },
  last30Days: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  },
  thisMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  },
  lastMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  },
};

const MainContainer: React.FC<MainContainerProps> = ({
  filteredAccounts,
  userDetails,
  selectedAgent,
  setSelectedAgent,
  tsaOptions,
  tsmOptions,
}) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { }
      }
    }
    return presets.today();
  });

  const [selectedTSM, setSelectedTSM] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dateRange));
    }
  }, [dateRange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && val in presets) {
      setDateRange(presets[val as keyof typeof presets]());
    }
  };

  // Filter by date
  const filteredByDate = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return filteredAccounts;

    const startFilter = dateRange.start ? new Date(dateRange.start) : null;
    const endFilter = dateRange.end
      ? new Date(new Date(dateRange.end).setDate(new Date(dateRange.end).getDate() + 1))
      : null;

    return filteredAccounts.filter((acc) => {
      const startDate = acc.startdate ? new Date(acc.startdate) : null;
      const endDate = acc.enddate ? new Date(acc.enddate) : null;
      if (!startDate || !endDate) return false;
      return (!endFilter || startDate < endFilter) && (!startFilter || endDate >= startFilter);
    });
  }, [filteredAccounts, dateRange]);

  // Manager can see all filters
  const canFilterByTSM = ["Super Admin", "Manager"].includes(userDetails.Role);
  const canFilterByAgent = ["Super Admin", "Manager", "Territory Sales Manager"].includes(userDetails.Role);

  // Filter by TSM
  const filteredByTSM = useMemo(() => {
    if (!canFilterByTSM || !selectedTSM) return filteredByDate;
    return filteredByDate.filter((acc) => acc.tsm === selectedTSM);
  }, [filteredByDate, selectedTSM, canFilterByTSM]);

  // Filter by Agent
  const filteredByAgent = useMemo(() => {
    if (!canFilterByAgent) return filteredByTSM;

    // If a Manager selected a TSM, show all TSAs under that TSM automatically
    if (userDetails.Role === "Manager" && selectedTSM) {
      return filteredByTSM; // filteredByTSM already contains only accounts under selected TSM
    }

    // If Agent selected, filter by selectedAgent
    if (selectedAgent) {
      return filteredByTSM.filter((acc) => acc.referenceid === selectedAgent);
    }

    // Default: no agent filter applied
    return filteredByTSM;
  }, [filteredByTSM, selectedAgent, userDetails.Role, selectedTSM, canFilterByAgent]);

  // Compute TSAs to show in the dropdown
  const filteredTSAOptions = useMemo(() => {
    // If user is Manager and has selected a TSM, show only TSAs under that TSM
    if (userDetails.Role === "Manager" && selectedTSM) {
      return tsaOptions.filter((agent) =>
        filteredAccounts.some(
          (acc) => acc.tsm === selectedTSM && acc.referenceid === agent.value
        )
      );
    }
    // Otherwise, show all TSAs
    return tsaOptions;
  }, [tsaOptions, userDetails.Role, selectedTSM, filteredAccounts]);

  return (
    <div className="mx-auto p-4">
      {/* Filters Row */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        {/* Filter by TSM */}
        {canFilterByTSM && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by Territory Sales Manager
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-xs capitalize"
              value={selectedTSM}
              onChange={(e) => setSelectedTSM(e.target.value)}
            >
              <option value="">All TSM</option>
              {tsmOptions.map((tsm) => (
                <option key={tsm.value} value={tsm.value}>
                  {tsm.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter by Agent */}
        {canFilterByAgent && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by Agent
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-xs capitalize"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">All Agents</option>
              {filteredTSAOptions.map((agent) => (
                <option key={agent.value} value={agent.value}>
                  {agent.label}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Date Range Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label htmlFor="datePreset" className="block text-xs font-medium">
            Filter
          </label>
          <select
            id="datePreset"
            onChange={handlePresetChange}
            value={
              Object.entries(presets).find(
                ([, fn]) => JSON.stringify(fn()) === JSON.stringify(dateRange)
              )?.[0] || ""
            }
            className="border px-3 py-2 rounded text-xs text-black"
          >
            <option value="">Custom</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7Days">Last 7 Days</option>
            <option value="last30Days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>

        <div>
          <label htmlFor="start" className="block text-xs font-medium">
            Start Date
          </label>
          <input
            type="date"
            id="start"
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
            className="border px-3 py-2 rounded text-xs text-black"
          />
        </div>

        <div>
          <label htmlFor="end" className="block text-xs font-medium">
            End Date
          </label>
          <input
            type="date"
            id="end"
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
            className="border px-3 py-2 rounded text-xs text-black"
          />
        </div>
      </div>

      <div className="space-y-4">
        <CompaniesCard filteredAccounts={filteredByAgent} userDetails={userDetails} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Card filteredAccounts={filteredByAgent} userDetails={userDetails} />
        <Source filteredAccounts={filteredByAgent} />
        <CSRMetrics filteredAccounts={filteredByAgent} />
        <OutboundCalls filteredCalls={filteredByAgent} dateRange={dateRange} />
        <Quotation records={filteredByAgent} />
        <SalesOrder records={filteredByAgent} />
      </div>
    </div>
  );
};

export default MainContainer;
