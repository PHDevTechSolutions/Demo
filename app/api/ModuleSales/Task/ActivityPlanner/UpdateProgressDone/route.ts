
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id." },
        { status: 400 }
      );
    }

    // 🔹 Update activitystatus to "Done"
    const updated = await Xchire_sql(
      `UPDATE progress 
       SET activitystatus = 'Done'
       WHERE id = $1
       RETURNING *;`,
      [id]
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Record not found or already updated." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated[0] },
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
