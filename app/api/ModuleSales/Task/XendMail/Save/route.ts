import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.TASKFLOW_DB_URL;
if (!databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(databaseUrl);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { emails, referenceId } = data;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No emails provided" },
        { status: 400 }
      );
    }

    // Insert each email with deduplication
    const inserted: any[] = [];

    for (const email of emails) {
      const {
        from,
        to,
        cc,
        subject,
        date,
        messageId,
        body,
        attachments,
      } = email;

      if (!messageId) continue; // Skip invalid emails

      const query = `
        INSERT INTO xendmail_emails
          (referenceid, sender, recipient_to, recipient_cc, subject, email_date, messageid, body, attachments, date_created)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')
        ON CONFLICT (messageid) DO NOTHING
        RETURNING *;
      `;

      const values = [
        referenceId,
        from?.text || "",
        to || "",
        cc || "",
        subject || "",
        date || null,
        messageId,
        body || "",
        JSON.stringify(attachments || []),
      ];

      try {
        const result = await sql(query, values);
        if (result.length > 0) {
          inserted.push(result[0]);
        }
      } catch (err: any) {
        console.error("Error inserting email:", err);
      }
    }

    return NextResponse.json(
      { success: true, insertedCount: inserted.length, inserted },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving emails:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save emails" },
      { status: 500 }
    );
  }
}
