// API: /api/ModuleSales/Companies/DailyQuota
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { neon } from "@neondatabase/serverless";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sql = neon(process.env.TASKFLOW_DB_URL!);

const DAILY_QUOTA = 35;

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = searchParams.get("date") || dateStr;

    if (!referenceid) {
      return NextResponse.json({ error: "Missing referenceid" }, { status: 400 });
    }

    // 1. Check for today's existing quota
    const { data: existing, error: existingError } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json(existing);
    }

    // 2. Get companies used in the last 30 days to avoid duplicates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentCompanies, error: recentError } = await supabase
      .from("daily_quotas")
      .select("companies")
      .eq("referenceid", referenceid)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .lt("date", dateStr);

    if (recentError) throw recentError;

    // 3. Extract recently used company IDs
    const usedCompanyIds = new Set();
    recentCompanies?.forEach(day => {
      day.companies?.forEach((company: any) => {
        if (company.id) usedCompanyIds.add(company.id);
      });
    });

    // 4. Fetch available companies (excluding recently used)
    let availableCompaniesQuery = `
      SELECT id, companyname, contactperson, contactnumber, emailaddress, typeclient, address
      FROM companies 
      WHERE referenceid = $1
    `;
    
    if (usedCompanyIds.size > 0) {
      const excludedIds = Array.from(usedCompanyIds).join(",");
      availableCompaniesQuery += ` AND id NOT IN (${excludedIds})`;
    }
    
    availableCompaniesQuery += ` ORDER BY RANDOM() LIMIT $2`;
    
    const companiesResult = await sql(availableCompaniesQuery, [referenceid, DAILY_QUOTA]);
    const companiesArray = Array.isArray(companiesResult) ? companiesResult : [];

    // 5. Save today's quota
    const { error: insertError } = await supabase.from("daily_quotas").insert([{
      referenceid,
      date,
      companies: companiesArray,
      remaining_quota: DAILY_QUOTA,
      updated_at: new Date().toISOString(),
    }]);

    if (insertError) throw insertError;

    return NextResponse.json({
      companies: companiesArray,
      remaining_quota: DAILY_QUOTA
    });

  } catch (err: any) {
    console.error("DailyQuota GET error:", err.message);
    return NextResponse.json(
      { companies: [], remaining_quota: 0, error: "Service unavailable" },
      { status: 200 }
    );
  }
}