// api/ModuleSales/Task/XendMail/FetchBody.ts
import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, imapHost, imapPass, imapPort = 993, secure = true, uid } = req.body;
  if (!email || !imapHost || !imapPass || !uid) return res.status(400).json({ error: "Missing parameters" });

  const config = {
    imap: { user: email, password: imapPass, host: imapHost, port: imapPort, tls: secure, tlsOptions: { rejectUnauthorized: false } },
    onerror: (err: any) => console.error(err),
  };

  try {
    const connection = await imaps.connect(config as any);
    await connection.openBox("INBOX");

    const fetchOptions = { bodies: ["TEXT"], struct: true };
    const [msg] = await connection.search([["UID", uid]], fetchOptions);

    if (!msg) return res.status(404).json({ error: "Email not found" });

    const allParts = imaps.getParts(msg.attributes.struct);
    let sourceBuffer: Buffer | null = null;

    for (const part of allParts) {
      if (!part.disposition && part.type === "text") {
        const partData = await connection.getPartData(msg as any, part as any);
        sourceBuffer = Buffer.from(partData);
        break;
      }
    }

    const parsed = sourceBuffer ? await simpleParser(sourceBuffer) : { text: "", html: "", attachments: [] };

    await connection.end();

    res.status(200).json({
      body: parsed.text || parsed.html || "",
      attachments: (parsed.attachments || []).map(att => ({
        filename: att.filename || "attachment",
        contentType: att.contentType || "application/octet-stream",
        content: att.content.toString("base64"),
      })),
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
