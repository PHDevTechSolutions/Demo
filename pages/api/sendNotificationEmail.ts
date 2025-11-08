import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Load tokens from environment or other secure storage
  const tokensString = process.env.GMAIL_TOKENS || "{}";
  let tokens;
  try {
    tokens = JSON.parse(tokensString);
  } catch {
    return res.status(500).json({ error: "Invalid tokens format" });
  }

  if (!tokens || Object.keys(tokens).length === 0) {
    return res.status(400).json({ error: "No Gmail tokens available" });
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  oAuth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const raw = makeEmailRaw(to, subject, message);

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error(error);
    // Use type guard for error.message
    const message =
      error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "Unknown error";

    return res.status(500).json({ error: message });
  }
}

// Helper function to create raw email base64url encoded
function makeEmailRaw(to: string, subject: string, message: string) {
  const str = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
