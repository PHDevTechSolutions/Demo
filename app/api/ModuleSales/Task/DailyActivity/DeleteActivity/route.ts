import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

/**
 * Soft deletes an activity by updating its activitystatus to 'Deleted'.
 * @param activityId - The ID of the activity to soft delete.
 * @returns Success or error response.
 */
async function softDeleteActivity(activityId: string) {
    try {
        if (!activityId) {
            throw new Error("Activity ID is required.");
        }

        const Xchire_update = await Xchire_sql`
            UPDATE activity 
            SET activitystatus = 'Deleted'
            WHERE id = ${activityId}
            RETURNING *;
        `;

        if (Xchire_update.length === 0) {
            return { success: false, error: "Activity not found." };
        }

        return { success: true, data: Xchire_update };
    } catch (error: any) {
        console.error("Error updating activity status:", error);
        return { success: false, error: error.message || "Failed to update activity status." };
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing activity ID." },
                { status: 400 }
            );
        }

        const result = await softDeleteActivity(id);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error in DELETE /api/ModuleSales/Task/DailyActivity/DeleteActivity:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
