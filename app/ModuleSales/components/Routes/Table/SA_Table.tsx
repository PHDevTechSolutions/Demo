"use client";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { RiEditCircleLine } from "react-icons/ri";
import { MdDeleteForever } from "react-icons/md";

export interface Post {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  typeclient: string;
  activitystatus: string;
  activityremarks: string;
  ticketreferencenumber: string;
  date_created: string;
  date_updated: string | null;
  activitynumber: string;
  source: string;
  typeactivity: string;
  targetquota: string;
}

interface TableViewProps {
  posts: Post[];
  handleEdit: (post: Post) => void;
  handleDelete: (id: string) => void;
  refreshPosts: () => void;
}

interface ActivityDetail {
  quotationamount?: number;
  soamount?: number;
  quotationnumber?: string;
  sonumber?: string;
  actualsales?: number;
}

const statusColors: Record<string, string> = {
  "On Progress": "bg-yellow-200 text-black",
  Assisted: "bg-blue-400 text-white",
  Paid: "bg-green-500 text-white",
  Delivered: "bg-cyan-400 text-white",
  Collected: "bg-indigo-500 text-white",
  "Quote-Done": "bg-slate-500 text-white",
  "SO-Done": "bg-purple-500 text-white",
  Cancelled: "bg-red-500 text-white",
  Loss: "bg-red-800 text-white",
  "Client Visit": "bg-orange-500 text-white",
  "Site Visit": "bg-yellow-500 text-black",
  "On Field": "bg-teal-500 text-white",
  "Assisting other Agents Client": "bg-blue-300 text-white",
  "Coordination of SO to Warehouse": "bg-green-300 text-white",
  "Coordination of SO to Orders": "bg-green-400 text-white",
  "Updating Reports": "bg-indigo-300 text-white",
  "Email and Viber Checking": "bg-purple-300 text-white",
  "1st Break": "bg-yellow-300 text-black",
  "Client Meeting": "bg-orange-300 text-white",
  "Coffee Break": "bg-amber-300 text-black",
  "Group Meeting": "bg-cyan-300 text-black",
  "Last Break": "bg-yellow-400 text-black",
  "Lunch Break": "bg-red-300 text-black",
  "TSM Coaching": "bg-pink-300 text-white",
};

const fieldOnlyStatus = [
  "Client Visit",
  "Site Visit",
  "On Field",
  "Assisting other Agents Client",
  "Coordination of SO to Warehouse",
  "Coordination of SO to Orders",
  "Updating Reports",
  "Email and Viber Checking",
  "1st Break",
  "Client Meeting",
  "Coffee Break",
  "Group Meeting",
  "Last Break",
  "Lunch Break",
  "TSM Coaching",
];

const formatDate = (timestamp: number): string => {
  if (!timestamp) return "Invalid date";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TableView: React.FC<TableViewProps> = ({ posts, handleEdit, handleDelete, refreshPosts }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Post | null>(null);
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [reopenType, setReopenType] = useState<"quote" | "so" | null>(null);

  // controlled form fields
  const [source, setSource] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [quotationAmount, setQuotationAmount] = useState<number | "">("");
  const [soNumber, setSoNumber] = useState("");
  const [soAmount, setSoAmount] = useState<number | "">("");
  const [actualSales, setActualSales] = useState<number | "">("");

  // missing fields declared ✅
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [typeCall, setTypeCall] = useState("");
  const [remarks, setRemarks] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  const getTypeActivityFromStatus = (status: string): string => {
    switch (status) {
      case "Quote-Done":
        return "Quotation Preparation";
      case "SO-Done":
        return "Sales Order Preparation";
      default:
        return "";
    }
  };


  useEffect(() => {
    if (!selectedActivity?.activitynumber) return;

    setLoading(true);
    fetch(`/api/ModuleSales/Task/DailyActivity/FetchReOpen?activitynumber=${selectedActivity.activitynumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const latest = data.data[0];
          setActivityDetail(latest);

          setQuotationAmount(latest.quotationamount || "");
          setQuotationNumber(latest.quotationnumber || "");
          setSoAmount(latest.soamount || "");
          setSoNumber(latest.sonumber || "");
          setActualSales(latest.actualsales || "");
        } else {
          setActivityDetail(null);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedActivity?.activitynumber]);

  const onEdit = useCallback((post: Post) => handleEdit(post), [handleEdit]);

  const onDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
      e.stopPropagation();
      handleDelete(id);
    },
    [handleDelete]
  );

  const onReopen = (post: Post) => {
    setSelectedActivity({
      ...post,
      typeactivity: getTypeActivityFromStatus(post.activitystatus),
    });
    setShowModal(true);
    setReopenType(null);
  };


  const handleConfirmReopen = async () => {
    if (!selectedActivity) return;

    const computedTypeActivity = getTypeActivityFromStatus(
      selectedActivity.activitystatus
    );

    const payload = {
      ...selectedActivity,
      source: source || null,
      typeactivity: computedTypeActivity,
      quotationnumber: quotationNumber || null,
      quotationamount: quotationAmount === "" ? null : Number(quotationAmount),
      sonumber: soNumber || null,
      soamount: soAmount === "" ? null : Number(soAmount),
      actualsales: actualSales === "" ? null : Number(actualSales),
      projectname: projectName || null,
      projecttype: projectType || null,
      typecall: typeCall || null,
      remarks: remarks || null,
      followup_date: followupDate || null,
      reopenType,
    };

    if (
      (quotationAmount !== "" && Number(quotationAmount) < 0) ||
      (soAmount !== "" && Number(soAmount) < 0) ||
      (actualSales !== "" && Number(actualSales) < 0)
    ) {
      alert("Amounts cannot be negative.");
      return;
    }

    const res = await fetch("/api/ModuleSales/Task/DailyActivity/ReOpen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Activity reopened successfully!");
      setShowModal(false);
      refreshPosts();
    } else {
      alert("❌ Failed: " + data.error);
    }
  };

  const renderModalContent = () => {
    if (loading) return <p className="text-center text-sm text-gray-500">Loading...</p>;
    if (!activityDetail) return <p className="text-center text-sm text-gray-500">No details found.</p>;

    const status = selectedActivity?.activitystatus;

    return (
      <div className="space-y-4 text-xs">
        {status === "Done" && (
          <div className="flex gap-3 mb-2">
            <button
              onClick={() => setReopenType("quote")}
              className={`px-3 py-1 rounded text-xs border transition-colors ${reopenType === "quote" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              For Quotation
            </button>
            <button
              onClick={() => setReopenType("so")}
              className={`px-3 py-1 rounded text-xs border transition-colors ${reopenType === "so" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              For SO
            </button>
          </div>
        )}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Source</label>
          <select
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
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

        {(status === "Quote-Done" || reopenType === "quote") && (
          <>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Project Name (Optional)</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter Project Name"
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Customer Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              >
                <option value="">Customer Type</option>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="B2G">B2G</option>
                <option value="Gentrade">Gentrade</option>
                <option value="Modern Trade">Modern Trade</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Quotation #</label>
              <input
                type="text"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                placeholder="Enter quotation number"
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Quotation Amount</label>
              <input
                type="number"
                value={quotationAmount}
                onChange={(e) =>
                  setQuotationAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Enter quotation amount"
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Quotation Type</label>
              <select
                value={typeCall}
                onChange={(e) => setTypeCall(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              >
                <option value="">Select Type</option>
                <option value="Sent Quotation - Standard">Sent Quotation - Standard</option>
                <option value="Sent Quotation - With Special Price">Sent Quotation - With Special Price</option>
                <option value="Sent Quotation - With SPF">Sent Quotation - With SPF</option>
                <option value="With SPFS">With SPFS</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              ></textarea>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Follow Up Date (Optional)</label>
              <input
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>
          </>
        )}

        {(status === "SO-Done" || reopenType === "so") && (
          <>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">SO #</label>
              <input
                type="text"
                value={soNumber}
                onChange={(e) => setSoNumber(e.target.value)}
                placeholder="Enter SO number"
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">SO Amount</label>
              <input
                type="number"
                value={soAmount}
                onChange={(e) =>
                  setSoAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Enter SO amount"
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">SO Type</label>
              <select
                value={typeCall}
                onChange={(e) => setTypeCall(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              >
                <option value="">Select Type</option>
                <option value="Regular SO">Regular SO</option>
                <option value="Willing to Wait">Willing to Wait</option>
                <option value="SPF - Special Project">SPF - Special Project</option>
                <option value="Local SPF">Local SPF</option>
                <option value="SPF - Local">SPF - Local</option>
                <option value="SPF - Foreign">SPF - Foreign</option>
                <option value="Promo">Promo</option>
                <option value="FB Marketplace">FB Marketplace</option>
                <option value="Internal Order">Internal Order</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              ></textarea>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Follow Up Date (Optional)</label>
              <input
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                className="border-b px-3 py-2 rounded text-xs"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderedRows = useMemo(() => {
    if (posts.length === 0)
      return (
        <tr>
          <td colSpan={9} className="text-center py-4 text-xs">
            No records available
          </td>
        </tr>
      );

    return posts.map((post) => {
      const isFieldStatus = fieldOnlyStatus.includes(post.activitystatus);
      const isCsrInquiry = post.typeclient?.toLowerCase() === "csr client";

      return (
        <tr
          key={post.id}
          className={`whitespace-nowrap ${isFieldStatus ? "bg-gray-50" : "hover:bg-gray-100 cursor-pointer"
            } ${isCsrInquiry ? "shadow-lg hover:bg-red-500 hover:text-white" : ""}`}
          onClick={() => !isFieldStatus && onEdit(post)}
        >
          <td
            className="px-6 py-4 text-xs sticky left-0 bg-white border-r border-gray-200 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {!isFieldStatus && (
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                  className="flex items-center gap-1 bg-blue-500 text-white text-[10px] px-2 py-1 rounded hover:bg-blue-700 shadow-md"
                >
                  <RiEditCircleLine size={12} /> Update
                </button>

                <button
                  onClick={(e) => onDelete(e, post.id)}
                  className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-1 rounded hover:bg-red-700 shadow-md"
                >
                  <MdDeleteForever size={12} /> Delete
                </button>

                {["SO-Done", "Quote-Done", "Done", "Delivered"].includes(post.activitystatus) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReopen(post);
                    }}
                    className="flex items-center gap-1 bg-green-500 text-white text-[10px] px-2 py-1 rounded hover:bg-green-700 shadow-md"
                  >
                    🔁 Re-Open
                  </button>
                )}
              </div>
            )}
          </td>

          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 text-[8px] rounded-full shadow-md font-semibold ${statusColors[post.activitystatus] || "bg-gray-300 text-black"
                }`}
            >
              {post.activitystatus}
            </span>
          </td>

          <td className="px-6 py-4 text-[10px]">
            {formatDate(new Date(post.date_created).getTime())}
            <br />
            <span className="text-gray-500">#: {post.activitynumber}</span>
          </td>

          <td className="px-6 py-4 text-[10px] uppercase">{post.companyname}</td>
          <td className="px-6 py-4 text-[10px] capitalize">{post.contactperson}</td>
          <td className="px-6 py-4 text-[10px]">{post.contactnumber}</td>
          <td className="px-6 py-4 text-[10px]">{post.typeclient}</td>
          <td className="px-6 py-4 text-[10px]">{post.ticketreferencenumber}</td>
        </tr>
      );
    });
  }, [posts, onEdit, onDelete]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700 sticky left-0 border-r border-gray-200 z-20">
              Actions
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Date Created</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Company</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Contact Person</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Contact Number</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Type of Client</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Ticket Reference</th>
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
      </table>

      {/* 🟢 Re-Open Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 relative">
            <h2 className="text-lg font-bold mb-3 text-center">Re-Open Activity</h2>
            <div className="space-y-2 text-sm">{renderModalContent()}</div>

            <div className="mt-5 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleConfirmReopen}
                disabled={(selectedActivity?.activitystatus === "Done" && !reopenType) || loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;
