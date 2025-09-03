// file: /pages/api/updateImap.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB"; // siguraduhing tama ang path
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { referenceID, imapHost, imapPass } = req.body;

  if (!referenceID || !imapHost || !imapPass) {
    return res.status(400).json({ error: "ReferenceID, ImapHost, and ImapPass are required" });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { ReferenceID: referenceID },
      {
        $set: {
          ImapHost: imapHost,
          ImapPass: imapPass,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "IMAP credentials updated successfully" });
  } catch (error: any) {
    console.error("Error updating IMAP credentials:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
