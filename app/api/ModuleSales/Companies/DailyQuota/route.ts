import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { neon } from "@neondatabase/serverless";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sql = neon(process.env.TASKFLOW_DB_URL!);

const DAILY_QUOTA = 35;

// ✅ GET → retrieve or generate companies for today
export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dateStr = today.toISOString().split("T")[0];

    if (dayOfWeek === 0) {
      return NextResponse.json(
        { companies: [], remaining_quota: 0, message: "No quota on Sundays" },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = searchParams.get("date") || dateStr;

    if (!referenceid) {
      return NextResponse.json({ error: "Missing referenceid" }, { status: 400 });
    }

    // ✅ Check if existing
    const { data: existing, error: existingError } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return NextResponse.json(existing);

    // ✅ Fetch from Neon
    const { rows } = await sql`
      SELECT id, companyname, contactperson, contactnumber, emailaddress, typeclient, address
      FROM companies
      WHERE referenceid = ${referenceid}
      ORDER BY RANDOM()
      LIMIT ${DAILY_QUOTA};
    `;

    const companies = JSON.parse(JSON.stringify(rows));

    // ✅ Save to Supabase
    const { error: insertError } = await supabase.from("daily_quotas").insert([
      {
        referenceid,
        date,
        companies,
        remaining_quota: DAILY_QUOTA,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;

    return NextResponse.json({ companies, remaining_quota: DAILY_QUOTA }, { status: 200 });
  } catch (err) {
    console.error("❌ DailyQuota GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ✅ POST → update companies & remaining quota
export async function POST(req: NextRequest) {
  try {
    const { referenceid, date, companies, remaining_quota } = await req.json();

    if (!referenceid || !date) {
      return NextResponse.json(
        { error: "Missing referenceid or date" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const safeCompanies = Array.isArray(companies) ? companies : [];
    const safeRemaining = typeof remaining_quota === "number"
      ? remaining_quota
      : Math.max(DAILY_QUOTA - safeCompanies.length, 0);

    const { error: upsertError } = await supabase.from("daily_quotas").upsert(
      [
        {
          referenceid,
          date,
          companies: safeCompanies,
          remaining_quota: safeRemaining,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "referenceid,date" }
    );

    if (upsertError) throw upsertError;

    return NextResponse.json(
      { success: true, companies: safeCompanies, remaining_quota: safeRemaining },
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