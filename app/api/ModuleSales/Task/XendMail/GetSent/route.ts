// file: app/api/ModuleSales/Task/XendMail/GetSent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get("referenceId");

    if (!referenceId) {
      return NextResponse.json(
        { error: "referenceId is required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT 
        referenceid,
        sender,
        recipient_to,
        recipient_cc,
        subject,
        email_date,
        messageid,
        body,
        attachments,
        date_created
      FROM xendmail_sent
      WHERE referenceid = ${referenceId}
      ORDER BY email_date DESC
    `;

    // Map to same EmailData structure
    const emails = rows.map((row: any) => ({
      from: { text: row.sender },
      to: row.recipient_to,
      cc: row.recipient_cc,
      subject: row.subject,
      date: row.email_date ? new Date(row.email_date).toISOString() : null,
      messageId: row.messageid,
      body: row.body,
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
    }));

    return NextResponse.json(emails, { status: 200 });
  } catch (err: any) {
    console.error("GetSent API error:", err);
    return NextResponse.json(
      { error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}
