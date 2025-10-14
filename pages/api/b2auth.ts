import { NextResponse } from "next/server";

export async function GET() {
  const keyId = process.env.B2_KEY_ID!;
  const applicationKey = process.env.B2_APP_KEY!;
  const bucketId = process.env.B2_BUCKET_ID!;

  const auth = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
  const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: { Authorization: `Basic ${auth}` },
  });

  const authData = await authRes.json();
  if (!authRes.ok) return NextResponse.json(authData, { status: 400 });

  const uploadUrlRes = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: { Authorization: authData.authorizationToken },
    body: JSON.stringify({ bucketId }),
  });

  const uploadUrlData = await uploadUrlRes.json();
  if (!uploadUrlRes.ok) return NextResponse.json(uploadUrlData, { status: 400 });

  return NextResponse.json({
    uploadUrl: uploadUrlData.uploadUrl,
    authToken: uploadUrlData.authorizationToken,
  });
}
