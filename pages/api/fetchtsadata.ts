import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const db = await connectToDatabase();

  try {
    const { Role, tsm } = req.query; // lowercase tsm from frontend

    if (!Role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Build the query filter
    const filter: any = { Role };

    // 🔁 Map lowercase `tsm` param to MongoDB `TSM` field
    if (tsm) {
      filter.TSM = tsm; // this correctly queries the MongoDB field "TSM"
    }

    // Fetch users
    const users = await db.collection("users")
      .find(filter)
      .project({
        Firstname: 1,
        Lastname: 1,
        ReferenceID: 1,
        TSM: 1, // for verification
        _id: 0
      })
      .toArray();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching TSA:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
