import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

async function updateQuotationAmount(data: {
  referenceid: string;
  quotationnumber: string;
  activitynumber: number;
  quotationamount: number;
}) {
  try {
    const { referenceid, quotationnumber, activitynumber, quotationamount } = data;

    // ✅ Update quotationamount in progress table
    const updated = await sql`
      UPDATE progress
      SET quotationamount = ${quotationamount}
      WHERE referenceid = ${referenceid}
        AND id = ${activitynumber}
        AND quotationnumber = ${quotationnumber}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return { success: false, error: "Quotation not found or already updated." };
    }

    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error("Error updating quotation amount:", error);
    return { success: false, error: error.message || "Failed to update quotation amount." };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referenceid, quotationnumber, activitynumber, quotationamount } = body;

    if (!referenceid || !quotationnumber || !activitynumber || quotationamount === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await updateQuotationAmount(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/Quotation/UpdateAmount:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
