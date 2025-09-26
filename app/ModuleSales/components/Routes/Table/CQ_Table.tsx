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
  AgentFirstname?: string;
  AgentLastname?: string;
  ReferenceID: string;
  CompanyName?: string;
  date_created: string;
  totalSOAmount: number;
  totalActualSales: number;
  targetQuota: number;
  parPercentage: number;
  preparationQuoteCount: number;
  OutboundCalls: number;
  records: Post[];
}

interface TableProps {
  posts: Post[];
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 0 });
};

const Table: React.FC<TableProps> = ({ posts }) => {
  const [mainTab, setMainTab] = useState<"PerAgent" | "PerCompany">("PerAgent");
  const [groupedData, setGroupedData] = useState<{ [key: string]: GroupedData }>({});
  const [activeTab, setActiveTab] = useState<"MTD" | "YTD">("MTD");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from(new Array(10), (_, index) => new Date().getFullYear() - index);

  useEffect(() => {
    const fixedDays = 26;
    const today = new Date();
    const parPercentages: { [key: number]: number } = {
      1: 8.3, 2: 16.6, 3: 25.0, 4: 33.3, 5: 41.6,
      6: 50.0, 7: 58.3, 8: 66.6, 9: 75.0, 10: 83.3,
      11: 91.6, 12: 100.0,
    };

    const filteredPosts = posts.filter((post) => {
      const postDate = new Date(post.date_created);
      return (
        (selectedMonth === postDate.getMonth() + 1 && selectedYear === postDate.getFullYear()) ||
        (activeTab === "YTD" && postDate.getFullYear() === selectedYear)
      );
    });

    const grouped = filteredPosts.reduce((acc: { [key: string]: GroupedData }, post: Post) => {
      const date = new Date(post.date_created);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString("en-US", { month: "long" });

      let key = "";
      if (mainTab === "PerAgent") {
        key = activeTab === "MTD"
          ? `${post.AgentFirstname} ${post.AgentLastname} ${monthName} ${year}`
          : `${post.AgentFirstname} ${post.AgentLastname} ${year}`;
      } else {
        key = activeTab === "MTD"
          ? `${post.companyname} ${monthName} ${year}`
          : `${post.companyname} ${year}`;
      }

      if (!acc[key]) {
        const daysLapsed = activeTab === "MTD" ? Math.min(today.getDate(), fixedDays) : fixedDays * 12;
        const parPercentage = activeTab === "YTD" ? (parPercentages[month] || 0) : (daysLapsed / fixedDays) * 100;

        acc[key] = {
          AgentFirstname: mainTab === "PerAgent" ? post.AgentFirstname : undefined,
          AgentLastname: mainTab === "PerAgent" ? post.AgentLastname : undefined,
          ReferenceID: post.referenceid,
          CompanyName: mainTab === "PerCompany" ? post.companyname : undefined,
          date_created: activeTab === "MTD" ? `${monthName} ${year}` : `${year}`,
          totalSOAmount: 0,
          totalActualSales: 0,
          targetQuota: post.targetquota * (activeTab === "YTD" ? 12 : 1),
          parPercentage,
          preparationQuoteCount: 0,
          OutboundCalls: 0,
          records: [],
        };
      }

      acc[key].records.push(post);
      acc[key].totalSOAmount += post.soamount;
      acc[key].totalActualSales += post.actualsales;
      acc[key].preparationQuoteCount += post.activitystatus === "Quote-Done" ? 1 : 0;
      acc[key].OutboundCalls += post.source === "Outbound - Touchbase" ? 1 : 0;

      return acc;
    }, {});

    setGroupedData(grouped);
  }, [posts, activeTab, selectedMonth, selectedYear, mainTab]);

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 border-b border-gray-300">
        <nav className="flex space-x-4">
          <button
            onClick={() => setMainTab("PerAgent")}
            className={`py-2 px-4 text-xs font-medium ${mainTab === "PerAgent" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >
            Per Agent
          </button>
          <button
            onClick={() => setMainTab("PerCompany")}
            className={`py-2 px-4 text-xs font-medium ${mainTab === "PerCompany" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >
            Per Company
          </button>
        </nav>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="py-2 px-4 text-xs border shadow-md">
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month}</option>
          ))}
        </select>

        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="py-2 px-4 text-xs border shadow-md">
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button onClick={() => setActiveTab("MTD")} className={`py-2 px-4 text-xs font-medium ${activeTab === "MTD" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>MTD</button>
          <button onClick={() => setActiveTab("YTD")} className={`py-2 px-4 text-xs font-medium ${activeTab === "YTD" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>YTD</button>
        </nav>
      </div>

      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700">
              {mainTab === "PerAgent" ? "Agent" : "Company"}
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700">{activeTab === "MTD" ? "Month" : "Year"}</th>

            {mainTab === "PerAgent" && (
              <th className="px-6 py-4 font-semibold text-gray-700">Target</th>
            )}

            <th className="px-6 py-4 font-semibold text-gray-700"># of Calls</th>
            <th className="px-6 py-4 font-semibold text-gray-700"># of Quote</th>
            <th className="px-6 py-4 font-semibold text-gray-700">% Calls to Quote</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Benchmark</th>
          </tr>
        </thead>

        <thead className="bg-gray-50 font-semibold text-xs">
          <tr>
            <td className="px-6 py-4">TOTAL</td>
            <td></td>

            {mainTab === "PerAgent" && (
              <td className="px-6 py-4">
                ₱{formatCurrency(Object.values(groupedData).reduce((sum, g) => sum + g.targetQuota, 0))}
              </td>
            )}

            <td className="px-6 py-4">
              {Object.values(groupedData).reduce((sum, g) => sum + g.OutboundCalls, 0)}
            </td>
            <td className="px-6 py-4">
              {Object.values(groupedData).reduce((sum, g) => sum + g.preparationQuoteCount, 0)}
            </td>
            <td className="px-6 py-4">
              {(() => {
                const totalCalls = Object.values(groupedData).reduce((sum, g) => sum + g.OutboundCalls, 0);
                const totalQuotes = Object.values(groupedData).reduce((sum, g) => sum + g.preparationQuoteCount, 0);
                return totalCalls > 0 ? ((totalQuotes / totalCalls) * 100).toFixed(2) + "%" : "0%";
              })()}
            </td>
            <td></td>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {Object.keys(groupedData).length > 0 ? (
            Object.values(groupedData).map((group, idx) => {
              const percentageCalls = group.OutboundCalls > 0
                ? (group.preparationQuoteCount / group.OutboundCalls) * 100
                : 0;

              if (mainTab === "PerCompany" && group.preparationQuoteCount === 0) {
                return null;
              }

              return (
                <tr key={`${group.ReferenceID}-${group.date_created}-${idx}`} className="border-b whitespace-nowrap">
                  <td className="px-6 py-4 text-xs capitalize font-bold">
                    {mainTab === "PerAgent"
                      ? `${group.AgentFirstname} ${group.AgentLastname}`
                      : group.CompanyName || "Unknown Company"}
                    <br />
                    <span className="text-gray-900 text-[8px]">({group.ReferenceID})</span>
                  </td>
                  <td className="px-6 py-4 text-xs">{group.date_created}</td>

                  {mainTab === "PerAgent" && (
                    <td className="px-6 py-4 text-xs">₱{formatCurrency(group.targetQuota)}</td>
                  )}

                  <td className="px-6 py-4 text-xs">{group.OutboundCalls}</td>
                  <td className="px-6 py-4 text-xs">{group.preparationQuoteCount}</td>
                  <td className="px-6 py-4 text-xs">{percentageCalls.toFixed(2)}%</td>
                  <td className="px-6 py-4 text-xs">
                    {percentageCalls > 20 ? (
                      <span className="text-green-600 ml-2 mr-2">&#8593;</span>
                    ) : (
                      <span className="text-red-600 ml-2 mr-2">&#8595;</span>
                    )}
                    20%
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={mainTab === "PerAgent" ? 7 : 6} className="text-center text-xs py-4 border">
                No accounts available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(Table);
