import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Load and validate the database URL from environment variables
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

// Initialize Neon SQL client
const Xchire_sql = neon(Xchire_databaseUrl);

/**
 * Handles GET request to fetch progress records with specific fields.
 */
export async function GET() {
  try {
    // Select only the required columns
    const Xchire_fetch = await Xchire_sql`
      SELECT 
        referenceid,
        tsm,
        manager,
        companyname,
        date_created,
        targetquota,
        soamount,
        actualsales,
        typeactivity,
        source
      FROM progress;
    `;

    console.log("Fetched accounts:", Xchire_fetch);

    return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
  } catch (Xchire_error: any) {
    console.error("Error fetching accounts:", Xchire_error);
    return NextResponse.json(
      { success: false, error: Xchire_error.message || "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
