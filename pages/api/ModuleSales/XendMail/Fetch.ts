import imaps from "imap-simple";
import type { NextApiRequest, NextApiResponse } from "next";

interface ImapMessagePart {
  which: string;
  body: any;
}

interface ImapMessage {
  attributes: { uid: number };
  parts: ImapMessagePart[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, imapHost, imapPass, imapPort = 993, secure = true, start = 0, limit = 20 } = req.body;

  if (!email || !imapHost || !imapPass) return res.status(400).json({ error: "Missing credentials" });

  const config = {
    imap: {
      user: email,
      password: imapPass,
      host: imapHost,
      port: imapPort,
      tls: secure,
      tlsOptions: { rejectUnauthorized: false },
    },
    onerror: (err: any) => console.error("IMAP Error:", err),
  };

  try {
    const connection = await imaps.connect(config as any);
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"];
    const fetchOptions = { bodies: ["HEADER.FIELDS (FROM TO CC SUBJECT DATE)"], struct: true };

    const messagesRaw: ImapMessage[] = await connection.search(searchCriteria, fetchOptions);
    if (!messagesRaw?.length) return res.status(200).json([]);

    // Reverse for latest first, paginate
    const batchMessages: ImapMessage[] = messagesRaw.slice().reverse().slice(start, start + limit);

    const emails = batchMessages.map((msg: ImapMessage) => {
      const headers = msg.parts.find((p) => p.which.includes("HEADER"))?.body || {};
      return {
        id: msg.attributes.uid,
        from: headers.from?.[0] || "Unknown",
        to: headers.to?.[0] || "",
        cc: headers.cc?.[0] || "",
        subject: headers.subject?.[0] || "(No subject)",
        date: headers.date ? new Date(headers.date[0]).toISOString() : new Date().toISOString(),
      };
    });

    await connection.end();
    res.status(200).json({ emails, total: messagesRaw.length });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
