import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL is not set.");

const sql = neon(dbUrl);

export const POST = async (req: NextRequest) => {
  try {
    // ✅ Update all active sessions to logout
    const result = await sql`
      UPDATE sessions
      SET status = 'logout', timestamp = NOW()
      WHERE status = 'active';
    `;

    console.log("✅ All active users logged out automatically at 6PM");

    return NextResponse.json({ success: true, message: "All users logged out." });
  } catch (error: any) {
    console.error("❌ Failed to auto-logout users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
