"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import AddAccountForm from "../../../components/AutomatedTickets/AddActivityForm";
import SearchFilters from "../../../components/AutomatedTickets/SearchFilters";
import AccountsTable from "../../../components/AutomatedTickets/ActivityTable";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { CiCirclePlus, CiExport } from "react-icons/ci";
import ExcelJS from "exceljs";

const ActivityPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editPost, setEditPost] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setselectedStatus] = useState("");
    const [salesAgent, setSalesAgent] = useState("");
    const [TicketReceived, setTicketReceived] = useState("");
    const [TicketEndorsed, setTicketEndorsed] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showAccessModal, setShowAccessModal] = useState(false);

    // ✅ Fetch activity list
    const fetchActivity = async () => {
        try {
            const response = await fetch("/api/ModuleCSR/Monitorings/FetchActivity");
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            toast.error("Error fetching activities.");
            console.error("Error fetching activities:", error);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, []);

    // ✅ Update status
    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await fetch("/api/ModuleCSR/Monitorings/UpdateStatus", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, Status: newStatus }),
            });

            if (response.ok) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === id ? { ...p, Status: newStatus } : p
                    )
                );
                toast.success("Status updated successfully.");
            } else {
                const err = await response.json();
                toast.error(err.error || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Failed to update status.");
            console.error("Error updating status:", error);
        }
    };

    // ✅ Update remarks
    const handleRemarksUpdate = async (id: string, newRemarks: string) => {
        try {
            const response = await fetch("/api/ModuleCSR/Monitorings/UpdateRemarks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, Remarks: newRemarks }),
            });

            if (response.ok) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === id ? { ...p, Remarks: newRemarks } : p
                    )
                );
                toast.success("Remarks updated successfully.");
            } else {
                const err = await response.json();
                toast.error(err.error || "Failed to update remarks.");
            }
        } catch (error) {
            toast.error("Failed to update remarks.");
            console.error("Error updating remarks:", error);
        }
    };

    // ✅ Filter posts based on role & search
    // ✅ Filter posts based on role & search
    const filteredAccounts = (posts: any[], user: any) => {
        if (!user) return [];

        return posts.filter((post) => {
            const matchesSearch =
                post.CompanyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.TicketReferenceNumber?.includes(searchTerm) ||
                post.ContactNumber?.includes(searchTerm);

            const matchesStatus = selectedStatus
                ? post.Status?.includes(selectedStatus)
                : true;

            const matchesSalesAgent = salesAgent
                ? post.SalesAgent?.toLowerCase().includes(salesAgent.toLowerCase())
                : true;

            const postDate = post?.createdAt ? new Date(post.createdAt) : null;
            let isWithinRange = true;

            if (startDate && postDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                isWithinRange = postDate >= start;
            }

            if (endDate && postDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                isWithinRange = isWithinRange && postDate <= end;
            }

            // ✅ Role-based filtering logic
            if (user.Role === "Super Admin") {
                return matchesSearch && matchesStatus && matchesSalesAgent && isWithinRange;
            } else if (user.Role === "Admin") {
                return (
                    post.Role === "Staff" &&
                    matchesSearch &&
                    matchesStatus &&
                    matchesSalesAgent &&
                    isWithinRange
                );
            } else if (user.Role === "Staff") {
                return (
                    (post.ReferenceID === user.ReferenceID || post.userName === user.userName) &&
                    matchesSearch &&
                    matchesStatus &&
                    matchesSalesAgent &&
                    isWithinRange
                );
            }

            return false;
        });
    };

    // ✅ Export Excel
    const exportToExcel = (data: any[]) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Automated Tickets");

        worksheet.columns = [
            { header: 'CSR Agent', key: 'userName', width: 25 },
            { header: 'Ticket Reference Number', key: 'TicketReferenceNumber', width: 25 },
            { header: 'Ticket Received', key: 'TicketReceived', width: 25 },
            { header: 'Ticket Endorsed', key: 'TicketEndorsed', width: 25 },
            { header: 'Company Name', key: 'CompanyName', width: 30 },
            { header: 'Customer Name', key: 'CustomerName', width: 30 },
            { header: 'Contact Number', key: 'ContactNumber', width: 20 },
            { header: 'Email Address', key: 'Email', width: 30 },
            { header: 'Gender', key: 'Gender', width: 15 },
            { header: 'Client Segment', key: 'CustomerSegment', width: 20 },
            { header: 'City Address', key: 'CityAddress', width: 25 },
            { header: 'Traffic', key: 'Traffic', width: 15 },
            { header: 'Channel', key: 'Channel', width: 15 },
            { header: 'Wrap-Up', key: 'WrapUp', width: 15 },
            { header: 'Source', key: 'Source', width: 20 },
            { header: 'SO Number', key: 'SONumber', width: 20 },
            { header: 'SO Amount', key: 'Amount', width: 15 },
            { header: 'QTY Sold', key: 'QtySold', width: 10 },
            { header: 'Quotation Number', key: 'QuotationNumber', width: 15 },
            { header: 'Quotation Amount', key: 'QuotationAmount', width: 15 },
            { header: 'Customer Type', key: 'CustomerType', width: 20 },
            { header: 'Customer Status', key: 'CustomerStatus', width: 20 },
            { header: 'Status', key: 'Status', width: 15 },
            { header: 'Department', key: 'Department', width: 20 },
            { header: 'Sales Manager', key: 'SalesManager', width: 25 },
            { header: 'Sales Agent', key: 'SalesAgent', width: 25 },
            { header: 'Remarks', key: 'Remarks', width: 30 },
        ];

        data.forEach((p) => worksheet.addRow(p));

        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "AutomatedTickets.xlsx";
            link.click();
        });
    };

    const handleEdit = (post: any) => {
        setEditPost(post);
        setShowForm(true);
    };

    const confirmDelete = (postId: string) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!postToDelete) return;
        try {
            const response = await fetch(`/api/ModuleCSR/Monitorings/DeleteActivity`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: postToDelete }),
            });

            if (response.ok) {
                setPosts(posts.filter((p) => p._id !== postToDelete));
                toast.success("Account deleted successfully.");
            } else {
                toast.error("Failed to delete account.");
            }
        } catch (error) {
            toast.error("Failed to delete account.");
            console.error("Error deleting account:", error);
        } finally {
            setShowDeleteModal(false);
            setPostToDelete(null);
        }
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => {
                        // ✅ Wait until user is fully loaded
                        if (!user?.ReferenceID) {
                            return (
                                <div className="flex justify-center items-center py-10 text-gray-500 text-sm">
                                    Loading user details...
                                </div>
                            );
                        }

                        const visibleAccounts = filteredAccounts(posts, user);

                        return (
                            <div className="container mx-auto p-4 relative">
                                <div className="grid grid-cols-1">
                                    {showForm ? (
                                        <AddAccountForm
                                            onCancel={() => {
                                                setShowForm(false);
                                                setEditPost(null);
                                            }}
                                            refreshPosts={fetchActivity}
                                            userName={user.userName}
                                            userDetails={{
                                                id: editPost ? editPost.UserId : user.id,
                                                Role: user.Role,
                                                ReferenceID: user.ReferenceID,
                                            }}
                                            editPost={editPost}
                                        />
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-4">
                                                <button
                                                    className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-blue-900 hover:text-white transition"
                                                    onClick={() => setShowForm(true)}
                                                >
                                                    <CiCirclePlus size={20} /> Add Ticket
                                                </button>

                                                <button
                                                    onClick={() => exportToExcel(visibleAccounts)}
                                                    className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-orange-500 hover:text-white transition"
                                                >
                                                    <CiExport size={16} /> Export
                                                </button>
                                            </div>

                                            <h2 className="text-lg font-bold mb-2">Automated Tickets</h2>
                                            <p className="text-xs mb-4">
                                                This section provides an overview of ticket management, including the creation of new tickets and
                                                a list of endorsed, closed, and open tickets. It allows filtering based on various criteria to help
                                                track and manage ticket statuses efficiently.
                                            </p>

                                            <div className="mb-4 p-4 bg-white shadow-md rounded-lg text-gray-900">
                                                <SearchFilters
                                                    searchTerm={searchTerm}
                                                    setSearchTerm={setSearchTerm}
                                                    selectedStatus={selectedStatus}
                                                    setselectedStatus={setselectedStatus}
                                                    salesAgent={salesAgent}
                                                    setSalesAgent={setSalesAgent}
                                                    TicketReceived={TicketReceived}
                                                    setTicketReceived={setTicketReceived}
                                                    TicketEndorsed={TicketEndorsed}
                                                    setTicketEndorsed={setTicketEndorsed}
                                                    startDate={startDate}
                                                    setStartDate={setStartDate}
                                                    endDate={endDate}
                                                    setEndDate={setEndDate}
                                                />

                                                <AccountsTable
                                                    posts={visibleAccounts}
                                                    handleEdit={handleEdit}
                                                    handleDelete={confirmDelete}
                                                    handleStatusUpdate={handleStatusUpdate}
                                                    handleRemarksUpdate={handleRemarksUpdate}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {showDeleteModal && (
                                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                            <div className="bg-white p-4 rounded shadow-lg">
                                                <h2 className="text-xs font-bold mb-4">Confirm Deletion</h2>
                                                <p className="text-xs">Are you sure you want to delete this account?</p>
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        className="bg-red-500 text-white text-xs px-4 py-2 rounded mr-2"
                                                        onClick={handleDelete}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        className="bg-gray-300 text-xs px-4 py-2 rounded"
                                                        onClick={() => setShowDeleteModal(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <ToastContainer className="text-xs" autoClose={1000} />
                                </div>
                            </div>
                        );
                    }}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ActivityPage;
