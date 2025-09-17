// app/api/ModuleSales/Companies/SaveCompany/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Server-only client using service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceId, company } = body;

    if (!referenceId || !company) {
      return NextResponse.json({ error: "Missing referenceId or company" }, { status: 400 });
    }

    // 🔹 Build row for insert/upsert
    const insertRow = {
      reference_id: referenceId,
      company_name: company.companyname,
      contact_person: company.contactperson,
      contact_number: company.contactnumber,
      email_address: company.emailaddress,
      type_client: company.typeclient,
      address: company.address || null,
      last_added: new Date().toISOString(),
      status: company.status || "pending",
    };

    // 🔹 Try upsert first (prevents duplicates)
    const { data: upsertData, error: upsertError } = await supabase
      .from("companies")
      .upsert([insertRow], { onConflict: "reference_id,company_name" })
      .select();

    console.log("Upsert data:", upsertData);
    console.log("Upsert error:", upsertError);

    if (upsertError) {
      // 🔹 If upsert fails (maybe RLS), try insert as fallback
      const { data: insertData, error: insertError } = await supabase
        .from("companies")
        .insert([insertRow])
        .select();

      console.log("Insert data:", insertData);
      console.log("Insert error:", insertError);

      if (insertError) throw insertError;

      return NextResponse.json({ success: true, data: insertData });
    }

    return NextResponse.json({ success: true, data: upsertData });
  } catch (err: any) {
    console.error("Error saving company:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
