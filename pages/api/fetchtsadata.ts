import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const db = await connectToDatabase();

  try {
    const { Role, tsm, manager } = req.query;

    if (!Role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // 🔹 Build query filter
    const filter: any = {
      Role,
      Status: { $nin: ["Resigned", "Terminated"] },
    };

    if (tsm) {
      filter.TSM = tsm;
    }

    if (manager) {
      filter.Manager = manager;
    }

    // 🔹 Include profilePicture in projection
    const users = await db
      .collection("users")
      .find(filter)
      .project({
        Firstname: 1,
        Lastname: 1,
        ReferenceID: 1,
        Email: 1,
        TSM: 1,
        Manager: 1,
        Position: 1,
        Status: 1,
        profilePicture: 1, // 🟢 Added this
        _id: 0,
      })
      .toArray();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
