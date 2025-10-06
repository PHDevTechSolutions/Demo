import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_QUOTA = 35;

// ✅ GET → Retrieve daily quota (with skip check)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = searchParams.get("date");

    if (!referenceid || !date) {
      return NextResponse.json(
        { error: "Missing referenceid or date" },
        { status: 400 }
      );
    }

    const currentDate = new Date(date).toISOString().split("T")[0];

    // 🔎 Check if today falls inside a skip range
    const { data: skipRows, error: skipError } = await supabase
      .from("skips")
      .select("id, startdate, enddate, status")
      .eq("referenceid", referenceid)
      .eq("status", "skip");

    if (skipError) throw skipError;

    // ✅ Fix: Properly check if today is BETWEEN startdate and enddate (inclusive)
    const isSkipped = skipRows?.some((s) => {
      return currentDate >= s.startdate && currentDate <= s.enddate;
    });

    if (isSkipped) {
      return NextResponse.json({
        companies: [],
        remaining_quota: 0,
        skipped: true,
        message: "⏸ Skipped due to active skip period",
      });
    }

    // 🔎 Check if quota already exists for today
    const { data: todayRow } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", currentDate)
      .single();

    if (todayRow) {
      return NextResponse.json(todayRow);
    }

    // 🕓 If not found, check yesterday
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: yesterdayRow } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", yesterdayStr)
      .single();

    let todayQuota = DAILY_QUOTA;
    let companies: any[] = [];

    if (yesterdayRow) {
      const leftover = yesterdayRow.remaining_quota ?? 0;

      if (leftover > 0 && Array.isArray(yesterdayRow.companies)) {
        const leftoverCompanies = yesterdayRow.companies;
        todayQuota = DAILY_QUOTA + leftover;

        // Fetch all available companies
        const { data: accounts } = await supabase
          .from("companies")
          .select("*")
          .eq("referenceid", referenceid);

        let newCompanies: any[] = [];
        if (accounts && accounts.length > 0) {
          newCompanies = accounts
            .filter((acc) => !leftoverCompanies.find((c) => c.id === acc.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, DAILY_QUOTA);
        }

        companies = [...leftoverCompanies, ...newCompanies];

        await supabase.from("daily_quotas").upsert(
          {
            referenceid,
            date: currentDate,
            companies,
            remaining_quota: todayQuota,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "referenceid,date" }
        );

        await supabase
          .from("daily_quotas")
          .update({ companies: [], remaining_quota: 0 })
          .eq("referenceid", referenceid)
          .eq("date", yesterdayStr);

        return NextResponse.json({ companies, remaining_quota: todayQuota });
      }
    }

    // 🧮 No previous data — start fresh
    return NextResponse.json({
      companies: [],
      remaining_quota: DAILY_QUOTA,
      skipped: false,
    });
  } catch (err: any) {
    console.error("❌ DailyQuota GET error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST → Save or update daily quota (with skip validation)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, date, companies, remaining_quota } = body;

    if (!referenceid || !date || !Array.isArray(companies)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const currentDate = new Date(date).toISOString().split("T")[0];

    // 🔎 Check skip period before saving
    const { data: skips, error: skipError } = await supabase
      .from("skips")
      .select("startdate, enddate, status")
      .eq("referenceid", referenceid)
      .eq("status", "skip");

    if (skipError) throw skipError;

    const isSkipped = skips?.some(
      (s) => currentDate >= s.startdate && currentDate <= s.enddate
    );

    if (isSkipped) {
      return NextResponse.json({
        companies: [],
        remaining_quota: 0,
        skipped: true,
        message: "🚫 Cannot update quota inside skip period",
      });
    }

    // Deduplicate companies
    const uniqueCompanies = companies.filter(
      (comp, index, self) =>
        index === self.findIndex((c) => c.id === comp.id)
    );

    // Compute remaining
    const safeRemaining =
      typeof remaining_quota === "number"
        ? remaining_quota
        : Math.max(DAILY_QUOTA - uniqueCompanies.length, 0);

    const { data, error } = await supabase
      .from("daily_quotas")
      .upsert(
        {
          referenceid,
          date: currentDate,
          companies: uniqueCompanies,
          remaining_quota: safeRemaining,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "referenceid,date" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      skipped: false,
    });
  } catch (err: any) {
    console.error("❌ DailyQuota POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
