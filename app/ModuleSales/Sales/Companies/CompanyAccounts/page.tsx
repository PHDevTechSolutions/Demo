"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
// Components
import Form from "../../../components/Routes/Form/CA_Form";
import ImportForm from "../../../components/Companies/CompanyAccounts/ImportForm";
import SearchFilters from "../../../components/Routes/Filters/CA_Filters";
import Container from "../../../components/Companies/CompanyAccounts/Container";
import Pagination from "../../../components/Routes/Pagination/CA_Pagination";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Icons
import { CiImport } from "react-icons/ci";

const ActiveAccounts: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(12);
    const [selectedClientType, setSelectedClientType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
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

    const [tsaOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
    const [tsmOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [selectedTSM, setSelectedTSM] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

    const loading = loadingUser || loadingAccounts;

    const [referenceid, setReferenceID] = useState("");
    const [manager, setManager] = useState("");
    const [tsm, setTsm] = useState("");
    const [status, setstatus] = useState("");
    const [isMaximized, setIsMaximized] = useState(false);

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
                    setReferenceID(data.ReferenceID || "");
                    setManager(data.Manager || "");
                    setTsm(data.TSM || "");
                } catch (err: unknown) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user data. Please try again later.");
                } finally {
                    setLoadingUser(false);
                }
            } else {
                setError("User ID is missing.");
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchAccount = async () => {
        setLoadingAccounts(true);
        try {
            const response = await fetch(
                "/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount"
            );
            const data = await response.json();
            setPosts(data.data || []);
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
                const validClientTypes = ["Top 50", "Next 30", "Balance 20", "TSA Client", "CSR Client"];
                const isValidTypeClient = validClientTypes.includes(post?.typeclient);

                const matchesSearchTerm =
                    post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post?.typeclient?.toLowerCase().includes(searchTerm.toLowerCase());

                const postDate = post?.date_created ? new Date(post.date_created) : null;
                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate + "T23:59:59")));

                const matchesClientType = selectedClientType
                    ? selectedClientType === "null"
                        ? !post?.typeclient || post?.typeclient === null || post?.typeclient === ""
                        : post?.typeclient === selectedClientType
                    : true;

                const matchesStatus = selectedStatus
                    ? post?.status?.toLowerCase() === selectedStatus.toLowerCase()
                    : true;

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
                const matchesTSMFilter = !selectedTSM || post?.tsm === selectedTSM;

                const isActiveOrUsed = post?.status === "Active" || post?.status === "Used";

                return (
                    isValidTypeClient &&
                    matchesSearchTerm &&
                    isWithinDateRange &&
                    matchesClientType &&
                    matchesStatus &&
                    matchesRole &&
                    isActiveOrUsed &&
                    matchesAgentFilter &&
                    matchesTSMFilter
                );
            })
            .sort((a, b) => {
                const companyNameA = a.companyname?.toLowerCase() || "";
                const companyNameB = b.companyname?.toLowerCase() || "";

                const numFirstA = companyNameA.match(/^\d+/)
                    ? parseInt(companyNameA.match(/^\d+/)[0], 10)
                    : Infinity;
                const numFirstB = companyNameB.match(/^\d+/)
                    ? parseInt(companyNameB.match(/^\d+/)[0], 10)
                    : Infinity;

                if (numFirstA !== numFirstB) {
                    return numFirstA - numFirstB;
                }

                return companyNameA.localeCompare(companyNameB);
            })
        : [];

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredAccounts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredAccounts.length / postsPerPage);

    const handleEdit = (post: any) => {
        setEditUser(post);
        setShowForm(true);
    };

    const fieldWidthClass = isMaximized ? "w-full sm:w-1/2 px-4 mb-4" : "w-full px-4 mb-4";

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <>
                            <div className="mx-auto p-4 text-gray-900">
                                <div className="grid grid-cols-1 md:grid-cols-1">
                                    {(showForm || showImportForm) && (
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-50 z-30"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditUser(null);
                                                setShowImportForm(false);
                                            }}
                                        ></div>
                                    )}

                                    <div
                                        className={`fixed bottom-0 left-0 w-full h-[80%] shadow-lg z-[9999] transform transition-transform duration-500 ease-in-out overflow-y-auto bg-white ${showForm || showImportForm ? "translate-y-0" : "translate-y-full"
                                            }`}
                                    >
                                        {showForm ? (
                                            <Form
                                                onCancel={() => {
                                                    setShowForm(false);
                                                    setEditUser(null);
                                                }}
                                                refreshPosts={fetchAccount}
                                                userDetails={{
                                                    id: editUser ? editUser.id : userDetails.UserId,
                                                    referenceid: editUser ? editUser.referenceid : userDetails.ReferenceID,
                                                    manager: editUser ? editUser.manager : userDetails.Manager,
                                                    tsm: editUser ? editUser.tsm : userDetails.TSM,
                                                }}
                                                editUser={editUser}
                                            />
                                        ) : showImportForm ? (
                                            <ImportForm
                                                referenceid={userDetails.ReferenceID}
                                                manager={userDetails.Manager}
                                                tsm={userDetails.TSM}
                                                setShowImportForm={setShowImportForm}
                                                status={status}
                                                setstatus={setstatus}
                                                fieldWidthClass={fieldWidthClass}
                                            />
                                        ) : null}
                                    </div>

                                    <div className="mb-4 p-4 bg-white shadow-md rounded-lg text-gray-900">
                                        <h2 className="text-lg font-bold mb-2">List of Accounts - Active</h2>
                                        <p className="text-xs text-gray-600 mb-4">
                                            The <strong>Active Company Accounts</strong> section displays all currently
                                            active accounts. Users can filter and explore accounts by client type, date
                                            range, and other criteria, making it easier to manage and analyze up-to-date
                                            company data.
                                        </p>

                                        {(userDetails.Role === "Territory Sales Manager" ||
                                            userDetails.Role === "Super Admin" ||
                                            userDetails.Role === "Manager") && (
                                                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Filter by Agent (TSA)
                                                        </label>
                                                        <select
                                                            className="w-full border rounded px-3 py-2 text-xs capitalize"
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
                                                    </div>

                                                    {userDetails.Role === "Manager" && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Filter by TSM
                                                            </label>
                                                            <select
                                                                className="w-full border rounded px-3 py-2 text-xs capitalize"
                                                                value={selectedTSM}
                                                                onChange={(e) => setSelectedTSM(e.target.value)}
                                                            >
                                                                <option value="">All TSMs</option>
                                                                {tsmOptions.map((tsm) => (
                                                                    <option key={tsm.value} value={tsm.value}>
                                                                        {tsm.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1 invisible">
                                                            Total
                                                        </label>
                                                        <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm text-center">
                                                            Total Companies: <span className="font-bold">{filteredAccounts.length}</span>
                                                        </h1>
                                                    </div>
                                                </div>
                                            )}

                                        <SearchFilters
                                            searchTerm={searchTerm}
                                            setSearchTerm={setSearchTerm}
                                            postsPerPage={postsPerPage}
                                            setPostsPerPage={setPostsPerPage}
                                            selectedClientType={selectedClientType}
                                            setSelectedClientType={setSelectedClientType}
                                            selectedStatus={selectedStatus}
                                            setSelectedStatus={setSelectedStatus}
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            endDate={endDate}
                                            setEndDate={setEndDate}
                                        />

                                        {loading ? (
                                            <div className="flex justify-center items-center py-10">
                                                <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                                                <span className="ml-2 text-xs text-gray-500">Loading data...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Container
                                                    posts={currentPosts}
                                                    handleEdit={handleEdit}
                                                    referenceid={referenceid}
                                                    fetchAccount={fetchAccount}
                                                    Role={userDetails.Role}
                                                />
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    setCurrentPage={setCurrentPage}
                                                />
                                            </>
                                        )}

                                        <div className="text-xs mt-2">
                                            Showing {indexOfFirstPost + 1} to{" "}
                                            {Math.min(indexOfLastPost, filteredAccounts.length)} of{" "}
                                            {filteredAccounts.length} entries
                                        </div>
                                    </div>
                                </div>
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
                                className="text-xs z-[99999]"
                                toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
                                progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
                            />
                        </>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ActiveAccounts;
