import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL is not set in env variables.");
const sql = neon(dbUrl);

export async function POST(req: Request) {
  try {
    const { ticketreferencenumber, status } = await req.json();

    if (!ticketreferencenumber || !status) {
      return NextResponse.json(
        { success: false, error: "Missing ticketreferencenumber or status." },
        { status: 400 }
      );
    }

    const query = `
      UPDATE inquiries
      SET status = $1,
          date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'
      WHERE ticketreferencenumber = $2
      RETURNING *;
    `;

    const result = await sql(query, [status, ticketreferencenumber]);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found or already updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    console.error("❌ Error updating inquiry status:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
