import React, { useEffect, useState } from "react";

interface Post {
  id: string;
  AgentFirstname: string;
  AgentLastname: string;
  referenceid: string;
  date_created: string;
  targetquota: number;
  soamount: string;
  actualsales: string;
}

interface GroupedData {
  AgentFirstname: string;
  AgentLastname: string;
  ReferenceID: string;
  date_created: string;
  totalSOAmount: number;
  totalActualSales: number;
  targetQuota: number;
  parPercentage: number;
  mtdVariance: number;
  records: Post[];
}

interface TableProps {
  posts: Post[];
  handleEdit: (post: Post) => void;
  ReferenceID: string;
  fetchAccount: () => Promise<void>;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 0 });
};

const parseToNumber = (value: string) => {
  return isNaN(Number(value)) ? 0 : Number(value);
};

const getQuarter = (month: number) => {
  return Math.ceil(month / 3);
};

const Table: React.FC<TableProps> = ({ posts }) => {
  const [groupedData, setGroupedData] = useState<{ [key: string]: GroupedData }>({});
  const [activeTab, setActiveTab] = useState<"MTD" | "YTD" | "Quarterly">("MTD");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  useEffect(() => {
    const fixedDays = 26;
    const parPercentages: { [key: number]: number } = {
      1: 8.3,
      2: 16.6,
      3: 25.0,
      4: 33.3,
      5: 41.6,
      6: 50.0,
      7: 58.3,
      8: 66.6,
      9: 75.0,
      10: 83.3,
      11: 91.6,
      12: 100.0,
    };

    const filteredPosts = posts.filter((post) => {
      const postDate = new Date(post.date_created);
      const postYear = postDate.getFullYear();
      const postMonth = postDate.getMonth() + 1;
      const postQuarter = getQuarter(postMonth);

      if (activeTab === "MTD") {
        if (selectedMonth && selectedYear) {
          return postYear === selectedYear && postMonth === selectedMonth;
        }
        return postYear === currentYear && postMonth === currentMonth;
      }

      if (activeTab === "YTD") {
        if (selectedYear) {
          return postYear === selectedYear;
        }

        return postYear === currentYear;
      }

      if (activeTab === "Quarterly") {
        if (selectedYear && selectedQuarter) {
          return postYear === selectedYear && postQuarter === selectedQuarter;
        }
        return postYear === currentYear && postQuarter === getQuarter(currentMonth);
      }

      return false;
    });


    const grouped = filteredPosts.reduce((acc: { [key: string]: GroupedData }, post: Post) => {
      const date = new Date(post.date_created);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const quarter = getQuarter(month);
      const monthName = date.toLocaleString("en-US", { month: "long" });

      let key = "";
      let displayDate = "";
      if (activeTab === "MTD") {
        key = `${post.AgentFirstname} ${post.AgentLastname} ${monthName} ${year}`;
        displayDate = `${monthName} ${year}`;
      } else if (activeTab === "YTD") {
        key = `${post.AgentFirstname} ${post.AgentLastname} ${year}`;
        displayDate = `${year}`;
      } else if (activeTab === "Quarterly") {
        key = `${post.AgentFirstname} ${post.AgentLastname} Q${quarter} ${year}`;
        displayDate = `Q${quarter} ${year}`;
      }

      if (!acc[key]) {
        const daysLapsed =
          activeTab === "MTD"
            ? Math.min(today.getDate(), fixedDays)
            : activeTab === "YTD"
              ? fixedDays * 12
              : fixedDays * 3; 

        const parPercentage =
          activeTab === "YTD"
            ? parPercentages[month] || 0
            : activeTab === "MTD"
              ? (daysLapsed / fixedDays) * 100
              : (daysLapsed / (fixedDays * 3)) * 100;

        acc[key] = {
          AgentFirstname: post.AgentFirstname,
          AgentLastname: post.AgentLastname,
          ReferenceID: post.referenceid,
          date_created: displayDate,
          totalSOAmount: 0,
          totalActualSales: 0,
          targetQuota:
            post.targetquota *
            (activeTab === "YTD" ? 12 : activeTab === "Quarterly" ? 3 : 1),
          parPercentage,
          mtdVariance: 0,
          records: [],
        };
      }

      acc[key].records.push(post);
      acc[key].totalSOAmount += parseToNumber(post.soamount);
      acc[key].totalActualSales += parseToNumber(post.actualsales);
      acc[key].mtdVariance = acc[key].targetQuota - acc[key].totalActualSales;

      return acc;
    }, {});

    setGroupedData(grouped);
  }, [posts, activeTab, selectedMonth, selectedYear, selectedQuarter]);

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab("MTD");
              setSelectedQuarter(null);
            }}
            className={`py-2 px-4 text-xs font-medium ${activeTab === "MTD"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              }`}
          >
            MTD
          </button>
          <button
            onClick={() => {
              setActiveTab("YTD");
              setSelectedMonth(null);
              setSelectedQuarter(null);
            }}
            className={`py-2 px-4 text-xs font-medium ${activeTab === "YTD"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              }`}
          >
            YTD
          </button>
          <button
            onClick={() => {
              setActiveTab("Quarterly");
              setSelectedMonth(null);
            }}
            className={`py-2 px-4 text-xs font-medium ${activeTab === "Quarterly"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              }`}
          >
            Quarterly
          </button>
        </nav>

        <div className="mb-4 mt-4 flex items-center gap-4">
          {(activeTab === "MTD" || activeTab === "YTD") && (
            <>
              {activeTab === "MTD" && (
                <select
                  value={selectedMonth || ""}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="py-2 px-4 text-xs border shadow-md"
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="py-2 px-4 text-xs border shadow-md"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 10 }, (_, i) => currentYear - 9 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </>
          )}

          {activeTab === "Quarterly" && (
            <>
              <select
                value={selectedQuarter || ""}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="py-2 px-4 text-xs border shadow-md"
              >
                <option value="">Select Quarter</option>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Q{q}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="py-2 px-4 text-xs border shadow-md"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 10 }, (_, i) => currentYear - 9 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </>
          )}
        </div>
      </div>

      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700">Agent</th>
            <th className="px-6 py-4 font-semibold text-gray-700">
              {activeTab === "MTD"
                ? "Month"
                : activeTab === "YTD"
                  ? "Year"
                  : "Quarter"}
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700">Target</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Actual Sales</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Achievement</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Par</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Variance</th>
            <th className="px-6 py-4 font-semibold text-gray-700">% To Plan</th>
          </tr>
        </thead>
        {Object.keys(groupedData).length > 0 && (
          <thead className="bg-gray-200 font-semibold text-xs">
            {(() => {
              const totals = Object.values(groupedData).reduce(
                (acc, group) => {
                  acc.totalTarget += group.targetQuota;
                  acc.totalActual += group.totalActualSales;
                  acc.totalVariance += group.mtdVariance;
                  return acc;
                },
                { totalTarget: 0, totalActual: 0, totalVariance: 0 }
              );

              const achievement =
                totals.totalTarget > 0
                  ? (totals.totalActual / totals.totalTarget) * 100
                  : 0;

              const percentToPlan =
                totals.totalTarget > 0
                  ? (totals.totalActual / totals.totalTarget) * 100
                  : 0;

              return (
                <tr>
                  <td className="px-6 py-3 text-left">Grand Total</td>
                  <td className="px-6 py-3 text-right" colSpan={1}></td>
                  <td className="px-6 py-3">₱{formatCurrency(totals.totalTarget)}</td>
                  <td className="px-6 py-3">₱{formatCurrency(totals.totalActual)}</td>
                  <td className="px-6 py-3">{achievement.toFixed(2)}%</td>
                  <td className="px-6 py-3">-</td>
                  <td className="px-6 py-3 text-red-700">
                    ₱{formatCurrency(totals.totalVariance)}
                  </td>
                  <td className="px-6 py-3">{percentToPlan.toFixed(2)}%</td>
                </tr>
              );
            })()}
          </thead>
        )}
        <tbody className="divide-y divide-gray-100">
          {Object.keys(groupedData).length > 0 ? (
            Object.values(groupedData).map((group) => {
              const achievement =
                group.targetQuota > 0
                  ? (group.totalActualSales / group.targetQuota) * 100
                  : 0;
              return (
                <tr
                  key={group.ReferenceID + group.date_created}
                  className="border-b whitespace-nowrap"
                >
                  <td className="px-6 py-4 text-xs font-bold capitalize">
                    {group.AgentFirstname} {group.AgentLastname}
                    <br />
                    <span className="text-gray-900 text-[8px]">
                      ({group.ReferenceID})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{group.date_created}</td>
                  <td className="px-6 py-4 text-xs">
                    ₱{formatCurrency(group.targetQuota)}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    ₱{formatCurrency(group.totalActualSales)}
                  </td>
                  <td className="px-6 py-4 text-xs">{achievement.toFixed(2)}%</td>
                  <td className="px-6 py-4 text-xs">{group.parPercentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 text-xs font-semibold text-red-700">
                    ₱{formatCurrency(group.mtdVariance)}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {group.targetQuota
                      ? Math.round((group.totalActualSales / group.targetQuota) * 100)
                      : 0}%
                  </td>

                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-4 border text-xs">
                No accounts available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
