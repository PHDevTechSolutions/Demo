import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

// --- Insert activity into progress ---
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
      activitynumber,
      source,
      typeactivity,
      area,
      deliveryaddress,
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
        activitynumber,
        source,
        typeactivity,
        area,
        deliveryaddress,
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
        ${activitynumber},
        ${source},
        ${typeactivity},
        ${area},
        ${deliveryaddress},
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

// --- Update accounts status based on companyname + referenceid ---
async function updateAccountStatus(referenceid: string, companyname: string, status: string) {
  try {
    const result = await sql`
      UPDATE accounts
      SET status = ${status}
      WHERE referenceid = ${referenceid} AND companyname = ${companyname}
      RETURNING *;
    `;
    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ Error updating account status:", error);
    return { success: false, error: error.message || "Failed to update account status." };
  }
}

// --- API POST handler ---
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Required fields check for progress
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
      "activitynumber",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert into progress
    const insertResult = await insertActivity(body);
    if (!insertResult.success) {
      return NextResponse.json(insertResult, { status: 500 });
    }

    // If status exists in payload, update accounts table
    if (body.status) {
      const updateResult = await updateAccountStatus(body.referenceid, body.companyname, body.status);
      if (!updateResult.success) {
        console.warn("⚠️ Failed to update account status:", updateResult.error);
      }
    }

    return NextResponse.json({ success: true, progress: insertResult.data });
  } catch (error: any) {
    console.error("❌ Error in POST /api/ModuleSales/Task/ActivityPlanner/CreateProgress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
