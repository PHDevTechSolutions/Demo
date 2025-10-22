"use client";

import React, { useEffect, useState } from "react";
import CompaniesCard from "./Card/CompaniesCard";

interface Company {
  id?: number;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address?: string;
  next_available_date?: string;
}

interface CompaniesProps {
  expandedIdx: string | null;
  setExpandedIdx: (id: string | null) => void;
  handleSubmit: (data: Partial<Company>, isInquiry: boolean) => void;
  userDetails: { ReferenceID?: string } | null;
}

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [tapCount, setTapCount] = useState(0);
  const [replacing, setReplacing] = useState(false);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);

  const limit = 35;
  const isNearLimit = tapCount >= limit * 0.8;
  const isFull = tapCount >= limit;

  // 🔧 Normalize any date format → YYYY-MM-DD local
  const normalizeDate = (value?: string): string | null => {
    if (!value) return null;
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return null;
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  // 🕓 Handle daily reset of tap counter
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("tapDate");
    const savedCount = localStorage.getItem("tapCount");

    if (savedDate === today && savedCount) {
      setTapCount(parseInt(savedCount, 10));
    } else {
      localStorage.setItem("tapDate", today);
      localStorage.setItem("tapCount", "0");
      setTapCount(0);
    }
  }, []);

  // 🔀 Shuffle helper
  const shuffleArray = (array: Company[]): Company[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchCompanies = async (forceReplace = false) => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      setReplacing(false);
      return;
    }

    if (forceReplace) setReplacing(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}&_t=${Date.now()}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const response = await res.json();

      if (response.success && Array.isArray(response.data)) {
        const todayStr = new Date().toISOString().split("T")[0];

        const normalizeDate = (dateStr?: string): string | null => {
          if (!dateStr) return null;
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return null;
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];
        };

        // ✅ Filter only available (<= today)
        const validCompanies: Company[] = response.data.filter((comp: Company) => {
          const compDateStr = normalizeDate(comp.next_available_date);
          if (!compDateStr) return true;
          return compDateStr <= todayStr;
        });

        // ✅ Split today vs past
        const todayCompanies: Company[] = validCompanies.filter((comp: Company) => {
          const compDateStr = normalizeDate(comp.next_available_date);
          return compDateStr === todayStr;
        });

        const pastCompanies: Company[] = validCompanies.filter((comp: Company) => {
          const compDateStr = normalizeDate(comp.next_available_date);
          return !compDateStr || compDateStr < todayStr;
        });

        // ✅ Group past by typeclient
        const grouped = {
          top50: pastCompanies.filter((c) => c.typeclient === "Top 50"),
          next30: pastCompanies.filter((c) => c.typeclient === "Next 30"),
          balance20: pastCompanies.filter((c) => c.typeclient === "Balance 20"),
          csr: pastCompanies.filter((c) => c.typeclient === "CSR Client"),
          tsa: pastCompanies.filter((c) => c.typeclient === "TSA Client"),
        };

        // ✅ Shuffle each group
        (Object.keys(grouped) as Array<keyof typeof grouped>).forEach((k) => {
          grouped[k] = shuffleArray(grouped[k]);
        });

        // ✅ Base target counts
        const targetCounts = { top50: 20, next30: 10, balance20: 5 };

        let finalPast: Company[] = [
          ...grouped.top50.slice(0, targetCounts.top50),
          ...grouped.next30.slice(0, targetCounts.next30),
          ...grouped.balance20.slice(0, targetCounts.balance20),
        ];

        // ✅ Fill remaining up to 35
        const fillPriority: Company[][] = [
          grouped.balance20.slice(targetCounts.balance20),
          grouped.next30.slice(targetCounts.next30),
          grouped.top50.slice(targetCounts.top50),
          grouped.csr,
          grouped.tsa,
        ];

        for (const group of fillPriority) {
          if (finalPast.length >= 35) break;
          const needed = 35 - finalPast.length;
          finalPast = [...finalPast, ...group.slice(0, needed)];
        }

        // ✅ Combine today + past (may exceed 35)
        let finalList = [...todayCompanies, ...finalPast];

        // 🧹 ✅ Remove duplicates by unique company name or ID
        const seen = new Set<string>();
        finalList = finalList.filter((c) => {
          const key = c.id ? String(c.id) : c.companyname.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        console.log("📅 Today:", todayStr);
        console.log("✅ Today companies:", todayCompanies.map((c) => c.companyname));
        console.log("📊 Final total (unique):", finalList.length);
        console.log("📊 Sample output:", finalList.slice(0, 5).map((c) => c.companyname));

        setCompanies(finalList);
      } else {
        console.warn("⚠️ API response not successful:", response);
        setCompanies([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
      setReplacing(false);
    }
  };


  // 🧩 Initial fetch
  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  // ➕ Add company
  const handleAddCompany = async (comp: Company) => {
    handleSubmit(comp, false);

    try {
      await fetch(`/api/ModuleSales/Companies/CompanyAccounts/UpdateAvailability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: comp.id,
          typeclient: comp.typeclient,
        }),
      });
    } catch (err) {
      console.error("Failed to update company availability:", err);
    }

    setCompanies((prev) => prev.filter((c) => c.id !== comp.id));

    const newCount = tapCount + 1;
    setTapCount(newCount);
    localStorage.setItem("tapCount", newCount.toString());

    if (userDetails?.ReferenceID) {
      try {
        const res = await fetch(
          `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}&_t=${Date.now()}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const response = await res.json();

        if (response.success && Array.isArray(response.data)) {
          const existingIds = new Set(companies.map((c) => c.id).concat(comp.id));
          const available = response.data.filter((c: Company) => !existingIds.has(c.id));
          if (available.length > 0) {
            const needed = 35 - (companies.length - 1);
            const shuffled = shuffleArray(available).slice(0, needed);
            setCompanies((prev) => [...prev, ...shuffled]);
          }
        }
      } catch (err) {
        console.error("Failed to refresh companies after add:", err);
      }
    }
  };

  const handleRefresh = async () => {
    if (replacing || !userDetails?.ReferenceID) return;
    setReplacing(true);
    await fetchCompanies(true);
    setTimeout(() => setReplacing(false), 500);
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      {/* HEADER */}
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          {/* OB COUNTER */}
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black flex items-center gap-1">
                📞 OB Calls:
              </span>
              <span
                className={`text-xs font-bold ${isFull
                    ? "text-red-500"
                    : isNearLimit
                      ? "text-orange-500"
                      : "text-green-600"
                  }`}
              >
                {tapCount}{" "}
                <span className="text-[10px] text-gray-500 font-normal">
                  / {limit} Minimum
                </span>
              </span>
            </div>
            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${isFull
                    ? "bg-red-500"
                    : isNearLimit
                      ? "bg-orange-400"
                      : "bg-green-500"
                  }`}
                style={{ width: `${Math.min((tapCount / limit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* REFRESH BUTTON */}
          <button
            onClick={handleRefresh}
            disabled={replacing || !userDetails?.ReferenceID}
            className={`text-xs px-3 py-1 rounded-md font-medium shadow-sm flex items-center gap-1 ${replacing || !userDetails?.ReferenceID
                ? "bg-gray-400 text-white cursor-not-allowed animate-pulse"
                : "bg-green-500 text-white hover:bg-green-600"
              }`}
          >
            {replacing ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Refreshing...</span>
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        <h3 className="flex items-center text-[10px] italic font-bold text-gray-600 border-t border-gray-200 pt-2">
          <span className="mr-1">🏢</span> Showing 35 Random Companies
        </h3>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
        </div>
      ) : companies.length > 0 ? (
        companies.map((comp, idx) => {
          const key = `comp-${idx}`;
          const isExpanded = expandedIdx === key;
          const isReplacingItem = replacingIdx === idx;
          if (isReplacingItem) return null;

          // 💡 Highlight "today" companies in green border
          const isToday =
            normalizeDate(comp.next_available_date) ===
            new Date().toISOString().split("T")[0];

          return (
            <div
              key={key}
              className={isToday ? "border-l-4 border-green-500 rounded-xl" : ""}
            >
              <CompaniesCard
                comp={comp}
                isExpanded={isExpanded}
                onToggle={() => setExpandedIdx(isExpanded ? null : key)}
                onAdd={() => handleAddCompany(comp)}
              />
            </div>
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">
            🚫 No companies available.
          </p>
          <button
            onClick={() => fetchCompanies()}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Companies;
