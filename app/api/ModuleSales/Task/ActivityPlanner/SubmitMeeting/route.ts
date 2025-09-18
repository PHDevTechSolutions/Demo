import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");
const sql = neon(TASKFLOW_DB_URL);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referenceid, tsm, manager, startdate, enddate, typeactivity, remarks } = body;

    // insert into progress (no required field validation)
    const result = await sql`
      INSERT INTO progress (
        referenceid, tsm, manager, startdate, enddate,
        typeactivity, remarks, date_created
      ) VALUES (
        ${referenceid}, ${tsm}, ${manager}, ${startdate}, ${enddate},
        ${typeactivity}, ${remarks}, NOW()
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, progress: result[0] });
  } catch (error: any) {
    console.error("❌ SubmitMeeting error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
