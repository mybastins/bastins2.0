const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Create order
router.post('/create', authenticateToken, (req, res) => {
  const { items, total } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Items required' });

  const db = readDB();
  const trackingNumber = `BASTINS-${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const order = {
    id: uuidv4(),
    userId: req.user.id,
    userName: req.user.name,
    items,
    total: total || 0,
    status: 'pending',
    trackingNumber,
    estimatedDelivery,
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  writeDB(db);
  res.json(order);
});

// Track order by ID or tracking number
router.get('/track/:identifier', (req, res) => {
  const db = readDB();
  const order = db.orders.find(o =>
    o.id === req.params.identifier || o.trackingNumber === req.params.identifier
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Get user's orders
router.get('/my-orders', authenticateToken, (req, res) => {
  const db = readDB();
  const orders = db.orders.filter(o => o.userId === req.user.id);
  res.json(orders);
});

// Get all orders (admin)
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// Update order status (admin)
router.put('/:orderId/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.orderId);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  db.orders[index].status = status;
  writeDB(db);
  res.json(db.orders[index]);
});

module.exports = router;
