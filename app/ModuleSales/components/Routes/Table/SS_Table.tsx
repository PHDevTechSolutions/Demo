"use client";

import React, { useEffect, useState } from "react";

interface Post {
  id: string;
  AgentFirstname: string;
  AgentLastname: string;
  referenceid: string;
  companyname: string;
  date_created: string;
  targetquota: number;
  soamount: number;
  actualsales: number;
  typeactivity: string;
  activitystatus: string;
  source: string;
}

interface GroupedData {
  key: string;
  label: string;
  ReferenceID: string;
  date_created: string;
  totalSOAmount: number;
  totalActualSales: number;
  targetQuota: number;
  preparationQuoteCount: number;
  salesorderCount: number;
  siCount: number;
  OutboundCalls: number;
  records: Post[];
}

interface UsersCardProps {
  posts: Post[];
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString("en-US", { minimumFractionDigits: 0 });

const UsersCard: React.FC<UsersCardProps> = ({ posts }) => {
  const [groupedData, setGroupedData] = useState<{ [key: string]: GroupedData }>({});
  const [activeTab, setActiveTab] = useState<"Agent" | "Company">("Agent");
  const [periodTab, setPeriodTab] = useState<"MTD" | "YTD">("MTD");

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const years = Array.from(new Array(10), (_, index) => new Date().getFullYear() - index);

  useEffect(() => {
    const fixedDays = 26;
    const today = new Date();
    const parPercentages: { [key: number]: number } = {
      1: 8.3,2:16.6,3:25.0,4:33.3,5:41.6,6:50.0,
      7:58.3,8:66.6,9:75.0,10:83.3,11:91.6,12:100.0
    };

    const filteredPosts = posts.filter(post => {
      const postDate = new Date(post.date_created);
      return (selectedMonth === postDate.getMonth() + 1 && selectedYear === postDate.getFullYear()) ||
             (periodTab === "YTD" && postDate.getFullYear() === selectedYear);
    });

    const grouped = filteredPosts.reduce((acc: { [key: string]: GroupedData }, post: Post) => {
      const date = new Date(post.date_created);
      const year = date.getFullYear();
      const monthName = date.toLocaleString("en-US", { month: "long" });

      const groupKey = activeTab === "Agent"
        ? `${post.AgentFirstname} ${post.AgentLastname}-${periodTab === "MTD" ? monthName : year}`
        : `${post.companyname}-${periodTab === "MTD" ? monthName : year}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          key: groupKey,
          label: activeTab === "Agent"
            ? `${post.AgentFirstname} ${post.AgentLastname} (${post.referenceid})`
            : post.companyname,
          ReferenceID: post.referenceid,
          date_created: periodTab === "MTD" ? `${monthName} ${year}` : `${year}`,
          totalSOAmount: 0,
          totalActualSales: 0,
          targetQuota: post.targetquota * (periodTab === "YTD" ? 12 : 1),
          preparationQuoteCount: 0,
          salesorderCount: 0,
          siCount: 0,
          OutboundCalls: 0,
          records: [],
        };
      }

      acc[groupKey].records.push(post);
      acc[groupKey].totalSOAmount += post.soamount;
      acc[groupKey].totalActualSales += post.actualsales;
      acc[groupKey].preparationQuoteCount += post.typeactivity === "Quotation Preparation" ? 1 : 0;
      acc[groupKey].salesorderCount += post.typeactivity === "Sales Order Preparation" ? 1 : 0;
      acc[groupKey].siCount += post.activitystatus === "Delivered" ? 1 : 0;
      acc[groupKey].OutboundCalls += post.source === "Outbound - Touchbase" ? 1 : 0;

      return acc;
    }, {});

    setGroupedData(grouped);
  }, [posts, activeTab, periodTab, selectedMonth, selectedYear]);

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("Agent")}
            className={`py-2 px-4 text-xs font-medium ${activeTab === "Agent" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >
            Per Agent
          </button>
          <button
            onClick={() => setActiveTab("Company")}
            className={`py-2 px-4 text-xs font-medium ${activeTab === "Company" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >
            Per Company
          </button>
        </nav>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="py-2 px-4 text-xs border shadow-md"
        >
          {months.map((month, index) => <option key={index} value={index+1}>{month}</option>)}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="py-2 px-4 text-xs border shadow-md"
        >
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setPeriodTab("MTD")}
            className={`py-2 px-4 text-xs font-medium ${periodTab==="MTD" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >MTD</button>
          <button
            onClick={() => setPeriodTab("YTD")}
            className={`py-2 px-4 text-xs font-medium ${periodTab==="YTD" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >YTD</button>
        </nav>
      </div>

      {/* Table */}
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700">{activeTab==="Agent" ? "Agent" : "Company"}</th>
            <th className="px-6 py-4 font-semibold text-gray-700">{periodTab==="MTD" ? "Month" : "Year"}</th>
            {activeTab==="Agent" && <th className="px-6 py-4 font-semibold text-gray-700">Target</th>}
            <th className="px-6 py-4 font-semibold text-gray-700"># of SO</th>
            <th className="px-6 py-4 font-semibold text-gray-700"># of SI</th>
            <th className="px-6 py-4 font-semibold text-gray-700">% SO to SI</th>
          </tr>
        </thead>

        <thead className="bg-gray-200 font-semibold">
          <tr>
            <td className="px-6 py-2 text-xs">TOTAL</td>
            <td className="px-6 py-2 text-xs">-</td>
            {activeTab==="Agent" && (
              <td className="px-6 py-2 text-xs">₱{formatCurrency(Object.values(groupedData).reduce((sum,g)=>sum+g.targetQuota,0))}</td>
            )}
            <td className="px-6 py-2 text-xs">{Object.values(groupedData).reduce((sum,g)=>sum+g.salesorderCount,0)}</td>
            <td className="px-6 py-2 text-xs">{Object.values(groupedData).reduce((sum,g)=>sum+g.siCount,0)}</td>
            <td className="px-6 py-2 text-xs">{(() => {
              const totalSO = Object.values(groupedData).reduce((sum,g)=>sum+g.salesorderCount,0);
              const totalSI = Object.values(groupedData).reduce((sum,g)=>sum+g.siCount,0);
              return totalSO>0 ? ((totalSI/totalSO)*100).toFixed(2)+'%' : '0%';
            })()}</td>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {Object.keys(groupedData).length>0 ? Object.values(groupedData).map((group) => {
            const percentage = group.salesorderCount>0 ? (group.siCount/group.salesorderCount)*100 : 0;
            return (
              <tr key={group.key} className="border-b whitespace-nowrap">
                <td className="px-6 py-4 text-xs font-bold">{group.label}</td>
                <td className="px-6 py-4 text-xs">{group.date_created}</td>
                {activeTab==="Agent" && <td className="px-6 py-4 text-xs">₱{formatCurrency(group.targetQuota)}</td>}
                <td className="px-6 py-4 text-xs">{group.salesorderCount}</td>
                <td className="px-6 py-4 text-xs">{group.siCount}</td>
                <td className="px-6 py-4 text-xs">{percentage.toFixed(2)}%</td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={activeTab==="Agent"?6:5} className="text-center py-4 border">No records available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersCard;
