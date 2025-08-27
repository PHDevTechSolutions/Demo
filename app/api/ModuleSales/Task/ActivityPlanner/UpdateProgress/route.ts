import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      activitynumber,
      referenceid,
      remarks,
      startdate,
      enddate,
      activitystatus,
      typeactivity,
      typecall,
    } = body;

    if (!activitynumber || !referenceid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // 🔹 Step 1: Get the latest record
    const existing = await Xchire_sql(
      `SELECT * FROM progress 
       WHERE activitynumber = $1 AND referenceid = $2 
       ORDER BY date_created DESC 
       LIMIT 1;`,
      [activitynumber, referenceid]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Existing record not found." },
        { status: 404 }
      );
    }

    const record = existing[0];

    // 🔹 Step 2: Mark old record as Done
    await Xchire_sql(
      `UPDATE progress 
       SET activitystatus = 'Done' 
       WHERE id = $1;`,
      [record.id]
    );

    // 🔹 Step 3: Insert new record (carry over some fields + new inputs)
    const inserted = await Xchire_sql(
      `INSERT INTO progress
        (activitynumber, companyname, contactperson, typeclient, remarks, startdate, enddate, activitystatus, typecall, typeactivity, referenceid, tsm, manager)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;`,
      [
        record.activitynumber,
        record.companyname,
        record.contactperson,
        record.typeclient,
        remarks,
        startdate,
        enddate,
        activitystatus, // new status (Assisted → Ongoing → Done)
        typecall,
        typeactivity || record.typeactivity,
        record.referenceid,
        record.tsm,
        record.manager,
      ]
    );

    return NextResponse.json({ success: true, data: inserted }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update progress." },
      { status: 500 }
    );
  }
}
