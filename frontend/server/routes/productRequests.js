const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../lib/mongo');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { generateMockup } = require('../lib/mockupCompositor');
const { uploadBuffer } = require('../lib/blob');

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB — stays under Vercel's ~4.5MB request body ceiling
const MAX_COLORS = 15; // keeps a synchronous request comfortably inside the function's time budget

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
});

// List requests (admin), newest first
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const requests = await db.collection('productRequests').find({}).sort({ createdAt: -1 }).toArray();
  res.json(requests);
});

// Submit a new request — generates mockups and a draft product synchronously
router.post('/', authenticateToken, requireAdmin,
  upload.fields([{ name: 'frontDesign', maxCount: 1 }, { name: 'backDesign', maxCount: 1 }]),
  async (req, res) => {
    const db = await getDb();
    const requests = db.collection('productRequests');

    const { templateId, productName } = req.body;
    let colors, placements;
    try {
      colors = JSON.parse(req.body.colors || '[]');
      placements = JSON.parse(req.body.placements || '[]');
    } catch {
      return res.status(400).json({ error: 'Invalid colors/placements payload' });
    }

    if (!templateId) return res.status(400).json({ error: 'templateId is required' });
    if (!productName?.trim()) return res.status(400).json({ error: 'Product name is required' });
    if (!Array.isArray(colors) || colors.length === 0) return res.status(400).json({ error: 'Select at least one colour' });
    if (colors.length > MAX_COLORS) return res.status(400).json({ error: `Select at most ${MAX_COLORS} colours per submission` });
    if (!Array.isArray(placements) || placements.length === 0) return res.status(400).json({ error: 'Select at least one placement' });

    const frontFile = req.files?.frontDesign?.[0];
    const backFile = req.files?.backDesign?.[0];
    if (placements.includes('front') && !frontFile) return res.status(400).json({ error: 'Front design file is required' });
    if (placements.includes('back') && !backFile) return res.status(400).json({ error: 'Back design file is required' });

    const template = await db.collection('templates').findOne({ id: templateId });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const now = new Date().toISOString();
    const request = {
      id: uuidv4(),
      templateId,
      productName: productName.trim(),
      colors,
      placements,
      frontDesignUrl: null,
      backDesignUrl: null,
      status: 'queued',
      error: null,
      mockupPreviewUrls: [],
      generatedProductId: null,
      published: false,
      createdAt: now,
      updatedAt: now,
    };
    await requests.insertOne(request);

    async function fail(message) {
      await requests.updateOne({ id: request.id }, { $set: { status: 'failed', error: message, updatedAt: new Date().toISOString() } });
    }

    try {
      await requests.updateOne({ id: request.id }, { $set: { status: 'in-progress', updatedAt: new Date().toISOString() } });

      const frontDesignUrl = frontFile ? await uploadBuffer(frontFile.buffer, 'front-design.png', 'designs', frontFile.mimetype) : null;
      const backDesignUrl = backFile ? await uploadBuffer(backFile.buffer, 'back-design.png', 'designs', backFile.mimetype) : null;
      await requests.updateOne({ id: request.id }, { $set: { frontDesignUrl, backDesignUrl } });

      const mockupImages = [];
      for (const colorHex of colors) {
        for (const view of placements) {
          const designBuffer = view === 'front' ? frontFile?.buffer : backFile?.buffer;
          const pngBuffer = await generateMockup({ view, colorHex, designBuffer });
          const url = await uploadBuffer(pngBuffer, `${view}-${colorHex.replace('#', '')}.png`, 'mockups', 'image/png');
          mockupImages.push(url);
        }
      }

      const product = {
        id: uuidv4(),
        name: request.productName,
        price: template.price,
        discountPrice: template.discountPrice ?? null,
        description: template.description || '',
        category: template.category || 'Uncategorized',
        collection: template.collection || '',
        sizes: template.sizes || [],
        colors,
        image: mockupImages[0],
        mockupImages,
        stock: 0,
        sku: '',
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      await db.collection('products').insertOne(product);

      await requests.updateOne(
        { id: request.id },
        { $set: {
            status: 'updated',
            mockupPreviewUrls: mockupImages,
            generatedProductId: product.id,
            updatedAt: new Date().toISOString(),
        } }
      );

      const finalRequest = await requests.findOne({ id: request.id });
      res.json(finalRequest);
    } catch (err) {
      await fail(err.message || 'Mockup generation failed');
      const finalRequest = await requests.findOne({ id: request.id });
      res.status(500).json(finalRequest);
    }
  }
);

// Publish the product a request generated (admin approval step)
router.put('/:id/publish', authenticateToken, requireAdmin, async (req, res) => {
  const db = await getDb();
  const request = await db.collection('productRequests').findOne({ id: req.params.id });
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'updated') return res.status(400).json({ error: 'Request is not ready to publish' });
  if (!request.generatedProductId) return res.status(400).json({ error: 'No product was generated for this request' });

  await db.collection('products').updateOne({ id: request.generatedProductId }, { $set: { status: 'active' } });
  const updated = await db.collection('productRequests').findOneAndUpdate(
    { id: request.id },
    { $set: { published: true, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  res.json(updated);
});

module.exports = router;
