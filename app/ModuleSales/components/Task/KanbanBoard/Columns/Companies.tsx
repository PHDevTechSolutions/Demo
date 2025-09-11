"use client";

import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const todayKey = `companies_${userDetails.ReferenceID}_${new Date().toISOString().split("T")[0]}`;

    const fetchCompanies = async () => {
      try {
        setLoading(true);

        // 🔹 Check if we already have data for today
        const stored = localStorage.getItem(todayKey);
        if (stored) {
          setCompanies(JSON.parse(stored));
          return;
        }

        const res = await fetch(
          `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        let companiesData: Company[] = [];
        if (Array.isArray(data)) companiesData = data;
        else if (Array.isArray(data?.data)) companiesData = data.data;
        else if (Array.isArray(data?.companies)) companiesData = data.companies;

        // 🔹 Split by typeclient
        const top50 = companiesData.filter(c => c.typeclient === "Top 50");
        const next30 = companiesData.filter(c => c.typeclient === "Next 30");
        const balance20 = companiesData.filter(c => c.typeclient === "Balance 20");
        const tsa = companiesData.filter(c => c.typeclient === "TSA Client");

        // 🔹 Randomize each type and take quota
        const pickRandom = (arr: Company[], count: number) => {
          const shuffled = [...arr].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        };

        const finalCompanies = [
          ...pickRandom(top50, 10),
          ...pickRandom(next30, 15),
          ...pickRandom(balance20, 5),
          ...pickRandom(tsa, 5),
        ];

        // 🔹 Save to localStorage
        localStorage.setItem(todayKey, JSON.stringify(finalCompanies));
        setCompanies(finalCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  // 🔹 Remove company from list + update localStorage
  const removeCompany = (comp: Company) => {
    if (!userDetails?.ReferenceID) return;
    const todayKey = `companies_${userDetails.ReferenceID}_${new Date().toISOString().split("T")[0]}`;
    const updated = companies.filter(c => c.id !== comp.id);
    setCompanies(updated);
    localStorage.setItem(todayKey, JSON.stringify(updated));
  };

  return (
    <div className="space-y-4 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">🏢</span> Companies
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
              {/* Header row */}
              <div
                className="cursor-pointer flex justify-between items-center p-1"
                onClick={() => setExpandedIdx(isExpanded ? null : key)}
              >
                <p className="font-semibold uppercase">{comp.companyname}</p>

                {/* Actions: Add + Cancel + Collapse */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit(comp, false);
                      removeCompany(comp); // 🔹 Remove after Add
                    }}
                    className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600"
                  >
                    Add
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCompany(comp); // 🔹 Remove on Cancel
                    }}
                    className="bg-red-500 text-white py-1 px-2 rounded text-[10px] hover:bg-red-600"
                  >
                    Cancel
                  </button>

                  <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-1 space-y-1">
                  <p>
                    <span className="font-semibold">Contact Person:</span> {comp.contactperson}
                  </p>
                  <p>
                    <span className="font-semibold">Contact #:</span> {comp.contactnumber}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {comp.emailaddress}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span> {comp.typeclient}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span> {comp.address || "N/A"}
                  </p>
                </div>
              )}

              {/* Footer */}
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
