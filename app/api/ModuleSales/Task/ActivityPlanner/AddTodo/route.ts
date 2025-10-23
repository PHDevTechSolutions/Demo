import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL!;
const Xchire_sql = neon(Xchire_databaseUrl);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, typeactivity, remarks, startdate, enddate } = body;

    if (!referenceid || !typeactivity || !startdate || !enddate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    await Xchire_sql(
      `
      INSERT INTO progress (referenceid, typeactivity, remarks, startdate, enddate, scheduled_status, date_created)
      VALUES ($1, $2, $3, $4, $5, 'Pending', NOW());
      `,
      [referenceid, typeactivity, remarks || "", startdate, enddate]
    );

    return NextResponse.json({
      success: true,
      message: "✅ Task added successfully!",
    });
  } catch (error: any) {
    console.error("❌ Error adding todo:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add task." },
      { status: 500 }
    );
  }
}
