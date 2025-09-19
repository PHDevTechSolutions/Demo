"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Routes/Filters/GC_Filters";
import Table from "../../../components/Routes/Table/GC_Table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GroupAccounts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientType, setSelectedClientType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
  const [tsmOptions, setTSMOptions] = useState<{ value: string, label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedTSM, setSelectedTSM] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const [userDetails, setUserDetails] = useState({
    UserId: "", ReferenceID: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);



  const loading = loadingUser || loadingAccounts;

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
          setLoadingUser(false);
        }
      } else {
        setError("User ID is missing.");
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchAccount = async () => {
    if (!userDetails.Role) return;
    setLoadingAccounts(true);

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
      setLoadingAccounts(false);
    }
  };

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
        } else if (userDetails.Role === "Super Admin" || userDetails.Role === "Manager") {
          url = `/api/fetchtsadata?Role=Territory Sales Associate`;
        } else {
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

  useEffect(() => {
    const fetchTSM = async () => {
      if (userDetails.Role !== "Manager") return;
      try {
        const response = await fetch(`/api/fetchtsadata?Role=Territory Sales Manager`);
        if (!response.ok) throw new Error("Failed to fetch TSMs");

        const data = await response.json();
        setTSMOptions(data.map((user: any) => ({
          value: user.ReferenceID,
          label: `${user.Firstname} ${user.Lastname}`,
        })));
      } catch (err) {
        console.error("Error fetching TSM:", err);
      }
    };

    fetchTSM();
  }, [userDetails.Role]);

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
              : userDetails.Role === "Manager"
                ? post?.manager === referenceID
                : false;

      const matchesAgentFilter = !selectedAgent || post?.referenceid === selectedAgent;
      const matchesTSMFilter = !selectedTSM || post?.tsm === selectedTSM;

      return matchesSearchTerm && isWithinDateRange && matchesClientType && matchesRole && matchesAgentFilter && matchesTSMFilter;
    })
    : [];

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="mx-auto p-4 text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-1">
                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                  <h2 className="text-lg font-bold mb-2">List of Accounts - Company Groups</h2>
                  <p className="text-xs text-gray-600 mb-4">
                    The <strong>Company Groups</strong> section organizes accounts based on their respective parent or affiliated
                    groups. This allows users to view related companies together, making it easier to analyze group-level performance,
                    strengthen partnerships, and manage business relationships more efficiently.
                  </p>

                  {(userDetails.Role === "Territory Sales Manager" ||
                    userDetails.Role === "Super Admin" ||
                    userDetails.Role === "Manager") && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Filter by Agent (TSA)
                          </label>
                          <select
                            className="w-full border rounded px-3 py-2 text-xs capitalize"
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
                        </div>

                        {userDetails.Role === "Manager" && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Filter by TSM
                            </label>
                            <select
                              className="w-full border rounded px-3 py-2 text-xs capitalize"
                              value={selectedTSM}
                              onChange={(e) => setSelectedTSM(e.target.value)}
                            >
                              <option value="">All TSMs</option>
                              {tsmOptions.map((tsm) => (
                                <option key={tsm.value} value={tsm.value}>
                                  {tsm.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1 invisible">
                            Total
                          </label>
                          <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm text-center">
                            Total Companies: <span className="font-bold">{filteredAccounts.length}</span>
                          </h1>
                        </div>
                      </div>
                    )}

                  <Filters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                  {loading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                      <span className="ml-2 text-xs text-gray-500">Loading data...</span>
                    </div>
                  ) : (
                    <>
                      <Table posts={filteredAccounts} />
                    </>
                  )}
                </div>
                <ToastContainer
                  position="bottom-right"
                  autoClose={2000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                  className="text-sm z-[99999]"
                  toastClassName={() =>
                    "relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-sm"
                  }
                  progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
                />
              </div>
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default GroupAccounts;
