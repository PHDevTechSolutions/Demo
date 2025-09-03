import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

type EmailData = {
  from: { text: string };
  to: string;
  cc: string;
  subject: string;
  date: string;
  body: string;
  attachments: {
    filename: string;
    contentType: string;
    content: string; // base64
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, imapHost, imapPass, imapPort, secure } = body;

    // ✅ Validate input
    if (!email || !imapHost || !imapPass || !imapPort || typeof secure !== "boolean") {
      return NextResponse.json(
        { error: "email, imapHost, imapPass, imapPort, and secure are required" },
        { status: 400 }
      );
    }

    const client = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure,
      auth: { user: email, pass: imapPass },
      tls: secure ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
    });

    try {
      await client.connect();
    } catch (err: any) {
      return NextResponse.json(
        { error: "IMAP connection failed: " + err.message },
        { status: 500 }
      );
    }

    const messages: EmailData[] = [];

    try {
      const lock = await client.getMailboxLock("INBOX");

      try {
        const uids = await client.search({ all: true });
        if (!uids || uids.length === 0) {
          return NextResponse.json([], { status: 200 });
        }

        // Fetch latest 40 emails (adjustable)
        const latestUids = uids.slice(-40).reverse();

        for await (const msg of client.fetch(latestUids, { envelope: true, source: true })) {
          const envelope = msg.envelope;
          const source = msg.source;
          if (!envelope || !source) continue;

          const parsed = await simpleParser(source);

          const fromText =
            envelope.from?.map((f) => `${f.name || "Unknown"} <${f.address}>`).join(", ") ||
            "Unknown Sender";

          const toText =
            envelope.to?.map((t) => `${t.name || ""} <${t.address}>`).join(", ") || "";

          const ccText =
            envelope.cc?.map((c) => `${c.name || ""} <${c.address}>`).join(", ") || "";

          messages.push({
            from: { text: fromText },
            to: toText,
            cc: ccText,
            subject: envelope.subject || "No Subject",
            date: envelope.date ? new Date(envelope.date).toISOString() : new Date().toISOString(),
            body: parsed.text || parsed.html || "(No content)",
            attachments: (parsed.attachments || []).map((att) => ({
              filename: att.filename || "attachment",
              contentType: att.contentType || "application/octet-stream",
              content: att.content.toString("base64"),
            })),
          });
        }
      } finally {
        lock.release();
      }

      await client.logout();
      return NextResponse.json(messages, { status: 200 });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Email fetch failed: " + err.message },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid request: " + err.message },
      { status: 400 }
    );
  }
}
