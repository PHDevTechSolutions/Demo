"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Routes/Filters/SA_Filters";
import Main from "../../../components/Task/ScheduledActivity/Main";
import TaskList from "../../../components/Task/TaskList/Task";
import Notes from "../../../components/Task/Notes/Note";
import KanbanBoard from "../../../components/Task/KanbanBoard/Main";
import Quote from "../../../components/Task/Quote/Main";
import Tools from "../../../components/Task/Tools/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineLoading, AiOutlineReload } from 'react-icons/ai';

const ListofUser: React.FC = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("activity");
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userDetails, setUserDetails] = useState<any>({
    UserId: "",
    Firstname: "",
    Lastname: "",
    Manager: "",
    TSM: "",
    Email: "",
    Role: "",
    Department: "",
    ContactNumber: "",
    Company: "",
    TargetQuota: "",
    ReferenceID: "",
    profilePicture: "",
    ImapHost: "",
    ImapPass: "",
  });

  const [tsaOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
  const [tsmOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedTSM, setSelectedTSM] = useState("");

  const loading = loadingUser || loadingAccounts;
  const userId = userDetails?.UserId;

  // 🔹 Fetch user details
  useEffect(() => {
    const fetchUserData = async () => {
      const userIdParam = new URLSearchParams(window.location.search).get("id");
      if (!userIdParam) return setError("Missing User ID."), setLoadingUser(false);

      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userIdParam)}`);
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
          ContactNumber: data.ContactNumber || "",
          Department: data.Department || "",
          Company: data.Company || "",
          TargetQuota: data.TargetQuota || "",
          ReferenceID: data.ReferenceID || "",
          profilePicture: data.profilePicture || "",
          ImapHost: data.ImapHost || "",
          ImapPass: data.ImapPass || "",
        });
      } catch (err) {
        console.error(err);
        setError("Error loading user data.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // 🔹 Fetch activities
  const fetchAccount = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/ModuleSales/Reports/AccountManagement/FetchActivity");
      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching activities.");
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  // 🔹 Fetch TSA Options
  useEffect(() => {
    const fetchTSA = async () => {
      try {
        let url = "";
        if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Associate&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          url = `/api/fetchtsadata?Role=Territory Sales Associate`;
        } else return;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch agents");

        const data = await res.json();
        setTSAOptions(data.map((user: any) => ({ value: user.ReferenceID, label: `${user.Firstname} ${user.Lastname}` })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTSA();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // 🔹 Fetch TSM Options
  useEffect(() => {
    const fetchTSM = async () => {
      try {
        let url = "";
        if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Manager&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          url = `/api/fetchtsadata?Role=Territory Sales Manager`;
        } else return;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch TSM");
        const data = await res.json();
        setTSMOptions(data.map((user: any) => ({ value: user.ReferenceID, label: `${user.Firstname} ${user.Lastname}` })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTSM();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // 🔹 Auto-refetch TSA kapag nagpalit ng TSM
  useEffect(() => {
    const fetchTSAUnderTSM = async () => {
      if (!selectedTSM) return setSelectedAgent("");

      try {
        const res = await fetch(`/api/fetchtsadata?Role=Territory Sales Associate&tsm=${selectedTSM}`);
        if (!res.ok) throw new Error("Failed to fetch TSA under TSM");
        const data = await res.json();
        setTSAOptions(data.map((user: any) => ({ value: user.ReferenceID, label: `${user.Firstname} ${user.Lastname}` })));
        setSelectedAgent("");
      } catch (err) {
        console.error(err);
      }
    };
    fetchTSAUnderTSM();
  }, [selectedTSM]);

  // 🔹 Filtered accounts
  const filteredAccounts = useMemo(() => {
    return posts
      .filter(post => {
        if (post.activitystatus === "Deleted") return false;

        const matchesCompany = (post.companyname || "").toLowerCase().includes(searchTerm.toLowerCase());
        const postDate = post.date_updated ? new Date(post.date_updated) : null;
        const matchesDate = (!startDate || (postDate && postDate >= new Date(startDate))) &&
          (!endDate || (postDate && postDate <= new Date(endDate)));

        const matchesAgent = !selectedAgent || post.referenceid === selectedAgent;

        if (userDetails.Role === "Super Admin" || userDetails.Role === "Manager") {
          // 🔹 Manager can see all posts under their TSMs/Agents
          return matchesCompany && matchesDate && matchesAgent;
        } else {
          return matchesCompany && matchesDate && matchesAgent && post.referenceid === userDetails.ReferenceID;
        }
      })
      .sort((a, b) => new Date(b.date_updated).getTime() - new Date(a.date_updated).getTime());
  }, [posts, searchTerm, startDate, endDate, selectedAgent, userDetails]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAccount();
  };

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {() => (
            <div className="flex gap-4">
              <Tools activeTab={activeTab} setActiveTab={setActiveTab} userDetails={userDetails} />

              <div className="text-gray-900 w-full">
                {/* 🔹 Breadcrumb Navigation */}
                <nav className="flex items-center text-xs mb-4 bg-gray-50 px-3 py-2 rounded border border-gray-200 shadow-sm">
                  <button
                    onClick={() => {
                      const url = userId
                        ? `/ModuleSales/Sales/Dashboard?id=${encodeURIComponent(userId)}`
                        : "/ModuleSales/Sales/Dashboard";
                      router.push(url);
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Dashboard
                  </button>

                  <span className="mx-2 text-gray-400">›</span>

                  <button
                    onClick={() => {
                      const url = userId
                        ? `/ModuleSales/Sales/Companies/CompanyAccounts?id=${encodeURIComponent(userId)}`
                        : "/ModuleSales/Sales/Companies/CompanyAccounts";
                      router.push(url);
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Clients
                  </button>

                  <span className="mx-2 text-gray-400">›</span>

                  <span className="text-gray-700 font-semibold">Scheduled Activity</span>
                </nav>


                {activeTab === "scheduled" && (
                  <div className="p-4 bg-white shadow-md rounded-lg">
                    {(userDetails.Role === "Territory Sales Manager" ||
                      userDetails.Role === "Manager" ||
                      userDetails.Role === "Super Admin") && (
                        <div className="mb-4 flex flex-wrap items-center space-x-4">
                          {(userDetails.Role === "Manager" || userDetails.Role === "Super Admin") && (
                            <>
                              <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Filter by TSM</label>
                              <select
                                className="w-full md:w-1/3 border rounded px-3 py-2 text-xs capitalize"
                                value={selectedTSM}
                                onChange={(e) => setSelectedTSM(e.target.value)}
                              >
                                <option value="">All TSM</option>
                                {tsmOptions.map(tsm => (
                                  <option key={tsm.value} value={tsm.value}>{tsm.label}</option>
                                ))}
                              </select>
                            </>
                          )}

                          <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Filter by TSA</label>
                          <select
                            className="w-full md:w-1/3 border rounded px-3 py-2 text-xs capitalize"
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                          >
                            <option value="">All Agents</option>
                            {tsaOptions.map(agent => (
                              <option key={agent.value} value={agent.value}>{agent.label}</option>
                            ))}
                          </select>

                          <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm">
                            Total Activities: <span className="font-bold">{filteredAccounts.length}</span>
                          </h1>
                        </div>
                      )}

                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold text-black">Manual Task</h2>
                      <button
                        onClick={handleRefresh}
                        className="flex items-center bg-gray-100 gap-2 text-xs px-3 py-2 rounded transition"
                      >
                        {refreshing ? (
                          <>
                            <AiOutlineLoading size={14} className="animate-spin" />
                            <span>Refreshing...</span>
                          </>
                        ) : (
                          <>
                            <AiOutlineReload size={14} className="text-gray-700" />
                            <span>Refresh</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                      Track, manage, and update your daily activities.
                    </p>

                    <Filters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      startDate={startDate}
                      setStartDate={setStartDate}
                      endDate={endDate}
                      setEndDate={setEndDate}
                    />

                    <Main posts={filteredAccounts} userDetails={userDetails} fetchAccount={fetchAccount} />
                  </div>
                )}

                <div className={`${activeTab === "tasklist" ? "block" : "hidden"} bg-white shadow-md rounded-lg flex`}>
                  <TaskList userDetails={userDetails} />
                </div>

                <div className={`${activeTab === "notes" ? "block" : "hidden"} bg-white shadow-md rounded-lg flex`}>
                  <Notes userDetails={userDetails} />
                </div>

                <div className={`${activeTab === "activity" ? "block" : "hidden"} bg-white shadow-md rounded-lg flex`}>
                  <KanbanBoard userDetails={userDetails} />
                </div>

                <div className={`${activeTab === "quote" ? "block" : "hidden"} bg-white shadow-md rounded-lg flex`}>
                  <Quote userDetails={userDetails} />
                </div>

                <ToastContainer
                  position="top-right"
                  autoClose={2000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                  className="text-xs z-[99999]"
                  toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
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

export default ListofUser;