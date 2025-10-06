import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL missing");

const sql = neon(dbUrl);

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      referenceid,
      manager,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      companygroup,
      address,
      deliveryaddress,
      area,
      status,
    } = body;

    if (!id || !companyname) {
      return NextResponse.json(
        { success: false, error: "Missing ID or company name" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE accounts SET
        referenceid = ${referenceid},
        manager = ${manager},
        tsm = ${tsm},
        companyname = ${companyname},
        contactperson = ${contactperson},
        contactnumber = ${contactnumber},
        emailaddress = ${emailaddress},
        companygroup = ${companygroup},
        address = ${address},
        deliveryaddress = ${deliveryaddress},
        area = ${area},
        status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("❌ Error updating account:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
