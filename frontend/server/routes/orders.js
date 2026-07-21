const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const VALID_STATUSES = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

// Create order
router.post('/create', authenticateToken, async (req, res) => {
  const { items, total, shippingAddress, phone } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Items required' });
  if (!shippingAddress) return res.status(400).json({ error: 'Shipping address required' });

  const db = await getDb();
  const products = db.collection('products');
  const trackingNumber = `BASTINS-${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Deduct stock
  for (const item of items) {
    const product = await products.findOne({ id: item.id });
    if (product && product.stock > 0) {
      const newStock = Math.max(0, (product.stock || 0) - item.quantity);
      await products.updateOne(
        { id: item.id },
        { $set: { stock: newStock, ...(newStock === 0 ? { status: 'out_of_stock' } : {}) } }
      );
    }
  }

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

  await db.collection('orders').insertOne(order);
  res.json(order);
});

// Track order
router.get('/track/:identifier', async (req, res) => {
  const db = await getDb();
  const order = await db.collection('orders').findOne({
    $or: [{ id: req.params.identifier }, { trackingNumber: req.params.identifier }]
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  const db = await getDb();
  const orders = await db.collection('orders')
    .find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(orders);
});

// Get all orders (admin)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
  res.json(orders);
});

// Update order status (admin)
router.put('/:orderId/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` });
  }
  const db = await getDb();
  const updated = await db.collection('orders').findOneAndUpdate(
    { id: req.params.orderId },
    { $set: { status } },
    { returnDocument: 'after' }
  );
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

module.exports = router;
