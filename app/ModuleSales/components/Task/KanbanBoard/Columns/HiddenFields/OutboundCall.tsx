"use client";

import React, { useState, useEffect } from "react";

interface OutboundCallProps {
    typecall: string;
    callback: string;
    callstatus: string;
    followup_date: string;
    site_visit_date: string;
    handleFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
}

const OutboundCall: React.FC<OutboundCallProps> = ({
    typecall,
    callback,
    callstatus,
    followup_date,
    site_visit_date,
    handleFormChange,
}) => {
    const [showInput, setShowInput] = useState(false);
    const formatDateTimeLocal = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
            date.getDate()
        )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

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

        futureDate.setHours(8, 0, 0, 0);
        const formattedDate = formatDateTimeLocal(futureDate);

        handleFormChange({
            target: { name: "callback", value: formattedDate },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    useEffect(() => {
        let daysToAdd = 0;
        let minutesToAdd = 0;

        if (!typecall) {
            handleFormChange({
                target: { name: "followup_date", value: "" },
            } as React.ChangeEvent<HTMLInputElement>);
            return;
        }

        if (typecall === "Ringing Only") {
            daysToAdd = 10;
        } else if (typecall === "No Requirements") {
            daysToAdd = 15;
        } else if (typecall === "Cannot Be Reached") {
            daysToAdd = 3;
        } else if (typecall === "Not Connected with the Company") {
            minutesToAdd = 15;
        } else if (typecall === "Waiting for Future Projects") {
            daysToAdd = 30;
        }

        if (daysToAdd > 0 || minutesToAdd > 0) {
            const today = new Date();
            if (daysToAdd > 0) today.setDate(today.getDate() + daysToAdd);
            if (minutesToAdd > 0) today.setMinutes(today.getMinutes() + minutesToAdd);

            const formattedDate = formatDateTimeLocal(today);

            handleFormChange({
                target: { name: "followup_date", value: formattedDate },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    }, [typecall, handleFormChange]);


    return (
        <>
            {/* ✅ Combined Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 🔹 Callback Section */}
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
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full px-3 py-6 border rounded text-xs mt-2"
                        />
                    )}
                </div>

                {/* 🔹 Scheduled Site Visit Section */}
                <div className="flex flex-col">
                    <label className="font-semibold">
                        Scheduled Site Visit{" "}
                        <span className="text-[8px] text-green-700">* Optional</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="site_visit_date"
                        value={site_visit_date || ""}
                        onChange={handleFormChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="border-b px-3 py-6 rounded text-xs"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="font-semibold">
                    Call Status{" "}
                    <span className="text-[8px] text-green-700">* Required Fields</span>
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

            <div className="flex flex-col">
                <label className="font-semibold">
                    Follow Up Date{" "}
                    <span className="text-[8px] text-green-700">* Required Fields</span>
                </label>
                <input
                    type="datetime-local"
                    name="followup_date"
                    value={followup_date || ""}
                    onChange={handleFormChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="border-b px-3 py-6 rounded text-xs"
                    required
                />
            </div>
        </>
    );
};

export default OutboundCall;
