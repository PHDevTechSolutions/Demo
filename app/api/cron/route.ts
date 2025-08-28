import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/MongoDB";

export async function GET(req: Request) {
  // 🔐 Protect using CRON_SECRET
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectToDatabase();
    const logsCollection = db.collection("activityLogs");

    // 🗓️ Compute today's date range (midnight → 11:59:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 🔍 Hanapin lahat ng nag-login ngayong araw
    const activeUsers = await logsCollection
      .find({
        status: "login",
        timestamp: { $gte: today, $lt: tomorrow },
      })
      .toArray();

    if (!activeUsers || activeUsers.length === 0) {
      console.log("⚠️ No logged-in users today");
      return NextResponse.json({ ok: false, message: "No logged-in users today" });
    }

    // 📝 Insert logout log para lang sa kanila
    const logoutLogs = activeUsers.map((u) => ({
      email: u.email,
      department: u.department,
      status: "logout",
      timestamp: new Date(),
      note: "Auto logout for active users today (6PM PH)",
    }));

    await logsCollection.insertMany(logoutLogs);

    console.log(`✅ Auto logout triggered for ${activeUsers.length} users`);

    return NextResponse.json({ ok: true, count: activeUsers.length });
  } catch (err: any) {
    console.error("❌ Cron job failed:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
