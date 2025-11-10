"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import UsersTable from "../../../components/Routes/Table/CC_Table";

import { toast } from "sonner"; // sonner for toast notifications
import { Skeleton } from "@/components/ui/skeleton"

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientType, setSelectedClientType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    // Loading states
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
                    setError("Failed to load user data. Please try again later.");
                    toast.error("Failed to load user data. Please try again later.");
                } finally {
                    setLoadingUser(false);
                }
            } else {
                setError("User ID is missing.");
                setLoadingUser(false);
                toast.error("User ID is missing.");
            }
        };

        fetchUserData();
    }, []);

    const fetchAccount = async () => {
        setLoadingAccounts(true);
        try {
            const response = await fetch("/api/ModuleSales/Task/CCG");
            if (!response.ok) throw new Error("Failed to fetch accounts");
            const data = await response.json();
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        } finally {
            setLoadingAccounts(false);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    const filteredAccounts = Array.isArray(posts)
        ? posts
            .filter((post) => {
                if (!post?.companyname) return false;

                const matchesSearchTerm = post.companyname
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                const postDate = post.date_created ? new Date(post.date_created) : null;
                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate)));

                const matchesClientType = selectedClientType
                    ? post.typeclient === selectedClientType
                    : true;

                const role = userDetails.Role;
                const refID = String(userDetails.ReferenceID || "");
                let roleMatch = false;

                if (role === "Super Admin" || role === "Special Access") {
                    roleMatch = true;
                } else if (role === "Manager") {
                    roleMatch = String(post.manager) === refID;
                } else if (role === "Territory Sales Manager") {
                    roleMatch = String(post.tsm) === refID;
                } else if (role === "Territory Sales Associate") {
                    roleMatch = String(post.referenceid) === refID;
                }

                return matchesSearchTerm && isWithinDateRange && matchesClientType && roleMatch;
            })
            .sort((a, b) => {
                const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
                const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
                return dateB - dateA;
            })
        : [];

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                {showForm ? (
                                    <></>
                                ) : (
                                    <>
                                        <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                            <h2 className="text-lg font-bold mb-2">Client Coverage Guide</h2>
                                            <p className="text-xs text-gray-600 mb-4">
                                                The <strong>Client Coverage Guide</strong> provides a comprehensive overview
                                                of all transaction histories for each company. It serves as a detailed
                                                record of discussions and agreements made with clients, helping to track
                                                important conversations, updates, and transactions. By reviewing this
                                                guide, users can quickly access relevant information about each client,
                                                ensuring efficient management of customer relations and providing a
                                                reliable reference for future interactions.
                                            </p>

                                            {loading ? (
                                                <div className="flex items-center space-x-4">
                                                    <Skeleton className="h-12 w-12 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-full" />
                                                        <Skeleton className="h-4 w-full" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <UsersTable posts={filteredAccounts} />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
