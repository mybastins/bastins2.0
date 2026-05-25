const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const VALID_STATUSES = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

// Create order
router.post('/create', authenticateToken, (req, res) => {
  const { items, total, shippingAddress, phone } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Items required' });
  if (!shippingAddress) return res.status(400).json({ error: 'Shipping address required' });

  const db = readDB();
  const trackingNumber = `BASTINS-${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Deduct stock
  items.forEach(item => {
    const idx = db.products.findIndex(p => p.id === item.id);
    if (idx !== -1 && db.products[idx].stock > 0) {
      db.products[idx].stock = Math.max(0, (db.products[idx].stock || 0) - item.quantity);
      if (db.products[idx].stock === 0) db.products[idx].status = 'out_of_stock';
    }
  });

  const order = {
    id: uuidv4(),
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    phone: phone || '',
    items,
    total: total || 0,
    shippingAddress,
    paymentStatus: 'paid',
    status: 'new',
    trackingNumber,
    estimatedDelivery,
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  writeDB(db);
  res.json(order);
});

// Track order
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
  res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Get all orders (admin)
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Update order status (admin)
router.put('/:orderId/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` });
  }
  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.orderId);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  db.orders[index].status = status;
  writeDB(db);
  res.json(db.orders[index]);
});

module.exports = router;
