import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const db = await connectToDatabase();

  try {
    const { Role, tsm, id } = req.query;

    // Fetch by ID only (single agent by ReferenceID)
    if (id) {
      const user = await db.collection("users").findOne(
        { ReferenceID: id },
        { projection: { Firstname: 1, Lastname: 1, ReferenceID: 1, _id: 0 } }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    }

    // Otherwise fetch list of users by Role and TSM
    if (!Role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const filter: any = {
      Role,
      Status: { $nin: ["Resigned", "Terminated"] },
    };

    if (tsm) {
      filter.TSM = tsm;
    }

    const users = await db.collection("users")
      .find(filter)
      .project({
        Firstname: 1,
        Lastname: 1,
        ReferenceID: 1,
        TSM: 1,
        _id: 0,
      })
      .toArray();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching TSA:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
