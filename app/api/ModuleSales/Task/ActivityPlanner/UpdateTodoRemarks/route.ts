import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.TASKFLOW_DB_URL!);
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, remarks } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Missing id" });
    await sql(`UPDATE progress SET remarks = $1 WHERE id = $2`, [remarks, id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
