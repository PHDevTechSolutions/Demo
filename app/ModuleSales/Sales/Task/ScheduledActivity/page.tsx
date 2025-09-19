"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
// Layout
import ParentLayout from "../../../components/Layouts/ParentLayout";
// Session
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
// Filter
import Filters from "../../../components/Task/ScheduledActivity/Filters/Filters";
// Route
import Main from "../../../components/Task/ScheduledActivity/Main";
import TaskList from "../../../components/Task/TaskList/Task";
import Notes from "../../../components/Task/Notes/Note";
import KanbanBoard from "../../../components/Task/KanbanBoard/Main";
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
    Company: "",
    TargetQuota: "",
    ReferenceID: "",
    profilePicture: "",
    ImapHost: "",
    ImapPass: "",
  });

  const [tsaOptions, setTSAOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showBanner] = useState(true);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [yesterdaySummary, setYesterdaySummary] = useState<any[]>([]);
  const [summaryType, setSummaryType] = useState<"yesterday" | "latest">(
    "yesterday"
  );
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loading = loadingUser || loadingAccounts;

  const fetchSummary = useCallback(async () => {
    if (!userDetails?.ReferenceID) return;

    try {
      setLoadingSummary(true);
      setIsSummaryOpen(true);

      const res = await fetch(
        "/api/ModuleSales/Task/DailyActivity/FetchProgress"
      );
      const data = await res.json();
      const activities = data.data || [];

      const userActivities = activities.filter(
        (p: any) =>
          p.ReferenceID === userDetails.ReferenceID ||
          p.referenceid === userDetails.ReferenceID
      );

      if (userActivities.length === 0) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterdayLogs = userActivities.filter(
        (p: any) =>
          new Date(p.date_created) >= yesterday &&
          new Date(p.date_created) < today
      );

      if (yesterdayLogs.length > 0) {
        setYesterdaySummary(yesterdayLogs);
        setSummaryType("yesterday");
      } else {
        const latest = [...userActivities].sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        )[0];
        setYesterdaySummary([latest]);
        setSummaryType("latest");
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  }, [userDetails]);

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

  useEffect(() => {
    const fetchTSA = async () => {
      try {
        let url = "";

        if (
          userDetails.Role === "Territory Sales Manager" &&
          userDetails.ReferenceID
        ) {
          url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
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

        const matchesAgentFilter =
          !selectedAgent || post?.referenceid === selectedAgent;

        if (userDetails.Role === "Super Admin") {
          return matchesCompany && matchesDate && matchesAgentFilter;
        } else {
          const matchesRefId =
            post?.referenceid === userDetails.ReferenceID ||
            post?.ReferenceID === userDetails.ReferenceID;
          return (
            matchesCompany && matchesDate && matchesRefId && matchesAgentFilter
          );
        }
      })
      .sort(
        (a, b) =>
          new Date(b.date_created).getTime() -
          new Date(a.date_created).getTime()
      );
  }, [
    posts,
    searchTerm,
    startDate,
    endDate,
    userDetails.ReferenceID,
    userDetails.Role,
    selectedAgent,
  ]);

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
                <Tools activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Main */}
                <div className="text-gray-900 w-full">
                  {activeTab === "scheduled" && (
                    <div className="p-4 bg-white shadow-md rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-bold">Scheduled Task</h2>
                          <p className="text-xs text-gray-600">
                            An overview of your recent and upcoming actions,
                            including <strong>scheduled tasks</strong>,{" "}
                            <strong>callbacks</strong>,{" "}
                            <strong>calendar events</strong>, and{" "}
                            <strong>inquiries</strong>.
                          </p>
                        </div>

                        <button
                          onClick={fetchSummary}
                          className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                        >
                          Show Recent Summary
                        </button>
                      </div>

                      {/* Agent filter */}
                      {(userDetails.Role === "Territory Sales Manager" ||
                        userDetails.Role === "Super Admin") && (
                          <div className="mb-4 flex flex-wrap items-center space-x-4">
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
                            <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm">
                              Total Activities:{" "}
                              <span className="font-bold">
                                {filteredAccounts.length}
                              </span>
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

                  {/* Xendmail
                  <div
                    className={`${activeTab === "xendmail" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <XendMail userDetails={userDetails} />
                  </div> */}
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
            </>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;
