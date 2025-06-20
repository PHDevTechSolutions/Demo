// Features/Calendar.tsx
import React, { useState } from "react";

interface CalendarProps {
  title: string;
  details: string;
  start: Date;
  end: Date;
}

export const formatDateForCalendar = (d: Date) =>
  d.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, -1) + "Z";

export const buildGoogleCalendarUrl = ({ title, details, start, end }: CalendarProps) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    dates: `${formatDateForCalendar(start)}/${formatDateForCalendar(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const buildOutlookCalendarUrl = ({ title, details, start, end }: CalendarProps) => {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    body: details,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const buildICSFileContent = ({ title, details, start, end }: CalendarProps) => {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//EN
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${formatDateForCalendar(new Date())}
DTSTART:${formatDateForCalendar(start)}
DTEND:${formatDateForCalendar(end)}
SUMMARY:${title}
DESCRIPTION:${details}
END:VEVENT
END:VCALENDAR`;
};

const Calendar: React.FC<CalendarProps> = ({ title, details, start, end }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleDownloadICS = () => {
    const icsContent = buildICSFileContent({ title, details, start, end });
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "event.ics";
    link.click();

    URL.revokeObjectURL(url);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <p className="font-semibold text-gray-600 text-xs">Optional:</p>
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="mb-2 px-3 py-1 bg-orange-400 text-white rounded text-xs hover:bg-orange-500"
      >
        Save to Calendar?
      </button>

      {showOptions && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow w-48 text-xs">
          <a
            href={buildGoogleCalendarUrl({ title, details, start, end })}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 hover:bg-gray-100"
            onClick={() => setShowOptions(false)}
          >
            Google Calendar
          </a>
          <a
            href={buildOutlookCalendarUrl({ title, details, start, end })}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 hover:bg-gray-100"
            onClick={() => setShowOptions(false)}
          >
            Outlook Calendar
          </a>
          <button
            onClick={handleDownloadICS}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Download iCal (.ics)
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
