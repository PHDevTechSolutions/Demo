import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET() {
    try {
        const Xchire_fetch = await Xchire_sql`
            SELECT 
                status,
                companyname,
                referenceid,
                tsm,
                manager,
                contactperson,
                contactnumber,
                emailaddress,
                address,
                area,
                typeclient,
                remarks,
                to_char(date_created AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS date_created,
                to_char(date_updated AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila', 'MM/DD/YYYY HH12:MI:SS AM') AS date_updated
            FROM accounts;
        `;

        console.log("Fetched accounts:", Xchire_fetch); // Debugging line

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
