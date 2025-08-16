"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Companies/GroupCompanies/Filters";
import Table from "../../../components/Companies/GroupCompanies/Table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GroupAccounts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientType, setSelectedClientType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tsaOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const [userDetails, setUserDetails] = useState({
    UserId: "", ReferenceID: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (userId) {
        try {
          const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
          if (!response.ok) throw new Error("Failed to fetch user data");
          const data = await response.json();
          setUserDetails({
            UserId: data._id,
            ReferenceID: data.ReferenceID || "",
            Firstname: data.Firstname || "",
            Lastname: data.Lastname || "",
            Email: data.Email || "",
            Role: data.Role || "",
            Department: data.Department || "",
            Company: data.Company || "",
          });
        } catch (err: unknown) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("User ID is missing.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchAccount = async () => {
    if (!userDetails.Role) return;
    setLoading(true);

    try {
      let url = "/api/ModuleSales/Companies/GroupCompanies";
      if (userDetails.Role !== "Super Admin") {
        url += `?referenceid=${encodeURIComponent(userDetails.ReferenceID)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      toast.error("Error fetching users.");
      console.error("Error Fetching", error);
    } finally {
      setLoading(false);
    }
  };


  // Fetch after userDetails loaded
  useEffect(() => {
    if (userDetails.Role) {
      fetchAccount();
    }
  }, [userDetails.Role, userDetails.ReferenceID]);


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

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClientType, startDate, endDate, selectedAgent]);

  const filteredAccounts = Array.isArray(posts)
    ? posts.filter((post) => {
      const matchesSearchTerm = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());
      const postDate = post.date_created ? new Date(post.date_created) : null;
      const isWithinDateRange =
        (!startDate || (postDate && postDate >= new Date(startDate))) &&
        (!endDate || (postDate && postDate <= new Date(endDate)));
      const matchesClientType = selectedClientType ? post?.typeclient === selectedClientType : true;
      const referenceID = userDetails.ReferenceID;

      const matchesRole =
        userDetails.Role === "Super Admin" || userDetails.Role === "Special Access"
          ? true
          : userDetails.Role === "Territory Sales Associate"
            ? post?.referenceid === referenceID
            : userDetails.Role === "Territory Sales Manager"
              ? post?.tsm === referenceID
              : false;

      const matchesAgentFilter = !selectedAgent || post?.referenceid === selectedAgent;

      return matchesSearchTerm && isWithinDateRange && matchesClientType && matchesRole && matchesAgentFilter;
    })
    : [];

  // PAGINATION LOGIC
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAccounts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredAccounts.length / postsPerPage);

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="container mx-auto p-4 text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-1">
                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                  <h2 className="text-lg font-bold mb-2">List of Accounts - Company Groups</h2>
                  <p className="text-xs text-gray-600 mb-4">
                    The <strong>Company Groups</strong> section organizes accounts based on their respective parent or affiliated
                    groups. This allows users to view related companies together, making it easier to analyze group-level performance,
                    strengthen partnerships, and manage business relationships more efficiently.
                  </p>

                  {/* Agent Filter */}
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
                      <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm">Total Companies: <span className="font-bold">{filteredAccounts.length}</span></h1>
                    </div>

                  )}

                  <Filters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                  <Table posts={currentPosts} />

                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="bg-gray-200 text-xs px-4 py-2 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span className="text-xs">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="bg-gray-200 text-xs px-4 py-2 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <ToastContainer className="text-xs" autoClose={1000} />
              </div>
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default GroupAccounts;
