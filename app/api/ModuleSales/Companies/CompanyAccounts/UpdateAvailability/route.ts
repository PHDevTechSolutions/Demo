import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// ✅ Ensure the database URL is set
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

// ✅ Initialize Neon SQL client
const Xchire_sql = neon(Xchire_databaseUrl);

// ✅ Core logic to update company next_available_date
async function updateNextAvailableDate(id: string, typeclient: string) {
  try {
    if (!id || !typeclient) {
      throw new Error("Company ID and typeclient are required.");
    }

    const today = new Date();
    let nextDate = new Date(today);

    // 🗓️ Logic per typeclient
    if (typeclient === "Top 50") {
      nextDate.setDate(today.getDate() + 15);
    } else if (
      typeclient === "Next 30" ||
      typeclient === "Balance 20" ||
      typeclient === "TSA Client" ||
      typeclient === "CSR Client"
    ) {
      nextDate.setMonth(today.getMonth() + 1);
    }

    // ✅ Update DB
    const Xchire_update = await Xchire_sql`
      UPDATE accounts
      SET next_available_date = ${nextDate.toISOString().split("T")[0]}
      WHERE id = ${id}
      RETURNING *;
    `;

    return {
      success: true,
      data: Xchire_update,
      next_available_date: nextDate,
    };
  } catch (Xchire_error: any) {
    console.error("Xchire error updating next_available_date:", Xchire_error);
    return {
      success: false,
      error:
        Xchire_error.message || "Failed to update next_available_date.",
    };
  }
}

// ✅ PUT route
export async function PUT(req: Request) {
  try {
    const Xchire_body = await req.json();
    const { id, typeclient } = Xchire_body;

    const Xchire_result = await updateNextAvailableDate(id, typeclient);

    return NextResponse.json(Xchire_result);
  } catch (Xchire_error: any) {
    console.error("Xchire error in PUT /UpdateAvailability:", Xchire_error);
    return NextResponse.json(
      {
        success: false,
        error: Xchire_error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
