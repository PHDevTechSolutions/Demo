"use client";

import React, { useEffect, useState } from "react";
import FBMarketPlace from "../HiddenFields/FBMarketPlace";
import InboundCall from "../HiddenFields/InboundCall";
import OutboundCall from "../HiddenFields/OutboundCall";
import QuotationPreparation from "../HiddenFields/QuotationPreparation";
import SalesOrderPreparation from "../HiddenFields/SalesOrderPreparation";
import Delivered from "../HiddenFields/Delivered";
//import SurveyModal from "./SurveyModal";
import { MdEdit, MdOutlineClose } from "react-icons/md";

interface ProgressFormProps {
  formData: {
    startdate: string;
    enddate: string;
    activitystatus: string;
    source: string;
    typeactivity: string;
    remarks: string;
    typecall: string;
    sonumber: string;
    soamount: string;
    callstatus: string;
    callback: string;
    quotationnumber: string;
    quotationamount: string;
    projectname: string;
    projectcategory: string[];
    projecttype: string;
    paymentterm: string;
    actualsales: string;
    deliverydate: string;
    followup_date: string;
    drnumber: string;
    emailaddress: string;
    contactnumber?: string;
  };
  handleFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  handleProjectCategoryChange: (selected: { value: string; label: string }[] | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  companyName?: string;
}

const getFormattedTimestamp = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Manila",
  });
};

const formatElapsed = (start: string) => {
  if (!start) return "0s";

  const startDate = new Date(start);
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

const ProgressForm: React.FC<ProgressFormProps> = ({
  formData,
  handleFormChange,
  handleFormSubmit,
  onClose,
  handleProjectCategoryChange,
  setFormData,
  companyName,
}) => {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [elapsed, setElapsed] = useState("0s");
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    if (!formData.startdate) {
      setFormData((prev: any) => ({
        ...prev,
        startdate: getFormattedTimestamp(),
      }));
    }
  }, []);

  // ✅ update enddate every second + update elapsed badge
  useEffect(() => {
    const interval = setInterval(() => {
      setFormData((prev: any) => ({
        ...prev,
        enddate: getFormattedTimestamp(),
      }));
      if (formData.startdate) {
        setElapsed(formatElapsed(formData.startdate));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [formData.startdate]);

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummaryModal(true); // show modal first
  };

  const handleProceed = () => {
    setShowSummaryModal(false);
    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
    handleFormSubmit(fakeEvent);
  };

  // ➕ detect kapag Outbound Calls napili, buksan ang modal
  useEffect(() => {
    if (formData.typeactivity === "Outbound calls") {
      setShowOutboundModal(true);
    }
  }, [formData.typeactivity]);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg border-t z-[9999] max-h-[70vh] overflow-y-auto">
      {/* ⏱️ Real-time Elapsed Time Badge */}
      {formData.startdate && (
        <div className="absolute top-2 right-2">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow animate-pulse">
            ⏱ {elapsed}
          </span>
        </div>
      )}

      {companyName && (
        <h2 className="text-xs font-bold text-left">
          <span className="text-black">Edit:</span> {companyName}
        </h2>
      )}

      <form onSubmit={handleSaveClick} className="space-y-4 text-xs">
        <input type="hidden" name="startdate" value={formData.startdate} readOnly />
        <input type="hidden" name="enddate" value={formData.enddate} readOnly />

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col mt-4">
            <label className="font-semibold">
              Source <span className="text-[8px] text-red-700">* Required Fields</span>
            </label>
            <div className="flex flex-col">
              <select
                name="source"
                value={formData.source}
                onChange={handleFormChange}
                className="border-b px-3 py-6 rounded text-xs"
                required
              >
                <option value="">Select Source</option>
                <option value="Existing Client">Existing Client</option>
                <option value="CSR Inquiry">CSR Inquiry</option>
                <option value="Outbound - Follow-up">Outbound - Follow-up</option>
                <option value="Outbound - Touchbase">Outbound - Touchbase</option>
                <option value="Government">Government</option>
                <option value="Philgeps- Website">Philgeps- Website</option>
                <option value="Philgeps">Philgeps</option>
                <option value="Distributor">Distributor</option>
                <option value="Modern Trade">Modern Trade</option>
                <option value="Facebook Marketplace">Facebook Marketplace</option>
                <option value="Walk-in / Showroom">Walk-in / Showroom</option>
              </select>

              {/* ✅ Span description with emoji + color */}
              {formData.source && (
                <span
                  className={`flex items-center gap-1 mt-1 text-[11px] italic ${formData.source === "Outbound - Touchbase"
                      ? "text-green-600"
                      : formData.source === "Existing Client"
                        ? "text-orange-500"
                        : "text-gray-500"
                    }`}
                >
                  {formData.source === "Outbound - Touchbase" ? (
                    <>
                      ✅ Recommended to appear on Dashboard Outbound Touchbase section.
                    </>
                  ) : formData.source === "Existing Client" ? (
                    <>
                      ⚠️ Not recommended to view on Dashboard Touchbase section. It also appears on Source Breakdown.
                    </>
                  ) : (
                    <>
                      ℹ️ Appears on Source Breakdown section.
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col mt-4">
            <label className="font-semibold">
              Type of Activity <span className="text-[8px] text-red-700">* Required Fields</span>
            </label>
            <select
              name="typeactivity"
              value={formData.typeactivity}
              onChange={handleFormChange}
              className="border border-dashed bg-orange-100 px-3 py-6 rounded text-xs"
            >
              <option value="">Select Activity</option>
              <option value="Admin- Supplier Accreditation">Admin- Supplier Accreditation</option>
              <option value="Admin- Credit Terms Application">Admin- Credit Terms Application</option>
              <option value="Accounting Concern">Accounting Concern</option>
              <option value="After Sales-Refund">After Sales-Refund</option>
              <option value="After Sales-Repair/Replacement">After Sales-Repair/Replacement</option>
              <option value="Bidding Preperation">Bidding Preperation</option>
              <option value="Customer Order">Customer Order</option>
              <option value="Customer Inquiry Sales">Customer Inquiry Sales</option>
              <option value="Delivery Concern">Delivery Concern</option>
              <option value="FB-Marketplace">FB-Marketplace</option>
              <option value="Follow Up">Follow-Up</option>
              <option value="Inbound Call">Inbound Calls</option>
              <option value="Outbound calls">Outbound Calls</option>
              <option value="Quotation Preparation">Quotation Preparation</option>
              <option value="Sales Order Preparation">Sales Order Preparation</option>
              <option value="Sample Request">Sample Request</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Technical Concern">Technical Concern</option>
              <option value="Viber Replies">Viber Replies</option>
            </select>
          </div>

          {formData.typeactivity === "FB-Marketplace" && (
            <FBMarketPlace typecall={formData.typecall}
              handleFormChange={handleFormChange}
            />
          )}
          {formData.typeactivity === "Inbound Call" && (
            <InboundCall typecall={formData.typecall}
              handleFormChange={handleFormChange}
            />
          )}
          {formData.typeactivity === "Outbound calls" && (
            <OutboundCall
              typecall={formData.typecall}
              callback={formData.callback}
              callstatus={formData.callstatus}
              followup_date={formData.followup_date}
              handleFormChange={handleFormChange}
            />
          )}
          {formData.typeactivity === "Quotation Preparation" && (
            <QuotationPreparation
              typecall={formData.typecall}
              quotationnumber={formData.quotationnumber}
              quotationamount={formData.quotationamount}
              projectname={formData.projectname}
              projectcategory={formData.projectcategory}
              projecttype={formData.projecttype}
              followup_date={formData.followup_date}
              handleFormChange={handleFormChange}
              handleProjectCategoryChange={handleProjectCategoryChange}
            />
          )}
          {formData.typeactivity === "Sales Order Preparation" && (
            <SalesOrderPreparation
              sonumber={formData.sonumber}
              soamount={formData.soamount}
              typecall={formData.typecall}
              handleFormChange={handleFormChange}
            />
          )}

          {formData.activitystatus === "Delivered" && (
            <Delivered formData={formData} handleFormChange={handleFormChange} />
          )}

          <div className="flex flex-col col-span-2">
            <label className="font-semibold">
              Remarks<span className="text-[8px] text-red-700">* Required Fields</span>
            </label>

            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleFormChange}
              className="border-b px-3 py-6 rounded text-xs resize-none h-20"
              placeholder="Enter remarks"
              required
            />
          </div>

          <div className="flex flex-col mt-4">
            <label className="font-semibold">
              Status <span className="text-[8px] text-red-700">* Required Fields</span>
            </label>
            <select
              name="activitystatus"
              value={formData.activitystatus}
              onChange={handleFormChange}
              className="border-b px-3 py-6 rounded text-xs"
              required
            >
              <option value="">Select Status</option>
              {formData.typeactivity === "Quotation Preparation" && (
                <option value="Quote-Done">Quote-Done</option>
              )}
              {formData.typeactivity === "Sales Order Preparation" && (
                <option value="SO-Done">SO-Done</option>
              )}
              {formData.typeactivity !== "Quotation Preparation" &&
                formData.typeactivity !== "Sales Order Preparation" && (
                  <>
                    <option value="Assisted">Assisted ( Client Assistance - Touchbase Such As Calls )</option>
                    <option value="Quote-Done">Quote-Done</option>
                    <option value="SO-Done">SO-Done</option>
                    <option value="Paid">Paid ( Identity - Have SO# )</option>
                    <option value="Delivered">Delivered ( All Fields Completed - SI & DR )</option>
                    <option value="Collected">Collected</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Loss">Loss</option>
                    <option value="Done">Done ( Close Transaction )</option>
                  </>
                )}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-3 bg-gray-300 rounded text-xs hover:bg-gray-400 flex items-center gap-1"
          >
            <MdOutlineClose /> Back
          </button>
          <button
            type="submit"
            className="px-3 py-3 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
          >
            <MdEdit /> Save
          </button>
        </div>
      </form>

      {/* ✅ Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-center mb-4 text-gray-800">
              🧾 Summary of Filled Fields
            </h3>
            <div className="max-h-[300px] overflow-y-auto text-sm text-gray-700 border p-3 rounded-lg mb-4">
              {Object.entries(formData)
                .filter(([key, value]) => value && value !== "")
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b py-1">
                    <span className="font-semibold capitalize">{key}</span>
                    <span className="text-gray-600 truncate max-w-[55%] text-right">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 text-xs bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="px-4 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {showOutboundModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center relative animate-fadeIn">
            {/* User Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A9 9 0 1117.804 5.121M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Please Call Your Client on Actual Phone or Mobile
            </h3>

            {/* Phone + Number */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5h2l3 7-1.34 2.68a1 1 0 00.27 1.32l3.2 2.4a11 11 0 005.1-5.1l-2.4-3.2a1 1 0 011.32-.27L19 9h2"
                    />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-blue-600 text-lg">
                {formData.contactnumber || "No number provided"}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOutboundModal(false)}
              className="mt-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 
      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        defaultEmail={formData.emailaddress || ""}
        onSurveySent={() => {
          // ✅ once survey is sent, submit form for real
          const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
          handleFormSubmit(fakeEvent);
        }}
      />*/}
    </div>
  );
};

export default ProgressForm;
