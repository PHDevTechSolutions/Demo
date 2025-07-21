"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Filters from "../../../components/Reports/QuotationSummary/Filters";
import Table from "../../../components/Reports/QuotationSummary/Table";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ListofUser: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [userDetails, setUserDetails] = useState({
        UserId: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "", TargetQuota: "", ReferenceID: "",
    });

    const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                        Department: data.Department || "",
                        Company: data.Company || "",
                        TargetQuota: data.TargetQuota || "",
                        ReferenceID: data.ReferenceID || "",
                    });
                } catch (err: unknown) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user data. Please try again later.");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User ID is missing.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchAccount = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/ModuleSales/Reports/AccountManagement/FetchSales");
            const data = await response.json();
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    useEffect(() => {
        const fetchTSA = async () => {
            if (!userDetails.ReferenceID || userDetails.Role !== "Territory Sales Manager") return;

            try {
                const response = await fetch(`/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`);
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
        ? posts.filter((post) => {
            const matchesSearchTerm = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());
            const postDate = post.date_created ? new Date(post.date_created) : null;
            const isWithinDateRange =
                (!startDate || (postDate && postDate >= new Date(startDate))) &&
                (!endDate || (postDate && postDate <= new Date(endDate)));
            const isWarmStatus = post?.activitystatus?.toLowerCase() === "quote-done";
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
            return (
                matchesSearchTerm && isWithinDateRange && isWarmStatus && matchesRole && matchesAgentFilter
            );
        }).sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
        : [];

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Quotation Summary");

        worksheet.columns = [
            { header: "Date Created", key: "date_created", width: 20 },
            { header: "Company Name", key: "companyname", width: 30 },
            { header: "Contact Person", key: "contactperson", width: 25 },
            { header: "Quotation No.", key: "quotationnumber", width: 20 },
            { header: "Amount", key: "quotationamount", width: 15 },
            { header: "Status", key: "activitystatus", width: 15 },
            { header: "Remarks", key: "remarks", width: 30 },
        ];

        filteredAccounts.forEach((item) => {
            worksheet.addRow({
                ...item,
                quotationamount: typeof item.quotationamount === 'number' ? item.quotationamount : parseFloat(item.quotationamount || '0')
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Quotation_Summary.xlsx");
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                    <h2 className="text-lg font-bold mb-2">Quotation Summary</h2>
                                    <p className="text-xs text-gray-600 mb-4">
                                        This section provides an organized overview of <strong>client accounts</strong> handled by the Sales team. It enables users to efficiently monitor account status, track communications, and manage key activities and deliverables. The table below offers a detailed summary to support effective relationship management and ensure client needs are consistently met.
                                    </p>

                                    {userDetails.Role === "Territory Sales Manager" && (
                                        <div className="mb-4 flex flex-wrap items-center gap-2">
                                            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                                Filter by Agent:
                                            </label>

                                            <select
                                                className="border rounded px-3 py-2 text-xs capitalize w-full md:w-1/3"
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

                                            <button
                                                onClick={exportToExcel}
                                                className="bg-green-700 hover:bg-green-800 text-white text-[10px] px-4 py-2 rounded whitespace-nowrap"
                                            >
                                                Export to Excel
                                            </button>
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
                                    <Table posts={filteredAccounts} />
                                </div>

                                <ToastContainer className="text-xs" autoClose={1000} />
                            </div>
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
