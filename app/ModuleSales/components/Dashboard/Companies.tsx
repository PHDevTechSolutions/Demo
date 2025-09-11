"use client";

import React, { useEffect, useState } from "react";
import {
  FiDatabase,
  FiEye,
  FiEyeOff,
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
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showTotal, setShowTotal] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTotalLoaded(false);

        // Fetch Companies
        const companyRes = await fetch("/api/ModuleSales/Dashboard/FetchDatabase");
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

        // ✅ Always set totalCompanies, default to 0
        setTotalCompanies(companiesArray.length || 0);
        setTotalLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTotalCompanies(0);
        setTotalLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filteredAccounts, userDetails]);

  if (userDetails?.Role === "Territory Sales Manager") return null;

  return (
  <section className="bg-white select-none">
    <div className="flex justify-end">
      <div className="w-full sm:w-80 md:w-96">
        {/* Total Companies */}
        <div className="bg-blue-100 rounded-lg p-4 shadow flex items-center justify-between overflow-hidden relative">
          <div className="flex items-center gap-3">
            <FiDatabase className="text-blue-600 text-3xl" />
            <div>
              <p className="text-xs text-blue-700 font-semibold">
                Total Companies
              </p>
              <div
                className={`text-2xl font-bold text-blue-800 transition-all duration-700 ease-out ${
                  totalLoaded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-10"
                }`}
              >
                {showTotal && totalLoaded ? totalCompanies : "***"}
              </div>
            </div>
          </div>
          <button
            className="p-2 rounded-full hover:bg-blue-200 transition flex items-center gap-1"
            onClick={() => setShowTotal(!showTotal)}
            title={showTotal ? "Hide Total" : "Show Total"}
          >
            <span className="text-xs underline text-blue-600">Show</span>
            {showTotal ? (
              <FiEyeOff className="text-blue-600 text-xl" />
            ) : (
              <FiEye className="text-blue-600 text-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  </section>
);

};

export default Card;
