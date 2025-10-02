// utils/date.ts
export function formatToPHTime(dateString: string) {
  try {
    return new Date(dateString).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24h format
    });
  } catch {
    return dateString;
  }
}
