import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize Neon connection
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // 🔹 Get today’s daily_quota
    const quotaRes = await Xchire_sql(
      `SELECT * FROM daily_quota WHERE user_id = $1 AND quota_date = $2 LIMIT 1`,
      [userId, today]
    );

    if (quotaRes.length > 0) {
      const row = quotaRes[0];
      return NextResponse.json({
        userId,
        quota: row.remaining_quota,
        totalQuota: row.total_quota,
        companies: row.companies || [],
        quotaDate: row.quota_date,
      });
    }

    // 🔹 If no record for today, fetch latest carry-over
    const lastQuotaRes = await Xchire_sql(
      `SELECT * FROM daily_quota WHERE user_id = $1 ORDER BY quota_date DESC LIMIT 1`,
      [userId]
    );

    let carryOver = 0;
    if (lastQuotaRes.length > 0) {
      carryOver = lastQuotaRes[0].remaining_quota || 0;
    }

    const totalQuota = 35 + carryOver;

    // 🔹 Insert new row for today
    await Xchire_sql(
      `INSERT INTO daily_quota (user_id, quota_date, total_quota, remaining_quota, companies)
       VALUES ($1, $2, $3, $3, $4)`,
      [userId, today, totalQuota, JSON.stringify([])]
    );

    return NextResponse.json({
      userId,
      quota: totalQuota,
      totalQuota,
      companies: [],
      quotaDate: today,
    });
  } catch (err: any) {
    console.error("❌ GetProgress error:", err);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
