"use client";

import React from "react";

interface ProductRow {
    sku: string;
    description: string;
    tableText: string | null;
    photo?: string | null;
    qty: number;
    unitPrice: number;
    total: number;
}

interface TableProps {
    products: ProductRow[];
    updateProduct: (index: number, field: "qty" | "unitPrice", value: number) => void;
    grandTotal: number;
    quotationamount: string;
}

const Table: React.FC<TableProps> = ({ products, updateProduct, grandTotal }) => {
    return (
        <div className="overflow-x-auto mt-4">
            <span className="text-xs">
                We are pleased to offer you the following products for consideration:
            </span>
            <table className="w-full text-sm bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border-b px-2 py-1 text-xs">Item No</th>
                        <th className="border-b px-2 py-1 text-xs">Qty</th>
                        <th className="border-b px-2 py-1 text-xs">Photo</th>
                        <th className="border-b px-2 py-1 text-xs">Product Description</th>
                        <th className="border-b px-2 py-1 text-xs">Unit Price</th>
                        <th className="border-b px-2 py-1 text-xs">Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((prod, idx) => (
                        <tr key={idx}>
                            <td className="border-b px-2 py-1 text-center">{idx + 1}</td>
                            <td className="border-b px-2 py-1 text-center">
                                <input
                                    type="number"
                                    min="1"
                                    value={prod.qty}
                                    onChange={(e) =>
                                        updateProduct(idx, "qty", parseInt(e.target.value) || 0)
                                    }
                                    className="w-16 border rounded px-1 text-xs text-center"
                                />
                            </td>
                            <td className="border-b px-2 py-1 text-center">
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
                            <td className="border-b px-2 py-1 align-top text-xs whitespace-pre-line">
                                <div className="font-semibold">{prod.description}</div>
                                {prod.tableText && <div className="mt-1">{prod.tableText}</div>}
                            </td>
                            <td className="border-b px-2 py-1 text-right">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={prod.unitPrice}
                                    onChange={(e) =>
                                        updateProduct(
                                            idx,
                                            "unitPrice",
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    className="w-24 border rounded px-1 text-xs text-right"
                                />
                            </td>
                            <td className="border-b px-2 py-1 text-right">
                                {prod.total.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 font-semibold text-xs">
                        {/* Left side: Radio buttons */}
                        <td colSpan={4} className="border-b px-2 py-2">
                            <div className="flex items-center space-x-4">
                                <span>Choose Once:</span>
                                <label className="flex items-center space-x-1">
                                    <input type="radio" name="vatOption" value="inc" />
                                    <span>Vat Inc</span>
                                </label>
                                <label className="flex items-center space-x-1">
                                    <input type="radio" name="vatOption" value="exe" />
                                    <span>Vat Exe</span>
                                </label>
                                <label className="flex items-center space-x-1">
                                    <input type="radio" name="vatOption" value="zero" />
                                    <span>Zero-Rated</span>
                                </label>
                            </div>
                        </td>

                        {/* Right side: Total price */}
                        <td colSpan={2} className="border-b px-2 py-1 text-right">
                            Total Price:{" "}
                            <span className="font-semibold">{grandTotal.toFixed(2)}</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default Table;
