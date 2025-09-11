"use client";

import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";

export interface CompletedItem {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  referenceid: string;
  date_created: string;
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

const Completed: React.FC<CompletedProps> = ({ userDetails, refreshTrigger }) => {
  const [data, setData] = useState<CompletedItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchCompleted = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
        );
        if (!res.ok) throw new Error("Failed to fetch completed activities");

        const result = await res.json();
        const list: CompletedItem[] = Array.isArray(result)
          ? result
          : result.data || result.items || [];

        const allowedStatuses = ["Done", "SO-Done", "Quote-Done", "Delivered"];

        const doneItems = list
          .filter(
            (item: CompletedItem) =>
              allowedStatuses.includes(item.activitystatus || "") &&
              item.referenceid === userDetails.ReferenceID
          )
          .sort(
            (a, b) =>
              new Date(b.date_created).getTime() -
              new Date(a.date_created).getTime()
          );

        setData(doneItems);
      } catch (err) {
        console.error("❌ Error fetching completed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompleted();
  }, [userDetails, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 italic">
        No completed tasks yet
      </div>
    );
  }

  const renderField = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <p>
        <span className="font-semibold">{label}:</span> {value}
      </p>
    );
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const visibleData = data.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {visibleData.map((item) => {
        const isExpanded = expandedItems.has(item.id);

        return (
          <div
            key={item.id}
            className="rounded-lg shadow bg-green-100 overflow-hidden relative p-2"
          >
            <div className="flex items-center mb-2">
              <img
                src={
                  item.profilepicture ||
                  userDetails?.profilePicture ||
                  "/taskflow.png"
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <div className="flex flex-col flex-1">
                <div className="flex items-center space-x-1">
                  <FaCircle className="text-green-500 w-2 h-2" />
                  <p className="font-semibold text-[10px] uppercase">
                    {item.companyname}
                  </p>
                </div>
                {item.activitynumber && (
                  <p className="text-[8px] text-gray-600">
                    Activity: <span className="text-black">{item.typeactivity}</span> | {item.activitynumber}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-[10px] text-blue-600 underline"
              >
                {isExpanded ? "Hide" : "View"}
              </button>
            </div>

            {isExpanded && (
              <div className="pl-2 mb-2 text-[10px] space-y-1">
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
                  item.date_created
                    ? new Date(item.date_created).toLocaleString()
                    : undefined
                )}
              </div>
            )}
          </div>
        );
      })}

      {visibleCount < data.length && (
        <div className="flex justify-center mt-2">
          <button
            onClick={handleLoadMore}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-[10px]"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Completed;
