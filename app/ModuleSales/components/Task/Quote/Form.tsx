"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Table from "./Table";
import InformationSection from "./InformationSection";

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

interface UserDetails {
    ReferenceID: string;
    Firstname: string;
    Lastname: string;
    Manager: string;
    TSM: string;
    Role: string;
    profilePicture?: string;
    ContactNumber?: string;
    Email?: string;
}

interface FormProps {
    selectedQuote: QuoteItem;
    userDetails: UserDetails;
}

interface ShopifyProduct {
    sku: string;
    title: string;
    body_html: string | null;
    image?: { src: string } | null;
}

interface ProductRow {
    sku: string;
    description: string;
    tableText: string | null;
    photo?: string | null;
    qty: number;
    unitPrice: number;
    total: number;
}

// 🔎 Helper: Convert <table> → plain text
const extractTableAsText = (html: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector("table");

    if (!table) return null;

    let textRows: string[] = [];
    table.querySelectorAll("tr").forEach((tr) => {
        const cells = tr.querySelectorAll("td, th");
        if (cells.length >= 2) {
            const label = cells[0].textContent?.trim() || "";
            const value = cells[1].textContent?.trim() || "";
            if (label && value) textRows.push(`${label}: ${value}`);
        } else if (cells.length === 1) {
            const single = cells[0].textContent?.trim() || "";
            if (single) textRows.push(single);
        }
    });

    return textRows.length > 0 ? textRows.join("\n") : null;
};

const Form: React.FC<FormProps> = ({ selectedQuote, userDetails }) => {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(false);

    // 📦 Load products from Shopify
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/ModuleSales/Shopify/FetchProduct");
                const json = await res.json();

                if (!json.success) throw new Error(json.error);
                setShopifyProducts(json.data || []);
            } catch (err: any) {
                console.error(err);
                toast.error("Failed to load product titles from Shopify");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 🛠 Parse SKUs from projectcategory + match to Shopify
    useEffect(() => {
        if (!selectedQuote.projectcategory || shopifyProducts.length === 0) return;

        const skus = selectedQuote.projectcategory
            .replace(/[{}]/g, "")
            .split(",")
            .map((sku) => sku.trim().replace(/"/g, ""));

        const mapped: ProductRow[] = skus.map((sku) => {
            const match = shopifyProducts.find((p) => p.sku === sku);

            let tableText: string | null = null;
            if (match?.body_html) {
                tableText = extractTableAsText(match.body_html);
            }

            return {
                sku,
                description: match
                    ? `${match.title} | ${match.sku}`
                    : `SKU: ${sku} (No details found)`,
                tableText,
                photo: match?.image?.src ?? null,
                qty: 1,
                unitPrice: 0,
                total: 0,
            };
        });

        setProducts(mapped);
    }, [selectedQuote.projectcategory, shopifyProducts]);

    // 🔄 Handle Qty / Price Change
    const updateProduct = (
        index: number,
        field: "qty" | "unitPrice",
        value: number
    ) => {
        const updated = [...products];
        updated[index][field] = value;
        updated[index].total = updated[index].qty * updated[index].unitPrice;
        setProducts(updated);
    };

    // 💰 Compute Grand Total
    const grandTotal = products.reduce((sum, p) => sum + p.total, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Form submitted successfully!");
    };

    const today = new Date().toLocaleDateString();

    return (
        <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50">
            {/* Header Image */}
            <div>
                <img
                    src="/quote-header.png"
                    alt="Quote Header"
                    className="w-full object-cover"
                />
            </div>

            {/* Reference No & Date */}
            <div className="mt-2 text-right text-xs space-y-1">
                <div>
                    Reference No:{" "}
                    <span className="font-semibold">
                        {selectedQuote.quotationnumber}
                    </span>
                </div>
                <div>
                    Date:{" "}
                    <span className="font-semibold">
                        {today}
                    </span>
                </div>
            </div>

            {/* Company Info */}
            <div className="mt-4 text-xs space-y-1 border-t border-b pb-2">
                <div>
                    Company Name:{" "}
                    <span className="font-semibold text-center inline-block w-full">
                        {selectedQuote.companyname}
                    </span>
                </div>
                <div>
                    Address:{" "}
                    <span className="font-semibold text-center inline-block w-full uppercase">
                        {selectedQuote.address}
                    </span>
                </div>
                <div>
                    Tel No:{" "}
                    <span className="font-semibold text-center inline-block w-full">
                        {selectedQuote.contactnumber}
                    </span>
                </div>
                <div>
                    Email Address:{" "}
                    <span className="font-semibold text-center inline-block w-full">
                        {selectedQuote.emailaddress}
                    </span>
                </div>
            </div>

            {/* Attention & Subject */}
            <div className="mt-2 text-xs border-b pb-2">
                <div>
                    Attention:{" "}
                    <span className="font-semibold text-center inline-block w-full uppercase">
                        {selectedQuote.contactperson}
                    </span>
                </div>
                <div>
                    Subject:{" "}
                    <span className="font-semibold text-center inline-block w-full uppercase">
                        {selectedQuote.companyname} - {selectedQuote.contactperson}
                    </span>
                </div>
            </div>

            <Table
                products={products}
                updateProduct={updateProduct}
                grandTotal={grandTotal}
            />

            {/* Information Section */}
            <InformationSection />

            {/* ✅ Two Column Signatures Section */}
            <div className="mt-6 grid grid-cols-4 gap-6 text-xs border-t">
                {/* Left Column */}
                <div className="space-y-6">
                    <p>Ecoshift Corporation</p>
                    <div>
                        <p className="font-semibold">
                            {userDetails.Firstname} {userDetails.Lastname}
                        </p>
                        <div className="border-t border-black w-48 my-1"></div>
                        <p>SALES REPRESENTATIVE</p>
                        <p>Mobile No: {userDetails.ContactNumber || "-"}</p>
                        <p>Email: {userDetails.Email || "-"}</p>
                    </div>

                    <div>
                        <p>Approved By:</p>
                        <div className="border-t border-black w-48 my-1 mt-8"></div>
                        <p>SALES MANAGER</p>
                        <p>Mobile No:</p>
                        <p>Email:</p>
                    </div>

                    <div>
                        <p>Noted By:</p>
                        <div className="border-t border-black w-48 my-1 mt-8"></div>
                        <p>SALES HEAD B2B</p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div>
                        <div className="border-t border-black w-64 my-1"></div>
                        <p>COMPANY AUTHORIZED REPRESENTATIVE</p>
                        <p>(PLEASE SIGN OVER PRINTED NAME)</p>
                    </div>

                    <div>
                        <div className="border-t border-black w-64 my-1"></div>
                        <p>PAYMENT RELEASE DATE</p>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded text-xs font-semibold shadow ${loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {loading ? "Loading..." : "Export to Excel"}
                </button>
            </div>
        </form>
    );

};

export default Form;
