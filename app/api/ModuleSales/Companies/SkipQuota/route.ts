import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ POST → Save skip period
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, startdate, enddate, status } = body;

    if (!referenceid || !startdate || !enddate || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("skips").insert([
      {
        referenceid,
        startdate,
        enddate,
        status,
        date_created: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Skip period saved successfully",
    });
  } catch (err: any) {
    console.error("❌ SkipQuota POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ GET → Fetch skip records
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceid = searchParams.get("referenceid");

    if (!referenceid) {
      return NextResponse.json(
        { error: "Missing referenceid" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("skips")
      .select("*")
      .eq("referenceid", referenceid)
      .order("date_created", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("❌ SkipQuota GET error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE → Cancel skip period
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceid, startdate, enddate } = body;

    if (!referenceid || !startdate || !enddate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("skips")
      .delete()
      .eq("referenceid", referenceid)
      .eq("startdate", startdate)
      .eq("enddate", enddate);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Skip period cancelled successfully",
    });
  } catch (err: any) {
    console.error("❌ SkipQuota DELETE error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
