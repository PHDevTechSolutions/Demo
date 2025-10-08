import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_QUOTA = 35;

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dateStr = today.toISOString().split("T")[0];

    // Skip Sundays
    if (dayOfWeek === 0) {
      return NextResponse.json({
        companies: [],
        remaining_quota: 0,
        message: "No quota on Sundays"
      });
    }

    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = searchParams.get("date") || dateStr;

    if (!referenceid) {
      return NextResponse.json(
        { error: "Missing referenceid" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking daily quota for:", { referenceid, date });

    // 1. Check if already generated today
    const { data: existing, error: existingError } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (existingError) {
      console.error("Supabase query error:", existingError);
      throw existingError;
    }

    if (existing) {
      console.log("✅ Found existing quota:", existing.companies?.length, "companies");
      return NextResponse.json(existing);
    }

    console.log("🆕 No existing quota, generating new one...");

    // 2. Get companies from companies table using Supabase
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, companyname, contactperson, contactnumber, emailaddress, typeclient, address")
      .eq("referenceid", referenceid)
      .limit(DAILY_QUOTA);

    if (companiesError) {
      console.error("Companies query error:", companiesError);
      throw companiesError;
    }

    const companiesArray = companies || [];
    console.log("📊 Fetched companies:", companiesArray.length);

    // 3. Save to daily_quotas
    const { error: insertError } = await supabase
      .from("daily_quotas")
      .insert([{
        referenceid,
        date,
        companies: companiesArray,
        remaining_quota: DAILY_QUOTA,
        updated_at: new Date().toISOString(),
      }]);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log("✅ Saved new daily quota");

    return NextResponse.json({
      companies: companiesArray,
      remaining_quota: DAILY_QUOTA
    });

  } catch (err: any) {
    console.error("❌ API Error:", err.message);
    
    // Return empty data instead of error to prevent UI break
    return NextResponse.json({
      companies: [],
      remaining_quota: 0,
      error: "Service temporarily unavailable"
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { referenceid, date, companies, remaining_quota } = await req.json();

    if (!referenceid || !date) {
      return NextResponse.json(
        { error: "Missing referenceid or date" },
        { status: 400 }
      );
    }

    const safeCompanies = Array.isArray(companies) ? companies : [];
    const safeRemaining = typeof remaining_quota === "number" 
      ? remaining_quota 
      : Math.max(DAILY_QUOTA - safeCompanies.length, 0);

    const { error: upsertError } = await supabase
      .from("daily_quotas")
      .upsert({
        referenceid,
        date,
        companies: safeCompanies,
        remaining_quota: safeRemaining,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'referenceid,date'
      });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      success: true,
      companies: safeCompanies,
      remaining_quota: safeRemaining
    });

  } catch (err: any) {
    console.error("❌ POST Error:", err.message);
    return NextResponse.json(
      { error: "Failed to update quota" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";