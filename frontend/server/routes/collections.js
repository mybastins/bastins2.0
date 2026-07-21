const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const META_ID = 'store';

async function getMeta(db) {
  const meta = await db.collection('meta').findOne({ _id: META_ID });
  return meta || { collections: [], categories: [], collectionMeta: {} };
}

// GET all collections, categories, and their metadata
router.get('/', async (req, res) => {
  const db = await getDb();
  const meta = await getMeta(db);
  res.json({
    collections: meta.collections || [],
    categories: meta.categories || [],
    collectionMeta: meta.collectionMeta || {}
  });
});

// Add a new collection
router.post('/collection', authenticateToken, requireAdmin, async (req, res) => {
  const { name, image = '', description = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const db = await getDb();
  const meta = await getMeta(db);
  if (!meta.collections.includes(name)) {
    meta.collections.push(name);
    meta.collectionMeta = { ...(meta.collectionMeta || {}), [name]: { image, description } };
    await db.collection('meta').updateOne(
      { _id: META_ID },
      { $set: { collections: meta.collections, collectionMeta: meta.collectionMeta } },
      { upsert: true }
    );
  }
  res.json({ collections: meta.collections, collectionMeta: meta.collectionMeta });
});

// Update a collection's cover image and description
router.put('/collection/:name', authenticateToken, requireAdmin, async (req, res) => {
  const { image, description } = req.body;
  const name = decodeURIComponent(req.params.name);

  const db = await getDb();
  const meta = await getMeta(db);
  if (!meta.collections.includes(name)) return res.status(404).json({ error: 'Collection not found' });

  meta.collectionMeta = meta.collectionMeta || {};
  meta.collectionMeta[name] = {
    image: image !== undefined ? image : (meta.collectionMeta[name]?.image || ''),
    description: description !== undefined ? description : (meta.collectionMeta[name]?.description || '')
  };
  await db.collection('meta').updateOne(
    { _id: META_ID },
    { $set: { collectionMeta: meta.collectionMeta } },
    { upsert: true }
  );
  res.json({ collections: meta.collections, collectionMeta: meta.collectionMeta });
});

// Delete a collection
router.delete('/collection/:name', authenticateToken, requireAdmin, async (req, res) => {
  const name = decodeURIComponent(req.params.name);

  const db = await getDb();
  const meta = await getMeta(db);
  meta.collections = meta.collections.filter(c => c !== name);
  if (meta.collectionMeta) delete meta.collectionMeta[name];
  await db.collection('meta').updateOne(
    { _id: META_ID },
    { $set: { collections: meta.collections, collectionMeta: meta.collectionMeta || {} } },
    { upsert: true }
  );
  res.json({ collections: meta.collections, collectionMeta: meta.collectionMeta });
});

// Add a new category
router.post('/category', authenticateToken, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const db = await getDb();
  const meta = await getMeta(db);
  if (!meta.categories.includes(name)) {
    meta.categories.push(name);
    await db.collection('meta').updateOne(
      { _id: META_ID },
      { $set: { categories: meta.categories } },
      { upsert: true }
    );
  }
  res.json(meta.categories);
});

// Delete a category
router.delete('/category/:name', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const meta = await getMeta(db);
  meta.categories = meta.categories.filter(c => c !== decodeURIComponent(req.params.name));
  await db.collection('meta').updateOne(
    { _id: META_ID },
    { $set: { categories: meta.categories } },
    { upsert: true }
  );
  res.json(meta.categories);
});

module.exports = router;
