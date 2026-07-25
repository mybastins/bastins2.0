const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { escapeRegex } = require('../lib/util');

// Get all customers (admin)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const users = await db.collection('users').find({ role: { $ne: 'admin' } }).toArray();
  const orders = await db.collection('orders').find({}).toArray();

  const customers = users.map(({ password, ...u }) => ({
    ...u,
    orderCount: orders.filter(o => o.userId === u.id).length,
    totalSpent: orders.filter(o => o.userId === u.id).reduce((s, o) => s + (o.total || 0), 0)
  }));
  res.json(customers);
});

// Search customers
router.get('/search', authenticateToken, requireAdmin, async (req, res) => {
  const { q } = req.query;
  const db = await getDb();
  const pattern = escapeRegex(q || '');
  const customers = await db.collection('users').find({
    role: { $ne: 'admin' },
    $or: [
      { name: { $regex: pattern, $options: 'i' } },
      { email: { $regex: pattern, $options: 'i' } }
    ]
  }).project({ password: 0 }).toArray();
  res.json(customers);
});

// Update profile (self)
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, phone, address } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;

  const db = await getDb();
  const updated = await db.collection('users').findOneAndUpdate(
    { id: req.user.id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { password, ...user } = updated;
  res.json(user);
});

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Delete customer (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const result = await db.collection('users').deleteOne({ id: req.params.id, role: { $ne: 'admin' } });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Customer not found' });
  res.json({ message: 'Customer deleted' });
});

module.exports = router;
