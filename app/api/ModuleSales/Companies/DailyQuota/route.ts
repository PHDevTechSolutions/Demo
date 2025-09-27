import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_QUOTA = 35;

// ✅ GET → retrieve today's companies + computed quota
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

    // 🔎 Check if today already exists
    const { data: todayRow, error: todayErr } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .single();

    if (!todayErr && todayRow) {
      return NextResponse.json(todayRow);
    }

    // 🕓 If wala pa → check kahapon
    const yesterday = new Date(date);
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
      if (leftover > 0 && yesterdayRow.companies?.length) {
        companies = yesterdayRow.companies;
        todayQuota = DAILY_QUOTA + leftover;

        // 👉 Transfer kahapon → ngayon
        await supabase.from("daily_quotas").upsert(
          {
            referenceid,
            date,
            companies,
            remaining_quota: todayQuota,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "referenceid,date" }
        );

        // 👉 Reset kahapon
        await supabase
          .from("daily_quotas")
          .update({ companies: [], remaining_quota: 0 })
          .eq("referenceid", referenceid)
          .eq("date", yesterdayStr);

        return NextResponse.json({ companies, remaining_quota: todayQuota });
      }
    }

    // 👉 Fresh start (35)
    return NextResponse.json({ companies: [], remaining_quota: DAILY_QUOTA });
  } catch (err: any) {
    console.error("❌ DailyQuota GET error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST → update companies + remaining quota
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, date, companies, remaining_quota } = body;

    if (!referenceid || !date || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // 📝 Upsert today’s quota
    const { data, error } = await supabase
      .from("daily_quotas")
      .upsert(
        {
          referenceid,
          date,
          companies,
          remaining_quota,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "referenceid,date" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ DailyQuota POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
