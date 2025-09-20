import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET() {
  try {
    // Piliin lang ang specific fields na gusto mo
    const Xchire_fetch = await Xchire_sql`
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

    console.log("Fetched accounts:", Xchire_fetch); // Optional debugging

    return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
  } catch (Xchire_error: any) {
    console.error("Error fetching accounts:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Always fetch fresh data
