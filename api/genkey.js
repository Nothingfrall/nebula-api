// api/genkey.js - Nebula Key Generator API (Vercel Serverless)
// Pakai export default agar Vercel deteksi handler dengan benar

const { connectToDatabase } = require('../lib/mongodb');

// Fungsi generate key unik
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Date.now().toString(36).toUpperCase();
  return `NEB-${random}-${timestamp}`;
}

// Hitung expiry berdasarkan duration
function calculateExpiry(duration) {
  if (duration === 'permanent') return null;

  const now = new Date();
  const units = {
    '1day': 1,
    '7days': 7,
    '30days': 30,
    '90days': 90,
  };

  if (!units[duration]) return undefined; // invalid
  now.setDate(now.getDate() + units[duration]);
  return now;
}

// Handler utama - WAJIB pakai export default untuk Vercel Node runtime
export default async function handler(req, res) {
  console.log('Genkey function invoked'); // Debug log biar kelihatan di Vercel logs

  // CORS header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed - gunakan GET' });
  }

  // Cek token admin dari env vars
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized - token salah atau hilang' });
  }

  // Ambil duration dari query
  const { duration = '1day' } = req.query;
  const expiry = calculateExpiry(duration);

  if (expiry === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request - duration harus 1day, 7days, 30days, 90days, atau permanent'
    });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('keys');

    const key = generateKey();

    const doc = {
      key,
      duration,
      expiry,
      createdAt: new Date(),
      used: false
    };

    await collection.insertOne(doc);

    res.status(201).json({
      success: true,
      data: {
        key: doc.key,
        duration: doc.duration,
        expiry: doc.expiry ? doc.expiry.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
        used: doc.used
      }
    });
  } catch (err) {
    console.error('Error generate key:', err.message);
    res.status(500).json({ success: false, error: 'Server error - cek Vercel logs' });
  }
}
