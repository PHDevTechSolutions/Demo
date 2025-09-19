import React, { useEffect, useState } from "react";

interface TableProps {
  posts: any[];
  userDetails: any;
}

const Table: React.FC<TableProps> = ({ posts, userDetails }) => {
  const [updatedUser, setUpdatedUser] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(15);

  useEffect(() => {
    setUpdatedUser(filteredAccounts);
  }, [posts, userDetails]);

  const filteredAccounts = Array.isArray(posts)
  ? posts
      .filter((post) => {
        const userReferenceID = userDetails.ReferenceID;
        const matchesReferenceID =
          (userDetails.Role === "Manager" && post?.manager === userReferenceID) ||
          (userDetails.Role === "Territory Sales Manager" &&
            post?.tsm === userReferenceID &&
            post?.type === "Follow-Up Notification") ||
          (userDetails.Role === "Territory Sales Associate" &&
            post?.referenceid === userReferenceID &&
            post?.type !== "CSR Notification" && post?.type !== "Follow-Up Notification");

        return matchesReferenceID;
      })
      .sort(
        (a, b) =>
          new Date(b.date_created).getTime() -
          new Date(a.date_created).getTime()
      )
  : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mb-4">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
              <th className="px-6 py-4 font-semibold text-gray-700">Date Received</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Message</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Callback</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length > 0 ? (
              currentItems.map((post) => (
                <tr key={post.id} className="border-b whitespace-nowrap">
                  <td className="px-6 py-4 text-xs">
                    {new Date(post.date_created).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs">{post.message || "N/A"}</td>
                  <td className="px-6 py-4 text-xs">
                    {post.callback ? (
                      <span className="text-blue-500">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">{post.type || "N/A"}</td>
                  <td className="px-6 py-4 text-xs">{post.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2 text-xs">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-400 text-white hover:bg-blue-600"
            }`}
          >
            Prev
          </button>

          <span className="px-3 py-1 border rounded bg-gray-100 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-400 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
