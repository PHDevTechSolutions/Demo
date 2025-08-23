"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import { ToastContainer, toast } from "react-toastify";
import MainContainer from "../../components/Dashboard/MainContainer";
import { BsInfoCircle } from "react-icons/bs";

const DashboardPage: React.FC = () => {
  const [userDetails, setUserDetails] = useState({
    UserId: "",
    ReferenceID: "",
    Manager: "",
    TSM: "",
    Firstname: "",
    Lastname: "",
    Email: "",
    Role: "",
    Department: "",
    Company: "",
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tsaOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
  const [tsmOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [showVersionBanner, setShowVersionBanner] = useState(true);

  // Load Welcome Banner state from localStorage
  useEffect(() => {
    if (localStorage.getItem("hideWelcomeBanner") === "true") {
      setShowWelcomeBanner(false);
    }
    if (localStorage.getItem("hideVersionBanner") === "true") {
      setShowVersionBanner(false);
    }
  }, []);

  // Close Welcome Banner + persist in localStorage
  const handleCloseWelcomeBanner = () => {
    setShowWelcomeBanner(false);
    localStorage.setItem("hideWelcomeBanner", "true");
  };

  // Close Version Banner + persist in localStorage
  const handleCloseVersionBanner = () => {
    setShowVersionBanner(false);
    localStorage.setItem("hideVersionBanner", "true");
  };

  // Fetch all posts
  const fetchData = async () => {
    try {
      const response = await fetch("/api/ModuleSales/Reports/AccountManagement/FetchSales");
      const data = await response.json();
      setPosts(data.data);
    } catch (error) {
      toast.error("Error fetching users.");
      console.error("Error Fetching", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch TSA
  useEffect(() => {
    const fetchTSA = async () => {
      try {
        let url = "";

        if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
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

  // Fetch TSM
  useEffect(() => {
    const fetchTSM = async () => {
      try {
        let url = "";

        if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Manager&tsm=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          url = `/api/fetchtsadata?Role=Territory Sales Manager`;
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

        setTSMOptions(options);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchTSM();
  }, [userDetails.ReferenceID, userDetails.Role]);

  const filteredAccounts = Array.isArray(posts)
    ? posts
      .filter((post) => {
        const postDate = post.date_created ? new Date(post.date_created) : null;
        const isWithinDateRange =
          (!startDate || (postDate && postDate >= new Date(startDate))) &&
          (!endDate || (postDate && postDate <= new Date(endDate)));

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

        return isWithinDateRange && matchesRole && matchesAgentFilter;
      })
      .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
    : [];

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (!userId) return;

      try {
        const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserDetails({
          UserId: data._id,
          ReferenceID: data.ReferenceID || "",
          Manager: data.Manager || "",
          TSM: data.TSM || "",
          Firstname: data.Firstname || "",
          Lastname: data.Lastname || "",
          Email: data.Email || "",
          Role: data.Role || "",
          Department: data.Department || "",
          Company: data.Company || "",
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, []);

  return (
    <SessionChecker>
      <ParentLayout>
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-6 py-4 rounded-xl shadow-md mb-4 relative flex items-start gap-3">
            {/* Icon */}
            <div className="mt-1 text-green-600">
              <BsInfoCircle size={22} />
            </div>

            {/* Text Content */}
            <div className="flex-1 text-sm leading-relaxed">
              <strong className="font-semibold text-green-900 text-base">Welcome to Task-Flow!</strong>
              <p className="mt-1">
                Your personal dashboard to manage{" "}
                <span className="font-medium">sales activities, performance reports,</span> and{" "}
                <span className="font-medium">client interactions</span>.
              </p>
              <p className="mt-2">
                🚀 Start by exploring your <span className="italic">Scheduled Task</span>, checking{" "}
                <span className="italic">Daily Activities</span>, or collaborating with your{" "}
                <span className="italic">Team Manager</span>.
              </p>
              <p className="mt-2">
                Use the navigation menu to quickly access modules such as{" "}
                <span className="font-medium">Reports</span>, <span className="font-medium">Accounts Database</span>, and{" "}
                <span className="font-medium">Activities</span>.
              </p>
            </div>

            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-green-500 hover:text-green-700 transition"
              onClick={handleCloseWelcomeBanner}
            >
              ✕
            </button>
          </div>
        )}

        {/* New Version Banner */}
        {showVersionBanner && (
          <div className="relative flex items-start gap-4 bg-purple-50 border border-purple-300 text-purple-800 px-6 py-4 rounded-xl shadow-md mb-4">
            {/* Icon */}
            <div className="mt-1 text-purple-600">
              <BsInfoCircle size={22} />
            </div>

            {/* Content */}
            <div className="flex-1 text-sm leading-relaxed">
              <strong className="block font-semibold text-purple-900 text-base mb-1">
                🎉 TaskFlow v4.4 Released!
              </strong>
              <p className="mb-2">
                This update introduces several improvements to enhance your experience:
              </p>

              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>✨ Calls to SI is added.</li>
                <li>✨ Conversion Per Client / Company Added.</li>
                <li>✨ Working Hours From Bar Chart Converted into Pie Chart on TSM Accounts.</li>
                <li>✨ Refined UI adjustments for the upcoming <span className="font-medium">Activity Planner</span>.</li>
                <li>⚡ Global loading state implemented across all pages.</li>
                <li>🏆 National Ranking is now available for <span className="font-medium">Territory Sales Associates</span>.</li>
              </ul>

              <p className="text-xs italic text-purple-700">
                Released on August 16, 2025
              </p>
            </div>

            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-purple-500 hover:text-purple-700 transition"
              onClick={handleCloseVersionBanner}
              aria-label="Close Version Banner"
            >
              ✕
            </button>
          </div>
        )}

        <MainContainer
          filteredAccounts={filteredAccounts}
          userDetails={userDetails}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          tsaOptions={tsaOptions}
          tsmOptions={tsmOptions}
        />
        <ToastContainer />
      </ParentLayout>
    </SessionChecker>
  );
};

export default DashboardPage;
