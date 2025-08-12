"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Task/ScheduledActivity/Filters/Filters";
import Main from "../../../components/Task/ScheduledActivity/Main";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userDetails, setUserDetails] = useState({
    UserId: "", Firstname: "", Lastname: "", Manager: "", TSM: "",
    Email: "", Role: "", Department: "", Company: "", TargetQuota: "", ReferenceID: "",
  });

  const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState(""); // agent filter

  // Fetch user details once
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = new URLSearchParams(window.location.search).get("id");
      if (!userId) return setError("Missing User ID."), setLoading(false);

      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch user data.");
        const data = await res.json();
        setUserDetails({
          UserId: data._id,
          Firstname: data.Firstname || "",
          Lastname: data.Lastname || "",
          Email: data.Email || "",
          Manager: data.Manager || "",
          TSM: data.TSM || "",
          Role: data.Role || "",
          Department: data.Department || "",
          Company: data.Company || "",
          TargetQuota: data.TargetQuota || "",
          ReferenceID: data.ReferenceID || "",
        });
      } catch (err) {
        console.error(err);
        setError("Error loading user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch activity posts
  const fetchAccount = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ModuleSales/Reports/AccountManagement/FetchActivity");
      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching activities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  useEffect(() => {
    const fetchTSA = async () => {
      try {
        let url = "";

        if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          // Get all TS Associates for Super Admin
          url = `/api/fetchtsadata?Role=Territory Sales Associate`;
        } else {
          // Other roles don't fetch TS Associates
          return;
        }

        const response = await fetch(url);

        if (!response.ok) throw new Error("Failed to fetch agents");

        const data = await response.json();

        const options = data.map((user: any) => ({
          value: user.ReferenceID,
          label: `${user.Firstname} ${user.Lastname}`,
        }));

        setTSAOptions(options);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchTSA();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // Efficient memoized filtering
  const filteredAccounts = useMemo(() => {
    return posts
      .filter((post) => {
        if (post.activitystatus === 'Deleted') return false;

        const companyName = post?.companyname?.toLowerCase() || "";
        const matchesCompany = companyName.includes(searchTerm.toLowerCase());

        const postDate = post.date_created ? new Date(post.date_created) : null;
        const matchesDate =
          (!startDate || (postDate && postDate >= new Date(startDate))) &&
          (!endDate || (postDate && postDate <= new Date(endDate)));

        const matchesAgentFilter = !selectedAgent || post?.referenceid === selectedAgent;

        if (userDetails.Role === "Super Admin") {
          // Super Admin: walang ReferenceID restriction pero dapat i-respect agent filter
          return matchesCompany && matchesDate && matchesAgentFilter;
        } else {
          // Other roles: dapat tumugma sa sariling ReferenceID + agent filter
          const matchesRefId =
            post?.referenceid === userDetails.ReferenceID ||
            post?.ReferenceID === userDetails.ReferenceID;
          return matchesCompany && matchesDate && matchesRefId && matchesAgentFilter;
        }
      })
      .sort((a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      );
  }, [
    posts,
    searchTerm,
    startDate,
    endDate,
    userDetails.ReferenceID,
    userDetails.Role,
    selectedAgent, // importante para mag-refresh kapag nagpalit ng agent
  ]);


  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="container mx-auto p-4 text-gray-900">
              <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-2">Scheduled Task</h2>
                <p className="text-xs text-gray-600 mb-4">
                  An overview of your recent and upcoming actions, including <strong>scheduled tasks</strong>, <strong>callbacks</strong>, <strong>calendar events</strong>, and <strong>inquiries</strong>—all in one place to keep you on track.
                </p>

                {(userDetails.Role === "Territory Sales Manager" || userDetails.Role === "Super Admin") && (
                  <div className="mb-4 flex items-center space-x-4">
                    <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      Filter by Agent
                    </label>
                    <select
                      className="w-full md:w-1/3 border rounded px-3 py-2 text-xs capitalize"
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                    >
                      <option value="">All Agents</option>
                      {tsaOptions.map((agent) => (
                        <option key={agent.value} value={agent.value}>
                          {agent.label}
                        </option>
                      ))}
                    </select>
                    <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm">Total Activities: <span className="font-bold">{filteredAccounts.length}</span></h1>
                  </div>

                )}

                <Filters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />

                <Main
                  posts={filteredAccounts}
                  userDetails={userDetails}
                  fetchAccount={fetchAccount}
                />
              </div>

              <ToastContainer className="text-xs" autoClose={1000} />
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;
