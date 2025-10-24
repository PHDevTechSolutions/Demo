import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const db = neon(TASKFLOW_DB_URL);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");

    if (!referenceid) {
      return NextResponse.json(
        { success: false, error: "Missing referenceid parameter" },
        { status: 400 }
      );
    }

    const results = await db`
      SELECT 
        id,
        tsm,
        manager,
        ticketreferencenumber,
        companyname,
        contactperson,
        contactnumber,
        emailaddress,
        address,
        wrapup,
        inquiries,
        typeclient,
        remarks,
        referenceid,
        activitynumber,
        activitystatus,
        typecall,
        callback,
        typeactivity,
        scheduled_status
      FROM progress
      WHERE referenceid = ${referenceid}
         OR tsm = ${referenceid}
         OR manager = ${referenceid};
    `;

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching progress data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
