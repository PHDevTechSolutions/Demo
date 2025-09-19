/**import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

type SendEmailData = {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  followupTo?: string;
  subject: string;
  message: string;
  smtpHost: string;
  smtpPort: number;
  smtpPass: string;
  secure?: boolean;
  attachments?: {
    filename: string;
    content: string; // base64 string
    contentType: string;
  }[];
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: SendEmailData = await req.json();
    const {
      from,
      to,
      cc,
      bcc,
      replyTo,
      followupTo,
      subject,
      message,
      smtpHost,
      smtpPort,
      smtpPass,
      secure = true,
      attachments,
    } = body;

    if (!from || !to || !subject || !message || !smtpHost || !smtpPort || !smtpPass) {
      return NextResponse.json(
        { error: "All required fields must be provided." },
        { status: 400 }
      );
    }

    // Convert attachments to Nodemailer format if provided
    const formattedAttachments = attachments?.map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "base64"),
      contentType: att.contentType,
    }));

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      auth: { user: from, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    // Prepare mail options
    const mailOptions: any = {
      from,
      to,
      cc,
      bcc,
      subject,
      text: message,
      attachments: formattedAttachments,
    };

    // Add replyTo if provided
    if (replyTo) mailOptions.replyTo = replyTo;

    // Add Followup-To as a custom header if provided
    if (followupTo) mailOptions.headers = { "Followup-To": followupTo };

    // Send mail
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent:", info.messageId);
    return NextResponse.json({
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (err: any) {
    console.error("Send email error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send email" },
      { status: 500 }
    );
  }
}**/