// /api/ModuleSales/Task/ActivityPlanner/FetchProgress/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");

const sql = neon(dbUrl);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");

    if (!referenceid) {
      return NextResponse.json({ success: false, error: "Missing referenceid" }, { status: 400 });
    }

    const rows = await sql`
      SELECT
        id,
        companyname,
        referenceid,
        tsm,
        manager,
        date_created,
        date_updated,
        activitystatus,
        activitynumber,
        quotationnumber,
        quotationamount,
        soamount,
        sonumber,
        typeactivity,
        remarks,
        paymentterm,
        deliverydate,
        actualsales
      FROM progress
      WHERE referenceid = ${referenceid}
        AND activitystatus IN ('Done','Delivered')
      ORDER BY date_created DESC
      LIMIT 50;
    `;

    return NextResponse.json({ success: true, count: rows.length, data: rows }, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ Error fetching progress:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch progress." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
