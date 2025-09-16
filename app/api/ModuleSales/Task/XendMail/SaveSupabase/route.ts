import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { referenceId, emails } = await req.json();

  if (!emails || emails.length === 0) {
    return NextResponse.json({ error: "No emails provided" }, { status: 400 });
  }

  try {
    for (const email of emails) {
      console.log("Saving email:", email.messageId);

      // Upload attachments
      const attachmentsMeta = [];
      for (const att of email.attachments || []) {
        const filePath = `${referenceId}/${email.messageId}/${att.filename}`;
        const buffer = Buffer.from(att.content, "base64");

        const { error: uploadErr } = await supabase.storage
          .from("email-attachments")
          .upload(filePath, buffer, {
            contentType: att.contentType,
            upsert: true,
          });

        if (uploadErr) {
          console.error("Attachment upload error:", uploadErr);
          throw uploadErr;
        }

        attachmentsMeta.push({
          filename: att.filename,
          contentType: att.contentType,
          path: filePath,
        });
      }

      // Save email metadata
      const { data, error: dbErr } = await supabase
        .from("emails")
        .upsert({
          message_id: email.messageId,
          reference_id: referenceId,
          from_email: email.from.text,
          to_email: email.to,
          cc: email.cc,
          subject: email.subject,
          body: email.body,
          date: email.date,
          attachments: attachmentsMeta,
        });

      if (dbErr) {
        console.error("DB save error:", dbErr);
        throw dbErr;
      }

      console.log("Saved email to DB:", email.messageId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save emails error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
