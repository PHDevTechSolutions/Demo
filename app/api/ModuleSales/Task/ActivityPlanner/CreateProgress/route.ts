import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL!;
const sql = neon(TASKFLOW_DB_URL);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requiredFields = ["referenceid", "manager", "tsm"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await sql.begin(async (tx) => {
      const progressInsert = await tx`
        INSERT INTO progress (
          referenceid, manager, tsm, companyname, contactperson,
          contactnumber, emailaddress, typeclient, address, deliveryaddress,
          area, activitynumber, source, typeactivity, activitystatus,
          remarks, typecall, sonumber, soamount, callback, callstatus,
          startdate, enddate, quotationnumber, quotationamount,
          projectname, projectcategory, projecttype, targetquota,
          paymentterm, actualsales, deliverydate, followup_date,
          drnumber, date_created, date_updated
        ) VALUES (
          ${body.referenceid}, ${body.manager}, ${body.tsm}, ${body.companyname}, ${body.contactperson},
          ${body.contactnumber}, ${body.emailaddress}, ${body.typeclient}, ${body.address}, ${body.deliveryaddress},
          ${body.area}, ${body.activitynumber}, ${body.source}, ${body.typeactivity}, ${body.activitystatus},
          ${body.remarks}, ${body.typecall}, ${body.sonumber}, ${body.soamount}, ${body.callback}, ${body.callstatus},
          ${body.startdate}, ${body.enddate}, ${body.quotationnumber}, ${body.quotationamount},
          ${body.projectname}, ${body.projectcategory}, ${body.projecttype}, ${body.targetquota},
          ${body.paymentterm}, ${body.actualsales}, ${body.deliverydate}, ${body.followup_date},
          ${body.drnumber}, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
        )
        RETURNING *;
      `;

      const activityUpdate =
        body.activitystatus && body.activitynumber
          ? await tx`
              UPDATE activity
              SET activitystatus = ${body.activitystatus},
                  date_updated = NOW() AT TIME ZONE 'UTC'
              WHERE activitynumber = ${body.activitynumber}
              RETURNING *;
            `
          : null;

      return { progressInsert: progressInsert[0], activityUpdate: activityUpdate?.[0] || null };
    });

    return NextResponse.json(
      {
        success: true,
        progress: result.progressInsert,
        activityUpdate: result.activityUpdate,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ POST /api/ModuleSales/Progress error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}