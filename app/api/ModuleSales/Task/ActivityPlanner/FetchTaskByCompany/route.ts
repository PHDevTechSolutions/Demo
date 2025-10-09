import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) throw new Error("TASKFLOW_DB_URL is not set.");

const sql = neon(TASKFLOW_DB_URL);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyname = searchParams.get("companyname");

    if (!companyname) {
      return NextResponse.json(
        { success: false, error: "Missing companyname" },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT 
        id,
        companyname,
        contactperson,
        contactnumber,
        emailaddress,
        referenceid,
        activitynumber,
        typeactivity,
        activitystatus,
        remarks,
        to_char(
          date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila',
          'MM/DD/YYYY HH12:MI:SS AM'
        ) AS date_created,
        date_updated,
        quotationnumber,
        sonumber,
        quotationamount,
        soamount,
        projectname,
        projectcategory,
        projecttype
      FROM progress
      WHERE companyname ILIKE ${companyname}
        AND activitystatus NOT IN ('Done', 'Delivered', 'Loss', 'Cancelled')
      ORDER BY date_updated DESC;
    `;

    return NextResponse.json(
      {
        success: true,
        count: rows.length,
        duplicates: rows,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error fetching duplicate tasks:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch duplicates." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
