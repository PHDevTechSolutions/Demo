import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/MongoDB";

export async function GET(req: Request) {
  // 🔐 Protect using CRON_SECRET
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users"); // <-- dito galing user info
    const logsCollection = db.collection("activityLogs");

    // Kunin lahat ng users
    const users = await usersCollection
      .find({}, { projection: { Email: 1, Department: 1 } })
      .toArray();

    if (!users || users.length === 0) {
      console.log("⚠️ No users found to log out");
      return NextResponse.json({ ok: false, message: "No users found" });
    }

    // Gumawa ng bulk insert ng logout logs para sa lahat ng users
    const logoutLogs = users.map((u) => ({
      email: u.Email,
      department: u.Department,
      status: "logout",
      timestamp: new Date(),
      note: "Auto logout for all users at 10:25AM PH",
    }));

    await logsCollection.insertMany(logoutLogs);

    console.log(`✅ Auto logout triggered for ${users.length} users`);

    return NextResponse.json({ ok: true, count: users.length });
  } catch (err: any) {
    console.error("❌ Cron job failed:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
