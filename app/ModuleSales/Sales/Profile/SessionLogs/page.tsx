"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Session {
  email: string;
  status: string;
  timestamp: string;
}

const DATES_PER_PAGE = 3;

const SessionLogs: React.FC = () => {
  const [userDetails, setUserDetails] = useState({
    id: "",
    Firstname: "",
    Lastname: "",
    Email: "",
    Role: "",
    profilePicture: "/taskflow.png",
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();

        setUserDetails({
          id: data._id,
          Firstname: data.Firstname || "",
          Lastname: data.Lastname || "",
          Email: data.Email || "",
          Role: data.Role || "",
          profilePicture: data.profilePicture || "/taskflow.png",
        });

        const sessionResponse = await fetch(
          `/api/fetchsession?id=${encodeURIComponent(data.Email)}`
        );
        if (!sessionResponse.ok) throw new Error("Failed to fetch session logs");
        const sessionData: Session[] = await sessionResponse.json();

        const filteredSessions = sessionData
          .filter((s) => s.email === data.Email)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        setSessions(filteredSessions);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load user data or sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      weekday: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      weekday: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const sessionsByDate: Record<string, Session[]> = sessions.reduce((acc, session) => {
    const date = formatDateOnly(session.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const allDates = Object.keys(sessionsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalPages = Math.ceil(allDates.length / DATES_PER_PAGE);
  const paginatedDates = allDates.slice(
    (currentPage - 1) * DATES_PER_PAGE,
    currentPage * DATES_PER_PAGE
  );

  if (loading)
    return <div className="p-6 text-center text-gray-600 text-lg">Loading...</div>;

  return (
    <SessionChecker>
      <ParentLayout>
        <div className="mx-auto p-4 space-y-6">
          <div className="flex items-center bg-white rounded-xl shadow-lg p-4 space-x-4 animate-fade-in">
            <img
              src={userDetails.profilePicture}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                {userDetails.Firstname} {userDetails.Lastname}
              </h2>
              <p className="text-sm text-gray-500">{userDetails.Email}</p>
              <p className="text-sm text-gray-500 capitalize">{userDetails.Role}</p>
            </div>
          </div>

          {paginatedDates.length > 0 ? (
            <>
              {paginatedDates.map((date) => (
                <div key={date} className="space-y-4">
                  <h3 className="text-md font-semibold text-black">{date}</h3>
                  <div className="relative border-l-2 border-gray-200 ml-6 space-y-4">
                    {sessionsByDate[date].map((session, idx) => (
                      <div key={idx} className="relative flex items-start animate-slide-up">
                        <div className="absolute -left-6 mt-1 w-8 h-8 flex-shrink-0">
                          <img
                            src="/taskflow.png"
                            alt="Taskflow"
                            className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                          />
                        </div>

                        <div className="ml-8 p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-300 flex-1">
                          <p
                            className={`font-semibold ${session.status.toLowerCase() === "login" ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {session.status.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">{formatDateTime(session.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-200 text-xs px-4 py-2 rounded"
                >
                  Previous
                </button>
                <span className="text-xs">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 text-xs px-4 py-2 rounded"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">No session logs available</p>
          )}
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="text-xs z-[99999]"
          toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
          progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
        />
      </ParentLayout>
    </SessionChecker>
  );
};

export default SessionLogs;
