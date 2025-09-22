import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10); // default 100 rows
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // ✅ Select only needed fields + paginate
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
      ORDER BY date_created DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    // ✅ Strip Neon metadata (convert to plain JSON)
    const plainData = rows.map(r => ({ ...r }));

    return NextResponse.json(
      { success: true, data: plainData, count: plainData.length },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
