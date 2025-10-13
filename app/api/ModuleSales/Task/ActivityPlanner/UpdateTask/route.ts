import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      typeactivity,
      sonumber,
      quotationnumber,
      soamount,
      quotationamount,
      projectcategory,
      remarks,
      callstatus,
      source,
      typecall,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing progress ID." },
        { status: 400 }
      );
    }

    await Xchire_sql(
      `
      UPDATE progress
      SET typeactivity = $1,
          sonumber = $2,
          quotationnumber = $3,
          soamount = $4,
          quotationamount = $5,
          projectcategory = $6,
          remarks = $7,
          callstatus = $8,
          source = $9,
          typecall = $10,
          date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'
      WHERE id = $11;
      `,
      [
        typeactivity,
        sonumber,
        quotationnumber,
        soamount,
        quotationamount,
        projectcategory,
        remarks,
        callstatus,
        source,
        typecall,
        id,
      ]
    );

    return NextResponse.json(
      { success: true, message: "Progress updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error updating progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update progress." },
      { status: 500 }
    );
  }
}
