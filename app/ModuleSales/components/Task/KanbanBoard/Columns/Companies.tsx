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

const isCompanyDue = (comp: Company) => {
  const lastAdded = comp.id ? localStorage.getItem(`lastAdded_${comp.id}`) : null;
  if (!lastAdded) return true;
  const diffDays = Math.floor(
    (Date.now() - new Date(lastAdded).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (comp.typeclient === "Top 50") return diffDays >= 10;
  if (comp.typeclient === "Next 30" || comp.typeclient === "Balance 20") return diffDays >= 30;
  return true;
};

const DAILY_QUOTA = 35;

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingQuota, setRemainingQuota] = useState(DAILY_QUOTA);

  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching companies from FetchAccount API...");
      
      const res = await fetch(
        `/api/ModuleSales/Companies/FetchAccount?referenceid=${userDetails.ReferenceID}`
      );
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("API Response:", data);

      if (data && Array.isArray(data)) {
        // Kunin lang ang unang 35 companies
        const first35Companies = data.slice(0, DAILY_QUOTA);
        setCompanies(first35Companies);
        setRemainingQuota(DAILY_QUOTA - first35Companies.length);
      } else {
        setCompanies([]);
        setRemainingQuota(0);
      }
    } catch (err: any) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
      setRemainingQuota(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  const handleAddCompany = (comp: Company) => {
    handleSubmit(comp, false);
    const updated = companies.filter((c) => c.id !== comp.id);
    setCompanies(updated);
    setRemainingQuota(Math.max(remainingQuota - 1, 0));

    if (comp.id) localStorage.setItem(`lastAdded_${comp.id}`, new Date().toISOString());
  };

  const handleCancelCompany = (comp: Company) => {
    let updated = companies.filter((c) => c.id !== comp.id);
    setCompanies(updated);
    setRemainingQuota(remainingQuota);
  };

  const retryFetch = () => {
    fetchCompanies();
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> OB Calls:{" "}
          <span className="ml-1 text-red-500">{remainingQuota}</span>
        </span>
        {!loading && companies.length === 0 && (
          <button 
            onClick={retryFetch}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Retry
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
              onAdd={handleAddCompany}
              onCancel={handleCancelCompany}
            />
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">
            🚫 No companies available.
          </p>
          <button 
            onClick={retryFetch}
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