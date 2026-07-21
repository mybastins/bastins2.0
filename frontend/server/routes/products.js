const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Vercel's serverless filesystem is read-only (aside from /tmp), so uploads
// are held in memory for the duration of the request instead of written to disk.
const upload = multer({ storage: multer.memoryStorage() });

// Get all products
router.get('/all', async (req, res) => {
  const db = await getDb();
  const products = await db.collection('products').find({}).toArray();
  res.json(products);
});

// Get by category
router.get('/category/:category', async (req, res) => {
  const db = await getDb();
  const products = await db.collection('products')
    .find({ category: req.params.category })
    .collation({ locale: 'en', strength: 2 }) // case-insensitive match
    .toArray();
  res.json(products);
});

// Get single product
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const product = await db.collection('products').findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Create product (admin)
router.post('/create', authenticateToken, requireAdmin, async (req, res) => {
  const { name, price, description, category, sizes, colors, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });

  const product = {
    id: uuidv4(),
    name,
    price: Number(price),
    description: description || '',
    category: category || 'Uncategorized',
    sizes: Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : []),
    colors: Array.isArray(colors) ? colors : (colors ? colors.split(',').map(c => c.trim()) : []),
    image: image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    createdAt: new Date().toISOString()
  };

  const db = await getDb();
  await db.collection('products').insertOne(product);
  res.json(product);
});

// Bulk upload via Excel
router.post('/bulk-upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const added = rows.map(row => ({
    id: uuidv4(),
    name: row.name || 'Unnamed',
    price: Number(row.price) || 0,
    description: row.description || '',
    category: row.category || 'Uncategorized',
    sizes: row.sizes ? String(row.sizes).split(',').map(s => s.trim()) : [],
    colors: row.colors ? String(row.colors).split(',').map(c => c.trim()) : [],
    image: row.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    createdAt: new Date().toISOString()
  }));

  if (added.length) {
    const db = await getDb();
    await db.collection('products').insertMany(added);
  }

  res.json({ added: added.length, products: added });
});

// Update product (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const { id, _id, ...updates } = req.body; // never let the body override the id/_id

  const updated = await db.collection('products').findOneAndUpdate(
    { id: req.params.id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

// Delete product (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const result = await db.collection('products').deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

module.exports = router;
