import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/* ---------- DB connection ---------- */
const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL is not set in env variables.");

const sql = neon(dbUrl);

/* ---------- POST /DiscardData ---------- */
export async function POST(req: Request) {
  try {
    /* read body */
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing inquiry ID." },
        { status: 400 }
      );
    }

    /* build query – use two placeholders with correct types */
    const query = `
      UPDATE inquiries
      SET status = 'Wrong Tagging',
          date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'
      WHERE id = $1::int
         OR ticketreferencenumber = $2
      RETURNING *;
    `;

    /* execute – pass same value twice, second as string */
    const result = await sql(query, [id, id.toString()]);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found or already updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    console.error("Error updating inquiry status:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
