import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
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

    // 🔹 Use an array for multiple rows (even if single row) and onConflict as string
    const { data, error } = await supabase
      .from("companies")
      .upsert(
        [
          {
            reference_id: referenceId,
            company_name: company.companyname,
            contact_person: company.contactperson,
            contact_number: company.contactnumber,
            email_address: company.emailaddress,
            type_client: company.typeclient,
            address: company.address || null,
            last_added: new Date().toISOString(),
            status: company.status || "pending",
          },
        ],
        { onConflict: "reference_id" } // single string, not array
      )
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error saving company:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}