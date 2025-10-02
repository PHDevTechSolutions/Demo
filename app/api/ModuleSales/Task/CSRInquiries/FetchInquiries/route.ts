import { NextResponse, NextRequest } from "next/server"; // ✅ import NextRequest
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(req: NextRequest) { // ✅ NextRequest here
  try {
    const searchParams = req.nextUrl.searchParams;
    const referenceid = searchParams.get("referenceid");

    if (!referenceid) {
      return NextResponse.json(
        { success: false, error: "ReferenceID is required." },
        { status: 400 }
      );
    }

    // 🔹 Fetch required fields
    const Xchire_fetch = await Xchire_sql`
      SELECT 
        referenceid,
        tsm,
        ticketreferencenumber,
        companyname,
        contactperson,
        contactnumber,
        emailaddress,
        typeclient,
        address,
        status,
        wrapup,
        inquiries,
        to_char(date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS date_created
      FROM inquiries
      WHERE referenceid = ${referenceid};
    `;

    return NextResponse.json({ success: true, data: Xchire_fetch || [] }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching inquiries:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch inquiries." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
