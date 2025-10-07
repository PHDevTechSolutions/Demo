import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_QUOTA = 35;

function getPHDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

// ✅ GET – retrieve or generate today’s quota
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = getPHDate();

    if (!referenceid)
      return NextResponse.json({ error: "Missing referenceid" }, { status: 400 });

    const now = new Date();
    if (now.getDay() === 0)
      return NextResponse.json({ companies: [], remaining_quota: 0, message: "No quota on Sundays" });

    // 1️⃣ check if today's quota exists
    const { data: today, error: todayErr } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (todayErr) throw todayErr;

    // if already generated and has 35 companies, return it
    if (today && Array.isArray(today.companies) && today.companies.length === DAILY_QUOTA) {
      return NextResponse.json(today);
    }

    // 2️⃣ get all companies for this user
    const { data: companiesList, error: listErr } = await supabase
      .from("companies")
      .select("*")
      .eq("referenceid", referenceid);

    if (listErr) throw listErr;

    // 3️⃣ shuffle and take up to 35 (or repeat if fewer)
    let companies: any[] = [];
    if (companiesList && companiesList.length > 0) {
      const shuffled = [...companiesList].sort(() => 0.5 - Math.random());
      while (companies.length < DAILY_QUOTA) {
        const needed = DAILY_QUOTA - companies.length;
        companies.push(...shuffled.slice(0, Math.min(needed, shuffled.length)));
      }
      companies = companies.slice(0, DAILY_QUOTA); // exact 35
    }

    // 4️⃣ save to DB
    await supabase.from("daily_quotas").upsert(
      [{
        referenceid,
        date,
        companies,
        remaining_quota: DAILY_QUOTA,
        updated_at: new Date().toISOString(),
      }],
      { onConflict: "referenceid,date" }
    );

    return NextResponse.json({ companies, remaining_quota: DAILY_QUOTA });
  } catch (err: any) {
    console.error("❌ GET DailyQuota:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST – update quota
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, companies, remaining_quota } = body;
    const date = getPHDate();

    if (!referenceid || !Array.isArray(companies))
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const unique = companies.filter(
      (c, i, arr) => i === arr.findIndex((x) => x.id === c.id)
    );

    await supabase.from("daily_quotas").upsert(
      [{
        referenceid,
        date,
        companies: unique,
        remaining_quota: typeof remaining_quota === "number"
          ? remaining_quota
          : Math.max(DAILY_QUOTA - unique.length, 0),
        updated_at: new Date().toISOString(),
      }],
      { onConflict: "referenceid,date" }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ POST DailyQuota:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const revalidate = 0;
export const dynamic = "force-dynamic";