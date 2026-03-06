import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const adminToken = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }

  const { duration } = req.query;
  if (!duration) return res.status(400).json({ error: 'Missing duration parameter' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('nebula_db'); // ganti nama DB
    const keys = db.collection('keys');

    const key = `NEB-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${Date.now().toString(36)}`;

    const expiry = duration === 'permanent' ? null : new Date(Date.now() + parseDuration(duration));

    await keys.insertOne({
      key,
      duration,
      createdAt: new Date(),
      expiry,
      used: false
    });

    res.status(200).json({ key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
}

function parseDuration(dur) {
  if (dur === '1day') return 24 * 60 * 60 * 1000;
  // tambah case lain
  return 0;
}