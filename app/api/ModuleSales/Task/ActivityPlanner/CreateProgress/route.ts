import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");

const sql = neon(TASKFLOW_DB_URL);

// 🧩 API Route - Create Progress + Update Activity + Force Revalidate
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Required field check
    const requiredFields = ["referenceid", "manager", "tsm"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // ✅ Insert into progress
    const progressInsert = await sql`
      INSERT INTO progress (
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress,
        area, activitynumber, source, typeactivity, activitystatus,
        remarks, typecall, sonumber, soamount, callback, callstatus,
        startdate, enddate, quotationnumber, quotationamount,
        projectname, projectcategory, projecttype, targetquota,
        paymentterm, actualsales, deliverydate, followup_date, site_visit_date,
        drnumber, date_created, date_updated
      )
      VALUES (
        ${body.referenceid}, ${body.manager}, ${body.tsm}, ${body.companyname}, ${body.contactperson},
        ${body.contactnumber}, ${body.emailaddress}, ${body.typeclient}, ${body.address}, ${body.deliveryaddress},
        ${body.area}, ${body.activitynumber}, ${body.source}, ${body.typeactivity}, ${body.activitystatus},
        ${body.remarks}, ${body.typecall}, ${body.sonumber}, ${body.soamount}, ${body.callback}, ${body.callstatus},
        ${body.startdate}, ${body.enddate}, ${body.quotationnumber}, ${body.quotationamount},
        ${body.projectname}, ${body.projectcategory}, ${body.projecttype}, ${body.targetquota},
        ${body.paymentterm}, ${body.actualsales}, ${body.deliverydate}, ${body.followup_date}, ${body.site_visit_date},
        ${body.drnumber}, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
      )
      RETURNING *;
    `;

    // ✅ Update activity table if provided
    let activityUpdate = null;
    if (body.activitynumber && body.activitystatus) {
      const activityResult = await sql`
        UPDATE activity
        SET activitystatus = ${body.activitystatus},
            date_updated = NOW() AT TIME ZONE 'UTC'
        WHERE activitynumber = ${body.activitynumber}
        RETURNING *;
      `;
      activityUpdate = activityResult[0] || null;
    }

    // ✅ Revalidate any related paths (replace with your exact path)
    revalidatePath("/modulesales/task/activityplanner");

    return NextResponse.json(
      {
        success: true,
        progress: progressInsert[0],
        activityUpdate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error in CreateProgress:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error while creating progress",
      },
      { status: 500 }
    );
  }
}

// 🚀 Force fresh fetches (no cache)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";