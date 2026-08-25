const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/mongo');
const { authenticateToken } = require('../middleware/auth');
const { buildPayuHash, verifyPayuResponseHash, PAYU_ACTION_URL } = require('../lib/payu');

// Build the hash-signed PayU form params for an existing pending order
router.post('/payu/initiate', authenticateToken, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'orderId required' });

  const db = await getDb();
  const order = await db.collection('orders').findOne({ id: orderId, userId: req.user.id });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.paymentMethod !== 'payu') return res.status(400).json({ error: 'Order is not a PayU order' });
  if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'Order already paid' });

  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;
  if (!key || !salt) return res.status(500).json({ error: 'Payment gateway not configured' });

  const origin = `${req.protocol}://${req.get('host')}`;
  const amount = Number(order.total).toFixed(2);
  const productinfo = `BASTINS Order (${order.items.length} item${order.items.length > 1 ? 's' : ''})`;
  const firstname = order.userName || 'Customer';
  const email = order.userEmail;
  const phone = order.phone || '';

  const hash = buildPayuHash({ key, txnid: order.payuTxnId, amount, productinfo, firstname, email, salt });

  res.json({
    action: PAYU_ACTION_URL,
    params: {
      key, txnid: order.payuTxnId, amount, productinfo, firstname, email, phone,
      surl: `${origin}/api/payments/payu/success`,
      furl: `${origin}/api/payments/payu/failure`,
      hash,
      service_provider: 'payu_paisa',
    }
  });
});

// Restore stock for an order whose payment didn't go through
async function restoreStock(db, order) {
  const products = db.collection('products');
  for (const item of order.items) {
    const product = await products.findOne({ id: item.id });
    if (!product) continue;
    const newStock = (product.stock || 0) + item.quantity;
    await products.updateOne(
      { id: item.id },
      { $set: { stock: newStock, ...(product.status === 'out_of_stock' && newStock > 0 ? { status: 'active' } : {}) } }
    );
  }
}

// PayU posts here (a real browser form submission, not an API call) after the customer pays
async function handleCallback(req, res) {
  const body = req.body || {};
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;
  const valid = verifyPayuResponseHash({ ...body, key, salt });

  const db = await getDb();
  const order = valid ? await db.collection('orders').findOne({ payuTxnId: body.txnid }) : null;

  if (!valid || !order) {
    return res.redirect(303, '/order-success?status=failure');
  }

  if (order.paymentStatus === 'paid') {
    // already processed (e.g. duplicate callback) — just send them back to the confirmation
    return res.redirect(303, `/order-success?orderId=${order.id}`);
  }

  if (body.status === 'success') {
    await db.collection('orders').updateOne(
      { id: order.id },
      { $set: { paymentStatus: 'paid', payuMihpayid: body.mihpayid || '' } }
    );
  } else {
    await restoreStock(db, order);
    await db.collection('orders').updateOne({ id: order.id }, { $set: { paymentStatus: 'failed' } });
  }

  res.redirect(303, `/order-success?orderId=${order.id}`);
}

router.post('/payu/success', handleCallback);
router.post('/payu/failure', handleCallback);

module.exports = router;
