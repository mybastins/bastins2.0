const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all customers (admin)
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const customers = db.users
    .filter(u => u.role !== 'admin')
    .map(({ password, ...u }) => ({
      ...u,
      orderCount: db.orders.filter(o => o.userId === u.id).length,
      totalSpent: db.orders.filter(o => o.userId === u.id).reduce((s, o) => s + (o.total || 0), 0)
    }));
  res.json(customers);
});

// Search customers
router.get('/search', authenticateToken, requireAdmin, (req, res) => {
  const { q } = req.query;
  const db = readDB();
  const customers = db.users
    .filter(u => u.role !== 'admin' &&
      (u.name.toLowerCase().includes(q.toLowerCase()) ||
       u.email.toLowerCase().includes(q.toLowerCase())))
    .map(({ password, ...u }) => u);
  res.json(customers);
});

// Update profile (self)
router.put('/profile', authenticateToken, (req, res) => {
  const { name, phone, address } = req.body;
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (name) db.users[idx].name = name;
  if (phone !== undefined) db.users[idx].phone = phone;
  if (address !== undefined) db.users[idx].address = address;
  writeDB(db);
  const { password, ...user } = db.users[idx];
  res.json(user);
});

// Get profile
router.get('/profile', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
