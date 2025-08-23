import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

async function insertActivity(data: any) {
    try {
        const {
            referenceid,
            manager,
            tsm,
            activitystatus,
            activitynumber,
            typeactivity,
            remarks,
            startdate,
            enddate,
        } = data;

        const result = await sql`
            INSERT INTO progress (
                referenceid,
                manager,
                tsm,
                activitystatus,
                activitynumber,
                typeactivity,
                remarks,
                startdate,
                enddate,
                date_created
            ) VALUES (
                ${referenceid},
                ${manager},
                ${tsm},
                ${activitystatus},
                ${activitynumber},
                ${typeactivity},
                ${remarks},
                ${startdate},
                ${enddate},
                NOW()
            )
            RETURNING *;
        `;

        return { success: true, data: result[0] };
    } catch (error: any) {
        console.error("Error inserting activity:", error);
        return { success: false, error: error.message || "Failed to insert activity." };
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic validation
        const requiredFields = ["referenceid", "manager", "tsm", "activitystatus", "activitynumber", "typeactivity", "startdate", "enddate"];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        const result = await insertActivity(body);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error in POST /api/ModuleSales/Task/Notes:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
