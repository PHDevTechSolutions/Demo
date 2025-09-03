"use client";

import React from "react";

interface FormProps {
    from: string;
    to: string;
    subject: string;
    body: string;
    setTo: (value: string) => void;
    setSubject: (value: string) => void;
    setBody: (value: string) => void;
    sendEmail: () => void;
}

const Form: React.FC<FormProps> = ({ from, to, subject, body, setTo, setSubject, setBody, sendEmail }) => {
    return (
        <div className="mb-4 p-4 border rounded bg-gray-50">
            <div className="mb-2">
                <label className="block text-xs font-semibold mb-1">From:</label>
                <input type="text" className="w-full border px-2 py-1 text-sm rounded" value={from} readOnly />
            </div>
            <div className="mb-2">
                <label className="block text-xs font-semibold mb-1">To:</label>
                <input type="email" className="w-full border px-2 py-1 text-sm rounded" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="mb-2">
                <label className="block text-xs font-semibold mb-1">Subject:</label>
                <input type="text" className="w-full border px-2 py-1 text-sm rounded" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="mb-2">
                <label className="block text-xs font-semibold mb-1">Body:</label>
                <textarea className="w-full border px-2 py-1 text-sm rounded h-24" value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <button
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                onClick={sendEmail}
            >
                Send
            </button>
        </div>
    );
};

export default Form;
