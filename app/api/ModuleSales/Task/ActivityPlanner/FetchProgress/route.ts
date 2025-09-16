import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

// Validate DB URL
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const cacheKey = "progress:all";

    // 1. Check Redis first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("✅ Cache hit for progress");
      return NextResponse.json(
        { success: true, data: cachedData, cached: true },
        { status: 200 }
      );
    }

    // 2. If not cached → fetch from DB
    const Xchire_fetch = await Xchire_sql`
      SELECT 
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress,
        area, activitynumber, source, typeactivity, activitystatus,
        remarks, typecall, sonumber, soamount, callback, callstatus,
        startdate, enddate, quotationnumber, quotationamount,
        projectname, projectcategory, projecttype, targetquota, paymentterm,
        actualsales, deliverydate
      FROM progress;
    `;

    // 3. Save to Redis with TTL (e.g., 60s)
    await redis.set(cacheKey, Xchire_fetch, { ex: 60 });

    console.log("✅ Cache miss → fetched from DB and cached");

    return NextResponse.json(
      { success: true, data: Xchire_fetch, cached: false },
      { status: 200 }
    );
  } catch (Xchire_error: any) {
    console.error("Error fetching progress:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch progress." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Always refresh if cache expired
