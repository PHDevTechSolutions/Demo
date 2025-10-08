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
        // Shuffle and limit to 35
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

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> Showing 35 Random Companies
        </span>
        {!loading && (
          <button
            onClick={fetchCompanies}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        )}
      </h3>

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
              onAdd={(comp) => handleSubmit(comp, false)}
              onCancel={() => {}}
            />
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">🚫 No companies available.</p>
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