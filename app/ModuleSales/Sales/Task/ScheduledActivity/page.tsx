"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Routes/Filters/SA_Filters";
import Main from "../../../components/Task/ScheduledActivity/Main";
import TaskList from "../../../components/Task/TaskList/Task";
import Notes from "../../../components/Task/Notes/Note";
import KanbanBoard from "../../../components/Task/KanbanBoard/Main";
import Quote from "../../../components/Task/Quote/Main";
//import XendMail from "../../../components/Task/XendMail/Main";
// Tools
import Tools from "../../../components/Task/Tools/Sidebar";
// Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("activity");
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

  const [userDetails, setUserDetails] = useState({
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

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = new URLSearchParams(window.location.search).get("id");
      if (!userId) return setError("Missing User ID."), setLoadingUser(false);

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

  const fetchAccount = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch(
        "/api/ModuleSales/Reports/AccountManagement/FetchActivity"
      );
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

  // 🔹 Fetch TSM Options
  useEffect(() => {
    const fetchTSM = async () => {
      try {
        let url = "";

        if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Manager&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          url = `/api/fetchtsadata?Role=Territory Sales Manager`;
        } else if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Manager&tsm=${userDetails.ReferenceID}`;
        } else {
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch TSM");

        const data = await response.json();
        const options = data.map((user: any) => ({
          value: user.ReferenceID,
          label: `${user.Firstname} ${user.Lastname}`,
        }));

        setTSMOptions(options);
      } catch (error) {
        console.error("Error fetching TSM:", error);
      }
    };

    fetchTSM();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // 🔹 Auto-refetch TSA kapag nagpalit ng TSM (Manager & Super Admin)
  useEffect(() => {
    const fetchTSAUnderTSM = async () => {
      if (!selectedTSM) {
        // reset TSA kung walang piniling TSM
        setSelectedAgent("");
        return;
      }

      try {
        const url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${selectedTSM}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch TSA under TSM");

        const data = await response.json();
        const options = data.map((user: any) => ({
          value: user.ReferenceID,
          label: `${user.Firstname} ${user.Lastname}`,
        }));

        setTSAOptions(options);
        setSelectedAgent(""); // reset TSA filter kapag nagpalit ng TSM
      } catch (error) {
        console.error("Error fetching TSA under TSM:", error);
      }
    };

    fetchTSAUnderTSM();
  }, [selectedTSM]);

  // 🔹 Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return posts
      .filter((post) => {
        if (post.activitystatus === "Deleted") return false;

        const companyName = post?.companyname?.toLowerCase() || "";
        const matchesCompany = companyName.includes(searchTerm.toLowerCase());

        const postDate = post.date_created ? new Date(post.date_created) : null;
        const matchesDate =
          (!startDate || (postDate && postDate >= new Date(startDate))) &&
          (!endDate || (postDate && postDate <= new Date(endDate)));

        const matchesAgentFilter = !selectedAgent || post?.referenceid === selectedAgent;

        if (userDetails.Role === "Super Admin" || userDetails.Role === "Manager") {
          return matchesCompany && matchesDate && matchesAgentFilter;
        } else {
          const matchesRefId =
            post?.referenceid === userDetails.ReferenceID ||
            post?.ReferenceID === userDetails.ReferenceID;
          return matchesCompany && matchesDate && matchesRefId && matchesAgentFilter;
        }
      })
      .sort(
        (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      );
  }, [posts, searchTerm, startDate, endDate, userDetails.ReferenceID, userDetails.Role, selectedAgent]);


  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <>
              {/*
              <Banner show={showBanner} />
              <AnnouncementModal
                isOpen={isSummaryOpen}
                onClose={() => setIsSummaryOpen(false)}
                summary={yesterdaySummary}
                summaryType={summaryType}
                loadingSummary={loadingSummary} // ✅ added
              />
              */}

              <div className="flex gap-4">
                <Tools activeTab={activeTab} setActiveTab={setActiveTab} userDetails={userDetails} />

                {/* Main */}
                <div className="text-gray-900 w-full">
                  <button className="p-2 text-xs underline">View Dashboard</button>
                  {activeTab === "scheduled" && (
                    <div className="p-4 bg-white shadow-md rounded-lg">
                      {/* Agent & TSM filter */}
                      {(userDetails.Role === "Territory Sales Manager" ||
                        userDetails.Role === "Manager" ||
                        userDetails.Role === "Super Admin") && (
                          <div className="mb-4 flex flex-wrap items-center space-x-4">
                            {/* Show TSM filter for Manager & Super Admin */}
                            {(userDetails.Role === "Manager" || userDetails.Role === "Super Admin") && (
                              <>
                                <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                  Filter by TSM
                                </label>
                                <select
                                  className="w-full md:w-1/3 border rounded px-3 py-2 text-xs capitalize"
                                  value={selectedTSM}
                                  onChange={(e) => setSelectedTSM(e.target.value)}
                                >
                                  <option value="">All TSM</option>
                                  {tsmOptions.map((tsm) => (
                                    <option key={tsm.value} value={tsm.value}>
                                      {tsm.label}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}

                            {/* TSA filter */}
                            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                              Filter by TSA
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

                            <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm">
                              Total Activities: <span className="font-bold">{filteredAccounts.length}</span>
                            </h1>
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
                  )}

                  <div
                    className={`${activeTab === "tasklist" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <TaskList userDetails={userDetails} />
                  </div>

                  <div
                    className={`${activeTab === "notes" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <Notes userDetails={userDetails} />
                  </div>

                  <div
                    className={`${activeTab === "activity" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <KanbanBoard userDetails={userDetails} />
                  </div>

                  <div
                    className={`${activeTab === "quote" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <Quote userDetails={userDetails} />
                  </div>

                  {/* Xendmail
                  <div
                    className={`${activeTab === "xendmail" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <XendMail userDetails={userDetails} />
                  </div> */}
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
            </>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;
