import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

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

    // ✅ Always fresh fetch
    const rows = await Xchire_sql`
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
        callstatus,
        typecall,
        source,
        startdate,
        enddate,
        to_char(
          date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila',
          'MM/DD/YYYY HH12:MI:SS AM'
        ) AS date_created,
        date_updated,
        quotationnumber,
        sonumber,
        projectcategory,
        soamount,
        actualsales,
        quotationamount
      FROM progress
      WHERE referenceid = ${referenceid}
      ORDER BY date_updated DESC;
    `;

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

// ✅ Force real-time fresh fetch (no caching at all)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";