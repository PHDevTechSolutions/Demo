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
    const { referenceId, emails } = await req.json();

    if (!Array.isArray(emails) || !referenceId) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    let insertedCount = 0;

    for (const email of emails) {
      try {
        await sql`
          INSERT INTO xendmail_sent 
            (referenceid, sender, recipient_to, recipient_cc, subject, email_date, messageid, body, attachments) 
          VALUES (
            ${referenceId},
            ${email.from?.text || null},
            ${email.to || null},
            ${email.cc || null},
            ${email.subject || null},
            ${email.date ? new Date(email.date) : new Date()},
            ${email.messageId},
            ${email.body || null},
            ${email.attachments ? JSON.stringify(email.attachments) : null}
          )
          ON CONFLICT (messageid) DO NOTHING
        `;
        insertedCount++;
      } catch (err) {
        console.error("Insert error:", err);
      }
    }

    return NextResponse.json({ insertedCount }, { status: 200 });
  } catch (err: any) {
    console.error("Save API error:", err);
    return NextResponse.json(
      { error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}
