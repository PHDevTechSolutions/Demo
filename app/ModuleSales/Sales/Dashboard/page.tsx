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

  const fetchData = async () => {
    try {
      const response = await fetch("/api/ModuleSales/Dashboard/FetchProgress");
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

  // 🔹 Fetch TSA list
  // 🔹 Fetch TSA list
  useEffect(() => {
    const fetchTSA = async () => {
      try {
        let url = "";

        if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          // TSM → fetch TSA under this TSM
          url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          // Manager → fetch TSA under this Manager only
          url = `/api/fetchtsadata?Role=Territory Sales Associate&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          // Super Admin → fetch all TSA
          url = `/api/fetchtsadata?Role=Territory Sales Associate`;
        } else {
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch TSA");

        const data = await response.json();

        const options = data.map((user: any) => ({
          value: user.ReferenceID,
          label: `${user.Firstname} ${user.Lastname}`,
        }));

        setTSAOptions(options);
      } catch (error) {
        console.error("Error fetching TSA:", error);
      }
    };

    fetchTSA();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // 🔹 Fetch TSM list
  useEffect(() => {
    const fetchTSM = async () => {
      try {
        let url = "";

        if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          // Manager → fetch TSM under this Manager only
          url = `/api/fetchtsadata?Role=Territory Sales Manager&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          // Super Admin → fetch all TSM
          url = `/api/fetchtsadata?Role=Territory Sales Manager`;
        } else if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          // TSM → fetch self (optional depende sa gusto mo)
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
                : userDetails.Role === "Manager"
                  ? post?.manager === referenceID
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
        <MainContainer
          filteredAccounts={filteredAccounts}
          userDetails={userDetails}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          tsaOptions={tsaOptions}
          tsmOptions={tsmOptions}
        />

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
          className="text-xs z-[99999]"
          toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
          progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
        />
      </ParentLayout>
    </SessionChecker>
  );
};

export default DashboardPage;
