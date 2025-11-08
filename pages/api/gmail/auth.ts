import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // para maibalik ang refresh token
    prompt: "consent",      // laging ipapakita consent screen para makuha refresh token
    scope: SCOPES,
  });

  res.status(200).json({ authUrl });
}
