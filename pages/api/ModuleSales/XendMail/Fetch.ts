import imaps from 'imap-simple';
import { simpleParser, ParsedMail } from 'mailparser';
import type { NextApiRequest, NextApiResponse } from 'next';

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
    content: string;
  }[];
};

// Minimal interfaces to satisfy TypeScript
interface ImapConfig {
  imap: {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
    authTimeout?: number;
    tlsOptions?: object;
  };
  onerror?: (err: any) => void;
}

interface ImapMessage {
  attributes: { struct: any };
  parts: { which: string; body: any }[];
}

interface ImapMessagePart {
  type?: string;
  disposition?: string;
  params?: any;
  partID?: string;
  encoding?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, imapHost, imapPass, imapPort, secure, start = 0, limit = 5 } = req.body;

  if (!email || !imapHost || !imapPass || !imapPort || typeof secure !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid IMAP credentials' });
  }

  const config: ImapConfig = {
    imap: {
      user: email,
      password: imapPass,
      host: imapHost,
      port: imapPort,
      tls: secure,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false },
    },
    onerror: (err: any) => console.error('IMAP Error:', err),
  };

  try {
    const connection = await imaps.connect(config as any);
    await connection.openBox('INBOX');

    // Fetch only the latest emails (more efficient than 'ALL')
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO CC SUBJECT DATE)', 'TEXT'], struct: true };

    const messagesRaw: ImapMessage[] = await connection.search(searchCriteria, fetchOptions);

    if (!messagesRaw?.length) return res.status(200).json([]);

    // Reverse and slice for pagination
    const batchMessages = messagesRaw.slice().reverse().slice(start, start + limit);

    const messages: EmailData[] = await Promise.all(
      batchMessages.map(async (msg) => {
        const allParts: ImapMessagePart[] = imaps.getParts(msg.attributes.struct);

        let sourceBuffer: Buffer | null = null;

        for (const part of allParts) {
          if (!part.disposition && part.type === 'text') {
            const partData = await connection.getPartData(msg as any, part as any);
            sourceBuffer = Buffer.from(partData);
            break;
          }
        }

        const parsed: Partial<ParsedMail> = sourceBuffer
          ? await simpleParser(sourceBuffer)
          : { text: '', html: '', attachments: [] };

        const headers = msg.parts.find((p) => p.which.includes('HEADER'))?.body || {};

        const fromText = headers.from?.[0] || 'Unknown Sender';
        const toText = headers.to?.[0] || '';
        const ccText = headers.cc?.[0] || '';
        const subject = headers.subject?.[0] || 'No Subject';
        const date = headers.date ? new Date(headers.date[0]).toISOString() : new Date().toISOString();

        return {
          from: { text: fromText },
          to: toText,
          cc: ccText,
          subject,
          date,
          body: parsed.text || parsed.html || '(No content)',
          attachments: (parsed.attachments || []).map((att) => ({
            filename: att.filename || 'attachment',
            contentType: att.contentType || 'application/octet-stream',
            content: Buffer.from(att.content || '').toString('base64'),
          })),
        };
      })
    );

    await connection.end();
    return res.status(200).json(messages);
  } catch (err: any) {
    console.error('Email fetch error:', err);
    return res.status(500).json({ error: 'Email fetch failed: ' + err.message });
  }
}
