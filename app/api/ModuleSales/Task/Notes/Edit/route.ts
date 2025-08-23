import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

async function updateNote(data: any) {
  try {
    const {
      id,
      activitystatus,
      typeactivity,
      remarks,
      startdate,
      enddate,
    } = data;

    // ✅ Update editable fields + date_updated
    const updated = await sql`
      UPDATE progress
      SET 
        activitystatus = ${activitystatus},
        typeactivity = ${typeactivity},
        remarks = ${remarks},
        startdate = ${startdate},
        enddate = ${enddate},
        date_updated = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return { success: false, error: "Activity not found or already updated." };
    }

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error("Error updating note:", error);
    return { success: false, error: error.message || "Failed to update activity." };
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Activity ID is required for update." },
        { status: 400 }
      );
    }

    const result = await updateNote(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in PUT /api/ModuleSales/Task/Notes/EditNotes:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
