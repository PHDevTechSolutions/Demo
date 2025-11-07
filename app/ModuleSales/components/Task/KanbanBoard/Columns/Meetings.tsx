"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MeetingForm from "./Form/MeetingForm";

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Manager: string;
  TSM: string;
  Role: string;
  profilePicture?: string;
  [key: string]: any;
}

interface MeetingItem {
  id: string;
  referenceid: string;
  tsm: string;
  manager: string;
  startdate: string;
  enddate: string;
  typeactivity: string;
  remarks: string;
  date_created: string;
}

interface AgentData {
  Firstname: string;
  Lastname: string;
  profilePicture: string;
}

interface MeetingsProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getNowInPH = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

const getNowInPHPlusMinutes = (minutes: number) => {
  const base = getNowInPH();
  base.setMinutes(base.getMinutes() + minutes);
  return base;
};

const Meetings: React.FC<MeetingsProps> = ({ userDetails, refreshTrigger }) => {
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("pick");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeactivity, setTypeactivity] = useState("Client Meeting");
  const [remarks, setRemarks] = useState("");
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<Record<string, AgentData>>({});

  const agentCache = useRef<Record<string, AgentData>>({});

  // ✅ Fix typing and fetch logic for agent details
  const fetchAgents = useCallback(async (referenceIds: string[]) => {
    const uniqueMissing = referenceIds.filter(
      (ref) => !agentCache.current[ref]
    );

    if (uniqueMissing.length === 0) return;

    try {
      const results = await Promise.all(
        uniqueMissing.map(async (ref) => {
          try {
            const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(ref)}`);
            const data = await res.json();

            return {
              ref,
              data: {
                Firstname: data?.Firstname || "",
                Lastname: data?.Lastname || "",
                profilePicture: data?.profilePicture || "/taskflow.png",
              },
            };
          } catch {
            return {
              ref,
              data: {
                Firstname: "",
                Lastname: "",
                profilePicture: "/taskflow.png",
              },
            };
          }
        })
      );

      const newMap: Record<string, AgentData> = {};
      results.forEach(({ ref, data }) => {
        agentCache.current[ref] = data;
        newMap[ref] = data;
      });

      setAgentData((prev) => ({ ...prev, ...newMap }));
    } catch (e) {
      console.error("Agent fetch error:", e);
    }
  }, []);

  // 🧩 Fetch meetings
  const fetchMeetings = async () => {
    try {
      if (!userDetails || !userDetails.ReferenceID) return;

      let url = `/api/ModuleSales/Task/ActivityPlanner/FetchMeeting?`;

      if (userDetails.Role === "Manager") {
        url += `manager=${userDetails.ReferenceID}`;
      } else if (
        userDetails.Role === "Territory Sales Manager" ||
        userDetails.Role === "TSM"
      ) {
        url += `tsm=${userDetails.ReferenceID}`;
      } else {
        url += `referenceid=${userDetails.ReferenceID}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to fetch meetings");

      const filteredMeetings: MeetingItem[] = (data.meetings || []).filter(
        (m: MeetingItem) =>
          m.typeactivity === "Client Meeting" ||
          m.typeactivity === "Group Meeting"
      );

      const today = getNowInPH();
      const meetingsToday = filteredMeetings.filter((m: MeetingItem) => {
        const start = new Date(m.startdate);
        const end = new Date(m.enddate);
        return (
          (start.getFullYear() === today.getFullYear() &&
            start.getMonth() === today.getMonth() &&
            start.getDate() === today.getDate()) ||
          (end.getFullYear() === today.getFullYear() &&
            end.getMonth() === today.getMonth() &&
            end.getDate() === today.getDate())
        );
      });

      setMeetings(meetingsToday);

      // 🧠 Fetch all related agent profiles
      const ids = Array.from(
        new Set(
          meetingsToday.flatMap((m) => [m.referenceid, m.tsm, m.manager])
        )
      ).filter((id): id is string => typeof id === "string" && id.trim() !== "");

      await fetchAgents(ids);
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      toast.error(err.message || "Failed to load meetings");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [userDetails, refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate) return toast.error("Please select a start date");
    if (mode === "pick" && !endDate) return toast.error("Please select an end date");
    if (new Date(startDate) >= new Date(endDate))
      return toast.error("End date must be later than start date");

    try {
      if (!userDetails) throw new Error("User details missing");

      const payload = {
        referenceid: userDetails.ReferenceID,
        tsm: userDetails.TSM,
        manager: userDetails.Manager,
        startdate: new Date(startDate).toISOString(),
        enddate: new Date(endDate).toISOString(),
        typeactivity,
        remarks,
      };

      const res = await fetch(`/api/ModuleSales/Task/ActivityPlanner/SubmitMeeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to save meeting");

      toast.success("✅ Meeting saved successfully!");
      setShowForm(false);
      setStartDate("");
      setEndDate("");
      setMode("pick");
      setTypeactivity("Client Meeting");
      setRemarks("");
      fetchMeetings();
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  // ✅ Only TSAs can add meetings
  const canAddMeeting =
    userDetails &&
    userDetails.Role !== "Manager" &&
    userDetails.Role !== "Territory Sales Manager" &&
    userDetails.Role !== "TSM";

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">📅</span>
        Total Meetings Today:
        <span className="ml-1 text-red-500">{meetings.length}</span>
      </h3>

      <div className="space-y-2 mb-4">
        {meetings.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-4">
            No meetings scheduled for today
          </p>
        )}

        {meetings.map((m) => {
          const isExpanded = expanded === m.id;
          const agent = agentData[m.referenceid];

          return (
            <div
              key={m.id}
              className="rounded-2xl border border-gray-200 shadow-sm bg-gray-50 hover:shadow-md transition overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:bg-blue-100 transition"
                onClick={() => setExpanded(isExpanded ? null : m.id)}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={agent?.profilePicture || "/taskflow.png"}
                    alt="profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {agent
                        ? `${agent.Firstname} ${agent.Lastname}`
                        : m.referenceid}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {m.typeactivity} • {m.startdate} → {m.enddate}
                    </p>
                  </div>
                </div>
                <span className="ml-2 text-[12px] text-gray-500">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="p-4 space-y-2 bg-white border-t border-gray-200 text-xs text-gray-700">
                  <p>
                    📌 <span className="font-semibold">Remarks:</span>{" "}
                    {m.remarks || "-"}
                  </p>
                  <p>
                    🕒 <span className="font-semibold">Created:</span>{" "}
                    {m.date_created || "-"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ Add form visible only if allowed */}
      {showForm && userDetails && canAddMeeting && (
        <MeetingForm
          mode={mode}
          startDate={startDate}
          endDate={endDate}
          typeactivity={typeactivity}
          remarks={remarks}
          setMode={setMode}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setTypeactivity={setTypeactivity}
          setRemarks={setRemarks}
          handleDurationChange={(v) => {
            setMode(v);
            if (v !== "pick") {
              const minutes = v === "30" ? 30 : v === "60" ? 60 : v === "120" ? 120 : 180;
              const start = getNowInPH();
              const end = getNowInPHPlusMinutes(minutes);
              setStartDate(formatDateTimeLocal(start));
              setEndDate(formatDateTimeLocal(end));
            } else {
              setStartDate("");
              setEndDate("");
            }
          }}
          handleSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {canAddMeeting && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="border border-blue-500 text-black text-xs px-3 py-2 w-full rounded-md hover:bg-blue-400 hover:text-white mt-2"
          >
            {showForm ? "Cancel" : "+ Add Meeting"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Meetings;
