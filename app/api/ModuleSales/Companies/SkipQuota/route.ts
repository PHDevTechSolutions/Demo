import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");
    if (!referenceid) {
      return NextResponse.json({ error: "Missing referenceid" }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Check if today is in a skip period
    const { data: skips, error } = await supabase
      .from("skips")
      .select("startdate,enddate")
      .eq("referenceid", referenceid)
      .gte("enddate", todayStr)
      .lte("startdate", todayStr);

    if (error) throw error;

    const isSkipped = skips && skips.length > 0;

    return NextResponse.json({ isSkipped });
  } catch (err: any) {
    console.error("❌ CheckActiveSkip error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
