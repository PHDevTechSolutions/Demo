import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");

const sql = neon(TASKFLOW_DB_URL);

// --- Insert into progress ---
async function insertActivity(data: any) {
  try {
    const {
      referenceid, manager, tsm, companyname, contactperson,
      contactnumber, emailaddress, typeclient, address, deliveryaddress,
      area, activitynumber, source, typeactivity, activitystatus,
      remarks, typecall, sonumber, soamount, callback, callstatus,
      startdate, enddate, quotationnumber, quotationamount,
      projectname, projectcategory, projecttype, targetquota,
    } = data;

    const result = await sql`
      INSERT INTO progress (
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress,
        area, activitynumber, source, typeactivity, activitystatus,
        remarks, typecall, sonumber, soamount, callback, callstatus,
        startdate, enddate, quotationnumber, quotationamount,
        projectname, projectcategory, projecttype, targetquota, date_created
      ) VALUES (
        ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
        ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress},
        ${area}, ${activitynumber}, ${source}, ${typeactivity}, ${activitystatus},
        ${remarks}, ${typecall}, ${sonumber}, ${soamount}, ${callback}, ${callstatus},
        ${startdate}, ${enddate}, ${quotationnumber}, ${quotationamount},
        ${projectname}, ${projectcategory}, ${projecttype}, ${targetquota}, NOW()
      )
      RETURNING *;
    `;
    return { success: true, data: result[0] };
  } catch (error: any) {
    console.error("❌ Error inserting activity:", error);
    return { success: false, error: error.message || "Failed to insert activity." };
  }
}

// --- Update activity table's activitystatus and date_updated ---
async function updateActivityStatus(activitynumber: string, activitystatus: string) {
  try {
    const result = await sql`
      UPDATE activity
      SET activitystatus = ${activitystatus},
          date_updated = NOW()
      WHERE activitynumber = ${activitynumber}
      RETURNING *;
    `;
    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ Error updating activity status:", error);
    return { success: false, error: error.message || "Failed to update activity status." };
  }
}

// --- API POST handler ---
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Required fields
    const requiredFields = [
      "referenceid", "manager", "tsm", "companyname",
      "contactperson", "contactnumber", "emailaddress",
      "typeclient", "address", "activitynumber",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert into progress
    const insertResult = await insertActivity(body);
    if (!insertResult.success) return NextResponse.json(insertResult, { status: 500 });

    // Update activity table if activitystatus exists
    if (body.activitystatus) {
      const updateResult = await updateActivityStatus(body.activitynumber, body.activitystatus);
      if (!updateResult.success) {
        console.warn("⚠️ Failed to update activity table:", updateResult.error);
      }
    }

    return NextResponse.json({ success: true, progress: insertResult.data });
  } catch (error: any) {
    console.error("❌ POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
