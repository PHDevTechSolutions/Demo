"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import AddPostForm from "../../../components/UserManagement/CompanyAccounts/Form";
import SearchFilters from "../../../components/UserManagement/CompanyAccounts/Filters";
import UsersTable from "../../../components/UserManagement/CompanyAccounts/Table";
import Pagination from "../../../components/UserManagement/CompanyAccounts/Pagination";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ExcelJS from "exceljs";


// Icons
import { CiSquarePlus, CiImport, CiExport } from "react-icons/ci";
import Select from "react-select";

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(12);
    const [selectedClientType, setSelectedClientType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [userDetails, setUserDetails] = useState({
        UserId: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [referenceid, setreferenceid] = useState("");
    const [tsm, settsm] = useState("");
    const [manager, setmanager] = useState("");
    const [status, setstatus] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [managerOptions, setManagerOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedManager, setSelectedManager] = useState<{ value: string; label: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [TSMOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedTSM, setSelectedTSM] = useState<{ value: string; label: string } | null>(null);
    const [TSAOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedReferenceID, setSelectedReferenceID] = useState<{ value: string; label: string } | null>(null);

    const [filterTSA, setFilterTSA] = useState<string>("");
    const [tsaList, setTsaList] = useState<any[]>([]);

    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target?.result as ArrayBuffer;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);
            const worksheet = workbook.worksheets[0];

            const parsedData: any[] = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                parsedData.push({
                    referenceid,
                    tsm,
                    manager,
                    status,
                    companyname: row.getCell(1).value || "",
                    contactperson: row.getCell(2).value || "",
                    contactnumber: row.getCell(3).value || "",
                    emailaddress: row.getCell(4).value || "",
                    typeclient: row.getCell(5).value || "",
                    address: row.getCell(6).value || "",
                    area: row.getCell(7).value || "",
                });
            });

            console.log("Parsed Excel Data:", parsedData);
            setJsonData(parsedData);
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!file) {
            toast.error("Please upload a file.");
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = event.target?.result as ArrayBuffer;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.worksheets[0];

                const jsonData: any[] = [];

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return;

                    jsonData.push({
                        referenceid,
                        tsm,
                        manager,
                        status,
                        companyname: row.getCell(1).value || "",
                        contactperson: row.getCell(2).value || "",
                        contactnumber: row.getCell(3).value || "",
                        emailaddress: row.getCell(4).value || "",
                        typeclient: row.getCell(5).value || "",
                        address: row.getCell(6).value || "",
                        area: row.getCell(7).value || "",
                    });
                });

                console.log("Parsed Excel Data:", jsonData);

                const response = await fetch("/api/ModuleSales/UserManagement/CompanyAccounts/ImportAccounts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        referenceid,
                        tsm,
                        manager,
                        status,
                        data: jsonData,
                    }),
                });

                const result = await response.json();
                if (result.success) {
                    toast.success(`${result.insertedCount} records imported successfully!`);
                    setreferenceid("");
                    settsm("");
                    setmanager("");
                    setstatus("");
                    setFile(null);
                } else {
                    toast.error(result.message || "Import failed.");
                }
            } catch (error) {
                console.error("Error processing file:", error);
                toast.error("Error uploading file.");
            } finally {
                setIsLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

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

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await fetch("/api/manager?Role=Manager");
                if (!response.ok) {
                    throw new Error("Failed to fetch managers");
                }
                const data = await response.json();
                const options = data.map((user: any) => ({
                    value: user.ReferenceID,
                    label: `${user.Firstname} ${user.Lastname}`,
                }));

                setManagerOptions(options);
            } catch (error) {
                console.error("Error fetching managers:", error);
            }
        };

        fetchManagers();
    }, []);

    useEffect(() => {
        const fetchTSM = async () => {
            try {
                const response = await fetch("/api/fetchtsm?Role=Territory Sales Manager");
                if (!response.ok) {
                    throw new Error("Failed to fetch managers");
                }
                const data = await response.json();
                const options = data.map((user: any) => ({
                    value: user.ReferenceID,
                    label: `${user.Firstname} ${user.Lastname}`,
                }));

                setTSMOptions(options);
            } catch (error) {
                console.error("Error fetching managers:", error);
            }
        };

        fetchTSM();
    }, []);

    useEffect(() => {
        const fetchTSA = async () => {
            try {
                const response = await fetch("/api/fetchtsa?Role=Territory Sales Associate");
                if (!response.ok) {
                    throw new Error("Failed to fetch agents");
                }
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
    }, []);

    const fetchAccount = async () => {
        try {
            const response = await fetch("/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount");
            const data = await response.json();
            console.log("Fetched data:", data);
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);


    const filteredAccounts = Array.isArray(posts)
        ? posts.filter((post) => {
            const matchesSearchTerm =
                post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post?.status?.toLowerCase().includes(searchTerm.toLowerCase());
            const postDate = post.date_created ? new Date(post.date_created) : null;
            const isWithinDateRange =
                (!startDate || (postDate && postDate >= new Date(startDate))) &&
                (!endDate || (postDate && postDate <= new Date(endDate)));
            const matchesClientType = selectedClientType
                ? post?.typeclient === selectedClientType
                : true;

            const matchesStatus = selectedStatus ? post?.status === selectedStatus : true;
            const matchesTSA = filterTSA ? post?.referenceid === filterTSA : true;
            return (
                matchesSearchTerm &&
                isWithinDateRange &&
                matchesClientType &&
                matchesStatus &&
                matchesTSA
            );
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

    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Company Accounts");
        worksheet.columns = [
            { header: 'companyname', key: 'companyname', width: 20 },
            { header: 'contactperson', key: 'contactperson', width: 20 },
            { header: 'contactnumber', key: 'contactnumber', width: 20 },
            { header: 'emailaddress', key: 'emailaddress', width: 20 },
            { header: 'typeclient', key: 'typeclient', width: 20 },
            { header: 'address', key: 'address', width: 20 },
            { header: 'area', key: 'area', width: 20 },
        ];

        filteredAccounts.forEach((post) => {
            worksheet.addRow({
                companyname: post.companyname,
                contactperson: post.contactperson,
                contactnumber: post.contactnumber,
                emailaddress: post.emailaddress,
                typeclient: post.typeclient,
                address: post.address,
                area: post.area
            });
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "CompanyAccounts.xlsx";
            link.click();
        });
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                                {showForm ? (
                                    <AddPostForm
                                        onCancel={() => {
                                            setShowForm(false);
                                            setEditUser(null);
                                        }}
                                        refreshPosts={fetchAccount}
                                        userDetails={{ id: editUser ? editUser.id : userDetails.UserId }}
                                        editUser={editUser}
                                    />
                                ) : showImportForm ? (
                                    <div className="bg-white p-4 shadow-md rounded-md">
                                        <h2 className="text-lg font-bold mb-2">Import Accounts</h2>
                                        <form onSubmit={handleFileUpload}>
                                            <div className="flex flex-wrap -mx-4">
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <label className="block text-xs font-bold mb-2" htmlFor="Manager">Manager</label>
                                                    {isEditing ? (
                                                        <input type="text" id="manager" value={manager} onChange={(e) => setmanager(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                    ) : (
                                                        <Select id="Manager" options={managerOptions} value={selectedManager} onChange={(option) => {
                                                            setSelectedManager(option);
                                                            setmanager(option ? option.value : "");
                                                        }} className="text-xs capitalize" />
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                                    <label className="block text-xs font-bold mb-2" htmlFor="TSM">Territory Sales Manager</label>
                                                    {isEditing ? (
                                                        <input type="text" id="tsm" value={tsm} onChange={(e) => settsm(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                    ) : (
                                                        <Select id="TSM" options={TSMOptions} value={selectedTSM} onChange={(option) => {
                                                            setSelectedTSM(option);
                                                            settsm(option ? option.value : "");
                                                        }} className="text-xs capitalize" />
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                                    <label className="block text-xs font-bold mb-2" htmlFor="referenceid">Territory Sales Associate</label>
                                                    {isEditing ? (
                                                        <input type="text" id="referenceid" value={referenceid} onChange={(e) => setreferenceid(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                    ) : (
                                                        <Select id="ReferenceID" options={TSAOptions} value={selectedReferenceID} onChange={(option) => {
                                                            setSelectedReferenceID(option);
                                                            setreferenceid(option ? option.value : "");
                                                        }} className="text-xs capitalize" />
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <select value={status} onChange={(e) => setstatus(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                                        <option value="">Select Status</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Used">Used</option>
                                                        <option value="Inactive">Inactive</option>
                                                    </select>
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <input type="file" className="w-full px-3 py-2 border rounded text-xs" onChange={handleFileChange} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className={`bg-blue-600 text-xs text-white px-4 py-2 rounded flex items-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                                                        }`}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        "Upload"
                                                    )}
                                                </button>
                                                <button type="button" className="bg-gray-500 text-xs text-white px-4 py-2 rounded" onClick={() => setShowImportForm(false)}>Cancel</button>
                                            </div>
                                        </form>

                                        {jsonData.length > 0 && (
                                            <div className="mt-4">
                                                <h3 className="text-sm font-bold mb-2">Preview Data ({jsonData.length} records)</h3>
                                                <div className="overflow-auto max-h-64 border rounded-md">
                                                    <table className="w-full border-collapse text-left">
                                                        <thead>
                                                            <tr className="bg-gray-200 text-xs">
                                                                <th className="border px-2 py-1">Company Name</th>
                                                                <th className="border px-2 py-1">Contact Person</th>
                                                                <th className="border px-2 py-1">Contact Number</th>
                                                                <th className="border px-2 py-1">Email Address</th>
                                                                <th className="border px-2 py-1">Type of Client</th>
                                                                <th className="border px-2 py-1">Address</th>
                                                                <th className="border px-2 py-1">Area</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {jsonData.map((item, index) => (
                                                                <tr key={index} className="text-xs border">
                                                                    <td className="border px-2 py-1">{item.companyname}</td>
                                                                    <td className="border px-2 py-1">{item.contactperson}</td>
                                                                    <td className="border px-2 py-1">{item.contactnumber}</td>
                                                                    <td className="border px-2 py-1">{item.emailaddress}</td>
                                                                    <td className="border px-2 py-1">{item.typeclient}</td>
                                                                    <td className="border px-2 py-1">{item.address}</td>
                                                                    <td className="border px-2 py-1">{item.area}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <button className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-blue-900 hover:text-white transition" onClick={() => setShowForm(true)} >
                                                <CiSquarePlus size={16} /> Add Companies
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={exportToExcel} className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-orange-500 hover:text-white transition">
                                                    <CiExport size={16} /> Export
                                                </button>
                                                <button className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-green-800 hover:text-white transition" onClick={() => setShowImportForm(true)}>
                                                    <CiImport size={16} /> Import Account
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                            <h2 className="text-lg font-bold mb-2">Company Accounts</h2>
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
                                                filterTSA={filterTSA}
                                                setFilterTSA={setFilterTSA}
                                                tsaList={tsaList}
                                            />

                                            <UsersTable
                                                posts={currentPosts}
                                                handleEdit={handleEdit}
                                            />
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                setCurrentPage={setCurrentPage}
                                            />

                                            <div className="text-xs mt-2">
                                                Showing {indexOfFirstPost + 1} to{" "}
                                                {Math.min(indexOfLastPost, filteredAccounts.length)} of{" "}
                                                {filteredAccounts.length} entries
                                            </div>
                                        </div>
                                    </>
                                )}

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
                            </div>
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
