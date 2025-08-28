"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Task/ScheduledActivity/Filters/Filters";
import Main from "../../../components/Task/ScheduledActivity/Main";
import Notes from "../../../components/Task/Notes/Note";
import AnnouncementModal from "../../../components/Task/Summary/AnnouncementModal";
import KanbanBoard from "../../../components/Task/KanbanBoard/Main";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsCalendar4Week, BsListTask, BsInfoCircle } from "react-icons/bs";
import { LuNotebookPen } from "react-icons/lu";

const statusEmojis: { [key: string]: string } = {
  Cold: "❄️",
  Assisted: "😊",
  "Quote-Done": "💬",
  "SO-Done": "📝",
  Delivered: "📦",
  Done: "✅",
  Paid: "💰",
  Collected: "📥",
  Cancelled: "❌",
  Loss: "💔",
};

const ListofUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "scheduled" | "activity" | "notes"
  >("scheduled");
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

  const loading = loadingUser || loadingAccounts;

  // Fetch user details
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

  // Fetch activities (account mgmt)
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

  // Fetch TSA options
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

  // Filter accounts
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

  // Fetch yesterday or latest summary
  useEffect(() => {
    const fetchSummary = async () => {
      if (!userDetails?.ReferenceID) return;

      try {
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

        setIsSummaryOpen(true);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };

    fetchSummary();
  }, [userDetails]);

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <>
              {/* Always visible banner */}
              {showBanner && (
                <div className="bg-blue-50 border border-blue-300 text-blue-800 px-6 py-4 rounded-xl shadow-md mb-4 relative flex items-start gap-3">
                  <div className="mt-1 text-blue-600">
                    <BsInfoCircle size={22} />
                  </div>
                  <div className="flex-1 text-sm leading-relaxed">
                    <strong className="font-semibold text-blue-900">
                      Coming Soon:
                    </strong>
                    <span> The </span>
                    <span className="font-medium">Scheduled Task</span> module
                    will be converted into
                    <span className="font-medium"> Activity Planner</span>.
                    <br />
                    <span>
                      This will include features such as
                      <span className="italic">
                        {" "}
                        client meetings, outbound calls, follow-ups (callbacks),
                        Personal Activities, and CSR inquiries
                      </span>
                      .
                    </span>
                    <br />
                    <span>
                      The new UI will feature a{" "}
                      <a
                        href="https://www.atlassian.com/agile/kanban/boards"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 underline hover:text-blue-800 transition"
                      >
                        Kanban Board with Calendar
                      </a>{" "}
                      view for easier task management.
                    </span>
                  </div>
                </div>
              )}

              <AnnouncementModal
                isOpen={isSummaryOpen}
                onClose={() => setIsSummaryOpen(false)}
                summary={yesterdaySummary}
                summaryType={summaryType}
                statusEmojis={statusEmojis}
              />

              <div className="flex gap-4">
                {/* Sidebar */}
                <div className="flex flex-col space-y-2">
                  <h3 className="font-bold text-xs">Tools</h3>
                  <button
                    onClick={() => setActiveTab("scheduled")}
                    className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${activeTab === "scheduled"
                      ? "bg-orange-400 text-white"
                      : "bg-gray-100"
                      }`}
                  >
                    <BsListTask />
                  </button>

                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${activeTab === "notes"
                      ? "bg-orange-400 text-white"
                      : "bg-gray-100"
                      }`}
                  >
                    <LuNotebookPen />
                  </button>

                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${activeTab === "activity"
                      ? "bg-orange-400 text-white"
                      : "bg-gray-100"
                      }`}
                  >
                    <BsCalendar4Week />
                  </button>
                </div>

                {/* Main */}
                <div className="text-gray-900 w-full">
                  {activeTab === "scheduled" && (
                    <div className="p-4 bg-white shadow-md rounded-lg">
                      <h2 className="text-lg font-bold mb-2">Scheduled Task</h2>
                      <p className="text-xs text-gray-600 mb-4">
                        An overview of your recent and upcoming actions,
                        including <strong>scheduled tasks</strong>,{" "}
                        <strong>callbacks</strong>,{" "}
                        <strong>calendar events</strong>, and{" "}
                        <strong>inquiries</strong>—all in one place to keep you
                        on track.
                      </p>

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

                      {/* Filters + Main */}
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

                  {/* Notes */}
                  <div
                    className={`${activeTab === "notes" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <Notes userDetails={userDetails} />
                  </div>

                  {/* Kanban */}
                  <div
                    className={`${activeTab === "activity" ? "block" : "hidden"
                      } bg-white shadow-md rounded-lg flex`}
                  >
                    <KanbanBoard userDetails={userDetails} />
                  </div>
                </div>

                <ToastContainer className="text-xs" autoClose={1000} />
              </div>
            </>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;
