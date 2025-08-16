"use client";

import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiDatabase } from "react-icons/fi";

interface Post {
  companyname: string;
  source: string;
  callstatus: string;
  referenceid?: string;
  tsm?: string;
}

interface UserDetails {
  ReferenceID: string;
  Role: string;
}

interface SourceProps {
  filteredAccounts?: Post[];
  userDetails: UserDetails;
}

const Card: React.FC<SourceProps> = ({ filteredAccounts, userDetails }) => {
  const [touchbaseCalls, setTouchbaseCalls] = useState<Post[]>([]);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch calls
        let calls: Post[] = [];
        if (filteredAccounts && filteredAccounts.length > 0) {
          calls = filteredAccounts;
        } else {
          const res = await fetch(
            "/api/ModuleSales/Task/DailyActivity/FetchProgress"
          );
          if (!res.ok) throw new Error("Failed to fetch progress");
          const json = await res.json();
          calls = Array.isArray(json) ? json : json.data || [];
        }

        // Keep only Outbound - Touchbase
        const outboundTouchbaseCalls = calls.filter(
          (item) => item.source === "Outbound - Touchbase"
        );

        setTouchbaseCalls(outboundTouchbaseCalls);

        // Fetch companies
        const companyRes = await fetch(
          "/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount"
        );
        if (!companyRes.ok) throw new Error("Failed to fetch companies");
        const companyJson = await companyRes.json();
        let companiesArray: Post[] = Array.isArray(companyJson)
          ? companyJson
          : companyJson.data || [];

        // Filter by role
        if (userDetails?.Role === "Territory Sales Associate") {
          companiesArray = companiesArray.filter(
            (company) => company.referenceid === userDetails.ReferenceID
          );
        } else if (userDetails?.Role === "Territory Sales Manager") {
          companiesArray = companiesArray.filter(
            (company) => company.tsm === userDetails.ReferenceID
          );
        }

        setTotalCompanies(companiesArray.length || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filteredAccounts, userDetails]);

  // Filter calls by agent/role
  const filteredTouchbaseCalls = touchbaseCalls.filter((call) => {
    if (userDetails?.Role === "Territory Sales Associate") {
      return call.referenceid === userDetails.ReferenceID;
    } else if (userDetails?.Role === "Territory Sales Manager") {
      return call.tsm === userDetails.ReferenceID;
    }
    return true; // admin/higher roles see all
  });

  const successfulCount = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Successful"
  ).length;

  const unsuccessfulCount = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Unsuccessful"
  ).length;

  // Do not render for Territory Sales Manager
  if (userDetails?.Role === "Territory Sales Manager") return null;

  return (
    <section className="bg-white shadow-md rounded-lg p-6 select-none">
      {loading ? (
        <p className="text-gray-500 text-xs">Loading...</p>
      ) : (
        <>
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Outbound Call - Touchbase
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            This section shows the breakdown of successful and unsuccessful
            outbound calls tagged as "Touchbase".
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Successful */}
            <div className="bg-green-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiCheckCircle className="text-green-600 text-3xl" />
              <div>
                <p className="text-xs text-green-700 font-semibold">
                  Successful
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {successfulCount}
                </p>
              </div>
            </div>

            {/* Unsuccessful */}
            <div className="bg-red-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiXCircle className="text-red-600 text-3xl" />
              <div>
                <p className="text-xs text-red-700 font-semibold">
                  Unsuccessful
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {unsuccessfulCount}
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-800 mt-4 mb-4">
            Official Total Companies
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            This represents the total number of company accounts officially
            assigned or registered in the system.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Total Companies */}
            <div className="bg-blue-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiDatabase className="text-blue-600 text-3xl" />
              <div>
                <p className="text-xs text-blue-700 font-semibold">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {totalCompanies}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Card;
