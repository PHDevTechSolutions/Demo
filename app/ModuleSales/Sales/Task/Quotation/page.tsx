"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Quote from "../../../components/Task/Quote/Main";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<string>("quote");
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
                            <div className="text-gray-900 w-full">
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