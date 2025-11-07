import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL!;
const sql = neon(Xchire_databaseUrl);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, role } = body; // ⬅️ include role in the request body

    console.log("📥 Received:", { referenceid, role });

    if (!referenceid) {
      return NextResponse.json(
        { success: false, error: "Missing required field: referenceid" },
        { status: 400 }
      );
    }

    let result;

    if (role === "Manager") {
      // 👩‍💼 Manager sees their own assigned todos (where manager = $1)
      result = await sql(
        `
        SELECT id, referenceid, typeactivity, remarks, startdate, enddate, scheduled_status
        FROM progress
        WHERE manager = $1
        ORDER BY date_created DESC;
        `,
        [referenceid]
      );
    } else {
      // 👨‍💼 TSM sees their own todos
      result = await sql(
        `
        SELECT id, referenceid, typeactivity, remarks, startdate, enddate, scheduled_status
        FROM progress
        WHERE tsm = $1
        ORDER BY date_created DESC;
        `,
        [referenceid]
      );
    }

    console.log("✅ Found todos:", result.length);

    return NextResponse.json({
      success: true,
      todos: result,
    });
  } catch (error: any) {
    console.error("❌ Error fetching todos:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch todos." },
      { status: 500 }
    );
  }
}
