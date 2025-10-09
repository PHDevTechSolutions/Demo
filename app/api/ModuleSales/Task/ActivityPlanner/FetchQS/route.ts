import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");

const sql = neon(TASKFLOW_DB_URL);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activitynumber = searchParams.get("activitynumber");
    if (!activitynumber) {
      return NextResponse.json({ success: false, error: "Missing activitynumber" }, { status: 400 });
    }

    const rows = await sql`
      SELECT 
        id,
        companyname,
        contactnumber,
        emailaddress,
        activitynumber,
        referenceid,
        manager,
        tsm,
        activitystatus,
        typeactivity,
        remarks,
        startdate,
        enddate,
        to_char(
          date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila',
          'MM/DD/YYYY HH12:MI:SS AM'
        ) AS date_created,
        date_updated
      FROM activity
      WHERE activitynumber = ${activitynumber}
      ORDER BY date_updated DESC;
    `;

    return NextResponse.json({ success: true, data: rows[0] || null }, { status: 200 }); // <-- single object
  } catch (err: any) {
    console.error("❌ Error fetching task:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch task." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
