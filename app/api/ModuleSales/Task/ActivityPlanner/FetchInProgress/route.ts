import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// ✅ Disable all caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

    // 🧠 Main query (always fresh, no cached plan)
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
      LIMIT 50;
    `;

    console.log(`Fetched ${Xchire_fetch.length} activities for ${referenceid}`);

    // ✅ Add cache-control headers para siguradong hindi magre-retain sa edge/CDN
    return NextResponse.json(
      { success: true, data: Xchire_fetch },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("❌ Error fetching accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}