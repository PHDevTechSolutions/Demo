import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const db = await connectToDatabase();
    const referenceId = req.query.referenceid as string;

    if (!referenceId) {
      return res.status(400).json({ error: "ReferenceID is required" });
    }

    try {
      // Find the user by ReferenceID
      const user = await db.collection("users").findOne({ ReferenceID: referenceId });

      if (user) {
        // Exclude sensitive info like password
        const { password, ...userData } = user;
        return res.status(200).json(userData);
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ error: "Server error while fetching user" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
