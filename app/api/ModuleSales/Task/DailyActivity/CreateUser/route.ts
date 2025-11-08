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
      referenceid,
      manager,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      typeclient,
      address,
      deliveryaddress,
      area,
      projectname,
      projectcategory,
      projecttype,
      source,
      typeactivity,
      callback,
      callstatus,
      typecall,
      site_visit_date,
      remarks,
      quotationnumber,
      quotationamount,
      sonumber,
      soamount,
      startdate,
      enddate,
      activitystatus,
      activitynumber,
      targetquota,
      status,
      companygroup,
    } = data;

    if (!companyname || !typeclient) {
      throw new Error("Company Name and Type of Client are required.");
    }

    // 🔎 Check duplicates by companyname + contactperson (case-insensitive)
    const existingAccounts = await Xchire_sql`
      SELECT id, referenceid FROM accounts
      WHERE LOWER(companyname) = LOWER(${companyname})
        AND LOWER(contactperson) = LOWER(${contactperson});
    `;

    // Filter those owned by others
    const otherOwners = existingAccounts.filter(
      (acc) => acc.referenceid !== referenceid
    );

    if (otherOwners.length > 0) {
      return {
        success: false,
        duplicate: true,
        message: `⚠️ Duplicate account found for company "${companyname}" with contact person "${contactperson}" owned by another TSA. Submission blocked.`,
      };
    }

    // Determine account id (existing or new)
    let accountId: string | null = null;

    if (existingAccounts.length === 0) {
      // No existing account found, insert new
      const accountsResult = await Xchire_sql`
        INSERT INTO accounts (
          referenceid, manager, tsm, companyname, contactperson,
          contactnumber, emailaddress, typeclient, address, deliveryaddress, area,
          status, companygroup, date_created, date_updated
        )
        VALUES (
          ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
          ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress}, ${area},
          ${status || "Active"}, ${companygroup || null},
          NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
        )
        RETURNING id;
      `;
      accountId = accountsResult[0]?.id;
      if (!accountId) {
        throw new Error("Failed to insert new company into accounts table.");
      }
    } else {
      // Use existing account id (owned by self)
      accountId = existingAccounts[0].id;
    }

    // 📝 Insert into activity table
    const activityResult = await Xchire_sql`
      INSERT INTO activity (
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress, area,
        projectname, projectcategory, projecttype, source,
        activitystatus, activitynumber, targetquota, date_created, date_updated
      )
      VALUES (
        ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
        ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress}, ${area},
        ${projectname}, ${projectcategory}, ${projecttype}, ${source},
        ${activitystatus || "On Progress"}, ${activitynumber || null}, ${targetquota || null},
        NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
      )
      RETURNING *;
    `;
    const newActivity = activityResult[0];
    if (!newActivity) throw new Error("Failed to insert into activity table.");

    const newActivityNumber = newActivity.activitynumber;

    // 📈 Insert into progress table
    const progressResult = await Xchire_sql`
      INSERT INTO progress (
        referenceid, manager, tsm, companyname, contactperson,
        contactnumber, emailaddress, typeclient, address, deliveryaddress, area,
        projectname, projectcategory, projecttype, source,
        typeactivity, callback, callstatus, typecall, site_visit_date,
        remarks, quotationnumber, quotationamount, sonumber, soamount,
        startdate, enddate, activitystatus, activitynumber, targetquota,
        date_created, date_updated
      )
      VALUES (
        ${referenceid}, ${manager}, ${tsm}, ${companyname}, ${contactperson},
        ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress}, ${area},
        ${projectname}, ${projectcategory}, ${projecttype}, ${source},
        ${typeactivity}, ${callback || null}, ${callstatus || null}, ${typecall || null}, ${site_visit_date || null},
        ${remarks || null}, ${quotationnumber || null}, ${quotationamount || null},
        ${sonumber || null}, ${soamount || null}, ${startdate || null}, ${enddate || null},
        ${activitystatus || "On Progress"}, ${newActivityNumber || null}, ${targetquota || null},
        NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'
      )
      RETURNING *;
    `;

    return {
      success: true,
      message: "✅ New company, activity, and progress created successfully.",
      accountId,
      accountDuplicate: existingAccounts.length > 0,
      activity: newActivity,
      progress: progressResult[0],
    };
  } catch (error: any) {
    console.error("❌ Error inserting records:", error);
    return { success: false, error: error.message || "Failed to add records." };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await create(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Error in POST /api/addActivity:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
