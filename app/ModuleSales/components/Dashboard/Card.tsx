"use client";

import React, { useEffect, useState } from "react";
import {
  FiDatabase,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiEye,
  FiDownload,
  FiMinusCircle,
} from "react-icons/fi";

interface Post {
  companyname: string;
  source: string;
  callstatus?: string;
  referenceid?: string;
  startdate?: string;
  tsm?: string;
  typeactivity: string;
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
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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

        const outboundTouchbaseCalls = calls.filter(
          (item) =>
            item.typeactivity === "Outbound calls" &&
            item.source === "Outbound - Touchbase"
        );
        setTouchbaseCalls(outboundTouchbaseCalls);

        const companyRes = await fetch(
          "/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount"
        );
        if (!companyRes.ok) throw new Error("Failed to fetch companies");
        const companyJson = await companyRes.json();
        let companiesArray: Post[] = Array.isArray(companyJson)
          ? companyJson
          : companyJson.data || [];

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

  const filteredTouchbaseCalls = touchbaseCalls.filter((call) => {
    if (userDetails?.Role === "Territory Sales Associate") {
      return call.referenceid === userDetails.ReferenceID;
    } else if (userDetails?.Role === "Territory Sales Manager") {
      return call.tsm === userDetails.ReferenceID;
    }
    return true;
  });

  // ✅ Count categories
  const successfulCompanies = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Successful"
  );
  const unsuccessfulCompanies = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Unsuccessful"
  );
  const noStatusCompanies = filteredTouchbaseCalls.filter(
    (item) =>
      !item.callstatus ||
      (item.callstatus !== "Successful" && item.callstatus !== "Unsuccessful")
  );

  const successfulCount = successfulCompanies.length;
  const unsuccessfulCount = unsuccessfulCompanies.length;
  const noStatusCount = noStatusCompanies.length;
  const totalTouchbaseCalls =
    successfulCount + unsuccessfulCount + noStatusCount;

  if (userDetails?.Role === "Territory Sales Manager") return null;

  return (
    <section className="bg-white shadow-md rounded-lg p-6 select-none">
      {loading ? (
        <p className="text-gray-500 text-xs">Loading...</p>
      ) : (
        <>
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Outbound Call - Touchbase (MTD)
          </h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-yellow-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiPhone className="text-yellow-600 text-3xl" />
              <div>
                <p className="text-xs text-yellow-700 font-semibold">
                  Total Calls
                </p>
                <p className="text-2xl font-bold text-yellow-800">
                  {totalTouchbaseCalls}
                </p>
              </div>
            </div>
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
            <div className="bg-gray-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiMinusCircle className="text-gray-600 text-3xl" />
              <div>
                <p className="text-xs text-gray-700 font-semibold">No Status</p>
                <p className="text-2xl font-bold text-gray-800">
                  {noStatusCount}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Successful Companies */}
          {successfulCompanies.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 mb-4 border">
              <h3 className="text-xs font-bold text-green-700 mb-2 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                Successful Companies
              </h3>
              <ul className="list-disc list-inside text-xs text-green-800 max-h-32 overflow-y-auto">
                {successfulCompanies.map((item, idx) => (
                  <li key={idx}>{item.companyname}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Unsuccessful Companies */}
          {unsuccessfulCompanies.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 mb-4 border">
              <h3 className="text-xs font-bold text-red-700 mb-2 flex items-center gap-2">
                <FiXCircle className="text-red-600" />
                Unsuccessful Companies
              </h3>
              <ul className="list-disc list-inside text-xs text-red-800 max-h-32 overflow-y-auto">
                {unsuccessfulCompanies.map((item, idx) => (
                  <li key={idx}>{item.companyname}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Companies without Status */}
          {noStatusCompanies.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiMinusCircle className="text-gray-600" />
                Companies with No Status
              </h3>
              <ul className="list-disc list-inside text-xs text-gray-600 max-h-32 overflow-y-auto">
                {noStatusCompanies.map((item, idx) => (
                  <li key={idx}>{item.companyname}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Total Companies */}
          <h2 className="text-sm font-bold text-gray-800 mt-6 mb-2">
            Companies
          </h2>
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
        </>
      )}
    </section>
  );
};

export default Card;
