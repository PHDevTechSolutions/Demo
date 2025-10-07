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
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    let date = searchParams.get("date");

    // 🕒 Auto-correct to local (Philippine) date if not provided or outdated
    const localDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
    if (!date) date = localDate;

    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0) {
      return NextResponse.json(
        { companies: [], remaining_quota: 0, message: "No quota on Sundays" },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!referenceid) {
      return NextResponse.json(
        { error: "Missing referenceid" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Check if today's quota exists
    const { data: todayRow, error } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota, date")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (error) throw error;

    if (todayRow) {
      return NextResponse.json(todayRow, {
        headers: { "Cache-Control": "no-store" },
        status: 200,
      });
    }

    // Fetch fresh companies only if no quota exists
    const { data: accounts } = await supabase
      .from("companies")
      .select("*")
      .eq("referenceid", referenceid);

    const companies = (accounts || [])
      .sort(() => 0.5 - Math.random())
      .slice(0, DAILY_QUOTA);

    // Save today's quota
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
      { onConflict: "referenceid,date" }
    );

    return NextResponse.json(
      { companies, remaining_quota: DAILY_QUOTA, date },
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

    if (!referenceid || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const safeDate =
      date || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

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
          date: safeDate,
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

export const revalidate = 0;
export const dynamic = "force-dynamic";