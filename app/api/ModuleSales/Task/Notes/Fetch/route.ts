import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET() {
  try {
    // Fetch only the required columns
    const Xchire_fetch = await Xchire_sql`
      SELECT 
        id, 
        activitynumber, 
        referenceid, 
        manager, 
        tsm, 
        activitystatus, 
        typeactivity, 
        remarks, 
        startdate, 
        enddate, 
        date_created, 
        date_updated
      FROM progress;
    `;

    console.log("Fetched progress data:", Xchire_fetch); // Debugging line

    return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
  } catch (Xchire_error: any) {
    console.error("Error fetching progress data:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch progress data." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
