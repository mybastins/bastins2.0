const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = readDB();
  res.json({ collections: db.collections, categories: db.categories });
});

router.post('/collection', authenticateToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = readDB();
  if (!db.collections.includes(name)) { db.collections.push(name); writeDB(db); }
  res.json(db.collections);
});

router.delete('/collection/:name', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  db.collections = db.collections.filter(c => c !== req.params.name);
  writeDB(db);
  res.json(db.collections);
});

router.post('/category', authenticateToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = readDB();
  if (!db.categories.includes(name)) { db.categories.push(name); writeDB(db); }
  res.json(db.categories);
});

router.delete('/category/:name', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  db.categories = db.categories.filter(c => c !== req.params.name);
  writeDB(db);
  res.json(db.categories);
});

module.exports = router;
