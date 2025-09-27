import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.TASKFLOW_DB_URL!);

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const {
      typeactivity,
      sonumber,
      quotationnumber,
      soamount,
      quotationamount,
      projectcategory,
    } = body;

    await sql(
      `
      UPDATE progress
      SET typeactivity = $1,
          sonumber = $2,
          quotationnumber = $3,
          soamount = $4,
          quotationamount = $5,
          projectcategory = $6,
          date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'
      WHERE id = $7
      `,
      [
        typeactivity,
        sonumber,
        quotationnumber,
        soamount,
        quotationamount,
        projectcategory,
        id, // <-- correct
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating progress:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
