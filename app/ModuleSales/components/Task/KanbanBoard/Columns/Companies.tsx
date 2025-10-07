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
  const [remainingQuota, setRemainingQuota] = useState(0);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${todayStr}`
      );
      const data = await res.json();

      if (data?.companies) {
        setCompanies(data.companies);
        setRemainingQuota(data.remaining_quota ?? DAILY_QUOTA);
      } else {
        setCompanies([]);
        setRemainingQuota(0);
      }
    } catch (err) {
      console.error(err);
      setCompanies([]);
      setRemainingQuota(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  const updateQuota = async (updatedCompanies: Company[], newQuota: number) => {
    setCompanies(updatedCompanies);
    setRemainingQuota(newQuota);
    try {
      await fetch("/api/ModuleSales/Companies/DailyQuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceid: userDetails?.ReferenceID,
          date: todayStr,
          companies: updatedCompanies,
          remaining_quota: newQuota,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCompany = (comp: Company) => {
    handleSubmit(comp, false);
    const updated = companies.filter((c) => c.id !== comp.id);
    updateQuota(updated, Math.max(remainingQuota - 1, 0));

    if (comp.id) localStorage.setItem(`lastAdded_${comp.id}`, new Date().toISOString());
  };

  const handleCancelCompany = (comp: Company) => {
    let updated = companies.filter((c) => c.id !== comp.id);

    const eligible = companies.filter(isCompanyDue).filter((c) => !updated.some(u => u.id === c.id));
    if (eligible.length) updated.push(eligible[Math.floor(Math.random() * eligible.length)]);

    updateQuota(updated, remainingQuota);
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> OB Calls:{" "}
          <span className="ml-1 text-red-500">{remainingQuota}</span>
        </span>
      </h3>

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
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
        <p className="text-xs text-gray-400 text-center">
          🚫 No companies available today.
        </p>
      )}
    </div>
  );
};

export default Companies;
