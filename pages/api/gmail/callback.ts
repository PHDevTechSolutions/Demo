import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    // Tokens will contain access_token and refresh_token (if consented)

    // Save tokens.refresh_token securely (database, env file, etc)
    // For dev/testing, just log it for now:
    console.log("Refresh Token:", tokens.refresh_token);

    return res.status(200).json({
      message: "Tokens retrieved successfully",
      tokens,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to exchange code for token" });
  }
}
