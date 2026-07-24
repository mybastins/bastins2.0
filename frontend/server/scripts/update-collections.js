require('dotenv').config();
const { getDb } = require('../lib/mongo');

const collections = [
  'Solid Plain T-shirts',
  'Graphic Printed T-shirts',
  'Oversized T-shirts',
  'Hoodies'
];

const collectionMeta = {
  'Solid Plain T-shirts':     { image: '/images/collection-solids.png', description: '' },
  'Graphic Printed T-shirts': { image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800', description: '' },
  'Oversized T-shirts':       { image: '/images/collection-oversized.png', description: '' },
  'Hoodies':                  { image: '/images/collection-hoodies.png', description: '' }
};

async function run() {
  const db = await getDb();
  await db.collection('meta').updateOne(
    { _id: 'store' },
    { $set: { collections, collectionMeta } },
    { upsert: true }
  );
  console.log('Collections updated:', collections);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
