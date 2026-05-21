const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { readDB, writeDB } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all products
router.get('/all', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// Get by category
router.get('/category/:category', (req, res) => {
  const db = readDB();
  const products = db.products.filter(p =>
    p.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(products);
});

// Get single product
router.get('/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Create product (admin)
router.post('/create', authenticateToken, requireAdmin, (req, res) => {
  const { name, price, description, category, sizes, colors, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });

  const db = readDB();
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

  db.products.push(product);
  writeDB(db);
  res.json(product);
});

// Bulk upload via Excel
router.post('/bulk-upload', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });

  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const db = readDB();
  const added = [];

  rows.forEach(row => {
    const product = {
      id: uuidv4(),
      name: row.name || 'Unnamed',
      price: Number(row.price) || 0,
      description: row.description || '',
      category: row.category || 'Uncategorized',
      sizes: row.sizes ? String(row.sizes).split(',').map(s => s.trim()) : [],
      colors: row.colors ? String(row.colors).split(',').map(c => c.trim()) : [],
      image: row.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      createdAt: new Date().toISOString()
    };
    db.products.push(product);
    added.push(product);
  });

  writeDB(db);
  res.json({ added: added.length, products: added });
});

// Update product (admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  db.products[index] = { ...db.products[index], ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.products[index]);
});

// Delete product (admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  db.products.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
