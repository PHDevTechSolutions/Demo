"use client";

import React, { useState } from "react";

interface OutboundCallProps {
    typecall: string;
    callback: string;
    callstatus: string;
    handleFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
}

const OutboundCall: React.FC<OutboundCallProps> = ({
    typecall,
    callback,
    callstatus,
    handleFormChange,
}) => {
    const [showInput, setShowInput] = useState(false);

    const handleCallbackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const option = e.target.value;

        const today = new Date();
        let futureDate = new Date(today);

        if (option === "Pick a DateTime") {
            setShowInput(true);
            return;
        }

        setShowInput(false);

        switch (option) {
            case "Callback Tomorrow":
                futureDate.setDate(today.getDate() + 1);
                break;
            case "Callback After 3 Days":
                futureDate.setDate(today.getDate() + 3);
                break;
            case "Callback After a Week":
                futureDate.setDate(today.getDate() + 7);
                break;
            case "Callback After a Month":
                futureDate.setMonth(today.getMonth() + 1);
                break;
            default:
                return;
        }

        // Format as datetime-local
        futureDate.setHours(8, 0, 0, 0);
        const formattedDate = futureDate.toISOString().slice(0, 16);

        // 🔹 Force update callback, startdate, enddate
        handleFormChange({
            target: { name: "callback", value: formattedDate },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <>
            {/* 🔹 Callback */}
            <div className="flex flex-col">
                <label className="font-semibold">
                    Callback <span className="text-[8px] text-green-700">Optional</span>
                </label>
                <select
                    className="w-full px-3 py-6 border-b text-xs bg-white"
                    onChange={handleCallbackChange}
                >
                    <option value="">Select Callback</option>
                    <option value="Callback Tomorrow">Callback Tomorrow</option>
                    <option value="Callback After 3 Days">Callback After 3 Days</option>
                    <option value="Callback After a Week">Callback After a Week</option>
                    <option value="Callback After a Month">Callback After a Month</option>
                    <option value="Pick a DateTime">Pick a DateTime</option>
                </select>

                {showInput && (
                    <input
                        type="datetime-local"
                        name="callback"
                        value={callback}
                        onChange={handleFormChange}
                        className="w-full px-3 py-6 border rounded text-xs mt-2"
                    />
                )}
            </div>

            {/* 🔹 Call Status */}
            <div className="flex flex-col">
                <label className="font-semibold">
                    Call Status <span className="text-[8px] text-green-700">* Required Fields</span>
                </label>
                <select
                    name="callstatus"
                    value={callstatus}
                    onChange={handleFormChange}
                    className="w-full px-3 py-6 border-b text-xs capitalize bg-white"
                    required
                >
                    <option value="">Select Status</option>
                    <option value="Successful">Successful</option>
                    <option value="Unsuccessful">Unsuccessful</option>
                </select>
            </div>

            {/* 🔹 Type */}
            <div className="flex flex-col">
                <label className="font-semibold">
                    Type <span className="text-[8px] text-green-700">* Required Fields</span>
                </label>
                <select
                    name="typecall"
                    value={typecall}
                    onChange={handleFormChange}
                    className="w-full px-3 py-6 border-b text-xs capitalize bg-white"
                    required
                >
                    <option value="">Select Type</option>
                    {callstatus === "Successful" ? (
                        <>
                            <option value="No Requirements">No Requirements</option>
                            <option value="Waiting for Future Projects">
                                Waiting for Future Projects
                            </option>
                            <option value="With RFQ">With RFQ</option>
                        </>
                    ) : callstatus === "Unsuccessful" ? (
                        <>
                            <option value="Ringing Only">Ringing Only</option>
                            <option value="Cannot Be Reached">Cannot Be Reached</option>
                            <option value="Not Connected with the Company">
                                Not Connected with the Company
                            </option>
                        </>
                    ) : (
                        <>
                            <option value="Ringing Only">Ringing Only</option>
                            <option value="No Requirements">No Requirements</option>
                            <option value="Cannot Be Reached">Cannot Be Reached</option>
                            <option value="Not Connected with the Company">
                                Not Connected with the Company
                            </option>
                            <option value="Waiting for Future Projects">
                                Waiting for Future Projects
                            </option>
                        </>
                    )}
                </select>
            </div>
        </>
    );
};

export default OutboundCall;
