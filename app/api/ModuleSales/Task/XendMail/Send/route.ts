import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

type SendEmailData = {
  from: string;
  to: string;
  subject: string;
  message: string;          // changed from `body` to avoid conflict
  smtpHost: string;
  smtpPort: number;
  smtpPass: string;
  secure?: boolean;
  cc?: string;
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: SendEmailData = await req.json();
    const { from, to, subject, message, smtpHost, smtpPort, smtpPass, secure = true, cc } = body;

    if (!from || !to || !subject || !message || !smtpHost || !smtpPort || !smtpPass) {
      return NextResponse.json({ error: "All required fields must be provided." }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure, // true for 465
      auth: {
        user: from,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certs
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from,
      to,
      cc,
      subject,
      text: message,
    });

    console.log("Message sent:", info.messageId);

    return NextResponse.json({ message: "Email sent successfully", messageId: info.messageId });
  } catch (err: any) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
