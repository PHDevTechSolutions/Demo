import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

// ✅ Reuse Neon connection
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
      FROM progress
      ORDER BY date_created DESC;
    `;

    // ✅ Convert Neon Row objects to plain JSON
    const data = rows.map((row) => ({ ...row }));

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("❌ Error fetching progress:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch progress.",
      },
      { status: 500 }
    );
  }
}

// ✅ Force dynamic fetch (avoid Next.js caching issues)
export const dynamic = "force-dynamic";
