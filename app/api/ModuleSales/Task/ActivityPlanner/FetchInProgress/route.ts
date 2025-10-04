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

    // ✅ Force timezone to Asia/Manila
    const Xchire_fetch = await Xchire_sql`
  SELECT id,
       companyname,
       contactperson,
       contactnumber,
       emailaddress,
       typeclient,
       referenceid,
       to_char(date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila','MM/DD/YYYY HH12:MI:SS AM') AS date_created,
       activitynumber,
       address,
       area,
       deliveryaddress,
       ticketreferencenumber,
       to_char(date_updated AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila','MM/DD/YYYY HH12:MI:SS AM') AS date_updated,
       source,
       activitystatus
FROM activity
WHERE referenceid = ${referenceid}
ORDER BY date_updated DESC
LIMIT 200;

`;
    console.log("Fetched accounts (Manila time):", Xchire_fetch);

    return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
  } catch (Xchire_error: any) {
    console.error("Error fetching accounts:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
