import React, { useState } from "react";

interface InboundFieldsProps {
    callback: string;
    setcallback: (val: string) => void;
    callstatus: string;
    setcallstatus: (val: string) => void;
    typecall: string;
    settypecall: (val: string) => void;
}

const InboundFields: React.FC<InboundFieldsProps> = ({
    callback,
    setcallback,
    typecall,
    settypecall,
}) => {
    
    return (
        <>
            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                <label className="block text-xs font-bold mb-2">Type of Call</label>
                <select
                    value={typecall}
                    onChange={(e) => settypecall(e.target.value)}
                    className="w-full px-3 py-2 border-b text-xs capitalize bg-white"
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
        </>
    );
};

export default InboundFields;
