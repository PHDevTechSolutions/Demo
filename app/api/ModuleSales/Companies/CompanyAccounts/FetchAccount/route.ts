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

interface Company {
  id: number;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address?: string;
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const date = searchParams.get("date") || dateStr;

    console.log("🔄 DailyQuota API called with:", { referenceid, date });

    if (!referenceid) {
      console.log("❌ Missing referenceid");
      return NextResponse.json({ error: "Missing referenceid" }, { status: 400 });
    }

    // 1. Check for today's existing quota in Supabase
    console.log("📊 Checking for existing quota in Supabase...");
    const { data: existing, error: existingError } = await supabase
      .from("daily_quotas")
      .select("companies, remaining_quota")
      .eq("referenceid", referenceid)
      .eq("date", date)
      .maybeSingle();

    if (existingError) {
      console.error("❌ Supabase query error:", existingError);
      throw existingError;
    }

    if (existing) {
      console.log("✅ Found existing quota with", existing.companies?.length, "companies");
      return NextResponse.json(existing);
    }

    console.log("🆕 No existing quota found, generating new one...");

    // 2. Get companies used in the last 30 days to avoid duplicates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log("🔍 Checking companies used in last 30 days...");
    const { data: recentCompanies, error: recentError } = await supabase
      .from("daily_quotas")
      .select("companies")
      .eq("referenceid", referenceid)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .lt("date", dateStr);

    if (recentError) {
      console.error("❌ Recent companies query error:", recentError);
      throw recentError;
    }

    // 3. Extract recently used company IDs - FIXED TYPE
    const usedCompanyIds = new Set<number>();
    recentCompanies?.forEach(day => {
      if (day.companies && Array.isArray(day.companies)) {
        day.companies.forEach((company: Company) => {
          if (company.id) usedCompanyIds.add(company.id);
        });
      }
    });
    
    console.log(`📋 Found ${usedCompanyIds.size} recently used company IDs to exclude`);

    // 4. Fetch available companies from Neon database - USING ACCOUNTS TABLE
    console.log("🗃️ Fetching available companies from accounts table...");
    
    // Build the query safely using accounts table
    let queryParams: any[] = [referenceid];
    
    let availableCompaniesQuery = `
      SELECT id, companyname, contactperson, contactnumber, emailaddress, typeclient, address
      FROM accounts 
      WHERE referenceid = $1
    `;

    if (usedCompanyIds.size > 0) {
      // Create placeholders for parameterized query
      const placeholders = Array.from(usedCompanyIds).map((_, i) => `$${i + 2}`).join(",");
      availableCompaniesQuery += ` AND id NOT IN (${placeholders})`;
      
      // FIXED: Add the used company IDs to queryParams with proper typing
      queryParams.push(...Array.from(usedCompanyIds));
    }

    // Add the limit parameter
    const limitParamIndex = queryParams.length + 1;
    availableCompaniesQuery += ` ORDER BY RANDOM() LIMIT $${limitParamIndex}`;
    queryParams.push(DAILY_QUOTA);

    console.log("🔍 Executing query:", availableCompaniesQuery);
    console.log("📝 Query parameters:", queryParams);

    // Execute the query
    const companiesResult = await sql(availableCompaniesQuery, queryParams);
    const companiesArray = Array.isArray(companiesResult) ? companiesResult : [];
    
    console.log(`📊 Fetched ${companiesArray.length} companies from accounts table`);

    if (companiesArray.length === 0) {
      console.log("❌ NO COMPANIES FOUND in accounts table for referenceid:", referenceid);
      return NextResponse.json({
        companies: [],
        remaining_quota: 0,
        warning: "No companies available in database"
      });
    }

    // 5. Save today's quota to Supabase
    console.log("💾 Saving new daily quota to Supabase...");
    const { error: insertError } = await supabase.from("daily_quotas").insert([{
      referenceid,
      date,
      companies: companiesArray,
      remaining_quota: DAILY_QUOTA,
      updated_at: new Date().toISOString(),
    }]);

    if (insertError) {
      console.error("❌ Supabase insert error:", insertError);
      throw insertError;
    }

    console.log("✅ Successfully created new daily quota with", companiesArray.length, "companies");
    
    return NextResponse.json({
      companies: companiesArray,
      remaining_quota: DAILY_QUOTA
    });

  } catch (err: any) {
    console.error("❌ DailyQuota GET error:", err.message);
    return NextResponse.json(
      { 
        companies: [], 
        remaining_quota: 0, 
        error: "Service unavailable",
        details: err.message
      },
      { status: 200 }
    );
  }
}

// POST method for updating quota
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
    console.error("❌ DailyQuota POST error:", err.message);
    return NextResponse.json(
      { error: "Failed to update quota" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";