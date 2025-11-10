"use client";

import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { type DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import Tools from "../Modal/AC_Modal";

import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

// Calendar23 component with controlled range
function Calendar23({
  range,
  setRange,
}: {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dates"
            className="w-56 justify-between font-normal text-xs"
          >
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            captionLayout="dropdown"
            onSelect={setRange}
          />
        </PopoverContent>
      </Popover>

    </div>
  );
}

const Table: React.FC<TableProps> = ({ posts }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Helper function for week of month
  function getWeekOfMonth(date: Date) {
    const start = startOfMonth(date);
    const diff = differenceInDays(date, start) + 1;
    if (diff <= 7) return "Week 1";
    if (diff <= 14) return "Week 2";
    if (diff <= 21) return "Week 3";
    if (diff <= 28) return "Week 4";
    return "Week 5";
  }

  // Generate calendar days for currentMonth
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

  // Filter posts based on dateRange, selectedWeek and searchTerm
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((post) => {
        const postDate = parseISO(post.date_created);
        return isWithinInterval(postDate, { start: dateRange.from!, end: dateRange.to! });
      });
    }

    if (selectedWeek && selectedWeek !== "all") {
      filtered = filtered.filter((post) => {
        const postDate = parseISO(post.date_created);
        return getWeekOfMonth(postDate) === selectedWeek;
      });
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          (post.companyname?.toLowerCase() ?? "").includes(lowerSearch) ||
          (post.contactperson?.toLowerCase() ?? "").includes(lowerSearch) ||
          (post.contactnumber?.toLowerCase() ?? "").includes(lowerSearch) ||
          (post.typeactivity?.toLowerCase() ?? "").includes(lowerSearch) ||
          (post.remarks?.toLowerCase() ?? "").includes(lowerSearch)
        );
      });
    }

    return filtered;
  }, [posts, dateRange, selectedWeek, searchTerm]);

  // Group posts by day string
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
      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_150px] gap-4 mb-6 items-end">
        {/* Search input */}
        <div className="flex flex-col">
          <Label htmlFor="search" className="text-xs font-semibold mb-2">
            Search
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs w-full"
          />
        </div>

        {/* Date Range Calendar with Popover */}
        <div className="flex flex-col">
          <Label className="text-xs font-semibold mb-2">
            Filter by Date Range
          </Label>
          <Calendar23 range={dateRange} setRange={setDateRange} />
        </div>

        {/* Week Select */}
        <div className="flex flex-col">
          <Label htmlFor="weekFilter" className="text-xs font-semibold mb-2">
            Filter by Week
          </Label>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger id="weekFilter" className="w-full text-xs">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Weeks</SelectItem>
                {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => (
                  <SelectItem key={week} value={week}>
                    {week}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedWeek !== "all" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setSelectedWeek("all")}
            >
              Clear Week Filter
            </Button>
          )}
        </div>
      </div>

      {/* CALENDAR NAV */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevMonth}
          aria-label="Previous month"
          className="px-2 py-1"
        >
          &lt;
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
          aria-label="Next month"
          className="px-2 py-1"
        >
          &gt;
        </Button>
      </div>

      {/* DAYS OF WEEK HEADER */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="py-1 border border-gray-200 bg-gray-100 select-none"
          >
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR DAYS */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const hasPosts = !!postsByDay[dayStr]?.length;
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          // Check if day is in dateRange to enable or disable
          const isEnabled =
            !dateRange?.from ||
            !dateRange?.to ||
            isWithinInterval(day, { start: dateRange.from, end: dateRange.to });

          return (
            <Button
              key={idx}
              variant={isSelected ? "default" : "outline"}
              disabled={!isEnabled || !isCurrentMonth}
              onClick={() => isCurrentMonth && isEnabled && setSelectedDate(day)}
              title={hasPosts ? `${postsByDay[dayStr].length} post(s)` : undefined}
              className="cursor-pointer h-16 p-1 relative flex flex-col justify-between text-xs"
            >
              <div className={`text-right ${!isCurrentMonth ? "text-gray-400" : ""}`}>
                {day.getDate()}
              </div>
              {hasPosts && <Badge className="mx-auto mt-auto rounded-full w-3 h-3 bg-green-500" />}
            </Button>
          );
        })}
      </div>

      {/* TOOLS MODAL */}
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
