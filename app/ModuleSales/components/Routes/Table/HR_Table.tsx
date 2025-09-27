import React from "react";

interface Activity {
  id: number | string;
  date_created?: string;
  startdate: string;
  enddate: string;
  typeactivity: string;
  callback?: string;
  callstatus: string;
  typecall: string;
  quotationnumber: string;
  quotationamount: number | string;
  soamount: number | string;
  sonumber: string;
  actualsales: number | string;
  remarks: string;
  activitystatus: string;
}

interface HistoricalRecordsTableProps {
  records: Activity[];
  handleShowRemarks: (remarks: string) => void;
}

const HistoricalRecordsTable: React.FC<HistoricalRecordsTableProps> = ({
  records,
  handleShowRemarks,
}) => {
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.date_created || "").getTime();
    const dateB = new Date(b.date_created || "").getTime();
    return dateB - dateA;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const formattedDateStr = date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${formattedDateStr} ${hours}:${minutesStr} ${ampm}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Time Spent</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Type of Activity</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Callback</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Call Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Q# Number</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Q-Amount</th>
            <th className="px-6 py-4 font-semibold text-gray-700">SO-Amount</th>
            <th className="px-6 py-4 font-semibold text-gray-700">SO-Number</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Actual Sales</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Remarks</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Date Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRecords.length > 0 ? (
            sortedRecords.map((activity) => (
              <tr key={activity.id} className="border-b whitespace-nowrap">
                <td className="px-6 py-4 text-xs">
                  <span
                    className={`px-2 py-1 text-[8px] font-semibold rounded-full whitespace-nowrap ${activity.activitystatus === "Assisted"
                      ? "bg-blue-400 text-white"
                      : activity.activitystatus === "Paid"
                        ? "bg-green-500 text-white"
                        : activity.activitystatus === "Delivered"
                          ? "bg-cyan-400 text-white"
                          : activity.activitystatus === "Collected"
                            ? "bg-indigo-500 text-white"
                            : activity.activitystatus === "Quote-Done"
                              ? "bg-slate-500 text-white"
                              : activity.activitystatus === "SO-Done"
                                ? "bg-purple-500 text-white"
                                : activity.activitystatus === "Cancelled"
                                  ? "bg-red-500 text-white"
                                  : activity.activitystatus === "Loss"
                                    ? "bg-red-800 text-white"
                                    : "bg-slate-200 text-blue-700"
                      }`}
                  >
                    {activity.activitystatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">
                  {(() => {
                    const start = new Date(activity.startdate);
                    const end = new Date(activity.enddate);
                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                      const diffMs = end.getTime() - start.getTime();
                      const hours = Math.floor(diffMs / (1000 * 60 * 60));
                      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                      return `${hours}h ${minutes}m ${seconds}s`;
                    }
                    return "Invalid date";
                  })()}
                </td>
                <td className="px-6 py-4 text-xs">{activity.typeactivity}</td>
                <td className="px-6 py-4 text-xs">
                  {activity.callback
                    ? new Date(activity.callback).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : ""}
                </td>
                <td className="px-6 py-4 text-xs">{activity.callstatus}</td>
                <td className="px-6 py-4 text-xs">{activity.typecall}</td>
                <td className="px-6 py-4 text-xs uppercase">{activity.quotationnumber}</td>
                <td className="px-6 py-4 text-xs">{activity.quotationamount}</td>
                <td className="px-6 py-4 text-xs">{activity.soamount}</td>
                <td className="px-6 py-4 text-xs uppercase">{activity.sonumber}</td>
                <td className="px-6 py-4 text-xs">{activity.actualsales}</td>
                <td
                  className="px-6 py-4 border break-words truncate max-w-xs cursor-pointer capitalize"
                  onClick={() => handleShowRemarks(activity.remarks)}
                >
                  {activity.remarks}
                </td>
                <td className="px-4 py-2">
                  {activity.date_created ? formatDate(new Date(activity.date_created).getTime()) : "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={13} className="text-center py-2 border">
                No activities found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricalRecordsTable;
