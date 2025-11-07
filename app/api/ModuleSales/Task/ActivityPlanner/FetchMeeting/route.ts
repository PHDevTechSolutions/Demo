import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");
const sql = neon(TASKFLOW_DB_URL);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    const manager = searchParams.get("manager");
    const tsm = searchParams.get("tsm");

    if (!referenceid && !manager && !tsm) {
      return NextResponse.json(
        { success: false, error: "Missing user identifier" },
        { status: 400 }
      );
    }

    // 🧠 Dynamic condition builder (parameter-safe)
    const params: string[] = [];
    const values: any[] = [];

    if (referenceid) {
      params.push(`referenceid = $${params.length + 1}`);
      values.push(referenceid);
    }
    if (manager) {
      params.push(`manager = $${params.length + 1}`);
      values.push(manager);
    }
    if (tsm) {
      params.push(`tsm = $${params.length + 1}`);
      values.push(tsm);
    }

    const whereClause = params.length ? `WHERE ${params.join(" OR ")}` : "";

    // 🧩 Construct full query string (safe)
    const query = `
      SELECT 
        id,
        referenceid,
        tsm,
        manager,
        to_char(startdate AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS startdate,
        to_char(enddate AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS enddate,
        to_char(date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS date_created,
        typeactivity,
        remarks
      FROM progress
      ${whereClause}
      ORDER BY date_created DESC;
    `;

    const meetings = await sql(query, values);

    return NextResponse.json({ success: true, meetings });
  } catch (error: any) {
    console.error("❌ GetMeetings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
