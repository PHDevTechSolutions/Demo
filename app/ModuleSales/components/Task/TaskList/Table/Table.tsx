"use client";

import React, { useEffect, useState } from "react";
import { FiTrash2, FiChevronRight } from "react-icons/fi";
import Select, { components } from "react-select";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "./DeleteModal";

interface Note {
  id: number;
  companyname: string;
  contactnumber: string;
  emailaddress: string;
  activitystatus: string;
  typeactivity: string;
  remarks: string;
  date_created: string;
  quotationnumber: string;
  quotationamount: string;
  sonumber: string;
  soamount: string;
  projectcategory?: string | string[];
  callstatus: string;
  source: string;
  typecall: string;
}

interface UserDetails {
  Firstname: string;
  Lastname: string;
  profilePicture?: string;
}

interface TableProps {
  title: string;
  tasks: Note[];
  userDetails: UserDetails;
  limit: number;
  setLimit: (limit: number) => void;
  onRefresh?: () => void;
}

interface ShopifyProduct {
  id: number;
  title: string;
  sku: string;
}

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <div>
        <div>{props.data.title}</div>
        <div style={{ fontSize: "10px", color: "#555" }}>{props.data.sku}</div>
      </div>
    </components.Option>
  );
};

const ITEMS_PER_PAGE = 10;

const Table: React.FC<TableProps> = ({ title, tasks, userDetails, limit, setLimit, onRefresh }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Note | null>(null);
  const [formData, setFormData] = useState<Partial<Note>>({});
  const [loading, setLoading] = useState(false);
  const toggleCollapse = () => setCollapsed(!collapsed);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleRowClick = (task: Note) => {
    setSelectedTask(task);
    setFormData({
      typeactivity: task.typeactivity,
      sonumber: task.sonumber,
      quotationnumber: task.quotationnumber,
      soamount: task.soamount,
      quotationamount: task.quotationamount,
      callstatus: task.callstatus,
      source: task.source,
      typecall: task.typecall,
      remarks: task.remarks,
      projectcategory: task.projectcategory
        ? typeof task.projectcategory === "string"
          ? task.projectcategory.split(",").map((s) => s.trim())
          : task.projectcategory
        : [],
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ModuleSales/Shopify/FetchProduct");
        const json = await res.json();

        if (!json.success) throw new Error(json.error);

        const products: ShopifyProduct[] = json.data;

        const mapped = products.map((p) => ({
          value: p.sku,
          title: p.title.replace(/Super Sale\s*/i, "").trim(),
          sku: p.sku,
          label: `${p.title} | ${p.sku}`,
        }));

        setCategoryOptions(mapped);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load product titles from Shopify");
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setLoading(true);
      const res = await fetch(
        "/api/ModuleSales/Task/ActivityPlanner/UpdateTask",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedTask.id,
            ...formData,
            // 🔹 ensure array → string bago isave
            projectcategory: Array.isArray(formData.projectcategory)
              ? formData.projectcategory.join(",")
              : formData.projectcategory,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update progress");

      toast.success("✅ Progress updated successfully!");
      setSelectedTask(null);

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update progress.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setLoadingDelete(true);
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/DeleteTask", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      toast.success("🗑️ Task deleted successfully!");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("❌ Failed to delete task.");
    } finally {
      setLoadingDelete(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };


  const renderTaskRow = (task: Note) => {
    const isDisabled = ["delivered", "done", "completed"].includes(
      (task.activitystatus || "").toLowerCase()
    );

    return (
      <tr
        key={task.id}
        className={`relative group hover:bg-gray-50 border-b ${isDisabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:shadow-sm"
          }`}
        onClick={() => {
          if (!isDisabled) handleRowClick(task);
        }}
        onMouseEnter={() => setHoveredRow(task.id)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        <td className="px-2 py-6 text-xs capitalize w-[300px] whitespace-normal break-words">
          {task.remarks}
        </td>
        <td className="px-6 py-6 text-xs uppercase">
          {task.companyname}
          <br />
          {task.contactnumber}
          <span className="lowercase ml-1 text-gray-500 italic text-[10px]">
            {task.emailaddress}
          </span>
        </td>
        <td className="px-6 py-6 text-xs">{task.typeactivity}</td>
        <td className="px-6 py-6 text-xs">
          <div className="flex flex-col">
            <span>{task.quotationnumber}</span>
            <span className="text-gray-500 text-[11px]">
              {task.quotationamount ? `₱${task.quotationamount}` : ""}
            </span>
          </div>
        </td>
        <td className="px-6 py-6 text-xs">
          <div className="flex flex-col">
            <span>{task.sonumber}</span>
            <span className="text-gray-500 text-[11px]">
              {task.soamount ? `₱${task.soamount}` : ""}
            </span>
          </div>
        </td>
        <td className="px-6 py-6 text-xs">
          {new Date(task.date_created).toLocaleString()}
        </td>
        <td className="px-6 py-6 text-xs">
          <div className="flex items-center gap-2">
            <img
              src={userDetails.profilePicture || "/taskflow.png"}
              alt="Responsible"
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs">
              {userDetails.Firstname} {userDetails.Lastname}
            </span>
          </div>
        </td>
        {/* ✅ Delete button (appears on hover, fixed to right) */}
        {hoveredRow === task.id && (
          <td
            className="absolute right-0 top-0 h-full flex items-center bg-white/90 border-l px-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <button
              className="flex items-center gap-1 px-3 py-6 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(null); // close form
                setDeleteId(task.id);
                setShowDeleteModal(true);
              }}
              disabled={loadingDelete}
            >
              <FiTrash2 size={12} />
              {loadingDelete ? "Deleting..." : "Delete"}
            </button>
          </td>
        )}

        {/* Delete Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          onConfirm={handleDelete}
          loading={loadingDelete}
        />

      </tr>
    );
  };


  return (
    <div className="mb-4 border-b relative">
      <h3
        className="text-xs font-semibold text-gray-700 mb-4 mt-4 pb-1 flex items-center gap-2 cursor-pointer select-none"
        onClick={toggleCollapse}
      >
        <FiChevronRight
          className={`transition-transform duration-200 ${collapsed ? "rotate-0" : "rotate-90"
            }`}
        />
        <span>{title}</span>
        <span className="bg-gray-200 px-2 py-0.5 text-[10px] rounded-full">
          {tasks.length}
        </span>
      </h3>

      {!collapsed && (
        <>
          <table className="min-w-full table-fixed mb-2">
            <thead>
              <tr className="text-xs text-left whitespace-nowrap border-b">
                <th className="px-2 py-4 font-semibold text-gray-700 w-[300px]">
                  Remarks
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Company Name
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Quotation
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">SO</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Responsible
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.slice(0, limit).map(renderTaskRow)}
            </tbody>
          </table>

          {limit < tasks.length && (
            <div className="flex justify-center mt-2">
              <button
                className="w-full px-3 py-2 bg-gray-200 text-black rounded text-xs hover:bg-gray-300"
                onClick={() => setLimit(limit + ITEMS_PER_PAGE)}
              >
                View More
              </button>
            </div>
          )}
        </>
      )}

      {/* Slide-up edit form */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t transform transition-transform duration-300 z-[999] ${selectedTask && !showDeleteModal ? "translate-y-0" : "translate-y-full"
          }`}
      >
        {selectedTask && !showDeleteModal && (
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

            {/* Render fields conditionally */}
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

                      setFormData((prev) => {
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
                      formData.projectcategory.map((sku) => {
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
                                setFormData((prev) => ({
                                  ...prev,
                                  projectcategory: (
                                    prev.projectcategory as string[]
                                  ).filter((s) => s !== sku),
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

            {/* Default (other types) */}
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

            {/* Action buttons */}
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
        )}

      </div>
    </div>
  );
};

export default Table;
