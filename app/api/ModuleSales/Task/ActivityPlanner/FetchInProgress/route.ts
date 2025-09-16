import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createClient } from "redis";

// Neon
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

// Redis
let redis: any;
async function getRedisClient() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (err: any) => console.error("❌ Redis Client Error", err));
    await redis.connect();
  }
  return redis;
}

export async function GET() {
  try {
    const redisClient = await getRedisClient();
    const cacheKey = "activities:all";

    // 1️⃣ Try Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("✅ Data served from Redis");
      return NextResponse.json(
        { success: true, source: "redis", data: JSON.parse(cached) },
        { status: 200 }
      );
    }

    // 2️⃣ If no cache → fetch from Neon DB
    const Xchire_fetch = await Xchire_sql`
      SELECT id, companyname, contactperson, contactnumber, emailaddress, typeclient, referenceid,
             date_created, activitynumber, address, area, deliveryaddress,
             source, activitystatus
      FROM activity;
    `;

    // 3️⃣ Save to Redis with 60s expiry
    await redisClient.set(cacheKey, JSON.stringify(Xchire_fetch), { EX: 60 });

    console.log("✅ Data served from DB and cached in Redis");
    return NextResponse.json(
      { success: true, source: "db", data: Xchire_fetch },
      { status: 200 }
    );
  } catch (Xchire_error: any) {
    console.error("❌ Error fetching accounts:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
