"use client";

import React from "react";

interface InquiryModalProps {
    showModal: boolean;
    onClose: () => void;
    inquiry: any; // replace with your Inquiry type if available
    getElapsedTime: (date: string) => string;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
    showModal,
    onClose,
    inquiry,
    getElapsedTime,
}) => {
    if (!showModal || !inquiry) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-600 to-teal-500">
                    <h3 className="text-white font-semibold text-lg">Inquiry Details</h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition text-lg"
                    >
                        ✖
                    </button>
                </div>

                <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto text-xs text-gray-700">
                    <p>
                        <b>Company:</b> {inquiry.companyname}
                    </p>
                    <p>
                        <b>Contact:</b> {inquiry.contactperson}
                    </p>
                    <p>
                        <b>Number:</b> {inquiry.contactnumber}
                    </p>
                    <p>
                        <b>Email:</b> {inquiry.emailaddress}
                    </p>
                    <p>
                        <b>Inquiry:</b> {inquiry.inquiries}
                    </p>
                    <p>
                        <b>Wrap-up:</b> {inquiry.wrapup || "N/A"}
                    </p>
                    <p>
                        <b>Address:</b> {inquiry.address || "N/A"}
                    </p>
                    <p>
                        <b>Status:</b> {inquiry.status}
                    </p>
                    <p>
                        <b>Date Created:</b> {inquiry.date_created}
                    </p>
                    <p>
                        <b>Elapsed:</b> {getElapsedTime(inquiry.date_created)}
                    </p>
                </div>
                <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InquiryModal;
