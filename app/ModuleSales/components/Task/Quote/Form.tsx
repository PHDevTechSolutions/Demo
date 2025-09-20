"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

interface FormProps {
    selectedQuote: QuoteItem;
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
    tableText: string | null; // ✅ plain text version of table
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

const Form: React.FC<FormProps> = ({ selectedQuote }) => {
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
                description: match ? `${match.title} | ${match.sku}` : `SKU: ${sku} (No details found)`,
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
    const updateProduct = (index: number, field: "qty" | "unitPrice", value: number) => {
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

    return (
        <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50">
            <h3 className="font-semibold mb-3 text-sm">Generate Activity</h3>

            {/* Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                <div>
                    <label className="font-semibold text-xs">Quotation #</label>
                    <input
                        type="text"
                        value={selectedQuote.quotationnumber}
                        readOnly
                        className="border px-2 py-1 rounded w-full text-sm bg-gray-100"
                    />
                </div>
                <div>
                    <label className="font-semibold text-xs">Company</label>
                    <input
                        type="text"
                        value={selectedQuote.companyname}
                        readOnly
                        className="border px-2 py-1 rounded w-full text-sm bg-gray-100"
                    />
                </div>
            </div>

            {/* 📝 Items Table */}
            <div className="overflow-x-auto">
                <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 text-xs">Item No</th>
                            <th className="border px-2 py-1 text-xs">Qty</th>
                            <th className="border px-2 py-1 text-xs">Photo</th>
                            <th className="border px-2 py-1 text-xs">Product Description</th>
                            <th className="border px-2 py-1 text-xs">Unit Price</th>
                            <th className="border px-2 py-1 text-xs">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((prod, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 py-1 text-center">{idx + 1}</td>
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="number"
                                        min="1"
                                        value={prod.qty}
                                        onChange={(e) =>
                                            updateProduct(idx, "qty", parseInt(e.target.value) || 0)
                                        }
                                        className="w-16 border rounded px-1 text-sm text-center"
                                    />
                                </td>
                                <td className="border px-2 py-1 text-center">
                                    {prod.photo ? (
                                        <img
                                            src={prod.photo}
                                            alt={prod.description}
                                            className="h-40 w-40 object-cover rounded mx-auto"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No image</span>
                                    )}
                                </td>
                                <td className="border px-2 py-1 align-top text-xs whitespace-pre-line">
                                    {/* Always show product title first */}
                                    <div className="font-semibold">{prod.description}</div>

                                    {/* Then show extracted table details if available */}
                                    {prod.tableText && (
                                        <div className="mt-1">{prod.tableText}</div>
                                    )}
                                </td>

                                <td className="border px-2 py-1 text-right">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={prod.unitPrice}
                                        onChange={(e) =>
                                            updateProduct(idx, "unitPrice", parseFloat(e.target.value) || 0)
                                        }
                                        className="w-24 border rounded px-1 text-sm text-right"
                                    />
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {prod.total.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-semibold">
                            <td colSpan={5} className="border px-2 py-1 text-right">
                                Grand Total:
                            </td>
                            <td className="border px-2 py-1 text-right">
                                {grandTotal.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Submit */}
            <div className="mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded text-sm font-semibold shadow ${loading
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {loading ? "Loading..." : "Submit"}
                </button>
            </div>
        </form>
    );
};

export default Form;
