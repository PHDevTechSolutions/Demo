"use client";

import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu } from "@headlessui/react";

interface UsersCardProps {
  posts: any[];
  handleEdit: (post: any) => void;
  userDetails: any;
}

interface Session {
  email: string;
  status: string;
  timestamp: string;
}

const UsersCard: React.FC<UsersCardProps> = ({ posts, handleEdit, userDetails }) => {
  const [updatedUser, setUpdatedUser] = useState(posts);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setUpdatedUser(posts);
  }, [posts]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/fetchsession`); // fetch all, not just by id
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data: Session[] = await response.json();
        setSessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);


  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).replace(",", " at");
  };


  const getUserLogins = (email: string) => {
    const userSessions = sessions
      .filter((s) => s.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());


    const loginSessions = userSessions.filter((s) => s.status.toLowerCase() === "login");
    const logoutSessions = userSessions.filter((s) => s.status.toLowerCase() === "logout");

    return {
      latestLogin:
        loginSessions.length > 0
          ? {
            timestamp: formatDateTime(loginSessions[loginSessions.length - 1].timestamp),
            status: loginSessions[loginSessions.length - 1].status,
          }
          : { timestamp: "No login yet", status: "N/A" },

      latestLogout:
        logoutSessions.length > 0
          ? {
            timestamp: formatDateTime(logoutSessions[logoutSessions.length - 1].timestamp),
            status: logoutSessions[logoutSessions.length - 1].status,
          }
          : { timestamp: "No logout yet", status: "N/A" },
    };
  };


  const statusColors: { [key: string]: string } = {
    Active: "bg-green-500",
    Inactive: "bg-red-400",
    Resigned: "bg-red-500",
    Terminated: "bg-yellow-400",
    Locked: "bg-gray-400",
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {updatedUser.length > 0 ? (
          updatedUser.map((post) => {
            const userLogins = getUserLogins(post.Email ?? "");
            return (
              <div
                key={post._id ?? Math.random()}
                className="relative border rounded-xl shadow-lg p-4 flex flex-col bg-white hover:scale-[1.03] hover:shadow-2xl transition-transform duration-300 overflow-hidden"
              >
                {/* Header with Avatar and Name */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={post.profilePicture ?? "/taskflow.png"}
                        alt="Avatar"
                        className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-md"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[post.Status ?? ""] || "bg-gray-400"
                          } animate-pulse`}
                        title={post.Status ?? "Unknown"}
                      />
                    </div>
                    <p className="text-sm font-bold capitalize">
                      {post.Lastname ?? "N/A"}, {post.Firstname ?? "N/A"}
                    </p>
                  </div>

                  {/* Dropdown Menu */}
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-1 rounded hover:bg-gray-100">
                      <BsThreeDotsVertical className="text-gray-600" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10 animate-fade-in">
                      <button
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => handleEdit(post)}
                      >
                        View Information
                      </button>
                      <button
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setSelectedUser(post);
                          setShowModal(true);
                        }}
                      >
                        View Session Logs
                      </button>
                    </Menu.Items>
                  </Menu>
                </div>

                {/* Body */}
                <div className="text-xs space-y-1 mb-3">
                  <p>
                    <strong>Email:</strong> {post.Email ?? "N/A"}
                  </p>
                  <p className="capitalize">
                    <strong>Role:</strong> {post.Role ?? "N/A"}
                  </p>
                  <p className="text-green-700">
                    <strong>Latest Login:</strong>{" "}
                    {userLogins.latestLogin.timestamp} ({userLogins.latestLogin.status})
                  </p>
                  <p className="text-red-600">
                    <strong>Latest Logout:</strong>{" "}
                    {userLogins.latestLogout.timestamp} ({userLogins.latestLogout.status})
                  </p>

                </div>

                {/* Footer */}
                <div className="mt-auto border-t pt-2 text-xs text-gray-900 flex flex-col gap-1">
                  <p>
                    <strong>Department:</strong> {post.Department ?? "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong> {post.Location ?? "N/A"}
                  </p>
                </div>

                {/* Animated blobs */}
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-r from-cyan-200 to-blue-300 opacity-30 rounded-full blur-2xl animate-blob animation-delay-2000 pointer-events-none"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-pink-200 to-red-300 opacity-30 rounded-full blur-2xl animate-blob animation-delay-4000 pointer-events-none"></div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-6 text-xs text-gray-500">
            No accounts available
          </div>
        )}
      </div>

      {/* Session Logs Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative transform animate-scaleIn">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-4 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                Session Logs -{" "}
                {selectedUser.Firstname ?? "N/A"} {selectedUser.Lastname ?? ""}
              </h2>
              <p className="text-sm text-gray-500">Recent activity for this account</p>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {sessions.length > 0 ? (
                [...sessions] // copy array to avoid mutating state
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // latest first
                  .map((s, index) => {
                    const isLogin = s.status.toLowerCase() === "login";
                    const isLogout = s.status.toLowerCase() === "logout";
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${isLogin
                            ? "bg-green-100 text-green-700"
                            : isLogout
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {s.status}
                        </span>

                        {/* Timestamp */}
                        <span className="text-xs text-gray-700 font-medium">
                          {formatDateTime(s.timestamp)}
                        </span>
                      </div>
                    );
                  })
              ) : (
                <p className="text-gray-500 text-sm text-center py-6">
                  No session logs available
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCard;
