import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

// Validate environment variable and initialize database client
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const cacheKey = "activity:all";

    // 1. Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("✅ Cache hit for activity");
      return NextResponse.json(
        { success: true, data: cachedData, cached: true },
        { status: 200 }
      );
    }

    // 2. If no cache, fetch from DB
    const Xchire_fetch = await Xchire_sql`
      SELECT 
        id, 
        companyname, 
        contactperson, 
        contactnumber, 
        emailaddress, 
        typeclient, 
        referenceid,
        date_created, 
        activitynumber, 
        address, 
        area, 
        deliveryaddress,
        source, 
        activitystatus
      FROM activity;
    `;

    // 3. Save result to Redis (with TTL, e.g., 60 seconds)
    await redis.set(cacheKey, Xchire_fetch, { ex: 60 });

    console.log("✅ Cache miss → fetched from DB and stored in Redis");

    return NextResponse.json(
      { success: true, data: Xchire_fetch, cached: false },
      { status: 200 }
    );
  } catch (Xchire_error: any) {
    console.error("Error fetching activity:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch activity." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; 