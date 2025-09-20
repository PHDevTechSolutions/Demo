"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FaCircle, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

export interface CompletedItem {
  id: string;
  companyname: string;
  referenceid: string;
  date_created: string;
  date_updated?: string;
  activitystatus?: string;
  activitynumber: string;
  profilepicture?: string;
  quotationnumber?: string;
  quotationamount?: string;
  soamount?: string;
  sonumber?: string;
  typeactivity?: string;
  remarks?: string;
  paymentterm?: string;
  deliverydate?: string;
}

interface CompletedProps {
  userDetails: any;
  refreshTrigger?: number;
}

const POLL_INTERVAL = 5000;
const ITEMS_PER_PAGE = 10;

const Completed: React.FC<CompletedProps> = ({ userDetails, refreshTrigger }) => {
  const [data, setData] = useState<CompletedItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lastFetchedIds = React.useRef<Set<string>>(new Set());

  const fetchCompleted = useCallback(async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
      );
      if (!res.ok) return;

      const result = await res.json();
      const list: CompletedItem[] = Array.isArray(result)
        ? result
        : result.data || result.items || [];

      const allowedStatuses = ["Done", "SO-Done", "Quote-Done", "Delivered"];
      const doneItems = list
        .filter(
          (item) =>
            allowedStatuses.includes(item.activitystatus || "") &&
            item.referenceid === userDetails.ReferenceID &&
            !lastFetchedIds.current.has(item.id)
        )
        .sort(
          (a, b) =>
            new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );

      if (doneItems.length > 0) {
        doneItems.forEach((item) => lastFetchedIds.current.add(item.id));
        setData((prev) => [...doneItems, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userDetails?.ReferenceID]);

  useEffect(() => {
    fetchCompleted();
    const interval = setInterval(fetchCompleted, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCompleted, refreshTrigger]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const renderField = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <p className="mb-1 text-[10px]">
        <span className="font-semibold">{label}:</span> {value}
      </p>
    );
  };

  const filteredData = data.filter((item) =>
    (item.companyname ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && data.length === 0)
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading data...</span>
      </div>
    );

  if (data.length === 0)
    return <div className="text-center text-gray-400 italic text-xs">No completed tasks yet</div>;

  return (
    <div className="space-y-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <span className="text-xs text-gray-600 font-bold">
          Total: <span className="text-orange-500">{filteredData.length}</span>
        </span>
        <button
          className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
          onClick={() => setSearchOpen((prev) => !prev)}
        >
          Search <FaSearch size={15} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-end space-y-2 md:space-y-0 md:space-x-2">
        {searchOpen && (
          <input
            type="text"
            placeholder="Search Accounts..."
            className="border border-gray-300 rounded px-2 py-2 text-xs w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </div>

      {filteredData.length > 0 ? (
        filteredData.slice(0, visibleCount).map((item) => {
          const isExpanded = expandedItems.has(item.id);
          return (
            <div
              key={item.id}
              className="rounded-lg shadow bg-green-100 cursor-pointer p-3"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="flex items-center">
                <img
                  src={item.profilepicture || userDetails?.profilePicture || "/taskflow.png"}
                  alt="Profile"
                  className="w-8 rounded-full object-cover mr-3"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center space-x-1">
                    <FaCircle className="text-green-500 w-2 h-2" />
                    <p className="font-semibold text-[10px] uppercase">{item.companyname}</p>
                  </div>
                  {item.activitynumber && (
                    <p className="text-[8px] text-gray-600">
                      Activity: <span className="text-black">{item.typeactivity}</span> | {item.activitynumber}
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
                  {renderField(
                    "Date Created",
                    item.date_created ? new Date(item.date_created).toLocaleString() : undefined
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-xs text-gray-400 italic">No completed tasks found.</p>
      )}

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
