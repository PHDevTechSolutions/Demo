"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { VariableSizeList as List, ListChildComponentProps } from "react-window";
import { FaCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

export interface CompletedItem {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
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
  callback?: string;
  projectname?: string;
  projectcategory?: string;
  projecttype?: string;
  typecall?: string;
  typeactivity?: string;
  source?: string;
  remarks?: string;
  callstatus?: string;
  startdate?: string;
  enddate?: string;
  ticketreferencenumber?: string;
  wrapup?: string;
  inquiries?: string;
  csragent?: string;
  paymentterm?: string;
  deliverydate?: string;
}

interface CompletedProps {
  userDetails: any;
  refreshTrigger?: number;
}

const POLL_INTERVAL = 5000;
const ITEM_HEIGHT_COLLAPSED = 70;
const ITEM_HEIGHT_EXPANDED = 350;

const Completed: React.FC<CompletedProps> = ({ userDetails, refreshTrigger }) => {
  const [data, setData] = useState<CompletedItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const lastFetchedIds = useRef<Set<string>>(new Set());
  const listRef = useRef<List>(null);

  // Fetch completed tasks
  const fetchCompleted = useCallback(async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
      );
      if (!res.ok) {
        console.error("❌ Failed to fetch completed activities:", res.statusText);
        return; // ❌ wag nang mag-toast
      }

      const result = await res.json();
      const list: CompletedItem[] = Array.isArray(result)
        ? result
        : result.data || result.items || [];

      const allowedStatuses = ["Done", "SO-Done", "Quote-Done", "Delivered"];

      const doneItems = list
        .filter(
          (item: CompletedItem) =>
            allowedStatuses.includes(item.activitystatus || "") &&
            item.referenceid === userDetails.ReferenceID &&
            !lastFetchedIds.current.has(item.id)
        )
        .sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        );

      if (doneItems.length > 0) {
        doneItems.forEach(item => lastFetchedIds.current.add(item.id));
        setData(prev => [...doneItems, ...prev]);
      }
      // ✅ kapag wala, walang error, tahimik lang
    } catch (err) {
      console.error("❌ Error fetching completed:", err);
      // ❌ no toast, just log
    } finally {
      setLoading(false);
    }
  }, [userDetails?.ReferenceID]);


  useEffect(() => {
    fetchCompleted();
    const interval = setInterval(fetchCompleted, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCompleted, refreshTrigger]);

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet; // ✅ pure
    });
    // trigger list height recalculation safely
    if (listRef.current) listRef.current.resetAfterIndex(0);
  };

  const renderField = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <p className="mb-1">
        <span className="font-semibold">{label}:</span> {value}
      </p>
    );
  };

  const getItemSize = (index: number) => {
    const item = data[index];
    return expandedItems.has(item.id) ? ITEM_HEIGHT_EXPANDED : ITEM_HEIGHT_COLLAPSED;
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = data[index];
    const isExpanded = expandedItems.has(item.id);

    return (
      <div style={{ ...style, top: style.top }} className="p-2">
        <div
          className="rounded-lg shadow bg-green-100 cursor-pointer"
          onClick={() => toggleExpand(item.id)}
        >
          {/* Header */}
          <div className="flex items-center">
            <img
              src={item.profilepicture || userDetails?.profilePicture || "/taskflow.png"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover mr-3"
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

          {/* Expanded Content */}
          {isExpanded && (
            <div className="pl-2 mt-1 text-[10px] space-y-1">
              {renderField("Contact Person", item.contactperson)}
              {renderField("Contact #", item.contactnumber)}
              {renderField("Email", item.emailaddress)}
              {renderField("Type", item.typeclient)}
              {renderField("Quotation Number", item.quotationnumber)}
              {renderField("Quotation Amount", item.quotationamount)}
              {renderField("SO Amount", item.soamount)}
              {renderField("SO Number", item.sonumber)}
              {renderField("Callback", item.callback)}
              {renderField("Project Name", item.projectname)}
              {renderField("Project Category", item.projectcategory)}
              {renderField("Project Type", item.projecttype)}
              {renderField("Type Call", item.typecall)}
              {renderField("Source", item.source)}
              {renderField("Status", item.activitystatus)}
              {renderField("Remarks", item.remarks)}
              {renderField("Call Status", item.callstatus)}
              {renderField("Start Date", item.startdate)}
              {renderField("End Date", item.enddate)}
              {renderField("Ticket Ref #", item.ticketreferencenumber)}
              {renderField("Wrap Up", item.wrapup)}
              {renderField("Inquiries", item.inquiries)}
              {renderField("CSR Agent", item.csragent)}
              {renderField("Payment Term", item.paymentterm)}
              {renderField("Delivery Date", item.deliverydate)}
              {renderField(
                "Date Created",
                item.date_created ? new Date(item.date_created).toLocaleString() : undefined
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <List
      ref={listRef}
      height={600}
      itemCount={data.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default Completed;
