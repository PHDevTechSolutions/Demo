// app/api/progress/[id]/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.TASKFLOW_DB_URL!);

// ✅ Next.js App Router PUT handler
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing progress ID" },
        { status: 400 }
      );
    }

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
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating progress:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
