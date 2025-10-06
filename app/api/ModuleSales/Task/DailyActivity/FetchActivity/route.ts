import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const activitynumber = url.searchParams.get("activitynumber");

    if (!activitynumber) {
      return NextResponse.json(
        { success: false, error: "Missing activity number." },
        { status: 400 }
      );
    }

    const Xchire_fetch = await Xchire_sql`
      SELECT
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
      WHERE activitynumber = ${activitynumber};
    `;

    // 🟩 Spread to ensure plain JS array
    return NextResponse.json(
      { success: true, data: [...Xchire_fetch] },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error fetching progress data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch progress data.",
      },
      { status: 500 }
    );
  }
}

// Always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
