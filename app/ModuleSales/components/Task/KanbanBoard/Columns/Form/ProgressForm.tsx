"use client";

import React, { useEffect } from "react";
import FBMarketPlace from "../HiddenFields/FBMarketPlace";
import InboundCall from "../HiddenFields/InboundCall";
import OutboundCall from "../HiddenFields/OutboundCall";
import QuotationPreparation from "../HiddenFields/QuotationPreparation";
import SalesOrderPreparation from "../HiddenFields/SalesOrderPreparation";
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
  };
  handleFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  // Accept both the raw react-select format OR string[]
  handleProjectCategoryChange: (selected: { value: string; label: string }[] | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

// 🔹 Consistent Manila timestamp formatter
const getFormattedTimestamp = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Manila",
  });
};

const ProgressForm: React.FC<ProgressFormProps> = ({
  formData,
  handleFormChange,
  handleFormSubmit,
  onClose,
  handleProjectCategoryChange,
  setFormData,
}) => {
  // 🔹 Set startdate once (when form opens)
  useEffect(() => {
    if (!formData.startdate) {
      setFormData((prev: any) => ({
        ...prev,
        startdate: getFormattedTimestamp(),
      }));
    }
  }, []);

  // 🔹 Update enddate in realtime
  useEffect(() => {
    const interval = setInterval(() => {
      setFormData((prev: any) => ({
        ...prev,
        enddate: getFormattedTimestamp(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg border-t z-[9999] max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
        {/* Hidden Start/End Dates */}
        <input type="hidden" name="startdate" value={formData.startdate} readOnly />
        <input type="hidden" name="enddate" value={formData.enddate} readOnly />

        <div className="grid grid-cols-2 gap-4">
          {/* Source */}
          <div className="flex flex-col mt-4">
            <label className="font-semibold">
              Source <span className="text-[8px] text-red-700">* Required Fields</span>
            </label>
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
          </div>

          {/* Type of Activity */}
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

          {/* Conditional Forms */}
          {formData.typeactivity === "FB-Marketplace" && (
            <FBMarketPlace typecall={formData.typecall} handleFormChange={handleFormChange} />
          )}
          {formData.typeactivity === "Inbound Call" && (
            <InboundCall typecall={formData.typecall} handleFormChange={handleFormChange} />
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
              projectcategory={formData.projectcategory} // <-- now array
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

          {/* Remarks */}
          {formData.activitystatus === "Delivered" && (
            <>
              <div className="flex flex-col">
                <label className="font-semibold">
                  Payment Terms <span className="text-[8px] text-red-700">* Required Fields</span>
                </label>
                <select
                  name="paymentterm"
                  value={formData.paymentterm}
                  onChange={handleFormChange}
                  className="border-b px-3 py-6 rounded text-xs resize-none h-20"
                >
                  <option value="COD">COD</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Deposit">Bank Deposit</option>
                  <option value="GCash">GCash</option>
                  <option value="Terms">Terms</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold">
                  SI (Actual Sales) <span className="text-[8px] text-red-700">* Required Fields</span>
                </label>
                <input
                  type="number"
                  name="actualsales"
                  value={formData.actualsales}
                  onChange={handleFormChange}
                  className="border-b px-3 py-6 rounded text-xs resize-none h-20"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold">
                  Delivery Date <span className="text-[8px] text-red-700">* Required Fields</span>
                </label>
                <input
                  type="date"
                  name="deliverydate"
                  value={formData.deliverydate}
                  onChange={handleFormChange}
                  className="border-b px-3 py-6 rounded text-xs resize-none h-20"
                />
              </div>
            </>
          )}

          {/* Remarks Textarea */}
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

          {/* Status */}
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
                    <option value="Assisted">
                      Assisted ( Client Assistance - Touchbase Such As Calls )
                    </option>
                    <option value="Paid">Paid ( Identity - Have SO# )</option>
                    <option value="Delivered">Delivered ( All Fields Completed - SI & DR )</option>
                    <option value="Collected">Collected</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Loss">Loss</option>
                  </>
                )}
            </select>
          </div>
        </div>

        {/* Action buttons */}
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
    </div>
  );
};

export default ProgressForm;
