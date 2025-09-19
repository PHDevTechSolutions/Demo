/**import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

interface Email {
  from: { text: string };
  to: string | null;
  cc: string | null;
  subject: string | null;
  date: string | null;
  messageId: string | null;
  body: string | null;
  attachments: any[];
}

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

    // Fetch emails filtered by referenceId
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

    console.log("📨 GetSent rows:", rows.length);

    const emails: Email[] = rows.map((row: any) => {
      let attachments: any[] = [];

      if (row.attachments) {
        try {
          const parsed = JSON.parse(row.attachments);
          attachments = Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          console.warn(
            "⚠️ Malformed attachments JSON, defaulting to empty array:",
            row.attachments
          );
          attachments = [];
        }
      }

      return {
        from: { text: row.sender || "" },
        to: row.recipient_to || null,
        cc: row.recipient_cc || null,
        subject: row.subject || null,
        date: row.email_date ? new Date(row.email_date).toISOString() : null,
        messageId: row.messageid || null,
        body: row.body || null,
        attachments,
      };
    });

    return NextResponse.json({ success: true, data: emails }, { status: 200 });
  } catch (err: any) {
    console.error("❌ GetSent API error:", err);
    return NextResponse.json(
      { success: false, error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";**/
