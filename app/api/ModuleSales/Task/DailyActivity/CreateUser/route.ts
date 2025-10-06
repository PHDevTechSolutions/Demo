import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

async function create(data: any) {
  try {
    const {
      referenceid, manager, tsm, companyname, contactperson,
      contactnumber, emailaddress, typeclient, address, deliveryaddress, area,
      projectname, projectcategory, projecttype, source, typeactivity,
      callback, callstatus, typecall, remarks, quotationnumber,
      quotationamount, sonumber, soamount, startdate, enddate,
      activitystatus, activitynumber, targetquota, status, companygroup,
    } = data;

    if (!companyname || !typeclient) {
      throw new Error("Company Name and Type of Client are required.");
    }

    // 🔎 Check if company already exists
    const existingAccount = await Xchire_sql`
      SELECT * FROM accounts WHERE companyname = ${companyname} LIMIT 1;
    `;
    const accountExists = existingAccount.length > 0;

    // 📝 Insert into activity table
    const activityResult = await Xchire_sql`
      INSERT INTO activity (
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress, area,
        projectname, projectcategory, projecttype, source,
        activitystatus, activitynumber, targetquota
      )
      VALUES (
        ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
        ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress}, ${area},
        ${projectname}, ${projectcategory}, ${projecttype}, ${source},
        ${activitystatus || null}, ${activitynumber || null}, ${targetquota || null}
      )
      RETURNING *;
    `;

    const insertedActivity = activityResult[0];
    if (!insertedActivity) throw new Error("Failed to insert into activity table.");

    const newActivityNumber = insertedActivity.activitynumber;

    // 🏢 Insert into accounts table if company is new
    if (!accountExists) {
      const accountsResult = await Xchire_sql`
        INSERT INTO accounts (
          referenceid, manager, tsm, companyname, contactperson,
          contactnumber, emailaddress, typeclient, address, deliveryaddress, area, 
          status, companygroup
        ) VALUES (
          ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
          ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress}, ${area},
          ${status}, ${companygroup}
        )
        RETURNING *;
      `;

      if (!accountsResult[0]) throw new Error("Failed to insert into accounts table.");
    } else {
      // ✅ Update date_updated only if company exists
      await Xchire_sql`
        UPDATE accounts SET date_updated = DEFAULT WHERE companyname = ${companyname};
      `;
    }

    // 📈 Insert into progress table
    const progressResult = await Xchire_sql`
      INSERT INTO progress (
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress, area,
        projectname, projectcategory, projecttype, source,
        typeactivity, callback, callstatus, typecall,
        remarks, quotationnumber, quotationamount, sonumber, soamount,
        startdate, enddate, activitystatus, activitynumber, targetquota
      )
      VALUES (
        ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
        ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress}, ${area},
        ${projectname}, ${projectcategory}, ${projecttype}, ${source},
        ${typeactivity}, ${callback || null}, ${callstatus || null}, ${typecall || null},
        ${remarks || null}, ${quotationnumber || null}, ${quotationamount || null},
        ${sonumber || null}, ${soamount || null}, ${startdate || null}, ${enddate || null},
        ${activitystatus || null}, ${newActivityNumber || null}, ${targetquota || null}
      )
      RETURNING *;
    `;

    if (!progressResult[0]) {
      throw new Error("Failed to insert into progress table.");
    }

    return {
      success: true,
      activity: insertedActivity,
      progress: progressResult[0],
      accountExists,
    };
  } catch (error: any) {
    console.error("Error inserting activity, accounts, and progress:", error);
    return { success: false, error: error.message || "Failed to add records." };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await create(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/addActivity:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
