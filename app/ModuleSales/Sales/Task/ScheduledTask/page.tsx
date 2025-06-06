"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import Filters from "../../../components/Task/ScheduledTask/Filters";
import Main from "../../../components/Task/ScheduledTask/Main";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [userDetails, setUserDetails] = useState({
    UserId: "", Firstname: "", Lastname: "", Manager: "", TSM: "",
    Email: "", Role: "", Department: "", Company: "", TargetQuota: "", ReferenceID: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
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
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await fetch("/api/ModuleSales/Reports/AccountManagement/FetchActivity");
      const data = await res.json();
      if (process.env.NODE_ENV === "development") {
        console.log("Fetched data:", data);
      }
      setPosts(data.data);
    } catch (error) {
      toast.error("Error fetching users.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAccount();

  }, []);

  const filteredAccounts = posts.filter((post) => {
    const companyMatch = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());
    const postDate = post.date_created ? new Date(post.date_created) : null;

    const withinDateRange =
      (!startDate || (postDate && postDate >= new Date(startDate))) &&
      (!endDate || (postDate && postDate <= new Date(endDate)));

    const matchReferenceID =
      post?.referenceid === userDetails.ReferenceID || post?.ReferenceID === userDetails.ReferenceID;

    return companyMatch && withinDateRange && matchReferenceID;
  }).sort((a, b) =>
    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">Loading user data...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 text-sm">{error}</div>
    );
  }

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="container mx-auto p-4 text-gray-900">
              <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-2">Scheduled Task</h2>
                <p className="text-xs text-gray-600 mb-4">
                  This section provides an organized overview of <strong>client accounts</strong> handled by the Sales team.
                </p>

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
