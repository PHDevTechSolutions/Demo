import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DB_URL = process.env.TASKFLOW_DB_URL;
if (!DB_URL) throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");

const sql = neon(DB_URL);

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id)
      return NextResponse.json(
        { success: false, error: "Missing ID." },
        { status: 400 }
      );

    await sql`DELETE FROM progress WHERE id = ${id}`;

    return NextResponse.json(
      { success: true, message: "Progress deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deleting progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete progress." },
      { status: 500 }
    );
  }
}
