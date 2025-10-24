"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FaCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoSync, IoSearchOutline } from "react-icons/io5";

export interface CompletedItem {
  id: string;
  companyname: string;
  referenceid: string;
  date_created: string;
  date_updated?: string;
  activitystatus?: string;
  activitynumber: string;
  typeactivity?: string;
  remarks?: string;
  quotationnumber?: string;
  quotationamount?: string;
  soamount?: string;
  sonumber?: string;
  paymentterm?: string;
  deliverydate?: string;
}

interface CompletedProps {
  userDetails: any;
  refreshTrigger?: number;
  selectedTSA?: string;
}

const POLL_INTERVAL = 60000;
const ITEMS_PER_PAGE = 10;

const Completed: React.FC<CompletedProps> = ({
  userDetails,
  refreshTrigger,
  selectedTSA,
}) => {
  const [data, setData] = useState<CompletedItem[]>([]);
  const [agentData, setAgentData] = useState<
    Record<string, { Firstname: string; Lastname: string; profilePicture: string }>
  >({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Fetch completed activities
  const fetchCompleted = useCallback(async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
      );
      if (!res.ok) throw new Error("Failed to fetch completed tasks");

      const result = await res.json();
      const list: CompletedItem[] = Array.isArray(result)
        ? result
        : result.data || result.items || [];

      setData(list);
    } catch (err) {
      console.error("❌ Error fetching completed:", err);
    } finally {
      setLoading(false);
    }
  }, [userDetails?.ReferenceID]);

  // 🔹 Fetch agent info for each unique referenceid
  const fetchAgents = useCallback(async (referenceIds: string[]) => {
    const map: Record<string, { Firstname: string; Lastname: string; profilePicture: string }> = {};

    await Promise.all(
      referenceIds.map(async (ref) => {
        try {
          const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(ref)}`);
          const data = await res.json();
          map[ref] = {
            Firstname: data.Firstname || "",
            Lastname: data.Lastname || "",
            profilePicture: data.profilePicture || "/taskflow.png",
          };
        } catch {
          map[ref] = {
            Firstname: "",
            Lastname: "",
            profilePicture: "/taskflow.png",
          };
        }
      })
    );

    setAgentData(map);
  }, []);

  // 🔁 Re-fetch data every POLL_INTERVAL
  useEffect(() => {
    fetchCompleted();
    const interval = setInterval(fetchCompleted, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCompleted, refreshTrigger]);

  // 🔁 Fetch agent info after data loads
  useEffect(() => {
    if (data.length > 0) {
      const uniqueRefs = Array.from(new Set(data.map((d) => d.referenceid)));
      fetchAgents(uniqueRefs);
    }
  }, [data, fetchAgents]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const renderField = (label: string, value?: string | null) =>
    value ? (
      <p className="mb-1 text-[10px]">
        <span className="font-semibold">{label}:</span> {value}
      </p>
    ) : null;

  // 🔍 Filter by company name + TSA selection
  const filteredData = data
    .filter((item) =>
      (item.companyname ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) => (selectedTSA ? item.referenceid === selectedTSA : true));

  // 🔹 Skeleton for loading
  const ActivitySkeleton = () => (
    <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
      <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
      <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <span className="text-xs text-gray-600 font-bold">
          Total: <span className="text-orange-500">{filteredData.length}</span>
        </span>

        <div className="flex items-center gap-2 relative">
          <button
            className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={() => setSearchOpen((p) => !p)}
          >
            Search <IoSearchOutline size={15} />
          </button>

          {searchOpen && (
            <div className="absolute right-16 top-8 bg-white border rounded-md shadow-md z-10 p-2">
              <input
                type="text"
                placeholder="Search clients ..."
                className="border border-gray-300 rounded px-2 py-2 text-xs w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowFilter(false); // auto-hide after selecting
                }}
              />
            </div>
          )}

          <button
            className="flex items-center gap-1 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={fetchCompleted}
          >
            {loading ? <IoSync size={14} className="animate-spin" /> : <IoSync size={14} />}
          </button>
        </div>
      </div>

      {/* List */}
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)
        : filteredData.length === 0
          ? (
            <div className="text-center text-gray-400 italic text-xs">
              No completed tasks yet
            </div>
          )
          : filteredData.slice(0, visibleCount).map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const agent = agentData[item.referenceid];

            return (
              <div
                key={item.id}
                className="rounded-lg shadow bg-green-100 cursor-pointer p-3"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center">
                  <img
                    src={agent?.profilePicture || "/taskflow.png"}
                    alt="Agent"
                    className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-300"
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center space-x-1">
                      <FaCircle className="text-green-500 w-2 h-2" />
                      <p className="font-semibold text-[10px] uppercase">
                        {item.companyname}
                      </p>
                    </div>
                    <p className="text-[8px] text-gray-600">
                      {agent ? `${agent.Firstname} ${agent.Lastname}` : "Loading agent..."}
                    </p>
                    {item.activitynumber && (
                      <p className="text-[8px] text-gray-600">
                        Activity: <span className="text-black">{item.typeactivity}</span> |{" "}
                        {item.activitynumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pl-2 mt-2 text-[10px] space-y-1">
                    {renderField("Quotation Number", item.quotationnumber)}
                    {renderField("Quotation Amount", item.quotationamount)}
                    {renderField("SO Amount", item.soamount)}
                    {renderField("SO Number", item.sonumber)}
                    {renderField("Status", item.activitystatus)}
                    {renderField("Remarks", item.remarks)}
                    {renderField("Payment Term", item.paymentterm)}
                    {renderField("Delivery Date", item.deliverydate)}
                    {renderField("Date Created", item.date_created)}
                  </div>
                )}
              </div>
            );
          })}

      {visibleCount < filteredData.length && (
        <div className="flex justify-center mt-2">
          <button
            className="px-4 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
};

export default Completed;
