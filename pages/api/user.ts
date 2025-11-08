import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const db = await connectToDatabase();
    const userId = req.query.id as string;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      // Find the user by ID
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

      if (user) {
        // Destructure to exclude password and handle TargetQuota / targetquota case
        const { password, TargetQuota, targetquota, ...rest } = user;

        // Normalize targetquota value: prefer lowercase, fallback to capitalized, else 0
        const normalizedTargetQuota = targetquota ?? TargetQuota ?? 0;

        res.status(200).json({
          ...rest,
          targetquota: normalizedTargetQuota,
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Invalid user ID format or server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
