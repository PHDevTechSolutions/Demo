import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET() {
  try {
    // ✅ Query only needed fields from progress table
    const rows = await Xchire_sql`
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
      FROM progress;
    `;

    // ✅ Remove metadata + make sure it's plain JSON
    const data = rows.map(r => ({ ...r }));

    return NextResponse.json(
      { success: true, data, count: data.length },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error fetching accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

// ✅ Force-dynamic to avoid Next.js caching issues
export const dynamic = "force-dynamic";
