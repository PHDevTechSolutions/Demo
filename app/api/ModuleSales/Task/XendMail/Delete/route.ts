/**import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, imapPass, messageId } = body;

        if (!email || !imapPass || !messageId) {
            return NextResponse.json(
                { error: "email, imapPass, and messageId are required" },
                { status: 400 }
            );
        }

        // Use defaults if not provided
        const imapHost = body.imapHost || "mail.ecoshiftcorp.com";
        const imapPort = body.imapPort || 993;
        const secure = typeof body.secure === "boolean" ? body.secure : true;

        const client = new ImapFlow({
            host: imapHost,
            port: imapPort,
            secure,
            auth: { user: email, pass: imapPass },
            tls: secure ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
        });

        await client.connect();

        const lock = await client.getMailboxLock("INBOX");
        try {
            // Search by Message-ID
            const uids = await client.search({ header: { "Message-ID": messageId } });

            if (!uids || uids.length === 0) {
                return NextResponse.json({ error: "Email not found" }, { status: 404 });
            }

            // Mark as deleted
            for (const uid of uids) {
                await client.messageFlagsAdd(uid, ["\\Deleted"]);
            }

            // Close mailbox (triggers expunge)
            await client.mailboxClose();

            return NextResponse.json({ message: "Email deleted successfully" }, { status: 200 });
        } finally {
            lock.release();
            await client.logout();
        }
    } catch (err: any) {
        return NextResponse.json({ error: "Delete failed: " + err.message }, { status: 500 });
    }
}**/
