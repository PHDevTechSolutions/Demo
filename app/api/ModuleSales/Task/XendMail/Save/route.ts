// file: app/api/ModuleSales/Task/XendMail/Save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

export async function POST(req: NextRequest) {
  try {
    const { emails, referenceId } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No emails provided" },
        { status: 400 }
      );
    }

    // ✅ Filter out invalid emails (walang messageId = skip)
    const validEmails = emails.filter((e: any) => e.messageId);

    if (validEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid emails to insert" },
        { status: 400 }
      );
    }

    console.log("🟡 Valid emails to insert:", validEmails.length);
    console.log("🟡 First email sample:", validEmails[0]);

    // Build bulk insert query
    const values: any[] = [];
    const placeholders: string[] = [];

    validEmails.forEach((email: any, idx: number) => {
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

      // 🔧 Ensure valid timestamp string
      let formattedDate: string | null = null;
      try {
        formattedDate = date ? new Date(date).toISOString() : null;
      } catch {
        formattedDate = null;
      }

      const baseIndex = idx * 9;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')`
      );

      values.push(
        referenceId,
        typeof from === "string" ? from : from?.text || "",
        to || "",
        cc || "",
        subject || "",
        formattedDate,
        messageId,
        body || "",
        attachments || [] // ✅ insert JSON directly (Postgres will handle JSONB)
      );
    });

    console.log("🟡 SQL placeholders:", placeholders.length);
    console.log("🟡 Values length:", values.length);

    const query = `
      INSERT INTO xendmail_emails
        (referenceid, sender, recipient_to, recipient_cc, subject, email_date, messageid, body, attachments, date_created)
      VALUES ${placeholders.join(", ")}
      ON CONFLICT (messageid) DO NOTHING
      RETURNING *;
    `;

    const result = await sql(query, values);

    console.log("🟢 Insert result count:", result.length);

    return NextResponse.json(
      { success: true, insertedCount: result.length, inserted: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error saving emails:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save emails" },
      { status: 500 }
    );
  }
}
