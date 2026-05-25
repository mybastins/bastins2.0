const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET all collections, categories, and their metadata
router.get('/', (req, res) => {
  const db = readDB();
  res.json({
    collections: db.collections,
    categories: db.categories,
    collectionMeta: db.collectionMeta || {}
  });
});

// Add a new collection
router.post('/collection', authenticateToken, requireAdmin, (req, res) => {
  const { name, image = '', description = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = readDB();
  if (!db.collections.includes(name)) {
    db.collections.push(name);
    if (!db.collectionMeta) db.collectionMeta = {};
    db.collectionMeta[name] = { image, description };
    writeDB(db);
  }
  res.json({ collections: db.collections, collectionMeta: db.collectionMeta });
});

// Update a collection's cover image and description
router.put('/collection/:name', authenticateToken, requireAdmin, (req, res) => {
  const { image, description } = req.body;
  const name = decodeURIComponent(req.params.name);
  const db = readDB();
  if (!db.collections.includes(name)) return res.status(404).json({ error: 'Collection not found' });
  if (!db.collectionMeta) db.collectionMeta = {};
  db.collectionMeta[name] = {
    image: image !== undefined ? image : (db.collectionMeta[name]?.image || ''),
    description: description !== undefined ? description : (db.collectionMeta[name]?.description || '')
  };
  writeDB(db);
  res.json({ collections: db.collections, collectionMeta: db.collectionMeta });
});

// Delete a collection
router.delete('/collection/:name', authenticateToken, requireAdmin, (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const db = readDB();
  db.collections = db.collections.filter(c => c !== name);
  if (db.collectionMeta) delete db.collectionMeta[name];
  writeDB(db);
  res.json({ collections: db.collections, collectionMeta: db.collectionMeta });
});

// Add a new category
router.post('/category', authenticateToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = readDB();
  if (!db.categories.includes(name)) { db.categories.push(name); writeDB(db); }
  res.json(db.categories);
});

// Delete a category
router.delete('/category/:name', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  db.categories = db.categories.filter(c => c !== decodeURIComponent(req.params.name));
  writeDB(db);
  res.json(db.categories);
});

module.exports = router;
