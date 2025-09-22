"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ExcelJS from "exceljs";
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

    const [managerDetails, setManagerDetails] = useState<UserDetails | null>(null);
    const [headDetails, setHeadDetails] = useState<UserDetails | null>(null);
    const [fileContent, setFileContent] = useState<string[][]>([]); // rows of cells
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

    const today = new Date().toLocaleDateString();

    // 🔎 Fetch user by ReferenceID
    const fetchUserById = async (referenceId: string): Promise<UserDetails | null> => {
        if (!referenceId) return null;
        try {
            const res = await fetch(`/api/User/FetchById?referenceid=${referenceId}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data || null;
        } catch (err) {
            console.error("Failed to fetch user:", err);
            return null;
        }
    };

    // 📌 Load Manager & Head when form mounts
    useEffect(() => {
        (async () => {
            if (userDetails.Manager) {
                const mgr = await fetchUserById(userDetails.Manager);
                setManagerDetails(mgr);
            }
            if (userDetails.TSM) {
                const head = await fetchUserById(userDetails.TSM);
                setHeadDetails(head);
            }
        })();
    }, [userDetails.Manager, userDetails.TSM]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file); // ← store file for later use
        setLoading(true);

        try {
            if (file.name.endsWith(".csv")) {
                const text = await file.text();
                const rows = text.split("\n").map((row) => row.split(","));
                setFileContent(rows);
            } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(arrayBuffer);
                const worksheet = workbook.worksheets[0];

                const rows: string[][] = [];
                worksheet.eachRow((row) => {
                    const values: string[] = [];
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        const cellValue = cell.value;
                        if (cellValue == null) values.push("");
                        else if (
                            typeof cellValue === "string" ||
                            typeof cellValue === "number" ||
                            typeof cellValue === "boolean"
                        ) values.push(cellValue.toString());
                        else if (cellValue instanceof Date) values.push(cellValue.toLocaleDateString());
                        else if (typeof cellValue === "object" && "text" in cellValue && typeof cellValue.text === "string")
                            values.push(cellValue.text);
                        else values.push("");
                    });
                    rows.push(values);
                });
                setFileContent(rows);
            } else {
                alert("Unsupported file type. Use CSV or XLSX.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to read file.");
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!uploadedFile) return alert("Please upload a file first.");

        setLoading(true);
        try {
            const workbook = new ExcelJS.Workbook();

            // ----------------- Load uploaded file -----------------
            if (uploadedFile.name.endsWith(".csv")) {
                const text = await uploadedFile.text();
                const rows = text.split("\n").map((r) => r.split(","));
                const sheet = workbook.addWorksheet("Sheet1");
                rows.forEach((r) => sheet.addRow(r));
            } else {
                const buffer = await uploadedFile.arrayBuffer();
                await workbook.xlsx.load(buffer);
            }

            const worksheet = workbook.worksheets[0];

            // ----------------- Helper to find row by keyword -----------------
            const findRowByKeyword = (keyword: string) => {
                const cleanKeyword = keyword.toLowerCase().replace(/[:\s]/g, "");
                for (let i = 1; i <= worksheet.rowCount; i++) {
                    const row = worksheet.getRow(i);
                    let found = false;
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        if (cell.value) {
                            const cellText = cell.value.toString().toLowerCase().replace(/[:\s]/g, "");
                            if (cellText.includes(cleanKeyword)) found = true;
                        }
                    });
                    if (found) return row;
                }
                return null;
            };

            // ----------------- Transfer Header Info -----------------
            const headerMappings: { keyword: string; value: string }[] = [
                { keyword: "Reference No:", value: selectedQuote.quotationnumber },
                { keyword: "Date:", value: new Date().toLocaleDateString() },
                { keyword: "COMPANY NAME:", value: selectedQuote.companyname },
                { keyword: "ADDRESS:", value: selectedQuote.address },
                { keyword: "TEL NO:", value: selectedQuote.contactnumber },
                { keyword: "EMAIL ADDRESS:", value: selectedQuote.emailaddress },
                { keyword: "ATTENTION:", value: selectedQuote.contactperson },
                { keyword: "SUBJECT:", value: `${selectedQuote.companyname} - ${selectedQuote.contactperson}` },
            ];

            headerMappings.forEach(({ keyword, value }) => {
                const row = findRowByKeyword(keyword);
                if (row) {
                    // Reference No and Date go to Column F
                    if (keyword === "Reference No:" || keyword === "Date:") {
                        row.getCell(6).value = value; // Column F
                    } else {
                        // Everything else goes to Column B
                        row.getCell(2).value = value; // Column B
                    }
                }
            });

            // ----------------- Detect Product Table Header -----------------
            let productHeaderRow: ExcelJS.Row | null = null;
            for (let i = 1; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                let headerText = "";
                row.eachCell({ includeEmpty: true }, (cell) => {
                    if (cell.value != null) headerText += cell.value.toString().toLowerCase() + "|";
                });
                if (
                    headerText.includes("item no") &&
                    headerText.includes("qty") &&
                    headerText.includes("photo") &&
                    headerText.includes("description") &&
                    headerText.includes("unit price") &&
                    headerText.includes("total")
                ) {
                    productHeaderRow = row;
                    break;
                }
            }
            if (!productHeaderRow) throw new Error("Product table header not found.");

            // ----------------- Map Product Columns -----------------
            const colMap: Record<string, number> = {};
            productHeaderRow.eachCell((cell, colNumber) => {
                const value = cell.value?.toString().toLowerCase() || "";
                if (value.includes("item no")) colMap.itemNo = colNumber;
                if (value.includes("qty")) colMap.qty = colNumber;
                if (value.includes("photo")) colMap.photo = colNumber;
                if (value.includes("description")) colMap.description = colNumber;
                if (value.includes("unit price")) colMap.unitPrice = colNumber;
                if (value.includes("total")) colMap.total = colNumber;
            });

            // ----------------- Helper to fetch image URL as base64 -----------------
            const fetchImageAsBase64 = async (url: string): Promise<string> => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const dataUrl = reader.result as string;
                        resolve(dataUrl.split("base64,")[1]); // raw base64
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            };

            // ----------------- Insert Product Rows -----------------
            let insertRowNumber = productHeaderRow.number + 1;
            let grandTotal = 0;

            for (let idx = 0; idx < products.length; idx++) {
                const p = products[idx];
                const row = worksheet.getRow(insertRowNumber + idx);

                // ----------------- Item No & Qty -----------------
                row.getCell(colMap.itemNo!).value = idx + 1;
                row.getCell(colMap.itemNo!).font = { size: 10 };
                row.getCell(colMap.qty!).value = p.qty;
                row.getCell(colMap.qty!).font = { size: 10 };

                // ----------------- Handle Photo -----------------
                if (p.photo) {
                    let base64Image = "";
                    if (p.photo.startsWith("http")) base64Image = await fetchImageAsBase64(p.photo);
                    else if (p.photo.includes("base64,")) base64Image = p.photo.split("base64,")[1];
                    else base64Image = p.photo;

                    if (base64Image) {
                        const imageId = workbook.addImage({ base64: base64Image, extension: "png" });
                        worksheet.addImage(imageId, {
                            tl: { col: colMap.photo! - 1, row: insertRowNumber + idx - 1 },
                            ext: { width: 100, height: 100 },
                        });
                    }
                }

                // ----------------- Description -----------------
                const desc = p.tableText ? `${p.description}\n${p.tableText}` : p.description;
                const descCell = row.getCell(colMap.description!);
                descCell.value = desc;
                descCell.font = { size: 10 };
                descCell.alignment = { wrapText: true };
                row.height = Math.max(row.height ?? 15, desc.split("\n").length * 15);

                // ----------------- Unit Price & Total Amount -----------------
                row.getCell(colMap.unitPrice!).value = p.unitPrice;
                row.getCell(colMap.unitPrice!).font = { size: 10 };

                row.getCell(colMap.total!).value = p.total;
                row.getCell(colMap.total!).font = { size: 10 };

                grandTotal += p.total;
                row.commit();
            }

            // ----------------- Fill Grand Total -----------------
            const totalRowNumber = insertRowNumber + products.length;
            const totalRow = worksheet.getRow(totalRowNumber);
            totalRow.getCell(5).value = "Total Price"; // Optional: text in column E
            totalRow.getCell(6).value = grandTotal; // Column F
            totalRow.font = { bold: true, size: 10 };
            totalRow.commit();

            // ----------------- Insert Signatures Section -----------------
            // ----------------- Insert Signatures Section -----------------

            // Fill SALES REPRESENTATIVE section
            const repRow = findRowByKeyword("SALES REPRESENTATIVE");
            if (repRow) {
                const nameRow = worksheet.getRow(repRow.number - 1); // 👈 above row
                nameRow.getCell(3).value = `${userDetails.Firstname} ${userDetails.Lastname}`;
                nameRow.commit();

                const mobileRow = worksheet.getRow(repRow.number + 1);
                mobileRow.getCell(3).value = `${userDetails.ContactNumber || "-"}`;
                mobileRow.commit();

                const emailRow = worksheet.getRow(repRow.number + 2);
                emailRow.getCell(3).value = `${userDetails.Email || "-"}`;
                emailRow.commit();
            }

            // Fill SALES MANAGER section
            const mgrRow = findRowByKeyword("SALES MANAGER");
            if (mgrRow && headDetails) {
                const nameRow = worksheet.getRow(mgrRow.number - 1); // 👈 above row
                nameRow.getCell(3).value = `${headDetails.Firstname ?? ""} ${headDetails.Lastname ?? ""}`;
                nameRow.commit();

                const mobileRow = worksheet.getRow(mgrRow.number + 1);
                mobileRow.getCell(3).value = `${headDetails.ContactNumber || "-"}`;
                mobileRow.commit();

                const emailRow = worksheet.getRow(mgrRow.number + 2);
                emailRow.getCell(3).value = `${headDetails.Email || "-"}`;
                emailRow.commit();
            }

            // Fill SALES HEAD-B2B section
            const headRow = findRowByKeyword("SALES HEAD-B2B");
            if (headRow && managerDetails) {
                const nameRow = worksheet.getRow(headRow.number - 1); // 👈 above row
                nameRow.getCell(3).value = `${managerDetails.Firstname ?? ""} ${managerDetails.Lastname ?? ""}`;
                nameRow.commit();
            }


            // ----------------- Download Updated File -----------------
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Transferred_${uploadedFile.name.replace(/\..+$/, "")}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success("Data transferred successfully!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to transfer data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="border rounded p-4 bg-gray-50">
            <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                disabled={loading}
            />

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
            <div className="mt-4 text-xs space-y-1 border-t border-b pb-2 mt-4">
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
            <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
                {/* Left Column */}
                <div className="col-span-2 w-full pr-4 space-y-6">
                    <p className="italic font-semibold">Ecoshift Corporation</p>
                    <div>
                        <p className="font-semibold capitalize">
                            {userDetails.Firstname} {userDetails.Lastname}
                        </p>
                        <div className="border-t border-black w-full max-w-xs my-1"></div>
                        <p className="font-semibold">SALES REPRESENTATIVE</p>
                        <p>Mobile No: {userDetails.ContactNumber || "-"}</p>
                        <p>Email: {userDetails.Email || "-"}</p>
                    </div>

                    <div>
                        <p>Approved By:</p>
                        <p className="font-semibold mt-8 capitalize">
                            {headDetails
                                ? `${headDetails.Firstname} ${headDetails.Lastname}`
                                : ""}
                        </p>
                        <div className="border-t border-black w-full max-w-xs my-1"></div>
                        <p className="font-semibold">SALES MANAGER</p>
                        <p>Mobile No: {headDetails ? `${headDetails.ContactNumber}` : ""}</p>
                        <p>Email: {headDetails ? `${headDetails.Email}` : ""}</p>
                    </div>

                    <div>
                        <p>Noted By:</p>
                        <p className="font-semibold mt-8 capitalize">
                            {managerDetails
                                ? `${managerDetails.Firstname} ${managerDetails.Lastname}`
                                : ""}
                        </p>
                        <div className="border-t border-black w-full max-w-xs my-1"></div>
                        <p className="font-semibold">SALES HEAD B2B</p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-2 w-full pl-4 space-y-12 mt-8">
                    <div className="mt-8">
                        <div className="border-t border-black w-full max-w-sm my-1"></div>
                        <p>COMPANY AUTHORIZED REPRESENTATIVE</p>
                        <p>(PLEASE SIGN OVER PRINTED NAME)</p>
                    </div>

                    <div>
                        <div className="border-t border-black w-full max-w-sm my-1"></div>
                        <p>PAYMENT RELEASE DATE</p>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="mt-4">
                <button
                    type="button"
                    disabled={loading || !uploadedFile}
                    onClick={handleTransfer}
                    className={`px-4 py-2 rounded text-xs font-semibold shadow ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                >
                    {loading ? "Processing..." : "Transfer Data"}
                </button>
            </div>

        </form>
    );

};

export default Form;
