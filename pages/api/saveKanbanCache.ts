import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const { referenceid, cache } = req.body;
  await redis.set(`kanban:${referenceid}`, JSON.stringify(cache));
  res.status(200).json({ success: true });
}
