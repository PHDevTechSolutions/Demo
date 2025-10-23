import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// ✅ Initialize Neon connection
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

// ✅ Soft delete function
async function softDeleteActivity(activityId: string) {
  if (!activityId) throw new Error("Activity ID is required.");

  const Xchire_update = await Xchire_sql`
    UPDATE activity 
    SET activitystatus = 'Deleted'
    WHERE id = ${activityId}
    RETURNING id;
  `;

  if (Xchire_update.length === 0) {
    return { success: false, error: "Activity not found." };
  }

  return { success: true, message: "Activity deleted successfully." };
}

// ✅ DELETE endpoint
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing activity ID." },
        { status: 400 }
      );
    }

    const result = await softDeleteActivity(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ DeleteActivity API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🚀 Force fresh fetches (no cache)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
