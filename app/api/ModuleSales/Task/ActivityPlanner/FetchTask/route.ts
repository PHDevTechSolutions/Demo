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
            return NextResponse.json({ success: false, error: "Missing referenceid" }, { status: 400 });
        }

        const rows = await Xchire_sql`
      SELECT 
        id, companyname, contactnumber, emailaddress, activitynumber, referenceid, manager, tsm,
        activitystatus, typeactivity, remarks, startdate, enddate,
        date_created, date_updated, quotationnumber, sonumber, projectcategory,
        soamount, actualsales, quotationamount
      FROM progress
      WHERE referenceid = ${referenceid}
      ORDER BY date_created DESC;
    `;

        return NextResponse.json({ success: true, data: rows }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch tasks." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
