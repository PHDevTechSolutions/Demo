import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,                // ✅ server env
  process.env.SUPABASE_SERVICE_ROLE_KEY!    // ✅ service role key (secure, not exposed)
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceId, companies } = body;

    if (!referenceId || !Array.isArray(companies)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 🔹 Format data
    const formatted = companies.map((c: any) => ({
      referenceid: referenceId,
      companyname: c.companyname?.trim(),
      contactperson: c.contactperson,
      contactnumber: c.contactnumber,
      emailaddress: c.emailaddress,
      typeclient: c.typeclient,
      address: c.address || null,
      created_at: new Date().toISOString(),
    }));

    // 🔹 Deduplicate by (referenceid + companyname)
    const unique = new Map<string, any>();
    for (const c of formatted) {
      const key = `${c.referenceid}-${c.companyname.toLowerCase()}`;
      if (!unique.has(key)) unique.set(key, c);
    }
    const uniqueFormatted = Array.from(unique.values());

    // ✅ Upsert para hindi maduplicate
    const { data, error } = await supabase
      .from("companies")
      .upsert(uniqueFormatted, {
        onConflict: "referenceid,companyname", // 🔑 composite key (must match constraint)
      });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ SaveCompany API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
