import React, { useState, useMemo } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { FcBusinessman, FcPhone, FcInvite } from "react-icons/fc";

interface Post {
  ticketreferencenumber: string;
  status?: string;
  date_created: string;
  wrapup?: string;
  referenceid?: string;
  csragent?: string;
  companyname?: string;
  contactperson?: string;
  contactnumber?: string;
  emailaddress?: string;
  address?: string;
  id: string;
  typeclient?: string;
}

interface InquiriesContainerProps {
  filteredPosts: Post[];
  activeTab: string;
  formatDistanceToNow: (date: Date, options?: any) => string;
  CiLocationArrow1: React.ComponentType<any>;
  handlePost: (post: Post) => void;
  userDetails: {
    ReferenceID: string;
    TSM?: string;
    Manager?: string;
  };
}

const InquiriesContainer: React.FC<InquiriesContainerProps> = ({
  filteredPosts,
  activeTab,
  formatDistanceToNow,
  CiLocationArrow1,
  handlePost,
  userDetails,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  }, [filteredPosts]);

  const latestPostId = sortedPosts.length > 0 ? sortedPosts[0].id : null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase flex justify-between items-center">
        <span className="text-[8px] font-bold text-white p-1 bg-red-500 rounded-full">
          Total: {filteredPosts.length}
        </span>
      </p>

      <div className="grid">
        {sortedPosts.length === 0 && (
          <p className="text-xs text-center text-gray-500">No CSR Inquiries to display.</p>
        )}

        {sortedPosts.map((post) => {
          const isExpanded = expandedIds.includes(post.id);
          const isLatest = post.id === latestPostId;
          const relativeTime = formatDistanceToNow(new Date(post.date_created), { addSuffix: true });

          return (
            <div
              key={post.id}
              className={`border-b border-gray-200 p-4 hover:rounded-xl hover:shadow-lg transition duration-300
                ${isLatest ? "animate-pulse ring-2 ring-red-400 rounded-xl" : ""}
              `}
            >
              {/* Hidden inputs for forms if needed */}
              <input type="hidden" name="referenceid" value={userDetails.ReferenceID} />
              <input type="hidden" name="tsm" value={userDetails.TSM} />
              <input type="hidden" name="manager" value={userDetails.Manager} />

              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedIds((prev) =>
                    prev.includes(post.id)
                      ? prev.filter((id) => id !== post.id)
                      : [...prev, post.id]
                  )
                }
              >
                <div
                  className="flex flex-col"
                  style={{
                    maxWidth: "calc(100% - 60px)",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  <p className="text-[10px] font-bold text-gray-800 uppercase">
                    {post.companyname}
                  </p>
                  <span className="text-[8px] text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(post.date_created), { addSuffix: true })}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePost(post);
                  }}
                  className="flex items-center gap-1 bg-blue-400 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded-full shadow"
                >
                  <FaPlusCircle size={10} />
                  Add
                </button>
              </div>


              {isExpanded && (
                <div className="mt-3 space-y-1 text-xs text-gray-700">
                  <p className="text-[10px] text-blue-600 font-semibold uppercase">{post.typeclient}</p>
                  <div className="flex items-center gap-2">
                    <FcBusinessman size={16} />
                    <span className="font-medium capitalize">{post.contactperson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FcPhone size={16} />
                    <span className="font-medium">{post.contactnumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FcInvite size={16} />
                    <span className="font-medium">{post.emailaddress}</span>
                  </div>

                  {/* Show relative date_created inside expanded details too */}
                  <p className="text-[8px] text-gray-400 italic mt-2">Created: {relativeTime}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InquiriesContainer;
