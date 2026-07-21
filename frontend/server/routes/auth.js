const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../lib/mongo');
const { JWT_SECRET } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const db = await getDb();
    const users = db.collection('users');

    if (await users.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const user = {
      id: uuidv4(), name, email,
      username: email.split('@')[0],
      password: await bcrypt.hash(password, 10),
      role: 'user', phone: '', address: '',
      createdAt: new Date().toISOString()
    };
    await users.insertOne(user);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Login — accepts username OR email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // "email" field accepts username too
    if (!email || !password)
      return res.status(400).json({ error: 'Username/email and password required' });

    const db = await getDb();
    const users = db.collection('users');

    // Match by username field, email field, or name === "admin"
    const orConditions = [{ email }, { username: email }];
    if (email === 'admin') orConditions.push({ role: 'admin' });
    const user = await users.findOne({ $or: orConditions });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, username: user.username } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ error: 'Email and new password required' });

    const db = await getDb();
    const users = db.collection('users');
    const result = await users.updateOne(
      { $or: [{ email }, { username: email }] },
      { $set: { password: await bcrypt.hash(newPassword, 10) } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password reset successfully' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
