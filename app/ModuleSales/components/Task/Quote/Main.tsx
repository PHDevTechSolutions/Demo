"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Form from "./Form";

interface UserDetails {
    ReferenceID: string;
    Firstname: string;
    Lastname: string;
    Manager: string;
    TSM: string;
    Role: string;
    ContactNumber: string;
    profilePicture?: string;
}

interface QuoteItem {
    id: number;
    referenceid: string;
    manager: string;
    tsm: string;
    companyname: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    address: string;
    quotationnumber: string;
    projectcategory: string;
    quotationamount: string;
}

interface QuoteProps {
    userDetails: UserDetails;
}

const Quote: React.FC<QuoteProps> = ({ userDetails }) => {
    const [searchValue, setSearchValue] = useState("");
    const [results, setResults] = useState<QuoteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
    const [showForm, setShowForm] = useState(false);

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            toast.error("Please enter a quotation number");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `/api/ModuleSales/Task/ActivityPlanner/FetchQuote?referenceid=${userDetails.ReferenceID}`
            );
            if (!res.ok) throw new Error("Failed to fetch data");

            const { data } = await res.json();

            // 🚀 Exact match na lang, walang lowercase
            const filtered = (data || []).filter(
                (q: QuoteItem) => q.quotationnumber === searchValue
            );

            if (filtered.length === 0) {
                toast.info("No matching quotation found");
            }

            setResults(filtered);
        } catch (err: any) {
            toast.error(err.message || "Error while fetching quotations");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white p-4">
            <h2 className="text-lg font-semibold text-black mb-2">Quotation</h2>
            <p className="text-sm text-gray-500 mb-4">
                Search quotation numbers and generate activity forms.
            </p>

            {/* 🔍 Search bar */}
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Enter Quotation Number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded text-xs w-full focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-semibold shadow"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {/* 📋 Results */}
            {results.length > 0 && (
                <div className="border rounded p-3 mb-4 bg-gray-50">
                    <h3 className="font-semibold text-xs mb-2">Results:</h3>
                    <ul className="space-y-2">
                        {results.map((q) => (
                            <li
                                key={q.id}
                                onClick={() => setSelectedQuote(q)}
                                className={`p-2 rounded cursor-pointer border ${selectedQuote?.id === q.id
                                    ? "bg-blue-100 border-blue-400"
                                    : "bg-white hover:bg-gray-100"
                                    }`}
                            >
                                <p className="text-sm font-medium">
                                    Quotation #: {q.quotationnumber}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {q.companyname}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 🖱 Generate button */}
            {selectedQuote && !showForm && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-semibold shadow"
                    >
                        Generate
                    </button>
                </div>
            )}

            {/* 📑 Form Component */}
            {showForm && selectedQuote &&
                <Form
                    selectedQuote={selectedQuote}
                    userDetails={userDetails}
                />}

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
    );
};

export default Quote;
