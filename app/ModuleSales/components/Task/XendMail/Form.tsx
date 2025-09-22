{/*
"use client";

import React, { useState } from "react";
import { BsSendCheck } from 'react-icons/bs';
import { MdOutlineCancel, MdAdd, MdRemove } from 'react-icons/md';

interface RecipientField {
  type: "CC" | "BCC" | "Reply-To" | "Followup-To";
  email: string;
}

interface FormProps {
  from: string;
  to: string;
  recipients?: RecipientField[];
  subject: string;
  body: string;
  setTo: (value: string) => void;
  setRecipients: (fields: RecipientField[]) => void;
  setSubject: (value: string) => void;
  setBody: (value: string) => void;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  sendEmail: (attachments: File[]) => void;
  onCancel?: () => void;
}

const MAX_FILE_SIZE_MB = 10;

const Form: React.FC<FormProps> = ({
  from, to, recipients = [], subject, body,
  setTo, setRecipients, setSubject, setBody,
  attachments, setAttachments, sendEmail, onCancel
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const filteredFiles = filesArray.filter(file => file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB);
    if (filteredFiles.length < filesArray.length) {
      alert(`Some files were larger than ${MAX_FILE_SIZE_MB}MB and were not added.`);
    }
    setAttachments(filteredFiles);
  };

  const handleSend = () => {
    sendEmail(attachments);
    setAttachments([]);
  };

  const handleCancel = () => {
    setTo("");
    setRecipients([]);
    setSubject("");
    setBody("");
    setAttachments([]);
    if (onCancel) onCancel();
  };

  const updateRecipient = (index: number, value: string) => {
    const updated = [...recipients];
    updated[index].email = value;
    setRecipients(updated);
  };

  const updateRecipientType = (index: number, type: RecipientField["type"]) => {
    const updated = [...recipients];
    updated[index].type = type;
    setRecipients(updated);
  };

  const addRecipientField = () => setRecipients([...recipients, { type: "CC", email: "" }]);
  const removeRecipientField = (index: number) => setRecipients(recipients.filter((_, i) => i !== index));

  return (
    <div className="mb-4 p-4 border rounded">
      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1">From:</label>
        <input type="text" className="w-full border-b px-2 py-2 text-xs" value={from} readOnly />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1">To:</label>
        <input type="email" className="w-full border-b px-2 py-2 text-xs" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1">Recipients:</label>
        {recipients.map((recip, index) => (
          <div key={index} className="flex gap-1 mb-1">
            <select
              className="border-b px-1 py-1 text-xs"
              value={recip.type}
              onChange={(e) => updateRecipientType(index, e.target.value as RecipientField["type"])}
            >
              <option value="CC">CC</option>
              <option value="BCC">BCC</option>
              <option value="Reply-To">Reply-To</option>
              <option value="Followup-To">Followup-To</option>
            </select>
            <input
              type="email"
              className="flex-1 border-b px-2 py-1 text-xs"
              value={recip.email}
              onChange={(e) => updateRecipient(index, e.target.value)}
            />
            <button type="button" onClick={() => removeRecipientField(index)} className="text-red-500">
              <MdRemove />
            </button>
          </div>
        ))}
        <button type="button" onClick={addRecipientField} className="text-blue-600 text-xs flex items-center gap-1">
          <MdAdd /> Add Recipient
        </button>
      </div>

      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1">Subject:</label>
        <input type="text" className="w-full border-b px-2 py-2 text-xs" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1">Body:</label>
        <textarea className="w-full border-b px-2 py-2 text-xs" rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1">Attachments (Max {MAX_FILE_SIZE_MB}MB each):</label>
        <input type="file" className="text-[10px]" multiple onChange={handleFileChange} />
        {attachments.length > 0 && (
          <ul className="text-[10px] mt-1">
            {attachments.map((file, idx) => (
              <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button className="bg-green-800 text-white px-3 py-2 rounded hover:bg-green-900 text-xs flex items-center gap-1" onClick={handleSend}>
          <BsSendCheck size={20}/> Send
        </button>
        <button className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 text-xs flex items-center gap-1" onClick={handleCancel}>
          <MdOutlineCancel size={20}/> Cancel
        </button>
      </div>
    </div>
  );
};
export default Form;

*/}
