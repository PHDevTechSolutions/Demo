import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(req: NextRequest) {
  try {
    const { search } = Object.fromEntries(req.nextUrl.searchParams.entries());

    if (!search || typeof search !== "string" || search.trim().length < 3) {
      // Return empty array if search query is missing or too short
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Use ILIKE for case-insensitive search in PostgreSQL, adjust if different DB
    const query = `%${search.trim()}%`;

    const Xchire_fetch = await Xchire_sql`
      SELECT * FROM accounts
      WHERE companyname ILIKE ${query}
      ORDER BY companyname ASC
      LIMIT 20;
    `;

    return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
  } catch (error: any) {
    console.error("Xchire error fetching accounts:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Always fetch the latest data
