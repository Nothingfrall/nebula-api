const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME   = 'nebula_db';

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable in .env or Vercel dashboard');
}

/**
 * Cached connection (Vercel serverless best practice).
 * Each warm function instance reuses the same MongoClient.
 */
let cachedClient = null;
let cachedDb     = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();

  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb     = db;

  return { client, db };
}

module.exports = { connectToDatabase };
