const { MongoClient } = require('mongodb');

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  // Cached on `global` so both local hot-reloads and warm serverless
  // containers reuse the same connection instead of opening a new one per request.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

async function getDb() {
  const client = await getClientPromise();
  return client.db('bastins');
}

module.exports = { getDb };
