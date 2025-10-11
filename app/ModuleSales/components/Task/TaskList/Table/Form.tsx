"use client";
import React from "react";
import Select from "react-select";

interface CategoryOption {
  value: string;
  title: string;
}

interface FormData {
  typeactivity?: string;
  projectcategory?: string[];
  quotationnumber?: string;
  quotationamount?: string;
  sonumber?: string;
  soamount?: string;
  remarks?: string;
  source?: string;
  typecall?: string;
  callstatus?: string;
}

interface Task {
  companyname: string;
  [key: string]: any;
}

interface FormProps {
  selectedTask: Task | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSave: (e: React.FormEvent) => void;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  loading: boolean;
  categoryOptions: CategoryOption[];
  Option: any;
}

const Form: React.FC<FormProps> = ({
  selectedTask,
  formData,
  setFormData,
  handleInputChange,
  handleSave,
  setSelectedTask,
  loading,
  categoryOptions,
  Option,
}) => {
  if (!selectedTask) return null;

  return (
    <form className="p-4 grid grid-cols-2 gap-4" onSubmit={handleSave}>
      <h4 className="col-span-2 text-sm font-semibold mb-2">
        Edit Task for {selectedTask.companyname}
      </h4>

      {/* Always show Type Activity */}
      <div className="col-span-2 sm:col-span-1">
        <label className="text-xs text-gray-600">Type Activity</label>
        <input
          name="typeactivity"
          value={formData.typeactivity || ""}
          readOnly
          className="w-full border p-2 rounded text-xs bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* QUOTATION PREPARATION */}
      {formData.typeactivity === "Quotation Preparation" && (
        <>
          {/* Product Category */}
          <div className="w-full border p-2 rounded text-xs bg-gray-100 cursor-not-allowed">
            <label className="text-xs text-gray-600">Product Title</label>
            <Select
              options={categoryOptions}
              closeMenuOnSelect={true}
              components={{ Option }}
              placeholder="Select a product to add"
              onChange={(selected: any) => {
                if (!selected) return;
                if (formData.typeactivity !== "Quotation Preparation") return;

                setFormData((prev: FormData) => {
                  const current = Array.isArray(prev.projectcategory)
                    ? prev.projectcategory
                    : [];
                  if (current.includes(selected.value)) return prev;
                  return {
                    ...prev,
                    projectcategory: [...current, selected.value],
                  };
                });
              }}
              className="text-xs mb-2"
              isClearable
              isDisabled={formData.typeactivity !== "Quotation Preparation"}
            />

            <div className="flex flex-wrap gap-2 shadow rounded bg-gray-50 p-2">
              {Array.isArray(formData.projectcategory) &&
                formData.projectcategory.map((sku: string) => {
                  const product = categoryOptions.find(
                    (opt) => opt.value === sku
                  );
                  return (
                    <div
                      key={sku}
                      className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs"
                    >
                      <span>{product ? product.title : sku}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 disabled:opacity-40"
                        onClick={() =>
                          setFormData((prev: FormData) => ({
                            ...prev,
                            projectcategory: (
                              prev.projectcategory as string[]
                            ).filter((s: string) => s !== sku),
                          }))
                        }
                        disabled={
                          formData.typeactivity !== "Quotation Preparation"
                        }
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quotation Number */}
          <div>
            <label className="text-xs text-gray-600">Quotation Number</label>
            <input
              name="quotationnumber"
              value={formData.quotationnumber || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>

          {/* Quotation Amount */}
          <div>
            <label className="text-xs text-gray-600">Quotation Amount</label>
            <input
              name="quotationamount"
              value={formData.quotationamount || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>

          {/* Remarks */}
          <div className="col-span-2">
            <label className="text-xs text-gray-600">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>
        </>
      )}

      {/* SALES ORDER PREPARATION */}
      {formData.typeactivity === "Sales Order Preparation" && (
        <>
          {/* SO Number */}
          <div>
            <label className="text-xs text-gray-600">SO Number</label>
            <input
              name="sonumber"
              value={formData.sonumber || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>

          {/* SO Amount */}
          <div>
            <label className="text-xs text-gray-600">SO Amount</label>
            <input
              name="soamount"
              value={formData.soamount || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>

          {/* Remarks */}
          <div className="col-span-2">
            <label className="text-xs text-gray-600">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>
        </>
      )}

      {/* OUTBOUND CALLS */}
      {formData.typeactivity === "Outbound calls" && (
        <>
          {/* Source */}
          <div>
            <label className="text-xs text-gray-600">Source</label>
            <select
              name="source"
              value={formData.source || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            >
              <option value="">Select Source</option>
              <option value="Existing Client">Existing Client</option>
              <option value="CSR Inquiry">CSR Inquiry</option>
              <option value="Outbound - Follow-up">
                Outbound - Follow-up
              </option>
              <option value="Outbound - Touchbase">
                Outbound - Touchbase
              </option>
              <option value="Government">Government</option>
              <option value="Philgeps- Website">Philgeps- Website</option>
              <option value="Philgeps">Philgeps</option>
              <option value="Distributor">Distributor</option>
              <option value="Modern Trade">Modern Trade</option>
              <option value="Facebook Marketplace">
                Facebook Marketplace
              </option>
              <option value="Walk-in / Showroom">Walk-in / Showroom</option>
            </select>
          </div>

          {/* Type of Call */}
          <div>
            <label className="text-xs text-gray-600">Type of Call</label>
            <select
              name="typecall"
              value={formData.typecall || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            >
              <option value="">Select Type</option>
              <option value="No Requirements">No Requirements</option>
              <option value="Waiting for Future Projects">
                Waiting for Future Projects
              </option>
              <option value="With RFQ">With RFQ</option>
              <option value="Ringing Only">Ringing Only</option>
              <option value="Cannot Be Reached">Cannot Be Reached</option>
              <option value="Not Connected with the Company">
                Not Connected with the Company
              </option>
            </select>
          </div>

          {/* Call Status */}
          <div>
            <label className="text-xs text-gray-600">Call Status</label>
            <select
              name="callstatus"
              value={formData.callstatus || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            >
              <option value="">Select Status</option>
              <option value="Successful">Successful</option>
              <option value="Unsuccessful">Unsuccessful</option>
            </select>
          </div>

          {/* Remarks */}
          <div className="col-span-2">
            <label className="text-xs text-gray-600">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded text-xs"
            />
          </div>
        </>
      )}

      {/* DEFAULT (Other Activities) */}
      {!["Quotation Preparation", "Sales Order Preparation", "Outbound calls"].includes(
        formData.typeactivity || ""
      ) && (
        <div className="col-span-2">
          <label className="text-xs text-gray-600">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks || ""}
            onChange={handleInputChange}
            className="w-full border p-2 rounded text-xs"
          />
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="px-3 py-2 bg-gray-200 text-xs rounded hover:bg-gray-300"
          onClick={() => setSelectedTask(null)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
};

export default Form;
