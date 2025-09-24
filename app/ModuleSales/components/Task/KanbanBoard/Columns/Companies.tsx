"use client";

import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import { MdCancel } from 'react-icons/md';

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

const DAILY_QUOTA = 35;

const isCompanyDue = (comp: Company): boolean => {
  const lastAddedRaw = comp.id ? localStorage.getItem(`lastAdded_${comp.id}`) : null;
  if (!lastAddedRaw) return true;

  const lastAdded = new Date(lastAddedRaw);
  const today = new Date();
  const diffDays = Math.floor((+today - +lastAdded) / (1000 * 60 * 60 * 24));

  if (comp.typeclient === "Top 50") return diffDays >= 10;
  if (comp.typeclient === "Next 30" || comp.typeclient === "Balance 20") return diffDays >= 30;
  return true;
};

const getYesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingQuota, setRemainingQuota] = useState<number>(DAILY_QUOTA);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const todayDate = new Date().toISOString().split("T")[0];
    const yesterdayKey = `quota_${userDetails.ReferenceID}_${getYesterdayKey()}`;

    const fetchCompanies = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${todayDate}`
        );
        const dbData = await res.json();

        if (dbData?.companies && dbData?.remaining_quota != null) {
          setCompanies(dbData.companies);
          setRemainingQuota(dbData.remaining_quota);
          setLoading(false);
          return;
        }

        const accountsRes = await fetch(
          `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
        );
        const accounts = await accountsRes.json();

        let companiesData: Company[] = [];
        if (Array.isArray(accounts)) companiesData = accounts;
        else if (Array.isArray(accounts?.data)) companiesData = accounts.data;
        else if (Array.isArray(accounts?.companies)) companiesData = accounts.companies;

        if (!companiesData.length) {
          setCompanies([]);
          setRemainingQuota(DAILY_QUOTA);
          return;
        }

        const eligibleCompanies = companiesData.filter(isCompanyDue);

        const top50 = eligibleCompanies.filter(c => c.typeclient === "Top 50");
        const next30 = eligibleCompanies.filter(c => c.typeclient === "Next 30");
        const balance20 = eligibleCompanies.filter(c => c.typeclient === "Balance 20");
        const tsa = eligibleCompanies.filter(c => c.typeclient === "TSA Client");

        const pickRandom = (arr: Company[], count: number) => {
          const shuffled = [...arr].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        };

        let todayQuota = DAILY_QUOTA;
        const leftover = localStorage.getItem(yesterdayKey);
        if (leftover) todayQuota += parseInt(leftover, 10);

        const finalCompanies = [
          ...pickRandom(top50, 10),
          ...pickRandom(next30, 15),
          ...pickRandom(balance20, 5),
          ...pickRandom(tsa, 5),
        ].slice(0, todayQuota);

        await fetch("/api/ModuleSales/Companies/DailyQuota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceid: userDetails.ReferenceID,
            date: todayDate,
            companies: finalCompanies,
            remaining_quota: todayQuota,
          }),
        });

        setCompanies(finalCompanies);
        setRemainingQuota(todayQuota);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
        setRemainingQuota(DAILY_QUOTA);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  const removeCompany = async (comp: Company) => {
    if (!userDetails?.ReferenceID) return;

    const updated = companies.filter(c => c.id !== comp.id);
    const newQuota = remainingQuota - 1;

    setCompanies(updated);
    setRemainingQuota(newQuota);

    const todayDate = new Date().toISOString().split("T")[0];
    await fetch("/api/ModuleSales/Companies/DailyQuota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceid: userDetails.ReferenceID,
        date: todayDate,
        companies: updated,
        remaining_quota: newQuota,
      }),
    });
  };

  const handleAddCompany = (comp: Company) => {
    handleSubmit(comp, false);
    removeCompany(comp);
    if (comp.id) localStorage.setItem(`lastAdded_${comp.id}`, new Date().toISOString());
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> Companies: <span className="ml-1 text-red-500">{companies.length}</span>
        </span>
      </h3>

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : companies.length > 0 ? (
        companies.map((comp, idx) => {
          const key = `comp-${idx}`;
          const isExpanded = expandedIdx === key;

          return (
            <div
              key={key}
              className="rounded-lg border bg-blue-100 shadow transition text-[10px] mb-2 px-2 py-2"
            >
              <div
                className="cursor-pointer flex justify-between items-center p-1"
                onClick={() => setExpandedIdx(isExpanded ? null : key)}
              >
                <p className="font-semibold uppercase">{comp.companyname}</p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCompany(comp);
                    }}
                    className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600 flex items-center gap-1"
                  >
                   <FaPlus size={10} /> Add
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCompany(comp);
                    }}
                    className="bg-red-500 text-white py-1 px-2 rounded text-[10px] hover:bg-red-600 flex items-center gap-1"
                  >
                   <MdCancel size={10} /> Cancel
                  </button>

                  <span>{isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="p-1 space-y-1">
                  <p><span className="font-semibold capitalize">Contact Person:</span> {comp.contactperson}</p>
                  <p><span className="font-semibold">Contact #:</span> {comp.contactnumber}</p>
                  <p><span className="font-semibold">Email:</span> {comp.emailaddress}</p>
                  <p><span className="font-semibold">Type:</span> {comp.typeclient}</p>
                  <p><span className="font-semibold capitalize">Address:</span> {comp.address || "N/A"}</p>
                </div>
              )}

              <div className="p-1 text-gray-500 text-[9px]">{comp.typeclient}</div>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-gray-400">No companies found.</p>
      )}
    </div>
  );
};

export default Companies;
