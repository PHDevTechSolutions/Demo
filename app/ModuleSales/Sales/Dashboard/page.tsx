"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import { ToastContainer, toast } from "react-toastify";
import MainContainer from "../../components/Dashboard/MainContainer";

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

  const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState(""); // agent filter

  const fetchData = async () => {
    try {
      const response = await fetch("/api/ModuleSales/Reports/AccountManagement/FetchSales");
      const data = await response.json();
      console.log("Fetched data:", data);
      setPosts(data.data);
    } catch (error) {
      toast.error("Error fetching users.");
      console.error("Error Fetching", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTSA = async () => {
      if (!userDetails.ReferenceID || userDetails.Role !== "Territory Sales Manager") return;

      try {
        const response = await fetch(
          `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`
        );

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
      .sort(
        (a, b) =>
          new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      )
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
        <MainContainer
          filteredAccounts={filteredAccounts}
          userDetails={userDetails}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          tsaOptions={tsaOptions}
        />
      </ParentLayout>
    </SessionChecker>
  );
};

export default DashboardPage;
