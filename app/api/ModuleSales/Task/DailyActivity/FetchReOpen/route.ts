import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// 🧩 Database Connection
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

// 🧠 Main GET Handler
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activitynumber = searchParams.get("activitynumber");

    if (!activitynumber) {
      return NextResponse.json(
        { success: false, error: "Missing activitynumber parameter." },
        { status: 400 }
      );
    }

    // 🟢 Fetch matching record from `progress` table
    const result = await Xchire_sql`
      SELECT
        projectname,
        projectcategory,
        projecttype,
        source,
        targetquota,
        startdate,
        enddate,
        typeactivity,
        callback,
        callstatus,
        typecall,
        quotationnumber,
        quotationamount,
        sonumber,
        soamount,
        actualsales,
        remarks,
        activitystatus,
        activitynumber,
        to_char(date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila',
          'MM/DD/YYYY HH12:MI:SS AM') AS date_created
      FROM progress
      WHERE activitynumber = ${activitynumber}
      ORDER BY date_created DESC
      LIMIT 1;
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: true, data: [] }, // empty result is still success
        { status: 200 }
      );
    }

    // 🧹 Clean structured output
    const record = result[0];
    const formatted = {
      activitynumber: record.activitynumber,
      activitystatus: record.activitystatus,
      quotationnumber: record.quotationnumber ?? null,
      quotationamount: record.quotationamount ?? null,
      sonumber: record.sonumber ?? null,
      soamount: record.soamount ?? null,
      actualsales: record.actualsales ?? null,
      remarks: record.remarks ?? null,
      date_created: record.date_created,
    };

    return NextResponse.json(
      { success: true, data: [formatted] },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error fetching progress data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch progress data.",
      },
      { status: 500 }
    );
  }
}

// ⚡ Always fetch fresh data (no caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
