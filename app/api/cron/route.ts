import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/MongoDB";

export async function GET(req: Request) {
  // 🔐 Protect using CRON_SECRET
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("activityLogs");

    // Insert a logout log for ALL users (force logout)
    await collection.insertOne({
      email: "SYSTEM",
      status: "logout",
      timestamp: new Date(),
      note: "Auto logout for all users at 10:25AM PH",
    });

    console.log("✅ Auto logout triggered at 10:25AM PH");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Cron job failed:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
