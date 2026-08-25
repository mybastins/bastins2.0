const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const SETTINGS_ID = 'paymentMethods';
const DEFAULTS = { cod: true, payu: false };

// Get enabled payment methods (public — the checkout page needs this without logging in)
router.get('/payment-methods', async (req, res) => {
  const db = await getDb();
  const doc = await db.collection('meta').findOne({ _id: SETTINGS_ID });
  res.json({ cod: doc?.cod ?? DEFAULTS.cod, payu: doc?.payu ?? DEFAULTS.payu });
});

// Update enabled payment methods (admin)
router.put('/payment-methods', authenticateToken, requireAdmin, async (req, res) => {
  const { cod, payu } = req.body;
  const update = {};
  if (typeof cod === 'boolean') update.cod = cod;
  if (typeof payu === 'boolean') update.payu = payu;

  const db = await getDb();
  await db.collection('meta').updateOne({ _id: SETTINGS_ID }, { $set: update }, { upsert: true });
  const doc = await db.collection('meta').findOne({ _id: SETTINGS_ID });
  res.json({ cod: doc.cod ?? DEFAULTS.cod, payu: doc.payu ?? DEFAULTS.payu });
});

module.exports = router;
