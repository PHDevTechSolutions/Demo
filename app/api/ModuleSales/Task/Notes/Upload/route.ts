import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { filename, filetype } = await req.json();

    const endpoint = process.env.NEXT_PUBLIC_B2_ENDPOINT;
    const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME;
    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APP_KEY;

    if (!endpoint || !bucketName || !keyId || !appKey) {
      return NextResponse.json({ error: "Missing Backblaze credentials" }, { status: 500 });
    }

    // Create signed URL (using Basic auth)
    const uploadUrl = `${endpoint}/${bucketName}/${Date.now()}-${filename}`;
    const authHeader = `Basic ${Buffer.from(`${keyId}:${appKey}`).toString("base64")}`;

    return NextResponse.json({
      uploadUrl,
      headers: {
        Authorization: authHeader,
        "Content-Type": filetype,
      },
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
