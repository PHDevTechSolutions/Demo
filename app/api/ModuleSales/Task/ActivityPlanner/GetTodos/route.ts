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
    const { referenceid } = body;

    if (!referenceid) {
      return NextResponse.json(
        { success: false, error: "Missing required field: referenceid" },
        { status: 400 }
      );
    }

    // 🔹 Fetch user’s todo list
    const todos = await Xchire_sql(
      `
      SELECT id, typeactivity, remarks, startdate, enddate, scheduled_status
      FROM progress
      WHERE referenceid = $1
      ORDER BY date_created DESC;
      `,
      [referenceid]
    );

    // 🔹 Predefined type activities (could be static or database-driven)
    const typeactivities = [
      "Accounting Concern",
      "Client Meeting",
      "Follow-up Call",
      "Document Preparation",
    ];

    // 🔹 Optional: merge with unique ones found in user's todos
    const uniqueFromTodos = Array.from(
      new Set(todos.map((t: any) => t.typeactivity))
    );
    const allActivities = Array.from(new Set([...typeactivities, ...uniqueFromTodos]));

    return NextResponse.json({
      success: true,
      todos,
      typeactivities: allActivities, // 👈 return here for dropdown
    });
  } catch (error: any) {
    console.error("❌ Error fetching todos:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch todos." },
      { status: 500 }
    );
  }
}
