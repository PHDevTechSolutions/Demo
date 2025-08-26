import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

async function insertActivity(data: any) {
  try {
    const {
      referenceid,
      manager,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      typeclient,
      address,
    } = data;

    const result = await sql`
      INSERT INTO progress (
        referenceid,
        manager,
        tsm,
        companyname,
        contactperson,
        contactnumber,
        emailaddress,
        typeclient,
        address,
        date_created
      ) VALUES (
        ${referenceid},
        ${manager},
        ${tsm},
        ${companyname},
        ${contactperson},
        ${contactnumber},
        ${emailaddress},
        ${typeclient},
        ${address},
        NOW()
      )
      RETURNING *;
    `;

    return { success: true, data: result[0] };
  } catch (error: any) {
    console.error("❌ Error inserting activity:", error);
    return {
      success: false,
      error: error.message || "Failed to insert activity.",
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Required fields check
    const requiredFields = [
      "referenceid",
      "manager",
      "tsm",
      "companyname",
      "contactperson",
      "contactnumber",
      "emailaddress",
      "typeclient",
      "address",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await insertActivity(body);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error("❌ Error in POST /api/ModuleSales/Task/ActivityPlanner/Create:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
