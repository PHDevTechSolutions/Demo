import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI!;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const surveyLink = "https://us3.list-manage.com/survey?u=77f60046e24103f876322654d&id=ab6262deaa&attribution=false";
    const subject = "Ecoshift Corporation Shopping Experience Survey";

    // ✅ Proper RFC 5322 raw email
    const rawMessage = [
      `From: Ecoshift (Taskflow) <survey.ecoshiftcorporation@gmail.com>`,
      `To: ${email}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      `<p>Greetings,</p>
       <p>Thank you for choosing Ecoshift Corporation for your shopping needs!</p>
       <p>Please complete our survey:</p>
       <p><a href="${surveyLink}">${surveyLink}</a></p>`
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    res.status(200).json({ success: true, message: "Survey sent successfully via Gmail!" });
  } catch (error: any) {
    console.error("❌ Gmail send error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
