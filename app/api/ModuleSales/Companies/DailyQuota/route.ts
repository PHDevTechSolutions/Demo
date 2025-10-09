import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";

const sql = neon(process.env.TASKFLOW_DB_URL!); // Neon source
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
    const date = searchParams.get("date");

    if (!referenceid || !date)
      return NextResponse.json({ error: "Missing referenceid or date" }, { status: 400 });

    const today = new Date();
    if (today.getDay() === 0)
      return NextResponse.json({ companies: [], remaining_quota: 0, message: "Sunday" });

    // 1️⃣ Check if existing daily quota
    const { data: todayRow, error } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (error) throw error;

    if (todayRow)
      return NextResponse.json(todayRow, { headers: { "Cache-Control": "no-store" } });

    // 2️⃣ Fetch companies from Neon
    const accounts = await sql`
      SELECT id, companyname, contactperson, contactnumber, emailaddress, typeclient, address
      FROM companies
      WHERE referenceid = ${referenceid}
    `;

    if (!accounts.length)
      return NextResponse.json(
        { error: "No companies found for this referenceid" },
        { status: 404 }
      );

    const companies = accounts.sort(() => 0.5 - Math.random()).slice(0, DAILY_QUOTA);

    // 3️⃣ Save to Supabase
    const { error: upsertError } = await supabase.from("daily_quotas").upsert(
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

    if (upsertError) throw upsertError;

    return NextResponse.json(
      { companies, remaining_quota: DAILY_QUOTA },
      { headers: { "Cache-Control": "no-store" }, status: 200 }
    );
  } catch (err: any) {
    console.error("❌ DailyQuota GET error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST → update daily quota
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, date, companies, remaining_quota } = body;

    if (!referenceid || !date || !Array.isArray(companies))
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const uniqueCompanies = companies.filter(
      (c, idx, arr) => idx === arr.findIndex((x) => x.id === c.id)
    );

    const safeRemaining =
      typeof remaining_quota === "number"
        ? remaining_quota
        : Math.max(DAILY_QUOTA - uniqueCompanies.length, 0);

    const { error } = await supabase.from("daily_quotas").upsert(
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

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: { companies: uniqueCompanies, remaining_quota: safeRemaining } },
      { headers: { "Cache-Control": "no-store" }, status: 200 }
    );
  } catch (err: any) {
    console.error("❌ DailyQuota POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
