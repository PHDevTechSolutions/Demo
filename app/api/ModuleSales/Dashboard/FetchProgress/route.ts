import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET() {
    try {
        // ✅ Only fetch the columns you need
        const Xchire_fetch = await Xchire_sql`
            SELECT 
                referenceid,
                tsm,
                manager,
                activitystatus,
                source,
                startdate,
                enddate,
                quotationnumber,
                actualsales,
                typeactivity,
                quotationamount,
                soamount,
                companyname,
                callstatus,
                date_created
            FROM progress;
        `;

        console.log("Xchire fetched progress:", Xchire_fetch);

        return NextResponse.json({ success: true, data: Xchire_fetch }, { status: 200 });
    } catch (Xchire_error: any) {
        console.error("Xchire error fetching progress:", Xchire_error);
        return NextResponse.json(
            { success: false, error: Xchire_error.message || "Failed to fetch progress." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
