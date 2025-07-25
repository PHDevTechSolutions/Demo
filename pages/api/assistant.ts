import type { NextApiRequest, NextApiResponse } from "next";
import { detectExpression } from "@/lib/Replies/Expression";
import { detectAccountsReply } from "@/lib/Replies/Accounts";
import { detectProgressReply } from "@/lib/Replies/Progress";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { message } = req.body;
  const referenceid = req.query.id as string;

  if (!message || typeof message !== "string" || !referenceid || typeof referenceid !== "string") {
    return res.status(400).json({ error: "Invalid message or missing referenceid." });
  }

  const cleanMessage = message.trim().toLowerCase();

  const accountResult = await detectAccountsReply(cleanMessage, referenceid);
  if (accountResult?.reply) {
    return res.status(200).json(accountResult);
  }

  const progressResult = await detectProgressReply(cleanMessage, referenceid);
  if (progressResult?.reply) {
    return res.status(200).json(progressResult);
  }

  try {
    const { reply, category } = detectExpression(cleanMessage);
    if (reply) {
      return res.status(200).json({ reply, category });
    }
  } catch (error) {
    console.error("❌ detectExpression error:", error);
  }

  return res.status(200).json({
    reply: "Pasensya na, hindi ko po maintindihan ang tanong.",
  });
}
