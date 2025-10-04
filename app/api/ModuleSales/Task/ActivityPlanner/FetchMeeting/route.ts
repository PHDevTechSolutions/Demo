import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");
const sql = neon(TASKFLOW_DB_URL);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");

    if (!referenceid) {
      return NextResponse.json(
        { success: false, error: "Missing referenceid" },
        { status: 400 }
      );
    }

    const meetings = await sql`
  SELECT 
    id,
    referenceid,
    tsm,
    manager,
    to_char(startdate AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS startdate,
    to_char(enddate AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS enddate,
    to_char(date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS date_created,
    typeactivity,
    remarks
  FROM progress
  WHERE referenceid = ${referenceid}
  ORDER BY date_created DESC;
`;

    return NextResponse.json({ success: true, meetings });
  } catch (error: any) {
    console.error("❌ GetMeetings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
