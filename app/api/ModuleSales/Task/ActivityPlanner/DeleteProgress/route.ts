import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL is not set in environment variables.");

const sql = neon(dbUrl);

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { activitynumber, referenceid } = body;

    if (!activitynumber || !referenceid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: activitynumber or referenceid." },
        { status: 400 }
      );
    }

    // Check if the record exists
    const existing = await sql`
      SELECT * FROM progress
      WHERE activitynumber = ${activitynumber} AND referenceid = ${referenceid}
      LIMIT 1;
    `;

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Record not found." },
        { status: 404 }
      );
    }

    // Delete the record
    await sql`
      DELETE FROM progress
      WHERE activitynumber = ${activitynumber} AND referenceid = ${referenceid};
    `;

    return NextResponse.json(
      { success: true, message: "Activity deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deleting progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete activity." },
      { status: 500 }
    );
  }
}
