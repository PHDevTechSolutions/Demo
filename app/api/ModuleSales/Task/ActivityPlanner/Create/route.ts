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
      inquiryid,
    } = data;

    // 🏷️ Generate unique activity number
    const firstLetterCompany = companyname?.charAt(0).toUpperCase() || "X";
    const firstLetterContact = contactperson?.charAt(0).toUpperCase() || "X";
    const lastLetterContact =
      contactperson?.charAt(contactperson.length - 1).toUpperCase() || "X";
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const activitynumber = `${firstLetterCompany}-${firstLetterContact}${lastLetterContact}-${random4}-${random6}`;

    const activitystatus = "On Progress";

    // ✅ Insert into activity
    const insertedActivity = await sql`
      INSERT INTO activity (
        referenceid, manager, tsm, companyname, contactperson, contactnumber, emailaddress,
        typeclient, address, activitynumber, activitystatus, date_created, date_updated
      ) VALUES (
        ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson}, ${contactnumber}, ${emailaddress},
        ${typeclient}, ${address}, ${activitynumber}, ${activitystatus}, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
      )
      RETURNING *;
    `;

    let insertedAccount = null;

    // ✅ Insert into accounts ONLY if typeclient = CSR Inquiries
    if (typeclient === "CSR Inquiries") {
      try {
        insertedAccount = await sql`
          INSERT INTO accounts (
            referenceid, tsm, companyname, contactperson, contactnumber,
            emailaddress, typeclient, address, status, date_created, date_updated
          ) VALUES (
            ${referenceid}, ${tsm}, ${companyname}, ${contactperson}, ${contactnumber},
            ${emailaddress}, 'CSR Client', ${address}, 'Active',
            NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
          )
          RETURNING *;
        `;
      } catch (accountErr: any) {
        console.error("❌ Error inserting into accounts:", accountErr);
        throw new Error(
          `Accounts insert failed → ${accountErr.message || JSON.stringify(accountErr)}`
        );
      }
    }

    // ✅ Update inquiries ONLY if inquiryid is provided
    if (inquiryid) {
      await sql`
        UPDATE inquiries
        SET status = 'Used'
        WHERE id = ${inquiryid}
          AND referenceid = ${referenceid}
          AND status = 'Endorsed'
      `;
    }

    return {
      success: true,
      insertedId: insertedActivity[0].id,
      data: {
        activity: insertedActivity[0],
        account: insertedAccount ? insertedAccount[0] : null,
      },
    };
  } catch (error: any) {
    console.error("❌ Error inserting activity flow:", error);
    return {
      success: false,
      error: error.message || "Failed to insert activity.",
      details: error.stack || error,
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await insertActivity(body);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error("❌ Error in POST /api/ModuleSales/Task/ActivityPlanner/Create:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details: error.stack || error,
      },
      { status: 500 }
    );
  }
}

// ✅ Always get latest data, no cache
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";