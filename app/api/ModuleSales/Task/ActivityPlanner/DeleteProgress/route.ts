import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// ----- Caching & Rendering Controls -----
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ----- Database Connection -----
const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("❌ TASKFLOW_DB_URL is not set in environment variables.");

const sql = neon(dbUrl);

// ----- Delete Progress Handler -----
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id." },
        { status: 400 }
      );
    }

    // 🔎 Check if record exists
    const existing = await sql`
      SELECT id FROM progress
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Record not found." },
        { status: 404 }
      );
    }

    // 🗑️ Delete record
    await sql`
      DELETE FROM progress
      WHERE id = ${id};
    `;

    // ✅ Return success
    return NextResponse.json(
      { success: true, message: "Record deleted successfully." },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error deleting record:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete record." },
      { status: 500 }
    );
  }
}
