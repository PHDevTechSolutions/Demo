"use client";

import React, { useEffect, useState } from "react";
import { MdEdit, MdOutlineClose } from "react-icons/md";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";

interface FormProps {
  editingId: number | null;
  activitystatus: string;
  typeactivity: string;
  remarks: string;
  startdate: string; // ISO string: "YYYY-MM-DDTHH:mm"
  enddate: string;
  activityTypes: string[];
  setActivityStatus: (value: string) => void;
  setTypeActivity: (value: string) => void;
  setRemarks: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  dateUpdated?: string;
}

const Form: React.FC<FormProps> = ({
  editingId,
  activitystatus,
  typeactivity,
  remarks,
  startdate,
  enddate,
  activityTypes,
  setActivityStatus,
  setTypeActivity,
  setRemarks,
  setStartDate,
  setEndDate,
  handleSubmit,
  resetForm,
  dateUpdated,
}) => {
  // Separate date & time parts for start & end
  const [startDatePart, setStartDatePart] = useState(
    startdate ? startdate.split("T")[0] : ""
  );
  const [startTimePart, setStartTimePart] = useState(
    startdate ? startdate.split("T")[1] ?? "00:00" : "00:00"
  );

  const [endDatePart, setEndDatePart] = useState(
    enddate ? enddate.split("T")[0] : ""
  );
  const [endTimePart, setEndTimePart] = useState(
    enddate ? enddate.split("T")[1] ?? "00:00" : "00:00"
  );

  // Sync combined datetime ISO string when date or time changes
  useEffect(() => {
    if (startDatePart && startTimePart) {
      setStartDate(`${startDatePart}T${startTimePart}`);
    }
  }, [startDatePart, startTimePart, setStartDate]);

  useEffect(() => {
    if (endDatePart && endTimePart) {
      setEndDate(`${endDatePart}T${endTimePart}`);
    }
  }, [endDatePart, endTimePart, setEndDate]);

  // Relative time formatter for dateUpdated
  const [relativeTime, setRelativeTime] = useState("");

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    if (dateUpdated) {
      setRelativeTime(formatTimeAgo(dateUpdated));
      const interval = setInterval(() => {
        setRelativeTime(formatTimeAgo(dateUpdated));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [dateUpdated]);

  // Calendar select handlers
  function handleStartDateSelect(date: Date | undefined) {
    if (date) setStartDatePart(date.toISOString().split("T")[0]);
  }

  function handleEndDateSelect(date: Date | undefined) {
    if (date) setEndDatePart(date.toISOString().split("T")[0]);
  }

  return (
    <div className="p-4 border-l flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold">
          {editingId ? "Edit Activity" : "New Activity"}
        </h3>

        {dateUpdated && (
          <p className="text-xs text-gray-400 italic">Last edited {relativeTime}</p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="activitystatus" className="text-xs mb-1">
            Status
          </Label>
          <Select value={activitystatus} onValueChange={setActivityStatus}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="typeactivity" className="text-xs mb-1">
            Activity
          </Label>
          <Select value={typeactivity} onValueChange={setTypeActivity}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select Activity" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="remarks" className="text-xs mb-1">
          Remarks
        </Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={10}
          className="text-xs"
          placeholder="Write your remarks here..."
        />
      </div>

      <div className="flex gap-4">
        {/* Start Date */}
        <div className="flex-1 flex flex-col gap-2">
          <Label htmlFor="startdate" className="text-xs mb-1">
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal text-xs"
              >
                {startDatePart || "Select start date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDatePart ? new Date(startDatePart) : undefined}
                onSelect={handleStartDateSelect}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={startTimePart}
            onChange={(e) => setStartTimePart(e.target.value)}
            step="1"
            className="text-xs"
          />
        </div>

        {/* End Date */}
        <div className="flex-1 flex flex-col gap-2">
          <Label htmlFor="enddate" className="text-xs mb-1">
            End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal text-xs"
              >
                {endDatePart || "Select end date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDatePart ? new Date(endDatePart) : undefined}
                onSelect={handleEndDateSelect}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={endTimePart}
            onChange={(e) => setEndTimePart(e.target.value)}
            step="1"
            className="text-xs"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-1"
            variant="default"
          >
            <MdEdit size={18} /> {editingId ? "Update" : "Submit"}
          </Button>

          {editingId && (
            <Button
              onClick={resetForm}
              variant="outline"
              className="flex items-center gap-1"
            >
              <MdOutlineClose size={18} /> Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
