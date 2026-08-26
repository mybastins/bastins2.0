const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const DEFAULT_TEMPLATE = {
  name: 'Unisex T-Shirt',
  productType: 'Unisex T-Shirt',
  price: 599,
  discountPrice: null,
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  defaultColors: ['#151515', '#FFFFFF', '#2D314A', '#3A3E41'],
  category: 'Graphic Tees',
  collection: '',
  description: 'Premium unisex t-shirt with a custom print.',
};

// List templates (admin) — seeds one default on first use
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const templates = db.collection('templates');
  let all = await templates.find({}).sort({ createdAt: 1 }).toArray();
  if (all.length === 0) {
    const now = new Date().toISOString();
    const seeded = { id: uuidv4(), ...DEFAULT_TEMPLATE, createdAt: now, updatedAt: now };
    await templates.insertOne(seeded);
    all = [seeded];
  }
  res.json(all);
});

// Update a template (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id: _ignoreId, _id, createdAt, ...updates } = req.body;
  updates.updatedAt = new Date().toISOString();

  const db = await getDb();
  const updated = await db.collection('templates').findOneAndUpdate(
    { id: req.params.id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  if (!updated) return res.status(404).json({ error: 'Template not found' });
  res.json(updated);
});

module.exports = router;
