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
      inquiryid, // ✅ dagdag: inquiry id para sa update
    } = data;

    // 🔹 Generate activitynumber
    const firstLetterCompany = companyname.charAt(0).toUpperCase() || "X";
    const firstLetterContact = contactperson.charAt(0).toUpperCase() || "X";
    const lastLetterContact =
      contactperson.charAt(contactperson.length - 1).toUpperCase() || "X";
    const random4 = Math.floor(1000 + Math.random() * 9000); // 4 digits
    const random6 = Math.floor(100000 + Math.random() * 900000); // 6 digits
    const activitynumber = `${firstLetterCompany}-${firstLetterContact}${lastLetterContact}-${random4}-${random6}`;

    // 🔹 Default activitystatus
    const activitystatus = "On Progress";

    // 🔹 Insert into activity
    const result = await sql`
      INSERT INTO activity (
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
        activitystatus,
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
        ${activitystatus},
        NOW()
      )
      RETURNING *;
    `;

    // 🔹 If CSR Inquiries → Update ONLY the selected inquiry row
    if (typeclient === "CSR Inquiries" && inquiryid) {
      await sql`
        UPDATE inquiries
        SET status = 'Used'
        WHERE id = ${inquiryid}
          AND referenceid = ${referenceid}
          AND status = 'Endorsed'
      `;
    }

    return { success: true, data: result[0] };
  } catch (error: any) {
    console.error("❌ Error inserting activity:", error);
    return {
      success: false,
      error: error.message || "Failed to insert activity.",
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Required fields check
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
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // ✅ inquiryid required if CSR Inquiries
    if (body.typeclient === "CSR Inquiries" && !body.inquiryid) {
      return NextResponse.json(
        { success: false, error: "Missing inquiryid for CSR Inquiries." },
        { status: 400 }
      );
    }

    const result = await insertActivity(body);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error("❌ Error in POST /api/ModuleSales/Task/ActivityPlanner/Create:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
