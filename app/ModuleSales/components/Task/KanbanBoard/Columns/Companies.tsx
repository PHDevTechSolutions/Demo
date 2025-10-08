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

  // --- 🕓 Handle daily reset of localStorage counter ---
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("tapDate");
    const savedCount = localStorage.getItem("tapCount");

    if (savedDate === today && savedCount) {
      setTapCount(parseInt(savedCount, 10));
    } else {
      // reset for new day
      localStorage.setItem("tapDate", today);
      localStorage.setItem("tapCount", "0");
      setTapCount(0);
    }
  }, []);

  // --- 🧮 Increment tap count when adding company ---
  const handleAddCompany = (comp: Company) => {
    handleSubmit(comp, false);
    const newCount = tapCount + 1;
    setTapCount(newCount);
    localStorage.setItem("tapCount", newCount.toString());
  };

  // 🔀 Shuffle helper
  const shuffleArray = (array: Company[]): Company[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 🏢 Fetch companies from API
  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const response = await res.json();

      if (response.success && Array.isArray(response.data)) {
        const random35 = shuffleArray(response.data).slice(0, 35);
        setCompanies(random35);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  // --- 🔁 Replace button handler ---
  const handleReplace = async () => {
    await fetchCompanies();
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      {/* Header Section */}
<div className="mb-2">
  {/* OB Calls Counter */}
  <div className="flex justify-between items-center mb-1">
    <span className="text-[11px] font-semibold text-gray-600">
      📞 OB Calls: <span className="text-blue-600">{tapCount}</span>
    </span>

    {!loading && (
      <button
        onClick={handleReplace}
        className="text-xs bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all"
      >
        Replace
      </button>
    )}
  </div>

  {/* Companies Header */}
  <h3 className="flex items-center text-xs font-bold text-gray-600 border-t border-gray-200 pt-2">
    <span className="mr-1">🏢</span> Showing 35 Random Companies
  </h3>
</div>

      {loading ? (
        <p className="text-xs text-gray-400">Loading companies...</p>
      ) : companies.length > 0 ? (
        companies.map((comp, idx) => {
          const key = `comp-${idx}`;
          const isExpanded = expandedIdx === key;
          return (
            <CompaniesCard
              key={key}
              comp={comp}
              isExpanded={isExpanded}
              onToggle={() => setExpandedIdx(isExpanded ? null : key)}
              onAdd={() => handleAddCompany(comp)} // ✅ counted here
              onCancel={() => {}}
            />
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">
            🚫 No companies available.
          </p>
          <button
            onClick={fetchCompanies}
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