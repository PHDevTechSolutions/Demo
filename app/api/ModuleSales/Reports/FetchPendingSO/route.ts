import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Validate environment variable and initialize database client
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

/**
 * GET /api/ModuleSales/UserManagement/CompanyAccounts
 * Fetch all accounts from the database
 * ✅ Exclude records with the same activitynumber if one of them is already Delivered
 */
export async function GET() {
    try {
        const Xchire_fetch = await Xchire_sql`
            SELECT 
                id,
                referenceid,
                tsm,
                manager,
                activitynumber,
                to_char(date_created, 'MM/DD/YYYY HH12:MI:SS AM') AS date_created,
                companyname,
                contactperson,
                sonumber,
                soamount,
                activitystatus,
                remarks
            FROM progress p
            WHERE NOT EXISTS (
                SELECT 1
                FROM progress d
                WHERE d.activitynumber = p.activitynumber
                AND LOWER(d.activitystatus) = 'delivered'
            )
            ORDER BY date_created DESC;
        `;

        console.log("Xchire fetched accounts:", Xchire_fetch);

        return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
    } catch (Xchire_error: any) {
        console.error("Xchire error fetching accounts:", Xchire_error);
        return NextResponse.json(
            { success: false, error: Xchire_error.message || "Failed to fetch accounts." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Always fetch the latest data
