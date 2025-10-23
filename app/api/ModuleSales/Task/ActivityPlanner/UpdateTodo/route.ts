import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL!;
const Xchire_sql = neon(Xchire_databaseUrl);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, scheduled_status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id" },
        { status: 400 }
      );
    }

    await Xchire_sql(
      `
      UPDATE progress
      SET scheduled_status = $1
      WHERE id = $2;
      `,
      [scheduled_status || "Done", id]
    );

    return NextResponse.json({
      success: true,
      message: "✅ Task status updated successfully!",
    });
  } catch (error: any) {
    console.error("❌ Error updating status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update status." },
      { status: 500 }
    );
  }
}
