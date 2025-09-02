"use client";

import React from "react";

interface InboundCallProps {
    typecall: string;
    handleFormChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const InboundCall: React.FC<InboundCallProps> = ({ typecall, handleFormChange }) => {
    return (
        <div className="flex flex-col">
            <label className="font-semibold">Type <span className="text-[8px] text-green-700">* Required Fields</span></label>
            <select
                name="typecall"
                value={typecall}
                onChange={handleFormChange}
                className="border-b px-3 py-6 rounded text-xs"
                required
            >
                <option value="">Select Type</option>
                <option value="After Sales">After sales ( Warranty, Replacement, Certificates) </option>
                <option value="Delivery concern">Delivery concern</option>
                <option value="Accounting Concern">Accounting Concern</option>
                <option value="Technical / Product concern">Technical / Product concern</option>
                <option value="Request for Quotation">Request for Quotation</option>
                <option value="Inquiries">Inquiries</option>
                <option value="Follow Up Pending">Follow Up</option>
            </select>
        </div>
    );
};

export default InboundCall;
