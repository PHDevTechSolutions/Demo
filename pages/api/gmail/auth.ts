import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // para siguradong may refresh token
    scope: SCOPES,
  });

  res.redirect(url);
}
