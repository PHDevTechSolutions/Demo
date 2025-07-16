import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Ensure DATABASE_URL is defined
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

const generateActivityNumber = (companyname: string, referenceid: string) => {
  const firstLetter = companyname.charAt(0).toUpperCase();
  const firstTwoRef = referenceid.substring(0, 2).toUpperCase();

  const now = new Date();
  const formattedDate = now
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    })
    .replace("/", "");

  const randomNumber = String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6);

  const generatedNumber = `${firstLetter}-${firstTwoRef}-${formattedDate}-${randomNumber}`;
  return generatedNumber;
};

async function create(data: any) {
  try {
    const {
      ticketreferencenumber,
      referenceid,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      address,
      wrapup,
      inquiries,
      remarks,
      targetquota,
      csragent,
    } = data;

    if (!companyname || !referenceid) {
      return { success: false, error: "Company Name and Reference ID are required." };
    }

    const activitynumber = generateActivityNumber(companyname, referenceid);

    const activityColumns = [
      "ticketreferencenumber",
      "referenceid",
      "tsm",
      "companyname",
      "contactperson",
      "contactnumber",
      "emailaddress",
      "address",
      "wrapup",
      "inquiries",
      "activitystatus",
      "typeclient",
      "activitynumber",
      "targetquota",
      "csragent",
    ];

    const activityValues = [
      ticketreferencenumber,
      referenceid,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      address,
      wrapup,
      inquiries,
      "On Progress",
      "CSR Client",
      activitynumber,
      targetquota || "0",
      csragent || null,
    ];

    const activityPlaceholders = activityValues.map((_, index) => `$${index + 1}`).join(", ");
    const activityQuery = `
      INSERT INTO activity (${activityColumns.join(", ")}, date_created) 
      VALUES (${activityPlaceholders}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila') 
      RETURNING *;
    `;

    const activityResult = await Xchire_sql(activityQuery, activityValues);
    if (!activityResult?.length) {
      return { success: false, error: "Failed to insert into activity table." };
    }

    const progressColumns = [
      "ticketreferencenumber",
      "referenceid",
      "tsm",
      "companyname",
      "contactperson",
      "contactnumber",
      "emailaddress",
      "address",
      "wrapup",
      "inquiries",
      "activitynumber",
      "typeclient",
      "activitystatus",
      "remarks",
      "typeactivity",
      "targetquota",
      "csragent",
    ];

    const progressValues = [
      ticketreferencenumber,
      referenceid,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      address,
      wrapup,
      inquiries,
      activitynumber,
      "CSR Client",
      "Cold",
      remarks || "N/A",
      "CSR Client",
      targetquota || "0",
      csragent,
    ];

    const progressPlaceholders = progressValues.map((_, index) => `$${index + 1}`).join(", ");
    const progressQuery = `
      INSERT INTO progress (${progressColumns.join(", ")}, date_created) 
      VALUES (${progressPlaceholders}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila') 
      RETURNING *;
    `;

    const progressResult = await Xchire_sql(progressQuery, progressValues);
    if (!progressResult?.length) {
      return { success: false, error: "Failed to insert into progress table." };
    }

    // Check if the company already exists in accounts
    const checkExistsQuery = `SELECT 1 FROM accounts WHERE companyname = $1 LIMIT 1`;
    const exists = await Xchire_sql(checkExistsQuery, [companyname]);

    let accountsResult: any = null;
    if (exists.length === 0) {
      // Not yet existing, insert into accounts
      const accountsColumns = [
        "referenceid",
        "tsm",
        "companyname",
        "contactperson",
        "contactnumber",
        "emailaddress",
        "address",
        "typeclient",
        "status",
      ];

      const accountsValues = [
        referenceid,
        tsm,
        companyname,
        contactperson,
        contactnumber,
        emailaddress,
        address,
        "CSR Client",
        "New Client",
      ];

      const accountsPlaceholders = accountsValues.map((_, index) => `$${index + 1}`).join(", ");
      const accountsQuery = `
        INSERT INTO accounts (${accountsColumns.join(", ")}, date_created) 
        VALUES (${accountsPlaceholders}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila') 
        RETURNING *;
      `;

      accountsResult = await Xchire_sql(accountsQuery, accountsValues);
      if (!accountsResult?.length) {
        return { success: false, error: "Failed to insert into accounts table." };
      }
    }

    // Update inquiry status to 'Used'
    const updateQuery = `
      UPDATE inquiries 
      SET status = 'Used', date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila' 
      WHERE ticketreferencenumber = $1
    `;
    await Xchire_sql(updateQuery, [ticketreferencenumber]);

    return {
      success: true,
      data: {
        activity: activityResult[0],
        progress: progressResult[0],
        accounts: accountsResult ? accountsResult[0] : { note: "Account already existed" },
      },
    };
  } catch (error: any) {
    console.error("Error inserting activity, progress, and updating inquiries:", error);
    return { success: false, error: error.message || "Failed to process request." };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await create(body);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error("Error in POST /api/addActivity:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
