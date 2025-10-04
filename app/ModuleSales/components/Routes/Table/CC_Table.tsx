import React, { useEffect, useState, useMemo } from "react";
import {
  format,
  parseISO,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  getDay,
  addDays,
  isSameDay,
  isWithinInterval,
} from "date-fns";

import Tools from "../Modal/AC_Modal";

interface Post {
  companyname: string;
  contactperson: string;
  contactnumber: string;
  typeactivity: string;
  date_created: string;
  remarks: string;
}

interface TableProps {
  posts: Post[];
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded p-4 max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Table: React.FC<TableProps> = ({ posts }) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter((post) => {
        const postDate = parseISO(post.date_created);
        return isWithinInterval(postDate, { start: startDate, end: endDate });
      });
    }

    if (selectedWeek) {
      filtered = filtered.filter((post) => {
        const postDate = parseISO(post.date_created);
        return getWeekOfMonth(postDate) === selectedWeek;
      });
    }

    return filtered;
  }, [posts, dateRange, selectedWeek]);

  function getWeekOfMonth(date: Date) {
    const start = startOfMonth(date);
    const diff = differenceInDays(date, start) + 1;
    if (diff <= 7) return "Week 1";
    if (diff <= 14) return "Week 2";
    if (diff <= 21) return "Week 3";
    if (diff <= 28) return "Week 4";
    return "Week 5";
  }

  function getCalendarDays(month: Date) {
    const startMonth = startOfMonth(month);
    const endMonth = endOfMonth(month);
    const startDayOfWeek = getDay(startMonth);
    const daysInMonth = differenceInDays(endMonth, startMonth) + 1;

    const days: Date[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(addDays(startMonth, i - startDayOfWeek));
    }

    for (let i = 0; i < daysInMonth; i++) {
      days.push(addDays(startMonth, i));
    }

    while (days.length % 7 !== 0) {
      days.push(addDays(endMonth, days.length - daysInMonth - startDayOfWeek));
    }

    return days;
  }

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    filteredPosts.forEach((post) => {
      const dayKey = format(parseISO(post.date_created), "yyyy-MM-dd");
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push(post);
    });
    return map;
  }, [filteredPosts]);

  function prevMonth() {
    setCurrentMonth(addDays(startOfMonth(currentMonth), -1));
  }
  function nextMonth() {
    setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  }

  const selectedPosts = selectedDate
    ? postsByDay[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <label className="text-xs font-semibold" htmlFor="startDate">
          Start Date:
        </label>
        <input
          id="startDate"
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="border p-2 text-xs rounded"
        />
        <label className="text-xs font-semibold" htmlFor="endDate">
          End Date:
        </label>
        <input
          id="endDate"
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="border p-2 text-xs rounded"
        />
        <button
          onClick={() => {
            setDateRange({ start: "", end: "" });
            setSelectedWeek("");
          }}
          className="px-3 py-1 text-xs bg-gray-300 rounded"
        >
          Clear Filters
        </button>

        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="border p-2 text-xs rounded"
        >
          <option value="">Filter by Week</option>
          {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => (
            <option key={week} value={week}>
              {week}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="px-2 py-1 border rounded">
          &lt;
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button onClick={nextMonth} className="px-2 py-1 border rounded">
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="py-1 border border-gray-200 bg-gray-100">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const hasPosts = !!postsByDay[dayStr]?.length;
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <div
              key={idx}
              onClick={() => isCurrentMonth && setSelectedDate(day)}
              className={`cursor-pointer h-16 p-1 border rounded relative text-xs
                ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                ${isSelected ? "border-blue-500 bg-blue-100" : "border-gray-200"}
                flex flex-col justify-between
              `}
              title={hasPosts ? `${postsByDay[dayStr].length} post(s)` : undefined}
            >
              <div className="text-right">{day.getDate()}</div>
              {hasPosts && (
                <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mt-auto"></div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
  <Tools
    selectedDate={selectedDate}
    selectedPosts={selectedPosts}
    onClose={() => setSelectedDate(null)}
  />
)}
    </div>
  );
};

export default Table;
