// file: app/api/ModuleSales/Task/XendMail/Save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ service role para makapag-upsert
);

export async function POST(req: NextRequest) {
  try {
    const { emails, referenceId } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No emails provided" },
        { status: 400 }
      );
    }

    // ✅ Only keep emails with messageId
    const validEmails = emails.filter((e: any) => e.messageId);
    if (validEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid emails to insert" },
        { status: 400 }
      );
    }

    console.log(`🟡 Preparing to insert ${validEmails.length} emails`);

    // 🔹 Transform to match table schema
    const rows = validEmails.map((email: any) => {
      const { from, to, cc, subject, date, messageId, body, attachments } = email;
      let formattedDate: string | null = null;
      try {
        formattedDate = date ? new Date(date).toISOString() : null;
      } catch {
        formattedDate = null;
      }

      return {
        referenceid: referenceId,
        sender: typeof from === "string" ? from : from?.text || "",
        recipient_to: to || "",
        recipient_cc: cc || "",
        subject: subject || "",
        email_date: formattedDate,
        messageid: messageId,
        body: body || "",
        attachments: attachments || [],
      };
    });

    // 🔹 Insert with upsert (avoid duplicates by messageid)
    const { data, error } = await supabase
      .from("xendmail_emails")
      .upsert(rows, { onConflict: "messageid" })
      .select();

    if (error) throw error;

    console.log(`🟢 Inserted ${data.length} rows into Supabase`);

    return NextResponse.json(
      { success: true, insertedCount: data.length, inserted: data },
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
