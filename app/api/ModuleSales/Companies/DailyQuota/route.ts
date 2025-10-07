import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_QUOTA = 35;

// ✅ GET → retrieve today's companies
export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    if (dayOfWeek === 0) {
      // Skip Sundays
      return NextResponse.json(
        { companies: [], remaining_quota: 0, message: "No quota on Sundays" },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = searchParams.get("date");

    if (!referenceid || !date) {
      return NextResponse.json(
        { error: "Missing referenceid or date" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 1️⃣ Check if today's quota exists
    const { data: todayRow, error } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle(); // returns null if no row

    if (error) throw error;

    if (todayRow) {
      // ✅ Return existing quota
      return NextResponse.json(todayRow, {
        headers: { "Cache-Control": "no-store" },
        status: 200,
      });
    }

    // 2️⃣ Fetch fresh companies only if no quota exists
    const { data: accounts } = await supabase
      .from("companies")
      .select("*")
      .eq("referenceid", referenceid);

    const companies = (accounts || [])
      .sort(() => 0.5 - Math.random())
      .slice(0, DAILY_QUOTA);

    // 3️⃣ Save today's quota (upsert per user/date)
    await supabase.from("daily_quotas").upsert(
      [
        {
          referenceid,
          date,
          companies,
          remaining_quota: DAILY_QUOTA,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "referenceid,date" } // single string
    );

    return NextResponse.json(
      { companies, remaining_quota: DAILY_QUOTA },
      { headers: { "Cache-Control": "no-store" }, status: 200 }
    );
  } catch (err: any) {
    console.error("❌ DailyQuota GET error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// ✅ POST → update daily quota
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, date, companies, remaining_quota } = body;

    if (!referenceid || !date || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Deduplicate companies
    const uniqueCompanies = companies.filter(
      (c, idx, arr) => idx === arr.findIndex((x) => x.id === c.id)
    );

    const safeRemaining =
      typeof remaining_quota === "number"
        ? remaining_quota
        : Math.max(DAILY_QUOTA - uniqueCompanies.length, 0);

    await supabase.from("daily_quotas").upsert(
      [
        {
          referenceid,
          date,
          companies: uniqueCompanies,
          remaining_quota: safeRemaining,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "referenceid,date" }
    );

    return NextResponse.json(
      { success: true, data: { companies: uniqueCompanies, remaining_quota: safeRemaining } },
      { headers: { "Cache-Control": "no-store" }, status: 200 }
    );
  } catch (err: any) {
    console.error("❌ DailyQuota POST error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// Force dynamic rendering (no caching)
export const revalidate = 0;
export const dynamic = "force-dynamic";