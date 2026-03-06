// api/genkey.js - Versi Super Simple

const { connectToDatabase } = require('../lib/mongodb');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET' });

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Token salah' });
  }

  const { duration = '1day' } = req.query;
  if (!['1day', 'permanent'].includes(duration)) {
    return res.status(400).json({ error: 'duration harus 1day atau permanent' });
  }

  try {
    const { db } = await connectToDatabase();
    const keys = db.collection('keys');

    const key = `NEB-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const expiry = duration === 'permanent' ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await keys.insertOne({
      key,
      duration,
      expiry,
      createdAt: new Date(),
      used: false
    });

    res.status(201).json({ key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
