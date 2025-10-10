import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.TASKFLOW_DB_URL;
if (!databaseUrl) throw new Error("TASKFLOW_DB_URL is not set.");

const sql = neon(databaseUrl);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      activitynumber,
      referenceid,
      tsm,
      manager,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      address,
      typeclient,
      area,
      source,
      activitystatus,
      targetquota,
      typeactivity,
      typecall,
      quotationnumber,
      quotationamount,
      sonumber,
      soamount,
      projectname,
      projecttype,
      remarks,
      followup_date,
      startdate,
      enddate,
    } = body;

    if (!activitynumber) {
      return NextResponse.json(
        { success: false, error: "Missing activitynumber." },
        { status: 400 }
      );
    }

    // 🟡 1️⃣ Update old activity (set quotationamount/soamount = 0)
    await sql`
      UPDATE progress
      SET
        quotationamount = 0,
        soamount = 0
      WHERE activitynumber = ${activitynumber};
    `;

    await sql`
      UPDATE activity
      SET
        activitystatus = ${activitystatus},
        date_updated = NOW()
      WHERE activitynumber = ${activitynumber};
    `;

    // 🟢 2️⃣ Create new activity (duplicate + new quote/SO details)
    const newActivity = await sql`
      INSERT INTO progress (
        referenceid, tsm, manager, companyname, contactperson, contactnumber,
        emailaddress, address, typeclient, area, source, activitystatus, 
        activitynumber, targetquota, typeactivity, typecall,
        quotationnumber, quotationamount, sonumber, soamount, projectname, projecttype, remarks, followup_date,
        startdate, enddate, date_created, date_updated
      )
      VALUES (
        ${referenceid}, ${tsm}, ${manager}, ${companyname}, ${contactperson}, ${contactnumber},
        ${emailaddress}, ${address}, ${typeclient}, ${area}, ${source}, ${activitystatus},
        ${activitynumber}, ${targetquota}, ${typeactivity}, ${typecall},
        ${quotationnumber}, ${quotationamount}, ${sonumber}, ${soamount}, ${projectname}, ${projecttype},
        ${remarks}, ${followup_date},
        NOW(), NOW(), NOW(), NOW()
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: newActivity[0] });
  } catch (err: any) {
    console.error("❌ Error in ReOpen API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
