import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/MongoDB';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, department, status, timestamp } = req.body;

  // Validate input
  if (!email || !department || !status || !timestamp) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const db = await connectToDatabase(); // should return the DB instance

    // Get client IP (respecting proxy headers if present)
    const xForwardedFor = req.headers['x-forwarded-for'];
    const ip =
      (typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0].trim() : undefined) ||
      (Array.isArray(xForwardedFor) ? xForwardedFor[0] : undefined) ||
      req.socket.remoteAddress ||
      'Unknown';

    // Optional: capture user agent for more context
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const doc = {
      email,
      department,
      status,
      timestamp: new Date(timestamp),
      ipAddress: ip,
      userAgent,
    };

    const result = await db.collection('activityLogs').insertOne(doc);

    return res.status(200).json({ message: 'Activity logged successfully.', id: result.insertedId });
  } catch (error) {
    console.error('Logging error:', error);
    return res.status(500).json({ message: 'Error logging activity.' });
  }
}